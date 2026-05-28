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

const inputClass =
  "mt-2 w-full border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-lg font-semibold text-[var(--mg-ink)] outline-none transition placeholder:text-[var(--mg-ink)]/35 focus:border-[var(--mg-ink)]";

const labelClass = "text-sm font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/65";

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
    <form onSubmit={submit} className="grid gap-x-8 gap-y-7 md:grid-cols-2">
      <div className="border-b-2 border-[var(--mg-ring)] pb-4 md:col-span-2">
        <span className={labelClass}>Email</span>
        <p className="mt-2 text-xl font-black leading-tight text-[var(--mg-ink)] md:text-2xl">{profile.email}</p>
      </div>

      <label>
        <span className={labelClass}>Prenom</span>
        <input
          value={prenom}
          onChange={(event) => setPrenom(event.target.value)}
          required
          minLength={2}
          className={inputClass}
        />
      </label>

      <label>
        <span className={labelClass}>Nom</span>
        <input
          value={nom}
          onChange={(event) => setNom(event.target.value)}
          required
          minLength={2}
          className={inputClass}
        />
      </label>

      <label>
        <span className={labelClass}>Telephone</span>
        <input
          value={telephone}
          onChange={(event) => setTelephone(event.target.value)}
          type="tel"
          minLength={6}
          className={inputClass}
        />
      </label>

      {profile.createdAt ? (
        <div className="border-b-2 border-[var(--mg-ring)] pb-3">
          <span className={labelClass}>Inscription</span>
          <p className="mt-2 text-lg font-black text-[var(--mg-ink)]">{profile.createdAt}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-1 md:col-span-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[var(--mg-ink)] px-6 py-3 text-base font-black text-white disabled:opacity-60"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {message ? <p className="text-base font-semibold text-[var(--mg-accent-strong)]">{message}</p> : null}
        {error ? <p className="text-base font-semibold text-red-600">{error}</p> : null}
      </div>
    </form>
  );
}
