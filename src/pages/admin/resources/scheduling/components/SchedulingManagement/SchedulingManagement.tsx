// SchedulingManagement.tsx - Enterprise Management Component with Tabs
// Following G-Admin Mini v2.1 patterns - Scheduling Module

import React from 'react';
import {
  Tabs, Stack, Typography, Badge, Icon, Section, Alert, Spinner
} from '@/shared/ui';
import { logger } from '@/lib/logging';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

// Import existing components (temporarily)
import {
  WeeklyScheduleView,
  TimeOffManager,
  CoveragePlanner,
  LaborCostTracker,
  RealTimeLaborTracker
} from '../';

// ✅ UNIFIED CALENDAR SYSTEM
logger.info('API', '🔄 SchedulingManagement: Using React.lazy for UnifiedCalendar');

// Create a fallback component first
const CalendarFallback = () => (
  <Section variant="elevated" title="Calendar" className="min-h-[400px]">
    <Stack spacing="md">
      <Alert status="warning">
        <Typography variant="h5">Calendar Loading...</Typography>
        <Typography variant="body">
          UnifiedCalendar component is initializing. If this persists, please refresh the page.
        </Typography>
      </Alert>
      <Spinner size="lg" />
    </Stack>
  </Section>
);

// Use React.lazy for proper dynamic import
const UnifiedCalendar = React.lazy(() =>
  import('@/shared/calendar/components/UnifiedCalendar')
    .then(module => {
      logger.info('API', '✅ SchedulingManagement: UnifiedCalendar loaded successfully', { module });
      return { default: module.default || module.UnifiedCalendar };
    })
    .catch(error => {
      logger.error('API', '❌ SchedulingManagement: Error loading UnifiedCalendar', error);
      return { default: CalendarFallback };
    })
);

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

interface ViewState {
  activeTab: string;
  selectedWeek: string;
  filters: any;
  viewMode: 'week' | 'day' | 'month';
}

interface SchedulingManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  schedulingStats: SchedulingStats;
  viewState: ViewState;
  onViewStateChange: (state: ViewState) => void;
  performanceMode?: boolean;
  isMobile?: boolean;
  onShiftClick?: (shiftId: string) => void;
}

export function SchedulingManagement({
  activeTab,
  onTabChange,
  schedulingStats,
  viewState,
  onViewStateChange,
  performanceMode = false,
  isMobile = false,
  onShiftClick,
}: SchedulingManagementProps) {

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <Tabs.List>
        <Tabs.Tab
          value="schedule"
          icon={<Icon icon={CalendarIcon} size="sm" />}
          badge={<Badge size="sm" colorPalette="blue">{schedulingStats.employees_scheduled}</Badge>}
        >
          Horarios
        </Tabs.Tab>

        <Tabs.Tab
          value="timeoff"
          icon={<Icon icon={UserMinusIcon} size="sm" />}
          badge={schedulingStats.pending_time_off > 0 ? (
            <Badge size="sm" colorPalette="orange">{schedulingStats.pending_time_off}</Badge>
          ) : undefined}
        >
          Permisos
        </Tabs.Tab>

        <Tabs.Tab
          value="coverage"
          icon={<Icon icon={UsersIcon} size="sm" />}
          badge={schedulingStats.understaffed_shifts > 0 ? (
            <Badge size="sm" colorPalette="red">{schedulingStats.understaffed_shifts}</Badge>
          ) : undefined}
        >
          Cobertura
        </Tabs.Tab>

        <Tabs.Tab
          value="costs"
          icon={<Icon icon={CurrencyDollarIcon} size="sm" />}
          badge={schedulingStats.overtime_hours > 0 ? (
            <Badge size="sm" colorPalette="orange">{schedulingStats.overtime_hours}h OT</Badge>
          ) : undefined}
        >
          Costos
        </Tabs.Tab>

        {!isMobile && (
          <Tabs.Tab
            value="realtime"
            icon={<Icon icon={ClockIcon} size="sm" />}
            badge={<Badge size="sm" colorPalette="green" variant="subtle">LIVE</Badge>}
          >
            Tiempo Real
          </Tabs.Tab>
        )}
      </Tabs.List>

      <Tabs.Panel value="schedule">
        <React.Suspense fallback={<CalendarFallback />}>
          <UnifiedCalendar
            businessModel="staff_scheduling"
            view={viewState.viewMode || 'week'}
            onViewChange={(view) => onViewStateChange({ ...viewState, viewMode: view as any })}
            features={['shift_management', 'time_off', 'coverage_tracking']}
            performanceMode={performanceMode}
            mobileOptimized={isMobile}
            onBookingClick={onShiftClick}
          />
        </React.Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="timeoff">
        <TimeOffManager
          pendingCount={schedulingStats.pending_time_off}
          approvedCount={schedulingStats.approved_requests}
        />
      </Tabs.Panel>

      <Tabs.Panel value="coverage">
        <CoveragePlanner
          understaffedShifts={schedulingStats.understaffed_shifts}
          coveragePercentage={schedulingStats.coverage_percentage}
        />
      </Tabs.Panel>

      <Tabs.Panel value="costs">
        <LaborCostTracker
          weeklyTotal={schedulingStats.labor_cost_this_week}
          overtimeHours={schedulingStats.overtime_hours}
        />
      </Tabs.Panel>

      {!isMobile && (
        <Tabs.Panel value="realtime">
          <RealTimeLaborTracker
            selectedDate={new Date().toISOString().split('T')[0]}
            showAlerts={true}
            compactMode={isMobile}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
}

export default SchedulingManagement;