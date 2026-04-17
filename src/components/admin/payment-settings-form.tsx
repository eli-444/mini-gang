"use client";

import { useState } from "react";
import type { MerchantPaymentSettings } from "@/lib/admin-settings";

interface ApiErrorPayload {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

function formatApiError(payload: ApiErrorPayload) {
  const fieldErrors = payload.details?.fieldErrors ?? {};
  const flatMessages = Object.entries(fieldErrors)
    .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
    .join(" | ");

  return flatMessages ? `${payload.error ?? "Erreur"} (${flatMessages})` : payload.error ?? "Erreur inconnue";
}

export function PaymentSettingsForm({ initialSettings }: { initialSettings: MerchantPaymentSettings }) {
  const [form, setForm] = useState(initialSettings);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/settings/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload: ApiErrorPayload & { settings?: MerchantPaymentSettings } = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(formatApiError(payload));
        return;
      }

      if (payload.settings) setForm(payload.settings);
      setStatus("Parametres de paiement enregistres.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Titulaire du compte
          <input
            value={form.merchant_bank_holder}
            onChange={(event) => setForm((prev) => ({ ...prev, merchant_bank_holder: event.target.value }))}
            placeholder="Le Mini Gang"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Banque
          <input
            value={form.merchant_bank_name}
            onChange={(event) => setForm((prev) => ({ ...prev, merchant_bank_name: event.target.value }))}
            placeholder="Nom de la banque"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Frais de livraison Suisse (centimes CHF)
        <input
          value={form.shipping_fee_cents}
          onChange={(event) => setForm((prev) => ({ ...prev, shipping_fee_cents: Number(event.target.value) }))}
          type="number"
          min={0}
          max={5000}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
        />
        <span className="text-xs font-normal text-slate-500">
          Ajoute une ligne separee au checkout carte/TWINT. Exemple: 790 = CHF 7.90.
        </span>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        IBAN de versement
        <input
          value={form.merchant_iban}
          onChange={(event) => setForm((prev) => ({ ...prev, merchant_iban: event.target.value }))}
          placeholder="CH00 0000 0000 0000 0000 0"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal uppercase"
        />
        <span className="text-xs font-normal text-slate-500">
          Stocke cote admin uniquement. Le versement bancaire reel reste a configurer chez le prestataire de paiement.
        </span>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.card_payments_enabled}
            onChange={(event) => setForm((prev) => ({ ...prev, card_payments_enabled: event.target.checked }))}
          />
          Carte bancaire activee
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.twint_payments_enabled}
            onChange={(event) => setForm((prev) => ({ ...prev, twint_payments_enabled: event.target.checked }))}
          />
          TWINT active dans l&apos;admin
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Merchant ID TWINT
          <input
            value={form.twint_merchant_id}
            onChange={(event) => setForm((prev) => ({ ...prev, twint_merchant_id: event.target.value }))}
            placeholder="A renseigner ensuite"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          URL API TWINT
          <input
            value={form.twint_api_base_url}
            onChange={(event) => setForm((prev) => ({ ...prev, twint_api_base_url: event.target.value }))}
            placeholder="https://..."
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Reference cle API
          <input
            value={form.twint_api_key_reference}
            onChange={(event) => setForm((prev) => ({ ...prev, twint_api_key_reference: event.target.value }))}
            placeholder="Nom du secret env"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer les paiements"}
        </button>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      </div>
    </form>
  );
}
