import { NextResponse } from "next/server";
import { z } from "zod";
import { releaseExpiredReservations } from "@/lib/checkout";
import { getCartProductsByIds } from "@/lib/products";
import { getSiteContentSettings } from "@/lib/site-content-settings";

const cartProductsSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99).default(1) })).max(50),
});

export async function POST(request: Request) {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return NextResponse.json(
      { error: settings.shop_closed_message || "La boutique est temporairement fermée.", products: [] },
      { status: 503 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = cartProductsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  await releaseExpiredReservations();
  const ids = parsed.data.items.map((item) => item.productId);
  const products = await getCartProductsByIds(ids);
  return NextResponse.json({ products });
}
