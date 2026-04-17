import { notFound } from "next/navigation";
import { AdminOrderActions } from "@/components/admin/order-actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toChf } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase
    .from("commandes")
    .select("*, articles_commande(*), shipments(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Order Details</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Commande {order.id.slice(0, 8)}</h1>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Articles</h2>
          <div className="mt-3 space-y-2">
            {(order.articles_commande ?? []).map((item: { id: string; vetement_id: string | null; nom_vetement: string; prix_centimes: number }) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-100 p-2 text-sm">
                <span>{item.nom_vetement ?? item.vetement_id}</span>
                <strong>{toChf(item.prix_centimes)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card p-4 text-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Details commande</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd>{order.email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Sous-total</dt><dd>{toChf(order.sous_total_centimes ?? Math.max(0, order.total_centimes - (order.frais_livraison_centimes ?? 0)))}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Livraison</dt><dd>{toChf(order.frais_livraison_centimes ?? 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Montant</dt><dd>{toChf(order.total_centimes)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Statut</dt>
              <dd><span className={`admin-status ${order.statut}`}>{order.statut}</span></dd>
            </div>
            <div className="flex justify-between"><dt className="text-slate-500">Prenom</dt><dd>{order.prenom}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Nom</dt><dd>{order.nom}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Telephone</dt><dd>{order.telephone ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Adresse</dt><dd className="pl-3 text-right">{order.adresse_ligne_1}{order.adresse_ligne_2 ? `, ${order.adresse_ligne_2}` : ""}, {order.code_postal} {order.ville}, {order.pays}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Provider</dt><dd>{order.payment_provider ?? (order.stripe_session_id ? "stripe" : "-")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Session paiement</dt><dd className="truncate pl-3">{order.provider_session_id ?? order.stripe_session_id ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Payment ID</dt><dd className="truncate pl-3">{order.provider_payment_id ?? order.stripe_payment_intent_id ?? "-"}</dd></div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <article className="admin-card p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Livraison</h2>
          <div className="mt-3 space-y-2 text-sm">
            {(order.shipments ?? []).length === 0 ? <p className="text-slate-500">Aucun tracking enregistre.</p> : null}
            {(order.shipments ?? []).map((shipment: { id: string; carrier: string; status: string; tracking_number: string | null; tracking_url: string | null; shipped_at: string | null }) => (
              <div key={shipment.id} className="rounded-md border border-slate-100 p-2">
                <p className="font-semibold">{shipment.carrier} - {shipment.status}</p>
                <p>{shipment.tracking_number ?? "Sans numero"}</p>
                {shipment.tracking_url ? <a href={shipment.tracking_url} className="underline">Tracking</a> : null}
                <p className="text-xs text-slate-500">{shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleString("fr-FR") : "Pas encore expedie"}</p>
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
