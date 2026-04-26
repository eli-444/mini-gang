import { env } from "@/lib/env";
import { getMerchantPaymentSettings, getTwintRuntimeSettings } from "@/lib/admin-settings";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { SiteContentSettingsForm } from "@/components/admin/site-content-settings-form";
import { toChf } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const paymentSettings = await getMerchantPaymentSettings();
  const twintRuntime = await getTwintRuntimeSettings();
  const siteContentSettings = await getSiteContentSettings();

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
        <PaymentSettingsForm initialSettings={paymentSettings} />
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Homepage</h2>
        <p className="mt-2 text-sm text-slate-600">Cree un event mis en avant sur la page d&apos;accueil.</p>
        <SiteContentSettingsForm initialSettings={siteContentSettings} />
      </section>

      <section className="admin-card p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Base de donnees</h2>
        <p className="mt-2 text-sm text-slate-600">
          Le contenu homepage est stocke dans Supabase Storage pour eviter une migration SQL immediate. Les reglages de paiement restent dans <code>admin_settings</code>.
        </p>
      </section>
    </div>
  );
}
