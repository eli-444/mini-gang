import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const SITE_CONTENT_BUCKET = "site-content";
const SITE_CONTENT_PATH = "settings/site-content.json";

export interface SiteContentSettings {
  home_event_enabled: boolean;
  home_event_title: string;
  home_event_text: string;
  home_event_image_path: string;
  home_event_cta_label: string;
  home_event_cta_url: string;
}

const defaultSiteContentSettings: SiteContentSettings = {
  home_event_enabled: false,
  home_event_title: "",
  home_event_text: "",
  home_event_image_path: "",
  home_event_cta_label: "",
  home_event_cta_url: "",
};

function sanitizeSettings(input: Partial<SiteContentSettings> | null | undefined): SiteContentSettings {
  return {
    home_event_enabled: Boolean(input?.home_event_enabled),
    home_event_title: String(input?.home_event_title ?? "").trim(),
    home_event_text: String(input?.home_event_text ?? "").trim(),
    home_event_image_path: String(input?.home_event_image_path ?? "").trim(),
    home_event_cta_label: String(input?.home_event_cta_label ?? "").trim(),
    home_event_cta_url: String(input?.home_event_cta_url ?? "").trim(),
  };
}

export async function ensureSiteContentBucket() {
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
