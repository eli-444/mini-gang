import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { markAdminPayoutPaid } from "@/lib/sell-orders";

export const runtime = "edge";

const schema = z.object({
  admin_note: z.string().trim().max(800).optional().or(z.literal("")),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const json = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await markAdminPayoutPaid({
      payoutId: id,
      adminNote: parsed.data.admin_note || null,
      adminUserId: auth.user.id,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payout update failed" }, { status: 400 });
  }
}
