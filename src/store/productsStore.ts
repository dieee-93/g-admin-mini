import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { type ProductWithIntelligence, type ProductComponent } from '@/pages/admin/supply-chain/products/types';

export interface ProductsState {
  // Data
  products: ProductWithIntelligence[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProducts: (products: ProductWithIntelligence[]) => void;
  addProduct: (product: ProductWithIntelligence) => void;
  updateProduct: (id: string, updates: Partial<ProductWithIntelligence>) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed getters
  getProductById: (id: string) => ProductWithIntelligence | undefined;
  getProductsWithRecipes: () => ProductWithIntelligence[];
  getProductsByType: (type: string) => ProductWithIntelligence[];
}

export const useProductsStore = create<ProductsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: [],
        isLoading: false,
        error: null,
        
        // Actions
        setProducts: (products) => set({ products }),
        
        addProduct: (product) => set(state => ({
          products: [...state.products, product]
        })),
        
        updateProduct: (id, updates) => set(state => ({
          products: state.products.map(product =>
            product.id === id ? { ...product, ...updates } : product
          )
        })),
        
        removeProduct: (id) => set(state => ({
          products: state.products.filter(product => product.id !== id)
        })),
        
        setLoading: (isLoading) => set({ isLoading }),
        setError: (_error) => set({ error: _error }),
        
        // Computed getters
        getProductById: (id) => {
          return get().products.find(product => product.id === id);
        },
        
        getProductsWithRecipes: () => {
          return get().products.filter(product => 
            product.components && product.components.length > 0
          );
        },
        
        getProductsByType: (type) => {
          return get().products.filter(product => product.type === type);
        }
      }),
      {
        name: 'g-mini-products-storage',
        partialize: (state) => ({
          products: state.products
        })
      }
    ),
    {
      name: 'ProductsStore'
    }
  )
);