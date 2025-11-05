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

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { Catalog, CatalogProduct } from '../types';

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all catalogs
  const fetchCatalogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('catalogs')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (fetchError) throw fetchError;

      setCatalogs(data || []);
      logger.info('CatalogsHook', `✅ Loaded ${data?.length || 0} catalogs`);
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error loading catalogs:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get default catalog
  const getDefaultCatalog = useCallback(async (): Promise<Catalog | null> => {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No default catalog found
          logger.warn('CatalogsHook', 'No default catalog found');
          return null;
        }
        throw error;
      }

      return data as Catalog;
    } catch (err) {
      logger.error('CatalogsHook', '❌ Error getting default catalog:', err);
      return null;
    }
  }, []);

  // Create new catalog
  const createCatalog = async (catalog: {
    name: string;
    description?: string;
    type?: string;
    is_active?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('catalogs')
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

      // Refresh catalog list
      await fetchCatalogs();

      logger.info('CatalogsHook', '✅ Created catalog', { catalogId: data.id });
      return data as Catalog;
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error creating catalog:', error);
      throw error;
    }
  };

  // Update catalog
  const updateCatalog = async (catalogId: string, updates: Partial<Catalog>) => {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', catalogId)
        .select()
        .single();

      if (error) throw error;

      // Refresh catalog list
      await fetchCatalogs();

      logger.info('CatalogsHook', '✅ Updated catalog', { catalogId });
      return data as Catalog;
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error updating catalog:', error);
      throw error;
    }
  };

  // Delete catalog
  const deleteCatalog = async (catalogId: string) => {
    try {
      const { error } = await supabase.from('catalogs').delete().eq('id', catalogId);

      if (error) throw error;

      // Refresh catalog list
      await fetchCatalogs();

      logger.info('CatalogsHook', '✅ Deleted catalog', { catalogId });
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error deleting catalog:', error);
      throw error;
    }
  };

  // Get products in catalog
  const getCatalogProducts = async (catalogId: string): Promise<CatalogProduct[]> => {
    try {
      const { data, error } = await supabase
        .from('catalog_products')
        .select(
          `
          *,
          product:products(*)
        `
        )
        .eq('catalog_id', catalogId)
        .order('sort_order');

      if (error) throw error;

      logger.info('CatalogsHook', `✅ Loaded ${data?.length || 0} products for catalog ${catalogId}`);
      return data as CatalogProduct[];
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error loading catalog products:', error);
      throw error;
    }
  };

  // Add product to catalog
  const addProductToCatalog = async (catalogId: string, productId: string, options?: {
    sort_order?: number;
    is_featured?: boolean;
  }) => {
    try {
      // Check if product already in catalog
      const { data: existing } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('catalog_id', catalogId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        logger.info('CatalogsHook', 'Product already in catalog', { catalogId, productId });
        return existing;
      }

      // Add product to catalog
      const { data, error } = await supabase
        .from('catalog_products')
        .insert({
          catalog_id: catalogId,
          product_id: productId,
          sort_order: options?.sort_order || 0,
          is_featured: options?.is_featured || false,
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('CatalogsHook', '✅ Added product to catalog', { catalogId, productId });
      return data;
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error adding product to catalog:', error);
      throw error;
    }
  };

  // Remove product from catalog
  const removeProductFromCatalog = async (catalogId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('catalog_products')
        .delete()
        .eq('catalog_id', catalogId)
        .eq('product_id', productId);

      if (error) throw error;

      logger.info('CatalogsHook', '✅ Removed product from catalog', { catalogId, productId });
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error removing product from catalog:', error);
      throw error;
    }
  };

  // Update catalog product settings (sort order, featured)
  const updateCatalogProduct = async (
    catalogId: string,
    productId: string,
    updates: { sort_order?: number; is_featured?: boolean }
  ) => {
    try {
      const { data, error } = await supabase
        .from('catalog_products')
        .update(updates)
        .eq('catalog_id', catalogId)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) throw error;

      logger.info('CatalogsHook', '✅ Updated catalog product', { catalogId, productId });
      return data;
    } catch (err) {
      const error = err as Error;
      logger.error('CatalogsHook', '❌ Error updating catalog product:', error);
      throw error;
    }
  };

  // Load catalogs on mount
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  return {
    catalogs,
    loading,
    error,
    fetchCatalogs,
    getDefaultCatalog,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    getCatalogProducts,
    addProductToCatalog,
    removeProductFromCatalog,
    updateCatalogProduct,
  };
}
