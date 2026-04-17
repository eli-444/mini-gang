import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookieList: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>,
      ) {
        try {
          for (const cookie of cookieList) {
            cookieStore.set(cookie.name, cookie.value, cookie.options as Parameters<typeof cookieStore.set>[2]);
          }
        } catch {
          // In Server Components, setting cookies can fail. Middleware/proxy will refresh them.
        }
      },
    },
  });
}
