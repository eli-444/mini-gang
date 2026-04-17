import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminProductSchema } from "@/lib/validation";

export const runtime = "edge";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const json = await request.json();
  const parsed = adminProductSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.nom = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description || null;
  if (parsed.data.price_cents !== undefined) updates.prix_centimes = parsed.data.price_cents;
  if (parsed.data.categorie !== undefined) updates.categorie = parsed.data.categorie;
  if (parsed.data.age_range !== undefined) updates.age = parsed.data.age_range;
  if (parsed.data.size_label !== undefined) updates.taille = parsed.data.size_label || "Unique";
  if (parsed.data.brand !== undefined) updates.marque = parsed.data.brand || null;
  if (parsed.data.couleur !== undefined) updates.couleur = parsed.data.couleur || null;
  if (parsed.data.matiere !== undefined) updates.matiere = parsed.data.matiere || null;
  if (parsed.data.sex !== undefined) updates.genre = parsed.data.sex;
  if (parsed.data.condition !== undefined) updates.etat = parsed.data.condition;
  if (parsed.data.status !== undefined) updates.statut = parsed.data.status;
  if (parsed.data.mis_en_avant !== undefined) updates.mis_en_avant = parsed.data.mis_en_avant;

  const { data, error } = await supabase
    .from("vetements")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("vetements").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
