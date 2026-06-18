import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createOrderShippingLabel } from "@/lib/shipping/order-label";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("commandes")
    .select("*, articles_commande(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const label = await createOrderShippingLabel({
    order,
    items: order.articles_commande ?? [],
  });

  if (label.trackingNumber) {
    const trackingUrl = `https://service.post.ch/EasyTrack/submitParcelData.do?formattedParcelCodes=${encodeURIComponent(label.trackingNumber)}`;
    await supabase.from("shipments").insert({
      order_id: order.id,
      carrier: label.carrier ?? "La Poste",
      tracking_number: label.trackingNumber,
      tracking_url: trackingUrl,
      status: "preparation",
      shipped_at: null,
      delivered_at: null,
    });
  }

  const fileName = `mini-gang-commande-${order.id.slice(0, 8)}.pdf`;
  return new Response(Buffer.from(label.pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
