/**
 * useMaterialsData Hook
 * 
 * ✅ SPLIT HOOKS PATTERN - Data Slice
 * Selective subscription to materials store data
 * 
 * Performance:
 * - Only subscribes to items, loading, error
 * - Uses useShallow for stable references
 * - No unnecessary re-renders
 */

import { useShallow } from 'zustand/react/shallow';
import { useMaterialsStore } from '@/store/materialsStore';

export function useMaterialsData() {
  return useMaterialsStore(
    useShallow((state) => ({
      items: state.items,
      loading: state.loading,
      error: state.error
    }))
  );
}
