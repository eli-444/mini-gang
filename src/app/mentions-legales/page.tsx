export default function MentionsLegalesPage() {
  return (
    <section className="mx-auto max-w-3xl py-6 md:py-10">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">Mentions-légales</p>
      <h1 className="mt-6 text-4xl font-black leading-tight text-[var(--mg-ink)] md:text-5xl">Mentions legales</h1>
      <div className="mt-8 space-y-4 text-sm leading-6 text-[var(--mg-ink)]/75">
        <article className="rounded-lg border border-[var(--mg-ring)] bg-white p-5">
          <h2 className="font-semibold text-[var(--mg-ink)]">Identite a completer</h2>
          <p>Raison sociale: a completer.</p>
          <p>Adresse: a completer.</p>
          <p>Pays: Suisse.</p>
          <p>IDE/TVA: a completer si applicable.</p>
          <p>Email: hello@leminigang.com.</p>
        </article>
        <article className="rounded-lg border border-[var(--mg-ring)] bg-white p-5">
          <h2 className="font-semibold text-[var(--mg-ink)]">Activite</h2>
          <p>Vente en ligne de vetements enfant de seconde main, pieces uniques, prix en CHF, livraison Suisse.</p>
        </article>
        <article className="rounded-lg border border-[var(--mg-ring)] bg-white p-5">
          <h2 className="font-semibold text-[var(--mg-ink)]">Hebergement et services</h2>
          <p>Hebergement applicatif: a completer selon le prestataire choisi. Base de donnees et authentification: Supabase. Emails transactionnels: Resend. Paiement: prestataire carte/TWINT configure au checkout.</p>
        </article>
      </div>
    </section>
  );
}
