/**
 * useTeamData.ts - React Hook to load Team data using TanStack Query
 *
 * MIGRATION NOTE:
 * This hook has been migrated from Zustand store to TanStack Query
 * following the Cash Module pattern.
 *
 * @see src/modules/team/hooks/useTeam.ts - TanStack Query implementation
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration documentation
 */

import { useState, useCallback } from 'react';
import { useTeam, type TeamFilters } from './useTeam';
import { useTeamStore } from '../store/teamStore';

/**
 * Hook to automatically load team data from Supabase when component mounts
 * Uses TanStack Query for data fetching
 */
export function useTeamData() {
  // Use TanStack Query hook for server state
  const { data: team = [], isLoading: loading, error } = useTeam();

  return {
    team,
    loading,
    error: error ? (error as Error).message : null,
    isEmpty: team.length === 0 && !loading
  };
}

/**
 * Hook to load team data for a specific date range
 * Uses TanStack Query for schedules and time entries
 */
export function useTeamDataRange(startDate?: string, endDate?: string) {
  // TODO: Implement schedules and timeEntries hooks with TanStack Query
  // For now, return empty arrays
  return {
    schedules: [],
    timeEntries: [],
    loading: false
  };
}

/**
 * Hook specifically for team components that need to ensure data is loaded
 * Combines TanStack Query data with Zustand UI state
 */
export function useTeamWithLoader(filters?: TeamFilters) {
  const teamStore = useTeamStore(); // UI state only
  const { data: team = [], isLoading: loading, error } = useTeam(filters); // Server state from TanStack Query with filters

  // Return combined store with server data
  return {
    ...teamStore,
    team,
    loading,
    error: error ? (error as Error).message : null,
    isReady: team.length > 0 || (!loading && !error)
  };
}

/**
 * Hook for performance analytics data
 */
export function usePerformanceAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeamMemberPerformance = useCallback(async (teamMemberId: string, months: number = 6) => {
    setLoading(true);
    setError(null);
    try {
      const { getTeamMemberPerformance } = await import('@/modules/team/services/index');
      return await getTeamMemberPerformance(teamMemberId, months);
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
    loadTeamMemberPerformance,
    loadDepartmentPerformance,
    loadPerformanceTrends,
    loadTopPerformers
  };
}

export default useTeamData;