import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type ShopClosedPageProps = {
  message?: string;
  reopenDate?: string;
};

function formatReopenDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ShopClosedPage({ message, reopenDate }: ShopClosedPageProps) {
  const formattedDate = formatReopenDate(reopenDate);

  return (
    <section className="relative isolate min-h-[calc(100vh-56px)] overflow-hidden bg-[var(--mg-cream)] px-5 py-16 text-[var(--mg-ink)] md:min-h-[calc(100vh-60px)] md:px-10 md:py-24">
      <Image
        src="/brand/design/flowers-three.png"
        alt=""
        width={2284}
        height={1786}
        priority
        className="pointer-events-none absolute -right-24 -top-10 z-0 w-[58vw] max-w-[680px] rotate-[-6deg] select-none opacity-95 md:-right-12 md:-top-16"
        sizes="(max-width: 768px) 76vw, 58vw"
      />
      <Image
        src="/brand/design/tee-shirt-blue.png"
        alt=""
        width={1521}
        height={2127}
        className="pointer-events-none absolute -bottom-32 -left-28 z-0 hidden w-[34vw] max-w-[390px] rotate-[-12deg] select-none opacity-95 md:block"
        sizes="34vw"
      />

      <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-4xl flex-col justify-center">
        <BrandLogo className="mb-8 block w-fit" imageClassName="w-24 md:w-32" priority />
        <p className="mg-hand-title text-4xl text-[var(--mg-pop-rose)] md:text-6xl">MINI PAUSE</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-black leading-[0.92] md:text-7xl">
          Nous revenons très bientôt.
        </h1>
        <p className="mt-7 max-w-2xl text-xl font-black leading-tight md:text-3xl">
          La boutique se refait une beauté et prépare de nouvelles pépites pour vos kids.
        </p>
        <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[var(--mg-ink)]/72 md:text-lg">
          {message || "La boutique prend une petite pause. Nous revenons très bientôt avec de nouvelles pépites Mini Gang."}
        </p>
        {formattedDate ? (
          <p className="mt-3 text-base font-black text-[var(--mg-pop-rose)] md:text-lg">
            Retour prévu le {formattedDate}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="mg-button mg-button-pink">
            Retour accueil
          </Link>
          <Link href="/contact" className="mg-button mg-button-yellow">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
