/**
 * USE MATERIAL OPERATIONS HOOK - Business logic & mutations
 * 
 * Handles complex business operations for materials/inventory:
 * - Item creation with supplier management
 * - Stock entries with purchase information
 * - Item updates with RPC stock adjustments
 * - Bulk operations
 * 
 * REFACTOR V2.0:
 * - Extracted from materialsStore (100+ lines of business logic)
 * - Uses materialsApi for all Supabase operations
 * - Integrates with useMaterials hook for state updates
 * 
 * PATTERN:
 * - Business logic in custom hook (TkDodo Store-First pattern)
 * - API calls via service layer
 * - State updates via callback pattern (no direct store access)
 * 
 * @see src/pages/admin/supply-chain/materials/services/materialsApi.ts
 * @see src/hooks/useMaterials.ts
 */

import { useCallback } from 'react';
import { useErrorHandler } from '@/lib/error-handling';
import { logger } from '@/lib/logging';
import * as materialsApi from '../services/materialsApi';
import type { ItemFormData, MaterialItem } from '../types';

// ============================================
// HOOK
// ============================================

interface UseMaterialOperationsOptions {
  onSuccess?: (item: MaterialItem) => void;
  onError?: (error: Error) => void;
}

export function useMaterialOperations(options: UseMaterialOperationsOptions = {}) {
  const { handleError } = useErrorHandler();

  // ============================================
  // CREATE ITEM WITH SUPPLIER & STOCK
  // ============================================

  /**
   * Create new item with optional supplier and initial stock
   * Complex operation that may create:
   * 1. New material item
   * 2. New supplier (if needed)
   * 3. Initial stock entry
   */
  const createItem = useCallback(
    async (itemData: ItemFormData): Promise<MaterialItem> => {
      try {
        logger.info('useMaterialOperations', '🌟 [CREATE] Creating new item', {
          name: itemData.name,
        });

        // Step 1: Create the item (always starts with stock = 0)
        const createdItem = await materialsApi.createItem(itemData);
        logger.info('useMaterialOperations', '✅ [CREATE] Item created in database', {
          id: createdItem.id,
        });

        // Step 2: Handle supplier and stock entry if provided
        if (itemData.supplier && (itemData.initial_stock || 0) > 0) {
          logger.debug('useMaterialOperations', '📦 [CREATE] Processing supplier and stock entry');

          // Import suppliers API dynamically
          const { suppliersApi } = await import(
            '@/pages/admin/supply-chain/suppliers/services/suppliersApi'
          );

          let supplierId: string | undefined = itemData.supplier.supplier_id;

          // Create new supplier if needed
          if (!supplierId && itemData.supplier.new_supplier) {
            logger.debug('useMaterialOperations', '🏭 [CREATE] Creating new supplier');
            const newSupplier = await suppliersApi.createSupplierFromForm(
              itemData.supplier.new_supplier
            );
            supplierId = newSupplier.id;
            logger.info('useMaterialOperations', '✅ [CREATE] New supplier created', {
              id: supplierId,
            });
          }

          // Create stock entry with purchase information
          if (supplierId) {
            logger.debug('useMaterialOperations', '📥 [CREATE] Creating initial stock entry');

            await materialsApi.createStockEntry({
              item_id: createdItem.id,
              quantity: itemData.initial_stock || 0,
              unit_cost: itemData.unit_cost || 0,
              entry_type: 'purchase',
              supplier: supplierId,
              purchase_date: itemData.supplier.purchase_date,
              invoice_number: itemData.supplier.invoice_number,
              delivery_date: itemData.supplier.delivery_date,
              quality_rating: itemData.supplier.quality_rating,
              note: `Compra inicial - ${itemData.name}`,
            });

            logger.info('useMaterialOperations', '✅ [CREATE] Stock entry created');
          }
        }

        // Step 3: Re-fetch item to get updated stock (if stock entry was created)
        const finalItem = await materialsApi.getItem(createdItem.id);

        logger.info('useMaterialOperations', '🎉 [CREATE] Item creation complete', {
          id: finalItem.id,
          stock: finalItem.stock,
        });

        // Notify success
        options.onSuccess?.(finalItem);

        return finalItem;
      } catch (err) {
        logger.error('useMaterialOperations', '❌ [CREATE] Error creating item', err);
        handleError(err as Error);
        options.onError?.(err as Error);
        throw err;
      }
    },
    [handleError, options]
  );

  // ============================================
  // UPDATE ITEM WITH STOCK ADJUSTMENT
  // ============================================

  /**
   * Update item with optional stock adjustment via RPC
   * Handles:
   * 1. Item property updates
   * 2. Stock adjustments (using RPC function)
   * 3. Re-fetch for consistency
   */
  const updateItem = useCallback(
    async (id: string, updates: Partial<MaterialItem>): Promise<MaterialItem> => {
      try {
        logger.info('useMaterialOperations', '🔄 [UPDATE] Updating item', { id });

        // Get current item for stock comparison
        const currentItem = await materialsApi.getItem(id);
        const oldStock = currentItem.stock;

        // Extract stock updates (can be from 'stock' or 'initial_stock' field)
        const { stock: newStock, initial_stock: formStock, ...otherUpdates } = updates as any;
        const actualNewStock = newStock ?? formStock;

        // Calculate stock difference
        const stockDifference =
          actualNewStock !== undefined && actualNewStock !== null
            ? actualNewStock - oldStock
            : 0;

        // Get authenticated user
        const user = await materialsApi.getAuthenticatedUser();

        // Step 1: Update item properties (if any)
        if (Object.keys(otherUpdates).length > 0) {
          logger.debug('useMaterialOperations', '📝 [UPDATE] Updating item properties');
          await materialsApi.updateItem(id, otherUpdates, user);
        }

        // Step 2: Update stock via RPC (if changed)
        if (stockDifference !== 0) {
          logger.debug('useMaterialOperations', '📊 [UPDATE] Adjusting stock via RPC', {
            oldStock,
            newStock: actualNewStock,
            difference: stockDifference,
          });
          await materialsApi.updateStockRpc(id, stockDifference);
        }

        // Step 3: Re-fetch item to ensure state consistency
        const updatedItem = await materialsApi.getItem(id);

        logger.info('useMaterialOperations', '✅ [UPDATE] Item updated successfully', { id });

        // Notify success
        options.onSuccess?.(updatedItem);

        return updatedItem;
      } catch (err) {
        logger.error('useMaterialOperations', '❌ [UPDATE] Error updating item', err);
        handleError(err as Error);
        options.onError?.(err as Error);
        throw err;
      }
    },
    [handleError, options]
  );

  // ============================================
  // DELETE ITEM
  // ============================================

  /**
   * Delete item by ID
   */
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        logger.info('useMaterialOperations', '🗑️ [DELETE] Deleting item', { id });

        await materialsApi.deleteItem(id);

        logger.info('useMaterialOperations', '✅ [DELETE] Item deleted successfully', { id });
      } catch (err) {
        logger.error('useMaterialOperations', '❌ [DELETE] Error deleting item', err);
        handleError(err as Error);
        options.onError?.(err as Error);
        throw err;
      }
    },
    [handleError, options]
  );

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk update stock for multiple items
   */
  const bulkUpdateStock = useCallback(
    async (updates: Array<{ id: string; stock: number }>): Promise<void> => {
      try {
        logger.info('useMaterialOperations', '📦 [BULK] Bulk updating stock', {
          count: updates.length,
        });

        await materialsApi.bulkUpdateStock(updates);

        logger.info('useMaterialOperations', '✅ [BULK] Bulk update completed');
      } catch (err) {
        logger.error('useMaterialOperations', '❌ [BULK] Error in bulk update', err);
        handleError(err as Error);
        options.onError?.(err as Error);
        throw err;
      }
    },
    [handleError, options]
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    createItem,
    updateItem,
    deleteItem,
    bulkUpdateStock,
  };
}
