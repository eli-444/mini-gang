"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Missing Supabase public env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart dev server.",
    );
  }
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
