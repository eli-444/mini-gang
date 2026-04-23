import { env } from "@/lib/env";
import { getMerchantPaymentSettings, getTwintRuntimeSettings } from "@/lib/admin-settings";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { toChf } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const paymentSettings = await getMerchantPaymentSettings();
  const twintRuntime = await getTwintRuntimeSettings();
  const cardStatus = !env.enableStripe
    ? "Desactive dans l'env"
    : paymentSettings.card_payments_enabled
      ? "Active"
      : "Desactive dans le panel";
  const klarnaStatus = env.enableKlarna ? "Active" : "Desactive dans l'env";
  const twintStatus = !env.enableTwint
    ? "Desactive dans l'env"
    : twintRuntime.enabled
      ? "Active"
      : paymentSettings.twint_payments_enabled
        ? "Configuration incomplete"
        : "Desactive dans le panel";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Configuration</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Parametres</h1>
      </div>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Paiements</h2>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Carte bancaire</dt>
            <dd className="font-semibold">{cardStatus}</dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Klarna</dt>
            <dd className="font-semibold">{klarnaStatus}</dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">TWINT</dt>
            <dd className="font-semibold">{twintStatus}</dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">IBAN enregistre</dt>
            <dd className="font-semibold">{paymentSettings.merchant_iban_last4 ? `**** ${paymentSettings.merchant_iban_last4}` : "Non renseigne"}</dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Livraison Suisse</dt>
            <dd className="font-semibold">{toChf(paymentSettings.shipping_fee_cents)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          Les champs TWINT du panel alimentent maintenant le checkout. La cle API reste lue via la variable
          d&apos;environnement nommee dans <code>twint_api_key_reference</code>.
        </p>
        <PaymentSettingsForm initialSettings={paymentSettings} />
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Webhooks Health</h2>
        <p className="mt-2 text-sm text-slate-600">
          Les paiements carte, Klarna et TWINT mettent a jour la table commandes via leurs webhooks respectifs.
        </p>
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Notifications</h2>
        <p className="mt-2 text-sm text-slate-600">Email admin configure: {env.adminNotificationEmail ?? "non configure"}</p>
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Base de donnees</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tables verifiees: utilisateurs, vetements, photos_vetements, commandes, articles_commande, admin_settings,
          shipments et returns.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Les modules vendeur historiques ne font pas partie du schema Supabase actuel: aucune table
          <code>sell_orders</code> ou <code>payouts</code> n&apos;est presente aujourd&apos;hui.
        </p>
      </section>
    </div>
  );
}
