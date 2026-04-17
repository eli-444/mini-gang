import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/products";

export const revalidate = 300;

export default async function HomePage() {
  const { products } = await listProducts({ limit: 8, sort: "newest" });

  return (
    <div className="-mt-8 space-y-10">
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-[#faf5ec]">
        <div className="relative min-h-[100svh] w-full">
          <Image src="/brand/hero-alt.avif" alt="Mini Gang" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/40" />
          <div className="absolute inset-y-0 right-0 flex w-full items-center justify-end px-6 md:px-10 lg:px-16">
            <h1 className="max-w-[780px] text-right font-sans text-4xl font-extrabold leading-[0.98] text-white md:text-6xl">
              <span className="text-[var(--mg-pop-rose)]">Acheter</span> et revendre
              <br />
              des vetements
              <br />
              d&apos;enfants,
              <span className="font-display text-[var(--mg-pop-sun)]"> AUTREMENT.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black">
              Nouveautes <span className="text-[var(--mg-pop-rose)]">Mini Gang</span>
            </h2>
            <p className="text-sm font-bold text-[var(--mg-on-dark-muted)]">
              Selection fraiche de <span className="text-[var(--mg-pop-sun)]">pieces secondes mains</span> pour enfants.
            </p>
          </div>
          <Link href="/boutique" className="text-sm font-semibold text-[var(--mg-sun)]">
            Voir tout
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
