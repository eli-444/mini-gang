import { listProcurements } from "@/lib/admin-data";
import { toChf } from "@/lib/utils";

export default async function AdminProcurementPage() {
  const rows = await listProcurements();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Supply</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Rachat / Approvisionnement</h1>
      </div>
      <section className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Lot</th>
              <th className="px-3 py-2">Vendeur</th>
              <th className="px-3 py-2">Cout total</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{row.id.slice(0, 8)}</td>
                <td className="px-3 py-2">{Array.isArray(row.sellers) ? row.sellers[0]?.name ?? "-" : "-"}</td>
                <td className="px-3 py-2">{toChf(row.total_cost_cents ?? 0)}</td>
                <td className="px-3 py-2">{row.procurement_items?.length ?? 0}</td>
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun lot de rachat.</p> : null}
      </section>
    </div>
  );
}
