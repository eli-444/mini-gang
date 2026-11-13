import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MIN_PAYMENT_LINE_AMOUNT_CENTS = 50;

export type PromoCodeValidation = {
  id: string;
  code: string;
  percentage: number;
  uniqueUsage: boolean;
};

export type DiscountableCheckoutItem = {
  title: string;
  unitAmountCents: number;
  quantity: number;
};

type PromoCodeRow = {
  id: string;
  code: string;
  pourcentage: number;
  actif: boolean;
  usage_unique: boolean;
  expire_le: string | null;
};

export function normalizePromoCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function calculatePromoDiscountCents(subtotalCents: number, percentage: number) {
  if (subtotalCents <= 0 || percentage <= 0) return 0;
  return Math.floor((subtotalCents * percentage) / 100);
}

export function applyDiscountToCheckoutItems(items: DiscountableCheckoutItem[], discountCents: number) {
  const subtotalCents = items.reduce((sum, item) => sum + item.unitAmountCents * item.quantity, 0);
  const minimumTotalCents = items.reduce((sum, item) => sum + MIN_PAYMENT_LINE_AMOUNT_CENTS * item.quantity, 0);
  const targetDiscountCents = Math.min(Math.max(0, discountCents), Math.max(0, subtotalCents - minimumTotalCents));

  if (targetDiscountCents <= 0) {
    return { items, appliedDiscountCents: 0 };
  }

  const discounts = items.map((item) => {
    const maxDiscount = Math.max(0, item.unitAmountCents - MIN_PAYMENT_LINE_AMOUNT_CENTS);
    const share = Math.floor(((item.unitAmountCents * item.quantity) / subtotalCents) * targetDiscountCents);
    return Math.min(maxDiscount, share);
  });

  let remaining = targetDiscountCents - discounts.reduce((sum, value) => sum + value, 0);
  while (remaining > 0) {
    const index = discounts.findIndex((discount, itemIndex) => {
      const maxDiscount = Math.max(0, items[itemIndex].unitAmountCents - MIN_PAYMENT_LINE_AMOUNT_CENTS);
      return discount < maxDiscount;
    });
    if (index < 0) break;
    discounts[index] += 1;
    remaining -= 1;
  }

  const discountedItems = items.map((item, index) => ({
    ...item,
    unitAmountCents: Math.max(MIN_PAYMENT_LINE_AMOUNT_CENTS, item.unitAmountCents - discounts[index]),
  }));

  return {
    items: discountedItems,
    appliedDiscountCents: discounts.reduce((sum, value) => sum + value, 0),
  };
}

export async function validatePromoCodeForCustomer(input: {
  code: string;
  userId?: string;
  email?: string;
}) {
  const code = normalizePromoCode(input.code);
  if (!code) throw new Error("Code promo invalide.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("codes_promo")
    .select("id,code,pourcentage,actif,usage_unique,expire_le")
    .ilike("code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const promo = data as PromoCodeRow | null;

  if (!promo || !promo.actif) {
    throw new Error("Code promo invalide.");
  }
  if (promo.expire_le && new Date(promo.expire_le).getTime() < Date.now()) {
    throw new Error("Code promo expire.");
  }

  if (promo.usage_unique) {
    let usageQuery = supabase
      .from("codes_promo_utilisations")
      .select("id")
      .eq("code_promo_id", promo.id);

    if (input.userId) {
      usageQuery = usageQuery.eq("utilisateur_id", input.userId);
    } else if (input.email) {
      usageQuery = usageQuery.ilike("email", input.email.trim());
    } else {
      throw new Error("Renseignez votre email pour utiliser ce code promo.");
    }

    const { data: usage, error: usageError } = await usageQuery.limit(1).maybeSingle();

    if (usageError) throw new Error(usageError.message);
    if (usage) throw new Error("Ce code promo a déjà été utilisé.");
  }

  return {
    id: promo.id,
    code: promo.code,
    percentage: promo.pourcentage,
    uniqueUsage: promo.usage_unique,
  } satisfies PromoCodeValidation;
}

export async function registerPromoUsageForPaidOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("commandes")
    .select("id,utilisateur_id,email,code_promo_id,code_promo_code,remise_centimes")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("code_promo") || message.includes("remise_centimes")) return;
    throw new Error(error.message);
  }

  if (!order?.code_promo_id || !order.remise_centimes) return;

  const usage = {
    code_promo_id: order.code_promo_id,
    utilisateur_id: order.utilisateur_id ?? null,
    commande_id: order.id,
    email: order.email,
    remise_centimes: order.remise_centimes,
  };

  if (!order.utilisateur_id) {
    const { data: existingUsage, error: existingUsageError } = await supabase
      .from("codes_promo_utilisations")
      .select("id")
      .eq("code_promo_id", order.code_promo_id)
      .ilike("email", order.email)
      .limit(1)
      .maybeSingle();
    if (existingUsageError) throw new Error(existingUsageError.message);
    if (existingUsage) return;

    const { error: insertError } = await supabase.from("codes_promo_utilisations").insert(usage);
    if (insertError && insertError.code !== "23505") throw new Error(insertError.message);
    return;
  }

  const { error: insertError } = await supabase.from("codes_promo_utilisations").upsert(usage, {
    onConflict: "code_promo_id,utilisateur_id",
    ignoreDuplicates: true,
  });

  if (insertError) throw new Error(insertError.message);
}
