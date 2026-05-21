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

function ActionLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-slate-200 bg-white/70 p-3 transition hover:border-slate-300 hover:bg-white">
      <span className="block text-sm font-bold text-slate-900">{label}</span>
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics(30);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Administration</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Accueil admin</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Resume simple de la boutique. Les chiffres de vente portent sur les 30 derniers jours.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="CA 30 jours" value={toChf(metrics.cards.revenueCents)} />
        <MetricCard label="Commandes payees" value={String(metrics.cards.ordersPaid)} />
        <MetricCard label="A preparer" value={String(metrics.alerts.paidToPrepare)} />
        <MetricCard label="Articles en ligne" value={String(metrics.stock.active)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Actions utiles</h2>
          <div className="mt-4 grid gap-3">
            <ActionLink href="/admin/products/new" label="Ajouter une fiche vetement" hint="Creer un article pour le stock ou la boutique." />
            <ActionLink href="/admin/products" label="Gerer les vetements" hint="Modifier les fiches, statuts, prix, photos et emplacements." />
            <ActionLink href="/admin/orders" label="Suivre les commandes" hint="Voir les commandes payees, preparees ou envoyees." />
            <ActionLink href="/admin/settings" label="Reglages boutique" hint="Ouvrir ou fermer les commandes et le rachat." />
          </div>
        </article>

        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">A surveiller</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
              <span>Commandes a preparer</span>
              <strong>{metrics.alerts.paidToPrepare}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
              <span>Vetements reserves</span>
              <strong>{metrics.alerts.reservedProducts}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
              <span>Brouillons catalogue</span>
              <strong>{metrics.alerts.draftProducts}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stock</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <MetricCard label="En ligne" value={String(metrics.stock.active)} />
          <MetricCard label="Reserve" value={String(metrics.stock.reserved)} />
          <MetricCard label="Vendu" value={String(metrics.stock.sold)} />
          <MetricCard label="Brouillon" value={String(metrics.stock.draft)} />
          <MetricCard label="Archive" value={String(metrics.stock.archived)} />
        </div>
      </section>
    </div>
  );
}
