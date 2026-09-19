import Link from "next/link";
import { listReturns } from "@/lib/admin-data";
import { ReturnStatusForm } from "@/components/admin/return-status-form";

export default async function AdminReturnsPage() {
  const returns = await listReturns();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">After sales</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Retours (RMA)</h1>
        <p className="mt-2 text-sm text-slate-500">{returns.length} demande(s) reçue(s)</p>
      </div>
      <section className="admin-table-wrap">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Retour</th>
                <th className="px-3 py-2">Client / commande</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Motif</th>
                <th className="px-3 py-2">Message du client</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Traitement</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => (
                <tr key={ret.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-medium">{ret.id.slice(0, 8)}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{ret.customer_email ?? "Client inconnu"}</p>
                    <Link href={`/admin/orders/${ret.order_id}`} className="text-xs text-slate-500 underline underline-offset-2">
                      Commande {ret.order_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`admin-status ${ret.status}`}>{ret.status}</span>
                  </td>
                  <td className="max-w-56 whitespace-pre-wrap break-words px-3 py-3">{ret.reason || "-"}</td>
                  <td className="max-w-96 whitespace-pre-wrap break-words px-3 py-3 leading-6 text-slate-700">{ret.message || "-"}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(ret.created_at).toLocaleString("fr-CH", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-3 py-3">
                    <ReturnStatusForm
                      returnId={ret.id}
                      initialStatus={ret.status}
                      initialNotes={ret.admin_notes}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {returns.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun retour.</p> : null}
      </section>
    </div>
  );
}
