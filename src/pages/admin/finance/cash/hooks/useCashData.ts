/**
 * useCashData Hook
 *
 * ✅ SPLIT HOOKS PATTERN - Data Slice
 * Selective subscription to cash store data
 *
 * Performance:
 * - Only subscribes to data, not actions
 * - Uses useShallow for stable references
 * - No unnecessary re-renders
 */

import { useShallow } from 'zustand/react/shallow';
import { useCashStore } from '@/store/cashStore';

export function useCashData() {
  return useCashStore(
    useShallow((state) => ({
      moneyLocations: state.moneyLocations,
      activeSessions: state.activeSessions,
      loading: state.loading,
      error: state.error,
    }))
  );
}
