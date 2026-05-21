import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getProductCategoryLabel } from "@/lib/product-categories";
import { getProductById } from "@/lib/products";
import { getProductConditionLabel, getProductSeasonLabel } from "@/lib/product-options";
import { toChf } from "@/lib/utils";

export const revalidate = 120;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) notFound();

  const images = product.product_images ?? [];

  return (
    <div className="mg-container py-10 md:py-14 lg:py-16">
      <div className="grid items-start gap-6 md:gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
        <ProductImageCarousel images={images.slice(0, 6)} alt={product.title} />

        <section className="mg-shell space-y-5 bg-white p-5 md:p-6">
          <p className="mg-chip inline-flex bg-[var(--mg-sun)]/35">piece unique</p>
          <h1 className="font-display text-3xl leading-none md:text-4xl">{product.title}</h1>
          <p className="text-sm leading-6 text-[var(--mg-ink)]/75">{product.description || "Sans description."}</p>
          <ul className="grid gap-2 rounded-2xl bg-[linear-gradient(120deg,#fff,#fff7ec)] p-4 text-sm text-[var(--mg-ink)]/85">
            <li>
              <strong>Etat:</strong> {getProductConditionLabel(product.condition)}
            </li>
            <li>
              <strong>Categorie:</strong> {getProductCategoryLabel(product.category)}
            </li>
            <li>
              <strong>Taille:</strong> {product.size_label || "-"}
            </li>
            <li>
              <strong>Age:</strong> {product.age_range || "-"}
            </li>
            <li>
              <strong>Marque:</strong> {product.brand || "-"}
            </li>
            <li>
              <strong>Saison:</strong> {getProductSeasonLabel(product.season)}
            </li>
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
            <AddToCartButton productId={product.id} />
          </div>
        </section>
      </div>
    </div>
  );
}
