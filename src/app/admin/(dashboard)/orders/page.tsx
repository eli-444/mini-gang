import Link from "next/link";
import { listAdminOrders } from "@/lib/admin-data";
import { toChf } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number((Array.isArray(params.page) ? params.page[0] : params.page) ?? 1);
  const data = await listAdminOrders(Number.isNaN(page) ? 1 : page, 20);
  const hasPrev = data.page > 1;
  const hasNext = data.page * data.pageSize < data.total;

  return (
    <div className="space-y-5">
      <div className="admin-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Commandes</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Suivi des achats</h1>
        </div>
        <Link href="/api/admin/orders" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
          Export JSON
        </Link>
      </div>

      <section className="admin-table-wrap">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Liste</p>
          <h2 className="text-lg font-bold text-slate-950">{data.total} commande(s)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Commande</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Montant</th>
                <th className="px-3 py-2">Paiement</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Livraison</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{order.id.slice(0, 8)}</td>
                  <td className="px-3 py-2">{order.email}</td>
                  <td className="px-3 py-2">{toChf(order.amount_total_cents)}</td>
                  <td className="px-3 py-2">{order.provider}</td>
                  <td className="px-3 py-2">
                    <span className={`admin-status ${order.status}`}>{order.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`admin-status ${order.shipments?.[0]?.status ?? "pending"}`}>{order.shipments?.[0]?.status ?? "pending"}</span>
                  </td>
                  <td className="px-3 py-2">{new Date(order.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-slate-900 underline underline-offset-4">
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucune commande.</p> : null}
      </section>

      <div className="flex justify-end gap-2 text-slate-700">
        <Link
          href={`/admin/orders?page=${Math.max(1, data.page - 1)}`}
          className={`rounded-md border px-3 py-1.5 text-sm ${hasPrev ? "border-slate-300 text-slate-700" : "pointer-events-none border-slate-100 text-slate-300"}`}
        >
          Précédent
        </Link>
        <Link
          href={`/admin/orders?page=${data.page + 1}`}
          className={`rounded-md border px-3 py-1.5 text-sm ${hasNext ? "border-slate-300 text-slate-700" : "pointer-events-none border-slate-100 text-slate-300"}`}
        >
          Suivant
        </Link>
      </div>
    </div>
  );
}
