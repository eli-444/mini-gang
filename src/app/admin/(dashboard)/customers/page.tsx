import { listCustomers } from "@/lib/admin-data";
import { toChf } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-5">
      <div className="admin-card p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Clients</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Comptes et achats</h1>
      </div>

      <section className="admin-table-wrap">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Liste</p>
          <h2 className="text-lg font-bold text-slate-950">{customers.length} compte(s)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Telephone</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Commandes</th>
                <th className="px-3 py-2">Commandes payees</th>
                <th className="px-3 py-2">Total depense</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.email} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">
                    {[customer.prenom, customer.nom].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-3 py-2 font-medium">{customer.email}</td>
                  <td className="px-3 py-2">{customer.telephone ?? "-"}</td>
                  <td className="px-3 py-2">{customer.role}</td>
                  <td className="px-3 py-2">{customer.orders}</td>
                  <td className="px-3 py-2">{customer.paidOrders}</td>
                  <td className="px-3 py-2">{toChf(customer.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun client.</p> : null}
      </section>
    </div>
  );
}
