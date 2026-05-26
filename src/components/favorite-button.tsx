"use client";

import { useState } from "react";

type FavoriteButtonProps = {
  productId: string;
  initialIsFavorite?: boolean;
  variant?: "card" | "detail";
};

export function FavoriteButton({ productId, initialIsFavorite = false, variant = "card" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isBusy, setIsBusy] = useState(false);

  const toggle = async () => {
    if (isBusy) return;
    setIsBusy(true);
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);

    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: nextValue ? "PUT" : "DELETE",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        setIsFavorite(!nextValue);
        window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        alert(payload.error ?? "Impossible de mettre a jour les favoris.");
        setIsFavorite(!nextValue);
      }
    } catch {
      setIsFavorite(!nextValue);
      alert("Impossible de mettre a jour les favoris pour le moment.");
    } finally {
      setIsBusy(false);
    }
  };

  const label = isFavorite ? "Retirer des favoris" : "Ajouter aux favoris";
  const baseClass =
    "inline-flex items-center justify-center transition disabled:opacity-60";
  const variantClass =
    variant === "detail"
      ? "gap-2 rounded-full border-2 border-[var(--mg-ink)] bg-white px-5 py-2 text-sm font-black text-[var(--mg-ink)]"
      : "h-10 w-10 rounded-full bg-white/90 text-[var(--mg-ink)] shadow-sm backdrop-blur";

  return (
    <button type="button" disabled={isBusy} onClick={toggle} className={`${baseClass} ${variantClass}`} aria-label={label} title={label}>
      <svg
        viewBox="0 0 24 24"
        className={variant === "detail" ? "h-5 w-5" : "h-5 w-5"}
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.4 5.9c-1.7-1.9-4.4-2-6.2-.3L12 7.7 9.8 5.6c-1.8-1.7-4.5-1.6-6.2.3-1.8 2-1.7 5 .2 6.9L12 21l8.2-8.2c1.9-1.9 2-4.9.2-6.9Z" />
      </svg>
      {variant === "detail" ? <span>{isFavorite ? "Dans mes favoris" : "Favori"}</span> : null}
    </button>
  );
}
