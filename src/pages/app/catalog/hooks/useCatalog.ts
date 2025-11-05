import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  online_price: number;
  online_stock: number | null;
  stock: number;
  available_online: boolean;
  is_featured: boolean;
  image_url: string | null;
  category_id: string | null;
  category_name?: string | null;
}

interface UseCatalogOptions {
  searchTerm?: string;
  categoryId?: string | null;
  autoLoad?: boolean;
}

interface UseCatalogReturn {
  products: CatalogProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCatalog(options: UseCatalogOptions = {}): UseCatalogReturn {
  const { searchTerm = '', categoryId, autoLoad = true } = options;
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          online_price,
          online_stock,
          stock,
          available_online,
          is_featured,
          image_url,
          category_id,
          categories:category_id (
            name
          )
        `)
        .eq('available_online', true)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply category filter
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to include category name
      const transformedProducts = (data || []).map((product: any) => ({
        ...product,
        category_name: product.categories?.name || null,
        online_price: product.online_price || product.price, // Fallback to regular price
      }));

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching catalog products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      fetchProducts();
    }
  }, [searchTerm, categoryId, autoLoad]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}
