const sections = [
  {
    title: "Éditeur du site",
    body: [
      "Le site www.minigang.ch est édité par :",
      "Mini Gang, titulaire Hauff Célia",
      "Entreprise individuelle inscrite au Registre du commerce",
      "Chemin de la Cuvigne 47, 1614 Granges, Canton de Fribourg - Suisse",
      "E-mail : contact@minigang.ch",
      "Numéro IDE : CHE-153.765.550",
      "Responsable de la publication : Célia Hauff",
    ],
  },
  {
    title: "Hébergement",
    body: [
      "Le Site est développé avec la technologie Next.js et hébergé auprès d'un prestataire spécialisé garantissant la disponibilité et la sécurité des données.",
    ],
  },
  {
    title: "Paiements",
    body: [
      "Les paiements effectués sur le Site sont sécurisés et traités par le prestataire de paiement Stripe.",
      "Mini Gang n'a jamais accès aux données bancaires complètes des clients. Ces informations sont traitées directement par Stripe conformément à ses propres conditions d'utilisation et à sa politique de confidentialité.",
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "L'ensemble du contenu présent sur le Site, notamment les textes, photographies, illustrations, dessins, logos, éléments graphiques, icônes, vidéos, charte graphique, identité visuelle ainsi que la structure générale du Site, est protégé par les dispositions relatives à la propriété intellectuelle.",
      "Sauf indication contraire, ces éléments sont la propriété exclusive de Mini Gang ou font l'objet d'une autorisation d'utilisation.",
      "Toute reproduction, représentation, modification, diffusion ou exploitation, totale ou partielle, du contenu du Site sans autorisation écrite préalable est interdite.",
      "Les illustrations, dessins, logos, mascottes, univers graphiques et créations visuelles réalisés spécifiquement pour Mini Gang sont réservés à son usage exclusif et bénéficient de la protection du droit d'auteur.",
      "Toute utilisation susceptible de créer une confusion avec la marque Mini Gang, son identité visuelle ou ses créations est interdite.",
    ],
  },
  {
    title: "Responsabilité",
    body: [
      "Mini Gang s'efforce de fournir des informations exactes et régulièrement mises à jour sur le Site. Toutefois, aucune garantie ne peut être donnée quant à l'exactitude, l'exhaustivité ou l'actualité des informations publiées.",
      "Mini Gang ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation du Site ou de l'impossibilité d'y accéder.",
    ],
  },
  {
    title: "Liens externes",
    body: [
      "Le Site peut contenir des liens vers des sites tiers. Mini Gang n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leur disponibilité ou leurs pratiques en matière de protection des données.",
    ],
  },
  {
    title: "Protection des données",
    body: [
      "Le traitement des données personnelles est régi par la Politique de confidentialité du Site.",
      "Les utilisateurs sont invités à consulter cette politique afin de connaître les modalités de collecte, de traitement et de protection de leurs données personnelles.",
    ],
  },
  {
    title: "Droit applicable",
    body: [
      "Les présentes mentions légales sont soumises au droit suisse.",
      "En cas de litige, les tribunaux compétents sont ceux du Canton de Fribourg, sous réserve des dispositions légales impératives applicables.",
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <section className="bg-[#edf6ef] px-4 py-10 text-[#164832] md:px-6 md:py-14" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4b7c60]">Le Mini Gang</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Mentions légales</h1>
        <div className="mt-10 rounded-lg border border-[#bfdcc8] bg-[#f7fbf8] px-5 py-8 md:px-10 md:py-10">
          {sections.map((section) => (
            <article key={section.title} className="border-t border-[#bfdcc8] py-7 first:border-t-0 first:pt-0">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-4 space-y-3 text-[0.96rem] leading-7 text-[#255d43]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
