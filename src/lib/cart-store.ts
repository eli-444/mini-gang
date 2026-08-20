"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, quantity = 1) => {
        const exists = get().items.some((item) => item.productId === productId);
        if (exists) return;
        set((state) => ({ items: [...state.items, { productId, quantity: Math.max(1, Math.floor(quantity)) }] }));
      },
      setItemQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item,
          ),
        })),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mini-gang-cart",
      merge: (persisted, current) => {
        const stored = persisted as Partial<CartState> | undefined;
        return {
          ...current,
          ...stored,
          items: (stored?.items ?? []).map((item) => ({
            productId: item.productId,
            quantity: Math.max(1, Math.floor(item.quantity ?? 1)),
          })),
        };
      },
    },
  ),
);
