import { NextResponse } from "next/server";
import { getIbanLast4, normalizeIban } from "@/lib/admin-settings";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminPaymentSettingsSchema } from "@/lib/validation";

export const runtime = "edge";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const json = await request.json();
  const parsed = adminPaymentSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const iban = parsed.data.merchant_iban ? normalizeIban(parsed.data.merchant_iban) : "";
  const settings = {
    id: "main",
    merchant_bank_holder: parsed.data.merchant_bank_holder || "",
    merchant_bank_name: parsed.data.merchant_bank_name || "",
    merchant_iban: iban,
    merchant_iban_last4: getIbanLast4(iban),
    card_payments_enabled: parsed.data.card_payments_enabled,
    twint_payments_enabled: parsed.data.twint_payments_enabled,
    twint_merchant_id: parsed.data.twint_merchant_id || "",
    twint_api_base_url: parsed.data.twint_api_base_url || "",
    twint_api_key_reference: parsed.data.twint_api_key_reference || "",
    shipping_fee_cents: parsed.data.shipping_fee_cents,
    updated_by: auth.user.id,
    updated_at: new Date().toISOString(),
  };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_settings")
    .upsert(settings, { onConflict: "id" })
    .select(
      "merchant_bank_holder,merchant_bank_name,merchant_iban,merchant_iban_last4,card_payments_enabled,twint_payments_enabled,twint_merchant_id,twint_api_base_url,twint_api_key_reference,shipping_fee_cents",
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
