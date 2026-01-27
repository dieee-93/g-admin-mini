/**
 * React Hook for Real-time Labor Costs
 * Provides live cost tracking and alerts for staff scheduling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeLaborCosts, type LiveCostData, type CostAlert, type DailyCostSummary } from '@/modules/team/services';
interface UseRealTimeLaborCostsOptions {
  autoStart?: boolean;
  updateInterval?: number;
}

interface UseRealTimeLaborCostsReturn {
  // Data
  liveData: LiveCostData[];
  alerts: CostAlert[];
  dailySummary: DailyCostSummary | null;

  // State
  isMonitoring: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  forceUpdate: () => Promise<void>;
  refreshDailySummary: (date?: string) => Promise<void>;
  clearError: () => void;

  // Computed values
  totalActiveCost: number;
  totalProjectedCost: number;
  activeTeamMemberCount: number;
  overtimeTeamMemberCount: number;
  criticalAlerts: CostAlert[];
}

export function useRealTimeLaborCosts(options: UseRealTimeLaborCostsOptions = {}): UseRealTimeLaborCostsReturn {
  const { autoStart = false, updateInterval } = options;

  // State
  const [liveData, setLiveData] = useState<LiveCostData[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyCostSummary | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const unsubscribeDataRef = useRef<(() => void) | null>(null);
  const unsubscribeAlertsRef = useRef<(() => void) | null>(null);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    try {
      setLoading(true);
      setError(null);

      // Subscribe to live data updates
      unsubscribeDataRef.current = realTimeLaborCosts.subscribe((_data) => {
        setLiveData(_data);
        setLoading(false);
      });

      // Subscribe to alerts
      unsubscribeAlertsRef.current = realTimeLaborCosts.subscribeToAlerts((alertsData) => {
        setAlerts(alertsData);
      });

      // Start the monitoring service
      realTimeLaborCosts.startMonitoring();
      setIsMonitoring(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring');
      setLoading(false);
    }
  }, [isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    try {
      // Unsubscribe from updates
      if (unsubscribeDataRef.current) {
        unsubscribeDataRef.current();
        unsubscribeDataRef.current = null;
      }

      if (unsubscribeAlertsRef.current) {
        unsubscribeAlertsRef.current();
        unsubscribeAlertsRef.current = null;
      }

      // Stop the monitoring service
      realTimeLaborCosts.stopMonitoring();
      setIsMonitoring(false);
      setLiveData([]);
      setAlerts([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop monitoring');
    }
  }, [isMonitoring]);

  // Force update
  const forceUpdate = useCallback(async () => {
    if (!isMonitoring) return;

    try {
      setLoading(true);
      setError(null);

      await realTimeLaborCosts.forceUpdate();
      setLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data');
      setLoading(false);
    }
  }, [isMonitoring]);

  // Refresh daily summary
  const refreshDailySummary = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      setError(null);

      const summary = await realTimeLaborCosts.getDailyCostSummary(date);
      setDailySummary(summary);
      setLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily summary');
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-start monitoring on mount if requested
  useEffect(() => {
    if (autoStart && !isMonitoring) {
      startMonitoring();
    }

    // Cleanup on unmount
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [autoStart, isMonitoring, startMonitoring, stopMonitoring]);

  // Load initial daily summary
  useEffect(() => {
    if (isMonitoring) {
      refreshDailySummary();
    }
  }, [isMonitoring, refreshDailySummary]);

  // Computed values
  const totalActiveCost = liveData.reduce((sum, teamMember) => {
    return teamMember.clock_in_time ? sum + teamMember.current_cost : sum;
  }, 0);

  const totalProjectedCost = liveData.reduce((sum, teamMember) => {
    return teamMember.clock_in_time ? sum + teamMember.projected_cost : sum;
  }, 0);

  const activeTeamMemberCount = liveData.filter(teamMember => teamMember.clock_in_time !== null).length;

  const overtimeTeamMemberCount = liveData.filter(teamMember =>
    teamMember.overtime_status === 'in_overtime' || teamMember.overtime_status === 'approaching'
  ).length;

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  // Error boundary for monitoring issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && isMonitoring) {
        setError('Monitoring error: ' + event.error.message);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [isMonitoring]);

  return {
    // Data
    liveData,
    alerts,
    dailySummary,

    // State
    isMonitoring,
    loading,
    error,

    // Actions
    startMonitoring,
    stopMonitoring,
    forceUpdate,
    refreshDailySummary,
    clearError,

    // Computed values
    totalActiveCost,
    totalProjectedCost,
    activeTeamMemberCount,
    overtimeTeamMemberCount,
    criticalAlerts
  };
}

// Specialized hooks for specific use cases

/**
 * Hook for monitoring overtime only
 */
export function useOvertimeMonitoring() {
  const {
    liveData,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    overtimeTeamMemberCount
  } = useRealTimeLaborCosts({ autoStart: true });

  const overtimeTeamMembers = liveData.filter(teamMember =>
    teamMember.overtime_status !== 'none'
  );

  const overtimeAlerts = alerts.filter(alert =>
    alert.type === 'overtime_approaching'
  );

  return {
    overtimeTeamMembers,
    overtimeAlerts,
    overtimeTeamMemberCount,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
}

/**
 * Hook for budget monitoring only
 */
export function useBudgetMonitoring() {
  const {
    dailySummary,
    alerts,
    totalActiveCost,
    totalProjectedCost,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshDailySummary
  } = useRealTimeLaborCosts({ autoStart: true });

  const budgetAlerts = alerts.filter(alert =>
    alert.type === 'budget_exceeded'
  );

  const budgetUtilization = dailySummary?.budget_utilization || 0;
  const isOverBudget = budgetUtilization > 100;

  return {
    dailySummary,
    budgetAlerts,
    budgetUtilization,
    isOverBudget,
    totalActiveCost,
    totalProjectedCost,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshDailySummary
  };
}

/**
 * Hook for live cost dashboard
 */
export function useLiveCostDashboard(date?: string) {
  const fullHook = useRealTimeLaborCosts({ autoStart: true });

  // Refresh daily summary when date changes
  useEffect(() => {
    if (fullHook.isMonitoring && date) {
      fullHook.refreshDailySummary(date);
    }
  }, [date, fullHook.isMonitoring, fullHook.refreshDailySummary]);

  // Department breakdown
  const departmentBreakdown = fullHook.liveData.reduce((acc, teamMember) => {
    if (!teamMember.clock_in_time) return acc;

    const dept = teamMember.department;
    if (!acc[dept]) {
      acc[dept] = {
        employee_count: 0,
        current_cost: 0,
        projected_cost: 0,
        overtime_count: 0
      };
    }

    acc[dept].employee_count += 1;
    acc[dept].current_cost += teamMember.current_cost;
    acc[dept].projected_cost += teamMember.projected_cost;

    if (teamMember.overtime_status !== 'none') {
      acc[dept].overtime_count += 1;
    }

    return acc;
  }, {} as Record<string, {
    employee_count: number;
    current_cost: number;
    projected_cost: number;
    overtime_count: number;
  }>);

  return {
    ...fullHook,
    departmentBreakdown
  };
}

export default useRealTimeLaborCosts;