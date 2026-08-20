import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { ShopClosedPage } from "@/components/shop-closed-page";
import { getAuthenticatedUser } from "@/lib/auth";
import { isFavoriteProduct } from "@/lib/favorites";
import { getProductCategoryLabel, isMerchCategory } from "@/lib/product-categories";
import { getProductById } from "@/lib/products";
import { getProductConditionLabel, getProductSeasonLabel } from "@/lib/product-options";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { toChf } from "@/lib/utils";

export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return <ShopClosedPage message={settings.shop_closed_message} reopenDate={settings.shop_reopen_date} />;
  }

  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) notFound();

  const { user } = await getAuthenticatedUser();
  const isFavorite = user ? await isFavoriteProduct(user.id, product.id) : false;
  const images = product.product_images ?? [];
  const isMerch = isMerchCategory(product.category);

  return (
    <div className="mg-container py-10 md:py-14 lg:py-16">
      <div className="grid items-start gap-6 md:gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
        <ProductImageCarousel images={images.slice(0, 6)} alt={product.title} />

        <section className="mg-shell space-y-5 bg-white p-5 md:p-6">
          {!isMerch ? <p className="mg-chip inline-flex bg-[var(--mg-sun)]/35">Pièce unique</p> : null}
          <h1 className="font-display text-3xl leading-none md:text-4xl">{product.title}</h1>
          {product.description?.trim() ? (
            <p className="text-sm leading-6 text-[var(--mg-ink)]/75">{product.description}</p>
          ) : null}
          {isMerch ? <p className="text-sm font-black text-[var(--mg-accent-strong)]">Quantité restante : {product.stock_quantity ?? 0}</p> : null}
          <ul className="grid gap-2 rounded-2xl bg-[linear-gradient(120deg,#fff,#fff7ec)] p-4 text-sm text-[var(--mg-ink)]/85">
            <li>
              <strong>État:</strong> {getProductConditionLabel(product.condition)}
            </li>
            {!isMerch ? <li><strong>Catégorie:</strong> {getProductCategoryLabel(product.category)}</li> : null}
            <li>
              <strong>Taille:</strong> {product.size_label || "-"}
            </li>
            {!isMerch ? <li><strong>Âge:</strong> {product.age_range || "-"}</li> : null}
            <li>
              <strong>Marque:</strong> <span className="font-black">{product.brand || "-"}</span>
            </li>
            {!isMerch ? <li><strong>Saison:</strong> {getProductSeasonLabel(product.season)}</li> : null}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--mg-ring)] pt-5">
            <div className="grid gap-1">
              <strong className="text-2xl text-[var(--mg-accent-strong)] md:text-3xl">{toChf(product.price_cents)}</strong>
              {product.compare_at_price_cents ? (
                <span className="text-sm font-semibold text-[var(--mg-ink)]/45 line-through">
                  Neuf {toChf(product.compare_at_price_cents)}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FavoriteButton productId={product.id} initialIsFavorite={isFavorite} variant="detail" />
              <AddToCartButton productId={product.id} isMerch={isMerch} stockQuantity={product.stock_quantity ?? 1} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
