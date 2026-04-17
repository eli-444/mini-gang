import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { markAdminSellOrderReceived } from "@/lib/sell-orders";

export const runtime = "edge";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  try {
    const row = await markAdminSellOrderReceived(id, auth.user.id);
    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to mark received" }, { status: 400 });
  }
}
