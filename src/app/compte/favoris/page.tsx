export default function FavorisPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Mes favoris
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Retrouve ici les pièces que tu as ajoutées en favori.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-orange-200 p-4 text-xs text-neutral-500">
        Liste des favoris à venir (connexion Prisma).
      </div>
    </div>
  );
}
