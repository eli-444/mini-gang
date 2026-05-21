"use client";

import Link from "next/link";

export function SellOrderWizard({ defaultEmail }: { defaultEmail?: string }) {
  return (
    <section className="mg-shell rounded-[18px] bg-white p-5">
      <h2 className="text-lg font-semibold text-[var(--mg-ink)]">Depot vendeur</h2>
      <p className="mt-2 text-sm text-[var(--mg-ink)]/70">
        Preparez un colis de 10 a 50 vetements. Les frais d&apos;envoi client ne sont pas factures; la selection finale dependra de l&apos;etat, de la marque et de la saison.
      </p>
      {defaultEmail ? <p className="mt-2 text-xs text-[var(--mg-ink)]/60">Compte connecte: {defaultEmail}</p> : null}
      <Link href="/boutique" className="mt-4 inline-flex rounded-full bg-[var(--mg-ink)] px-4 py-2 text-xs font-semibold text-white">
        Voir la boutique
      </Link>
    </section>
  );
}
