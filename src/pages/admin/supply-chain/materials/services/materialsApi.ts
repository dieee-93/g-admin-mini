/**
 * MATERIALS API SERVICE
 * 
 * Supabase API layer for materials/inventory management.
 * Separates data fetching from state management (Store-First pattern).
 * 
 * RESPONSIBILITIES:
 * - CRUD operations for inventory materials
 * - Stock entry management
 * - Supplier relationship handling
 * - RPC calls for stock updates
 * 
 * USAGE:
 * - Used by TanStack Query hooks (useMaterials, useMaterialOperations)
 * - NOT used directly by components
 * 
 * PATTERN:
 * - Pure async functions (no state)
 * - Returns raw data for React Query cache
 * - Throws errors for Query error boundaries
 * 
 * @see src/hooks/useMaterials.ts
 * @see ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md - "Server State in Hooks"
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { MaterialItem, ItemFormData } from '../types';
import { MaterialsNormalizer } from './materialsNormalizer';

// ============================================
// TYPES
// ============================================

export interface ApiMaterialItem {
  id: string;
  name: string;
  type: string;
  unit: string;
  stock: number;
  unit_cost: number;
  category?: string;
  brand_id?: string;
  min_stock?: number;
  precision_digits?: number;
  package_size?: number;
  package_unit?: string;
  package_cost?: number;
  display_mode?: string;
  recipe_id?: string;
  requires_production?: boolean;
  auto_calculate_cost?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockEntryData {
  item_id: string;
  quantity: number;
  unit_cost: number;
  entry_type: 'purchase' | 'adjustment' | 'return' | 'production';
  supplier?: string;
  purchase_date?: string;
  invoice_number?: string;
  delivery_date?: string;
  quality_rating?: number;
  note?: string;
}

export interface BulkStockUpdate {
  id: string;
  stock: number;
}

// ============================================
// FETCH OPERATIONS
// ============================================

/**
 * Fetch all inventory materials from database
 * @returns Array of MaterialItem (normalized)
 */
export async function fetchItems(): Promise<MaterialItem[]> {
  logger.debug('MaterialsApi', 'Fetching all materials');

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    logger.error('MaterialsApi', 'Failed to fetch materials', error);
    throw new Error(`Error al cargar materiales: ${error.message}`);
  }

  // Normalize API response to MaterialItem format
  const normalizedItems = (data as ApiMaterialItem[]).map(item =>
    MaterialsNormalizer.normalizeApiItem(item)
  );

  logger.info('MaterialsApi', `Fetched ${normalizedItems.length} materials`);
  return normalizedItems;
}

/**
 * Fetch single item by ID
 * @param id - Item UUID
 * @returns MaterialItem (normalized)
 */
export async function getItem(id: string): Promise<MaterialItem> {
  logger.debug('MaterialsApi', `Fetching item ${id}`);

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('MaterialsApi', `Failed to fetch item ${id}`, error);
    throw new Error(`Error al cargar material: ${error.message}`);
  }

  return MaterialsNormalizer.normalizeApiItem(data as ApiMaterialItem);
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create new inventory item
 * @param itemData - Form data for new item
 * @returns Created MaterialItem (normalized)
 */
export async function createItem(itemData: ItemFormData): Promise<MaterialItem> {
  logger.debug('MaterialsApi', 'Creating item', { name: itemData.name, type: itemData.type });

  // Map TypeScript type to API type
  const apiType = MaterialsNormalizer.mapItemTypeToApiType(itemData.type);

  // Map business category to technical category for DB constraint
  const technicalCategory = MaterialsNormalizer.mapBusinessCategoryToTechnicalCategory(
    itemData.type,
    itemData.unit
  );

  // Prepare item for API with proper type mapping
  const apiItem = {
    name: itemData.name,
    type: apiType,
    unit: itemData.unit,
    stock: 0, // Always start with 0, let stock entry handle initial stock
    unit_cost: itemData.unit_cost || 0,
    ...(technicalCategory && { category: technicalCategory }),
    ...(itemData.brand_id && { brand_id: itemData.brand_id }),
    // Add type-specific fields
    ...(itemData.packaging && {
      package_size: itemData.packaging.package_size,
      package_unit: itemData.packaging.package_unit,
      package_cost: itemData.packaging.package_cost,
      display_mode: itemData.packaging.display_mode,
    }),
    ...(itemData.recipe_id && { recipe_id: itemData.recipe_id }),
    ...(itemData.requires_production !== undefined && {
      requires_production: itemData.requires_production,
    }),
    ...(itemData.auto_calculate_cost !== undefined && {
      auto_calculate_cost: itemData.auto_calculate_cost,
    }),
    // Add missing required fields with defaults
    min_stock: 0,
    precision_digits: 2,
  };

  const { data, error } = await supabase
    .from('materials')
    .insert(apiItem)
    .select()
    .single();

  if (error) {
    logger.error('MaterialsApi', 'Failed to create item', error);
    throw new Error(`Error al crear material: ${error.message}`);
  }

  const createdItem = MaterialsNormalizer.normalizeApiItem(data as ApiMaterialItem);
  logger.info('MaterialsApi', `Item created: ${createdItem.id}`);

  return createdItem;
}

