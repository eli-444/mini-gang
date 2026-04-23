import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SHIPPING_FEE_CENTS_DEFAULT } from "@/lib/shop-config";

export interface MerchantPaymentSettings {
  merchant_bank_holder: string;
  merchant_bank_name: string;
  merchant_iban: string;
  merchant_iban_last4: string;
  card_payments_enabled: boolean;
  twint_payments_enabled: boolean;
  twint_merchant_id: string;
  twint_api_base_url: string;
  twint_api_key_reference: string;
  shipping_fee_cents: number;
}

export interface TwintRuntimeSettings {
  enabled: boolean;
  apiBaseUrl: string;
  merchantId: string;
  apiKey: string;
  apiKeySource: string | null;
}

const emptySettings: MerchantPaymentSettings = {
  merchant_bank_holder: "",
  merchant_bank_name: "",
  merchant_iban: "",
  merchant_iban_last4: "",
  card_payments_enabled: true,
  twint_payments_enabled: false,
  twint_merchant_id: "",
  twint_api_base_url: "",
  twint_api_key_reference: "",
  shipping_fee_cents: SHIPPING_FEE_CENTS_DEFAULT,
};

export function normalizeIban(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function getIbanLast4(value: string) {
  const normalized = normalizeIban(value);
  return normalized.length >= 4 ? normalized.slice(-4) : "";
}

function normalizeSecret(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getReferencedSecret(reference: string) {
  const envKey = reference.trim();
  if (!envKey) return undefined;
  return normalizeSecret(process.env[envKey]);
}

export async function getMerchantPaymentSettings(): Promise<MerchantPaymentSettings> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_settings")
    .select(
      "merchant_bank_holder,merchant_bank_name,merchant_iban,merchant_iban_last4,card_payments_enabled,twint_payments_enabled,twint_merchant_id,twint_api_base_url,twint_api_key_reference,shipping_fee_cents",
    )
    .eq("id", "main")
    .maybeSingle();

  if (error || !data) return emptySettings;

  return {
    merchant_bank_holder: data.merchant_bank_holder ?? "",
    merchant_bank_name: data.merchant_bank_name ?? "",
    merchant_iban: data.merchant_iban ?? "",
    merchant_iban_last4: data.merchant_iban_last4 ?? "",
    card_payments_enabled: data.card_payments_enabled ?? true,
    twint_payments_enabled: data.twint_payments_enabled ?? false,
    twint_merchant_id: data.twint_merchant_id ?? "",
    twint_api_base_url: data.twint_api_base_url ?? "",
    twint_api_key_reference: data.twint_api_key_reference ?? "",
    shipping_fee_cents: data.shipping_fee_cents ?? SHIPPING_FEE_CENTS_DEFAULT,
  };
}

export async function getTwintRuntimeSettings(): Promise<TwintRuntimeSettings> {
  const settings = await getMerchantPaymentSettings();
  const apiBaseUrl = settings.twint_api_base_url || env.twintApiBaseUrl || "";
  const merchantId = settings.twint_merchant_id || env.twintMerchantId || "";
  const referencedApiKey = getReferencedSecret(settings.twint_api_key_reference);
  const apiKey = referencedApiKey ?? env.twintApiKey ?? "";
  const enabled =
    settings.twint_payments_enabled &&
    env.enableTwint &&
    (env.twintProviderMode === "stripe" ? Boolean(env.stripeSecretKey) : Boolean(apiBaseUrl && merchantId && apiKey));

  return {
    enabled,
    apiBaseUrl,
    merchantId,
    apiKey,
    apiKeySource: referencedApiKey ? settings.twint_api_key_reference : env.twintApiKey ? "TWINT_API_KEY" : null,
  };
}
