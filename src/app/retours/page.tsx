const rules = [
  "Contactez Le Mini Gang depuis le detail de commande ou par email avant tout renvoi.",
  "Le probleme doit etre signale rapidement apres reception, avec description et photos si utile.",
  "Les articles doivent rester dans l'etat recu: non portes apres livraison, non laves, non modifies.",
  "Un retour peut etre accepte en cas d'erreur d'article, defaut important non signale ou non-conformite manifeste a la fiche.",
  "Les traces normales d'usage visibles sur photos ou decrites dans la fiche ne constituent pas automatiquement un motif de retour.",
  "Le remboursement est effectue apres reception et controle de l'article retourne, selon la decision SAV.",
];

export default function RetoursPage() {
  return (
    <section className="mx-auto max-w-3xl py-6 md:py-10">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--mg-pop-sun)]">SAV</p>
      <h1 className="mt-6 text-4xl font-black leading-tight text-[var(--mg-ink)] md:text-5xl">Retours et reclamations</h1>
      <p className="mt-5 text-sm leading-6 text-[var(--mg-ink)]/75">
        Les vetements sont des pieces uniques de seconde main. Les retours sont donc encadres pour proteger les clientes et la boutique.
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
