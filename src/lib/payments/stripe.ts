import { env } from "@/lib/env";
import type { CheckoutSessionResult, CreateCheckoutInput, PaymentProvider, PaymentWebhookEvent } from "@/lib/payments/provider";
import { SHOP_CURRENCY_LOWER } from "@/lib/shop-config";

interface StripeCheckoutOptions {
  currency: string;
  idempotencyKey: string;
  paymentMethodTypes: string[];
  uiMode?: "hosted" | "embedded_page";
}

type StripeErrorPayload = {
  error?: {
    message?: string;
    param?: string;
    type?: string;
    code?: string;
  };
};

function parseStripeSignature(signatureHeader: string) {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  return { timestamp, signatures };
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function hmacSha256(secret: string, payload: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createStripeCheckoutSession(
  input: CreateCheckoutInput,
  options: StripeCheckoutOptions,
): Promise<CheckoutSessionResult> {
  if (!env.stripeSecretKey) {
    throw new Error("Stripe is not configured.");
  }

  const currency = options.currency.toLowerCase();
  const lineItems = input.items.map((item, index) => ({
    [`line_items[${index}][price_data][currency]`]: currency,
    [`line_items[${index}][price_data][product_data][name]`]: item.title,
    [`line_items[${index}][price_data][unit_amount]`]: String(item.unitAmountCents),
    [`line_items[${index}][quantity]`]: String(item.quantity),
  }));

  const formData = new URLSearchParams({
    mode: "payment",
    customer_email: input.email,
    client_reference_id: input.orderId,
    "metadata[orderId]": input.orderId,
    "payment_intent_data[metadata][orderId]": input.orderId,
  });

  if (options.uiMode === "embedded_page") {
    formData.append("ui_mode", "embedded_page");
    formData.append("return_url", `${input.successUrl}?order_id=${input.orderId}&session_id={CHECKOUT_SESSION_ID}`);
  } else {
    formData.append("success_url", `${input.successUrl}?order_id=${input.orderId}`);
    formData.append("cancel_url", `${input.cancelUrl}?order_id=${input.orderId}`);
  }

  options.paymentMethodTypes.forEach((method, index) => {
    formData.append(`payment_method_types[${index}]`, method);
  });

  for (const item of lineItems) {
    for (const [key, value] of Object.entries(item)) {
      formData.append(key, value);
    }
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": options.idempotencyKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as StripeErrorPayload | null;
    const stripeError = payload?.error;
    const details = [
      stripeError?.message,
      stripeError?.param ? `param: ${stripeError.param}` : null,
      stripeError?.code ? `code: ${stripeError.code}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    throw new Error(`Stripe checkout creation failed (${response.status})${details ? `: ${details}` : ""}`);
  }

  const session = (await response.json()) as { id: string; url?: string; client_secret?: string };
  if (options.uiMode === "embedded_page" && !session.client_secret) {
    throw new Error("Stripe checkout response missing embedded client secret.");
  }
  if (options.uiMode !== "embedded_page" && !session.url) {
    throw new Error("Stripe checkout response missing redirect URL.");
  }

  return {
    redirectUrl: session.url,
    clientSecret: session.client_secret,
    providerSessionId: session.id,
  };
}

export class StripeProvider implements PaymentProvider {
  name = "stripe" as const;

  isEnabled() {
    return env.enableStripe && Boolean(env.stripeSecretKey);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    return createStripeCheckoutSession(input, {
      currency: SHOP_CURRENCY_LOWER,
      idempotencyKey: `checkout_card_${input.orderId}`,
      paymentMethodTypes: ["card"],
      uiMode: "embedded_page",
    });
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent> {
    const signatureHeader = headers.get("stripe-signature");
    if (!signatureHeader || !env.stripeWebhookSecret) {
      throw new Error("Invalid Stripe webhook signature configuration.");
    }

    const { timestamp, signatures } = parseStripeSignature(signatureHeader);
    if (!timestamp || signatures.length === 0) {
      throw new Error("Malformed Stripe signature header.");
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = await hmacSha256(env.stripeWebhookSecret, signedPayload);
    const isValid = signatures.some((signature) => timingSafeEqualHex(signature, expectedSignature));
    if (!isValid) {
      throw new Error("Stripe webhook signature mismatch.");
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    return {
      id: String(payload.id ?? ""),
      type: String(payload.type ?? ""),
      payload,
    };
  }

  extractOrderId(event: PaymentWebhookEvent) {
    const object = ((event.payload.data as { object?: Record<string, unknown> })?.object ?? {}) as Record<string, unknown>;
    return (object.client_reference_id as string | null) ?? null;
  }
}
