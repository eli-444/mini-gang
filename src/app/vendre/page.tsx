import Link from "next/link";

export default function VendrePage() {
  return (
    <div className="space-y-6 pb-10">
      <section className="mg-shell rounded-[24px] bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">Vendre mes vetements</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-[var(--mg-ink)]">
          Le rachat arrive bientot
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--mg-ink)]/75">
          Le parcours rachat, cagnotte et dossiers vendeur est volontairement desactive pour le lancement Suisse. La boutique se concentre d&apos;abord sur les pieces disponibles, les paiements CHF et la livraison Suisse.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mg-ink)]/75">
          Pour proposer un lot ou poser une question, envoyez-nous quelques photos, tailles, marques et etats des vetements.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/contact" className="rounded-full bg-[var(--mg-ink)] px-5 py-2 text-sm font-semibold text-white">
            Contacter Le Mini Gang
          </Link>
          <Link href="/boutique" className="rounded-full border border-[var(--mg-ring)] bg-white px-5 py-2 text-sm font-semibold text-[var(--mg-ink)]">
            Voir la boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
