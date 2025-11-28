/**
 * useMaterialsComputed Hook
 * 
 * ✅ SPLIT HOOKS PATTERN - Computed Values Slice
 * Selective subscription to computed/derived store functions
 * 
 * Performance:
 * - Only subscribes to computed functions
 * - Functions are stable (Zustand guarantees this)
 * - No re-renders
 */

import { useShallow } from 'zustand/react/shallow';
import { useMaterialsStore } from '@/store/materialsStore';

export function useMaterialsComputed() {
  return useMaterialsStore(
    useShallow((state) => ({
      getFilteredItems: state.getFilteredItems,
      getLowStockItems: state.getLowStockItems,
      getCriticalStockItems: state.getCriticalStockItems,
      getItemsByType: state.getItemsByType,
      getMeasurableItems: state.getMeasurableItems,
      getCountableItems: state.getCountableItems,
      getElaboratedItems: state.getElaboratedItems
    }))
  );
}
