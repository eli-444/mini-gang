import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin-data";
import { toChf } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
};

type ProgressLineProps = {
  label: string;
  value: number;
  max: number;
  tone?: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="admin-kpi p-4">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </article>
  );
}

function ProgressLine({ label, value, max, tone = "bg-[#164f31]" }: ProgressLineProps) {
  const percent = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group block border-b border-slate-200 py-3 text-sm font-bold text-slate-950 last:border-b-0 hover:text-[#164f31]"
    >
      {label}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics(30);

  const orderLines = [
    { label: "En attente", value: metrics.ordersByStatus.en_attente, tone: "bg-amber-400" },
    { label: "Payées", value: metrics.ordersByStatus.payee, tone: "bg-emerald-500" },
    { label: "Préparées", value: metrics.ordersByStatus.preparee, tone: "bg-sky-500" },
    { label: "Envoyées", value: metrics.ordersByStatus.envoyee, tone: "bg-indigo-500" },
    { label: "Livrées", value: metrics.ordersByStatus.livree, tone: "bg-slate-700" },
    {
      label: "Annulées / remboursées",
      value: metrics.ordersByStatus.annulee + metrics.ordersByStatus.remboursee,
      tone: "bg-rose-400",
    },
  ];
  const maxOrders = Math.max(...orderLines.map((line) => line.value), 1);

  const stockLines = [
    { label: "En ligne", value: metrics.stock.active, tone: "bg-[#164f31]" },
    { label: "Brouillons", value: metrics.stock.draft, tone: "bg-amber-400" },
    { label: "Reserves", value: metrics.stock.reserved, tone: "bg-sky-500" },
    { label: "Hors ligne", value: metrics.stock.offline, tone: "bg-slate-400" },
    { label: "Vendus", value: metrics.stock.sold, tone: "bg-indigo-500" },
    { label: "Archives", value: metrics.stock.archived, tone: "bg-slate-700" },
  ];
  const maxStock = Math.max(...stockLines.map((line) => line.value), 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Vue globale</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Tableau de bord</h1>
        </div>
        <Link href="/admin/products/new" className="rounded-md bg-[#164f31] px-4 py-2 text-sm font-bold text-white">
          Ajouter un vêtement
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="CA 30 jours" value={toChf(metrics.cards.revenueCents)} />
        <MetricCard label="Commandes payées" value={String(metrics.cards.ordersPaid)} />
        <MetricCard label="A preparer" value={String(metrics.alerts.paidToPrepare)} />
        <MetricCard label="Articles en ligne" value={String(metrics.stock.active)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <article className="admin-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Commandes</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">Statuts des 30 derniers jours</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
              {metrics.cards.ordersPending} en attente
            </span>
          </div>
          <div className="mt-6 grid gap-4">
            {orderLines.map((line) => (
              <ProgressLine key={line.label} label={line.label} value={line.value} max={maxOrders} tone={line.tone} />
            ))}
          </div>
        </article>

        <article className="admin-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Priorites</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">A verifier ce jour</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-2xl font-bold text-slate-950">{metrics.alerts.paidToPrepare}</p>
              <p className="text-sm text-slate-500">commande(s) a preparer</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-2xl font-bold text-slate-950">{metrics.alerts.reservedProducts}</p>
              <p className="text-sm text-slate-500">vêtement(s) réservés</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-2xl font-bold text-slate-950">{metrics.alerts.draftProducts}</p>
              <p className="text-sm text-slate-500">brouillon(s) à compléter</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <article className="admin-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Stock</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Repartition des fiches</h2>
          <div className="mt-6 grid gap-4">
            {stockLines.map((line) => (
              <ProgressLine key={line.label} label={line.label} value={line.value} max={maxStock} tone={line.tone} />
            ))}
          </div>
        </article>

        <article className="admin-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Acces rapides</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Opérations courantes</h2>
          <div className="mt-4">
            <ActionLink href="/admin/products/new" label="Ajouter une fiche vêtement" />
            <ActionLink href="/admin/products" label="Gerer le stock" />
            <ActionLink href="/admin/orders" label="Suivre les commandes" />
            <ActionLink href="/admin/settings" label="Réglages boutique" />
          </div>
        </article>
      </section>
    </div>
  );
}
