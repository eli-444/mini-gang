import { SHOP_CURRENCY_LOWER } from "@/lib/shop-config";

const requiredClientEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
const requiredServerEnv = ["SUPABASE_SERVICE_ROLE_KEY", "PUBLIC_SITE_URL"] as const;

function normalizeEnv(raw: string | undefined): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const env = {
  supabaseUrl: normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "",
  supabaseAnonKey:
    normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    "",
  supabaseServiceRoleKey: normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
  enableStripe: process.env.ENABLE_STRIPE === "true",
  enableKlarna: process.env.ENABLE_KLARNA === "true",
  enableTwint: process.env.ENABLE_TWINT === "true",
  paymentProviderDefault: normalizeEnv(process.env.PAYMENT_PROVIDER_DEFAULT) ?? "stripe",
  stripeSecretKey: normalizeEnv(process.env.STRIPE_SECRET_KEY),
  stripeWebhookSecret: normalizeEnv(process.env.STRIPE_WEBHOOK_SECRET),
  klarnaApiBaseUrl: normalizeEnv(process.env.KLARNA_API_BASE_URL),
  klarnaUsername: normalizeEnv(process.env.KLARNA_USERNAME),
  klarnaPassword: normalizeEnv(process.env.KLARNA_PASSWORD),
  klarnaWebhookSecret: normalizeEnv(process.env.KLARNA_WEBHOOK_SECRET),
  twintProviderMode: normalizeEnv(process.env.TWINT_PROVIDER_MODE) ?? "external",
  twintApiBaseUrl: normalizeEnv(process.env.TWINT_API_BASE_URL),
  twintMerchantId: normalizeEnv(process.env.TWINT_MERCHANT_ID),
  twintApiKey: normalizeEnv(process.env.TWINT_API_KEY),
  twintWebhookSecret: normalizeEnv(process.env.TWINT_WEBHOOK_SECRET),
  twintCurrency: normalizeEnv(process.env.TWINT_CURRENCY) ?? SHOP_CURRENCY_LOWER,
  resendApiKey: normalizeEnv(process.env.RESEND_API_KEY),
  adminNotificationEmail: normalizeEnv(process.env.ADMIN_NOTIFICATION_EMAIL),
  publicSiteUrl: normalizeEnv(process.env.PUBLIC_SITE_URL),
  enableMondialRelay: process.env.ENABLE_MONDIAL_RELAY === "true",
  mondialRelayApiUrl: normalizeEnv(process.env.MONDIAL_RELAY_API_URL),
  mondialRelayApiKey: normalizeEnv(process.env.MONDIAL_RELAY_API_KEY),
  buybackReceiverName: normalizeEnv(process.env.BUYBACK_RECEIVER_NAME) ?? "Le Mini Gang",
  buybackReceiverLine1: normalizeEnv(process.env.BUYBACK_RECEIVER_LINE1) ?? "Atelier Mini Gang",
  buybackReceiverPostalCode: normalizeEnv(process.env.BUYBACK_RECEIVER_POSTAL_CODE) ?? "1000",
  buybackReceiverCity: normalizeEnv(process.env.BUYBACK_RECEIVER_CITY) ?? "Lausanne",
  buybackReceiverCountry: normalizeEnv(process.env.BUYBACK_RECEIVER_COUNTRY) ?? "CH",
};

export function assertClientEnv() {
  for (const key of requiredClientEnv) {
    if (!normalizeEnv(process.env[key])) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}

export function assertServerEnv() {
  for (const key of requiredServerEnv) {
    if (!normalizeEnv(process.env[key])) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}
