"use client";

import { useState } from "react";

export function PayoutRequestForm({ maxAmountCents }: { maxAmountCents: number }) {
  const [amountCents, setAmountCents] = useState(Math.min(maxAmountCents, 1000));
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_cents: amountCents }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload.error ?? "Demande de retrait impossible.");
        return;
      }
      setStatus("Demande de retrait envoyee.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">
        Montant a retirer (centimes)
      </label>
      <input
        type="number"
        value={amountCents}
        onChange={(event) => setAmountCents(Number(event.target.value))}
        min={100}
        max={maxAmountCents}
        step={1}
        className="rounded-xl border border-[var(--mg-ring)] px-3 py-2 text-sm"
      />
      <button type="submit" disabled={isLoading || maxAmountCents < 100} className="rounded-full bg-[var(--mg-ink)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
        {isLoading ? "Envoi..." : "Demander un retrait"}
      </button>
      {status ? <p className="text-xs text-[var(--mg-ink)]/70">{status}</p> : null}
    </form>
  );
}
