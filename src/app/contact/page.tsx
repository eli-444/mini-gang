import Image from "next/image";
import Link from "next/link";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 md:h-12 md:w-12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.2 6.8h.1" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 md:h-12 md:w-12" fill="currentColor">
      <path d="M13.2 22v-8.3h2.8l.4-3.2h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7v3.2h2.8V22h3.4Z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-[var(--mg-cream)] pb-14 pt-14 text-[var(--mg-ink)] md:pb-20 md:pt-28">
      <div className="mg-container relative min-h-[auto] md:min-h-[760px]">
        <Image
          src="/brand/design/flowers-three.png"
          alt=""
          width={560}
          height={438}
          className="absolute right-8 top-10 hidden w-[32rem] max-w-[34vw] md:block"
        />

        <h1 className="mg-hand-title text-[3.6rem] text-[var(--mg-pop-rose)] md:text-[10rem]">
          CONTACTEZ
          <br />
          NOUS !
        </h1>

        <div className="mt-10 grid gap-10 md:mt-20 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="max-w-[34rem]">
            <p className="text-[1.65rem] font-black leading-[0.98] md:text-5xl">
              Parlons Mini Gang, projets, commandes.
              <br />
              Une question sur la boutique, le rachat ou une commande ?
              <br />
              <span className="text-[var(--mg-pop-sun)]">Ecrivez-nous, on vous repond rapidement.</span>
            </p>
          </section>

          <section className="pt-1">
            <h2 className="text-[1.4rem] font-black leading-none md:text-6xl">
              <span className="block md:inline">Email:</span>{" "}
              <a href="mailto:contact@leminigang.com" className="break-normal underline">
                contact@leminigang.com
              </a>
            </h2>
            <p className="mt-2 text-[1.25rem] font-black leading-none md:text-4xl">Reponse moyenne sous 24/48 heures ouvrables.</p>

            <p className="mt-10 max-w-4xl text-[1.55rem] font-black leading-none text-[var(--mg-pop-rose)] md:mt-16 md:text-5xl">
              Suivez nos coulisses
              <br />
              Retrouvez nos actus, arrivages et moments Mini Gang sur les reseaux.
            </p>

            <div className="mt-7 grid gap-3 text-[2.25rem] font-black leading-none md:mt-8 md:gap-4 md:text-6xl">
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
