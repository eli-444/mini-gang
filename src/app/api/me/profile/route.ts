import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const profileSchema = z.object({
  prenom: z.string().trim().min(2).max(80),
  nom: z.string().trim().min(2).max(80),
  telephone: z.string().trim().min(6).max(40).or(z.literal("")),
});

export async function PATCH(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez etre connecte." }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations invalides.", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email du compte introuvable." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("utilisateurs")
    .upsert(
      {
        id: user.id,
        email,
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        telephone: parsed.data.telephone || null,
      },
      { onConflict: "id" },
    )
    .select("email,prenom,nom,telephone,cree_le")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
