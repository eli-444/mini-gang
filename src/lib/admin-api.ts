import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function requireAdminApi() {
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

  if (!user) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }

  const { data: ownProfile } = await supabase.from("utilisateurs").select("role").eq("id", user.id).maybeSingle();
  const ownRole = typeof ownProfile?.role === "string" ? ownProfile.role.trim().toLowerCase() : null;
  if (ownRole === "admin") {
    return { ok: true as const, user, supabase };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: adminProfile } = await adminClient.from("utilisateurs").select("role").eq("id", user.id).maybeSingle();
  const adminRole = typeof adminProfile?.role === "string" ? adminProfile.role.trim().toLowerCase() : null;
  if (adminRole !== "admin") {
    return { ok: false as const, status: 403, message: "Forbidden" };
  }

  return { ok: true as const, user, supabase };
}
