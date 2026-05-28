"use client";

import { useState } from "react";
import type { MerchantPaymentSettings } from "@/lib/admin-settings";

type PaymentSettingsFormState = Pick<
  MerchantPaymentSettings,
  "merchant_bank_holder" | "merchant_bank_name" | "merchant_iban" | "shipping_fee_cents" | "card_payments_enabled"
>;

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

function toFormState(settings: MerchantPaymentSettings): PaymentSettingsFormState {
  return {
    merchant_bank_holder: settings.merchant_bank_holder,
    merchant_bank_name: settings.merchant_bank_name,
    merchant_iban: settings.merchant_iban,
    shipping_fee_cents: settings.shipping_fee_cents,
    card_payments_enabled: settings.card_payments_enabled,
  };
}

export function PaymentSettingsForm({ initialSettings }: { initialSettings: MerchantPaymentSettings }) {
  const [form, setForm] = useState<PaymentSettingsFormState>(toFormState(initialSettings));
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

      if (payload.settings) setForm(toFormState(payload.settings));
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
            placeholder="Nom"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Banque
          <input
            value={form.merchant_bank_name}
            onChange={(event) => setForm((prev) => ({ ...prev, merchant_bank_name: event.target.value }))}
            placeholder="Banque"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-normal"
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
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-normal"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        IBAN de versement
        <input
          value={form.merchant_iban}
          onChange={(event) => setForm((prev) => ({ ...prev, merchant_iban: event.target.value }))}
          placeholder="CH00 0000 0000 0000 0000 0"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-normal uppercase"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.card_payments_enabled}
            onChange={(event) => setForm((prev) => ({ ...prev, card_payments_enabled: event.target.checked }))}
          />
          Stripe actif
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer les paiements"}
        </button>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      </div>
    </form>
  );
}

