import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });

  response.cookies.set("mg_access_token", "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("mg_refresh_token", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
