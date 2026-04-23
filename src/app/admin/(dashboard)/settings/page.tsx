import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/utils";
import { PayoutMarkPaidButton } from "@/components/admin/payout-mark-paid-button";

export default async function AdminSettingsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: payouts } = await supabase.from("payout_requests").select("*").order("requested_at", { ascending: false }).limit(20);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Configuration</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Parametres</h1>
      </div>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Paiements</h2>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-md v-slate-50 p-2">
            <dt className="text-slate-500">Stripe</dt>
            <dd className="font-semibold">{env.enableStripe ? "Active" : "Desactive"}</dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Klarna</dt>
            <dd className="font-semibold">{env.enableKlarna ? "Active" : "Desactive"}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Webhooks Health</h2>
        <p className="mt-2 text-sm text-slate-600">Voir les derniers evenements via la table `payments_events` dans Supabase.</p>
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Notifications</h2>
        <p className="mt-2 text-sm text-slate-600">Email admin configure: {env.adminNotificationEmail ?? "non configure"}</p>
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Payout requests</h2>
        {payouts && payouts.length > 0 ? (
          <div className="mt-3 space-y-2">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-2 text-sm">
                <div>
                  <p className="font-semibold">{payout.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">
                    {payout.status} - {formatMoney(payout.amount_cents, "EUR")} - {new Date(payout.requested_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <PayoutMarkPaidButton payoutId={payout.id} disabled={!["requested", "approved"].includes(payout.status)} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Aucune demande de retrait.</p>
        )}
      </section>
    </div>
  );
}
