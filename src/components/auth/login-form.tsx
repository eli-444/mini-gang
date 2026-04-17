"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const signupHref = next ? `/auth/signup?next=${encodeURIComponent(next)}` : "/auth/signup";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(next || "/mon-compte");
    router.refresh();
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(45,34,64,0.06)]">
      <h1 className="font-display text-3xl">Connexion</h1>
      <p className="mt-2 text-sm text-black/60">Accedez a votre espace vendeur et a votre cagnotte.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          placeholder="Mot de passe"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button type="submit" className="w-full rounded-full bg-[var(--mg-accent)] px-4 py-2 text-sm font-semibold text-white">
          Se connecter
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60">
        Pas encore de compte ?{" "}
        <Link href={signupHref} className="font-semibold text-[var(--mg-accent-strong)] underline">
          Creer un compte
        </Link>
      </p>
    </section>
  );
}
