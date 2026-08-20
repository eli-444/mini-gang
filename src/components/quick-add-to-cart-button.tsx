"use client";

import { useCartStore } from "@/lib/cart-store";

export function QuickAddToCartButton({ productId, productTitle }: { productId: string; productTitle: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.items.some((item) => item.productId === productId));

  return (
    <button
      type="button"
      onClick={() => addItem(productId)}
      disabled={isInCart}
      className={`absolute right-4 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full transition md:h-9 md:w-9 ${
        isInCart ? "bg-[var(--mg-accent-strong)] text-white" : "text-[var(--mg-ink)] hover:bg-white/70"
      }`}
      aria-label={isInCart ? `${productTitle} est dans le panier` : `Ajouter ${productTitle} au panier`}
      title={isInCart ? "Déjà dans le panier" : "Ajouter au panier"}
    >
      {isInCart ? (
        <span className="text-base font-black" aria-hidden="true">✓</span>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.4 8.2h9.2l1.1 11.2a1.6 1.6 0 0 1-1.6 1.8H7.9a1.6 1.6 0 0 1-1.6-1.8L7.4 8.2Z" />
          <path d="M9.2 8.2c0-2.4 1.1-4.2 2.8-4.2s2.8 1.8 2.8 4.2" />
        </svg>
      )}
    </button>
  );
}
