import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/products";
import { getSiteContentSettings } from "@/lib/site-content-settings";

export const revalidate = 300;

export default async function HomePage() {
  const [{ products }, siteContent] = await Promise.all([
    listProducts({ limit: 4, sort: "newest", shop_section: "vetements" }),
    getSiteContentSettings(),
  ]);

  return (
    <div className="bg-[var(--mg-bg)] text-[var(--mg-on-dark)]">
      <section className="relative min-h-[500px] overflow-hidden bg-[#7ec9f0] md:min-h-[690px]">
        <Image src="/brand/hero-alt.avif" alt="Mini Gang" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-y-0 left-5 right-5 flex items-center md:left-auto md:right-[7vw] md:w-[48rem] md:max-w-[58vw]">
          <div>
            <h1 className="text-[2.25rem] font-black leading-[0.95] text-white md:text-7xl">
              Acheter et revendre
              <br />
              des vetements
              <br />
              d&apos;enfants, <span className="mg-hand-title text-[var(--mg-pop-sun)]">AUTREMENT</span>
            </h1>
            <Link href="/boutique" className="mg-button mg-button-pink mt-5 text-xl md:mt-6 md:text-3xl">
              call to action
            </Link>
          </div>
        </div>
      </section>

      {!siteContent.orders_enabled ? (
        <section className="mg-container pt-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <p className="text-sm font-bold">{siteContent.orders_closed_message || "Les commandes sont temporairement suspendues."}</p>
            {siteContent.orders_reopen_date ? <p className="mt-1 text-xs font-semibold">Reouverture prevue: {siteContent.orders_reopen_date}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="mg-container py-9 md:py-14">
        <div className="mb-7">
          <h2 className="mg-hand-title mg-underline text-[2.9rem] text-[var(--mg-pop-sun)] md:text-8xl">NOUVEAUTES</h2>
          <p className="mt-2 text-base font-black md:mt-3 md:text-xl">Selection de pepites pour vos kids</p>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
            <p className="max-w-xl text-sm font-black text-[var(--mg-on-dark-muted)] md:text-xl">
            Les nouveautes seront affichees ici des que les fiches produits seront publiees depuis le dashboard.
          </p>
        )}

        <Link href="/boutique?shop_section=vetements" className="mg-button mg-button-yellow mt-7 text-base md:mt-9 md:text-xl">
          Voir plus de vetements
        </Link>
      </section>

      <section className="mg-container relative grid gap-8 overflow-hidden pb-16 pt-4 md:pb-24 md:pt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="relative z-10 max-w-4xl">
          <h2 className="text-[1.75rem] font-black leading-none text-[var(--mg-pop-rose)] md:text-6xl">
            Et si la seconde main devenait le
            <br />
            premier reflexe des familles ?
          </h2>
          <p className="mt-8 max-w-3xl text-[1.45rem] font-black leading-[1.03] md:mt-16 md:text-5xl">
            Mini Gang est une plateforme dediee aux vetements de seconde main pour enfants de 0 a 12 ans, pensee pour
            simplifier le quotidien des familles d&apos;aujourd&apos;hui. Parce que les enfants grandissent vite, nous
            proposons une alternative a la fois pratique, accessible et plus responsable.
          </p>
          <Link href="/a-propos" className="mg-button mg-button-pink mt-6 text-base md:mt-8 md:text-xl">
            Lire plus
          </Link>
        </div>
        <div className="relative min-h-[260px] md:min-h-[420px]">
          <Image src="/brand/design/flower-pink.png" alt="" fill className="object-contain object-right-bottom" sizes="45vw" />
        </div>
      </section>
    </div>
  );
}
