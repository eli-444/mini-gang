import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminProductSchema } from "@/lib/validation";

export const runtime = "edge";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const json = await request.json();
  const parsed = adminProductSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("vetements")
    .insert({
      nom: parsed.data.title,
      description: parsed.data.description || null,
      prix_centimes: parsed.data.price_cents,
      categorie: parsed.data.categorie,
      age: parsed.data.age_range,
      taille: parsed.data.size_label || "Unique",
      marque: parsed.data.brand || null,
      couleur: parsed.data.couleur || null,
      matiere: parsed.data.matiere || null,
      genre: parsed.data.sex,
      etat: parsed.data.condition,
      statut: parsed.data.status,
      mis_en_avant: parsed.data.mis_en_avant,
      cree_par: auth.user.id,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
