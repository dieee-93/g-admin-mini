/**
 * useCashActions Hook
 *
 * ✅ SPLIT HOOKS PATTERN - Actions Slice
 * Selective subscription to cash store actions
 *
 * Performance:
 * - Actions are stable (Zustand guarantees this)
 * - No re-renders (actions don't change)
 * - Uses useShallow for safety
 */

import { useShallow } from 'zustand/react/shallow';
import { useCashStore } from '@/store/cashStore';

export function useCashActions() {
  return useCashStore(
    useShallow((state) => ({
      setMoneyLocations: state.setMoneyLocations,
      setActiveSessions: state.setActiveSessions,
      setSessionHistory: state.setSessionHistory,
      addSession: state.addSession,
      updateSession: state.updateSession,
      removeSession: state.removeSession,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );
}
