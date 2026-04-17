import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6 md:py-10">
      <section className="max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">Contact</p>
        <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.05em] text-[var(--mg-on-dark)] md:text-6xl">
          Parlons <span className="text-[var(--mg-pop-rose)]">Mini Gang</span>, projets, commandes et petits coups de
          main.
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-black leading-7 text-[var(--mg-on-dark)] md:text-2xl md:leading-8">
          Une question sur la boutique, le rachat ou une commande ?{" "}
          <span className="text-[var(--mg-pop-sun)]">Ecrivez-nous</span>, on vous repond rapidement.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 text-[var(--mg-on-dark)] backdrop-blur">
          <h2 className="text-3xl font-black leading-none tracking-[-0.04em]">
            Nous <span className="text-[var(--mg-pop-rose)]">ecrire</span>
          </h2>
          <p className="mt-4 text-sm font-bold text-[var(--mg-on-dark-muted)]">
            Email:{" "}
            <a href="mailto:hello@leminigang.com" className="text-[var(--mg-pop-sun)] underline">
              hello@leminigang.com
            </a>
          </p>
          <p className="mt-2 text-sm font-bold text-[var(--mg-on-dark-muted)]">
            Reponse moyenne sous 24 a 48 heures ouvrables.
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 text-[var(--mg-on-dark)] backdrop-blur">
          <h2 className="text-3xl font-black leading-none tracking-[-0.04em]">
            Suivez nos <span className="text-[var(--mg-pop-sun)]">coulisses</span>
          </h2>
          <p className="mt-4 text-sm font-bold text-[var(--mg-on-dark-muted)]">
            Retrouvez nos actus, arrivages et moments Mini Gang sur les reseaux.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="https://www.instagram.com/leminigang/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[var(--mg-pop-sun)] px-4 py-2 text-sm font-black text-[var(--mg-ink)]"
            >
              Instagram
            </Link>
            <Link
              href="https://www.facebook.com/share/1AS4fgVB1Z/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/45 px-4 py-2 text-sm font-black text-[var(--mg-on-dark)]"
            >
              Facebook
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
