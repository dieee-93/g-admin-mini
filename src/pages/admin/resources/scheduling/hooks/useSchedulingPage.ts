import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserMinusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

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
  };
  viewMode: 'week' | 'day' | 'month';
}

export interface UseSchedulingPageReturn {
  // UI State
  viewState: SchedulingViewState;
  schedulingStats: SchedulingStats;

  // Modal state
  isAutoSchedulingOpen: boolean;

  // Actions
  handleTabChange: (tab: SchedulingTab) => void;
  setViewState: (state: SchedulingViewState | ((prev: SchedulingViewState) => SchedulingViewState)) => void;
  setIsAutoSchedulingOpen: (isOpen: boolean) => void;
  handleScheduleGenerated: (solution: any) => void;
}

export const useSchedulingPage = (): UseSchedulingPageReturn => {
  const { setQuickActions } = useNavigation();

  const [viewState, setViewState] = useState<SchedulingViewState>({
    activeTab: 'schedule',
    selectedWeek: new Date().toISOString().split('T')[0],
    filters: {},
    viewMode: 'week'
  });

  const [isAutoSchedulingOpen, setIsAutoSchedulingOpen] = useState(false);

  // Mock scheduling stats - will be replaced with API call
  const [schedulingStats] = useState<SchedulingStats>({
    total_shifts_this_week: 156,
    employees_scheduled: 24,
    coverage_percentage: 87.5,
    pending_time_off: 8,
    labor_cost_this_week: 18750,
    overtime_hours: 12,
    understaffed_shifts: 3,
    approved_requests: 15
  });

  // Setup quick actions for the scheduling module
  useEffect(() => {
    // Set context-aware quick actions based on active tab
    const getQuickActionsForTab = (tab: SchedulingTab) => {
      const baseActions = [
        {
          id: 'new-shift',
          label: 'New Shift',
          icon: PlusIcon,
          action: () => {
            // TODO: Open shift creation modal
            console.log('Opening new shift form');
          }
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
              action: () => console.log('Copying week schedule')
            }
          ];
        case 'timeoff':
          return [
            {
              id: 'new-request',
              label: 'New Request',
              icon: PlusIcon,
              action: () => console.log('Creating time-off request')
            },
            {
              id: 'bulk-approve',
              label: 'Bulk Approve',
              icon: CheckCircleIcon,
              action: () => console.log('Bulk approving requests')
            }
          ];
        case 'coverage':
          return [
            {
              id: 'find-coverage',
              label: 'Find Coverage',
              icon: UsersIcon,
              action: () => console.log('Finding coverage')
            }
          ];
        case 'costs':
          return [
            {
              id: 'export-costs',
              label: 'Export Report',
              icon: ChartBarIcon,
              action: () => console.log('Exporting cost report')
            }
          ];
        case 'realtime':
          return [
            {
              id: 'force-refresh',
              label: 'Force Refresh',
              icon: ClockIcon,
              action: () => console.log('Force refreshing real-time data')
            },
            {
              id: 'export-live-data',
              label: 'Export Live Data',
              icon: ChartBarIcon,
              action: () => console.log('Exporting live data')
            }
          ];
        default:
          return baseActions;
      }
    };

    setQuickActions(getQuickActionsForTab(viewState.activeTab));

    // Cleanup function
    return () => setQuickActions([]);
  }, [viewState.activeTab, setQuickActions]);

  const handleTabChange = useCallback((tab: SchedulingTab) => {
    setViewState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleScheduleGenerated = useCallback((solution: any) => {
    console.log('Schedule generated:', solution);
    // TODO: Apply the generated schedule to the database
    // For now, just log the solution and refresh the view
    setIsAutoSchedulingOpen(false);
  }, []);

  return {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated
  };
};