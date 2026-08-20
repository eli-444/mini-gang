import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toChf } from "@/lib/utils";

const currentStatuses = new Set(["en_attente", "payee", "preparee", "envoyee"]);

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  payee: "Payée",
  preparee: "Préparée",
  envoyee: "Envoyée",
  livree: "Livrée",
  annulee: "Annulée",
  remboursee: "Remboursée",
};

type OrderItem = {
  id: string;
  nom_vetement: string;
  taille: string;
  prix_centimes: number;
  quantite?: number | null;
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
    return <p className="border-l-4 border-[var(--mg-pop-rose)] py-2 pl-4 text-base font-semibold leading-7 text-[var(--mg-ink)]/68">{emptyLabel}</p>;
  }

  return (
    <div className="border-t-2 border-[var(--mg-ring)]">
      {orders.map((order) => (
        <article key={order.id} className="border-b-2 border-[var(--mg-ring)] py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black leading-tight text-[var(--mg-ink)]">Commande {order.id.slice(0, 8)}</h3>
              <p className="mt-1 text-base font-semibold text-[var(--mg-ink)]/62">
                {new Date(order.cree_le).toLocaleDateString("fr-CH")} - {toChf(order.total_centimes)}
              </p>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-accent-strong)]">
              {statusLabels[order.statut] ?? order.statut}
            </span>
          </div>

          <ul className="mt-4 space-y-2 text-base text-[var(--mg-ink)]/78">
            {(order.articles_commande ?? []).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--mg-ring)] pl-3">
                <span>
                  {item.nom_vetement}{item.taille ? ` - ${item.taille}` : ""}{(item.quantite ?? 1) > 1 ? ` Ã— ${item.quantite}` : ""}
                </span>
                <span className="font-semibold">{toChf(item.prix_centimes * (item.quantite ?? 1))}</span>
              </li>
            ))}
          </ul>

          {(order.shipments ?? []).map((shipment) => (
            <p key={shipment.id} className="mt-4 border-l-2 border-[var(--mg-ring)] pl-3 text-base font-semibold text-[var(--mg-ink)]/70">
              Tracking: {shipment.carrier} - {shipment.tracking_number ?? shipment.status}
            </p>
          ))}

          <Link href={`/mon-compte/commandes/${order.id}`} className="mt-4 inline-flex text-base font-black text-[var(--mg-accent-strong)] underline">
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
    .select("id,statut,total_centimes,cree_le,articles_commande(id,nom_vetement,taille,prix_centimes,quantite),shipments(id,carrier,status,tracking_number,tracking_url)")
    .eq("utilisateur_id", user.id)
    .order("cree_le", { ascending: false });

  const orders = (data ?? []) as AccountOrder[];
  const currentOrders = orders.filter((order) => currentStatuses.has(order.statut));
  const pastOrders = orders.filter((order) => !currentStatuses.has(order.statut));

  return (
    <section className="bg-[var(--mg-surface)] px-5 py-6 text-[var(--mg-ink)] md:px-8 md:py-8">
      <h2 className="text-2xl font-black leading-tight md:text-3xl">Commandes</h2>

      <div className="mt-7 grid gap-9 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">
            Commandes en cours
          </h3>
          <OrderList orders={currentOrders} emptyLabel="Aucune commande en cours." />
        </div>

        <div>
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">
            Commandes passées
          </h3>
          <OrderList orders={pastOrders} emptyLabel="Aucune commande passée pour le moment." />
        </div>
      </div>
    </section>
  );
}
