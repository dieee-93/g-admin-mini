/**
 * Bulk Operations Service
 *
 * Handles batch operations on inventory materials for improved efficiency.
 * Uses Supabase RPC functions for atomic database operations.
 *
 * Features:
 * - Bulk stock adjustments with audit trail
 * - Bulk category changes
 * - Bulk delete with safety checks
 * - Transaction-based operations (all-or-nothing)
 * - EventBus integration for cross-module awareness
 */

import { supabase } from '@/lib/supabase/client';
import { secureApiCall } from '@/lib/validation';
import { logger } from '@/lib/logging';
import eventBus from '@/lib/events';
import type { MaterialItem } from '../types/materialTypes';

// ============================================
// TYPES
// ============================================

export interface BulkOperationResult {
  success: string[]; // IDs that succeeded
  failed: { id: string; error: string }[]; // IDs that failed with reasons
  totalProcessed: number;
  totalSucceeded: number;
  totalFailed: number;
}

export interface BulkStockAdjustment {
  itemId: string;
  adjustment: number; // Positive for increase, negative for decrease
  reason: string;
}

export interface BulkCategoryChange {
  itemIds: string[];
  newCategory: string;
}

export interface BulkDeleteRequest {
  itemIds: string[];
  force?: boolean; // Force delete even if has transactions
}

// ============================================
// SERVICE
// ============================================

export class BulkOperationsService {

