import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { getSiteContentSettings } from "@/lib/site-content-settings";

export const runtime = "edge";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return NextResponse.json(
      { error: settings.shop_closed_message || "La boutique est temporairement fermee." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
