import Link from "next/link";
import { notFound } from "next/navigation";
import { ReturnRequestForm } from "@/components/account/return-request-form";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toChf } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  en_attente: "En attente de confirmation",
  payee: "Payee",
  preparee: "En preparation",
  envoyee: "Envoyee",
  livree: "Livree",
  annulee: "Annulee",
  remboursee: "Remboursee",
};

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser("/auth/login");
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: order } = await supabase
    .from("commandes")
    .select("*, articles_commande(*), shipments(*), returns(*)")
    .eq("id", id)
    .eq("utilisateur_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <section className="mg-shell rounded-[18px] bg-white p-5">
      <Link href="/mon-compte/commandes" className="text-xs font-semibold text-[var(--mg-accent-strong)]">
        Retour aux commandes
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--mg-ink)]">Commande {order.id.slice(0, 8)}</h2>
          <p className="mt-1 text-sm text-[var(--mg-ink)]/65">{new Date(order.cree_le).toLocaleDateString("fr-CH")}</p>
        </div>
        <span className="rounded-full border border-[var(--mg-ring)] px-3 py-1 text-xs font-semibold uppercase">
          {statusLabels[order.statut] ?? order.statut}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
        <article>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--mg-accent-strong)]">Articles</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(order.articles_commande ?? []).map((item: { id: string; nom_vetement: string; taille: string; prix_centimes: number }) => (
              <li key={item.id} className="flex justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                <span>{item.nom_vetement} {item.taille ? `- ${item.taille}` : ""}</span>
                <strong>{toChf(item.prix_centimes)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-4 text-sm">
          <div className="rounded-lg border border-[var(--mg-ring)] p-3">
            <h3 className="font-semibold">Total</h3>
            <p className="mt-2 flex justify-between"><span>Sous-total</span><strong>{toChf(order.sous_total_centimes ?? Math.max(0, order.total_centimes - (order.frais_livraison_centimes ?? 0)))}</strong></p>
            <p className="mt-1 flex justify-between"><span>Livraison</span><strong>{toChf(order.frais_livraison_centimes ?? 0)}</strong></p>
            <p className="mt-2 flex justify-between border-t border-[var(--mg-ring)] pt-2"><span>Total</span><strong>{toChf(order.total_centimes)}</strong></p>
          </div>

          <div className="rounded-lg border border-[var(--mg-ring)] p-3">
            <h3 className="font-semibold">Livraison</h3>
            <p className="mt-2">{order.adresse_ligne_1}</p>
            {order.adresse_ligne_2 ? <p>{order.adresse_ligne_2}</p> : null}
            <p>{order.code_postal} {order.ville}</p>
            <p>{order.pays}</p>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <article>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--mg-accent-strong)]">Tracking</h3>
          <div className="mt-3 space-y-2">
            {(order.shipments ?? []).length === 0 ? <p className="rounded-lg border border-dashed border-[var(--mg-ring)] p-3 text-sm text-[var(--mg-ink)]/65">Le suivi apparaitra ici des que la commande sera expediee.</p> : null}
            {(order.shipments ?? []).map((shipment: { id: string; carrier: string; status: string; tracking_number: string | null; tracking_url: string | null }) => (
              <div key={shipment.id} className="rounded-lg border border-[var(--mg-ring)] p-3 text-sm">
                <p className="font-semibold">{shipment.carrier} - {shipment.status}</p>
                <p>{shipment.tracking_number ?? "Numero a venir"}</p>
                {shipment.tracking_url ? <a href={shipment.tracking_url} className="font-semibold underline">Ouvrir le suivi</a> : null}
              </div>
            ))}
          </div>
        </article>

        <article>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--mg-accent-strong)]">Retour ou probleme</h3>
          {(order.returns ?? []).length > 0 ? (
            <div className="mt-3 space-y-2">
              {(order.returns ?? []).map((ret: { id: string; status: string; reason: string }) => (
                <p key={ret.id} className="rounded-lg border border-[var(--mg-ring)] p-3 text-sm">
                  {ret.reason} - <strong>{ret.status}</strong>
                </p>
              ))}
            </div>
          ) : (
            <ReturnRequestForm orderId={order.id} />
          )}
        </article>
      </div>
    </section>
  );
}
