"use client";

import { useState } from "react";

interface ProfileFormProps {
  profile: {
    email: string;
    prenom: string;
    nom: string;
    telephone: string;
    createdAt?: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [prenom, setPrenom] = useState(profile.prenom);
  const [nom, setNom] = useState(profile.nom);
  const [telephone, setTelephone] = useState(profile.telephone);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, telephone }),
      });

      const payload: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Impossible de sauvegarder le profil.");
        return;
      }

      setMessage("Profil mis a jour.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 text-sm md:grid-cols-2">
      <label className="md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-ink)]/60">Email</span>
        <input
          value={profile.email}
          readOnly
          className="mt-1 w-full rounded-xl border border-[var(--mg-ring)] bg-black/[0.03] px-3 py-2 text-sm font-semibold text-[var(--mg-ink)]/70"
        />
        <span className="mt-1 block text-xs text-[var(--mg-ink)]/55">L&apos;email ne peut pas etre modifie depuis cet espace.</span>
      </label>

      <label>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-ink)]/60">Prenom</span>
        <input
          value={prenom}
          onChange={(event) => setPrenom(event.target.value)}
          required
          minLength={2}
          className="mt-1 w-full rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-ink)]/60">Nom</span>
        <input
          value={nom}
          onChange={(event) => setNom(event.target.value)}
          required
          minLength={2}
          className="mt-1 w-full rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-ink)]/60">Telephone</span>
        <input
          value={telephone}
          onChange={(event) => setTelephone(event.target.value)}
          type="tel"
          minLength={6}
          className="mt-1 w-full rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm"
        />
      </label>

      {profile.createdAt ? (
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-ink)]/60">Inscription</span>
          <p className="mt-1 rounded-xl border border-[var(--mg-ring)] bg-black/[0.03] px-3 py-2 text-sm font-semibold text-[var(--mg-ink)]/70">
            {profile.createdAt}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[var(--mg-ink)] px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {message ? <p className="text-xs font-semibold text-[var(--mg-accent-strong)]">{message}</p> : null}
        {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
      </div>
    </form>
  );
}
