import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const supabase = createSupabaseAdminClient();
  const runQuery = (includeProviderColumns: boolean) =>
    supabase
      .from("commandes")
      .select(
        (includeProviderColumns
          ? "id,email,statut,total_centimes,cree_le,payment_provider,provider_session_id"
          : "id,email,statut,total_centimes,cree_le") as string,
      )
      .order("cree_le", { ascending: false })
      .limit(100);

  let { data, error } = await runQuery(true);
  if (error?.message?.toLowerCase().includes("payment_provider")) {
    ({ data, error } = await runQuery(false));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
