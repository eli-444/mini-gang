"use client";

import { useState } from "react";

interface SellerProfileFormProps {
  initialProfile: Record<string, unknown> | null;
  email: string;
}

export function SellerProfileForm({ initialProfile, email }: SellerProfileFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: (initialProfile?.full_name as string) ?? "",
    phone: (initialProfile?.phone as string) ?? "",
    line1: (initialProfile?.line1 as string) ?? "",
    line2: (initialProfile?.line2 as string) ?? "",
    postal_code: (initialProfile?.postal_code as string) ?? "",
    city: (initialProfile?.city as string) ?? "",
    country: (initialProfile?.country as string) ?? "CH",
    iban_last4: (initialProfile?.iban_last4 as string) ?? "",
    iban_encrypted: (initialProfile?.iban_encrypted as string) ?? "",
    notifications_email: (initialProfile?.notifications_email as boolean) ?? true,
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/seller/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload.error ?? "Enregistrement impossible.");
        return;
      }
      setStatus("Profil mis a jour.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <p className="text-sm text-[var(--mg-ink)]/70">Email du compte: {email}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={form.full_name} onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))} placeholder="Nom complet" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm" />
        <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Telephone" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm" />
        <input value={form.line1} onChange={(event) => setForm((prev) => ({ ...prev, line1: event.target.value }))} placeholder="Adresse ligne 1" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm md:col-span-2" />
        <input value={form.line2} onChange={(event) => setForm((prev) => ({ ...prev, line2: event.target.value }))} placeholder="Adresse ligne 2" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm md:col-span-2" />
        <input value={form.postal_code} onChange={(event) => setForm((prev) => ({ ...prev, postal_code: event.target.value }))} placeholder="Code postal" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm" />
        <input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="Ville" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm" />
        <input value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value.toUpperCase() }))} placeholder="Pays (CH)" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm" maxLength={2} />
        <input value={form.iban_last4} onChange={(event) => setForm((prev) => ({ ...prev, iban_last4: event.target.value }))} placeholder="IBAN 4 derniers caracteres" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm" maxLength={4} />
        <input value={form.iban_encrypted} onChange={(event) => setForm((prev) => ({ ...prev, iban_encrypted: event.target.value }))} placeholder="IBAN (MVP manuel, champ securise plus tard)" className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm md:col-span-2" />
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--mg-ink)]/80">
        <input type="checkbox" checked={form.notifications_email} onChange={(event) => setForm((prev) => ({ ...prev, notifications_email: event.target.checked }))} />
        Recevoir les notifications email
      </label>
      <button type="submit" disabled={isSaving} className="w-fit rounded-full bg-[var(--mg-ink)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {isSaving ? "Enregistrement..." : "Enregistrer le profil"}
      </button>
      {status ? <p className="text-xs text-[var(--mg-ink)]/70">{status}</p> : null}
    </form>
  );
}
