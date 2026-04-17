import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function requireSellerApi() {
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

  return { ok: true as const, supabase, user };
}
