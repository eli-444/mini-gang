import { getDashboardMetrics } from "@/lib/admin-data";

export default async function AdminAnalyticsPage() {
  const metrics = await getDashboardMetrics(30);
  const stockLines = [
    { label: "Disponible", value: metrics.stock.active },
    { label: "Reserve", value: metrics.stock.reserved },
    { label: "Vendu", value: metrics.stock.sold },
    { label: "Brouillon", value: metrics.stock.draft },
    { label: "Archive", value: metrics.stock.archived },
  ];
  const stockTotal = Math.max(stockLines.reduce((sum, line) => sum + line.value, 0), 1);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Insights</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Analytics</h1>
      </div>
      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Stock par statut</h2>
        <div className="mt-4 space-y-3">
          {stockLines.map((line) => (
            <div key={line.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{line.label}</span>
                <strong>{line.value}</strong>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${(line.value / stockTotal) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="admin-kpi p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Clients</p>
          <p className="mt-2 text-2xl font-bold">{metrics.cards.users}</p>
        </article>
        <article className="admin-kpi p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Commandes payees</p>
          <p className="mt-2 text-2xl font-bold">{metrics.cards.ordersPaid}</p>
        </article>
        <article className="admin-kpi p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Commandes en attente</p>
          <p className="mt-2 text-2xl font-bold">{metrics.cards.ordersPending}</p>
        </article>
      </section>
    </div>
  );
}
