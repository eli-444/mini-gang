"use client";

import { useState } from "react";

export function ReturnRequestForm({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, reason, message }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(payload.error ?? "Demande impossible.");
        return;
      }
      setReason("");
      setMessage("");
      setStatus("Demande envoyee. Nous revenons vers vous par email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3">
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        required
        minLength={5}
        maxLength={120}
        placeholder="Motif: taille, defaut, colis, autre"
        className="rounded-lg border border-[var(--mg-ring)] px-3 py-2 text-sm"
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
        minLength={10}
        rows={4}
        placeholder="Expliquez le probleme. Ajoutez les details utiles."
        className="rounded-lg border border-[var(--mg-ring)] px-3 py-2 text-sm"
      />
      <button type="submit" disabled={busy} className="w-fit rounded-full bg-[var(--mg-ink)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
        Envoyer la demande
      </button>
      {status ? <p className="text-xs font-semibold text-[var(--mg-ink)]/65">{status}</p> : null}
    </form>
  );
}
