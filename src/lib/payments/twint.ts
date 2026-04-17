import { env } from "@/lib/env";
import type { CheckoutSessionResult, CreateCheckoutInput, PaymentProvider, PaymentWebhookEvent } from "@/lib/payments/provider";
import { createStripeCheckoutSession, StripeProvider } from "@/lib/payments/stripe";

export class TwintProvider implements PaymentProvider {
  name = "twint" as const;

  isEnabled() {
    if (!env.enableTwint) return false;
    if (env.twintProviderMode === "stripe") return Boolean(env.stripeSecretKey);
    return Boolean(env.twintApiBaseUrl && env.twintMerchantId && env.twintApiKey);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    if (env.twintProviderMode === "stripe") {
      return createStripeCheckoutSession(input, {
        currency: env.twintCurrency,
        idempotencyKey: `checkout_twint_${input.orderId}`,
        paymentMethodTypes: ["twint"],
      });
    }

    if (!env.twintApiBaseUrl || !env.twintMerchantId || !env.twintApiKey) {
      throw new Error("TWINT is not configured.");
    }

    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitAmountCents, 0);
    const response = await fetch(`${env.twintApiBaseUrl.replace(/\/$/, "")}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.twintApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `checkout_twint_${input.orderId}`,
      },
      body: JSON.stringify({
        merchant_id: env.twintMerchantId,
        order_id: input.orderId,
        amount: {
          value: total,
          currency: env.twintCurrency.toUpperCase(),
        },
        customer: {
          email: input.email,
        },
        order_lines: input.items.map((item) => ({
          name: item.title,
          quantity: item.quantity,
          unit_amount: item.unitAmountCents,
          total_amount: item.quantity * item.unitAmountCents,
        })),
        redirect_urls: {
          success: `${input.successUrl}?order_id=${input.orderId}`,
          cancel: `${input.cancelUrl}?order_id=${input.orderId}`,
        },
        webhook_url: `${env.publicSiteUrl}/api/webhooks/twint`,
      }),
    });

    if (!response.ok) {
      throw new Error(`TWINT checkout creation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      id?: string;
      session_id?: string;
      redirect_url?: string;
      redirectUrl?: string;
    };
    const providerSessionId = payload.id ?? payload.session_id;
    const redirectUrl = payload.redirect_url ?? payload.redirectUrl;

    if (!providerSessionId || !redirectUrl) {
      throw new Error("TWINT response missing session or redirect URL.");
    }

    return {
      redirectUrl,
      providerSessionId,
    };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent> {
    if (env.twintProviderMode === "stripe") {
      return new StripeProvider().verifyWebhook(rawBody, headers);
    }

    if (env.twintWebhookSecret) {
      const headerSecret = headers.get("x-twint-webhook-secret");
      if (headerSecret !== env.twintWebhookSecret) {
        throw new Error("TWINT webhook secret mismatch.");
      }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    return {
      id: String(payload.id ?? payload.event_id ?? crypto.randomUUID()),
      type: String(payload.type ?? payload.event_type ?? payload.status ?? "payment.updated"),
      payload,
    };
  }

  extractOrderId(event: PaymentWebhookEvent) {
    const object = ((event.payload.data as { object?: Record<string, unknown> })?.object ?? {}) as Record<string, unknown>;
    return (
      (event.payload.order_id as string | undefined) ??
      (event.payload.merchant_reference as string | undefined) ??
      (event.payload.merchant_reference1 as string | undefined) ??
      (object.client_reference_id as string | undefined) ??
      null
    );
  }
}
