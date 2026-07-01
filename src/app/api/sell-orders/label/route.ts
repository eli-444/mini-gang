import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { getShippingProvider } from "@/lib/shipping";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { sellOrderCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

const conditionLabels: Record<string, string> = {
  new: "Neuf avec étiquettes",
  like_new: "Comme neuf",
  very_good: "Très bon état",
  good: "Bon état",
  fair: "Beaucoup aimé, beaucoup porté",
};

function createOrderNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MG-DEPOT-${stamp}-${random}`;
}

export async function POST(request: Request) {
  const settings = await getSiteContentSettings();
  if (!settings.sell_service_enabled) {
    return NextResponse.json(
      { error: settings.sell_closed_message || "Le service de rachat est temporairement fermé." },
      { status: 403 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = sellOrderCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bordereau impossible.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { user } = await getAuthenticatedUser();
  const orderNumber = createOrderNumber();
  const provider = getShippingProvider(parsed.data.shipping_provider);
  const result = await provider.createLabel({
    userId: user?.id ?? "invite",
    orderId: orderNumber,
    orderNumber,
    shippingProvider: parsed.data.shipping_provider,
    sender: {
      name: parsed.data.sender.name,
      email: parsed.data.sender.email,
      line1: parsed.data.sender.line1,
      line2: parsed.data.sender.line2 || null,
      postalCode: parsed.data.sender.postalCode,
      city: parsed.data.sender.city,
      country: parsed.data.sender.country,
    },
    receiver: {
      name: env.buybackReceiverName,
      line1: env.buybackReceiverLine1,
      postalCode: env.buybackReceiverPostalCode,
      city: env.buybackReceiverCity,
      country: env.buybackReceiverCountry,
      email: env.adminNotificationEmail ?? null,
    },
    items: parsed.data.items.map((item) => ({
      category: item.category,
      brand: item.brand || null,
      sizeLabel: item.size_label || item.age_range || null,
      condition: conditionLabels[item.condition] ?? item.condition,
    })),
    estimatedTotalCents: 0,
  });

  return new Response(Buffer.from(result.pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${orderNumber}.pdf"`,
      "X-Mini-Gang-Order-Number": orderNumber,
    },
  });
}
