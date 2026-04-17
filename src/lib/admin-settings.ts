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
