import { NextResponse } from "next/server";
import { TwintProvider } from "@/lib/payments/twint";
import { handlePaymentWebhook } from "@/lib/webhooks";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    return await handlePaymentWebhook(new TwintProvider(), request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 400 },
    );
  }
}
