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
      const response = await fetch("/api/admin/settings/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload: ApiErrorPayload & { settings?: SiteContentSettings } = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(formatApiError(payload));
        return;
      }

      if (payload.settings) setForm(payload.settings);
      setStatus("Contenu homepage enregistre.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4">
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

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),260px]">
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
