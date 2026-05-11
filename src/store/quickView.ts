import { create } from "zustand";

interface QuickViewProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  rating: string | null;
  reviewCount: number | null;
  colors: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  brandName: string | null;
  description: string | null;
  moq: number | null;
}

interface QuickViewState {
  product: QuickViewProduct | null;
  isOpen: boolean;
  open: (product: QuickViewProduct) => void;
  close: () => void;
}

export const useQuickView = create<QuickViewState>((set) => ({
  product: null,
  isOpen: false,
  open: (product) => set({ product, isOpen: true }),
  close: () => set({ isOpen: false, product: null }),
}));
