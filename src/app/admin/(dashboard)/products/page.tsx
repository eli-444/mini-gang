import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { listAdminProducts } from "@/lib/admin-data";
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

  const qs = new URLSearchParams();
  if (query) qs.set("q", query);
  if (status) qs.set("status", status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Catalogue</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Produits</h1>
        </div>
        <Link href="/admin/products/new" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
          Nouveau produit
        </Link>
      </div>

      <form className="admin-card p-3">
        <div className="grid gap-2 md:grid-cols-[1fr,180px,auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Recherche titre ou marque"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <select name="status" defaultValue={status} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
            <option value="">Tous statuts</option>
            <option value="disponible">Disponible</option>
            <option value="reserve">Reserve</option>
            <option value="vendu">Vendu</option>
            <option value="brouillon">Brouillon</option>
            <option value="archive">Archive</option>
          </select>
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Filtrer
          </button>
        </div>
      </form>

      <section className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Produit</th>
              <th className="px-3 py-2">Marque</th>
              <th className="px-3 py-2">Taille/Age</th>
              <th className="px-3 py-2">Etat</th>
              <th className="px-3 py-2">Prix</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Ajoute</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{product.title}</td>
                <td className="px-3 py-2">{product.brand ?? "-"}</td>
                <td className="px-3 py-2">
                  {product.size_label ?? "-"} / {product.age_range ?? "-"}
                </td>
                <td className="px-3 py-2">{product.condition}</td>
                <td className="px-3 py-2">{toChf(product.price_cents)}</td>
                <td className="px-3 py-2">
                  <span className={`admin-status ${product.status}`}>{product.status}</span>
                </td>
                <td className="px-3 py-2">{new Date(product.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                  <Link href={`/admin/products/${product.id}`} className="text-slate-900 underline">
                    Editer
                  </Link>
                    <DeleteProductButton productId={product.id} productName={product.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          Precedent
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
