import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductFiltersForm } from "@/components/product-filters-form";
import { ShopClosedPage } from "@/components/shop-closed-page";
import { getAuthenticatedUser } from "@/lib/auth";
import { listFavoriteProductIds } from "@/lib/favorites";
import { listProducts } from "@/lib/products";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { productFiltersSchema } from "@/lib/validation";

export const revalidate = 0;

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return <ShopClosedPage message={settings.shop_closed_message} reopenDate={settings.shop_reopen_date} />;
  }

  const params = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = productFiltersSchema.safeParse(flat);
  const filters = parsed.success ? parsed.data : { sort: "newest" as const, limit: 24 };
  const { products, nextCursor, hasMore, total } = await listProducts(filters);
  const { user } = await getAuthenticatedUser();
  const favoriteIds = user ? await listFavoriteProductIds(user.id, products.map((product) => product.id)) : [];
  const favoriteSet = new Set(favoriteIds);

  const createFilterUrl = (updates: Record<string, string>) => {
    const url = new URLSearchParams(flat as Record<string, string>);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) url.delete(key);
      else url.set(key, value);
    });
    return `/boutique?${url.toString()}`;
  };

  return (
    <div className="bg-[var(--mg-bg)] pb-20 pt-9 text-[var(--mg-on-dark)] md:pb-28 md:pt-14">
      <div className="mg-container grid gap-9 lg:grid-cols-[305px_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:pt-32">
          <ProductFiltersForm values={flat as Record<string, string | undefined>} />
        </aside>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mg-hand-title text-3xl text-[var(--mg-pop-rose)] md:text-4xl">CATALOGUE</p>
              <h1 className="text-[2.7rem] font-black leading-none text-[var(--mg-on-dark)] md:text-7xl">Boutique</h1>
            </div>
            <p className="pb-2 text-base font-black md:pb-3 md:text-xl">{total} articles</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3 xl:gap-9">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isFavorite={favoriteSet.has(product.id)} />
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-2xl text-base font-black text-[var(--mg-on-dark-muted)] md:mt-10 md:text-2xl">
              Aucun article en ligne pour le moment. Les fiches publiees depuis le dashboard apparaitront ici.
            </p>
          )}

          {hasMore && nextCursor ? (
            <Link href={createFilterUrl({ cursor: nextCursor })} className="mg-button mg-button-yellow mt-10 text-base md:text-lg">
              Charger plus
            </Link>
          ) : null}
        </section>
      </div>
    </div>
  );
}
