import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { isMerchCategory } from "@/lib/product-categories";
import { RESERVATION_TTL_MINUTES, SHOP_COUNTRY_LABEL, SHOP_CURRENCY } from "@/lib/shop-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { registerPromoUsageForPaidOrder, type PromoCodeValidation } from "@/lib/promo-codes";
import type { PaymentProviderName } from "@/lib/types";

type ReservableProductRow = {
  id: string;
  categorie?: string | null;
  statut: string;
  quantite_stock?: number | null;
};

export type ProductReservation = {
  productId: string;
  quantity: number;
};

function groupReservations(items: ProductReservation[]) {
  const grouped = new Map<string, number>();
  for (const item of items) {
    grouped.set(item.productId, (grouped.get(item.productId) ?? 0) + Math.max(1, Math.floor(item.quantity)));
  }
  return [...grouped].map(([productId, quantity]) => ({ productId, quantity }));
}

function isMissingMerchStockColumn(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("quantite_stock") || message.includes("categorie");
}

export async function reserveProductsOrThrow(items: ProductReservation[]) {
  const supabase = createSupabaseAdminClient();
  const reservedUntil = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000).toISOString();
  const completedReservations: ProductReservation[] = [];

  try {
    for (const { productId, quantity } of groupReservations(items)) {
      const { data: stockRow, error: stockError } = await supabase
        .from("vetements")
        .select("id,categorie,statut,quantite_stock")
        .eq("id", productId)
        .eq("statut", "disponible")
        .maybeSingle();

      if (stockError && !isMissingMerchStockColumn(stockError)) {
        throw new Error(stockError.message);
      }

      const row = stockRow as ReservableProductRow | null;
      if (row && isMerchCategory(row.categorie)) {
        const currentStock = typeof row.quantite_stock === "number" ? row.quantite_stock : 1;
        if (currentStock < quantity) {
          throw new Error(`Product ${productId} is unavailable.`);
        }

        const nextStock = currentStock - quantity;
        const { data: reserved, error } = await supabase
          .from("vetements")
          .update({
            quantite_stock: nextStock,
            statut: nextStock > 0 ? "disponible" : "reserve",
            reserved_until: nextStock > 0 ? null : reservedUntil,
          })
          .eq("id", productId)
          .eq("statut", "disponible")
          .eq("quantite_stock", currentStock)
          .select("id")
          .maybeSingle();

        if (error || !reserved) {
          throw new Error(`Product ${productId} is unavailable.`);
        }
        completedReservations.push({ productId, quantity });
        continue;
      }

      if (quantity !== 1) {
        throw new Error(`Product ${productId} is a unique item.`);
      }

      const { data: reserved, error } = await supabase
        .from("vetements")
        .update({ statut: "reserve", reserved_until: reservedUntil })
        .eq("id", productId)
        .eq("statut", "disponible")
        .select("id")
        .maybeSingle();

      if (error || !reserved) {
        throw new Error(`Product ${productId} is unavailable.`);
      }
      completedReservations.push({ productId, quantity });
    }
  } catch (error) {
    await releaseProductReservations(completedReservations);
    throw error;
  }
}

export async function releaseExpiredReservations() {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const expiredOrderDate = new Date(Date.now() - RESERVATION_TTL_MINUTES * 60_000).toISOString();
  const { data: expiredOrders } = await supabase
    .from("commandes")
    .select("id")
    .eq("statut", "en_attente")
    .lt("cree_le", expiredOrderDate);

  for (const order of expiredOrders ?? []) {
    await markOrderCancelled(order.id);
  }
  const { data: expiredRows, error: listError } = await supabase
    .from("vetements")
    .select("id,categorie,quantite_stock")
    .eq("statut", "reserve")
    .lt("reserved_until", now);

  if (listError && isMissingMerchStockColumn(listError)) {
    const { data, error } = await supabase
      .from("vetements")
      .update({ statut: "disponible", reserved_until: null })
      .eq("statut", "reserve")
      .lt("reserved_until", now)
      .select("id");

    if (error) throw new Error(error.message);
    return { ok: true, released: data?.length ?? 0 };
  }

  if (listError) throw new Error(listError.message);

  const { data: expiredAvailableMerch } = await supabase
    .from("vetements")
    .select("id,categorie,quantite_stock")
    .eq("statut", "disponible")
    .lt("reserved_until", now);

  const expired = (expiredRows ?? []) as ReservableProductRow[];
  const merchRows = [
    ...expired.filter((item) => isMerchCategory(item.categorie)),
    ...(((expiredAvailableMerch ?? []) as ReservableProductRow[]).filter((item) => isMerchCategory(item.categorie))),
  ];
  for (const row of merchRows) {
    await supabase
      .from("vetements")
      .update({
        statut: "disponible",
        reserved_until: null,
        quantite_stock: (row.quantite_stock ?? 0) + 1,
      })
      .eq("id", row.id);
  }

  const uniqueIds = expired.filter((item) => !isMerchCategory(item.categorie)).map((item) => item.id);
  const { data, error } = await supabase
    .from("vetements")
    .update({ statut: "disponible", reserved_until: null })
    .in("id", uniqueIds.length > 0 ? uniqueIds : ["00000000-0000-0000-0000-000000000000"])
    .select("id");

  if (error) throw new Error(error.message);
  return { ok: true, released: (data?.length ?? 0) + merchRows.length };
}

