import { listShipments } from "@/lib/admin-data";

export default async function AdminShipmentsPage() {
  const shipments = await listShipments();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Shipping</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Livraisons</h1>
      </div>
      <section className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Commande</th>
              <th className="px-3 py-2">Transporteur</th>
              <th className="px-3 py-2">Tracking</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Date expedition</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{shipment.order_id.slice(0, 8)}</td>
                <td className="px-3 py-2">{shipment.carrier ?? "-"}</td>
                <td className="px-3 py-2">{shipment.tracking_number ?? "-"}</td>
                <td className="px-3 py-2">
                  <span className={`admin-status ${shipment.status}`}>{shipment.status}</span>
                </td>
                <td className="px-3 py-2">{shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleDateString("fr-FR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucune livraison.</p> : null}
      </section>
    </div>
  );
}
