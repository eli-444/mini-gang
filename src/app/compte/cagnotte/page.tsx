export default function CagnottePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Ma cagnotte Mini Gang
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Consulte ton solde, l&apos;historique des mouvements et les règles du +30% en cas de rachat en cagnotte.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-orange-200 p-4 text-xs text-neutral-500">
        Journal de mouvements à venir (crédit/débit cagnotte).
      </div>
    </div>
  );
}
