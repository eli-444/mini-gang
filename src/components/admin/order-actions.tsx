"use client";

import { useState } from "react";
import type { OrderStatus } from "@/lib/types";

const actions: Array<{ status: OrderStatus; label: string }> = [
  { status: "payee", label: "Marquer payee" },
  { status: "preparee", label: "Preparer" },
  { status: "envoyee", label: "Expedier" },
  { status: "livree", label: "Livrer" },
  { status: "annulee", label: "Annuler" },
  { status: "remboursee", label: "Rembourser manuel" },
];

export function AdminOrderActions({ orderId, initialNotes }: { orderId: string; initialNotes?: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [carrier, setCarrier] = useState("Poste CH");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("expediee");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateStatus = async (status: OrderStatus) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internal_notes: notes }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Action impossible");
      setMessage("Commande mise a jour.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  const saveShipment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          status: shipmentStatus,
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Livraison impossible");
      setMessage("Livraison enregistree.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={busy}
            onClick={() => updateStatus(action.status)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Notes internes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
        />
      </label>

      <form onSubmit={saveShipment} className="grid gap-3 rounded-lg border border-slate-200 p-3">
        <h3 className="text-sm font-semibold uppercase text-slate-500">Tracking manuel</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <input value={carrier} onChange={(event) => setCarrier(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={shipmentStatus} onChange={(event) => setShipmentStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="preparation">Preparation</option>
            <option value="expediee">Expediee</option>
            <option value="livree">Livree</option>
            <option value="incident">Incident</option>
          </select>
          <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Numero de suivi" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="URL tracking" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={busy || carrier.length < 2} className="w-fit rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          Enregistrer la livraison
        </button>
      </form>

      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
