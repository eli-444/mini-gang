"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    setIsLoading(false);
    if (resetError) {
      setError("L’envoi a échoué. Réessayez dans quelques instants.");
      return;
    }
    setIsSent(true);
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <h1 className="font-display text-3xl">Mot de passe oublié</h1>
      {isSent ? (
        <div className="mt-5 space-y-4 text-sm leading-6">
          <p>Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé.</p>
          <Link href="/auth/login" className="font-semibold text-[var(--mg-accent-strong)] underline">Retour à la connexion</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="block text-sm font-semibold" htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
            placeholder="votre@email.ch"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          <button type="submit" disabled={isLoading} className="w-full rounded-full bg-[var(--mg-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-55">
            {isLoading ? "Envoi..." : "Recevoir le lien"}
          </button>
          <p className="pt-1 text-center text-sm"><Link href="/auth/login" className="font-semibold text-[var(--mg-accent-strong)] underline">Retour à la connexion</Link></p>
        </form>
      )}
    </section>
  );
}
