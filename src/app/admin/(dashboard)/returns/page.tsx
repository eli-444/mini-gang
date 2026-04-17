import { listReturns } from "@/lib/admin-data";
import { ReturnStatusForm } from "@/components/admin/return-status-form";

export default async function AdminReturnsPage() {
  const returns = await listReturns();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">After sales</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Retours (RMA)</h1>
      </div>
      <section className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Retour</th>
              <th className="px-3 py-2">Commande</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Raison</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => (
              <tr key={ret.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{ret.id.slice(0, 8)}</td>
                <td className="px-3 py-2">{ret.order_id.slice(0, 8)}</td>
                <td className="px-3 py-2">
                  <span className={`admin-status ${ret.status}`}>{ret.status}</span>
                </td>
                <td className="px-3 py-2">{ret.reason ?? "-"}</td>
                <td className="px-3 py-2">{new Date(ret.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-3 py-2"><ReturnStatusForm returnId={ret.id} initialStatus={ret.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {returns.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun retour.</p> : null}
      </section>
    </div>
  );
}
