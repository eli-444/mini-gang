"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type ApiPayload = {
  error?: string;
};

export function PromoCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState("20");
  const [active, setActive] = useState(true);
  const [uniqueUsage, setUniqueUsage] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        percentage,
        active,
        uniqueUsage,
        expiresAt,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as ApiPayload;
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Creation impossible.");
      return;
    }

    setCode("");
    setPercentage("20");
    setActive(true);
    setUniqueUsage(true);
    setExpiresAt("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_150px_190px_160px_auto] md:items-end">
      <label className="grid gap-1 text-sm font-bold text-slate-800">
        Code
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="MINIGANG20"
          className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm uppercase"
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-bold text-slate-800">
        Remise
        <div className="flex rounded-md border border-slate-200 bg-white">
          <input
            value={percentage}
            onChange={(event) => setPercentage(event.target.value)}
            type="number"
            min="1"
            max="90"
            className="min-w-0 flex-1 rounded-md px-3 py-2.5 text-sm outline-none"
            required
          />
          <span className="grid place-items-center px-3 text-sm font-bold text-slate-500">%</span>
        </div>
      </label>

      <label className="grid gap-1 text-sm font-bold text-slate-800">
        Expiration
        <input
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          type="datetime-local"
          className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
        />
      </label>

      <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={uniqueUsage} onChange={(event) => setUniqueUsage(event.target.checked)} />
          Usage unique
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Actif
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Creation..." : "Creer"}
      </button>

      {error ? <p className="text-sm font-semibold text-red-700 md:col-span-full">{error}</p> : null}
    </form>
  );
}
