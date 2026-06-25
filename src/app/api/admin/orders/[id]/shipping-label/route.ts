import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createOrderShippingLabel } from "@/lib/shipping/order-label";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shippingLabelErrorResponse(message: string) {
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bordereau indisponible</title><style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:32px}main{max-width:720px;margin:auto;background:white;border:1px solid #e2e8f0;border-radius:10px;padding:24px}h1{font-size:24px;margin:0 0 12px}pre{white-space:pre-wrap;background:#f1f5f9;border-radius:8px;padding:12px}</style></head><body><main><h1>Bordereau indisponible</h1><p>La generation du bordereau a echoue.</p><pre>${escapeHtml(message)}</pre><p>Verifiez les variables La Poste et le service code, puis relancez la generation.</p></main></body></html>`,
    {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

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

  let label;
  try {
    label = await createOrderShippingLabel({
      order,
      items: order.articles_commande ?? [],
    });
  } catch (labelError) {
    return shippingLabelErrorResponse(labelError instanceof Error ? labelError.message : "Erreur inconnue.");
  }

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
