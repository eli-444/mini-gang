import { env } from "@/lib/env";
import type { OrderShippingLabelInput, OrderShippingLabelResult } from "@/lib/shipping/order-label";

type SwissPostLabelResponse = {
  item?: {
    identCode?: string;
    label?: string | string[];
    errors?: Array<{ code?: string; message?: string }>;
  };
  label?: string | string[];
  identCode?: string;
  errors?: Array<{ code?: string; message?: string }>;
  error?: string;
  error_description?: string;
  message?: string;
  detail?: string;
  title?: string;
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

function limit(value: string | null | undefined, maxLength: number, fallback = "") {
  return clean(value, fallback).slice(0, maxLength);
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
      name1: limit(sender.name, 25, "Mini Gang"),
      street: limit(env.shippingSenderLine1 ?? env.buybackReceiverLine1, 25),
      zip: limit(sender.postalCode, 6),
      city: limit(sender.city, 25),
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
        name1: limit(recipientName, 35, input.order.email),
        street: limit(recipientStreet.street, 35),
        houseNo: limit(recipientStreet.houseNo, 10),
        zip: limit(input.order.code_postal, 10),
        city: limit(input.order.ville, 35),
        country: normalizeCountry(input.order.pays),
        phone: limit(input.order.telephone, 20),
        email: limit(input.order.email, 160),
      },
      attributes: {
        przl: [env.laPosteServiceCode],
        weight: Number.isFinite(env.laPosteDefaultWeightGrams) ? env.laPosteDefaultWeightGrams : 1000,
      },
    },
  };
}

function decodePdf(base64: string) {
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

function pickLabel(label: string | string[] | undefined) {
  if (Array.isArray(label)) return label[0];
  return label;
}

function formatSwissPostError(status: number, payload: SwissPostLabelResponse | Record<string, unknown> | null, rawBody: string) {
  const structured = payload as SwissPostLabelResponse | null;
  const responseErrors = structured?.errors ?? structured?.item?.errors ?? [];
  const messages = responseErrors.map((error) => [error.code, error.message].filter(Boolean).join(" ")).filter(Boolean);
  const direct = [
    structured?.error_description,
    structured?.detail,
    structured?.message,
    structured?.title,
    structured?.error,
  ].filter(Boolean);
  const raw = rawBody.trim();
  return [...messages, ...direct, raw && raw !== "[object Object]" ? raw.slice(0, 1200) : null]
    .filter(Boolean)
    .join(" | ") || `HTTP ${status}`;
}

function parseSwissPostResponse(rawBody: string) {
  if (!rawBody.trim()) return null;
  try {
    return JSON.parse(rawBody) as SwissPostLabelResponse;
  } catch {
    return null;
  }
}

export async function createLaPosteOrderLabel(input: OrderShippingLabelInput): Promise<OrderShippingLabelResult | null> {
  if (!isConfigured()) return null;

  const accessToken = await fetchAccessToken();
  const requestPayload = buildRequestPayload(input);
  const response = await fetch(env.laPosteApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify(requestPayload),
  });

  const rawBody = await response.text();
  const payload = parseSwissPostResponse(rawBody);
  const responseErrors = payload?.errors ?? payload?.item?.errors ?? [];
  if (!response.ok || responseErrors.length > 0) {
    throw new Error(`La Poste label failed (${response.status}): ${formatSwissPostError(response.status, payload, rawBody)}`);
  }

  const labelBase64 = pickLabel(payload?.item?.label) ?? pickLabel(payload?.label);
  if (!labelBase64) {
    throw new Error("La Poste label failed: missing PDF label.");
  }

  return {
    pdfBytes: decodePdf(labelBase64),
    trackingNumber: payload?.item?.identCode ?? payload?.identCode ?? null,
    carrier: "La Poste",
  };
}
