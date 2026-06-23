import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { normalizePromoCode } from "@/lib/promo-codes";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminPromoCodeSchema } from "@/lib/validation";

export const runtime = "edge";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const json = await request.json();
  const parsed = adminPromoCodeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt).toISOString() : null;
  const { data, error } = await supabase
    .from("codes_promo")
    .insert({
      code: normalizePromoCode(parsed.data.code),
      pourcentage: parsed.data.percentage,
      actif: parsed.data.active,
      usage_unique: parsed.data.uniqueUsage,
      expire_le: expiresAt,
    })
    .select("id,code,pourcentage,actif,usage_unique,expire_le,cree_le")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promoCode: data }, { status: 201 });
}
