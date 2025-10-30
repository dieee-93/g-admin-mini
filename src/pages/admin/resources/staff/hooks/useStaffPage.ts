/**
 * Staff Page Orchestrator Hook
 * Comprehensive hook for managing staff page state, metrics, and actions
 * Following the established products pattern
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useStaffWithLoader } from '@/hooks/useStaffData';
import {
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  CogIcon,
  PlusIcon,
  ClockIcon,
  CreditCardIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import migrated services
import {
  StaffPerformanceAnalyticsEngine,
  calculateEmployeeLiveCost,
  calculateDailyCostSummary,
  analyzeBudgetVariance,
  calculateLaborEfficiency,
  getStaffStats,
  type PerformanceMetrics,
  type DailyCostSummary,
  type LiveCostCalculation,
  type StaffAnalyticsResult,
  type Employee,
  type TimeEntry,
  type Schedule
} from '../services';

import type { StaffViewState } from '../types';

import { logger } from '@/lib/logging';
// ============================================================================
// TYPES
// ============================================================================

export interface StaffPageMetrics {
  // Core Staff Metrics
  totalStaff: number;
  activeStaff: number;
  onShiftCount: number;
  avgPerformanceRating: number;

  // Real-time Labor Cost Metrics
  todayLaborCost: number;
  projectedLaborCost: number;
  laborCostPerHour: number;
  budgetUtilization: number;
  budgetVariance: number;

  // Performance Metrics
  avgAttendanceRate: number;
  avgPunctualityScore: number;
  totalOvertimeHours: number;
  efficiencyScore: number;

  // Department Distribution
  departmentBreakdown: Record<string, number>;

  // Training & Development
  upcomingReviews: number;
  trainingHoursThisMonth: number;
  skillGaps: string[];

  // Alerts and Notifications
  criticalAlerts: number;
  retentionRisks: number;
  overtimeConcerns: number;
}

export interface StaffPageState {
  activeTab: 'directory' | 'performance' | 'training' | 'management' | 'timetracking';
  filters: {
    department?: string;
    position?: string;
    status?: string;
    performanceRange?: [number, number];
  };
  sortBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
  viewMode: 'grid' | 'list' | 'cards';
  selectedEmployees: string[];
  showAnalytics: boolean;
  analyticsTimeframe: '1M' | '3M' | '6M' | '1Y';
}

export interface StaffPageActions {
  // Employee Management
  handleNewEmployee: () => void;
  handleEditEmployee: (employeeId: string) => void;
  handleEmployeeBulkAction: (action: string, employeeIds: string[]) => void;

  // Performance Management
  handlePerformanceReview: (employeeId: string) => void;
  handleBulkPerformanceUpdate: () => void;
  handleShowAnalytics: () => void;

  // Training & Development
  handleScheduleTraining: (employeeId?: string) => void;
  handleTrainingProgram: () => void;
  handleSkillAssessment: () => void;

  // Time & Labor Management
  handleClockInOut: (employeeId: string) => void;
  handleTimeReports: () => void;
  handleScheduleManagement: () => void;

  // Administrative Actions
  handlePayrollGeneration: () => void;
  handleBudgetAnalysis: () => void;
  handleComplianceReport: () => void;

  // View State Management
  setActiveTab: (tab: StaffPageState['activeTab']) => void;
  setFilters: (filters: Partial<StaffPageState['filters']>) => void;
  setSortBy: (field: string, direction: 'asc' | 'desc') => void;
  setViewMode: (mode: StaffPageState['viewMode']) => void;
  toggleAnalytics: () => void;
}

export interface UseStaffPageReturn {
  // Data
  pageState: StaffPageState;
  metrics: StaffPageMetrics;
  employees: Employee[];
  performanceAnalytics: StaffAnalyticsResult | null;
  laborCostSummary: DailyCostSummary;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  actions: StaffPageActions;

  // Computed Data
  filteredEmployees: Employee[];
  departmentStats: Record<string, any>;
  alertsData: any[];
}

// ============================================================================
// STAFF PAGE ORCHESTRATOR HOOK
// ============================================================================

export const useStaffPage = (): UseStaffPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();
  const { staff, loading: staffLoading, error: staffError } = useStaffWithLoader();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [pageState, setPageState] = useState<StaffPageState>({
    activeTab: 'directory',
    filters: {},
    sortBy: { field: 'name', direction: 'asc' },
    viewMode: 'grid',
    selectedEmployees: [],
    showAnalytics: false,
    analyticsTimeframe: '3M'
  });

  const [performanceAnalytics, setPerformanceAnalytics] = useState<StaffAnalyticsResult | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffStatsData, setStaffStatsData] = useState<any>(null);

  // Load staff stats async
  useEffect(() => {
    getStaffStats().then(stats => setStaffStatsData(stats)).catch(err => {
      logger.error('App', 'Failed to load staff stats:', err);
    });
  }, [staff.length]);

  // ============================================================================
  // COMPUTED DATA & METRICS
  // ============================================================================

  // Real-time staff metrics calculation
  const metrics: StaffPageMetrics = useMemo(() => {
    if (!staffStatsData) {
      return {
        totalStaff: staff.length,
        activeStaff: staff.filter(s => s.status === 'active').length,
        onShiftCount: 0,
        avgPerformanceRating: 0,
        todayLaborCost: 0,
        projectedLaborCost: 0,
        laborCostPerHour: 0,
        budgetUtilization: 0,
        budgetVariance: 0,
        avgAttendanceRate: 0,
        avgPunctualityScore: 0,
        totalOvertimeHours: 0,
        efficiencyScore: 0,
        departmentBreakdown: {},
        upcomingReviews: 0,
        trainingHoursThisMonth: 0,
        skillGaps: [],
        criticalAlerts: 0,
        retentionRisks: 0,
        overtimeConcerns: 0
      };
    }

    const staffStats = staffStatsData;

    // Mock time entries and schedules (in real app, these would come from API)
    const mockTimeEntries: TimeEntry[] = staff.map((employee, index) => ({
      id: `time_${index}`,
      employee_id: employee.id,
      clock_in: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      clock_out: Math.random() > 0.3 ? new Date().toISOString() : null,
      break_minutes: 30,
      total_hours: 6 + Math.random() * 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Calculate live labor costs
    const liveCosts: LiveCostCalculation[] = staff
      .filter(emp => emp.status === 'active')
      .map(employee => {
        return calculateEmployeeLiveCost({
          employee_id: employee.id,
          employee_name: employee.name,
          hourly_rate: employee.hourly_rate || 15,
          clock_in_time: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
          shift_start_time: '09:00',
          shift_end_time: '17:00'
        });
      });

    const laborSummary = calculateDailyCostSummary(liveCosts, 2000); // $2000 daily budget
    const budgetAnalysis = analyzeBudgetVariance(laborSummary.total_current_cost, 2000);
    const efficiencyData = calculateLaborEfficiency(liveCosts);

    // Department breakdown
    const departmentBreakdown = staff.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      // Core Staff Metrics
      totalStaff: staffStats.totalStaff,
      activeStaff: staffStats.activeStaff,
      onShiftCount: staff.filter(s => s.status === 'active').length,
      avgPerformanceRating: staffStats.avgPerformance / 20, // Convert from 0-100 to 0-5 scale

      // Real-time Labor Cost Metrics
      todayLaborCost: laborSummary.total_current_cost,
      projectedLaborCost: laborSummary.total_projected_cost,
      laborCostPerHour: efficiencyData.cost_per_hour,
      budgetUtilization: laborSummary.budget_utilization_percent,
      budgetVariance: budgetAnalysis.variance_percentage,

      // Performance Metrics
      avgAttendanceRate: 87.5, // Mock value - would come from analytics
      avgPunctualityScore: 92.3, // Mock value - would come from analytics
      totalOvertimeHours: laborSummary.total_overtime_hours,
      efficiencyScore: efficiencyData.overall_efficiency,

      // Department Distribution
      departmentBreakdown,

      // Training & Development
      upcomingReviews: staffStats.upcomingReviews?.length || 0,
      trainingHoursThisMonth: Math.floor(Math.random() * 50) + 20,
      skillGaps: ['Customer Service', 'Food Safety', 'POS Systems'],

      // Alerts and Notifications
      criticalAlerts: liveCosts.filter(lc => lc.overtime_status === 'in_overtime').length,
      retentionRisks: Math.floor(staff.length * 0.15), // 15% estimated retention risk
      overtimeConcerns: liveCosts.filter(lc => lc.overtime_hours > 10).length
    };
  }, [staff, staffStatsData]);

  // Labor cost summary for detailed analysis
  const laborCostSummary: DailyCostSummary = useMemo(() => {
    const liveCosts: LiveCostCalculation[] = staff
      .filter(emp => emp.status === 'active')
      .map(employee => {
        return calculateEmployeeLiveCost({
          employee_id: employee.id,
          employee_name: employee.name,
          hourly_rate: employee.hourly_rate || 15,
          clock_in_time: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
          shift_start_time: '09:00',
          shift_end_time: '17:00'
        });
      });

    return calculateDailyCostSummary(liveCosts, 2000);
  }, [staff]);

  // Filtered employees based on current filters
  const filteredEmployees = useMemo(() => {
    let filtered = [...staff];

    // Apply filters
    if (pageState.filters.department) {
      filtered = filtered.filter(emp => emp.department === pageState.filters.department);
    }
    if (pageState.filters.status) {
      filtered = filtered.filter(emp => emp.status === pageState.filters.status);
    }
    if (pageState.filters.position) {
      filtered = filtered.filter(emp => emp.position?.toLowerCase().includes(pageState.filters.position!.toLowerCase()));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = pageState.sortBy;
      let aValue = (a as any)[field];
      let bValue = (b as any)[field];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [staff, pageState.filters, pageState.sortBy]);

  // Department statistics
  const departmentStats = useMemo(() => {
    const stats: Record<string, any> = {};

    Object.keys(metrics.departmentBreakdown).forEach(dept => {
      const deptEmployees = staff.filter(emp => emp.department === dept);
      const activeDeptEmployees = deptEmployees.filter(emp => emp.status === 'active');

      stats[dept] = {
        total: metrics.departmentBreakdown[dept],
        active: activeDeptEmployees.length,
        avgPerformance: activeDeptEmployees.length > 0
          ? activeDeptEmployees.reduce((sum, emp) => sum + (emp.performance_rating || 3), 0) / activeDeptEmployees.length
          : 0,
        avgHourlyRate: activeDeptEmployees.length > 0
          ? activeDeptEmployees.reduce((sum, emp) => sum + (emp.hourly_rate || 15), 0) / activeDeptEmployees.length
          : 0
      };
    });

    return stats;
  }, [staff, metrics.departmentBreakdown]);

  // Alerts data for notifications
  const alertsData = useMemo(() => {
    const alerts = [];

    // Performance alerts
    if (metrics.avgPerformanceRating < 3.5) {
      alerts.push({
        type: 'performance',
        severity: 'medium',
        message: 'Average performance rating below target',
        action: 'Review performance improvement plans'
      });
    }

    // Budget alerts
    if (metrics.budgetVariance > 10) {
      alerts.push({
        type: 'budget',
        severity: 'high',
        message: `Labor costs ${metrics.budgetVariance.toFixed(1)}% over budget`,
        action: 'Review staffing levels and overtime policies'
      });
    }

    // Overtime alerts
    if (metrics.overtimeConcerns > 0) {
      alerts.push({
        type: 'overtime',
        severity: 'medium',
        message: `${metrics.overtimeConcerns} employees with excessive overtime`,
        action: 'Optimize scheduling and consider additional hiring'
      });
    }

    return alerts;
  }, [metrics]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Configure quick actions based on active tab
  useEffect(() => {
    const getQuickActionsForTab = (tab: string) => {
      const baseActions = [
        {
          id: 'new-employee',
          label: 'Nuevo Empleado',
          icon: PlusIcon,
          action: () => handleNewEmployee(),
          color: 'blue'
        }
      ];

      switch (tab) {
        case 'directory':
          return [
            ...baseActions,
            {
              id: 'bulk-actions',
              label: 'Acciones Masivas',
              icon: UsersIcon,
              action: () => logger.info('StaffStore', 'Bulk actions'),
              color: 'purple'
            }
          ];
        case 'performance':
          return [
            ...baseActions,
            {
              id: 'analytics',
              label: 'Ver Analytics',
              icon: ChartBarIcon,
              action: () => handleShowAnalytics(),
              color: 'green'
            },
            {
              id: 'performance-review',
              label: 'Nueva Evaluación',
              icon: TrophyIcon,
              action: () => handleBulkPerformanceUpdate(),
              color: 'purple'
            }
          ];
        case 'training':
          return [
            ...baseActions,
            {
              id: 'schedule-training',
              label: 'Programar Entrenamiento',
              icon: AcademicCapIcon,
              action: () => handleScheduleTraining(),
              color: 'orange'
            }
          ];
        case 'management':
          return [
            ...baseActions,
            {
              id: 'payroll',
              label: 'Generar Nómina',
              icon: CreditCardIcon,
              action: () => handlePayrollGeneration(),
              color: 'teal'
            },
            {
              id: 'budget-analysis',
              label: 'Análisis Presupuesto',
              icon: ChartBarIcon,
              action: () => handleBudgetAnalysis(),
              color: 'blue'
            }
          ];
        case 'timetracking':
          return [
            ...baseActions,
            {
              id: 'time-reports',
              label: 'Reportes Tiempo',
              icon: ClockIcon,
              action: () => handleTimeReports(),
              color: 'cyan'
            }
          ];
        default:
          return baseActions;
      }
    };

    setQuickActions(getQuickActionsForTab(pageState.activeTab));
    return () => setQuickActions([]);
  }, [pageState.activeTab]);

  // Update module badge with critical alerts count
  useEffect(() => {
    if (metrics.criticalAlerts > 0) {
      updateModuleBadge('staff', {
        count: metrics.criticalAlerts,
        color: 'red',
        pulse: true
      });
    } else {
      updateModuleBadge('staff', null);
    }
  }, [metrics.criticalAlerts, updateModuleBadge]);

  // Generate performance analytics when requested
  useEffect(() => {
    if (pageState.showAnalytics && !performanceAnalytics && !analyticsLoading) {
      generatePerformanceAnalytics();
    }
  }, [pageState.showAnalytics, performanceAnalytics, analyticsLoading]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const generatePerformanceAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setError(null);

    try {
      // Mock data - in real app would come from APIs
      const mockTimeEntries: TimeEntry[] = staff.map((employee, index) => ({
        id: `time_${index}`,
        employee_id: employee.id,
        clock_in: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        clock_out: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
        break_minutes: 30 + Math.random() * 30,
        total_hours: 6 + Math.random() * 4,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }));

      const mockSchedules: Schedule[] = staff.map((employee, index) => ({
        id: `schedule_${index}`,
        employee_id: employee.id,
        start_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
        break_minutes: 30,
        status: Math.random() > 0.1 ? 'completed' : 'missed' as any,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }));

      const analytics = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        staff as Employee[],
        mockTimeEntries,
        mockSchedules,
        {
          analysisMonths: pageState.analyticsTimeframe === '1M' ? 1 :
                          pageState.analyticsTimeframe === '3M' ? 3 :
                          pageState.analyticsTimeframe === '6M' ? 6 : 12
        }
      );

      setPerformanceAnalytics(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [staff, pageState.analyticsTimeframe]);

  // Action handlers
  const actions: StaffPageActions = useMemo(() => ({
    // Employee Management
    handleNewEmployee: () => {
      logger.info('StaffStore', 'Opening new employee modal');
      // Would open employee creation modal
    },

    handleEditEmployee: (employeeId: string) => {
      logger.info('StaffStore', 'Editing employee:', employeeId);
      // Would open employee edit modal
    },

    handleEmployeeBulkAction: (action: string, employeeIds: string[]) => {
      logger.info('StaffStore', 'Bulk action:', action, 'for employees:', employeeIds);
      // Would handle bulk operations
    },

    // Performance Management
    handlePerformanceReview: (employeeId: string) => {
      logger.info('StaffStore', 'Starting performance review for:', employeeId);
      // Would open performance review interface
    },

    handleBulkPerformanceUpdate: () => {
      logger.info('StaffStore', 'Bulk performance update');
      // Would open bulk performance update modal
    },

    handleShowAnalytics: () => {
      setPageState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }));
    },

    // Training & Development
    handleScheduleTraining: (employeeId?: string) => {
      logger.info('StaffStore', 'Scheduling training for:', employeeId || 'all employees');
      // Would open training scheduler
    },

    handleTrainingProgram: () => {
      logger.info('StaffStore', 'Managing training programs');
      // Would open training program management
    },

    handleSkillAssessment: () => {
      logger.info('StaffStore', 'Starting skill assessment');
      // Would open skill assessment interface
    },

    // Time & Labor Management
    handleClockInOut: (employeeId: string) => {
      logger.info('StaffStore', 'Clock in/out for employee:', employeeId);
      // Would handle time tracking
    },

    handleTimeReports: () => {
      logger.info('StaffStore', 'Generating time reports');
      // Would open time reporting interface
    },

    handleScheduleManagement: () => {
      logger.info('StaffStore', 'Opening schedule management');
      // Would open schedule management interface
    },

    // Administrative Actions
    handlePayrollGeneration: () => {
      logger.info('StaffStore', 'Generating payroll');
      // Would start payroll generation process
    },

    handleBudgetAnalysis: () => {
      logger.info('StaffStore', 'Opening budget analysis');
      // Would open budget analysis dashboard
    },

    handleComplianceReport: () => {
      logger.info('StaffStore', 'Generating compliance report');
      // Would generate compliance reports
    },

    // View State Management
    setActiveTab: (tab: StaffPageState['activeTab']) => {
      setPageState(prev => ({ ...prev, activeTab: tab }));
    },

    setFilters: (filters: Partial<StaffPageState['filters']>) => {
      setPageState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
    },

    setSortBy: (field: string, direction: 'asc' | 'desc') => {
      setPageState(prev => ({ ...prev, sortBy: { field, direction } }));
    },

    setViewMode: (mode: StaffPageState['viewMode']) => {
      setPageState(prev => ({ ...prev, viewMode: mode }));
    },

    toggleAnalytics: () => {
      setPageState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }));
    }
  }), []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    pageState,
    metrics,
    employees: staff,
    performanceAnalytics,
    laborCostSummary,

    // State
    loading: staffLoading || analyticsLoading,
    error: error || staffError,

    // Actions
    actions,

    // Computed Data
    filteredEmployees,
    departmentStats,
    alertsData
  };
};