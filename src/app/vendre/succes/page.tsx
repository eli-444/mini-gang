import Link from "next/link";

export default function VendreSuccesPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">Dossier de vente cree</h1>
      <p className="mt-3 text-sm text-neutral-700">
        Votre bordereau PDF est disponible et vous a ete envoye par email. Vous pouvez suivre chaque etape depuis
        votre espace vendeur.
      </p>
      <Link
        href="/mon-compte/ventes"
        className="mt-6 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
      >
        Voir mes dossiers
      </Link>
    </div>
  );
}
