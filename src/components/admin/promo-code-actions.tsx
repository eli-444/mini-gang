"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiPayload = {
  error?: string;
};

export function PromoCodeActions({
  promoId,
  promoCode,
  active,
}: {
  promoId: string;
  promoCode: string;
  active: boolean;
}) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  const patchActive = async () => {
    setIsBusy(true);
    const response = await fetch(`/api/admin/promo-codes/${promoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    const payload = (await response.json().catch(() => ({}))) as ApiPayload;
    setIsBusy(false);

    if (!response.ok) {
      window.alert(payload.error ?? "Modification impossible.");
      return;
    }

    router.refresh();
  };

  const deletePromo = async () => {
    if (!window.confirm(`Supprimer le code ${promoCode} ?`)) return;

    setIsBusy(true);
    const response = await fetch(`/api/admin/promo-codes/${promoId}`, {
      method: "DELETE",
    });
    const payload = (await response.json().catch(() => ({}))) as ApiPayload;
    setIsBusy(false);

    if (!response.ok) {
      window.alert(payload.error ?? "Suppression impossible.");
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={patchActive}
        disabled={isBusy}
        className="font-semibold text-slate-900 underline underline-offset-4 disabled:cursor-wait disabled:opacity-50"
      >
        {active ? "Desactiver" : "Activer"}
      </button>
      <button
        type="button"
        onClick={deletePromo}
        disabled={isBusy}
        className="font-semibold text-red-700 underline underline-offset-4 disabled:cursor-wait disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}
