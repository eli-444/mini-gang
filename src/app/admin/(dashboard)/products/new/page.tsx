import { NewProductForm } from "@/components/admin/new-product-form";

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = (Array.isArray(params.category) ? params.category[0] : params.category) || "tee_shirts";

  return (
    <section>
      <div className="admin-card overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Nouvelle piece</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Ajouter un vêtement</h1>
        </div>
      </div>
      <NewProductForm defaultCategory={category} />
    </section>
  );
}
