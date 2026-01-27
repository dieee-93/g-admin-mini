/**
 * useMaterialsActions Hook
 * 
 * ✅ SPLIT HOOKS PATTERN - Actions Slice
 * Selective subscription to materials store actions
 * 
 * Performance:
 * - Actions are stable (Zustand guarantees this)
 * - No re-renders (actions don't change)
 * - Uses useShallow for safety
 */

import { useShallow } from 'zustand/react/shallow';
import { useMaterialsStore } from '@/modules/materials/store';

export function useMaterialsActions() {
  return useMaterialsStore(
    useShallow((state) => ({
      setItems: state.setItems,
      addItem: state.addItem,
      updateItem: state.updateItem,
      deleteItem: state.deleteItem,
      bulkUpdateStock: state.bulkUpdateStock,
      refreshStats: state.refreshStats,
      setLoading: state.setLoading,
      setError: state.setError
    }))
  );
}
