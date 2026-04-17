import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin-data";
import { toChf } from "@/lib/utils";

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="admin-kpi p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const periodParam = Array.isArray(params.period) ? params.period[0] : params.period;
  const periodDays = periodParam === "7d" ? 7 : periodParam === "90d" ? 90 : 30;
  const metrics = await getDashboardMetrics(periodDays);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Operations</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
            Ajouter produit
          </Link>
          <Link href="/admin/orders" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">
            Voir commandes
          </Link>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="CA" value={toChf(metrics.cards.revenueCents)} />
        <MetricCard label="Panier moyen" value={toChf(metrics.cards.aovCents)} />
        <MetricCard label="Commandes payees" value={String(metrics.cards.ordersPaid)} />
        <MetricCard label="Commandes en attente" value={String(metrics.cards.ordersPending)} />
        <MetricCard label="Clients" value={String(metrics.cards.users)} />
        <MetricCard label="Admins" value={String(metrics.cards.admins)} />
        <MetricCard label="Commandes annulees" value={String(metrics.cards.failedPayments)} />
        <MetricCard label="Stock dispo / reserve / vendu" value={`${metrics.stock.active} / ${metrics.stock.reserved} / ${metrics.stock.sold}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Commandes par statut</h2>
          <div className="mt-3 grid gap-2">
            {Object.entries(metrics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-sm">
                <span>{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Alertes boutique</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="rounded-md bg-blue-50 p-2 text-blue-900">Commandes payees a preparer: {metrics.alerts.paidToPrepare}</p>
            <p className="rounded-md bg-amber-50 p-2 text-amber-900">Vetements reserves: {metrics.alerts.reservedProducts}</p>
            <p className="rounded-md bg-rose-50 p-2 text-rose-900">Brouillons catalogue: {metrics.alerts.draftProducts}</p>
          </div>
        </article>
      </section>
    </div>
  );
}
