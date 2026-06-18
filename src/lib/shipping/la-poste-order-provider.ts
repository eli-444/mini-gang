import { env } from "@/lib/env";
import type { OrderShippingLabelInput, OrderShippingLabelResult } from "@/lib/shipping/order-label";

type SwissPostLabelResponse = {
  item?: {
    identCode?: string;
    label?: string;
    errors?: Array<{ code?: string; message?: string }>;
  };
  label?: string;
  identCode?: string;
  errors?: Array<{ code?: string; message?: string }>;
};

function isConfigured() {
  return Boolean(
    env.enableLaPoste &&
      env.laPosteTokenUrl &&
      env.laPosteApiUrl &&
      env.laPosteClientId &&
      env.laPosteClientSecret &&
      env.laPosteFrankingLicense,
  );
}

function normalizeCountry(value: string | null | undefined) {
  const country = String(value ?? "CH").trim().toUpperCase();
  if (country === "SUISSE" || country === "SWITZERLAND") return "CH";
  return country.length === 2 ? country : "CH";
}

function clean(value: string | null | undefined, fallback = "") {
  return String(value ?? fallback).trim();
}

function splitStreet(line1: string | null | undefined) {
  const value = clean(line1);
  const match = value.match(/^(.*?)(?:\s+(\d+\w?))$/);
  return {
    street: match?.[1]?.trim() || value,
    houseNo: match?.[2]?.trim() || "",
  };
}

function senderAddress() {
  const street = splitStreet(env.shippingSenderLine1 ?? env.buybackReceiverLine1);
  return {
    name: env.shippingSenderName ?? env.buybackReceiverName,
    street,
    postalCode: env.shippingSenderPostalCode ?? env.buybackReceiverPostalCode,
    city: env.shippingSenderCity ?? env.buybackReceiverCity,
    country: normalizeCountry(env.shippingSenderCountry ?? env.buybackReceiverCountry),
  };
}

async function fetchAccessToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.laPosteClientId ?? "",
    client_secret: env.laPosteClientSecret ?? "",
    scope: env.laPosteScope,
  });

  const response = await fetch(env.laPosteTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const payload = (await response.json().catch(() => null)) as { access_token?: string; error_description?: string; error?: string } | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(`La Poste token failed (${response.status}): ${payload?.error_description ?? payload?.error ?? "unknown error"}`);
  }

  return payload.access_token;
}

function buildRequestPayload(input: OrderShippingLabelInput) {
  const sender = senderAddress();
  const recipientStreet = splitStreet(input.order.adresse_ligne_1);
  const recipientName = `${input.order.prenom ?? ""} ${input.order.nom ?? ""}`.trim() || input.order.email;
  const itemId = `MG-${input.order.id.slice(0, 12)}`;

  return {
    language: "FR",
    frankingLicense: env.laPosteFrankingLicense,
    customer: {
      name1: sender.name,
      street: sender.street.street,
      houseNo: sender.street.houseNo,
      zip: sender.postalCode,
      city: sender.city,
      country: sender.country,
    },
    labelDefinition: {
      labelLayout: env.laPosteLabelLayout,
      printAddresses: "RECIPIENT_AND_CUSTOMER",
      imageFileType: env.laPosteLabelFileType,
      imageResolution: 300,
      printPreview: env.laPostePrintPreview,
    },
    item: {
      itemID: itemId,
      recipient: {
        name1: recipientName,
        street: recipientStreet.street,
        houseNo: recipientStreet.houseNo,
        zip: clean(input.order.code_postal),
        city: clean(input.order.ville),
        country: normalizeCountry(input.order.pays),
        phone: clean(input.order.telephone),
        email: clean(input.order.email),
      },
      attributes: {
        przl: [env.laPosteServiceCode],
        weight: Number.isFinite(env.laPosteDefaultWeightGrams) ? env.laPosteDefaultWeightGrams : 1000,
      },
      notification: {
        email: clean(input.order.email),
      },
      content: input.items.map((item) => ({
        description: clean(item.nom_vetement ?? item.vetement_id, "Article"),
        quantity: 1,
      })),
    },
  };
}

function decodePdf(base64: string) {
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

export async function createLaPosteOrderLabel(input: OrderShippingLabelInput): Promise<OrderShippingLabelResult | null> {
  if (!isConfigured()) return null;

  const accessToken = await fetchAccessToken();
  const response = await fetch(env.laPosteApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildRequestPayload(input)),
  });

  const payload = (await response.json().catch(() => null)) as SwissPostLabelResponse | null;
  const responseErrors = payload?.errors ?? payload?.item?.errors ?? [];
  if (!response.ok || responseErrors.length > 0) {
    const message = responseErrors.map((error) => error.message ?? error.code).filter(Boolean).join(" | ");
    throw new Error(`La Poste label failed (${response.status}): ${message || "unknown error"}`);
  }

  const labelBase64 = payload?.item?.label ?? payload?.label;
  if (!labelBase64) {
    throw new Error("La Poste label failed: missing PDF label.");
  }

  return {
    pdfBytes: decodePdf(labelBase64),
    trackingNumber: payload?.item?.identCode ?? payload?.identCode ?? null,
    carrier: "La Poste",
  };
}
