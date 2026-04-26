import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const BUCKET_NAME = "vetements";
const ALLOWED_BUCKETS = new Set(["vetements", "site-content"]);

const schema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().max(200).optional(),
  bucket: z.string().max(120).optional(),
  folder: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const bucketName = parsed.data.bucket && ALLOWED_BUCKETS.has(parsed.data.bucket) ? parsed.data.bucket : BUCKET_NAME;
  const folder =
    parsed.data.folder
      ?.toLowerCase()
      .replace(/[^a-z0-9/_-]/g, "")
      .replace(/^\/+|\/+$/g, "")
      .slice(0, 80) ?? new Date().toISOString().slice(0, 10);

  const rawExt = parsed.data.fileName.split(".").pop() ?? "jpg";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const supabase = createSupabaseAdminClient();
  const { error: bucketError } = await supabase.storage.getBucket(bucketName);
  if (bucketError) {
    const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ["application/json", "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
      fileSizeLimit: 8 * 1024 * 1024,
    });

    if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
      return NextResponse.json({ error: createBucketError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase.storage.from(bucketName).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Upload URL creation failed" }, { status: 500 });
  }

  return NextResponse.json({
    bucket: bucketName,
    path,
    token: data.token,
  });
}
