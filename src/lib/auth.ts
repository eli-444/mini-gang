import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: userFromGetUser },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let user = userFromGetUser ?? session?.user ?? null;

  if (!user) {
    const cookieStore = await cookies();
    const token = cookieStore.get("mg_access_token")?.value;
    if (token) {
      const adminClient = createSupabaseAdminClient();
      const {
        data: { user: userFromToken },
      } = await adminClient.auth.getUser(token);
      user = userFromToken ?? null;
    }
  }

  return {
    supabase,
    user,
  };
}

export async function requireUser(redirectTo = "/auth/login") {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) redirect(redirectTo);
  return { supabase, user };
}

export async function requireAdmin() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: ownProfile } = await supabase.from("utilisateurs").select("role").eq("id", user.id).maybeSingle();

  const roleFromOwnProfile =
    typeof ownProfile?.role === "string" ? ownProfile.role.trim().toLowerCase() : null;

  if (roleFromOwnProfile === "admin") {
    return { supabase, user };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: adminProfile } = await adminClient.from("utilisateurs").select("role").eq("id", user.id).maybeSingle();

  const roleFromAdminProfile =
    typeof adminProfile?.role === "string" ? adminProfile.role.trim().toLowerCase() : null;

  if (roleFromAdminProfile !== "admin") {
    redirect("/admin/login");
  }

  return { supabase, user };
}