/**
 * Create stock entry for item
 * Used for initial stock, purchases, adjustments
 * @param entryData - Stock entry data
 */
export async function createStockEntry(entryData: StockEntryData): Promise<void> {
  logger.debug('MaterialsApi', 'Creating stock entry', {
    item_id: entryData.item_id,
    quantity: entryData.quantity,
    type: entryData.entry_type,
  });

  const { error } = await supabase
    .from('stock_entries')
    .insert(entryData);

  if (error) {
    logger.error('MaterialsApi', 'Failed to create stock entry', error);
    throw new Error(`Error al crear entrada de stock: ${error.message}`);
  }

  logger.info('MaterialsApi', 'Stock entry created successfully');
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update existing item
 * @param id - Item UUID
 * @param updates - Partial updates to apply
 * @param user - Authenticated user (for audit)
 * @returns Updated MaterialItem (normalized)
 */
export async function updateItem(
  id: string,
  updates: Partial<MaterialItem>,
  user?: any
): Promise<MaterialItem> {
  logger.debug('MaterialsApi', `Updating item ${id}`, updates);

  // Remove fields that shouldn't be updated directly
  const { id: _, stock, initial_stock, ...otherUpdates } = updates as any;

  if (Object.keys(otherUpdates).length === 0) {
    logger.debug('MaterialsApi', 'No updates to apply');
    return getItem(id);
  }

  const { data, error } = await supabase
    .from('materials')
    .update({
      ...otherUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('MaterialsApi', `Failed to update item ${id}`, error);
    throw new Error(`Error al actualizar material: ${error.message}`);
  }

  const updatedItem = MaterialsNormalizer.normalizeApiItem(data as ApiMaterialItem);
  logger.info('MaterialsApi', `Item updated: ${id}`);

  return updatedItem;
}

/**
 * Update item stock using RPC function
 * @param itemId - Item UUID
 * @param quantityToAdd - Quantity to add (can be negative)
 */
export async function updateStockRpc(
  itemId: string,
  quantityToAdd: number
): Promise<void> {
  logger.debug('MaterialsApi', `Updating stock via RPC`, { itemId, quantityToAdd });

  const { error } = await supabase.rpc('update_item_stock', {
    p_item_id: itemId,
    p_quantity_to_add: quantityToAdd,
  } as any);

  if (error) {
    logger.error('MaterialsApi', 'RPC stock update failed', error);
    throw new Error(`Error en RPC al actualizar stock: ${error.message}`);
  }

  logger.info('MaterialsApi', 'Stock updated via RPC successfully');
}

/**
 * Bulk update stock for multiple materials
 * @param updates - Array of { id, stock } updates
 */
export async function bulkUpdateStock(updates: BulkStockUpdate[]): Promise<void> {
  logger.debug('MaterialsApi', `Bulk updating stock for ${updates.length} materials`);

  // Execute updates sequentially (Supabase doesn't support batch updates natively)
  const promises = updates.map(({ id, stock }) =>
    updateStockRpc(id, stock)
  );

  await Promise.all(promises);

  logger.info('MaterialsApi', `Bulk stock update completed for ${updates.length} materials`);
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete item by ID
 * @param id - Item UUID
 */
export async function deleteItem(id: string): Promise<void> {
  logger.debug('MaterialsApi', `Deleting item ${id}`);

  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('MaterialsApi', `Failed to delete item ${id}`, error);
    throw new Error(`Error al eliminar material: ${error.message}`);
  }

  logger.info('MaterialsApi', `Item deleted: ${id}`);
}

// ============================================
// HELPER: Get authenticated user
// ============================================

/**
 * Get current authenticated user
 * Throws if not authenticated
 */
export async function getAuthenticatedUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}
