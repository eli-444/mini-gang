import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { markOrderPaid } from "@/lib/checkout";
import { retrieveStripeCheckoutSession } from "@/lib/payments/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = Array.isArray(params.order_id) ? params.order_id[0] : params.order_id;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;
  let status: string | null = null;

  if (orderId) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("commandes").select("statut").eq("id", orderId).maybeSingle();
    status = data?.statut ?? null;

    if (status === "en_attente" && sessionId) {
      try {
        const session = await retrieveStripeCheckoutSession(sessionId);
        const sessionOrderId = session.client_reference_id ?? session.metadata?.orderId ?? session.metadata?.order_id ?? null;

        if (sessionOrderId === orderId && session.payment_status === "paid") {
          await markOrderPaid({
            orderId,
            providerPaymentId: session.payment_intent ?? session.id,
          });
          status = "payee";
        }
      } catch {
        status = data?.statut ?? null;
      }
    }
  }

  const isConfirmed = status && status !== "en_attente";

  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-3xl border border-black/10 bg-white p-8 text-center">
      <ClearCartOnSuccess />
      <h1 className="font-display text-3xl font-black">
        Paiement <span className="text-[var(--mg-pop-rose)]">{isConfirmed ? "confirmé" : "reçu"}</span>
      </h1>
      <p className="text-sm font-bold text-[var(--mg-ink)]/70">
        {isConfirmed
          ? "Merci. Votre commande est confirmée et passe en préparation."
          : "Merci. Le paiement a été lancé et la confirmation finale peut prendre quelques instants via le webhook."}
      </p>
      {orderId ? <p className="text-xs text-[var(--mg-ink)]/60">Commande {orderId.slice(0, 8)}</p> : null}
      <Link href="/mon-compte/commandes" className="inline-flex rounded-full border border-black/15 px-5 py-2 text-sm font-semibold">
        Voir mes commandes
      </Link>
      <Link href="/boutique" className="inline-flex rounded-full bg-[var(--mg-accent)] px-5 py-2 text-sm font-semibold text-white">
        Retour à la boutique
      </Link>
    </section>
  );
}
