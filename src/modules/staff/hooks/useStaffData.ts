/**
 * useStaffData.ts - React Hook to load Staff data using TanStack Query
 *
 * MIGRATION NOTE:
 * This hook has been migrated from Zustand store to TanStack Query
 * following the Cash Module pattern.
 *
 * @see src/modules/staff/hooks/useStaff.ts - TanStack Query implementation
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration documentation
 */

import { useState, useCallback } from 'react';
import { useStaff, type StaffFilters } from './useStaff';
import { useTeamStore } from '../store/staffStore';

/**
 * Hook to automatically load staff data from Supabase when component mounts
 * Uses TanStack Query for data fetching
 */
export function useStaffData() {
  // Use TanStack Query hook for server state
  const { data: staff = [], isLoading: loading, error } = useStaff();

  return {
    staff,
    loading,
    error: error ? (error as Error).message : null,
    isEmpty: staff.length === 0 && !loading
  };
}

/**
 * Hook to load staff data for a specific date range
 * Uses TanStack Query for schedules and time entries
 */
export function useStaffDataRange(startDate?: string, endDate?: string) {
  // TODO: Implement schedules and timeEntries hooks with TanStack Query
  // For now, return empty arrays
  return {
    schedules: [],
    timeEntries: [],
    loading: false
  };
}

/**
 * Hook specifically for staff components that need to ensure data is loaded
 * Combines TanStack Query data with Zustand UI state
 */
export function useStaffWithLoader(filters?: StaffFilters) {
  const staffStore = useTeamStore(); // UI state only
  const { data: staff = [], isLoading: loading, error } = useStaff(filters); // Server state from TanStack Query with filters

  // Return combined store with server data
  return {
    ...staffStore,
    staff,
    loading,
    error: error ? (error as Error).message : null,
    isReady: staff.length > 0 || (!loading && !error)
  };
}

/**
 * Hook for performance analytics data
 */
export function usePerformanceAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployeePerformance = useCallback(async (employeeId: string, months: number = 6) => {
    setLoading(true);
    setError(null);
    try {
      const { getEmployeePerformance } = await import('@/modules/team/services/index');
      return await getEmployeePerformance(employeeId, months);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading performance data');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDepartmentPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { getDepartmentPerformance } = await import('@/modules/team/services/index');
      return await getDepartmentPerformance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading department performance');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPerformanceTrends = useCallback(async (months: number = 12) => {
    setLoading(true);
    setError(null);
    try {
      const { getPerformanceTrends } = await import('@/modules/team/services/index');
      return await getPerformanceTrends(months);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading trends');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTopPerformers = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const { getTopPerformers } = await import('@/modules/team/services/index');
      return await getTopPerformers(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading top performers');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadEmployeePerformance,
    loadDepartmentPerformance,
    loadPerformanceTrends,
    loadTopPerformers
  };
}

export default useStaffData;