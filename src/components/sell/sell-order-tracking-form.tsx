"use client";

import { useState } from "react";

export function SellOrderTrackingForm({ sellOrderId, currentTracking }: { sellOrderId: string; currentTracking?: string | null }) {
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tracking.trim()) {
      setStatus("Tracking requis.");
      return;
    }

    setIsLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/sell-orders/${sellOrderId}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_number: tracking.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload.error ?? "Mise a jour impossible.");
        return;
      }
      setStatus("Tracking enregistre.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-[var(--mg-ring)] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">Tracking colis</p>
      <input value={tracking} onChange={(event) => setTracking(event.target.value)} className="w-full rounded-lg border border-[var(--mg-ring)] px-3 py-2 text-sm" placeholder="Numero de suivi" />
      <button type="submit" disabled={isLoading} className="rounded-full bg-[var(--mg-ink)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
        {isLoading ? "Envoi..." : "Enregistrer"}
      </button>
      {status ? <p className="text-xs text-[var(--mg-ink)]/70">{status}</p> : null}
    </form>
  );
}
