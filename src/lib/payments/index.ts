import { env } from "@/lib/env";
import { KlarnaProvider } from "@/lib/payments/klarna";
import type { PaymentProvider } from "@/lib/payments/provider";
import { StripeProvider } from "@/lib/payments/stripe";
import { TwintProvider } from "@/lib/payments/twint";

const providers: PaymentProvider[] = [new StripeProvider(), new KlarnaProvider(), new TwintProvider()];
const checkoutProviderNames = new Set(["stripe", "twint"]);

const providerLabels = {
  stripe: "Carte bancaire",
  klarna: "Klarna",
  twint: "TWINT",
} as const;

const providerDescriptions = {
  stripe: "Paiement securise par carte.",
  klarna: "Paiement via Klarna.",
  twint: "Paiement mobile populaire en Suisse.",
} as const;

export function getEnabledProviders() {
  return providers.filter((provider) => provider.isEnabled());
}

export function getProviderInstance(name: string) {
  return providers.find((provider) => provider.name === name) ?? null;
}

export function getProviderByName(name: string) {
  return providers.find((provider) => provider.name === name && provider.isEnabled()) ?? null;
}

export function getCheckoutProviderOptions() {
  return providers
    .filter((provider) => checkoutProviderNames.has(provider.name))
    .map((provider) => ({
    name: provider.name,
    label: providerLabels[provider.name],
    description: providerDescriptions[provider.name],
    enabled: provider.isEnabled(),
    }));
}

export function getDefaultProviderName() {
  const enabled = providers.filter((provider) => checkoutProviderNames.has(provider.name) && provider.isEnabled());
  if (enabled.length === 0) return null;
  const found = enabled.find((provider) => provider.name === env.paymentProviderDefault);
  return found?.name ?? enabled[0].name;
}
