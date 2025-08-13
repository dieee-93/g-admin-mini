import { create } from 'zustand';

export interface ProductsState {
  // Basic products state
  isLoading: boolean;
  error: string | null;
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  isLoading: false,
  error: null,
}));