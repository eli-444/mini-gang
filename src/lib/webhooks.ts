import { loadOrderForEmail, markOrderCancelled, markOrderPaid, registerPaymentEvent } from "@/lib/checkout";
import { sendOrderPaidEmails } from "@/lib/emails";
import { log } from "@/lib/logger";
import type { PaymentProvider } from "@/lib/payments/provider";

export async function handlePaymentWebhook(provider: PaymentProvider, request: Request) {
  const rawBody = await request.text();
  const event = await provider.verifyWebhook(rawBody, request.headers);

  const eventRegistration = await registerPaymentEvent(provider.name, event.id);
  if (!eventRegistration.inserted) {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), { status: 200 });
  }

  const orderId = provider.extractOrderId(event);
  if (!orderId) {
    log.warn("webhook.missing_order_id", { provider: provider.name, event_id: event.id });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  if (
    event.type.includes("completed") ||
    event.type.includes("succeeded") ||
    event.type.includes("captured") ||
    event.type.includes("paid")
  ) {
    const object = ((event.payload.data as { object?: Record<string, unknown> })?.object ?? {}) as Record<string, unknown>;
    const providerPaymentId =
      (object.payment_intent as string | undefined) ??
      (object.id as string | undefined) ??
      (event.payload.payment_id as string | undefined) ??
      (event.payload.transaction_id as string | undefined) ??
      null;

    await markOrderPaid({ orderId, providerPaymentId });
    const order = await loadOrderForEmail(orderId);
    if (order) {
      void sendOrderPaidEmails({
        orderId,
        customerEmail: order.email,
        customerName: order.customer_name,
        subtotalCents: order.subtotal_cents,
        shippingCents: order.shipping_cents,
        totalCents: order.amount_total_cents,
        status: order.status,
        shippingAddress: order.shipping_address,
        items: order.order_items ?? [],
      });
    }
  } else if (
    event.type.includes("expired") ||
    event.type.includes("failed") ||
    event.type.includes("canceled") ||
    event.type.includes("cancelled")
  ) {
    await markOrderCancelled(orderId);
  }

  log.info("webhook.processed", {
    provider: provider.name,
    event_id: event.id,
    event_type: event.type,
    order_id: orderId,
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