export async function releaseProductReservations(items: ProductReservation[]) {
  const reservations = groupReservations(items);
  if (reservations.length === 0) return;
  const supabase = createSupabaseAdminClient();
  const productIds = reservations.map((item) => item.productId);
  const quantityById = new Map(reservations.map((item) => [item.productId, item.quantity]));
  const { data: rows, error: rowsError } = await supabase
    .from("vetements")
    .select("id,categorie,quantite_stock")
    .in("id", productIds);

  if (!rowsError) {
    const products = (rows ?? []) as ReservableProductRow[];
    for (const row of products.filter((item) => isMerchCategory(item.categorie))) {
      await supabase
        .from("vetements")
        .update({
          statut: "disponible",
          reserved_until: null,
          quantite_stock: (row.quantite_stock ?? 0) + (quantityById.get(row.id) ?? 1),
        })
        .eq("id", row.id);
    }
  } else if (!isMissingMerchStockColumn(rowsError)) {
    throw new Error(rowsError.message);
  }

  const { error } = await supabase
    .from("vetements")
    .update({ statut: "disponible", reserved_until: null })
    .in("id", productIds)
    .eq("statut", "reserve");
  if (error) throw new Error(error.message);
}

export async function createOrderDraft(input: {
  userId?: string;
  email: string;
  provider: PaymentProviderName;
  items: Array<{
    id: string;
    title: string;
    price_cents: number;
    reference_code?: string | null;
    stock_location?: string | null;
    quantity: number;
  }>;
  shippingFeeCents: number;
  discountCents?: number;
  promoCode?: PromoCodeValidation | null;
  shipping: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
}) {
  if (!input.userId) {
    throw new Error("Connectez-vous pour finaliser la commande.");
  }

  const supabase = createSupabaseAdminClient();
  const itemsTotalCents = input.items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
  const discountCents = Math.min(Math.max(0, input.discountCents ?? 0), itemsTotalCents);
  const amountTotalCents = Math.max(0, itemsTotalCents - discountCents) + input.shippingFeeCents;
  const [prenom = input.shipping.name, ...nomParts] = input.shipping.name.trim().split(/\s+/);
  const nom = nomParts.join(" ") || "-";

  const { error: userError } = await supabase
    .from("utilisateurs")
    .upsert({ id: input.userId, email: input.email }, { onConflict: "id" });
  if (userError) {
    throw new Error(`Cannot ensure user profile: ${userError.message}`);
  }

  const orderDraft = {
    utilisateur_id: input.userId,
    email: input.email,
    prenom,
    nom,
    telephone: input.shipping.phone,
    adresse_ligne_1: input.shipping.line1,
    adresse_ligne_2: input.shipping.line2 || null,
    code_postal: input.shipping.postalCode,
    ville: input.shipping.city,
    pays: input.shipping.country === "CH" ? SHOP_COUNTRY_LABEL : input.shipping.country,
    sous_total_centimes: itemsTotalCents,
    frais_livraison_centimes: input.shippingFeeCents,
    total_centimes: amountTotalCents,
    statut: "en_attente",
    accepted_terms_at: new Date().toISOString(),
  };

  const insertDraft = {
    ...orderDraft,
    payment_provider: input.provider,
    code_promo_id: input.promoCode?.id ?? null,
    code_promo_code: input.promoCode?.code ?? null,
    remise_centimes: discountCents,
  };

  let { data: order, error: orderError } = await supabase
    .from("commandes")
    .insert(insertDraft)
    .select("*")
    .single();

  if (orderError) {
    const message = orderError.message.toLowerCase();
    const fallbackDraft: Record<string, unknown> = { ...orderDraft };
    if (!message.includes("payment_provider")) {
      fallbackDraft.payment_provider = input.provider;
    }
    if (!message.includes("code_promo") && !message.includes("remise_centimes")) {
      fallbackDraft.code_promo_id = input.promoCode?.id ?? null;
      fallbackDraft.code_promo_code = input.promoCode?.code ?? null;
      fallbackDraft.remise_centimes = discountCents;
    }
    ({ data: order, error: orderError } = await supabase.from("commandes").insert(fallbackDraft).select("*").single());
  }

  if (orderError || !order) {
    throw new Error(`Cannot create order draft: ${orderError?.message ?? "unknown error"}`);
  }

  const { error: itemsError } = await supabase.from("articles_commande").insert(
    input.items.map((item) => ({
      commande_id: order.id,
      vetement_id: item.id,
      nom_vetement: item.title,
      taille: "",
      prix_centimes: item.price_cents,
      reference_vetement: item.reference_code ?? null,
      emplacement_stock: item.stock_location ?? null,
      quantite: item.quantity,
    })),
  );
  if (itemsError) {
    const message = itemsError.message.toLowerCase();
    if (!message.includes("reference_vetement") && !message.includes("emplacement_stock") && !message.includes("quantite")) {
      throw new Error(`Cannot create order items: ${itemsError.message}`);
    }
    const includeSnapshots = !message.includes("reference_vetement") && !message.includes("emplacement_stock");
    const includeQuantity = !message.includes("quantite");
    const { error: fallbackItemsError } = await supabase.from("articles_commande").insert(
      input.items.flatMap((item) => {
        const base = {
          commande_id: order.id,
          vetement_id: item.id,
          nom_vetement: item.title,
          taille: "",
          prix_centimes: item.price_cents,
          ...(includeSnapshots ? { reference_vetement: item.reference_code ?? null, emplacement_stock: item.stock_location ?? null } : {}),
          ...(includeQuantity ? { quantite: item.quantity } : {}),
        };
        return includeQuantity ? [base] : Array.from({ length: item.quantity }, () => base);
      }),
    );
    if (fallbackItemsError) throw new Error(`Cannot create order items: ${fallbackItemsError.message}`);
  }

  return order;
}

