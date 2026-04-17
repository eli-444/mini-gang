import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminReturnStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;
  const json = await request.json().catch(() => ({}));
  const parsed = adminReturnStatusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("returns")
    .update({
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ return: data });
}
