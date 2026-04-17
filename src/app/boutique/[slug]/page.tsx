import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getProductById } from "@/lib/products";
import { toChf } from "@/lib/utils";

export const revalidate = 120;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) notFound();

  const images = product.product_images ?? [];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.82fr),minmax(0,1fr)]">
      <ProductImageCarousel images={images.slice(0, 3)} alt={product.title} />

      <section className="mg-shell space-y-5 bg-white p-6">
        <p className="mg-chip inline-flex bg-[var(--mg-sun)]/35">piece unique</p>
        <h1 className="font-display text-4xl leading-none">{product.title}</h1>
        <p className="text-sm text-[var(--mg-ink)]/75">{product.description || "Sans description."}</p>
        <ul className="grid gap-2 rounded-2xl bg-[linear-gradient(120deg,#fff,#fff7ec)] p-4 text-sm text-[var(--mg-ink)]/85">
          <li>
            <strong>Etat:</strong> {product.condition}
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
        </ul>
        <div className="flex items-center justify-between border-t border-[var(--mg-ring)] pt-5">
          <strong className="text-3xl text-[var(--mg-accent-strong)]">{toChf(product.price_cents)}</strong>
          <AddToCartButton productId={product.id} />
        </div>
      </section>
    </div>
  );
}
