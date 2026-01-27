/**
 * Product Catalog Settings API Service
 * 
 * Version: 1.0.0
 * Purpose: Supabase API layer for product_catalog_settings CRUD operations
 * Route: /admin/settings/products/catalog
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ================================================
// TYPES
// ================================================

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  available_from?: string; // Time "HH:mm"
  available_to?: string;   // Time "HH:mm"
  available_days?: number[]; // [0-6] Sunday=0
  sort_order?: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price_adjustment: number;
  is_default?: boolean;
}

export interface ModifierConfiguration {
  id: string;
  name: string;
  type: 'single_choice' | 'multiple_choice';
  required?: boolean;
  options: ModifierOption[];
}

export interface PortionSize {
  id: string;
  name: string;
  servings: number;
  price_multiplier?: number;
}

export type PricingStrategy = 'markup' | 'competitive' | 'value_based';
export type RecipeCostingMethod = 'average' | 'fifo' | 'lifo' | 'standard';

export interface ProductCatalogSettings {
  id: string;
  
  // Categories
  product_categories: ProductCategory[];
  menu_categories: MenuCategory[];
  
  // Pricing
  pricing_strategy: PricingStrategy;
  default_markup_percentage: number;
  
  // Costing
  recipe_costing_method: RecipeCostingMethod;
  
  // Availability
  check_stock: boolean;
  allow_backorders: boolean;
  auto_disable_on_zero_stock: boolean;
  minimum_notice_minutes: number;
  
  // Modifiers
  modifiers_configuration: ModifierConfiguration[];
  portion_sizes: PortionSize[];
  
  // Metadata
  is_system: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type ProductCatalogSettingsUpdate = Partial<Omit<ProductCatalogSettings, 'id' | 'is_system' | 'created_by' | 'created_at' | 'updated_at'>>;

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Fetch all product catalog settings
 */
export async function fetchProductCatalogSettings(): Promise<ProductCatalogSettings[]> {
  const { data, error } = await supabase
    .from('product_catalog_settings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('ProductCatalogApi', 'Failed to fetch product catalog settings', error);
    throw error;
  }

  return data as ProductCatalogSettings[];
}

/**
 * Fetch product catalog settings by ID
 */
export async function fetchProductCatalogSettingsById(id: string): Promise<ProductCatalogSettings> {
  const { data, error } = await supabase
    .from('product_catalog_settings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('ProductCatalogApi', `Failed to fetch product catalog settings ${id}`, error);
    throw error;
  }

  return data as ProductCatalogSettings;
}

/**
 * Fetch system product catalog settings (default configuration)
 */
export async function fetchSystemProductCatalogSettings(): Promise<ProductCatalogSettings> {
  const { data, error } = await supabase
    .from('product_catalog_settings')
    .select('*')
    .eq('is_system', true)
    .single();

  if (error) {
    logger.error('ProductCatalogApi', 'Failed to fetch system product catalog settings', error);
    throw error;
  }

  return data as ProductCatalogSettings;
}

/**
 * Update product catalog settings
 */
export async function updateProductCatalogSettings(
  id: string,
  updates: ProductCatalogSettingsUpdate
): Promise<ProductCatalogSettings> {
  const { data, error } = await supabase
    .from('product_catalog_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('ProductCatalogApi', `Failed to update product catalog settings ${id}`, error);
    throw error;
  }

  logger.info('ProductCatalogApi', `Updated product catalog settings ${id}`);
  return data as ProductCatalogSettings;
}

/**
 * Toggle stock checking
 */
export async function toggleCheckStock(id: string, enabled: boolean): Promise<ProductCatalogSettings> {
  return updateProductCatalogSettings(id, { check_stock: enabled });
}

/**
 * Toggle backorders
 */
export async function toggleAllowBackorders(id: string, enabled: boolean): Promise<ProductCatalogSettings> {
  return updateProductCatalogSettings(id, { allow_backorders: enabled });
}

/**
 * Toggle auto-disable on zero stock
 */
export async function toggleAutoDisableOnZeroStock(id: string, enabled: boolean): Promise<ProductCatalogSettings> {
  return updateProductCatalogSettings(id, { auto_disable_on_zero_stock: enabled });
}
