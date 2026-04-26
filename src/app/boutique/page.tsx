import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductFiltersForm } from "@/components/product-filters-form";
import { listProducts } from "@/lib/products";
import { productFiltersSchema } from "@/lib/validation";

export const revalidate = 60;

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = productFiltersSchema.safeParse(flat);
  const filters = parsed.success ? parsed.data : { sort: "newest" as const, limit: 24 };
  const { products, nextCursor, hasMore, total } = await listProducts(filters);
  const shopSection = parsed.success ? parsed.data.shop_section : undefined;
  const pageTitle = shopSection === "merche" ? "Merche" : shopSection === "vetements" ? "Vetements" : "Boutique";
  const pageEyebrow = shopSection === "merche" ? "Selection" : "Catalogue";

  const createFilterUrl = (updates: Record<string, string>) => {
    const url = new URLSearchParams(flat as Record<string, string>);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) url.delete(key);
      else url.set(key, value);
    });
    return `/boutique?${url.toString()}`;
  };

  return (
    <div className="space-y-6">
      <header className="mg-shell overflow-hidden bg-[linear-gradient(130deg,#fff,#fff4e7)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">{pageEyebrow}</p>
            <h1 className="font-display text-4xl leading-none">{pageTitle}</h1>
          </div>
          <p className="rounded-full border border-[var(--mg-ring)] bg-white px-3 py-1.5 text-sm font-semibold">{total} articles</p>
        </div>
        <ProductFiltersForm values={flat as Record<string, string | undefined>} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && nextCursor ? (
        <Link href={createFilterUrl({ cursor: nextCursor })} className="inline-flex rounded-full border border-[var(--mg-ring)] bg-white px-5 py-2 text-sm font-semibold">
          Charger plus
        </Link>
      ) : null}
    </div>
  );
}
