"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ageRangeOptions } from "@/lib/age-options";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminProductEditInput {
  id: string;
  nom: string;
  description: string | null;
  marque: string | null;
  etat: string;
  categorie: string;
  age: string | null;
  taille: string;
  genre: string;
  statut: string;
  prix_centimes: number;
  couleur: string | null;
  matiere: string | null;
  mis_en_avant: boolean;
  photos_vetements?: Array<{
    id: string;
    url: string;
    position: number;
    principale: boolean;
  }>;
}

interface ApiErrorPayload {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

function formatApiError(payload: ApiErrorPayload) {
  const base = payload.error ?? "Erreur";
  const fieldErrors = payload.details?.fieldErrors ?? {};
  const flatMessages = Object.entries(fieldErrors)
    .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
    .join(" | ");

  return flatMessages ? `${base} (${flatMessages})` : base;
}

export function EditProductForm({ product }: { product: AdminProductEditInput }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const currentImages = [...(product.photos_vetements ?? [])].sort((a, b) => {
    if (a.principale !== b.principale) return a.principale ? -1 : 1;
    return a.position - b.position;
  });
  const remainingImageSlots = Math.max(0, 3 - currentImages.length);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: product.nom,
    description: product.description ?? "",
    price_cents: product.prix_centimes,
    brand: product.marque ?? "",
    condition: product.etat,
    categorie: product.categorie,
    age_range: product.age ?? "3 mois",
    size_label: product.taille,
    sex: product.genre,
    couleur: product.couleur ?? "",
    matiere: product.matiere ?? "",
    status: product.statut,
    mis_en_avant: product.mis_en_avant,
  });

  const onImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, remainingImageSlots);
    setImages(nextFiles);
  };

  const imageSrc = (url: string) =>
    url.startsWith("http")
      ? url
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vetements/${url}`;

  const uploadImages = async () => {
    if (images.length === 0) return;
    setStatus(null);
    setIsUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      for (let index = 0; index < images.length; index += 1) {
        const file = images[index];
        const uploadUrlRes = await fetch("/api/admin/storage/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name.slice(0, 255),
            contentType: file.type || undefined,
          }),
        });
        const uploadPayload: ApiErrorPayload & { path?: string; token?: string } = await uploadUrlRes.json().catch(() => ({}));
        if (!uploadUrlRes.ok || !uploadPayload.path || !uploadPayload.token) {
          setStatus(formatApiError(uploadPayload));
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from("vetements")
          .uploadToSignedUrl(uploadPayload.path, uploadPayload.token, file);
        if (uploadError) {
          setStatus(uploadError.message);
          return;
        }

        const imageRes = await fetch(`/api/admin/products/${product.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: uploadPayload.path,
            sort_order: currentImages.length + index,
            principale: currentImages.length === 0 && index === 0,
          }),
        });
        const imagePayload: ApiErrorPayload = await imageRes.json().catch(() => ({}));
        if (!imageRes.ok) {
          setStatus(formatApiError(imagePayload));
          return;
        }
      }

      setImages([]);
      setStatus("Image(s) ajoutee(s).");
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
        }),
      });
      const payload: ApiErrorPayload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(formatApiError(payload));
        return;
      }

      setStatus("Vetement mis a jour.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="admin-card grid gap-3 p-4">
      <h2 className="text-sm font-semibold uppercase text-slate-500">Editer le vetement</h2>

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

      <div className="grid gap-2 md:grid-cols-2">
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
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <select
          value={form.categorie}
          onChange={(event) => setForm((prev) => ({ ...prev, categorie: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="haut">Haut</option>
          <option value="bas">Bas</option>
          <option value="robe">Robe</option>
          <option value="veste">Veste</option>
          <option value="manteau">Manteau</option>
          <option value="chaussures">Chaussures</option>
          <option value="accessoire">Accessoire</option>
          <option value="autre">Autre</option>
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

      <div className="grid gap-2 md:grid-cols-2">
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

      <div className="grid gap-2 md:grid-cols-2">
        <select
          value={form.condition}
          onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="neuf">Neuf</option>
          <option value="tres_bon">Tres bon</option>
          <option value="bon">Bon</option>
          <option value="correct">Correct</option>
        </select>
        <select
          value={form.status}
          onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="disponible">Disponible</option>
          <option value="brouillon">Brouillon</option>
          <option value="reserve">Reserve</option>
          <option value="vendu">Vendu</option>
          <option value="archive">Archive</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.mis_en_avant}
          onChange={(event) => setForm((prev) => ({ ...prev, mis_en_avant: event.target.checked }))}
        />
        Mettre en avant
      </label>

      <div className="rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Images</h3>
            <p className="text-xs text-slate-500">{currentImages.length}/3 image(s) enregistree(s)</p>
          </div>
          {remainingImageSlots > 0 ? (
            <p className="text-xs text-slate-500">{remainingImageSlots} emplacement(s) restant(s)</p>
          ) : null}
        </div>

        {currentImages.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {currentImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(image.url)} alt={product.nom} className="h-28 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">Aucune image pour ce vetement.</p>
        )}

        {remainingImageSlots > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input type="file" accept="image/*" multiple onChange={onImagesChange} className="text-sm" />
            <button
              type="button"
              disabled={isUploading || images.length === 0}
              onClick={uploadImages}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {isUploading ? "Upload..." : `Ajouter ${images.length || ""} image(s)`}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      </div>
    </form>
  );
}
