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
    <section className="bg-[var(--mg-surface)] px-5 py-6 text-[var(--mg-ink)] md:px-8 md:py-8">
      <Link href="/mon-compte/commandes" className="text-base font-black text-[var(--mg-accent-strong)] underline">
        Retour aux commandes
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-5 border-b-2 border-[var(--mg-ring)] pb-6">
        <div>
          <h2 className="text-3xl font-black leading-tight md:text-4xl">Commande {order.id.slice(0, 8)}</h2>
          <p className="mt-2 text-base font-semibold text-[var(--mg-ink)]/65 md:text-lg">{new Date(order.cree_le).toLocaleDateString("fr-CH")}</p>
        </div>
        <span className="text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-accent-strong)] md:text-base">
          {statusLabels[order.statut] ?? order.statut}
        </span>
      </div>

      <div className="mt-8 grid gap-9 lg:grid-cols-[1.2fr_0.8fr]">
        <article>
          <h3 className="text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">Articles</h3>
          <ul className="mt-4 space-y-3 text-base md:text-lg">
            {(order.articles_commande ?? []).map((item: { id: string; nom_vetement: string; taille: string; prix_centimes: number }) => (
              <li key={item.id} className="flex justify-between gap-4 border-b border-[var(--mg-ring)] pb-3">
                <span>{item.nom_vetement} {item.taille ? `- ${item.taille}` : ""}</span>
                <strong>{toChf(item.prix_centimes)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-7 text-base md:text-lg">
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">Total</h3>
            <p className="mt-4 flex justify-between border-b border-[var(--mg-ring)] pb-2"><span>Sous-total</span><strong>{toChf(order.sous_total_centimes ?? Math.max(0, order.total_centimes - (order.frais_livraison_centimes ?? 0)))}</strong></p>
            <p className="mt-2 flex justify-between border-b border-[var(--mg-ring)] pb-2"><span>Livraison</span><strong>{toChf(order.frais_livraison_centimes ?? 0)}</strong></p>
            <p className="mt-3 flex justify-between text-xl font-black"><span>Total</span><strong>{toChf(order.total_centimes)}</strong></p>
          </div>

          <div>
            <h3 className="text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">Livraison</h3>
            <p className="mt-4">{order.adresse_ligne_1}</p>
            {order.adresse_ligne_2 ? <p>{order.adresse_ligne_2}</p> : null}
            <p>{order.code_postal} {order.ville}</p>
            <p>{order.pays}</p>
          </div>
        </article>
      </div>

      <div className="mt-10 grid gap-9 border-t-2 border-[var(--mg-ring)] pt-8 lg:grid-cols-2">
        <article>
          <h3 className="text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">Tracking</h3>
          <div className="mt-4 space-y-4">
            {(order.shipments ?? []).length === 0 ? <p className="border-l-4 border-[var(--mg-pop-rose)] py-2 pl-4 text-base font-semibold leading-7 text-[var(--mg-ink)]/68">Le suivi apparaitra ici des que la commande sera expediee.</p> : null}
            {(order.shipments ?? []).map((shipment: { id: string; carrier: string; status: string; tracking_number: string | null; tracking_url: string | null }) => (
              <div key={shipment.id} className="border-l-4 border-[var(--mg-ring)] py-1 pl-4 text-base">
                <p className="font-black">{shipment.carrier} - {shipment.status}</p>
                <p>{shipment.tracking_number ?? "Numero a venir"}</p>
                {shipment.tracking_url ? <a href={shipment.tracking_url} className="font-semibold underline">Ouvrir le suivi</a> : null}
              </div>
            ))}
          </div>
        </article>

        <article>
          <h3 className="text-base font-black uppercase tracking-[0.1em] text-[var(--mg-pop-rose)]">Retour ou probleme</h3>
          {(order.returns ?? []).length > 0 ? (
            <div className="mt-4 space-y-4">
              {(order.returns ?? []).map((ret: { id: string; status: string; reason: string }) => (
                <p key={ret.id} className="border-l-4 border-[var(--mg-ring)] py-1 pl-4 text-base">
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
