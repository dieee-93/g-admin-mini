/**
 * useProductCatalog Hook
 * Manages online product catalog operations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { OnlineProduct, OnlineCatalogFilters } from '../types';

export function useProductCatalog() {
  const [products, setProducts] = useState<OnlineProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<OnlineCatalogFilters>({});

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
      logger.info('EcommerceModule', `✅ Loaded ${data?.length || 0} products for online catalog`);
    } catch (err) {
      const error = err as Error;
      logger.error('EcommerceModule', '❌ Error loading products:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update product online visibility
  const updateProductVisibility = async (
    productId: string,
    updates: {
      available_online?: boolean;
      online_visibility?: 'visible' | 'hidden' | 'featured';
      online_price?: number;
      online_stock?: number;
    }
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, ...updates } : p
        )
      );

      logger.info('EcommerceModule', `✅ Updated product ${productId} visibility`);
      return { success: true };
    } catch (err) {
      const error = err as Error;
      logger.error('EcommerceModule', '❌ Error updating product visibility:', error);
      throw error;
    }
  };

  // Toggle product online availability
  const toggleProductOnline = async (productId: string, currentValue: boolean) => {
    const result = await updateProductVisibility(productId, {
      available_online: !currentValue,
      // If enabling, set default visibility
      ...(currentValue ? {} : { online_visibility: 'visible' }),
    });

    // AUTO-CATALOG ASSIGNMENT: Add to default catalog when going online
    if (!currentValue) {
      try {
        // Get default catalog
        const { data: defaultCatalog } = await supabase
          .from('catalogs')
          .select('id')
          .eq('is_default', true)
          .eq('is_active', true)
          .single();

        if (defaultCatalog) {
          // Check if product already in catalog
          const { data: existing } = await supabase
            .from('catalog_products')
            .select('*')
            .eq('catalog_id', defaultCatalog.id)
            .eq('product_id', productId)
            .single();

          if (!existing) {
            // Add product to default catalog
            await supabase.from('catalog_products').insert({
              catalog_id: defaultCatalog.id,
              product_id: productId,
              sort_order: 0,
              is_featured: false,
            });

            logger.info(
              'EcommerceModule',
              '✅ Auto-added product to default catalog',
              { productId }
            );
          }
        }
      } catch (error) {
        // Don't fail if catalog assignment fails - just log
        logger.warn('EcommerceModule', 'Failed to auto-add product to catalog:', error);
      }
    }

    return result;
  };

  // Set product as featured
  const toggleFeatured = async (productId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'featured' ? 'visible' : 'featured';
    return updateProductVisibility(productId, {
      online_visibility: newVisibility as 'visible' | 'featured',
      available_online: true, // Auto-enable when featuring
    });
  };

  // Load products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    fetchProducts,
    updateProductVisibility,
    toggleProductOnline,
    toggleFeatured,
  };
}
