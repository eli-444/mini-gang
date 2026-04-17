import Link from "next/link";
import type { Product } from "@/lib/types";
import { toChf } from "@/lib/utils";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const image = product.product_images?.[0]?.url ?? product.product_images?.[0]?.path;
  const imageSrc = image?.startsWith("http")
    ? image
    : image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vetements/${image}`
    : "https://placehold.co/640x860?text=Mini+Gang";

  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--mg-ring)] bg-white shadow-[0_12px_28px_rgba(45,34,64,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(45,34,64,0.11)]">
      <Link href={`/boutique/${product.id}`} className="block">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={product.title} className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className="absolute left-3 top-3 rounded-full bg-[var(--mg-sun)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--mg-ink)]">
            Piece unique
          </span>
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--mg-ink)]/45">{product.brand ?? "Le Mini Gang"}</p>
        <Link href={`/boutique/${product.id}`} className="line-clamp-2 text-base font-semibold text-[var(--mg-ink)]">
          {product.title}
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[var(--mg-accent-strong)]">{toChf(product.price_cents)}</span>
          <span className="rounded-full bg-[var(--mg-rose-soft)] px-2 py-1 text-[11px] font-semibold text-[#ce5f8d]">
            Mini Gang
          </span>
        </div>
      </div>
    </article>
  );
}
