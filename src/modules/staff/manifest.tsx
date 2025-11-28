/**
 * STAFF MODULE MANIFEST
 *
 * Real staff management module from src/pages/admin/resources/staff
 * Provides employee management, performance tracking, and time tracking.
 *
 * MODULE INTEGRATION:
 * - Provides calendar events (staff shifts)
 * - Provides dashboard widgets (staff performance)
 * - Provides scheduling toolbar actions (availability button)
 *
 * @version 1.0.0
 * @see src/pages/admin/resources/staff/page.tsx
 */

import React, { lazy } from 'react';
import type { ModuleManifest, ModuleRegistry } from '@/lib/modules/types';
import { Badge, Stack, Typography } from '@/shared/ui';
import { UsersIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { useCrudOperations } from '@/hooks/core/useCrudOperations';

// ============================================
// MODULE MANIFEST
// ============================================

export const staffManifest: ModuleManifest = {
  id: 'staff',
  name: 'Staff Management',
  version: '1.0.0',

  // No dependencies - staff is a foundational module
  depends: [],

  // Requires basic employee management feature
  requiredFeatures: ['staff_employee_management'],

  // Optional features enhance functionality
  optionalFeatures: [
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking',
    'staff_training_management',
    'staff_labor_cost_tracking'
  ],

  // 🔒 PERMISSIONS: Supervisors and above can manage staff
  minimumRole: 'SUPERVISOR' as const,

  // Hook points this module provides
  hooks: {
    provide: [
      'calendar.events',           // Render staff shifts on calendar
      'dashboard.widgets',         // Staff performance widget
      'scheduling.toolbar.actions' // "View Staff Availability" button
    ],
    consume: [] // Staff module doesn't consume hooks from others
  },

  // Setup function - register hooks
  setup: async (registry: ModuleRegistry) => {
    // Hook 1: Calendar Events - Render staff shifts
    registry.addAction(
      'calendar.events',
      (data?: { selectedWeek?: string; shifts?: Array<{ type: string; employee_name: string; start_time: string; end_time: string }> }) => {
        const staffShifts = data?.shifts?.filter(s => s.type === 'staff') || [];

        if (staffShifts.length === 0) return null;

        return (
          <Stack direction="column" gap="2" key="staff-calendar-events">
            <Stack direction="row" align="center" gap="2">
              <UsersIcon className="w-5 h-5 text-blue-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Staff Shifts ({staffShifts.length})
              </Typography>
            </Stack>
            <Stack direction="column" gap="1">
              {staffShifts.slice(0, 5).map((shift, idx) => (
                <Stack key={idx} direction="row" align="center" gap="2">
                  <Badge variant="solid" colorPalette="blue">
                    {shift.employee_name}
                  </Badge>
                  <Typography variant="body" size="xs" color="text.muted">
                    {shift.start_time} - {shift.end_time}
                  </Typography>
                </Stack>
              ))}
              {staffShifts.length > 5 && (
                <Typography variant="body" size="xs" color="text.muted">
                  +{staffShifts.length - 5} more shifts
                </Typography>
              )}
            </Stack>
          </Stack>
        );
      },
      'staff',
      100 // Highest priority - staff shifts render first
    );

    // ✅ Hook 2: Dashboard Widget - Staff performance
    const StaffWidget = lazy(() => import('./components/StaffWidget'));

    registry.addAction(
      'dashboard.widgets',
      () => (
        <React.Suspense fallback={<div>Cargando staff...</div>}>
          <StaffWidget />
        </React.Suspense>
      ),
      'staff',
      75 // High priority widget
    );


    // ✅ Hook 3: Dashboard KPI Widget - Staff Stat Card
    const { StaffStatWidget } = await import('./widgets');

    registry.addAction(
      'dashboard.widgets',
      () => <StaffStatWidget key="staff-stat-widget" />,
      'staff',
      98 // Tercera posición
    );

    logger.debug('App', 'Registered dashboard.widgets hook (Staff KPI)');
    logger.info('App', '✅ Staff module setup complete');

    // Hook 3: Scheduling Toolbar Action - Availability button
    registry.addAction(
      'scheduling.toolbar.actions',
      (data?: { onViewStaffAvailability?: () => void }) => {
        return (
          <button
            key="staff-availability-action"
            onClick={data?.onViewStaffAvailability}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            View Staff Availability
          </button>
        );
      },
      'staff',
      100 // High priority action
    );

    console.log('[Staff Module] Hooks registered successfully');
  },

  // Teardown function - cleanup
  teardown: () => {
    console.log('[Staff Module] Cleanup complete');
  },

  // Public API exports
  exports: {
    /**
     * React Hooks for Staff data fetching
     * Follows Module Exports pattern from CROSS_MODULE_DATA_STRATEGY.md
     */
    hooks: {
      /**
       * Hook factory for employees list
       * Returns the actual hook that components can use
       *
       * @example
       * ```tsx
       * const registry = ModuleRegistry.getInstance();
       * const staffModule = registry.getExports('staff');
       * const useEmployeesList = staffModule.hooks.useEmployeesList;
       *
       * function MyComponent() {
       *   const { items: employees, loading } = useEmployeesList();
       *   // ...
       * }
       * ```
       */
      useEmployeesList: () => {
        return useCrudOperations({
          tableName: 'employees',
          selectQuery: 'id, first_name, last_name, position, hourly_rate, is_active, checked_in, checked_in_at',
          cacheKey: 'employees-list',
          cacheTime: 5 * 60 * 1000, // 5 minutes
          enableRealtime: true,
        });
      }
    },

    // Functions that other modules can call
    getStaffAvailability: async () => {
      // Mock implementation - real version would query database
      // TODO: Implement real database query with date parameter
      return [
        { id: '1', name: 'John Doe', available: true, skills: ['kitchen'] },
        { id: '2', name: 'Jane Smith', available: false, skills: ['service'] }
      ];
    },

/**     * Get currently active (checked-in) staff     * Used by ShiftControlWidget to display active staff count     *     * @returns Promise<Employee[]> Array of checked-in employees     * @example     * ```tsx     * const staffModule = registry.getExports('staff');     * const activeStaff = await staffModule.getActiveStaff();     * console.log(`${activeStaff.length} employees checked in`);     * ```     */    getActiveStaff: async () => {      const { supabase } = await import('@/lib/supabase/client');      const { data, error } = await supabase        .from('employees')        .select('id, first_name, last_name, position, hourly_rate, checked_in, checked_in_at')        .eq('is_active', true)        .eq('checked_in', true);      if (error) {        logger.error('Staff', 'Failed to fetch active staff', error);        return [];      }      return data || [];    },
    calculateLaborCost: (hours: number, rate: number) => {
      return hours * rate;
    }
  },

  // Module metadata
  metadata: {
    category: 'business',
    description: 'Employee management, performance tracking, and labor cost analysis',
    author: 'G-Admin Team',
    tags: ['hr', 'staff', 'scheduling', 'performance'],
    navigation: {
      route: '/admin/resources/staff',
      icon: UsersIcon,
      color: 'indigo',
      domain: 'resources',
      isExpandable: false
    }
  }
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default staffManifest;

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Staff module public API types
 */
export interface StaffAPI {
  hooks: {
    useEmployeesList: () => () => {
      items: Array<{
        id: string;
        first_name: string;
        last_name: string;
        position?: string;
        hourly_rate?: number;
        is_active?: boolean;
      }>;
      loading: boolean;
      error: string | null;
      fetchAll: () => Promise<any[]>;
      refresh: () => Promise<void>;
    };
  };
  getStaffAvailability: () => Promise<
    Array<{
      id: string;
      name: string;
      available: boolean;
      skills: string[];
    }>
  >;
  calculateLaborCost: (hours: number, rate: number) => number;
}
