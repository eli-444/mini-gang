import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { listAdminSellOrders } from "@/lib/sell-orders";

export const runtime = "edge";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const limit = Number(url.searchParams.get("limit") ?? 30);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const rows = await listAdminSellOrders({
    status,
    limit: Number.isFinite(limit) ? Math.min(Math.max(1, limit), 100) : 30,
    offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
  });

  return NextResponse.json({ rows });
}
