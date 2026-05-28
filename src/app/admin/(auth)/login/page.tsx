"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return;
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    const session = signInData.session ?? currentSession;

    if (!session) {
      setError("Session non creee. Reessayez.");
      return;
    }

    if (!session.access_token || !session.refresh_token) {
      setError("Tokens de session manquants. Reessayez.");
      return;
    }

    const syncResponse = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      }),
    });
    if (!syncResponse.ok) {
      const payload = await syncResponse.json().catch(() => ({}));
      setError(payload.error ?? "Impossible de synchroniser la session.");
      return;
    }

    // Hard navigation to ensure server reads fresh auth cookies.
    window.location.href = "/admin";
  };

  return (
    <div className="admin-theme grid min-h-screen place-items-center p-4">
      <section className="admin-card w-full max-w-md p-6">
        <BrandLogo className="mb-4 block w-fit" imageClassName="w-24" priority />
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Panel admin</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            placeholder="Mot de passe"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Se connecter
          </button>
        </form>
      </section>
    </div>
  );
}
