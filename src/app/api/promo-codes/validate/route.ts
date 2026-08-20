import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/products";
import {
  applyDiscountToCheckoutItems,
  calculatePromoDiscountCents,
  validatePromoCodeForUser,
} from "@/lib/promo-codes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { promoCodeValidateSchema } from "@/lib/validation";

export const runtime = "edge";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = promoCodeValidateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Connectez-vous pour utiliser un code promo." }, { status: 401 });
  }

  const ids = [...new Set(parsed.data.items.map((item) => item.productId))];
  const products = await getProductsByIds(ids);
  if (products.length !== ids.length) {
    return NextResponse.json({ error: "Un article du panier n'est plus disponible." }, { status: 409 });
  }
  const quantityById = new Map(parsed.data.items.map((item) => [item.productId, item.quantity]));

  try {
    const promoCode = await validatePromoCodeForUser({ code: parsed.data.code, userId: user.id });
    const subtotalCents = products.reduce(
      (sum, product) => sum + product.price_cents * (quantityById.get(product.id) ?? 1),
      0,
    );
    const { appliedDiscountCents } = applyDiscountToCheckoutItems(
      products.map((product) => ({
        title: product.title,
        unitAmountCents: product.price_cents,
        quantity: quantityById.get(product.id) ?? 1,
      })),
      calculatePromoDiscountCents(subtotalCents, promoCode.percentage),
    );

    return NextResponse.json({
      code: promoCode.code,
      percentage: promoCode.percentage,
      discountCents: appliedDiscountCents,
      subtotalCents,
      discountedSubtotalCents: Math.max(0, subtotalCents - appliedDiscountCents),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Code promo invalide." },
      { status: 400 },
    );
  }
}
