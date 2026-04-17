import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toChf } from "@/lib/utils";

const currentStatuses = new Set(["en_attente", "payee", "preparee", "envoyee"]);

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  payee: "Payee",
  preparee: "Preparee",
  envoyee: "Envoyee",
  livree: "Livree",
  annulee: "Annulee",
  remboursee: "Remboursee",
};

type OrderItem = {
  id: string;
  nom_vetement: string;
  taille: string;
  prix_centimes: number;
};

type AccountOrder = {
  id: string;
  statut: string;
  total_centimes: number;
  cree_le: string;
  articles_commande?: OrderItem[];
  shipments?: Array<{ id: string; carrier: string; status: string; tracking_number: string | null; tracking_url: string | null }>;
};

function OrderList({ orders, emptyLabel }: { orders: AccountOrder[]; emptyLabel: string }) {
  if (orders.length === 0) {
    return <p className="rounded-xl border border-dashed border-[var(--mg-ring)] p-4 text-sm text-[var(--mg-ink)]/70">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="rounded-xl border border-[var(--mg-ring)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[var(--mg-ink)]">Commande {order.id.slice(0, 8)}</h3>
              <p className="mt-1 text-xs text-[var(--mg-ink)]/60">
                {new Date(order.cree_le).toLocaleDateString("fr-CH")} - {toChf(order.total_centimes)}
              </p>
            </div>
            <span className="rounded-full border border-[var(--mg-ring)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--mg-ink)]">
              {statusLabels[order.statut] ?? order.statut}
            </span>
          </div>

          <ul className="mt-3 space-y-2 text-sm text-[var(--mg-ink)]/75">
            {(order.articles_commande ?? []).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/[0.03] px-3 py-2">
                <span>
                  {item.nom_vetement} - {item.taille}
                </span>
                <span className="font-semibold">{toChf(item.prix_centimes)}</span>
              </li>
            ))}
          </ul>

          {(order.shipments ?? []).map((shipment) => (
            <p key={shipment.id} className="mt-3 rounded-lg border border-[var(--mg-ring)] px-3 py-2 text-xs text-[var(--mg-ink)]/70">
              Tracking: {shipment.carrier} - {shipment.tracking_number ?? shipment.status}
            </p>
          ))}

          <Link href={`/mon-compte/commandes/${order.id}`} className="mt-3 inline-flex text-xs font-semibold text-[var(--mg-accent-strong)] underline">
            Detail et SAV
          </Link>
        </article>
      ))}
    </div>
  );
}

export default async function MonCompteCommandesPage() {
  const { user } = await requireUser("/auth/login");
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("commandes")
    .select("id,statut,total_centimes,cree_le,articles_commande(id,nom_vetement,taille,prix_centimes),shipments(id,carrier,status,tracking_number,tracking_url)")
    .eq("utilisateur_id", user.id)
    .order("cree_le", { ascending: false });

  const orders = (data ?? []) as AccountOrder[];
  const currentOrders = orders.filter((order) => currentStatuses.has(order.statut));
  const pastOrders = orders.filter((order) => !currentStatuses.has(order.statut));

  return (
    <section className="mg-shell rounded-[18px] bg-white p-5">
      <h2 className="text-lg font-semibold text-[var(--mg-ink)]">Commandes</h2>
      <p className="mt-1 text-sm text-[var(--mg-ink)]/70">Suivez vos commandes en cours et retrouvez votre historique.</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">
            Commandes en cours
          </h3>
          <OrderList orders={currentOrders} emptyLabel="Aucune commande en cours." />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">
            Commandes passees
          </h3>
          <OrderList orders={pastOrders} emptyLabel="Aucune commande passee pour le moment." />
        </div>
      </div>
    </section>
  );
}
