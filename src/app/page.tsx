import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/products";
import { getSiteContentImageUrl, getSiteContentSettings } from "@/lib/site-content-settings";

export const revalidate = 300;

export default async function HomePage() {
  const [{ products }, siteContent] = await Promise.all([
    listProducts({ limit: 8, sort: "newest", shop_section: "vetements" }),
    getSiteContentSettings(),
  ]);

  const eventImageUrl = getSiteContentImageUrl(siteContent.home_event_image_path);
  const eventCtaHref = siteContent.home_event_cta_url || "/contact";
  const eventCtaLabel = siteContent.home_event_cta_label || "En savoir plus";

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

      {siteContent.home_event_enabled && (siteContent.home_event_title || siteContent.home_event_text || eventImageUrl) ? (
        <section className="overflow-hidden rounded-[2rem] border border-[var(--mg-ring)] bg-[linear-gradient(135deg,#fff7ef,#fff)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr),420px]">
            <div className="space-y-4 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--mg-pop-rose)]">Event Mini Gang</p>
              <h2 className="font-display text-4xl font-black leading-none text-[var(--mg-ink)]">
                {siteContent.home_event_title || "Nouvel event a venir"}
              </h2>
              <p className="max-w-2xl text-sm font-semibold leading-7 text-[var(--mg-ink)]/72 md:text-base">
                {siteContent.home_event_text || "Ajoute ici une annonce d'evenement depuis le panel admin."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={eventCtaHref} className="rounded-full bg-[var(--mg-ink)] px-5 py-2 text-sm font-bold text-white">
                  {eventCtaLabel}
                </Link>
                <Link href="/a-propos" className="rounded-full border border-[var(--mg-ring)] px-5 py-2 text-sm font-bold text-[var(--mg-ink)]">
                  A propos
                </Link>
              </div>
            </div>
            <div className="relative min-h-[280px] bg-[#f6eadf]">
              {eventImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={eventImageUrl} alt={siteContent.home_event_title || "Event Mini Gang"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-sm font-semibold text-[var(--mg-ink)]/55">
                  Ajoute une image d&apos;event depuis le panel admin.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

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
          <Link href="/boutique?shop_section=vetements" className="text-sm font-semibold text-[var(--mg-sun)]">
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
