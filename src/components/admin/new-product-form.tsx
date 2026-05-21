"use client";

import { useState } from "react";
import { ageRangeOptions } from "@/lib/age-options";
import { productCategoryOptions } from "@/lib/product-categories";
import { productConditionOptions, productSeasonOptions, productStatusOptions } from "@/lib/product-options";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ApiErrorPayload {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

function formatApiError(context: string, payload: ApiErrorPayload) {
  const base = payload.error ?? "Erreur";
  const fieldErrors = payload.details?.fieldErrors ?? {};
  const flatMessages = Object.entries(fieldErrors)
    .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
    .join(" | ");

  return flatMessages ? `${context} - ${base} (${flatMessages})` : `${context} - ${base}`;
}

export function NewProductForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_cents: 1000,
    compare_at_price_cents: 0,
    brand: "",
    condition: "bon",
    categorie: "tee_shirts",
    saison: "toutes_saisons",
    age_range: "3 mois",
    size_label: "",
    sex: "mixte",
    couleur: "",
    matiere: "",
    stock_location: "",
    status: "brouillon",
    mis_en_avant: false,
  });

  const onImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 6);
    setImages(nextFiles);
  };

  const uploadImages = async (productId: string, files: File[]) => {
    if (files.length === 0) return 0;
    const supabase = createSupabaseBrowserClient();

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const uploadUrlRes = await fetch("/api/admin/storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name.slice(0, 255),
          contentType: file.type || undefined,
        }),
      });

      const uploadUrlPayload: ApiErrorPayload & { path?: string; token?: string } = await uploadUrlRes.json().catch(() => ({}));
      if (!uploadUrlRes.ok || !uploadUrlPayload.path || !uploadUrlPayload.token) {
        throw new Error(formatApiError(`Image ${index + 1}: generation URL`, uploadUrlPayload));
      }

      const { error: uploadError } = await supabase.storage
        .from("vetements")
        .uploadToSignedUrl(uploadUrlPayload.path, uploadUrlPayload.token, file);

      if (uploadError) {
        throw new Error(`Upload image echoue (${file.name}): ${uploadError.message}`);
      }

      const imageRes = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: uploadUrlPayload.path,
          sort_order: index,
          principale: index === 0,
        }),
      });
      const imagePayload: ApiErrorPayload = await imageRes.json().catch(() => ({}));
      if (!imageRes.ok) {
        throw new Error(formatApiError(`Image ${index + 1}: liaison vetement`, imagePayload));
      }
    }

    return files.length;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const cleanTitle = form.title.trim();
      if (cleanTitle.length < 3) {
        setStatus("Validation - Le nom doit contenir au moins 3 caracteres.");
        return;
      }
      if (!Number.isInteger(form.price_cents) || form.price_cents < 50) {
        setStatus("Validation - Le prix doit etre un entier >= 50 centimes.");
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: cleanTitle,
        }),
      });
      const payload: ApiErrorPayload & { id?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(formatApiError("Creation vetement", payload));
        return;
      }

      const productId = payload.id;
      if (!productId) {
        setStatus("Creation vetement - Reponse invalide (id manquant).");
        return;
      }

      try {
        const uploadedCount = await uploadImages(productId, images);
        setStatus(
          form.status === "disponible"
            ? `Vetement cree et visible en boutique: ${productId}${uploadedCount > 0 ? ` (${uploadedCount} image(s))` : ""}`
            : `Vetement cree en ${form.status}. Il ne sera visible en boutique qu'avec le statut En ligne.${uploadedCount > 0 ? ` (${uploadedCount} image(s))` : ""}`,
        );
      } catch (uploadError) {
        const uploadMessage = uploadError instanceof Error ? uploadError.message : "Erreur upload images.";
        setStatus(`Vetement cree: ${productId}. ${uploadMessage}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <input
        required
        minLength={3}
        value={form.title}
        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        placeholder="Nom du vetement"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      <textarea
        value={form.description}
        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        placeholder="Description"
        className="min-h-28 rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.brand}
          onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
          placeholder="Marque"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={50}
          step={1}
          value={form.price_cents}
          onChange={(event) => setForm((prev) => ({ ...prev, price_cents: Number(event.target.value) }))}
          placeholder="Prix en centimes"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          step={1}
          value={form.compare_at_price_cents}
          onChange={(event) => setForm((prev) => ({ ...prev, compare_at_price_cents: Number(event.target.value) }))}
          placeholder="Prix neuf barre (centimes)"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <select
          value={form.categorie}
          onChange={(event) => setForm((prev) => ({ ...prev, categorie: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {productCategoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <select
          value={form.saison}
          onChange={(event) => setForm((prev) => ({ ...prev, saison: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {productSeasonOptions.map((season) => (
            <option key={season.value} value={season.value}>
              {season.label}
            </option>
          ))}
        </select>
        <select
          value={form.age_range}
          onChange={(event) => setForm((prev) => ({ ...prev, age_range: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {ageRangeOptions.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
        <input
          value={form.size_label}
          onChange={(event) => setForm((prev) => ({ ...prev, size_label: event.target.value }))}
          placeholder="Taille"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={form.sex}
          onChange={(event) => setForm((prev) => ({ ...prev, sex: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="mixte">Mixte</option>
          <option value="femme">Femme</option>
          <option value="homme">Homme</option>
          <option value="enfant">Enfant</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.couleur}
          onChange={(event) => setForm((prev) => ({ ...prev, couleur: event.target.value }))}
          placeholder="Couleur"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={form.matiere}
          onChange={(event) => setForm((prev) => ({ ...prev, matiere: event.target.value }))}
          placeholder="Matiere"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <select
        value={form.condition}
        onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        {productConditionOptions.map((condition) => (
          <option key={condition.value} value={condition.value}>
            {condition.label}
          </option>
        ))}
      </select>
      <input
        value={form.stock_location}
        onChange={(event) => setForm((prev) => ({ ...prev, stock_location: event.target.value }))}
        placeholder="Emplacement: Etagere A / Bac 3 / Ref MG-00045"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      <select
        value={form.status}
        onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        {productStatusOptions.map((statusOption) => (
          <option key={statusOption.value} value={statusOption.value}>
            {statusOption.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500">
        Visibilite boutique: seul le statut <strong>En ligne</strong> affiche la fiche sur le site. Les brouillons restent
        uniquement dans l&apos;admin.
      </p>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.mis_en_avant}
          onChange={(event) => setForm((prev) => ({ ...prev, mis_en_avant: event.target.checked }))}
        />
        Mettre en avant
      </label>

      <div className="rounded-xl border border-slate-200 p-3">
        <label className="mb-2 block text-sm font-semibold text-slate-900">Images vetement (recto, verso, details)</label>
        <input type="file" accept="image/*" multiple onChange={onImagesChange} className="w-full text-sm" />
        <p className="mt-2 text-xs text-slate-500">{images.length}/6 image(s) selectionnee(s). Les deux premieres servent de recto/verso.</p>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-fit rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </button>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </form>
  );
}
