import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { adminSellOrderDecideSchema } from "@/lib/validation";
import { decideAdminSellOrder } from "@/lib/sell-orders";

export const runtime = "edge";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const json = await request.json().catch(() => ({}));
  const parsed = adminSellOrderDecideSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await decideAdminSellOrder({
      orderId: id,
      items: parsed.data.items,
      adminUserId: auth.user.id,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Decision failed" }, { status: 400 });
  }
}
