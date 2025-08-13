import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProductsStore, type Product } from '@/store/productsStore';
import type { ProductWithIntelligence, ProductsWithAvailabilityResponse } from '../types';

export function useProducts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products: storeProducts, setProducts } = useProductsStore();

  // Transform store products to ProductWithIntelligence for compatibility
  const products: ProductWithIntelligence[] = storeProducts.map(product => ({
    id: product.id,
    name: product.name,
    unit: 'unit', // Default unit
    type: 'ELABORATED' as const,
    description: product.description,
    created_at: product.created_at,
    updated_at: product.updated_at,
    cost: product.cost,
    availability: 0, // TODO: calculate from components
    components_count: product.components.length,
    can_produce: true, // TODO: calculate based on components availability
    production_ready: true, // TODO: calculate based on recipe
    cost_per_unit: product.cost,
    components: [] // TODO: load product components
  }));

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the database function to get products with availability
      const { data, error: dbError } = await supabase
        .rpc('get_products_with_availability');

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!data) {
        setProducts([]);
        return;
      }

      // Transform database products to store product interface
      const transformedProducts: Product[] = data.map((product: ProductsWithAvailabilityResponse) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        category: 'General', // TODO: get from categories table
        price: (product.cost || 0) * 2.5, // Default 150% markup
        cost: product.cost || 0,
        margin: 60, // Will be recalculated
        prep_time: 15, // Default 15 minutes
        active: true,
        created_at: product.created_at,
        updated_at: product.updated_at,
        
        // Menu Engineering fields
        popularity_score: 0,
        profitability_score: 0,
        menu_classification: 'dog' as const,
        
        // Components & Recipes
        components: [], // TODO: load from product_components
        recipe: undefined, // TODO: load from recipes if exists
        
        // Analytics
        sales_count: 0,
        revenue_total: 0,
        last_sold: undefined
      }));

      setProducts(transformedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading products';
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    loadProducts();
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refreshProducts,
    loadProducts
  };
}