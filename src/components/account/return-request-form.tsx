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
      setStatus("Demande envoyée. Nous revenons vers vous par email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-5">
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        required
        minLength={5}
        maxLength={120}
        placeholder="Motif: taille, défaut, colis, autre"
        className="border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-base font-semibold outline-none transition placeholder:text-[var(--mg-ink)]/40 focus:border-[var(--mg-ink)]"
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
        minLength={10}
        rows={4}
        placeholder="Expliquez le problème. Ajoutez les détails utiles."
        className="border-0 border-b-2 border-[var(--mg-ring)] bg-transparent px-0 py-3 text-base font-semibold outline-none transition placeholder:text-[var(--mg-ink)]/40 focus:border-[var(--mg-ink)]"
      />
      <button type="submit" disabled={busy} className="w-fit rounded-full bg-[var(--mg-ink)] px-6 py-3 text-base font-black text-white disabled:opacity-60">
        Envoyer la demande
      </button>
      {status ? <p className="text-base font-semibold text-[var(--mg-ink)]/65">{status}</p> : null}
    </form>
  );
}
