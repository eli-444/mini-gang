import { NextResponse } from "next/server";
import { getMerchantPaymentSettings } from "@/lib/admin-settings";
import {
  createOrderDraft,
  markOrderCancelled,
  providerUrls,
  releaseExpiredReservations,
  releaseProductReservations,
  reserveProductsOrThrow,
  saveProviderSession,
} from "@/lib/checkout";
import { log } from "@/lib/logger";
import { getProviderByName } from "@/lib/payments";
import { getProductsByIds } from "@/lib/products";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkoutCreateSchema } from "@/lib/validation";

export const runtime = "edge";

export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const rate = checkRateLimit(`checkout:${ip}`, 10, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = checkoutCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const provider = getProviderByName(parsed.data.provider);
  if (!provider) {
    return NextResponse.json({ error: "Payment provider not available" }, { status: 400 });
  }

  const paymentSettings = await getMerchantPaymentSettings();
  if (provider.name === "stripe" && !paymentSettings.card_payments_enabled) {
    return NextResponse.json({ error: "Card payments are disabled" }, { status: 400 });
  }
  if (provider.name === "twint" && !paymentSettings.twint_payments_enabled) {
    return NextResponse.json({ error: "TWINT payments are disabled" }, { status: 400 });
  }

  const ids = [...new Set(parsed.data.items.map((item) => item.productId))];
  await releaseExpiredReservations();
  const products = await getProductsByIds(ids);
  if (products.length !== ids.length) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 409 });
  }

  let reservedIds: string[] = [];
  let orderId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Connectez-vous pour finaliser la commande." }, { status: 401 });
    }

    await reserveProductsOrThrow(ids);
    reservedIds = ids;

    const order = await createOrderDraft({
      userId: user.id,
      email: parsed.data.email,
      provider: provider.name,
      shippingFeeCents: paymentSettings.shipping_fee_cents,
      items: products.map((product) => ({
        id: product.id,
        title: product.title,
        price_cents: product.price_cents,
      })),
      shipping: parsed.data.shipping,
    });
    orderId = order.id;

    const { successUrl, cancelUrl } = providerUrls();
    const session = await provider.createCheckout({
      orderId: order.id,
      email: parsed.data.email,
      successUrl,
      cancelUrl,
      items: products.map((product) => ({
        title: product.title,
        unitAmountCents: product.price_cents,
        quantity: 1,
      })).concat(
        paymentSettings.shipping_fee_cents > 0
          ? [
              {
                title: "Livraison Suisse",
                unitAmountCents: paymentSettings.shipping_fee_cents,
                quantity: 1,
              },
            ]
          : [],
      ),
    });

    await saveProviderSession(order.id, provider.name, session.providerSessionId);

    log.info("checkout.created", {
      order_id: order.id,
      provider: provider.name,
      provider_session_id: session.providerSessionId,
    });

    return NextResponse.json({ redirectUrl: session.redirectUrl, orderId: order.id });
  } catch (error) {
    if (orderId) {
      try {
        await markOrderCancelled(orderId);
      } catch (cancelError) {
        log.warn("checkout.cancel_failed", {
          message: cancelError instanceof Error ? cancelError.message : "Unknown cancel error",
        });
      }
    }
    if (reservedIds.length > 0) {
      try {
        await releaseProductReservations(reservedIds);
      } catch (releaseError) {
        log.warn("checkout.release_failed", {
          message: releaseError instanceof Error ? releaseError.message : "Unknown release error",
        });
      }
    }
    log.warn("checkout.failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 409 });
  }
}
