import { ShopClosedPage } from "@/components/shop-closed-page";
import { getSiteContentSettings } from "@/lib/site-content-settings";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return <ShopClosedPage message={settings.shop_closed_message} reopenDate={settings.shop_reopen_date} />;
  }

  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
        Catégorie : {slug.replace(/-/g, " ")}
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Sélection de vêtements pour cette catégorie.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-orange-200 p-4 text-xs text-neutral-500">
        Grille de produits filtrés par catégorie à venir.
      </div>
    </div>
  );
}
