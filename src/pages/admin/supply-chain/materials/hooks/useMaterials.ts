/**
 * USE MATERIALS HOOK - Data fetching & mutations
 * 
 * Hook for materials/inventory data management following project convention.
 * 
 * ✅ ARCHITECTURE: Store-First Pattern (Industry Validated)
 * - Single source of truth via useMaterialsStore (Zustand) for UI state
 * - Atomic selectors for optimal performance (TkDodo pattern)
 * - Server state managed in this hook with useState/useEffect
 * - NO local state duplication for filters/selections
 * 
 * REFACTOR V2.0:
 * - Separated from store (store now only has UI state)
 * - Business logic moved to useMaterialOperations hook
 * - API calls centralized in materialsApi service
 * 
 * @see src/pages/admin/supply-chain/materials/services/materialsApi.ts
 * @see src/hooks/useMaterialOperations.ts
 * @see docs/cross-module/CROSS_MODULE_DATA_ARCHITECTURE.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMaterialsStore } from '@/modules/materials/store';
import { useErrorHandler } from '@/lib/error-handling';
import { logger } from '@/lib/logging';
import * as materialsApi from '../services/materialsApi';
import { StockCalculation } from '@/modules/materials/services/stockCalculation';
import type {
  MaterialItem,
  InventoryStats,
  MeasurableItem,
  CountableItem,
  ElaboratedItem,
  ItemType,
} from '../types';
import {
  isMeasurable,
  isCountable,
  isElaborated,
} from '../types';

// ============================================
// HELPERS
// ============================================

function getStockStatus(item: MaterialItem): 'ok' | 'low' | 'critical' | 'out' {
  if (item.stock === 0) return 'out';
  if (item.stock <= (item.min_stock || 0) * 0.5) return 'critical';
  if (item.stock <= (item.min_stock || 0)) return 'low';
  return 'ok';
}

// ============================================
// HOOK
// ============================================

export function useMaterials() {
  const { handleError } = useErrorHandler();

  // ============================================
  // SERVER STATE (managed in hook)
  // ============================================
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // UI STATE (from store)
  // ============================================
  const filters = useMaterialsStore(useShallow((state) => state.filters));
  const selectedItems = useMaterialsStore(useShallow((state) => state.selectedItems));

  // Store actions (stable references)
  const storeActions = useMaterialsStore(
    useShallow((state) => ({
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      selectItem: state.selectItem,
      deselectItem: state.deselectItem,
      selectAll: state.selectAll,
      deselectAll: state.deselectAll,
    }))
  );

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await materialsApi.fetchItems();
      setItems(data);

      logger.debug('useMaterials', `Fetched ${data.length} items`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar materiales';
      setError(errorMessage);
      handleError(err as Error);
      logger.error('useMaterials', 'Error fetching items', err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Initial load
  useEffect(() => {
    logger.debug('useMaterials', '🔄 [MOUNT] useMaterials mounted, fetching initial data');

    // ✅ ALWAYS fetch on mount to ensure consistency with DB
    fetchItems();
  }, [fetchItems]);

  // ============================================
  // COMPUTED VALUES (DERIVED STATE)
  // ============================================

  /**
   * Apply filters, search, and sorting to items
   */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter((item) => item.type === filters.type);
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((item) => item.category === filters.category);
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      result = result.filter((item) => getStockStatus(item) === filters.stockStatus);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(searchLower));
    }

    // Price range filter
    result = result.filter(
      (item) =>
        (item.unit_cost || 0) >= filters.priceRange[0] &&
        (item.unit_cost || 0) <= filters.priceRange[1]
    );

    // Recipe filter for elaborated items
    if (filters.hasRecipe !== undefined) {
      result = result.filter((item) => {
        if (!isElaborated(item)) return false;
        return filters.hasRecipe ? !!item.recipe_id : !item.recipe_id;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'unit_cost':
          comparison = (a.unit_cost || 0) - (b.unit_cost || 0);
          break;
        case 'updated_at':
          comparison =
            new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          break;
        case 'created_at':
          comparison =
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        default:
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, filters]);

  /**
   * Calculate inventory statistics
   */
  const stats: InventoryStats = useMemo(() => {
    return {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + StockCalculation.getTotalValue(item), 0),
      lowStockItems: items.filter((item) => getStockStatus(item) === 'low').length,
      outOfStockItems: StockCalculation.getOutOfStockItems(items).length,
      recentMovements: 0, // TODO: Implement when we have movement tracking
      measurableItems: items.filter(isMeasurable).length,
      countableItems: items.filter(isCountable).length,
      elaboratedItems: items.filter(isElaborated).length,
      valueByCategory: {
        measurable: items
          .filter(isMeasurable)
          .reduce((sum, item) => sum + item.stock * (item.unit_cost || 0), 0),
        countable: items
          .filter(isCountable)
          .reduce((sum, item) => sum + item.stock * (item.unit_cost || 0), 0),
        elaborated: items
          .filter(isElaborated)
          .reduce((sum, item) => sum + item.stock * (item.unit_cost || 0), 0),
      },
    };
  }, [items]);

  /**
   * Get items by type
   */
  const itemsByType: Record<ItemType, MaterialItem[]> = useMemo(() => {
    return {
      MEASURABLE: items.filter(isMeasurable),
      COUNTABLE: items.filter(isCountable),
      ELABORATED: items.filter(isElaborated),
    };
  }, [items]);

  /**
   * Get low stock items
   */
  const lowStockItems = useMemo(() => {
    return items.filter((item) => getStockStatus(item) === 'low');
  }, [items]);

  /**
   * Get critical stock items
   */
  const criticalStockItems = useMemo(() => {
    return items.filter((item) => getStockStatus(item) === 'critical');
  }, [items]);

  /**
   * Type-specific getters
   */
  const measurableItems: MeasurableItem[] = useMemo(() => items.filter(isMeasurable), [items]);
  const countableItems: CountableItem[] = useMemo(() => items.filter(isCountable), [items]);
  const elaboratedItems: ElaboratedItem[] = useMemo(() => items.filter(isElaborated), [items]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Refresh data (re-fetch from server)
   */
  const refreshData = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  /**
   * Get item by ID
   */
  const getItemById = useCallback(
    (id: string): MaterialItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    // Server state
    items: filteredItems,
    allItems: items, // Unfiltered items
    loading,
    error,

    // UI state (from store)
    filters,
    selectedItems,

    // Computed values
    stats,
    itemsByType,
    lowStockItems,
    criticalStockItems,
    measurableItems,
    countableItems,
    elaboratedItems,

    // UI actions (from store)
    setFilters: storeActions.setFilters,
    resetFilters: storeActions.resetFilters,
    selectItem: storeActions.selectItem,
    deselectItem: storeActions.deselectItem,
    selectAll: () => storeActions.selectAll(items.map((i) => i.id)),
    deselectAll: storeActions.deselectAll,

    // Data actions
    refreshData,
    getItemById,
  };
}
