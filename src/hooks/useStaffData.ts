// useStaffData.ts - React Hook to load Staff data from Supabase
// Replaces mock data with real database integration

import { useEffect, useState, useCallback } from 'react';
import { useStaffStore } from '@/store/staffStore';

/**
 * Hook to automatically load staff data from Supabase when component mounts
 * This ensures components get real data instead of empty mock arrays
 */
export function useStaffData() {
  const { 
    staff,
    loading,
    error,
    loadStaff,
    loadSchedules,
    loadTimeEntries
  } = useStaffStore();

  // Auto-load staff data on mount
  useEffect(() => {
    if (staff.length === 0 && !loading && !error) {
      loadStaff();
    }
  }, [staff.length, loading, error, loadStaff]);

  // Auto-load current week schedules
  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    loadSchedules(startDate, endDate);
  }, [loadSchedules]);

  // Auto-load current week time entries
  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    loadTimeEntries(startDate, endDate);
  }, [loadTimeEntries]);

  return {
    staff,
    loading,
    error,
    isEmpty: staff.length === 0 && !loading
  };
}

/**
 * Hook to load staff data for a specific date range
 */
export function useStaffDataRange(startDate?: string, endDate?: string) {
  const { 
    schedules,
    timeEntries,
    loading,
    loadSchedules,
    loadTimeEntries
  } = useStaffStore();

  useEffect(() => {
    if (startDate && endDate) {
      loadSchedules(startDate, endDate);
      loadTimeEntries(startDate, endDate);
    }
  }, [startDate, endDate, loadSchedules, loadTimeEntries]);

  return {
    schedules,
    timeEntries,
    loading
  };
}

/**
 * Hook specifically for staff components that need to ensure data is loaded
 */
export function useStaffWithLoader() {
  const staffStore = useStaffStore();
  const { staff, loading, error } = useStaffData();

  // Return enhanced store with auto-loading
  return {
    ...staffStore,
    staff,
    loading,
    error,
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
      const { getEmployeePerformance } = await import('@/services/staff/staffApi');
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
      const { getDepartmentPerformance } = await import('@/services/staff/staffApi');
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
      const { getPerformanceTrends } = await import('@/services/staff/staffApi');
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
      const { getTopPerformers } = await import('@/services/staff/staffApi');
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