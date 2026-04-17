import { NextResponse } from "next/server";
import { requireSellerApi } from "@/lib/seller-api";
import { payoutRequestSchema } from "@/lib/validation";
import { requestPayout } from "@/lib/sell-orders";

export const runtime = "edge";

export async function POST(request: Request) {
  const auth = await requireSellerApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const json = await request.json().catch(() => ({}));
  const parsed = payoutRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const payout = await requestPayout(auth.user.id, parsed.data.amount_cents);
    return NextResponse.json(payout, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payout request failed" },
      { status: 400 },
    );
  }
}