export async function saveProviderSession(
  orderId: string,
  provider: PaymentProviderName,
  providerSessionId: string,
) {
  const supabase = createSupabaseAdminClient();
  const update = {
    payment_provider: provider,
    provider_session_id: providerSessionId,
    stripe_session_id: providerSessionId,
  };
  let { error } = await supabase.from("commandes").update(update).eq("id", orderId);

  if (error?.message?.toLowerCase().includes("payment_provider") || error?.message?.toLowerCase().includes("provider_session_id")) {
    ({ error } = await supabase.from("commandes").update({ stripe_session_id: providerSessionId }).eq("id", orderId));
  }

  if (error) throw new Error(`Cannot store provider session: ${error.message}`);
}

async function getOrderReservations(orderId: string): Promise<ProductReservation[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles_commande")
    .select("vetement_id,quantite")
    .eq("commande_id", orderId);

  if (error?.message?.toLowerCase().includes("quantite")) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("articles_commande")
      .select("vetement_id")
      .eq("commande_id", orderId);
    if (fallbackError) throw new Error(fallbackError.message);
    return groupReservations(
      (fallbackData ?? [])
        .filter((item) => Boolean(item.vetement_id))
        .map((item) => ({ productId: item.vetement_id as string, quantity: 1 })),
    );
  }
  if (error) throw new Error(error.message);

  return groupReservations(
    (data ?? [])
      .filter((item) => Boolean(item.vetement_id))
      .map((item) => ({ productId: item.vetement_id as string, quantity: Number(item.quantite ?? 1) })),
  );
}

