import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ShopClosedPage } from "@/components/shop-closed-page";
import { getAuthenticatedUser } from "@/lib/auth";
import { listFavoriteProductIds } from "@/lib/favorites";
import { listProducts } from "@/lib/products";
import { getSiteContentSettings } from "@/lib/site-content-settings";

export const revalidate = 0;

export default async function MerchPage() {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return <ShopClosedPage message={settings.shop_closed_message} reopenDate={settings.shop_reopen_date} />;
  }

  const { products, total } = await listProducts({ limit: 24, sort: "newest", shop_section: "merch" });
  const { user } = await getAuthenticatedUser();
  const favoriteIds = user ? await listFavoriteProductIds(user.id, products.map((product) => product.id)) : [];
  const favoriteSet = new Set(favoriteIds);

  return (
    <div className="bg-[var(--mg-bg)] pb-20 pt-9 text-[var(--mg-on-dark)] md:pb-28 md:pt-14">
      <section className="mg-container">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mg-hand-title text-3xl text-[var(--mg-pop-rose)] md:text-4xl">MINI GANG</p>
            <h1 className="text-[2.7rem] font-black leading-none md:text-7xl">Merch</h1>
          </div>
          <p className="pb-2 text-base font-black md:pb-3 md:text-xl">{total} articles</p>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isFavorite={favoriteSet.has(product.id)} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl border-l-4 border-[var(--mg-pop-rose)] py-2 pl-4">
            <p className="text-lg font-black text-[var(--mg-on-dark)] md:text-2xl">Aucun article merch en ligne.</p>
            <Link href="/boutique" className="mt-4 inline-flex text-base font-black text-[var(--mg-pop-sun)] underline underline-offset-4">
              Voir la boutique
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
