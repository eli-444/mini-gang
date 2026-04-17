import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseAdminClient() {
  if (!env.supabaseUrl || (!env.supabaseServiceRoleKey && !env.supabaseAnonKey)) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey ?? env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
