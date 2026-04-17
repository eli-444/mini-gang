interface CommandeDetailPageProps {
  params: { id: string };
}

export default function CommandeDetailPage({ params }: CommandeDetailPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Commande #{params.id}
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Détail complet de la commande (lignes, montants, adresse, paiement).
      </p>
    </div>
  );
}
