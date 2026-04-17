"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        const exists = get().items.some((item) => item.productId === productId);
        if (exists) return;
        set((state) => ({ items: [...state.items, { productId }] }));
      },
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mini-gang-cart",
    },
  ),
);
