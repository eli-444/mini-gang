import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const runtime = "edge";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  let profileRole: string | null = null;
  let ownProfileRole: string | null = null;
  let ownProfileError: string | null = null;
  let adminProfileError: string | null = null;
  let profileExists = false;

  if (user?.id) {
    const { data: ownProfile, error: ownProfileQueryError } = await supabase
      .from("utilisateurs")
      .select("id,role")
      .eq("id", user.id)
      .maybeSingle();
    ownProfileRole = ownProfile?.role ?? null;
    ownProfileError = ownProfileQueryError?.message ?? null;
    profileExists = Boolean(ownProfile?.id);

    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: adminProfileQueryError } = await adminClient
      .from("utilisateurs")
      .select("id,role")
      .eq("id", user.id)
      .maybeSingle();
    profileRole = profile?.role ?? null;
    adminProfileError = adminProfileQueryError?.message ?? null;
    profileExists = profileExists || Boolean(profile?.id);
  }

  return NextResponse.json({
    user_id: user?.id ?? null,
    session_user_id: session?.user?.id ?? null,
    session_exists: Boolean(session),
    profile_exists: profileExists,
    own_profile_role: ownProfileRole,
    own_profile_error: ownProfileError,
    profile_role: profileRole,
    admin_profile_error: adminProfileError,
    has_service_role_key: Boolean(env.supabaseServiceRoleKey),
    mg_access_cookie: Boolean(cookieStore.get("mg_access_token")?.value),
    mg_refresh_cookie: Boolean(cookieStore.get("mg_refresh_token")?.value),
    user_error: userError?.message ?? null,
    session_error: sessionError?.message ?? null,
  });
}
