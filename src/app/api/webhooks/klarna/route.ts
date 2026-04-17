import { NextResponse } from "next/server";
import { KlarnaProvider } from "@/lib/payments/klarna";
import { handlePaymentWebhook } from "@/lib/webhooks";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    return await handlePaymentWebhook(new KlarnaProvider(), request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 400 },
    );
  }
}
