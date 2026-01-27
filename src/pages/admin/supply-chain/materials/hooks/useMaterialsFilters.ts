/**
 * useMaterialsFilters Hook
 * 
 * ✅ SPLIT HOOKS PATTERN - Filters Slice
 * Selective subscription to materials store filters
 * 
 * Performance:
 * - Only subscribes to filters and filter actions
 * - Uses useShallow for stable references
 * - Separate from data to avoid unnecessary re-renders
 */

import { useShallow } from 'zustand/react/shallow';
import { useMaterialsStore } from '@/modules/materials/store';

export function useMaterialsFilters() {
  return useMaterialsStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters
    }))
  );
}
