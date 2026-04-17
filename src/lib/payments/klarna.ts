import { env } from "@/lib/env";
import type { CheckoutSessionResult, CreateCheckoutInput, PaymentProvider, PaymentWebhookEvent } from "@/lib/payments/provider";
import { SHOP_COUNTRY_CODE, SHOP_CURRENCY } from "@/lib/shop-config";

function basicAuth(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

export class KlarnaProvider implements PaymentProvider {
  name = "klarna" as const;

  isEnabled() {
    return env.enableKlarna && Boolean(env.klarnaApiBaseUrl && env.klarnaUsername && env.klarnaPassword);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    if (!env.klarnaApiBaseUrl || !env.klarnaUsername || !env.klarnaPassword) {
      throw new Error("Klarna is not configured.");
    }

    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitAmountCents, 0);
    const orderLines = input.items.map((item) => ({
      type: "physical",
      name: item.title,
      quantity: item.quantity,
      unit_price: item.unitAmountCents,
      total_amount: item.quantity * item.unitAmountCents,
      total_tax_amount: 0,
      tax_rate: 0,
    }));

    const response = await fetch(`${env.klarnaApiBaseUrl}/checkout/v3/orders`, {
      method: "POST",
      headers: {
        Authorization: basicAuth(env.klarnaUsername, env.klarnaPassword),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purchase_currency: SHOP_CURRENCY,
        purchase_country: SHOP_COUNTRY_CODE,
        locale: "fr-CH",
        order_amount: total,
        order_tax_amount: 0,
        order_lines: orderLines,
        merchant_urls: {
          terms: `${env.publicSiteUrl}/cgv`,
          checkout: `${env.publicSiteUrl}/panier`,
          confirmation: `${input.successUrl}?order_id=${input.orderId}`,
          push: `${env.publicSiteUrl}/api/webhooks/klarna`,
        },
        merchant_reference1: input.orderId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Klarna checkout creation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      order_id?: string;
      html_snippet?: string;
      redirect_url?: string;
    };

    if (!payload.order_id) {
      throw new Error("Klarna response missing order_id.");
    }

    return {
      redirectUrl: payload.redirect_url ?? `${env.publicSiteUrl}/checkout/success?order_id=${input.orderId}`,
      providerSessionId: payload.order_id,
    };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent> {
    const eventId = headers.get("klarna-event-id") ?? crypto.randomUUID();
    if (env.klarnaWebhookSecret) {
      const headerSecret = headers.get("x-klarna-webhook-secret");
      if (headerSecret !== env.klarnaWebhookSecret) {
        throw new Error("Klarna webhook secret mismatch.");
      }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    return {
      id: eventId,
      type: String(payload.event_type ?? "payment.updated"),
      payload,
    };
  }

  extractOrderId(event: PaymentWebhookEvent) {
    return (
      (event.payload.merchant_reference1 as string | undefined) ??
      (event.payload.order_id as string | undefined) ??
      null
    );
  }
}
