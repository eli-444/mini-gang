import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { returnRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez etre connecte." }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = returnRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Demande invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase
    .from("commandes")
    .select("id")
    .eq("id", parsed.data.order_id)
    .eq("utilisateur_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("returns")
    .insert({
      order_id: parsed.data.order_id,
      user_id: user.id,
      reason: parsed.data.reason,
      message: parsed.data.message,
      status: "demande",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ return: data });
}
