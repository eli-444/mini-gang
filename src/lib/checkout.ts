import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { RESERVATION_TTL_MINUTES, SHOP_COUNTRY_LABEL, SHOP_CURRENCY } from "@/lib/shop-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PaymentProviderName } from "@/lib/types";

export async function reserveProductsOrThrow(productIds: string[]) {
  const supabase = createSupabaseAdminClient();
  const reservedUntil = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000).toISOString();

  for (const productId of productIds) {
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
  }
}

export async function releaseExpiredReservations() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("vetements")
    .update({ statut: "disponible", reserved_until: null })
    .eq("statut", "reserve")
    .lt("reserved_until", new Date().toISOString())
    .select("id");

  if (error) throw new Error(error.message);
  return { ok: true, released: data?.length ?? 0 };
}

export async function releaseProductReservations(productIds: string[]) {
  if (productIds.length === 0) return;
  const supabase = createSupabaseAdminClient();
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
  items: Array<{ id: string; title: string; price_cents: number }>;
  shippingFeeCents: number;
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
  const itemsTotalCents = input.items.reduce((sum, item) => sum + item.price_cents, 0);
  const amountTotalCents = itemsTotalCents + input.shippingFeeCents;
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

  let { data: order, error: orderError } = await supabase
    .from("commandes")
    .insert({
      ...orderDraft,
      payment_provider: input.provider,
    })
    .select("*")
    .single();

  if (orderError?.message?.toLowerCase().includes("payment_provider")) {
    ({ data: order, error: orderError } = await supabase.from("commandes").insert(orderDraft).select("*").single());
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
    })),
  );
  if (itemsError) throw new Error(`Cannot create order items: ${itemsError.message}`);

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

export async function markOrderPaid(input: { orderId: string; providerPaymentId?: string | null }) {
  const supabase = createSupabaseAdminClient();
  let { data: order, error: orderError } = await supabase
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
    ({ data: order, error: orderError } = await supabase
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
  if (!order) return;

  const { data: orderItems, error: itemsError } = await supabase
    .from("articles_commande")
    .select("vetement_id")
    .eq("commande_id", input.orderId);
  if (itemsError) throw new Error(itemsError.message);

  const productIds = orderItems.map((item) => item.vetement_id).filter(Boolean);
  if (productIds.length > 0) {
    const { error: productError } = await supabase
      .from("vetements")
      .update({ statut: "vendu", reserved_until: null })
      .in("id", productIds);
    if (productError) throw new Error(productError.message);
  }
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

  const { data: orderItems } = await supabase.from("articles_commande").select("vetement_id").eq("commande_id", orderId);
  const productIds = (orderItems ?? []).map((item) => item.vetement_id).filter(Boolean);
  if (productIds.length > 0) {
    await supabase.from("vetements").update({ statut: "disponible", reserved_until: null }).in("id", productIds).eq("statut", "reserve");
  }
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
    .select("id,email,prenom,nom,telephone,adresse_ligne_1,adresse_ligne_2,code_postal,ville,pays,sous_total_centimes,frais_livraison_centimes,total_centimes,statut,cree_le,articles_commande(vetement_id,nom_vetement,taille,prix_centimes)")
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
