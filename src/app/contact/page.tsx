import Image from "next/image";
import Link from "next/link";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 md:h-9 md:w-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.2 6.8h.1" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 md:h-9 md:w-9" fill="currentColor">
      <path d="M13.2 22v-8.3h2.8l.4-3.2h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7v3.2h2.8V22h3.4Z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-[var(--mg-cream)] pb-14 pt-14 text-[var(--mg-ink)] md:pb-20 md:pt-28">
      <div className="mg-container relative min-h-[auto] md:min-h-[660px]">
        <Image
          src="/brand/design/flowers-three.png"
          alt=""
          width={560}
          height={438}
          className="absolute right-8 -top-8 hidden w-[25rem] max-w-[30vw] md:block"
        />

        <h1 className="mg-hand-title text-[2.9rem] text-[var(--mg-pop-rose)] md:text-[7.6rem]">
          CONTACTEZ
          <br />
          NOUS !
        </h1>

        <div className="mt-8 grid gap-9 md:mt-14 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="max-w-[34rem]">
            <p className="text-[1.35rem] font-black leading-[1.02] md:text-3xl">
              Parlons Mini Gang, projets, commandes.
              <br />
              Une question sur la boutique, le rachat ou une commande ?
              <br />
              <span className="text-[var(--mg-pop-sun)]">Ecrivez-nous, on vous repond rapidement.</span>
            </p>
          </section>

          <section className="pt-1">
            <h2 className="text-[1.15rem] font-black leading-tight md:text-4xl">
              <span className="block md:inline">Email:</span>{" "}
              <a href="mailto:contact@leminigang.com" className="break-normal underline">
                contact@leminigang.com
              </a>
            </h2>
            <p className="mt-2 text-[1.05rem] font-black leading-tight md:text-2xl">Réponse moyenne sous 24/48 heures ouvrables.</p>

            <p className="mt-8 max-w-4xl text-[1.28rem] font-black leading-tight text-[var(--mg-pop-rose)] md:mt-12 md:text-3xl">
              Suivez nos coulisses
              <br />
              Retrouvez nos actus, arrivages et moments Mini Gang sur les reseaux.
            </p>

            <div className="mt-6 grid gap-3 text-[1.85rem] font-black leading-none md:mt-7 md:gap-4 md:text-4xl">
              <Link href="https://www.instagram.com/leminigang/" target="_blank" rel="noreferrer" className="flex w-fit items-center gap-5 underline">
                <InstagramIcon />
                Instagram
              </Link>
              <Link href="https://www.facebook.com/share/1AS4fgVB1Z/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="flex w-fit items-center gap-5 underline">
                <FacebookIcon />
                Facebook
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
