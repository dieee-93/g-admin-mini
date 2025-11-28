// src/features/inventory/data/inventoryApi.ts
// API functions para el módulo inventory

import { supabase } from '@/lib/supabase/client';
import { MaterialsMockService } from './materialsMockService';
import { MaterialsDataNormalizer } from './materialsDataNormalizer';
import { BulkOperationsService } from './bulkOperationsService'; // ✅ Bulk operations
import { CacheService, invalidateMaterialsListCache, invalidateMaterialCache } from './cacheService'; // ✅ Caching
import type { InventoryItem, StockEntry } from '@/pages/admin/supply-chain/materials/types';
import type { MaterialItem } from '../types/materialTypes';

// 🔒 PERMISSIONS: RLS handles authorization in Supabase
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';

import { logger } from '@/lib/logging';
import EventBus from '@/lib/events'; // ✅ EventBus for cross-module communication

// ✅ DEVELOPMENT FLAG - Use mock data in development
const USE_MOCK_DATA = false; // Changed to false to use real Supabase data

export const inventoryApi = {
  // Items
  async getItems(locationId?: string, user?: AuthUser | null): Promise<MaterialItem[]> {
    // 🔒 PERMISSIONS: Validate user can read materials
    if (user) {
      requireModuleAccess(user, 'materials');
    }

    if (USE_MOCK_DATA) {
      return MaterialsMockService.getItems();
    }

    // Generate cache key
    const cacheKey = CacheService.generateKey('getItems', { locationId });

    // Try cache first, then fetch if needed
    return CacheService.withCache(
      cacheKey,
      async () => {
        let query = supabase
          .from('materials')
          .select('*')
          .order('name');

        // 🆕 MULTI-LOCATION: Filter by location if specified
        if (locationId) {
          query = query.eq('location_id', locationId);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('MaterialsStore', 'Error loading materials from Supabase:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        // Normalize data from Supabase format to MaterialItem format
        return data ? MaterialsDataNormalizer.normalizeArray(data) : [];
      },
      3 * 60 * 1000 // 3 minutes TTL
    );
  },

  async createMaterial(item: Partial<MaterialItem>, user: AuthUser): Promise<MaterialItem> {
    // 🔒 PERMISSIONS: Validate user can create materials
    requirePermission(user, 'materials', 'create');

    // 🎯 DRY: Delegate to createItem for actual DB operation
    const result = await this.createItem(item);

    logger.info('MaterialsStore', '✅ Material created by user', {
      materialId: result.id,
      userId: user.id,
      role: user.role
    });

    // 🎯 EVENTBUS: Emit event for cross-module awareness
    EventBus.emit('materials.material_created', {
      materialId: result.id,
      materialName: result.name,
      materialType: result.type,
      category: result.category,
      unitCost: result.unit_cost,
      minStock: result.min_stock,
      supplierId: result.supplier_id,
      locationId: result.location_id,
      userId: user.id,
      timestamp: Date.now()
    });

    logger.debug('MaterialsStore', '📢 Emitted materials.material_created event', {
      materialId: result.id,
      materialName: result.name
    });

    return result;
  },

  async createItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.createMaterial(item);
    }

    const { data, error } = await supabase
      .from('materials')
      .insert([item])
      .select()
      .single();

    if (error) {
      logger.error('MaterialsStore', 'Error creating material:', error);
      throw error;
    }

    // Invalidate cache after creating item
    invalidateMaterialsListCache();

    return data;
  },

  async getItem(id: string): Promise<MaterialItem | null> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.getItem(id);
    }

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('MaterialsStore', 'Error getting material:', error);
      throw error;
    }

    return data;
  },

  async updateStock(id: string, newStock: number, user: AuthUser, oldStock?: number): Promise<MaterialItem> {
    // 🔒 PERMISSIONS: Validate user can update materials
    requirePermission(user, 'materials', 'update');

    if (USE_MOCK_DATA) {
      return MaterialsMockService.updateStock(id, newStock);
    }

    // 🎯 OPTIMIZED: Single query - get old stock from result if not provided
    const { data, error } = await supabase
      .from('materials')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('MaterialsStore', 'Error updating stock:', error);
      throw error;
    }

    const result = data;

    // Calculate old stock: use provided value or fetch from cache/result
    // Note: Supabase UPDATE returns the NEW data, so oldStock must be provided or fetched before
    const previousStock = oldStock ?? 0; // Caller should provide oldStock from store

    // Invalidate cache after updating stock
    invalidateMaterialCache(id);
    invalidateMaterialsListCache();

    logger.info('MaterialsStore', '✅ Stock updated by user', {
      materialId: id,
      newStock,
      oldStock: previousStock,
      userId: user.id,
      role: user.role
    });

    // 🎯 EVENTBUS: Emit event to notify other modules of stock change
    EventBus.emit('materials.stock_updated', {
      materialId: id,
      materialName: result.name,
      oldStock: previousStock,
      newStock,
      delta: newStock - previousStock,
      reason: 'manual_update',
      userId: user.id,
      timestamp: Date.now()
    });

    logger.debug('MaterialsStore', '📢 Emitted materials.stock_updated event', {
      materialId: id,
      oldStock: previousStock,
      newStock,
      delta: newStock - previousStock
    });

    return result;
  },

  /**
   * ✅ IMPLEMENTED: Bulk actions
   * Delegates to BulkOperationsService for proper handling
   */
  async bulkAction(action: string, itemIds: string[]): Promise<{ success: boolean; message?: string; data?: unknown }> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.bulkAction(action, itemIds);
    }

    logger.info('MaterialsStore', `Executing bulk action: ${action} on ${itemIds.length} items`);

    let result;
    switch (action) {
      case 'delete':
        result = await BulkOperationsService.deleteItems(itemIds, false);
        break;

      case 'activate':
        result = await BulkOperationsService.toggleActive(itemIds, true);
        break;

      case 'deactivate':
        result = await BulkOperationsService.toggleActive(itemIds, false);
        break;

      case 'export_csv': {
        // First fetch the items (no cache invalidation needed for export)
        const items = await this.getItems();
        const selectedItems = items.filter(item => itemIds.includes(item.id));
        return await BulkOperationsService.exportToCSV(selectedItems);
      }

      default:
        logger.warn('MaterialsStore', `Unknown bulk action: ${action}`);
        throw new Error(`Unknown bulk action: ${action}`);
    }

    // Invalidate cache after mutating actions (not export)
    if (action !== 'export_csv') {
      invalidateMaterialsListCache();
      itemIds.forEach(id => invalidateMaterialCache(id));
    }

    return result;
  },

  async generateReport(): Promise<void> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.generateReport();
    }

    // Implement real report generation here
    logger.info('MaterialsStore', 'Generating report...');
  },

  async updateItem(id: string, updates: Partial<InventoryItem>, user: AuthUser): Promise<InventoryItem> {
    // 🔒 PERMISSIONS: Validate user can update materials
    requirePermission(user, 'materials', 'update');

    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache after update
    invalidateMaterialCache(id);
    invalidateMaterialsListCache();

    logger.info('MaterialsStore', '✅ Material updated by user', {
      materialId: id,
      userId: user.id,
      role: user.role
    });

    // 🎯 EVENTBUS: Emit event for non-stock updates (category, name, supplier, pricing, etc.)
    EventBus.emit('materials.material_updated', {
      materialId: id,
      materialName: data.name,
      updatedFields: Object.keys(updates),
      updates,
      userId: user.id,
      timestamp: Date.now()
    });

    logger.debug('MaterialsStore', '📢 Emitted materials.material_updated event', {
      materialId: id,
      fields: Object.keys(updates).join(', ')
    });

    return data;
  },

  // Stock entries
  async getStockEntries(itemId?: string): Promise<StockEntry[]> {
    let query = supabase
      .from('stock_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  },

  async createStockEntry(entry: Omit<StockEntry, 'id' | 'created_at' | 'updated_at'>): Promise<StockEntry> {
    const { data, error } = await supabase
      .from('stock_entries')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data;
  },


  // Dashboard stats
  async getDashboardStats(): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .rpc('get_inventory_dashboard_stats');

    if (error) throw error;
    return data;
  },

  // Delete item with proper transaction handling
  async deleteItem(id: string, user: AuthUser): Promise<void> {
    // 🔒 PERMISSIONS: Validate user can delete materials
    requirePermission(user, 'materials', 'delete');

    try {
      // First, check if item exists and get its info
      const { data: itemData, error: itemError } = await supabase
        .from('materials')
        .select('id, name, type, category, stock, unit_cost')
        .eq('id', id)
        .single();

      if (itemError || !itemData) {
        throw new Error('Item no encontrado');
      }

      // Delete all stock_entries for this item first (to avoid trigger conflicts)
      const { error: stockError } = await supabase
        .from('stock_entries')
        .delete()
        .eq('item_id', id);

      if (stockError) {
        logger.error('MaterialsStore', 'Warning cleaning stock entries:', stockError);
        // Continue anyway, the item deletion might still work
      }

      // Now delete the item itself
      const { error: deleteError } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      logger.info('MaterialsStore', '✅ Material deleted by user', {
        materialId: id,
        materialName: itemData.name,
        userId: user.id,
        role: user.role
      });

      // 🎯 EVENTBUS: Emit event for cross-module awareness
      EventBus.emit('materials.material_deleted', {
        materialId: id,
        materialName: itemData.name,
        materialType: itemData.type,
        category: itemData.category,
        lastStock: itemData.stock,
        lastUnitCost: itemData.unit_cost,
        timestamp: Date.now()
      });

      logger.debug('MaterialsStore', '📢 Emitted materials.material_deleted event', {
        materialId: id,
        materialName: itemData.name
      });

    } catch (error) {
      logger.error('MaterialsStore', 'Error in deleteItem:', error);
      throw error;
    }
  }
};