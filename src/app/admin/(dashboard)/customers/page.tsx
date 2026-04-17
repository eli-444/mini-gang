import { listCustomers } from "@/lib/admin-data";
import { toChf } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">CRM</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Clients</h1>
      </div>
      <section className="admin-table-wrap">
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
        {customers.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun client.</p> : null}
      </section>
    </div>
  );
}
