const sections = [
  ["Responsable", "Mini Gang, titulaire Hauff Célia, Chemin de la Cuvigne 47, 1614 Granges, Canton de Fribourg - Suisse."],
  ["Données traitées", "Compte client, email, nom, téléphone, adresse de livraison, commandes, paiements, tracking, demandes SAV et logs techniques nécessaires à la sécurité."],
  ["Finalités", "Création du compte, exécution des commandes, paiement, livraison, support, prévention de la fraude, obligations comptables et amélioration du service."],
  ["Sous-traitants", "Supabase héberge la base de données et l'authentification. Resend envoie les emails transactionnels. Stripe traite les paiements. L'hébergeur applicatif sert le site."],
  ["Base légale LPD", "Le traitement repose sur l'exécution du contrat, les obligations légales, l'intérêt légitime de sécuriser le service et le consentement lorsque requis."],
  ["Conservation", "Les données de compte et commandes sont conservées selon les obligations suisses applicables. Les demandes de suppression sont traitées lorsque la loi ne requiert pas une conservation."],
  ["Droits", "Vous pouvez demander accès, rectification, opposition ou suppression par email. Une vérification d'identité peut être demandée."],
  ["Contact", "contact@minigang.ch"],
];

export default function ConfidentialitePage() {
  return (
    <section className="bg-[#edf6ef] px-4 py-10 text-[#164832] md:px-6 md:py-14" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4b7c60]">LPD Suisse</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Politique de confidentialité</h1>
        <div className="mt-10 rounded-lg border border-[#bfdcc8] bg-[#f7fbf8] px-5 py-8 md:px-10 md:py-10">
          {sections.map(([title, body]) => (
            <article key={title} className="border-t border-[#bfdcc8] py-7 first:border-t-0 first:pt-0">
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-4 text-[0.96rem] leading-7 text-[#255d43]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