export async function markOrderPaid(input: { orderId: string; providerPaymentId?: string | null }) {
  const supabase = createSupabaseAdminClient();
  let { data: updatedOrder, error: orderError } = await supabase
    .from("commandes")
    .update({
      statut: "payee",
      provider_payment_id: input.providerPaymentId ?? null,
      stripe_payment_intent_id: input.providerPaymentId ?? null,
    })
    .eq("id", input.orderId)
    .neq("statut", "payee")
    .select("id")
    .maybeSingle();

  if (orderError?.message?.toLowerCase().includes("provider_payment_id")) {
    ({ data: updatedOrder, error: orderError } = await supabase
      .from("commandes")
      .update({
        statut: "payee",
        stripe_payment_intent_id: input.providerPaymentId ?? null,
      })
      .eq("id", input.orderId)
      .neq("statut", "payee")
      .select("id")
      .maybeSingle());
  }
  if (orderError) throw new Error(orderError.message);

  if (!updatedOrder) {
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("commandes")
      .select("id")
      .eq("id", input.orderId)
      .maybeSingle();

    if (existingOrderError) throw new Error(existingOrderError.message);
    if (!existingOrder) return;
  }

  const reservations = await getOrderReservations(input.orderId);
  const productIds = reservations.map((item) => item.productId);
  if (productIds.length > 0) {
    const { data: products, error: productListError } = await supabase
      .from("vetements")
      .select("id,categorie,quantite_stock")
      .in("id", productIds);

    if (productListError && !isMissingMerchStockColumn(productListError)) throw new Error(productListError.message);

    if (!productListError) {
      const rows = (products ?? []) as ReservableProductRow[];
      const merch = rows.filter((item) => isMerchCategory(item.categorie));
      const unique = rows.filter((item) => !isMerchCategory(item.categorie)).map((item) => item.id);

      for (const row of merch) {
        const nextStatus = (row.quantite_stock ?? 0) > 0 ? "disponible" : "vendu";
        const { error: merchError } = await supabase
          .from("vetements")
          .update({ statut: nextStatus, reserved_until: null })
          .eq("id", row.id);
        if (merchError) throw new Error(merchError.message);
      }

      if (unique.length > 0) {
        const { error: productError } = await supabase
          .from("vetements")
          .update({ statut: "vendu", reserved_until: null })
          .in("id", unique);
        if (productError) throw new Error(productError.message);
      }
    } else {
      const { error: productError } = await supabase
        .from("vetements")
        .update({ statut: "vendu", reserved_until: null })
        .in("id", productIds);
      if (productError) throw new Error(productError.message);
    }
  }

  await registerPromoUsageForPaidOrder(input.orderId);
}

export async function markOrderCancelled(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: updated, error } = await supabase
    .from("commandes")
    .update({ statut: "annulee" })
    .eq("id", orderId)
    .neq("statut", "payee")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!updated) return;

  const reservations = await getOrderReservations(orderId);
  await releaseProductReservations(reservations);
}

export async function registerPaymentEvent(provider: PaymentProviderName, eventId: string) {
  void provider;
  void eventId;
  return { inserted: true };
}

export function providerUrls() {
  return {
    successUrl: `${env.publicSiteUrl}/checkout/success`,
    cancelUrl: `${env.publicSiteUrl}/checkout/cancel`,
  };
}

export async function loadOrderForEmail(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("commandes")
    .select("id,email,prenom,nom,telephone,adresse_ligne_1,adresse_ligne_2,code_postal,ville,pays,sous_total_centimes,frais_livraison_centimes,total_centimes,statut,cree_le,articles_commande(vetement_id,nom_vetement,taille,prix_centimes,quantite)")
    .eq("id", orderId)
    .single();
  if (error || !data) {
    log.warn("Failed to load order for email", { orderId, error: error?.message });
    return null;
  }
  return {
    id: data.id,
    email: data.email,
    customer_name: `${data.prenom} ${data.nom}`.trim(),
    phone: data.telephone,
    shipping_address: {
      line1: data.adresse_ligne_1,
      line2: data.adresse_ligne_2,
      postalCode: data.code_postal,
      city: data.ville,
      country: data.pays,
    },
    subtotal_cents: data.sous_total_centimes ?? Math.max(0, data.total_centimes - (data.frais_livraison_centimes ?? 0)),
    shipping_cents: data.frais_livraison_centimes ?? 0,
    amount_total_cents: data.total_centimes,
    status: data.statut,
    currency: SHOP_CURRENCY,
    created_at: data.cree_le,
    order_items: data.articles_commande,
  };
}
