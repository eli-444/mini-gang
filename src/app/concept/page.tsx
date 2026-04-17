import Link from "next/link";

export default function ConceptPage() {
  return (
    <div className="relative mx-auto max-w-5xl py-6 md:py-10">
      <section className="max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">Le concept</p>
        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-[var(--mg-on-dark)] md:text-6xl">
          La seconde main <span className="text-[var(--mg-pop-rose)]">enfant</span>, plus simple, plus belle, plus{" "}
          <span className="text-[var(--mg-pop-sun)]">locale</span>.
        </h1>
        <p className="mt-7 max-w-3xl text-xl font-black leading-[1.18] tracking-[-0.03em] text-[var(--mg-on-dark)] md:text-3xl">
          Mini Gang reinvente la seconde main enfant :{" "}
          <span className="text-[var(--mg-pop-rose)]">selection premium</span>, lavage, controle qualite et experience
          d&apos;achat moderne.
        </p>
        <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-[var(--mg-on-dark-muted)]">
          Chaque piece est choisie pour prolonger son histoire, alleger le quotidien des familles et donner plus de place
          aux achats utiles, joyeux et durables.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["01", "On trie", "Des pieces enfant selectionnees avec soin, selon leur etat, leur style et leur potentiel."],
          ["02", "On valorise", "Une presentation claire, de belles photos et des informations simples pour acheter sans hesitation."],
          ["03", "On fait durer", "La seconde main devient un reflexe naturel, accessible et vraiment desirable."],
        ].map(([number, title, description], index) => (
          <article key={title} className="border-t border-white/25 pt-5">
            <p className={`text-3xl font-black ${index === 1 ? "text-[var(--mg-pop-sun)]" : "text-[var(--mg-pop-rose)]"}`}>
              {number}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-none tracking-[-0.04em] text-[var(--mg-on-dark)]">{title}</h2>
            <p className="mt-3 text-sm font-bold leading-6 text-[var(--mg-on-dark-muted)]">{description}</p>
          </article>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/boutique" className="rounded-full bg-[var(--mg-pop-sun)] px-5 py-2.5 text-sm font-black text-[var(--mg-ink)]">
          Decouvrir la boutique
        </Link>
        <Link href="/a-propos" className="rounded-full border border-white/45 px-5 py-2.5 text-sm font-black text-[var(--mg-on-dark)]">
          Qui sommes-nous ?
        </Link>
      </div>
    </div>
  );
}
