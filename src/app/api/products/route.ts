import { NextResponse } from "next/server";
import { listProducts } from "@/lib/products";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { productFiltersSchema } from "@/lib/validation";

export const runtime = "edge";

export async function GET(request: Request) {
  const settings = await getSiteContentSettings();
  if (!settings.shop_enabled) {
    return NextResponse.json(
      { error: settings.shop_closed_message || "La boutique est temporairement fermee." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const filters = productFiltersSchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!filters.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: filters.error.flatten() }, { status: 400 });
  }

  try {
    const result = await listProducts(filters.data);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list products" },
      { status: 500 },
    );
  }
}
