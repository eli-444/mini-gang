"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SiteContentSettings } from "@/lib/site-content-settings";

interface ApiErrorPayload {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

function formatApiError(payload: ApiErrorPayload) {
  const fieldErrors = payload.details?.fieldErrors ?? {};
  const flatMessages = Object.entries(fieldErrors)
    .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
    .join(" | ");

  return flatMessages ? `${payload.error ?? "Erreur"} (${flatMessages})` : payload.error ?? "Erreur inconnue";
}

function toPublicUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
}

export function SiteContentSettingsForm({ initialSettings }: { initialSettings: SiteContentSettings }) {
  const [form, setForm] = useState(initialSettings);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const previewImage = useMemo(() => toPublicUrl(form.home_event_image_path), [form.home_event_image_path]);

  const saveSettings = async (nextForm: SiteContentSettings, successMessage = "Contenu enregistre.") => {
    const response = await fetch("/api/admin/settings/site-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextForm),
    });
    const payload: ApiErrorPayload & { settings?: SiteContentSettings } = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(formatApiError(payload));
    }

    if (payload.settings) setForm(payload.settings);
    setStatus(successMessage);
  };

  const uploadImage = async (file: File) => {
    const response = await fetch("/api/admin/storage/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket: "site-content",
        folder: "events",
        fileName: file.name.slice(0, 255),
        contentType: file.type || undefined,
      }),
    });

    const payload: ApiErrorPayload & { bucket?: string; path?: string; token?: string } = await response.json().catch(() => ({}));
    if (!response.ok || !payload.bucket || !payload.path || !payload.token) {
      throw new Error(formatApiError(payload));
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.storage.from(payload.bucket).uploadToSignedUrl(payload.path, payload.token, file);
    if (error) throw new Error(error.message);

    return payload.path;
  };

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(null);
    setIsUploading(true);
    try {
      const path = await uploadImage(file);
      setForm((prev) => ({ ...prev, home_event_image_path: path }));
      setStatus("Image de l'event chargee.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur upload image.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      await saveSettings(form, "Contenu du site enregistre.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShop = async () => {
    setStatus(null);
    setIsSubmitting(true);
    const nextForm = { ...form, shop_enabled: !form.shop_enabled };
    setForm(nextForm);

    try {
      await saveSettings(
        nextForm,
        nextForm.shop_enabled ? "Boutique rouverte." : "Boutique fermee. La page de pause est active.",
      );
    } catch (error) {
      setForm(form);
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase text-slate-500">Boutique</h3>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {form.shop_enabled ? "Boutique ouverte" : "Boutique fermee"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Un clic suffit pour remplacer la boutique par une page friendly de pause.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleShop}
            disabled={isSubmitting || isUploading}
            className={`rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              form.shop_enabled ? "bg-slate-900" : "bg-emerald-700"
            }`}
          >
            {form.shop_enabled ? "Fermer la boutique" : "Rouvrir la boutique"}
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Message de fermeture
            <textarea
              value={form.shop_closed_message}
              onChange={(event) => setForm((prev) => ({ ...prev, shop_closed_message: event.target.value }))}
              className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Date de retour
            <input
              type="date"
              value={form.shop_reopen_date}
              onChange={(event) => setForm((prev) => ({ ...prev, shop_reopen_date: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={form.home_event_enabled}
          onChange={(event) => setForm((prev) => ({ ...prev, home_event_enabled: event.target.checked }))}
        />
        Afficher l&apos;event sur la page d&apos;accueil
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Titre de l&apos;event
          <input
            value={form.home_event_title}
            onChange={(event) => setForm((prev) => ({ ...prev, home_event_title: event.target.value }))}
            placeholder="Pop-up Mini Gang, marche, depot special..."
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          CTA URL
          <input
            value={form.home_event_cta_url}
            onChange={(event) => setForm((prev) => ({ ...prev, home_event_cta_url: event.target.value }))}
            placeholder="https://... ou /contact"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Texte de l&apos;event
          <textarea
            value={form.home_event_text}
            onChange={(event) => setForm((prev) => ({ ...prev, home_event_text: event.target.value }))}
            placeholder="Quelques lignes pour annoncer l'evenement sur la homepage."
            className="min-h-32 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <div className="grid gap-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Libelle du CTA
            <input
              value={form.home_event_cta_label}
              onChange={(event) => setForm((prev) => ({ ...prev, home_event_cta_label: event.target.value }))}
              placeholder="Voir l&apos;event"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Image
            <input type="file" accept="image/*" onChange={onImageChange} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" />
          </label>
          {previewImage ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage} alt="Apercu event" className="h-36 w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">Aucune image d&apos;event chargee.</div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold uppercase text-slate-500">Rachat / depot</h3>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.sell_service_enabled}
            onChange={(event) => setForm((prev) => ({ ...prev, sell_service_enabled: event.target.checked }))}
          />
          Service de rachat ouvert
        </label>
        <label className="mt-3 grid gap-1 text-sm font-semibold text-slate-700">
          Message quand le rachat est ferme
          <textarea
            value={form.sell_closed_message}
            onChange={(event) => setForm((prev) => ({ ...prev, sell_closed_message: event.target.value }))}
            className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Conditions de reprise
            <textarea
              value={form.sell_conditions_text}
              onChange={(event) => setForm((prev) => ({ ...prev, sell_conditions_text: event.target.value }))}
              placeholder="Minimum 10 vetements, maximum 50, etats acceptes..."
              className="min-h-32 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Marques refusees
            <textarea
              value={form.sell_refused_brands_text}
              onChange={(event) => setForm((prev) => ({ ...prev, sell_refused_brands_text: event.target.value }))}
              placeholder="Liste a integrer plus tard"
              className="min-h-32 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Explications clients
            <textarea
              value={form.sell_explanation_text}
              onChange={(event) => setForm((prev) => ({ ...prev, sell_explanation_text: event.target.value }))}
              placeholder="Comment preparer le colis, criteres, delais..."
              className="min-h-32 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold uppercase text-slate-500">Commandes</h3>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.orders_enabled}
            onChange={(event) => setForm((prev) => ({ ...prev, orders_enabled: event.target.checked }))}
          />
          Commandes ouvertes
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Message quand les commandes sont fermees
            <textarea
              value={form.orders_closed_message}
              onChange={(event) => setForm((prev) => ({ ...prev, orders_closed_message: event.target.value }))}
              className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Date de reouverture
            <input
              type="date"
              value={form.orders_reopen_date}
              onChange={(event) => setForm((prev) => ({ ...prev, orders_reopen_date: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : isUploading ? "Upload..." : "Enregistrer le contenu"}
        </button>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      </div>
    </form>
  );
}
