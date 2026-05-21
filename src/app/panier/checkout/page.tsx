import { CartClient } from "@/components/cart-client";
import { getMerchantPaymentSettings, getTwintRuntimeSettings } from "@/lib/admin-settings";
import { getCheckoutProviderOptions, getDefaultProviderName } from "@/lib/payments";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import type { PaymentProviderName } from "@/lib/types";

export default async function CheckoutPage() {
  const [paymentSettings, twintRuntime, siteSettings] = await Promise.all([
    getMerchantPaymentSettings(),
    getTwintRuntimeSettings(),
    getSiteContentSettings(),
  ]);
  const providers = getCheckoutProviderOptions().map((provider) => {
    if (provider.name === "stripe") return { ...provider, enabled: provider.enabled && paymentSettings.card_payments_enabled };
    if (provider.name === "twint") return { ...provider, enabled: twintRuntime.enabled };
    return provider;
  });
  const fallback = providers.find((provider) => provider.enabled)?.name ?? providers[0]?.name ?? "stripe";
  const envDefault = getDefaultProviderName();
  const defaultProvider = (providers.find((provider) => provider.name === envDefault && provider.enabled)?.name ?? fallback) as PaymentProviderName;

  return (
    <CartClient
      providers={providers}
      defaultProvider={defaultProvider}
      shippingFeeCents={paymentSettings.shipping_fee_cents}
      ordersEnabled={siteSettings.orders_enabled}
      ordersClosedMessage={siteSettings.orders_closed_message}
      ordersReopenDate={siteSettings.orders_reopen_date}
    />
  );
}
