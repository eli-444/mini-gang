type LegalBlock = { type: "p"; text: string } | { type: "h"; text: string } | { type: "list"; items: string[] };

const articles: Array<{ title: string; blocks: LegalBlock[] }> = [
  {
    title: "Article 1. Objet",
    blocks: [
      {
        type: "p",
        text: "Les présentes conditions générales de vente régissent les droits et obligations des Parties résultant de la vente en ligne et du rachat des Articles proposés sur le site du Mini Gang, tel que ces Articles sont définis à l'article 2 ci-dessous ; elles s'appliquent à l'exclusion de tout autre document. Toute commande ou envoi d'un Article pour rachat implique l'adhésion du client aux présentes conditions générales de vente.",
      },
      {
        type: "p",
        text: "Le Mini Gang se réserve le droit de modifier à tout moment les présentes conditions générales de vente. Les conditions applicables sont celles en vigueur à la date de la commande ou de l'envoi pour rachat.",
      },
    ],
  },
  {
    title: "Article 2. Articles - Prix",
    blocks: [
      { type: "h", text: "2.1. Articles" },
      { type: "p", text: "Le Mini Gang propose à la vente, sur son site internet, des vêtements et accessoires de seconde main pour enfants de 0 à 12 ans." },
      {
        type: "p",
        text: "Dans le cadre du service de rachat, les articles envoyés doivent impérativement correspondre aux critères de sélection définis par Le Mini Gang : marques acceptées, état général, ancienneté et type de vêtement.",
      },
      { type: "h", text: "Conditions de reprise des articles" },
      {
        type: "list",
        items: [
          "Les articles doivent être propres, lavés et en excellent état général.",
          "Les vêtements doivent être sans tache, sans odeur et immédiatement réutilisables.",
          "Aucun défaut ne doit compromettre l'utilisation partielle ou totale du produit.",
          "Les boutons, coutures, pressions, fermetures éclair, lacets et autres éléments doivent être complets et fonctionnels.",
          "Les matières ne doivent présenter ni trous, ni décoloration importante, ni usure excessive, ni boulochage prononcé.",
          "Les ensembles doivent être complets, par exemple un pyjama deux pièces comprenant le haut et le bas.",
          "Les vêtements proposés ne doivent pas être âgés de plus de 6 ans au moment de leur envoi.",
        ],
      },
      {
        type: "p",
        text: "Afin de garantir la cohérence de l'offre proposée sur le site, certaines marques de fast fashion ou à faible valeur de revente ne sont pas reprises par Le Mini Gang.",
      },
      { type: "h", text: "Marques non acceptées - liste non exhaustive" },
      {
        type: "list",
        items: [
          "Primark",
          "Shein Kids",
          "Cider Kids",
          "PatPat",
          "Temu",
          "Fashion Nova Kids",
          "Boohoo",
          "Kiabi",
          "C&A",
          "Lupilu (Lidl)",
          "Kids & Co (Migros)",
          "Tex Baby / Tex Kids (Carrefour)",
          "Impidimpi (Aldi)",
          "F&F Kids (Tesco)",
          "Zeeman Kids",
          "In Extenso (Auchan)",
        ],
      },
      { type: "p", text: "Cette liste peut être modifiée à tout moment sans préavis, selon l'évolution des critères de sélection du Mini Gang." },
      {
        type: "p",
        text: "Le service de rachat en ligne est proposé ponctuellement au cours de l'année et peut être temporairement fermé. Le Mini Gang se réserve le droit d'ouvrir ou de suspendre les périodes de rachat à sa libre appréciation.",
      },
      {
        type: "p",
        text: "Les frais d'envoi liés au rachat sont pris en charge par Le Mini Gang, sous réserve du respect des présentes conditions. Un envoi destiné au rachat doit comporter un minimum de 20 pièces éligibles à la reprise par colis.",
      },
      {
        type: "p",
        text: "S'agissant d'articles de seconde main, la responsabilité du Mini Gang ne saurait être engagée quant à d'éventuels défauts résultant de l'usage antérieur des produits. En acceptant les présentes conditions générales de vente, le client reconnaît que les articles ne sont pas à l'état neuf et peuvent présenter de légères variations liées à leur usage, notamment en matière de taille ou d'aspect dues aux lavages successifs.",
      },
      { type: "h", text: "Articles non conformes" },
      { type: "p", text: "Si les articles envoyés pour rachat ne répondent pas aux critères définis ci-dessus, Le Mini Gang se réserve le droit :" },
      {
        type: "list",
        items: [
          "de refuser leur reprise ;",
          "de retourner les articles aux frais du client ;",
          "ou de les confier à une filière de revalorisation textile ou à une association partenaire.",
        ],
      },
      {
        type: "p",
        text: "Si aucun article envoyé ne remplit les critères de reprise, les frais d'expédition initialement pris en charge par Le Mini Gang pourront être facturés au client.",
      },
      {
        type: "p",
        text: "Le client peut effectuer une estimation indicative du montant de rachat directement sur le site internet. En validant l'envoi de ses vêtements, le client accepte le principe de cette estimation. Le Mini Gang demeure seul décisionnaire du montant final de reprise après contrôle qualité des articles reçus. Aucune négociation relative au prix de rachat ne pourra être engagée après réception du colis.",
      },
      { type: "h", text: "Délai de traitement des colis de rachat" },
      {
        type: "p",
        text: "Le délai de traitement des colis envoyés dans le cadre du service de rachat est estimé à 3 semaines à compter de la réception du colis par Le Mini Gang. Ce délai comprend la réception, le contrôle qualité, le tri, l'évaluation des articles et la validation du montant de reprise. En période de forte activité ou lors d'opérations ponctuelles de rachat, ce délai peut être exceptionnellement prolongé.",
      },
      { type: "h", text: "2.2. Prix" },
      { type: "p", text: "Les prix sont indiqués en francs suisses (CHF) et incluent la TVA applicable." },
      { type: "h", text: "Frais de livraison" },
      { type: "list", items: ["7,90 CHF par commande.", "Livraison gratuite dès 80 CHF d'achat."] },
      { type: "p", text: "Les frais d'expédition pour l'envoi de vêtements destinés au rachat sont offerts. Les prix de rachat sont fermes et définitifs." },
    ],
  },
  {
    title: "Article 3. Livraisons et expéditions",
    blocks: [
      { type: "p", text: "Le Mini Gang livre uniquement en Suisse." },
      { type: "h", text: "Délais de préparation et d'expédition" },
      {
        type: "p",
        text: "Toute commande passée sur le site du Mini Gang du lundi au vendredi, hors jours fériés, sera préparée et expédiée dans un délai maximum de 48 heures, sous réserve de validation du paiement.",
      },
      {
        type: "p",
        text: "Toute commande passée du vendredi au dimanche ou un jour férié sera préparée et expédiée dans un délai maximum de 48 heures à partir du jour ouvré suivant.",
      },
      {
        type: "p",
        text: "Sauf cas particulier, comme des périodes de vacances ou une fermeture exceptionnelle. Dans ce cas, un message d'information sur le site indiquera que le traitement des commandes est momentanément interrompu.",
      },
      {
        type: "p",
        text: "Le client doit vérifier l'état du colis lors de la livraison. Toute anomalie, notamment colis endommagé, article manquant ou article abîmé, doit être signalée au transporteur et au Mini Gang dans les 3 jours suivant la réception.",
      },
    ],
  },
  {
    title: "Article 4. Droit de rétractation",
    blocks: [
      { type: "p", text: "Le client dispose d'un délai de 14 jours à compter de la réception de la commande pour retourner un article." },
      { type: "h", text: "Les articles doivent être :" },
      { type: "list", items: ["dans leur état d'origine ;", "non portés ;", "retournés dans leur emballage d'origine."] },
      {
        type: "p",
        text: "Les frais de retour sont à la charge du client. Le remboursement est effectué dans un délai maximum de 30 jours après réception et vérification des articles retournés.",
      },
    ],
  },
  {
    title: "Article 5. Garantie et responsabilité",
    blocks: [
      { type: "h", text: "Le Mini Gang ne peut être tenu responsable :" },
      { type: "list", items: ["des défauts liés à l'usage précédent des articles ;", "des dommages indirects liés à l'utilisation des articles."] },
      { type: "p", text: "Les vêtements envoyés pour rachat restent sous la responsabilité du vendeur jusqu'à leur réception et validation par le Mini Gang." },
    ],
  },
  {
    title: "Article 6. Paiement",
    blocks: [
      { type: "p", text: "Le paiement des commandes peut être effectué par carte bancaire via Stripe." },
      { type: "h", text: "Pour les vêtements rachetés par Le Mini Gang, le client peut choisir :" },
      { type: "list", items: ["de conserver le montant sur sa cagnotte Mini Gang ;", "ou de transférer le montant directement sur son compte bancaire."] },
    ],
  },
  {
    title: "Article 7. Informatique et protection des données",
    blocks: [
      { type: "p", text: "Les données personnelles collectées sont utilisées uniquement pour le traitement des commandes et des rachats." },
      { type: "p", text: "Elles sont traitées conformément à la Loi fédérale suisse sur la protection des données (LPD)." },
      { type: "p", text: "Le client dispose d'un droit d'accès, de rectification et de suppression de ses données." },
    ],
  },
  {
    title: "Article 8. Offres promotionnelles et lutte contre la fraude",
    blocks: [
      { type: "h", text: "8.1 Usage personnel et unique" },
      {
        type: "p",
        text: "Les bons de réduction, codes promotionnels et offres de bienvenue émis par Le Mini Gang sont strictement personnels et limités à une seule utilisation par personne physique : même nom, même adresse ou même terminal de connexion.",
      },
      { type: "h", text: "8.2 Interdiction des comptes multiples" },
      { type: "p", text: "Il est strictement interdit pour une même personne physique :" },
      { type: "list", items: ["de créer plusieurs comptes clients ;", "d'utiliser plusieurs adresses email dans le but de bénéficier plusieurs fois d'une même offre promotionnelle ou d'un avantage réservé aux nouveaux clients."] },
    ],
  },
  { title: "Article 9. Force majeure", blocks: [{ type: "p", text: "Le Mini Gang ne pourra être tenu responsable de la non-exécution de ses obligations en cas de force majeure : grève, perturbation des transports, catastrophe naturelle, incendie, etc." }] },
  { title: "Article 10. Intégralité du contrat", blocks: [{ type: "p", text: "Les présentes conditions générales de vente, le récapitulatif de commande et la facture constituent l'intégralité de l'accord entre le client et Le Mini Gang." }] },
  { title: "Article 11. Loi applicable et juridiction compétente", blocks: [{ type: "p", text: "Les présentes conditions générales de vente sont régies par le droit suisse." }, { type: "p", text: "En cas de litige, les tribunaux compétents seront ceux du canton du siège du Mini Gang, après tentative de résolution amiable." }] },
];

function LegalArticle({ title, blocks }: { title: string; blocks: LegalBlock[] }) {
  return (
    <article className="border-t border-[#bfdcc8] py-7 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold tracking-tight text-[#164832]">{title}</h2>
      <div className="mt-4 space-y-4 text-[0.96rem] leading-7 text-[#255d43]">
        {blocks.map((block, index) => {
          if (block.type === "h") {
            return (
              <h3 key={`${title}-${index}`} className="pt-2 text-base font-semibold text-[#164832]">
                {block.text}
              </h3>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={`${title}-${index}`} className="list-disc space-y-2 pl-6">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={`${title}-${index}`}>{block.text}</p>;
        })}
      </div>
    </article>
  );
}

export default function CgvPage() {
  return (
    <section className="bg-[#edf6ef] px-4 py-10 text-[#164832] md:px-6 md:py-14" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4b7c60]">Le Mini Gang</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Conditions Générales de Vente</h1>
        <div className="mt-10 rounded-lg border border-[#bfdcc8] bg-[#f7fbf8] px-5 py-8 md:px-10 md:py-10">
          {articles.map((article) => (
            <LegalArticle key={article.title} title={article.title} blocks={article.blocks} />
          ))}
        </div>
      </div>
    </section>
  );
}
