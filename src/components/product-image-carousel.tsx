"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/types";

function getImageSrc(image?: ProductImage) {
  const url = image?.url ?? image?.path;
  if (!url) return "https://placehold.co/1000x1300?text=Mini+Gang";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vetements/${url}`;
}

export function ProductImageCarousel({ images, alt }: { images: ProductImage[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const safeImages = images.length > 0 ? images : [];
  const currentImage = safeImages[index];
  const hasMultipleImages = safeImages.length > 1;

  const previous = () => {
    setIndex((current) => (current === 0 ? safeImages.length - 1 : current - 1));
  };

  const next = () => {
    setIndex((current) => (current === safeImages.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-3 lg:max-w-lg">
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--mg-ring)] bg-white shadow-[0_18px_35px_rgba(45,34,64,0.08)]">
        <button type="button" onClick={() => setZoomed(true)} className="block w-full cursor-zoom-in" aria-label="Zoomer la photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getImageSrc(currentImage)} alt={alt} className="aspect-[4/5] max-h-[62vh] w-full object-contain" />
        </button>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Image precedente"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-xl font-bold text-[var(--mg-ink)] shadow"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/90 text-xl font-bold text-[var(--mg-ink)] shadow"
            >
              {">"}
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="grid grid-cols-3 gap-2">
          {safeImages.slice(0, 6).map((image, imageIndex) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={`overflow-hidden rounded-lg border bg-white ${
                imageIndex === index ? "border-[var(--mg-accent-strong)]" : "border-[var(--mg-ring)]"
              }`}
              aria-label={`Voir image ${imageIndex + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getImageSrc(image)} alt={alt} className="h-24 w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {zoomed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[var(--mg-ink)]"
          >
            Fermer
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getImageSrc(currentImage)} alt={alt} className="max-h-[88vh] max-w-[92vw] object-contain" />
        </div>
      ) : null}
    </div>
  );
}
