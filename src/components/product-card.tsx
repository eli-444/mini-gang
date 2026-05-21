import Link from "next/link";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
}

function formatCardPrice(cents: number) {
  const amount = cents / 100;
  return Number.isInteger(amount) ? `${amount}.-` : amount.toLocaleString("fr-CH", { minimumFractionDigits: 2 });
}

export function ProductCard({ product }: Props) {
  const image = product.product_images?.[0]?.url ?? product.product_images?.[0]?.path;
  const imageSrc = image?.startsWith("http")
    ? image
    : image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vetements/${image}`
    : "";

  const age = product.age_range || product.size_label || "";

  return (
    <article className="group overflow-hidden rounded-[1.2rem] bg-white text-[var(--mg-ink)] transition-transform hover:-translate-y-1 md:rounded-[1.65rem]">
      <Link href={`/boutique/${product.id}`} className="block">
        <div className="relative aspect-[1/1.02] bg-white">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          ) : null}
        </div>
      </Link>
      <div className="relative min-h-[4.35rem] bg-[var(--mg-rose-soft)] px-4 py-2.5 text-[0.82rem] font-medium leading-[1.15] md:min-h-[5.05rem] md:px-5 md:py-3 md:text-[0.96rem]">
        <Link href={`/boutique/${product.id}`} className="line-clamp-2 max-w-[82%]">
          {product.brand ? `${product.brand} ` : ""}
          {product.title}
        </Link>
        <p className="max-w-[82%]">{product.size_label || product.age_range || "Piece unique"}</p>
        <p className="font-black">{formatCardPrice(product.price_cents)}</p>
        <span className="absolute right-4 top-3 inline-flex text-[var(--mg-ink)]" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.4 8.2h9.2l1.1 11.2a1.6 1.6 0 0 1-1.6 1.8H7.9a1.6 1.6 0 0 1-1.6-1.8L7.4 8.2Z" />
            <path d="M9.2 8.2c0-2.4 1.1-4.2 2.8-4.2s2.8 1.8 2.8 4.2" />
          </svg>
        </span>
        {age ? (
          <span className="absolute bottom-2.5 right-3 rounded-full bg-[#f3edc9] px-2 py-0.5 text-xs font-black md:bottom-3 md:right-4 md:px-2.5 md:py-1 md:text-sm">
            {age.replace("ans", "ans")}
          </span>
        ) : null}
      </div>
    </article>
  );
}
