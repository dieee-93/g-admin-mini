import { useEffect, useState, useCallback } from 'react';
import { useNavigationActions } from '@/contexts/NavigationContext';
// import { useLocation } from '@/contexts/LocationContext'; // Phase 5
import { logger } from '@/lib/logging';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import type { Shift } from '../../types/schedulingTypes';
import { schedulingAnalyticsApi } from '../services/schedulingApi';

// Types
interface SchedulingStats {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}

type SchedulingTab = 'schedule' | 'timeoff' | 'coverage' | 'costs' | 'realtime';

interface SchedulingViewState {
  activeTab: SchedulingTab;
  selectedWeek: string;
  filters: {
    position?: string;
    employee?: string;
    status?: string;
    location_id?: string; // 🌎 Multi-location filter
  };
  viewMode: 'week' | 'day' | 'month';
}

export interface UseSchedulingPageReturn {
  // UI State
  viewState: SchedulingViewState;
  schedulingStats: SchedulingStats;

  // Modal state
  isAutoSchedulingOpen: boolean;
  isShiftEditorOpen: boolean;
  editingShift: Shift | null;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Actions
  handleTabChange: (tab: SchedulingTab) => void;
  setViewState: (state: SchedulingViewState | ((prev: SchedulingViewState) => SchedulingViewState)) => void;
  setIsAutoSchedulingOpen: (isOpen: boolean) => void;
  handleScheduleGenerated: (solution: unknown) => void;
  handleOpenCreateShift: () => void;
  handleOpenEditShift: (shift: Shift) => void;
  handleCloseShiftEditor: () => void;
}

export const useSchedulingPage = (): UseSchedulingPageReturn => {
  const { setQuickActions } = useNavigationActions();
  // Multi-location support disabled for now - will be used in Phase 5
  // const { selectedLocation, isMultiLocationMode } = useLocation();

  // Estado empresarial estándar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewState, setViewState] = useState<SchedulingViewState>({
    activeTab: 'schedule',
    selectedWeek: new Date().toISOString().split('T')[0],
    filters: {},
    viewMode: 'week'
  });

  const [isAutoSchedulingOpen, setIsAutoSchedulingOpen] = useState(false);
  const [isShiftEditorOpen, setIsShiftEditorOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Real scheduling stats from API
  const [schedulingStats, setSchedulingStats] = useState<SchedulingStats>({
    total_shifts_this_week: 0,
    employees_scheduled: 0,
    coverage_percentage: 0,
    pending_time_off: 0,
    labor_cost_this_week: 0,
    overtime_hours: 0,
    understaffed_shifts: 0,
    approved_requests: 0
  });

  // Load real data from API
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current week range
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Load weekly dashboard from API
        const dashboard = await schedulingAnalyticsApi.getWeeklyDashboard({
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: endOfWeek.toISOString().split('T')[0]
        });

        // Map API response to stats
        setSchedulingStats({
          total_shifts_this_week: dashboard.totalShifts || 0,
          employees_scheduled: dashboard.activeEmployees || 0,
          coverage_percentage: dashboard.averageCoverage || 0,
          pending_time_off: dashboard.pendingTimeOff || 0,
          labor_cost_this_week: dashboard.totalLaborCost || 0,
          overtime_hours: dashboard.overtimeHours || 0,
          understaffed_shifts: dashboard.understaffedShifts || 0,
          approved_requests: dashboard.approvedRequests || 0
        });

        setLoading(false);
      } catch (err) {
        logger.error('UseSchedulingPage', 'Error loading scheduling data', err);
        setError(err instanceof Error ? err.message : 'Error loading scheduling data');
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // ✅ MODAL HANDLERS
  const handleOpenCreateShift = useCallback(() => {
    setEditingShift(null);
    setIsShiftEditorOpen(true);
  }, []);

  const handleOpenEditShift = useCallback((shift: Shift) => {
    setEditingShift(shift);
    setIsShiftEditorOpen(true);
  }, []);

  const handleCloseShiftEditor = useCallback(() => {
    setIsShiftEditorOpen(false);
    setEditingShift(null);
  }, []);


  // Setup quick actions for the scheduling module
  useEffect(() => {
    // Set context-aware quick actions based on active tab
    const getQuickActionsForTab = (tab: SchedulingTab) => {
      const baseActions = [
        {
          id: 'new-shift',
          label: 'New Shift',
          icon: PlusIcon,
          action: handleOpenCreateShift,
        }
      ];

      switch (tab) {
        case 'schedule':
          return [
            ...baseActions,
            {
              id: 'auto-schedule',
              label: 'Auto Schedule',
              icon: Cog6ToothIcon,
              action: () => setIsAutoSchedulingOpen(true)
            },
            {
              id: 'copy-week',
              label: 'Copy Week',
              icon: CalendarIcon,
              action: () => logger.info('API', 'Copying week schedule')
            }
          ];
        case 'timeoff':
          return [
            {
              id: 'new-request',
              label: 'New Request',
              icon: PlusIcon,
              action: () => logger.debug('UseSchedulingPage', 'Creating time-off request')
            },
            {
              id: 'bulk-approve',
              label: 'Bulk Approve',
              icon: CheckCircleIcon,
              action: () => logger.debug('UseSchedulingPage', 'Bulk approving requests')
            }
          ];
        case 'coverage':
          return [
            {
              id: 'find-coverage',
              label: 'Find Coverage',
              icon: UsersIcon,
              action: () => logger.debug('UseSchedulingPage', 'Finding coverage')
            }
          ];
        case 'costs':
          return [
            {
              id: 'export-costs',
              label: 'Export Report',
              icon: ChartBarIcon,
              action: () => logger.debug('UseSchedulingPage', 'Exporting cost report')
            }
          ];
        case 'realtime':
          return [
            {
              id: 'force-refresh',
              label: 'Force Refresh',
              icon: ClockIcon,
              action: () => logger.debug('UseSchedulingPage', 'Force refreshing real-time data')
            },
            {
              id: 'export-live-data',
              label: 'Export Live Data',
              icon: ChartBarIcon,
              action: () => logger.debug('UseSchedulingPage', 'Exporting live data')
            }
          ];
        default:
          return baseActions;
      }
    };

    setQuickActions(getQuickActionsForTab(viewState.activeTab));

    // Cleanup function
    return () => setQuickActions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState.activeTab, handleOpenCreateShift]); // setQuickActions is stable but causes lint warning

  const handleTabChange = useCallback((tab: SchedulingTab) => {
    setViewState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleScheduleGenerated = useCallback((solution: unknown) => {
    logger.info('API', 'Schedule generated:', solution);
    // TODO: Apply the generated schedule to the database
    // For now, just log the solution and refresh the view
    setIsAutoSchedulingOpen(false);
  }, []);

  return {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    isShiftEditorOpen,
    editingShift,
    loading,
    error,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated,
    handleOpenCreateShift,
    handleOpenEditShift,
    handleCloseShiftEditor,
  };
};