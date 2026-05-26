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

function centsToChfInput(cents: number) {
  if (!cents) return "";
  return String(cents / 100);
}

function chfInputToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-black text-slate-800">
      {label}
      {children}
      {hint ? <span className="text-xs font-semibold leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

const inputClass = "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-950";
const textareaClass = `${inputClass} min-h-28 font-normal leading-6`;
const selectClass = inputClass;

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
        setStatus("Validation - Le prix de vente doit etre au minimum de CHF 0.50.");
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
    <form onSubmit={submit} className="mt-6 grid gap-5">
      <FormSection
        eyebrow="01 - Identification"
        title="Ce que voit le client"
        description="Nom, marque et description courte. Le titre doit permettre de retrouver rapidement le vêtement dans l'admin."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.55fr)]">
          <Field label="Nom du vêtement">
            <input
              required
              minLength={3}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ex: T-shirt rayé manches courtes"
              className={inputClass}
            />
          </Field>
          <Field label="Marque">
            <input
              value={form.brand}
              onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
              placeholder="Ex: Zara"
              className={inputClass}
            />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Description" hint="Quelques détails visibles: coupe, matière, particularité, petit défaut s'il y en a un.">
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Ex: Très joli t-shirt léger, parfait pour l'été. Aucun trou, aucune tache."
                className={textareaClass}
              />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="02 - Prix"
        title="Prix de vente et prix supposé neuf"
        description="Saisis les montants en CHF. Le site convertit automatiquement en centimes pour Supabase."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Prix de vente (CHF)" hint="Prix affiché et payé par le client.">
            <input
              type="number"
              min={0.5}
              step={0.05}
              inputMode="decimal"
              value={centsToChfInput(form.price_cents)}
              onChange={(event) => setForm((prev) => ({ ...prev, price_cents: chfInputToCents(event.target.value) }))}
              placeholder="Ex: 8.00"
              className={inputClass}
            />
          </Field>
          <Field label="Prix supposé neuf (CHF)" hint="Optionnel. Il s'affiche comme prix barré sur la fiche produit.">
            <input
              type="number"
              min={0}
              step={0.05}
              inputMode="decimal"
              value={centsToChfInput(form.compare_at_price_cents)}
              onChange={(event) => setForm((prev) => ({ ...prev, compare_at_price_cents: chfInputToCents(event.target.value) }))}
              placeholder="Ex: 24.90"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        eyebrow="03 - Classement"
        title="Catalogue et filtres boutique"
        description="Ces champs alimentent les filtres côté client et la recherche interne."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Field label="Catégorie">
            <select value={form.categorie} onChange={(event) => setForm((prev) => ({ ...prev, categorie: event.target.value }))} className={selectClass}>
              {productCategoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Saison">
            <select value={form.saison} onChange={(event) => setForm((prev) => ({ ...prev, saison: event.target.value }))} className={selectClass}>
              {productSeasonOptions.map((season) => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Âge">
            <select value={form.age_range} onChange={(event) => setForm((prev) => ({ ...prev, age_range: event.target.value }))} className={selectClass}>
              {ageRangeOptions.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Taille">
            <input
              value={form.size_label}
              onChange={(event) => setForm((prev) => ({ ...prev, size_label: event.target.value }))}
              placeholder="Ex: 5 ans"
              className={inputClass}
            />
          </Field>
          <Field label="Genre">
            <select value={form.sex} onChange={(event) => setForm((prev) => ({ ...prev, sex: event.target.value }))} className={selectClass}>
              <option value="mixte">Mixte</option>
              <option value="femme">Fille</option>
              <option value="homme">Garçon</option>
              <option value="enfant">Enfant</option>
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        eyebrow="04 - État et stock"
        title="Qualité, détails et emplacement physique"
        description="Cette partie sert autant à la boutique qu'à la gestion du local."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="État du vêtement">
            <select value={form.condition} onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))} className={selectClass}>
              {productConditionOptions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Emplacement dans le local" hint="Ex: Étagère A / Bac 3 / Réf MG-00045">
            <input
              value={form.stock_location}
              onChange={(event) => setForm((prev) => ({ ...prev, stock_location: event.target.value }))}
              placeholder="Étagère A / Bac 3 / Réf MG-00045"
              className={inputClass}
            />
          </Field>
          <Field label="Couleur">
            <input
              value={form.couleur}
              onChange={(event) => setForm((prev) => ({ ...prev, couleur: event.target.value }))}
              placeholder="Ex: Bleu"
              className={inputClass}
            />
          </Field>
          <Field label="Matière">
            <input
              value={form.matiere}
              onChange={(event) => setForm((prev) => ({ ...prev, matiere: event.target.value }))}
              placeholder="Ex: Coton"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        eyebrow="05 - Photos"
        title="Recto, verso et détails"
        description="Ajoute jusqu'à 6 images. Les deux premières servent de repères recto/verso."
      >
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
          <input type="file" accept="image/*" multiple onChange={onImagesChange} className="w-full text-sm font-semibold" />
          <p className="mt-2 text-xs font-semibold text-slate-500">{images.length}/6 image(s) sélectionnée(s).</p>
        </div>
      </FormSection>

      <FormSection
        eyebrow="06 - Publication"
        title="Visibilité et mise en avant"
        description="Une fiche peut être créée pour le stock sans être publiée en boutique."
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <Field label="Statut de visibilité" hint="Seul le statut En ligne affiche la fiche sur le site.">
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className={selectClass}>
              {productStatusOptions.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800">
            <input
              type="checkbox"
              checked={form.mis_en_avant}
              onChange={(event) => setForm((prev) => ({ ...prev, mis_en_avant: event.target.checked }))}
            />
            Mettre en avant
          </label>
        </div>
      </FormSection>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(35,29,21,0.16)] backdrop-blur">
        <div>
          <p className="text-sm font-black text-slate-950">Prêt à enregistrer ?</p>
          <p className="text-xs font-semibold text-slate-500">La fiche sera créée avec le statut sélectionné.</p>
        </div>
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white disabled:opacity-60">
          {isSubmitting ? "Enregistrement..." : "Enregistrer le vêtement"}
        </button>
        {status ? <p className="w-full text-sm font-semibold text-slate-600">{status}</p> : null}
      </div>
    </form>
  );
}
