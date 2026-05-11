import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: number) => void;
  toggleItem: (item: WishlistItem) => void;
  clearAll: () => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.productId === item.productId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      toggleItem: (item) => {
        const exists = get().items.find((i) => i.productId === item.productId);
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== item.productId),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      clearAll: () => set({ items: [] }),
      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),
    }),
    {
      name: "bulkhub-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
