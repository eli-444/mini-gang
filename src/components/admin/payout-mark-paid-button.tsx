"use client";

import { useState } from "react";

export function PayoutMarkPaidButton({ payoutId, disabled }: { payoutId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(payload.error ?? "Erreur");
        return;
      }
      setMessage("Paiement marque paid.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button type="button" disabled={loading || disabled} onClick={onClick} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold disabled:opacity-60">
        {loading ? "..." : "Marquer paid"}
      </button>
      {message ? <p className="text-[10px] text-slate-500">{message}</p> : null}
    </div>
  );
}
