import { notFound } from "next/navigation";
import { AdminOrderActions } from "@/components/admin/order-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toChf } from "@/lib/utils";

type ShipmentRow = {
  id: string;
  carrier: string;
  status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  created_at?: string | null;
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const orderResult = await supabase
    .from("commandes")
    .select("*, articles_commande(*, vetements(reference_vetement,emplacement_stock)), shipments(*)")
    .eq("id", id)
    .maybeSingle();
  let order = orderResult.data;

  if (orderResult.error) {
    ({ data: order } = await supabase
      .from("commandes")
      .select("*, articles_commande(*), shipments(*)")
      .eq("id", id)
      .maybeSingle());
  }

  if (!order) notFound();
  const canGenerateShippingLabel = ["payee", "preparee", "envoyee", "livree"].includes(order.statut);
  const uniqueShipments = [...((order.shipments ?? []) as ShipmentRow[])]
    .sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime())
    .filter((shipment, index, shipments) => {
      const key = shipment.tracking_number ?? shipment.id;
      return shipments.findIndex((item) => (item.tracking_number ?? item.id) === key) === index;
    });
  const latestShipment = uniqueShipments.find((shipment) => shipment.tracking_number);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Détails commande</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Commande {order.id.slice(0, 8)}</h1>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Articles</h2>
          <div className="mt-3 space-y-2">
            {(order.articles_commande ?? []).map((item: {
              id: string;
              vetement_id: string | null;
              nom_vetement: string;
              prix_centimes: number;
              reference_vetement?: string | null;
              emplacement_stock?: string | null;
              vetements?: { reference_vetement?: string | null; emplacement_stock?: string | null } | null;
            }) => {
              const reference = item.reference_vetement ?? item.vetements?.reference_vetement ?? "-";
              const emplacement = item.emplacement_stock ?? item.vetements?.emplacement_stock ?? "-";

              return (
              <div
                key={item.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_96px_96px_auto] items-center gap-3 rounded-md border border-slate-100 p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{item.nom_vetement ?? item.vetement_id}</p>
                  <p className="hidden truncate text-xs leading-4 text-slate-500 min-[1180px]:block">{item.vetement_id ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.1em] text-slate-400">Référence</span>
                  <strong className="block truncate">{reference}</strong>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.1em] text-slate-400">Emplacement</span>
                  <strong className="block truncate">{emplacement}</strong>
                </div>
                <strong className="whitespace-nowrap text-right">{toChf(item.prix_centimes)}</strong>
              </div>
              );
            })}
          </div>
        </article>

        <article className="admin-card p-4 text-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Détails commande</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd>{order.email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Sous-total</dt><dd>{toChf(order.sous_total_centimes ?? Math.max(0, order.total_centimes - (order.frais_livraison_centimes ?? 0)))}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Livraison</dt><dd>{toChf(order.frais_livraison_centimes ?? 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Montant</dt><dd>{toChf(order.total_centimes)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Statut</dt>
              <dd><span className={`admin-status ${order.statut}`}>{order.statut}</span></dd>
            </div>
            <div className="flex justify-between"><dt className="text-slate-500">Prénom</dt><dd>{order.prenom}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Nom</dt><dd>{order.nom}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Téléphone</dt><dd>{order.telephone ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Adresse</dt><dd className="pl-3 text-right">{order.adresse_ligne_1}{order.adresse_ligne_2 ? `, ${order.adresse_ligne_2}` : ""}, {order.code_postal} {order.ville}, {order.pays}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Provider</dt><dd>{order.payment_provider ?? (order.stripe_session_id ? "stripe" : "-")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Session paiement</dt><dd className="truncate pl-3">{order.provider_session_id ?? order.stripe_session_id ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Payment ID</dt><dd className="truncate pl-3">{order.provider_payment_id ?? order.stripe_payment_intent_id ?? "-"}</dd></div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Livraison</h2>
          {canGenerateShippingLabel && !latestShipment ? (
            <a
              href={`/api/admin/orders/${order.id}/shipping-label`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Générer un bordereau d&apos;envoi
            </a>
          ) : null}
          {canGenerateShippingLabel && latestShipment ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <p className="font-semibold text-emerald-950">Bordereau déjà généré</p>
              <p className="mt-1 text-emerald-900">{latestShipment.tracking_number}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {latestShipment.tracking_url ? (
                  <a href={latestShipment.tracking_url} target="_blank" rel="noreferrer" className="font-semibold underline">
                    Suivi La Poste
                  </a>
                ) : null}
                <a
                  href={`/api/admin/orders/${order.id}/shipping-label?force=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-slate-700 underline"
                >
                  Régénérer
                </a>
              </div>
            </div>
          ) : null}
          <div className="mt-3 space-y-2 text-sm">
            {uniqueShipments.length === 0 ? <p className="text-slate-500">Aucun tracking enregistré.</p> : null}
            {uniqueShipments.map((shipment) => (
              <div key={shipment.id} className="rounded-md border border-slate-100 p-2">
                <p className="font-semibold">{shipment.carrier} - {shipment.status}</p>
                <p>{shipment.tracking_number ?? "Sans numéro"}</p>
                {shipment.tracking_url ? <a href={shipment.tracking_url} className="underline">Tracking</a> : null}
                <p className="text-xs text-slate-500">{shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleString("fr-FR") : "Pas encore expédié"}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Actions</h2>
          <div className="mt-3">
            <AdminOrderActions orderId={order.id} initialNotes={order.internal_notes} />
          </div>
        </article>
      </section>
    </div>
  );
}
