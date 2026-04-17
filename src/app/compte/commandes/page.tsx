export default function CommandesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Mes commandes
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Historique de toutes tes commandes passées sur le Mini Gang.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-orange-200 p-4 text-xs text-neutral-500">
        Liste des commandes à venir (connexion Prisma).
      </div>
    </div>
  );
}
