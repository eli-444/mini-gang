"use client";

import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({ productId }: { productId: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isInCart = useCartStore((state) => state.items.some((item) => item.productId === productId));

  return (
    <button
      type="button"
      onClick={() => {
        if (isInCart) {
          removeItem(productId);
          return;
        }
        addItem(productId);
      }}
      className={`rounded-full px-5 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(76,169,125,0.28)] transition hover:-translate-y-0.5 hover:brightness-95 ${
        isInCart
          ? "border border-[var(--mg-accent-strong)] bg-white text-[var(--mg-accent-strong)]"
          : "bg-[var(--mg-accent-strong)] text-white"
      }`}
    >
      {isInCart ? "Retirer du panier" : "Ajouter au panier"}
    </button>
  );
}
