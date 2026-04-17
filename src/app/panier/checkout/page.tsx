import { CartClient } from "@/components/cart-client";
import { getMerchantPaymentSettings } from "@/lib/admin-settings";
import { getCheckoutProviderOptions, getDefaultProviderName } from "@/lib/payments";
import type { PaymentProviderName } from "@/lib/types";

export default async function CheckoutPage() {
  const paymentSettings = await getMerchantPaymentSettings();
  const providers = getCheckoutProviderOptions().map((provider) => {
    if (provider.name === "stripe") return { ...provider, enabled: provider.enabled && paymentSettings.card_payments_enabled };
    if (provider.name === "twint") return { ...provider, enabled: provider.enabled && paymentSettings.twint_payments_enabled };
    return provider;
  });
  const fallback = providers.find((provider) => provider.enabled)?.name ?? providers[0]?.name ?? "stripe";
  const envDefault = getDefaultProviderName();
  const defaultProvider = (providers.find((provider) => provider.name === envDefault && provider.enabled)?.name ?? fallback) as PaymentProviderName;

  return <CartClient providers={providers} defaultProvider={defaultProvider} shippingFeeCents={paymentSettings.shipping_fee_cents} />;
}
