/**
 * useCatalogs Hook
 * Manages product catalogs for e-commerce
 *
 * FEATURES:
 * - CRUD operations for catalogs
 * - Assign/unassign products to catalogs
 * - Get default catalog
 * - Manage featured products per catalog
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { Catalog, CatalogProduct } from '../types';

export const CATALOGS_QUERY_KEY = ['catalogs'];
export const CATALOG_PRODUCTS_QUERY_KEY = (catalogId: string) => ['catalogs', catalogId, 'products'];

export function useCatalogs() {
  const queryClient = useQueryClient();

  // Fetch all catalogs
  const { 
    data: catalogs = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: CATALOGS_QUERY_KEY,
    queryFn: async () => {
      logger.debug('App', 'Fetching catalogs');
      const { data, error: fetchError } = await supabase
        .from('catalogs')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (fetchError) throw fetchError;
      return data as Catalog[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get default catalog
  const getDefaultCatalog = useCallback(async (): Promise<Catalog | null> => {
    // Try to find in cache first
    const cachedDefault = catalogs.find(c => c.is_default && c.is_active);
    if (cachedDefault) return cachedDefault;

    // Fallback to fetch
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Catalog;
    } catch (err) {
      logger.error('App', '❌ Error getting default catalog:', err);
      return null;
    }
  }, [catalogs]);

  // Create new catalog
  const createCatalogMutation = useMutation({
    mutationFn: async (catalog: {
      name: string;
      description?: string;
      type?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await (supabase
        .from('catalogs') as any)
        .insert({
          name: catalog.name,
          description: catalog.description,
          type: catalog.type || 'default',
          is_active: catalog.is_active ?? true,
          is_default: false, // Only one default catalog allowed
        })
        .select()
        .single();

      if (error) throw error;
      return data as Catalog;
    },
    onSuccess: (newCatalog) => {
      queryClient.invalidateQueries({ queryKey: CATALOGS_QUERY_KEY });
      logger.info('App', '✅ Created catalog', { catalogId: newCatalog.id });
    },
    onError: (err) => {
      logger.error('App', '❌ Error creating catalog:', err);
    }
  });

  // Update catalog
  const updateCatalogMutation = useMutation({
    mutationFn: async ({ catalogId, updates }: { catalogId: string, updates: Partial<Catalog> }) => {
      const { data, error } = await (supabase
        .from('catalogs') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', catalogId)
        .select()
        .single();

      if (error) throw error;
      return data as Catalog;
    },
    onSuccess: (updatedCatalog) => {
      queryClient.invalidateQueries({ queryKey: CATALOGS_QUERY_KEY });
      logger.info('App', '✅ Updated catalog', { catalogId: updatedCatalog.id });
    },
    onError: (err) => {
      logger.error('App', '❌ Error updating catalog:', err);
    }
  });

  // Delete catalog
  const deleteCatalogMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      const { error } = await supabase.from('catalogs').delete().eq('id', catalogId);
      if (error) throw error;
      return catalogId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: CATALOGS_QUERY_KEY });
      logger.info('App', '✅ Deleted catalog', { catalogId: deletedId });
    },
    onError: (err) => {
      logger.error('App', '❌ Error deleting catalog:', err);
    }
  });

  // Get products in catalog
  const getCatalogProducts = async (catalogId: string): Promise<CatalogProduct[]> => {
    try {
      const { data, error } = await supabase
        .from('catalog_products')
        .select(`
          *,
          product:products(*)
        `)
        .eq('catalog_id', catalogId)
        .order('sort_order');

      if (error) throw error;
      return data as CatalogProduct[];
    } catch (err) {
      logger.error('App', '❌ Error loading catalog products:', err);
      throw err;
    }
  };

  // Add product to catalog
  const addProductMutation = useMutation({
    mutationFn: async ({ catalogId, productId, options }: { 
      catalogId: string, 
      productId: string, 
      options?: { sort_order?: number; is_featured?: boolean } 
    }) => {
      // Check if exists
      const { data: existing } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('catalog_id', catalogId)
        .eq('product_id', productId)
        .single();

      if (existing) return existing;

      const { data, error } = await (supabase
        .from('catalog_products') as any)
        .insert({
          catalog_id: catalogId,
          product_id: productId,
          sort_order: options?.sort_order || 0,
          is_featured: options?.is_featured || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      logger.info('App', '✅ Added product to catalog', { 
        catalogId: variables.catalogId, 
        productId: variables.productId 
      });
    },
    onError: (err) => {
      logger.error('App', '❌ Error adding product to catalog:', err);
    }
  });

  // Remove product from catalog
  const removeProductMutation = useMutation({
    mutationFn: async ({ catalogId, productId }: { catalogId: string, productId: string }) => {
      const { error } = await supabase
        .from('catalog_products')
        .delete()
        .eq('catalog_id', catalogId)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      logger.info('App', '✅ Removed product from catalog', { 
        catalogId: variables.catalogId, 
        productId: variables.productId 
      });
    },
    onError: (err) => {
      logger.error('App', '❌ Error removing product from catalog:', err);
    }
  });

  // Update catalog product settings
  const updateProductMutation = useMutation({
    mutationFn: async ({ 
      catalogId, 
      productId, 
      updates 
    }: { 
      catalogId: string, 
      productId: string, 
      updates: { sort_order?: number; is_featured?: boolean } 
    }) => {
      const { data, error } = await (supabase
        .from('catalog_products') as any)
        .update(updates)
        .eq('catalog_id', catalogId)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      logger.info('App', '✅ Updated catalog product', { 
        catalogId: variables.catalogId, 
        productId: variables.productId 
      });
    },
    onError: (err) => {
      logger.error('App', '❌ Error updating catalog product:', err);
    }
  });

  return {
    catalogs,
    loading,
    error: error as Error | null,
    fetchCatalogs: async () => { await queryClient.invalidateQueries({ queryKey: CATALOGS_QUERY_KEY }) },
    getDefaultCatalog,
    createCatalog: createCatalogMutation.mutateAsync,
    updateCatalog: (catalogId: string, updates: Partial<Catalog>) => updateCatalogMutation.mutateAsync({ catalogId, updates }),
    deleteCatalog: deleteCatalogMutation.mutateAsync,
    getCatalogProducts,
    addProductToCatalog: (catalogId: string, productId: string, options?: { sort_order?: number; is_featured?: boolean }) => 
      addProductMutation.mutateAsync({ catalogId, productId, options }),
    removeProductFromCatalog: (catalogId: string, productId: string) => 
      removeProductMutation.mutateAsync({ catalogId, productId }),
    updateCatalogProduct: (catalogId: string, productId: string, updates: { sort_order?: number; is_featured?: boolean }) => 
      updateProductMutation.mutateAsync({ catalogId, productId, updates }),
  };
}
