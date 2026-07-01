import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const SITE_CONTENT_BUCKET = "site-content";
const SITE_CONTENT_PATH = "settings/site-content.json";

export interface SiteContentSettings {
  home_event_enabled: boolean;
  home_event_title: string;
  home_event_text: string;
  home_event_image_path: string;
  home_event_cta_label: string;
  home_event_cta_url: string;
  shop_enabled: boolean;
  shop_closed_message: string;
  shop_reopen_date: string;
  sell_service_enabled: boolean;
  sell_closed_message: string;
  sell_conditions_text: string;
  sell_refused_brands_text: string;
  sell_explanation_text: string;
  orders_enabled: boolean;
  orders_closed_message: string;
  orders_reopen_date: string;
}

const defaultSiteContentSettings: SiteContentSettings = {
  home_event_enabled: false,
  home_event_title: "",
  home_event_text: "",
  home_event_image_path: "",
  home_event_cta_label: "",
  home_event_cta_url: "",
  shop_enabled: true,
  shop_closed_message: "La boutique prend une petite pause. Nous revenons tres bientot avec de nouvelles pepites Mini Gang.",
  shop_reopen_date: "",
  sell_service_enabled: false,
  sell_closed_message: "Le service de rachat est temporairement fermé. Nous rouvrirons prochainement les demandes d'envoi de vêtements.",
  sell_conditions_text: "",
  sell_refused_brands_text: "",
  sell_explanation_text: "",
  orders_enabled: true,
  orders_closed_message: "Les commandes sont temporairement suspendues pendant nos vacances. La boutique rouvrira bientot.",
  orders_reopen_date: "",
};

function sanitizeSettings(input: Partial<SiteContentSettings> | null | undefined): SiteContentSettings {
  return {
    home_event_enabled: Boolean(input?.home_event_enabled),
    home_event_title: String(input?.home_event_title ?? "").trim(),
    home_event_text: String(input?.home_event_text ?? "").trim(),
    home_event_image_path: String(input?.home_event_image_path ?? "").trim(),
    home_event_cta_label: String(input?.home_event_cta_label ?? "").trim(),
    home_event_cta_url: String(input?.home_event_cta_url ?? "").trim(),
    shop_enabled: input?.shop_enabled ?? defaultSiteContentSettings.shop_enabled,
    shop_closed_message: String(input?.shop_closed_message ?? defaultSiteContentSettings.shop_closed_message).trim(),
    shop_reopen_date: String(input?.shop_reopen_date ?? "").trim(),
    sell_service_enabled: input?.sell_service_enabled ?? defaultSiteContentSettings.sell_service_enabled,
    sell_closed_message: String(input?.sell_closed_message ?? defaultSiteContentSettings.sell_closed_message).trim(),
    sell_conditions_text: String(input?.sell_conditions_text ?? "").trim(),
    sell_refused_brands_text: String(input?.sell_refused_brands_text ?? "").trim(),
    sell_explanation_text: String(input?.sell_explanation_text ?? "").trim(),
    orders_enabled: input?.orders_enabled ?? defaultSiteContentSettings.orders_enabled,
    orders_closed_message: String(input?.orders_closed_message ?? defaultSiteContentSettings.orders_closed_message).trim(),
    orders_reopen_date: String(input?.orders_reopen_date ?? "").trim(),
  };
}

export async function ensureSiteContentBucket() {
  if (!env.supabaseUrl || (!env.supabaseServiceRoleKey && !env.supabaseAnonKey)) return;

  const supabase = createSupabaseAdminClient();
  const { error: bucketError } = await supabase.storage.getBucket(SITE_CONTENT_BUCKET);
  if (!bucketError) return;

  const { error: createBucketError } = await supabase.storage.createBucket(SITE_CONTENT_BUCKET, {
    public: true,
    allowedMimeTypes: ["application/json", "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    fileSizeLimit: 8 * 1024 * 1024,
  });

  if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
    throw new Error(createBucketError.message);
  }
}

export async function getSiteContentSettings(): Promise<SiteContentSettings> {
  if (!env.supabaseUrl || (!env.supabaseServiceRoleKey && !env.supabaseAnonKey)) {
    return defaultSiteContentSettings;
  }

  const supabase = createSupabaseAdminClient();
  await ensureSiteContentBucket();

  const { data, error } = await supabase.storage.from(SITE_CONTENT_BUCKET).download(SITE_CONTENT_PATH);
  if (error || !data) {
    return defaultSiteContentSettings;
  }

  try {
    const payload = JSON.parse(await data.text()) as Partial<SiteContentSettings>;
    return sanitizeSettings(payload);
  } catch {
    return defaultSiteContentSettings;
  }
}

export async function saveSiteContentSettings(input: Partial<SiteContentSettings>) {
  const supabase = createSupabaseAdminClient();
  await ensureSiteContentBucket();

  const settings = sanitizeSettings(input);
  const payload = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
  const { error } = await supabase.storage.from(SITE_CONTENT_BUCKET).upload(SITE_CONTENT_PATH, payload, {
    contentType: "application/json",
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return settings;
}

export function getSiteContentImageUrl(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const supabase = createSupabaseAdminClient();
  return supabase.storage.from(SITE_CONTENT_BUCKET).getPublicUrl(trimmed).data.publicUrl;
}
