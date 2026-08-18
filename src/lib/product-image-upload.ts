"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_SOURCE_SIZE = 7 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2200;
const DIRECT_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

type UploadUrlPayload = {
  error?: string;
  bucket?: string;
  path?: string;
  token?: string;
};

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} n'est pas une image.`);
  }

  if (file.type === "image/gif" || (DIRECT_UPLOAD_TYPES.has(file.type) && file.size <= 2.5 * 1024 * 1024)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas indisponible");
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob) throw new Error("Compression impossible");

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    if (!DIRECT_UPLOAD_TYPES.has(file.type)) {
      throw new Error(`${file.name} ne peut pas être convertie. Utilisez une image JPEG, PNG ou WebP.`);
    }
    if (file.size > MAX_SOURCE_SIZE) {
      throw new Error(`${file.name} est trop lourde. Utilisez une image de moins de 7 Mo.`);
    }
    return file;
  }
}

export async function uploadProductImage(input: {
  productId: string;
  file: File;
  sortOrder: number;
  principale: boolean;
}) {
  const file = await optimizeImage(input.file);
  const uploadUrlResponse = await fetch("/api/admin/storage/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name.slice(0, 255),
      contentType: file.type || undefined,
      folder: `products/${input.productId}`,
    }),
  });
  const uploadUrl = (await uploadUrlResponse.json().catch(() => ({}))) as UploadUrlPayload;
  if (!uploadUrlResponse.ok || !uploadUrl.path || !uploadUrl.token) {
    throw new Error(uploadUrl.error ?? "Impossible de préparer l'envoi de l'image.");
  }

  const supabase = createSupabaseBrowserClient();
  const { error: uploadError } = await supabase.storage
    .from(uploadUrl.bucket ?? "vetements")
    .uploadToSignedUrl(uploadUrl.path, uploadUrl.token, file, { contentType: file.type });
  if (uploadError) throw new Error(`Envoi de ${input.file.name} impossible : ${uploadError.message}`);

  const imageResponse = await fetch(`/api/admin/products/${input.productId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: uploadUrl.path,
      sort_order: input.sortOrder,
      principale: input.principale,
    }),
  });
  const imagePayload = (await imageResponse.json().catch(() => ({}))) as { error?: string };
  if (!imageResponse.ok) {
    throw new Error(imagePayload.error ?? `Impossible d'associer ${input.file.name} au produit.`);
  }
}
