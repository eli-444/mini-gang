const sections = [
  {
    title: "1. Vendeur",
    body: "Le Mini Gang est exploite par une entite suisse a completer: raison sociale, adresse, IDE/TVA si applicable, email de contact et responsable. Ces informations doivent etre finalisees avant mise en production.",
  },
  {
    title: "2. Articles de seconde main",
    body: "Les vetements proposes sont des pieces uniques de seconde main pour enfants. Chaque fiche indique l'etat, la taille, la marque si connue, les photos disponibles et les defauts identifies. De legeres traces d'usage peuvent subsister malgre le controle.",
  },
  {
    title: "3. Prix et disponibilite",
    body: "Les prix sont indiques en CHF, hors frais de livraison sauf mention contraire. Un article ajoute au panier n'est pas garanti tant que le checkout n'a pas reserve la piece. En cas d'indisponibilite exceptionnelle, la commande est annulee et remboursee.",
  },
  {
    title: "4. Paiement",
    body: "Le paiement se fait par carte bancaire et/ou TWINT selon les moyens actifs au checkout. Les transactions sont traitees par le prestataire de paiement configure; Le Mini Gang ne stocke pas les donnees completes de carte.",
  },
  {
    title: "5. Livraison Suisse",
    body: "La livraison est prevue en Suisse. Les frais sont affiches avant paiement. Les delais indicatifs commencent apres confirmation du paiement et preparation de la commande.",
  },
  {
    title: "6. Retours et reclamations",
    body: "Les retours de pieces de seconde main sont acceptes uniquement selon la politique de retours publiee: erreur manifeste, article non conforme a la fiche ou probleme signale dans le delai indique. Les articles portes, laves ou endommages apres reception ne sont pas repris.",
  },
  {
    title: "7. Remboursement",
    body: "Un remboursement accepte est effectue manuellement ou via le prestataire de paiement lorsque l'integration le permet. Les frais de livraison peuvent etre exclus du remboursement sauf erreur imputable a Le Mini Gang.",
  },
  {
    title: "8. Donnees personnelles",
    body: "Les donnees necessaires a la commande, au paiement, a la livraison et au support sont traitees selon la politique de confidentialite LPD.",
  },
  {
    title: "9. Contact",
    body: "Pour toute question: hello@leminigang.com. L'adresse postale et l'identite complete du vendeur doivent etre completees avant lancement public.",
  },
];

export default function CgvPage() {
  return (
    <section className="mx-auto max-w-3xl py-6 md:py-10">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">Cadre de vente</p>
      <h1 className="mt-6 text-4xl font-black leading-tight text-[var(--mg-ink)] md:text-5xl">Conditions generales de vente</h1>
      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-[var(--mg-ring)] bg-white p-5">
            <h2 className="font-semibold text-[var(--mg-ink)]">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mg-ink)]/75">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
