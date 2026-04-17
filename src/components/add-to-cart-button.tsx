"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({ productId }: { productId: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="rounded-full bg-[var(--mg-accent-strong)] px-5 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(76,169,125,0.45)] transition hover:-translate-y-0.5 hover:brightness-95"
    >
      {added ? "Ajoute" : "Ajouter au panier"}
    </button>
  );
}
