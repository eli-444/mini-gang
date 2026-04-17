import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getAdminSellOrderById } from "@/lib/sell-orders";

export const runtime = "edge";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const row = await getAdminSellOrderById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
