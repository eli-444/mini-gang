import type { PaymentProviderName } from "@/lib/types";

export interface CreateCheckoutInput {
  orderId: string;
  email: string;
  items: Array<{ title: string; unitAmountCents: number; quantity: number }>;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  redirectUrl: string;
  providerSessionId: string;
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  isEnabled(): boolean;
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSessionResult>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent>;
  extractOrderId(event: PaymentWebhookEvent): string | null;
}
