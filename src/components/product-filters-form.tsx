"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ageRangeOptions } from "@/lib/age-options";
import { productCategoryOptions } from "@/lib/product-categories";
import { productSeasonOptions } from "@/lib/product-options";

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
      if (stringValue && !params.has(key)) params.set(key, stringValue);
    }

    const query = params.toString();
    router.push(query ? `/boutique?${query}` : "/boutique");
  };

  return (
    <form onSubmit={submit} className="grid gap-4 text-[var(--mg-on-dark)] md:gap-5">
      {values.shop_section ? <input type="hidden" name="shop_section" value={values.shop_section} /> : null}

      <label className="relative block">
        <span className="sr-only">Rechercher</span>
        <input
          name="q"
          defaultValue={values.q}
          placeholder="Rechercher des articles"
          className="h-11 w-full rounded-full border-0 bg-[var(--mg-pop-sun)] px-5 pr-12 text-base font-black text-white placeholder:text-white/85 outline-none md:h-14 md:px-7 md:pr-14 md:text-lg"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white" aria-label="Rechercher">
          <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-8 md:w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.2 4.2" />
          </svg>
        </button>
      </label>

      <div className="border-y border-white/45 py-3 md:py-4">
        <div className="mb-3 flex items-center justify-between text-base font-black md:text-xl">
          <span>Catégorie</span>
        </div>
        <div className="grid max-h-[17.5rem] gap-1.5 overflow-auto pr-1">
          {productCategoryOptions.map((category) => (
            <label key={category.value} className="flex items-center gap-2 text-[0.95rem] font-black leading-none md:text-lg">
              <input
                type="checkbox"
                name="categorie"
                value={category.value}
                defaultChecked={values.categorie === category.value}
                className="h-4 w-4 rounded border-2 border-white bg-transparent accent-[var(--mg-pop-rose)]"
              />
              {category.label}
            </label>
          ))}
        </div>
      </div>

      <FilterSelect name="age_range" label="Âge" value={values.age_range} options={ageRangeOptions.map((age) => ({ value: age, label: age }))} />
      <FilterSelect name="genre" label="Genre" value={values.genre} options={[{ value: "femme", label: "Fille" }, { value: "homme", label: "Garçon" }]} />
      <FilterSelect name="saison" label="Saison" value={values.saison} options={productSeasonOptions.map((season) => ({ value: season.value, label: season.label }))} />

      <div className="flex flex-wrap items-center gap-6 pt-1">
        <button type="submit" className="rounded-full bg-[var(--mg-pop-rose)] px-5 py-2 text-sm font-black text-white md:text-base">
          Filtrer
        </button>
        <Link href="/boutique" className="text-sm font-black underline md:text-base">
          Supprimer les filtres
        </Link>
      </div>
    </form>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid border-b border-white/45 pb-2 text-base font-black md:text-xl">
      <span>{label}</span>
      <span className="relative mt-2 block">
        <select name={name} defaultValue={value ?? ""} className="w-full appearance-none rounded-lg border border-white/35 bg-white/8 px-3 py-2 pr-9 text-sm font-black outline-none md:text-base">
          <option value="" className="text-[var(--mg-ink)]">
            Tous
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-[var(--mg-ink)]">
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}
