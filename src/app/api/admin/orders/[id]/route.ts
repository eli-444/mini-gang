import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { markOrderCancelled, markOrderPaid } from "@/lib/checkout";
import { sendShipmentEmail } from "@/lib/emails";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminOrderStatusSchema, adminShipmentSchema } from "@/lib/validation";

export const runtime = "edge";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("commandes")
    .select("*, articles_commande(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const json = await request.json();
  const parsed = adminOrderStatusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.status === "payee") {
    await markOrderPaid({ orderId: id, providerPaymentId: null });
  } else if (parsed.data.status === "annulee") {
    await markOrderCancelled(id);
  }

  const supabase = createSupabaseAdminClient();
  const updates: { statut: string; internal_notes?: string } = { statut: parsed.data.status };
  if (parsed.data.internal_notes !== undefined) updates.internal_notes = parsed.data.internal_notes;
  const { data, error } = await supabase.from("commandes").update(updates).eq("id", id).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const json = await request.json();
  const parsed = adminShipmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const shipmentInput = {
    order_id: id,
    carrier: parsed.data.carrier,
    tracking_number: parsed.data.tracking_number || null,
    tracking_url: parsed.data.tracking_url || null,
    status: parsed.data.status,
    shipped_at: parsed.data.shipped_at || (parsed.data.status === "expediee" ? new Date().toISOString() : null),
    delivered_at: parsed.data.status === "livree" ? new Date().toISOString() : null,
  };

  const { data: shipment, error } = await supabase
    .from("shipments")
    .insert(shipmentInput)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (parsed.data.status === "expediee" || parsed.data.status === "livree") {
    const orderStatus = parsed.data.status === "livree" ? "livree" : "envoyee";
    const { data: order } = await supabase
      .from("commandes")
      .update({ statut: orderStatus })
      .eq("id", id)
      .select("id,email")
      .single();

    if (order && parsed.data.status === "expediee") {
      void sendShipmentEmail({
        customerEmail: order.email,
        orderId: order.id,
        carrier: parsed.data.carrier,
        trackingNumber: parsed.data.tracking_number || null,
        trackingUrl: parsed.data.tracking_url || null,
      });
    }
  }

  return NextResponse.json({ shipment });
}
