import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

const schema = z
  .object({
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
  })
  .transform((input) => ({
    access_token: input.access_token ?? input.accessToken ?? "",
    refresh_token: input.refresh_token ?? input.refreshToken ?? "",
  }));

export const runtime = "edge";

export async function POST(request: Request) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.access_token || !parsed.data.refresh_token) {
    return NextResponse.json({ error: "Missing access_token or refresh_token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        // Route handler does not need incoming cookies for this explicit setSession.
        return [];
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>,
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.setSession({
    access_token: parsed.data.access_token,
    refresh_token: parsed.data.refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  response.cookies.set("mg_access_token", parsed.data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  response.cookies.set("mg_refresh_token", parsed.data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
