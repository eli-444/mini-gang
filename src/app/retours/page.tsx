const rules = [
  "Contactez Le Mini Gang depuis le détail de commande ou par email avant tout renvoi.",
  "Le problème doit être signalé rapidement après réception, avec description et photos si utile.",
  "Les articles doivent rester dans l'état reçu: non portés après livraison, non lavés, non modifiés.",
  "Un retour peut être accepté en cas d'erreur d'article, défaut important non signalé ou non-conformité manifeste à la fiche.",
  "Les traces normales d'usage visibles sur photos ou décrites dans la fiche ne constituent pas automatiquement un motif de retour.",
  "Le remboursement est effectué après réception et contrôle de l'article retourné, selon la décision SAV.",
];

export default function RetoursPage() {
  return (
    <section className="mx-auto max-w-3xl py-6 md:py-10">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">SAV</p>
      <h1 className="mt-6 text-4xl font-black leading-tight text-[var(--mg-ink)] md:text-5xl">Retours et réclamations</h1>
      <p className="mt-5 text-sm leading-6 text-[var(--mg-ink)]/75">
        Les vêtements sont des pièces uniques de seconde main. Les retours sont donc encadrés pour protéger les clientes et la boutique.
      </p>
      <ul className="mt-8 space-y-3">
        {rules.map((rule) => (
          <li key={rule} className="rounded-lg border border-[var(--mg-ring)] bg-white p-4 text-sm text-[var(--mg-ink)]/75">
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
