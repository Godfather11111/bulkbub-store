import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareItem {
  productId: number;
  name: string;
  slug?: string;
  price: number;
  image: string | null;
  categoryName: string;
  rating: number;
  reviewCount: number | null;
  colors: string;
  description: string;
}

interface CompareState {
  items: CompareItem[];
  isOpen: boolean;
  addItem: (item: CompareItem) => void;
  removeItem: (productId: number) => void;
  clearCompare: () => void;
  setIsOpen: (open: boolean) => void;
  isInCompare: (productId: number) => boolean;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.productId === item.productId)) return state;
          if (state.items.length >= 4) return { ...state, isOpen: true };
          return { items: [...state.items, item], isOpen: true };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clearCompare: () => set({ items: [] }),
      setIsOpen: (open) => set({ isOpen: open }),
      isInCompare: (productId) =>
        get().items.some((i) => i.productId === productId),
    }),
    {
      name: "bulkhub-compare",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
