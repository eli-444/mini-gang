"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const signupHref = next ? `/auth/signup?next=${encodeURIComponent(next)}` : "/auth/signup";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      setIsLoading(false);
      return;
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    const session = signInData.session ?? currentSession;
    if (session?.access_token && session.refresh_token) {
      const syncResponse = await fetch("/api/auth/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });
      if (!syncResponse.ok) {
        setError("Connexion réussie, mais la session n’a pas pu être synchronisée.");
        setIsLoading(false);
        return;
      }
    }

    router.push(next || "/mon-compte");
    router.refresh();
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <h1 className="font-display text-3xl">Connexion</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
        />
        <div>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            placeholder="Mot de passe"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-[var(--mg-accent-strong)] underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        <button type="submit" disabled={isLoading} className="w-full rounded-full bg-[var(--mg-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-55">
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60">
        Pas encore de compte ?{" "}
        <Link href={signupHref} className="font-semibold text-[var(--mg-accent-strong)] underline">
          Créer un compte
        </Link>
      </p>
    </section>
  );
}
