"use client";

import { useState } from "react";
import { productCategoryOptions } from "@/lib/product-categories";

type SellItem = {
  category: string;
  brand: string;
  size_label: string;
  age_range: string;
  condition: "new" | "like_new" | "very_good" | "good" | "fair";
  notes: string;
};

const conditionOptions: Array<{ value: SellItem["condition"]; label: string }> = [
  { value: "fair", label: "Beaucoup aimé, beaucoup porté" },
  { value: "good", label: "Bon état" },
  { value: "very_good", label: "Très bon état" },
  { value: "like_new", label: "Comme neuf" },
  { value: "new", label: "Neuf avec étiquettes" },
];

function createEmptyItem(): SellItem {
  return {
    category: "",
    brand: "",
    size_label: "",
    age_range: "",
    condition: "good",
    notes: "",
  };
}

const initialItems = Array.from({ length: 10 }, createEmptyItem);

export function SellOrderWizard({ defaultEmail }: { defaultEmail?: string }) {
  const [sender, setSender] = useState({
    name: "",
    email: defaultEmail ?? "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "CH",
  });
  const [items, setItems] = useState<SellItem[]>(initialItems);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateItem = (index: number, patch: Partial<SellItem>) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    setItems((current) => (current.length >= 50 ? current : [...current, createEmptyItem()]));
  };

  const removeItem = (index: number) => {
    setItems((current) => (current.length <= 10 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sell-orders/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_provider: "internal",
          sender,
          items,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Impossible de créer le bordereau.");
        return;
      }

      const orderNumber = response.headers.get("X-Mini-Gang-Order-Number") ?? "bordereau-mini-gang";
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus(`Bordereau ${orderNumber} généré. Le code du PDF récapitule tous les vêtements du colis.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[var(--mg-surface)] px-5 py-6 text-[var(--mg-ink)] md:px-8 md:py-8">
      <div className="max-w-4xl">
        <p className="text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">Bordereau vendeur</p>
        <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">Préparer mon colis Mini Gang</h1>
        <p className="mt-4 text-base font-semibold leading-7 text-[var(--mg-ink)]/72 md:text-lg">
          Ajoutez entre 10 et 50 vêtements. Le PDF généré sert de certificat d&apos;envoi et contient un code à scanner avec le récapitulatif du colis.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-8">
        <div className="grid gap-5 border-b-2 border-[var(--mg-ring)] pb-7 md:grid-cols-2">
          <label>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65">Nom complet</span>
            <input
              value={sender.name}
              onChange={(event) => setSender((current) => ({ ...current, name: event.target.value }))}
              required
              className="mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold outline-none focus:border-[var(--mg-ink)]"
            />
          </label>
          <label>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65">Email</span>
            <input
              value={sender.email}
              onChange={(event) => setSender((current) => ({ ...current, email: event.target.value }))}
              type="email"
              required
              className="mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold outline-none focus:border-[var(--mg-ink)]"
            />
          </label>
          <label>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65">Adresse</span>
            <input
              value={sender.line1}
              onChange={(event) => setSender((current) => ({ ...current, line1: event.target.value }))}
              required
              className="mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold outline-none focus:border-[var(--mg-ink)]"
            />
          </label>
          <label>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65">Complément</span>
            <input
              value={sender.line2}
              onChange={(event) => setSender((current) => ({ ...current, line2: event.target.value }))}
              className="mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold outline-none focus:border-[var(--mg-ink)]"
            />
          </label>
          <label>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65">NPA</span>
            <input
              value={sender.postalCode}
              onChange={(event) => setSender((current) => ({ ...current, postalCode: event.target.value }))}
              required
              className="mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold outline-none focus:border-[var(--mg-ink)]"
            />
          </label>
          <label>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65">Ville</span>
            <input
              value={sender.city}
              onChange={(event) => setSender((current) => ({ ...current, city: event.target.value }))}
              required
              className="mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold outline-none focus:border-[var(--mg-ink)]"
            />
          </label>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Vêtements du colis</h2>
              <p className="mt-1 text-base font-semibold text-[var(--mg-ink)]/68">{items.length} vêtement{items.length > 1 ? "s" : ""} renseigné{items.length > 1 ? "s" : ""}</p>
            </div>
            <button type="button" onClick={addItem} disabled={items.length >= 50} className="rounded-full bg-[var(--mg-pop-sun)] px-5 py-2 text-sm font-black text-[var(--mg-ink)] disabled:opacity-50">
              Ajouter un vêtement
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {items.map((item, index) => (
              <article key={index} className="grid gap-3 border-b-2 border-[var(--mg-ring)] pb-4 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                <p className="text-xl font-black text-[var(--mg-pop-rose)]">#{index + 1}</p>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/62">Catégorie</span>
                  <select
                    value={item.category}
                    onChange={(event) => updateItem(index, { category: event.target.value })}
                    required
                    className="mt-1 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-2 text-base font-semibold outline-none focus:border-[var(--mg-ink)]"
                  >
                    <option value="">Choisir</option>
                    {productCategoryOptions.map((category) => (
                      <option key={category.value} value={category.label}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/62">Marque</span>
                  <input
                    value={item.brand}
                    onChange={(event) => updateItem(index, { brand: event.target.value })}
                    className="mt-1 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-2 text-base font-semibold outline-none focus:border-[var(--mg-ink)]"
                  />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/62">Taille</span>
                  <input
                    value={item.size_label}
                    onChange={(event) => updateItem(index, { size_label: event.target.value })}
                    placeholder="ex: 5 ans"
                    className="mt-1 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-2 text-base font-semibold outline-none focus:border-[var(--mg-ink)]"
                  />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/62">État</span>
                  <select
                    value={item.condition}
                    onChange={(event) => updateItem(index, { condition: event.target.value as SellItem["condition"] })}
                    className="mt-1 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-2 text-base font-semibold outline-none focus:border-[var(--mg-ink)]"
                  >
                    {conditionOptions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => removeItem(index)} disabled={items.length <= 10} className="text-sm font-black text-[var(--mg-accent-strong)] underline disabled:opacity-35">
                  Retirer
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-[var(--mg-ink)] px-6 py-3 text-base font-black text-white disabled:opacity-60">
            {isSubmitting ? "Création..." : "Créer le bordereau PDF"}
          </button>
          {status ? <p className="max-w-xl text-base font-semibold text-[var(--mg-accent-strong)]">{status}</p> : null}
          {error ? <p className="max-w-xl text-base font-semibold text-red-600">{error}</p> : null}
        </div>
      </form>
    </section>
  );
}
