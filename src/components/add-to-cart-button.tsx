"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({
  productId,
  isMerch = false,
  stockQuantity = 1,
}: {
  productId: string;
  isMerch?: boolean;
  stockQuantity?: number;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const cartItem = useCartStore((state) => state.items.find((item) => item.productId === productId));
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const maxQuantity = Math.max(1, stockQuantity);
  const quantity = cartItem?.quantity ?? selectedQuantity;

  const changeQuantity = (next: number) => {
    const normalized = Math.min(maxQuantity, Math.max(1, next));
    if (cartItem) setItemQuantity(productId, normalized);
    else setSelectedQuantity(normalized);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {isMerch ? (
        <div className="inline-flex h-10 items-center overflow-hidden rounded-full border border-[var(--mg-ring)] bg-white">
          <button type="button" onClick={() => changeQuantity(quantity - 1)} disabled={quantity <= 1} className="h-full w-10 text-lg font-black disabled:opacity-30" aria-label="Diminuer la quantité">−</button>
          <span className="min-w-8 text-center text-sm font-black" aria-live="polite">{quantity}</span>
          <button type="button" onClick={() => changeQuantity(quantity + 1)} disabled={quantity >= maxQuantity} className="h-full w-10 text-lg font-black disabled:opacity-30" aria-label="Augmenter la quantité">+</button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => {
          if (cartItem) {
            removeItem(productId);
            return;
          }
          addItem(productId, isMerch ? selectedQuantity : 1);
        }}
        className={`rounded-full px-5 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(76,169,125,0.28)] transition hover:-translate-y-0.5 hover:brightness-95 ${
          cartItem
            ? "border border-[var(--mg-accent-strong)] bg-white text-[var(--mg-accent-strong)]"
            : "bg-[var(--mg-accent-strong)] text-white"
        }`}
      >
        {cartItem ? "Retirer du panier" : "Ajouter au panier"}
      </button>
    </div>
  );
}
