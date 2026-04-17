import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-3xl border border-black/10 bg-white p-8 text-center">
      <h1 className="font-display text-3xl font-black">
        Paiement <span className="text-[var(--mg-pop-rose)]">annule</span>
      </h1>
      <p className="text-sm font-bold text-[var(--mg-ink)]/70">
        Votre panier est <span className="text-[var(--mg-pop-sun)]">conserve</span>. Vous pouvez reessayer quand vous
        voulez.
      </p>
      <Link href="/panier" className="inline-flex rounded-full border border-black/20 px-5 py-2 text-sm font-semibold">
        Retour au panier
      </Link>
    </section>
  );
}
