"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SignupFormProps {
  next?: string;
}

export function SignupForm({ next }: SignupFormProps) {
  const router = useRouter();
  const loginHref = next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login";

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setMessage(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom,
          nom,
          telephone,
          email,
          password,
        }),
      });

      const payload: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Création du compte impossible.");
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
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
          setError("Compte créé, mais la session serveur n'a pas pu être synchronisée.");
          return;
        }
      }

      setMessage("Compte créé.");
      router.push(next || "/mon-compte");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(45,34,64,0.06)]">
      <h1 className="font-display text-3xl">Créer un compte</h1>
      <p className="mt-2 text-sm text-black/60">
        Inscrivez-vous pour vendre vos vêtements, suivre vos dossiers et accéder à votre espace Mini Gang.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={prenom}
            onChange={(event) => setPrenom(event.target.value)}
            type="text"
            autoComplete="given-name"
            required
            minLength={2}
            placeholder="Prénom"
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={nom}
            onChange={(event) => setNom(event.target.value)}
            type="text"
            autoComplete="family-name"
            required
            minLength={2}
            placeholder="Nom"
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <input
          value={telephone}
          onChange={(event) => setTelephone(event.target.value)}
          type="tel"
          autoComplete="tel"
          required
          minLength={6}
          placeholder="Numéro de téléphone"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          placeholder="Mot de passe"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        <input
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          placeholder="Confirmer le mot de passe"
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {message ? <p className="text-xs text-[var(--mg-accent-strong)]">{message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[var(--mg-accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-sm text-black/60">
        Vous avez déjà un compte ?{" "}
        <Link href={loginHref} className="font-semibold text-[var(--mg-accent-strong)] underline">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
