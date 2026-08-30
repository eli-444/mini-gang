"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm({ initialError }: { initialError?: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Le lien est invalide ou expiré. Demandez un nouveau lien.");
      setIsLoading(false);
      return;
    }

    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setIsDone(true);
    setIsLoading(false);
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
      {isDone ? (
        <div className="mt-5 space-y-4 text-sm leading-6">
          <p>Votre mot de passe a bien été modifié.</p>
          <Link href="/auth/login" className="font-semibold text-[var(--mg-accent-strong)] underline">Se connecter</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Nouveau mot de passe"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Confirmer le mot de passe"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          <button type="submit" disabled={isLoading || Boolean(initialError)} className="w-full rounded-full bg-[var(--mg-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-55">
            {isLoading ? "Mise à jour..." : "Modifier le mot de passe"}
          </button>
          {initialError ? <p className="pt-1 text-center text-sm"><Link href="/auth/forgot-password" className="font-semibold text-[var(--mg-accent-strong)] underline">Demander un nouveau lien</Link></p> : null}
        </form>
      )}
    </section>
  );
}
