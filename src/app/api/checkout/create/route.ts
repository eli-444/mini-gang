import { NextResponse } from "next/server";
import { getMerchantPaymentSettings, getTwintRuntimeSettings } from "@/lib/admin-settings";
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
import { getProviderInstance } from "@/lib/payments";
import { isMerchCategory } from "@/lib/product-categories";
import { getProductsByIds } from "@/lib/products";
import {
  applyDiscountToCheckoutItems,
  calculatePromoDiscountCents,
  validatePromoCodeForUser,
} from "@/lib/promo-codes";
import { checkRateLimit } from "@/lib/rate-limit";
import { CLICK_COLLECT_CITY, CLICK_COLLECT_POSTAL_CODE } from "@/lib/fulfillment";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/shop-config";
import { getSiteContentSettings } from "@/lib/site-content-settings";
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

  const [paymentSettings, siteSettings] = await Promise.all([getMerchantPaymentSettings(), getSiteContentSettings()]);
  if (!siteSettings.orders_enabled) {
    return NextResponse.json(
      { error: siteSettings.orders_closed_message || "Les commandes sont temporairement suspendues." },
      { status: 403 },
    );
  }
  if (!siteSettings.shop_enabled) {
    return NextResponse.json(
      { error: siteSettings.shop_closed_message || "La boutique est temporairement fermée." },
      { status: 403 },
    );
  }
  const twintRuntime = await getTwintRuntimeSettings();
  const provider = getProviderInstance(parsed.data.provider);
  if (!provider) {
    return NextResponse.json({ error: "Payment provider not available" }, { status: 400 });
  }

  const providerEnabled =
    provider.name === "stripe"
      ? provider.isEnabled() && paymentSettings.card_payments_enabled
      : provider.name === "twint"
        ? twintRuntime.enabled
        : provider.isEnabled();

  if (!providerEnabled) {
    return NextResponse.json({ error: "Payment provider not available" }, { status: 400 });
  }

  const ids = [...new Set(parsed.data.items.map((item) => item.productId))];
  await releaseExpiredReservations();
  const products = await getProductsByIds(ids);
  if (products.length !== ids.length) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 409 });
  }
  const quantityById = new Map(parsed.data.items.map((item) => [item.productId, item.quantity]));
  const reservationItems = products.map((product) => ({
    productId: product.id,
    quantity: quantityById.get(product.id) ?? 1,
  }));

  if (products.some((product) => !isMerchCategory(product.category) && (quantityById.get(product.id) ?? 1) !== 1)) {
    return NextResponse.json({ error: "Les vêtements de la boutique sont des pièces uniques." }, { status: 400 });
  }

  let reservedItems: typeof reservationItems = [];
  let orderId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Connectez-vous pour finaliser la commande." }, { status: 401 });
    }

    await reserveProductsOrThrow(reservationItems);
    reservedItems = reservationItems;
    const itemsTotalCents = products.reduce(
      (sum, product) => sum + product.price_cents * (quantityById.get(product.id) ?? 1),
      0,
    );
    const isClickCollect = parsed.data.fulfillmentMethod === "click_collect";
    const shippingFeeCents = isClickCollect
      ? 0
      : itemsTotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : paymentSettings.shipping_fee_cents;
    const promoCode = parsed.data.promoCode
      ? await validatePromoCodeForUser({
          code: parsed.data.promoCode,
          userId: user.id,
        })
      : null;
    const productLineItems = products.map((product) => ({
      title: product.title,
      unitAmountCents: product.price_cents,
      quantity: quantityById.get(product.id) ?? 1,
    }));
    const { items: discountedLineItems, appliedDiscountCents } = applyDiscountToCheckoutItems(
      productLineItems,
      promoCode ? calculatePromoDiscountCents(itemsTotalCents, promoCode.percentage) : 0,
    );

    const order = await createOrderDraft({
      userId: user.id,
      email: parsed.data.email,
      provider: provider.name,
      shippingFeeCents,
      discountCents: appliedDiscountCents,
      promoCode,
      fulfillmentMethod: parsed.data.fulfillmentMethod,
      items: products.map((product) => ({
        id: product.id,
        title: product.title,
        price_cents: product.price_cents,
        reference_code: product.reference_code,
        stock_location: product.stock_location,
        quantity: quantityById.get(product.id) ?? 1,
      })),
      shipping: isClickCollect
        ? {
            ...parsed.data.shipping,
            line1: "Adresse communiquée après confirmation",
            line2: "",
            postalCode: CLICK_COLLECT_POSTAL_CODE,
            city: CLICK_COLLECT_CITY,
            country: "CH",
          }
        : {
            ...parsed.data.shipping,
            line1: parsed.data.shipping.line1 ?? "",
            postalCode: parsed.data.shipping.postalCode ?? "",
            city: parsed.data.shipping.city ?? "",
          },
    });
    orderId = order.id;

    const { successUrl, cancelUrl } = providerUrls();
    const session = await provider.createCheckout({
      orderId: order.id,
      email: parsed.data.email,
      successUrl,
      cancelUrl,
      items: discountedLineItems.concat(
        shippingFeeCents > 0
          ? [
              {
                title: "Livraison Suisse",
                unitAmountCents: shippingFeeCents,
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

    if (provider.name === "stripe" && session.clientSecret) {
      return NextResponse.json({
        clientSecret: session.clientSecret,
        orderId: order.id,
        providerSessionId: session.providerSessionId,
      });
    }

    if (!session.redirectUrl) {
      throw new Error("Payment provider response missing redirect URL.");
    }

    return NextResponse.json({ redirectUrl: session.redirectUrl, orderId: order.id });
  } catch (error) {
    let releasedByCancellation = false;
    if (orderId) {
      try {
        await markOrderCancelled(orderId);
        releasedByCancellation = true;
      } catch (cancelError) {
        log.warn("checkout.cancel_failed", {
          message: cancelError instanceof Error ? cancelError.message : "Unknown cancel error",
        });
      }
    }
    if (reservedItems.length > 0 && !releasedByCancellation) {
      try {
        await releaseProductReservations(reservedItems);
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
