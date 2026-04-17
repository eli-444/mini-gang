import { NextResponse } from "next/server";
import { listProducts } from "@/lib/products";
import { productFiltersSchema } from "@/lib/validation";

export const runtime = "edge";

export async function GET(request: Request) {
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