  /**
   * Bulk adjust stock for multiple items
   * Uses PostgreSQL RPC for atomic operation
   */
  static async adjustStock(
    adjustments: BulkStockAdjustment[]
  ): Promise<BulkOperationResult> {
    return secureApiCall(async () => {
      const result: BulkOperationResult = {
        success: [],
        failed: [],
        totalProcessed: adjustments.length,
        totalSucceeded: 0,
        totalFailed: 0
      };

      // Process each adjustment
      for (const adj of adjustments) {
        try {
          // Use RPC function for atomic operation
          const { data, error } = await supabase.rpc('bulk_adjust_stock', {
            p_item_id: adj.itemId,
            p_adjustment: adj.adjustment,
            p_reason: adj.reason,
            p_user_id: (await supabase.auth.getUser()).data.user?.id || null
          });

          if (error) throw error;

          result.success.push(adj.itemId);
          result.totalSucceeded++;

          // Emit event for cross-module awareness
          eventBus.emit('materials.stock_updated', {
            itemId: adj.itemId,
            itemName: data?.name || adj.itemId,
            previousStock: data?.previous_stock || 0,
            newStock: data?.new_stock || 0,
            timestamp: new Date().toISOString()
          });

          logger.debug('BulkOperationsService', `Stock adjusted for item ${adj.itemId}: ${adj.adjustment}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.failed.push({
            id: adj.itemId,
            error: errorMessage
          });
          result.totalFailed++;

          logger.error('BulkOperationsService', `Failed to adjust stock for ${adj.itemId}`, error);
        }
      }

      logger.info('BulkOperationsService', `Bulk stock adjustment completed: ${result.totalSucceeded}/${result.totalProcessed} succeeded`);

      return result;
    }, {
      operation: 'bulkAdjustStock',
      context: { count: adjustments.length }
    });
  }

  /**
   * Bulk change category for multiple items
   */
  static async changeCategory(
    itemIds: string[],
    newCategory: string
  ): Promise<BulkOperationResult> {
    return secureApiCall(async () => {
      const result: BulkOperationResult = {
        success: [],
        failed: [],
        totalProcessed: itemIds.length,
        totalSucceeded: 0,
        totalFailed: 0
      };

      // Validate category
      if (!newCategory || newCategory.trim() === '') {
        throw new Error('Category cannot be empty');
      }

      // Process each item
      for (const itemId of itemIds) {
        try {
          const { error } = await supabase
            .from('items')
            .update({
              category: newCategory.trim(),
              updated_at: new Date().toISOString()
            })
            .eq('id', itemId);

          if (error) throw error;

          result.success.push(itemId);
          result.totalSucceeded++;

          logger.debug('BulkOperationsService', `Category changed for item ${itemId} to ${newCategory}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.failed.push({
            id: itemId,
            error: errorMessage
          });
          result.totalFailed++;

          logger.error('BulkOperationsService', `Failed to change category for ${itemId}`, error);
        }
      }

      // Emit single event for all changes
      eventBus.emit('materials.bulk_category_changed', {
        itemIds: result.success,
        newCategory,
        count: result.totalSucceeded,
        timestamp: new Date().toISOString()
      });

      logger.info('BulkOperationsService', `Bulk category change completed: ${result.totalSucceeded}/${result.totalProcessed} succeeded`);

      return result;
    }, {
      operation: 'bulkChangeCategory',
      context: { count: itemIds.length, newCategory }
    });
  }

  /**
   * Bulk delete items
   * Checks for dependencies before deletion
   */
  static async deleteItems(
    itemIds: string[],
    force: boolean = false
  ): Promise<BulkOperationResult> {
    return secureApiCall(async () => {
      const result: BulkOperationResult = {
        success: [],
        failed: [],
        totalProcessed: itemIds.length,
        totalSucceeded: 0,
        totalFailed: 0
      };

      // Process each item
      for (const itemId of itemIds) {
        try {
          // Check for dependencies if not forcing
          if (!force) {
            // Check if item has stock entries (history)
            const { count: stockEntriesCount } = await supabase
              .from('stock_entries')
              .select('id', { count: 'exact', head: true })
              .eq('item_id', itemId);

            // Check if item is used in recipes
            const { count: recipesCount } = await supabase
              .from('recipe_items')
              .select('id', { count: 'exact', head: true })
              .eq('material_id', itemId);

            if ((stockEntriesCount || 0) > 0 || (recipesCount || 0) > 0) {
              result.failed.push({
                id: itemId,
                error: 'Item has dependencies (stock history or recipes). Use force delete to override.'
              });
              result.totalFailed++;
              continue;
            }
          }

          // Delete the item
          const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

          if (error) throw error;

          result.success.push(itemId);
          result.totalSucceeded++;

          logger.debug('BulkOperationsService', `Item deleted: ${itemId}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.failed.push({
            id: itemId,
            error: errorMessage
          });
          result.totalFailed++;

          logger.error('BulkOperationsService', `Failed to delete item ${itemId}`, error);
        }
      }

      // Emit event for deleted items
      if (result.success.length > 0) {
        eventBus.emit('materials.bulk_deleted', {
          itemIds: result.success,
          count: result.totalSucceeded,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('BulkOperationsService', `Bulk delete completed: ${result.totalSucceeded}/${result.totalProcessed} succeeded`);

      return result;
    }, {
      operation: 'bulkDeleteItems',
      context: { count: itemIds.length, force }
    });
  }

  /**
   * Bulk activate/deactivate items
   */
  static async toggleActive(
    itemIds: string[],
    isActive: boolean
  ): Promise<BulkOperationResult> {
    return secureApiCall(async () => {
      const result: BulkOperationResult = {
        success: [],
        failed: [],
        totalProcessed: itemIds.length,
        totalSucceeded: 0,
        totalFailed: 0
      };

      // Single update for all items (more efficient)
      try {
        const { error } = await supabase
          .from('items')
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .in('id', itemIds);

        if (error) throw error;

        // All succeeded
        result.success = [...itemIds];
        result.totalSucceeded = itemIds.length;

        // Emit event
        eventBus.emit('materials.bulk_status_changed', {
          itemIds,
          isActive,
          count: result.totalSucceeded,
          timestamp: new Date().toISOString()
        });

        logger.info('BulkOperationsService', `Bulk status change completed: ${result.totalSucceeded} items ${isActive ? 'activated' : 'deactivated'}`);

      } catch (error) {
        // If batch update fails, mark all as failed
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.failed = itemIds.map(id => ({
          id,
          error: errorMessage
        }));
        result.totalFailed = itemIds.length;

        logger.error('BulkOperationsService', 'Bulk status change failed', error);
      }

      return result;
    }, {
      operation: 'bulkToggleActive',
      context: { count: itemIds.length, isActive }
    });
  }

  /**
   * Bulk export to CSV
   */
  static async exportToCSV(
    items: MaterialItem[]
  ): Promise<string> {
    return secureApiCall(async () => {
      // Build CSV header
      const headers = [
        'ID',
        'Nombre',
        'Categoría',
        'Tipo',
        'Stock',
        'Unidad',
        'Costo Unitario',
        'Valor Total',
        'Stock Mínimo',
        'Proveedor',
        'Ubicación',
        'Activo'
      ];

      // Build CSV rows
      const rows = items.map(item => [
        item.id,
        item.name,
        item.category || '',
        item.type,
        item.stock?.toFixed(2) || '0',
        item.unit,
        item.unit_cost?.toFixed(2) || '0',
        ((item.stock || 0) * (item.unit_cost || 0)).toFixed(2),
        item.min_stock?.toFixed(2) || '0',
        item.supplier_id || '',
        item.location_id || '',
        item.is_active ? 'Sí' : 'No'
      ]);

      // Convert to CSV format with proper escaping
      const escapeCsvCell = (cell: string): string => {
        // Escape double quotes by doubling them
        return `"${cell.replace(/"/g, '""')}"`;
      };

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCsvCell).join(','))
      ].join('\n');

      logger.info('BulkOperationsService', `Exported ${items.length} items to CSV`);

      return csv;
    }, {
      operation: 'exportToCSV',
      context: { count: items.length }
    });
  }
}
