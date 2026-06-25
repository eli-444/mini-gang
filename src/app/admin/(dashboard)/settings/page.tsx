import { env } from "@/lib/env";
import { getMerchantPaymentSettings } from "@/lib/admin-settings";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { SiteContentSettingsForm } from "@/components/admin/site-content-settings-form";
import { toChf } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const paymentSettings = await getMerchantPaymentSettings();
  const siteContentSettings = await getSiteContentSettings();

  const cardStatus = !env.enableStripe
    ? "Desactive dans l'env"
    : paymentSettings.card_payments_enabled
      ? "Active"
      : "Desactive dans le panel";

  const statusCards = [
    { label: "Stripe", value: cardStatus },
    { label: "IBAN", value: paymentSettings.merchant_iban_last4 ? `**** ${paymentSettings.merchant_iban_last4}` : "Non renseigne" },
    { label: "Livraison Suisse", value: `${toChf(paymentSettings.shipping_fee_cents)} puis offerte des CHF 80` },
    { label: "Boutique", value: siteContentSettings.shop_enabled ? "Ouverte" : "Fermee" },
    { label: "Commandes", value: siteContentSettings.orders_enabled ? "Ouvertes" : "Fermees" },
    { label: "Rachat", value: siteContentSettings.sell_service_enabled ? "Ouvert" : "Ferme" },
  ];

  return (
    <div className="space-y-5">
      <div className="admin-card p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Réglages</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Configuration boutique</h1>
      </div>

      <section className="admin-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Etat actuel</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Services actifs</h2>
        </div>
        <dl className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card) => (
            <div key={card.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-[0.1em] text-slate-500">{card.label}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{card.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="admin-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Paiement</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Modes de paiement et livraison</h2>
        </div>
        <PaymentSettingsForm initialSettings={paymentSettings} />
      </section>

      <section className="admin-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Site</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Messages et fermetures</h2>
        </div>
        <SiteContentSettingsForm initialSettings={siteContentSettings} />
      </section>
    </div>
  );
}
