// SchedulingManagement.tsx - Enterprise Management Component with Tabs
// Following G-Admin Mini v2.1 patterns - Scheduling Module

import React from 'react';
import {
  Tabs, Stack, Typography, Badge, Icon
} from '@/shared/ui';
import { CapabilityGate } from '@/lib/capabilities';
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
}

export function SchedulingManagement({
  activeTab,
  onTabChange,
  schedulingStats,
  viewState,
  onViewStateChange,
  performanceMode = false,
  isMobile = false
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
            <Badge size="sm" colorPalette="error">{schedulingStats.understaffed_shifts}</Badge>
          ) : undefined}
        >
          Cobertura
        </Tabs.Tab>

        <Tabs.Tab
          value="costs"
          icon={<Icon icon={CurrencyDollarIcon} size="sm" />}
          badge={schedulingStats.overtime_hours > 0 ? (
            <Badge size="sm" colorPalette="warning">{schedulingStats.overtime_hours}h OT</Badge>
          ) : undefined}
        >
          Costos
        </Tabs.Tab>

        {!isMobile && (
          <Tabs.Tab
            value="realtime"
            icon={<Icon icon={ClockIcon} size="sm" />}
            badge={<Badge size="sm" colorPalette="success" variant="subtle">LIVE</Badge>}
          >
            Tiempo Real
          </Tabs.Tab>
        )}
      </Tabs.List>

      <Tabs.Panel value="schedule">
        {/* 🚨 DEBUG - PRUEBA DIRECTA SIN CAPABILITY GATE */}
        <div style={{ 
          backgroundColor: '#ff6b6b', 
          color: 'white', 
          padding: '20px', 
          margin: '10px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🔴 PANEL HORARIOS - RENDERIZADO DIRECTO (antes de CapabilityGate)
        </div>

        <CapabilityGate capability="schedule_management">
          {!performanceMode ? (
            <WeeklyScheduleView
              viewState={viewState}
              onViewStateChange={onViewStateChange}
            />
          ) : (
            <WeeklyScheduleView
              viewState={viewState}
              onViewStateChange={onViewStateChange}
              reducedMode={true}
            />
          )}
        </CapabilityGate>
      </Tabs.Panel>

      <Tabs.Panel value="timeoff">
        {/* 🚨 DEBUG - PRUEBA DIRECTA SIN CAPABILITY GATE */}
        <div style={{ 
          backgroundColor: '#51cf66', 
          color: 'white', 
          padding: '20px', 
          margin: '10px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🟢 PANEL PERMISOS - RENDERIZADO DIRECTO (antes de CapabilityGate)
        </div>

        <CapabilityGate capability="approve_timeoff">
          <TimeOffManager
            pendingCount={schedulingStats.pending_time_off}
            approvedCount={schedulingStats.approved_requests}
          />
        </CapabilityGate>
      </Tabs.Panel>

      <Tabs.Panel value="coverage">
        {/* 🚨 DEBUG - CONTROL - Este panel SÍ debe funcionar */}
        <div style={{ 
          backgroundColor: '#ffa500', 
          color: 'white', 
          padding: '20px', 
          margin: '10px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🟠 PANEL COBERTURA - CONTROL - DEBE FUNCIONAR
        </div>

        <CoveragePlanner
          understaffedShifts={schedulingStats.understaffed_shifts}
          coveragePercentage={schedulingStats.coverage_percentage}
        />
      </Tabs.Panel>

      <Tabs.Panel value="costs">
        {/* 🚨 DEBUG - PRUEBA DIRECTA SIN CAPABILITY GATE */}
        <div style={{ 
          backgroundColor: '#339af0', 
          color: 'white', 
          padding: '20px', 
          margin: '10px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🔵 PANEL COSTOS - RENDERIZADO DIRECTO (antes de CapabilityGate)
        </div>

        <CapabilityGate capability="view_labor_costs">
          <LaborCostTracker
            weeklyTotal={schedulingStats.labor_cost_this_week}
            overtimeHours={schedulingStats.overtime_hours}
          />
        </CapabilityGate>
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