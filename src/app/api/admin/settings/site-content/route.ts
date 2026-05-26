import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { saveSiteContentSettings } from "@/lib/site-content-settings";
import { siteContentSettingsSchema } from "@/lib/validation";

export const runtime = "edge";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const json = await request.json().catch(() => ({}));
  const parsed = siteContentSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const settings = await saveSiteContentSettings({
      home_event_enabled: parsed.data.home_event_enabled,
      home_event_title: parsed.data.home_event_title ?? "",
      home_event_text: parsed.data.home_event_text ?? "",
      home_event_image_path: parsed.data.home_event_image_path ?? "",
      home_event_cta_label: parsed.data.home_event_cta_label ?? "",
      home_event_cta_url: parsed.data.home_event_cta_url ?? "",
      shop_enabled: parsed.data.shop_enabled,
      shop_closed_message: parsed.data.shop_closed_message ?? "",
      shop_reopen_date: parsed.data.shop_reopen_date ?? "",
      sell_service_enabled: parsed.data.sell_service_enabled,
      sell_closed_message: parsed.data.sell_closed_message ?? "",
      sell_conditions_text: parsed.data.sell_conditions_text ?? "",
      sell_refused_brands_text: parsed.data.sell_refused_brands_text ?? "",
      sell_explanation_text: parsed.data.sell_explanation_text ?? "",
      orders_enabled: parsed.data.orders_enabled,
      orders_closed_message: parsed.data.orders_closed_message ?? "",
      orders_reopen_date: parsed.data.orders_reopen_date ?? "",
    });
    return NextResponse.json({ settings, updated_by: auth.user.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save site content settings" },
      { status: 500 },
    );
  }
}
