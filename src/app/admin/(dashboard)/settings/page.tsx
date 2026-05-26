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
    <div className="space-y-6">
      <div className="admin-card overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-white/65 px-5 py-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Configuration</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900 md:text-4xl">Paramètres</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Regroupe les leviers sensibles: paiements, livraison, fermeture boutique, fermeture commandes et rachat.
          </p>
        </div>
      </div>

      <section className="admin-card p-5">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Étape 1</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Paiements et livraison</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">Vérifie rapidement ce qui est actif avant de modifier les champs.</p>
        </div>
        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Carte bancaire</dt>
            <dd className="font-semibold">{cardStatus}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Klarna</dt>
            <dd className="font-semibold">{klarnaStatus}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">TWINT</dt>
            <dd className="font-semibold">{twintStatus}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">IBAN enregistre</dt>
            <dd className="font-semibold">{paymentSettings.merchant_iban_last4 ? `**** ${paymentSettings.merchant_iban_last4}` : "Non renseigne"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Livraison Suisse</dt>
            <dd className="font-semibold">{toChf(paymentSettings.shipping_fee_cents)} puis offerte des CHF 80</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Boutique</dt>
            <dd className="font-semibold">{siteContentSettings.shop_enabled ? "Ouverte" : "Fermee"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Commandes</dt>
            <dd className="font-semibold">{siteContentSettings.orders_enabled ? "Ouvertes" : "Fermees"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-slate-500">Rachat</dt>
            <dd className="font-semibold">{siteContentSettings.sell_service_enabled ? "Ouvert" : "Ferme"}</dd>
          </div>
        </dl>
        <PaymentSettingsForm initialSettings={paymentSettings} />
      </section>

      <section className="admin-card p-5">
        <div className="mb-2">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Étape 2</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Contenu du site</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Gère les textes administrables, l&apos;event homepage et les fermetures temporaires sans toucher au code.
          </p>
        </div>
        <SiteContentSettingsForm initialSettings={siteContentSettings} />
      </section>

      <section className="admin-card p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Info technique</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Base de données</h2>
        <p className="mt-2 text-sm text-slate-600">
          Le contenu homepage est stocke dans Supabase Storage pour eviter une migration SQL immediate. Les reglages de paiement restent dans <code>admin_settings</code>.
        </p>
      </section>
    </div>
  );
}
