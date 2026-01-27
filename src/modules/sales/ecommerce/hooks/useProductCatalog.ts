/**
 * useProductCatalog Hook
 * Manages online product catalog operations
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { OnlineProduct, OnlineCatalogFilters } from '../types';

export const PRODUCT_CATALOG_QUERY_KEY = ['product-catalog'];

export function useProductCatalog() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OnlineCatalogFilters>({});

  // Fetch products with filters
  const { 
    data: products = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: [...PRODUCT_CATALOG_QUERY_KEY, filters],
    queryFn: async () => {
      logger.debug('App', 'Fetching product catalog', filters);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Apply filters
      if (filters.available_online !== undefined) {
        query = query.eq('available_online', filters.available_online);
      }

      if (filters.visibility && filters.visibility !== 'all') {
        query = query.eq('online_visibility', filters.visibility);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      return data as OnlineProduct[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update product online visibility
  const updateProductMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      updates 
    }: { 
      productId: string, 
      updates: {
        available_online?: boolean;
        online_visibility?: 'visible' | 'hidden' | 'featured';
        online_price?: number;
        online_stock?: number;
      } 
    }) => {
      const { error: updateError } = await (supabase
        .from('products') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateError) throw updateError;
      return { productId, updates };
    },
    onSuccess: ({ productId, updates }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATALOG_QUERY_KEY });
      logger.info('App', `✅ Updated product ${productId} visibility`, updates);
    },
    onError: (err: any) => {
      logger.error('App', '❌ Error updating product visibility:', err);
    }
  });

  // Toggle product online availability
  const toggleProductOnline = async (productId: string, currentValue: boolean) => {
    await updateProductMutation.mutateAsync({
      productId,
      updates: {
        available_online: !currentValue,
        // If enabling, set default visibility
        ...(currentValue ? {} : { online_visibility: 'visible' }),
      }
    });

    // AUTO-CATALOG ASSIGNMENT: Add to default catalog when going online
    if (!currentValue) {
      try {
        // Get default catalog
        const { data: defaultCatalog } = await (supabase
          .from('catalogs') as any)
          .select('id')
          .eq('is_default', true)
          .eq('is_active', true)
          .single();

        if (defaultCatalog) {
          // Check if product already in catalog
          const { data: existing } = await (supabase
            .from('catalog_products') as any)
            .select('*')
            .eq('catalog_id', defaultCatalog.id)
            .eq('product_id', productId)
            .single();

          if (!existing) {
            // Add product to default catalog
            await (supabase
              .from('catalog_products') as any)
              .insert({
                catalog_id: defaultCatalog.id,
                product_id: productId,
                sort_order: 0,
                is_featured: false,
              });

            logger.info(
              'App',
              '✅ Auto-added product to default catalog',
              { productId }
            );
          }
        }
      } catch (error) {
        // Don't fail if catalog assignment fails - just log
        logger.warn('App', 'Failed to auto-add product to catalog:', error);
      }
    }
  };

  // Set product as featured
  const toggleFeatured = async (productId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'featured' ? 'visible' : 'featured';
    return updateProductMutation.mutateAsync({
      productId,
      updates: {
        online_visibility: newVisibility as 'visible' | 'featured',
        available_online: true, // Auto-enable when featuring
      }
    });
  };

  return {
    products,
    loading,
    error: error as Error | null,
    filters,
    setFilters,
    fetchProducts: async () => { await queryClient.invalidateQueries({ queryKey: PRODUCT_CATALOG_QUERY_KEY }) },
    updateProductVisibility: (productId: string, updates: any) => 
      updateProductMutation.mutateAsync({ productId, updates }),
    toggleProductOnline,
    toggleFeatured,
  };
}
