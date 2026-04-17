import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  prenom: z.string().trim().min(2).max(80),
  nom: z.string().trim().min(2).max(80),
  telephone: z.string().trim().min(6).max(40),
});

export async function POST(request: Request) {
  if (!env.supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY est requis pour creer un compte sans confirmation email." },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      telephone: parsed.data.telephone,
    },
  });

  if (error || !data.user) {
    const message = error?.message ?? "Creation du compte impossible.";
    const status = message.toLowerCase().includes("already") || message.toLowerCase().includes("exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const { error: profileError } = await supabase
    .from("utilisateurs")
    .upsert(
      {
        id: data.user.id,
        email,
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        telephone: parsed.data.telephone,
        role: "client",
      },
      { onConflict: "id" },
    );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.user.id, email }, { status: 201 });
}
