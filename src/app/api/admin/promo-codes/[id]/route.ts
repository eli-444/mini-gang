import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminPromoCodeUpdateSchema } from "@/lib/validation";

export const runtime = "edge";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await context.params;
  const json = await request.json();
  const parsed = adminPromoCodeUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    modifie_le: new Date().toISOString(),
  };
  if (typeof parsed.data.active === "boolean") update.actif = parsed.data.active;
  if (typeof parsed.data.percentage === "number") update.pourcentage = parsed.data.percentage;
  if (typeof parsed.data.uniqueUsage === "boolean") update.usage_unique = parsed.data.uniqueUsage;
  if (typeof parsed.data.expiresAt === "string") {
    update.expire_le = parsed.data.expiresAt ? new Date(parsed.data.expiresAt).toISOString() : null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("codes_promo")
    .update(update)
    .eq("id", id)
    .select("id,code,pourcentage,actif,usage_unique,expire_le,cree_le")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promoCode: data });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("codes_promo").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
