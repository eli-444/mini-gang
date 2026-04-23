"use client";

import { useRouter } from "next/navigation";
import { ageRangeOptions } from "@/lib/age-options";
import { sizeOptions } from "@/lib/size-options";

interface ProductFiltersFormProps {
  values: Record<string, string | undefined>;
}

export function ProductFiltersForm({ values }: ProductFiltersFormProps) {
  const router = useRouter();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const stringValue = String(value).trim();
      if (stringValue) params.set(key, stringValue);
    }

    const query = params.toString();
    router.push(query ? `/boutique?${query}` : "/boutique");
  };

  return (
    <form onSubmit={submit} className="mt-5 grid gap-2 md:grid-cols-7">
      <input
        name="q"
        defaultValue={values.q}
        placeholder="Recherche (titre)"
        className="rounded-xl border border-[var(--mg-ring)] bg-white px-3 py-2 text-sm"
      />
      <input
        name="brand"
        defaultValue={values.brand}
        placeholder="Marque"
        className="rounded-xl border border-[var(--mg-ring)] bg-white px-3 py-2 text-sm"
      />
      <select
        name="categorie"
        defaultValue={values.categorie}
        className="rounded-xl border border-[var(--mg-ring)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Categorie</option>
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
        name="age_range"
        defaultValue={values.age_range}
        className="rounded-xl border border-[var(--mg-ring)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Age</option>
        {ageRangeOptions.map((age) => (
          <option key={age} value={age}>
            {age}
          </option>
        ))}
      </select>
      <select
        name="size_label"
        defaultValue={values.size_label}
        className="rounded-xl border border-[var(--mg-ring)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Taille</option>
        {sizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <select
        name="genre"
        defaultValue={values.genre}
        className="rounded-xl border border-[var(--mg-ring)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Genre</option>
        <option value="mixte">Mixte</option>
        <option value="femme">Femme</option>
        <option value="homme">Homme</option>
        <option value="enfant">Enfant</option>
      </select>
      <button type="submit" className="rounded-xl bg-[var(--mg-ink)] px-3 py-2 text-sm font-bold text-white">
        Filtrer
      </button>
    </form>
  );
}
