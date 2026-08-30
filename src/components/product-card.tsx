import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { QuickAddToCartButton } from "@/components/quick-add-to-cart-button";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
  isFavorite?: boolean;
  variant?: "shop" | "merch";
}

function formatCardPrice(cents: number) {
  const amount = cents / 100;
  return Number.isInteger(amount) ? `${amount}.-` : amount.toLocaleString("fr-CH", { minimumFractionDigits: 2 });
}

export function ProductCard({ product, isFavorite = false, variant = "shop" }: Props) {
  const image = product.product_images?.[0]?.url ?? product.product_images?.[0]?.path;
  const imageSrc = image?.startsWith("http")
    ? image
    : image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vetements/${image}`
    : "";

  const age = product.age_range || product.size_label || "";

  return (
    <article className="group relative overflow-hidden rounded-[1.2rem] bg-white text-[var(--mg-ink)] transition-transform hover:-translate-y-1 md:rounded-[1.65rem]">
      <Link href={`/boutique/${product.id}`} className="block">
        <div className="relative aspect-[1/1.02] bg-white">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          ) : null}
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton productId={product.id} initialIsFavorite={isFavorite} />
      </div>
      <div className={`relative bg-[var(--mg-rose-soft)] px-4 py-2.5 text-[0.82rem] font-medium leading-[1.15] md:px-5 md:py-3 md:text-[0.96rem] ${variant === "merch" ? "min-h-[6rem] md:min-h-[6.6rem]" : "min-h-[4.35rem] md:min-h-[5.05rem]"}`}>
        <Link href={`/boutique/${product.id}`} className="line-clamp-2 max-w-[82%]">
          {product.brand ? <span className="font-black">{product.brand} </span> : null}
          {product.title}
        </Link>
        <p className="max-w-[82%] line-clamp-1">
          {variant === "merch" ? product.description || "Article Mini Gang" : product.size_label || product.age_range || "Pièce unique"}
        </p>
        {variant === "merch" ? <p className="max-w-[82%] font-semibold">Quantité restante : {product.stock_quantity ?? 0}</p> : null}
        <p className="font-black">{formatCardPrice(product.price_cents)}</p>
        <QuickAddToCartButton productId={product.id} productTitle={product.title} />
        {variant === "shop" && age ? (
          <span className="absolute bottom-2.5 right-3 rounded-full bg-[#f3edc9] px-2 py-0.5 text-xs font-black md:bottom-3 md:right-4 md:px-2.5 md:py-1 md:text-sm">
            {age.replace("ans", "ans")}
          </span>
        ) : null}
      </div>
    </article>
  );
}
