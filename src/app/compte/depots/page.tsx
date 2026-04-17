export default function DepotsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Mes dépôts
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Suis l&apos;état de tes dépôts Mini Gang : reçu, en cours de tri, mis en ligne, racheté.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-orange-200 p-4 text-xs text-neutral-500">
        Liste des dépôts à venir (connexion Prisma).
      </div>
    </div>
  );
}
