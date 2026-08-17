import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { listAdminProducts } from "@/lib/admin-data";
import { getProductCategoryLabel } from "@/lib/product-categories";
import { adminProductStatusOptions, getProductConditionLabel, getProductSeasonLabel, getProductStatusLabel } from "@/lib/product-options";
import { toChf } from "@/lib/utils";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number((Array.isArray(params.page) ? params.page[0] : params.page) ?? 1);
  const query = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const status = (Array.isArray(params.status) ? params.status[0] : params.status) ?? "";
  const data = await listAdminProducts({ page: Number.isNaN(page) ? 1 : page, pageSize: 20, query, status });
  const hasPrev = data.page > 1;
  const hasNext = data.page * data.pageSize < data.total;
  const statusLabel = status ? (adminProductStatusOptions.find((item) => item.value === status)?.label ?? status) : "Tous statuts";

  const qs = new URLSearchParams();
  if (query) qs.set("q", query);
  if (status) qs.set("status", status);

  return (
    <div className="space-y-5">
      <div className="admin-card overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Stock & catalogue</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Vêtements</h1>
          </div>
          <Link href="/admin/products/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            Ajouter un vêtement
          </Link>
        </div>

        <div className="grid gap-3 px-5 py-4 text-sm text-slate-700 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Total filtre</span>
            <strong className="mt-1 block text-2xl text-slate-950">{data.total}</strong>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Page</span>
            <strong className="mt-1 block text-2xl text-slate-950">{data.page}</strong>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Vue</span>
            <strong className="mt-1 block text-2xl text-slate-950">{statusLabel}</strong>
          </div>
        </div>
      </div>

      <form className="admin-card p-4">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Recherche rapide</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Filtrer le stock</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="grid gap-1 text-sm font-bold text-slate-800">
            Nom ou marque
            <input
              name="q"
              defaultValue={query}
              placeholder="Marque ou nom"
              className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-800">
            Statut
            <select name="status" defaultValue={status} className="rounded-md border border-slate-200 px-3 py-2.5 text-sm">
              <option value="">Tous statuts</option>
              {adminProductStatusOptions.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="self-end rounded-md bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
            Filtrer
          </button>
        </div>
      </form>

      <section className="admin-table-wrap">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Inventaire</p>
            <h2 className="text-lg font-bold text-slate-950">Fiches vêtements</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Produit</th>
                <th className="px-3 py-2">Référence</th>
                <th className="px-3 py-2">Marque</th>
                <th className="px-3 py-2">Taille/Âge</th>
                <th className="px-3 py-2">Catégorie</th>
                <th className="px-3 py-2">Saison</th>
                <th className="px-3 py-2">Emplacement</th>
                <th className="px-3 py-2">État</th>
                <th className="px-3 py-2">Prix</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Ajouté</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{product.title}</td>
                  <td className="px-3 py-2">{product.reference_code ?? "-"}</td>
                  <td className="px-3 py-2">{product.brand ?? "-"}</td>
                  <td className="px-3 py-2">
                    {product.size_label ?? "-"} / {product.age_range ?? "-"}
                  </td>
                  <td className="px-3 py-2">{getProductCategoryLabel(product.categorie)}</td>
                  <td className="px-3 py-2">{getProductSeasonLabel(product.season)}</td>
                  <td className="px-3 py-2">{product.stock_location ?? "-"}</td>
                  <td className="px-3 py-2">{getProductConditionLabel(product.condition)}</td>
                  <td className="px-3 py-2">{toChf(product.price_cents)}</td>
                  <td className="px-3 py-2">
                    <span className={`admin-status ${product.status}`}>{getProductStatusLabel(product.status)}</span>
                  </td>
                  <td className="px-3 py-2">{new Date(product.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/products/${product.id}`} className="font-semibold text-slate-900 underline underline-offset-4">
                        Éditer
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun produit.</p> : null}
      </section>

      <div className="flex items-center justify-end gap-2 text-slate-700">
        <Link
          href={`/admin/products?${(() => {
            const p = new URLSearchParams(qs);
            p.set("page", String(Math.max(1, data.page - 1)));
            return p.toString();
          })()}`}
          className={`rounded-md border px-3 py-1.5 text-sm ${hasPrev ? "border-slate-300 text-slate-700" : "pointer-events-none border-slate-100 text-slate-300"}`}
        >
          Précédent
        </Link>
        <Link
          href={`/admin/products?${(() => {
            const p = new URLSearchParams(qs);
            p.set("page", String(data.page + 1));
            return p.toString();
          })()}`}
          className={`rounded-md border px-3 py-1.5 text-sm ${hasNext ? "border-slate-300 text-slate-700" : "pointer-events-none border-slate-100 text-slate-300"}`}
        >
          Suivant
        </Link>
      </div>
    </div>
  );
}
