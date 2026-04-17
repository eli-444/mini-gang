import { NextResponse } from "next/server";
import { StripeProvider } from "@/lib/payments/stripe";
import { handlePaymentWebhook } from "@/lib/webhooks";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    return await handlePaymentWebhook(new StripeProvider(), request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 400 },
    );
  }
}
