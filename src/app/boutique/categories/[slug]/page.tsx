interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Catégorie : {slug.replace(/-/g, " ")}
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Sélection de vêtements pour la tranche d&apos;âge correspondant à cette catégorie.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-orange-200 p-4 text-xs text-neutral-500">
        Grille de produits filtrés par catégorie à venir.
      </div>
    </div>
  );
}
