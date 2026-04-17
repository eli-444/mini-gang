"use client";

import { useState } from "react";

export function ReturnStatusForm({ returnId, initialStatus }: { returnId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(`/api/admin/returns/${returnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Mise a jour impossible");
      return;
    }
    setMessage("Retour mis a jour.");
    window.location.reload();
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-slate-200 px-2 py-1 text-xs">
        <option value="demande">Demande</option>
        <option value="accepte">Accepte</option>
        <option value="refuse">Refuse</option>
        <option value="rembourse">Rembourse</option>
        <option value="clos">Clos</option>
      </select>
      <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Note admin" className="rounded-md border border-slate-200 px-2 py-1 text-xs" />
      <button type="submit" className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
        OK
      </button>
      {message ? <span className="text-xs text-slate-500">{message}</span> : null}
    </form>
  );
}
