"use client";

import { useMemo, useState } from "react";
import { toChf } from "@/lib/utils";

interface SellOrderItemAction {
  id: string;
  category: string;
  brand: string | null;
  estimated_buyback_cents: number;
  final_buyback_cents: number | null;
  decision: "pending" | "accepted" | "rejected";
}

export function SellOrderAdminActions({
  orderId,
  status,
  items,
}: {
  orderId: string;
  status: string;
  items: SellOrderItemAction[];
}) {
  const [formItems, setFormItems] = useState(
    items.map((item) => ({
      item_id: item.id,
      decision: item.decision === "accepted" || item.decision === "rejected" ? item.decision : "accepted",
      final_buyback_cents: item.final_buyback_cents ?? item.estimated_buyback_cents ?? 0,
    })),
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totalPreview = useMemo(() => {
    return formItems.reduce((sum, item) => {
      if (item.decision !== "accepted") return sum;
      return sum + Math.max(0, Math.round(item.final_buyback_cents));
    }, 0);
  }, [formItems]);

  const markReceived = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/sell-orders/${orderId}/mark-received`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(payload.error ?? "Impossible de marquer recu");
        return;
      }
      setMessage("Dossier marque recu.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const submitDecision = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/sell-orders/${orderId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: formItems }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(payload.error ?? "Decision impossible");
        return;
      }
      setMessage("Decision enregistree. Wallet credite si applicable.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={markReceived}
          disabled={loading}
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold"
        >
          Marquer recu
        </button>
        <button
          type="button"
          onClick={submitDecision}
          disabled={loading}
          className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          Confirmer decision
        </button>
        <span className="rounded-full border border-slate-300 px-3 py-1 text-xs">Statut: {status}</span>
        <span className="rounded-full border border-slate-300 px-3 py-1 text-xs">Total preview: {toChf(totalPreview)}</span>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm">
            <p className="font-semibold">
              {item.category} {item.brand ? `- ${item.brand}` : ""}
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-[180px,180px,1fr]">
              <select
                value={formItems[index].decision}
                onChange={(event) =>
                  setFormItems((prev) =>
                    prev.map((row, rowIndex) => (rowIndex === index ? { ...row, decision: event.target.value as "accepted" | "rejected" } : row)),
                  )
                }
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
              >
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
              </select>
              <input
                type="number"
                value={formItems[index].final_buyback_cents}
                min={0}
                step={1}
                onChange={(event) =>
                  setFormItems((prev) =>
                    prev.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, final_buyback_cents: Number(event.target.value) } : row,
                    ),
                  )
                }
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
              />
              <p className="text-xs text-slate-500">Estime: {toChf(item.estimated_buyback_cents)}</p>
            </div>
          </div>
        ))}
      </div>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
