const sections = [
  ["Responsable", "Identite vendeur suisse a completer avant production: raison sociale, adresse, email, IDE/TVA si applicable."],
  ["Donnees traitees", "Compte client, email, nom, telephone, adresse de livraison, commandes, paiements, tracking, demandes SAV et logs techniques necessaires a la securite."],
  ["Finalites", "Creation du compte, execution des commandes, paiement, livraison, support, prevention de la fraude, obligations comptables et amelioration du service."],
  ["Sous-traitants", "Supabase heberge la base de donnees et l'authentification. Resend envoie les emails transactionnels. Le prestataire de paiement carte/TWINT traite les paiements. L'hebergeur applicatif sert le site."],
  ["Base legale LPD", "Le traitement repose sur l'execution du contrat, les obligations legales, l'interet legitime de securiser le service et le consentement lorsque requis."],
  ["Conservation", "Les donnees de compte et commandes sont conservees selon les obligations suisses applicables. Les demandes de suppression sont traitees lorsque la loi ne requiert pas une conservation."],
  ["Droits", "Vous pouvez demander acces, rectification, opposition ou suppression par email. Une verification d'identite peut etre demandee."],
  ["Contact", "hello@leminigang.com. Les coordonnees postales du responsable doivent etre completees avant mise en ligne publique."],
];

export default function ConfidentialitePage() {
  return (
    <section className="mx-auto max-w-3xl py-6 md:py-10">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">LPD Suisse</p>
      <h1 className="mt-6 text-4xl font-black leading-tight text-[var(--mg-ink)] md:text-5xl">Politique de confidentialite</h1>
      <div className="mt-8 space-y-4">
        {sections.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--mg-ring)] bg-white p-5">
            <h2 className="font-semibold text-[var(--mg-ink)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mg-ink)]/75">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
