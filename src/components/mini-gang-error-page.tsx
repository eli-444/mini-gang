"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type MiniGangErrorPageProps = {
  eyebrow?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function MiniGangErrorPage({
  eyebrow = "Oups",
  title = "On a perdu le fil.",
  message = "La page demandée n'est pas disponible pour le moment.",
  onRetry,
}: MiniGangErrorPageProps) {
  return (
    <section className="relative isolate min-h-[calc(100vh-56px)] overflow-hidden bg-[var(--mg-cream)] px-5 py-16 text-[var(--mg-ink)] md:min-h-[calc(100vh-60px)] md:px-10 md:py-20">
      <Image
        src="/brand/design/flowers-three.png"
        alt=""
        width={2284}
        height={1786}
        priority
        className="pointer-events-none absolute -right-20 -top-8 z-0 w-[52vw] max-w-[620px] rotate-[-4deg] select-none opacity-95 md:-right-16 md:-top-16"
        sizes="(max-width: 768px) 72vw, 52vw"
      />
      <Image
        src="/brand/design/salopette-yellow.png"
        alt=""
        width={1382}
        height={1639}
        priority
        className="pointer-events-none absolute -bottom-20 -left-24 z-0 w-[46vw] max-w-[430px] rotate-[-12deg] select-none opacity-95 md:-bottom-28 md:-left-20"
        sizes="(max-width: 768px) 62vw, 46vw"
      />
      <Image
        src="/brand/design/tee-shirt-blue.png"
        alt=""
        width={1521}
        height={2127}
        className="pointer-events-none absolute -bottom-28 -right-28 z-0 hidden w-[34vw] max-w-[360px] rotate-[8deg] select-none opacity-95 md:block"
        sizes="34vw"
      />
      <Image
        src="/brand/design/flower-pink.png"
        alt=""
        width={5368}
        height={4899}
        className="pointer-events-none absolute -right-28 bottom-8 z-0 w-[42vw] max-w-[420px] select-none opacity-90 md:hidden"
        sizes="42vw"
      />

      <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-4xl flex-col items-center justify-center text-center">
        <BrandLogo className="mb-7 block" imageClassName="w-24 md:w-32" priority />
        <p className="font-display text-3xl font-black uppercase leading-none text-[var(--mg-pop-rose)] md:text-5xl">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[var(--mg-ink)] md:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-2xl font-black leading-tight text-[var(--mg-ink)] md:text-4xl">
          Oups, cette petite page a glissé au fond du bac à chaussettes.
        </p>
        <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[var(--mg-ink)]/72 md:text-lg">{message}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="mg-button mg-button-pink">
            Retour accueil
          </Link>
          <Link href="/boutique" className="mg-button mg-button-yellow">
            Voir la boutique
          </Link>
          {onRetry ? (
            <button type="button" onClick={onRetry} className="mg-button border-2 border-[var(--mg-ink)] bg-transparent text-[var(--mg-ink)]">
              Réessayer
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
