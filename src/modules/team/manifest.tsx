/**
 * TEAM MODULE MANIFEST
 *
 * Real staff management module from src/pages/admin/resources/team
 * Provides teamMember management, performance tracking, and time tracking.
 *
 * MODULE INTEGRATION:
 * - Provides calendar events (staff shifts)
 * - Provides dashboard widgets (staff performance)
 * - Provides scheduling toolbar actions (availability button)
 *
 * @version 1.0.0
 * @see src/pages/admin/resources/team/page.tsx
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

export const teamManifest: ModuleManifest = {
  id: 'staff',
  name: 'Team Management',
  version: '1.0.0',

  // No dependencies - staff is a foundational module
  depends: [],

  // Requires basic staff management feature
  activatedBy: 'staff_employee_management',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
  // Optional features enhance functionality

  // 🔒 PERMISSIONS: Supervisors and above can manage staff
  minimumRole: 'SUPERVISOR' as const,

  // Hook points this module provides
  hooks: {
    provide: [
      'calendar.events',           // Render staff shifts on calendar
      'dashboard.widgets',         // Team performance widget
      'scheduling.toolbar.actions' // "View Team Availability" button
    ],
    consume: [] // Team module doesn't consume hooks from others
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
                Team Shifts ({staffShifts.length})
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

    // ❌ DISABLED: TeamWidget file doesn't exist
    // TODO: Create TeamWidget in src/pages/admin/core/dashboard/components/widgets/TeamWidget.tsx
    // const TeamWidget = lazy(() => import('@/pages/admin/core/dashboard/components/widgets/TeamWidget'));
    // registry.addAction(
    //   'dashboard.widgets',
    //   () => (
    //     <React.Suspense fallback={<div>Cargando staff...</div>}>
    //       <TeamWidget />
    //     </React.Suspense>
    //   ),
    //   'staff',
    //   75 // High priority widget
    // );


    // ✅ Hook 3: Dashboard KPI Widget - Team Stat Card
    const { TeamStatWidget } = await import('./widgets');

    registry.addAction(
      'dashboard.widgets',
      () => <TeamStatWidget key="staff-stat-widget" />,
      'staff',
      98 // Tercera posición
    );

    logger.debug('App', 'Registered dashboard.widgets hook (Team KPI)');

    // ============================================
    // SHIFT CONTROL INTEGRATION
    // ============================================

    const { TeamIndicator } = await import('./widgets/TeamIndicator');

    registry.addAction(
      'shift-control.indicators',
      ({ activeTeamCount }) => (
        <TeamIndicator
          activeTeamCount={activeTeamCount}
          key="team-indicator"
        />
      ),
      'team',
      80
    );

    logger.debug('App', 'Registered shift-control.indicators hook (TeamIndicator)');
    logger.info('App', '✅ Team module setup complete');

    // Hook 3: Scheduling Toolbar Action - Availability button
    registry.addAction(
      'scheduling.toolbar.actions',
      (data?: { onViewTeamAvailability?: () => void }) => {
        return (
          <button
            key="staff-availability-action"
            onClick={data?.onViewTeamAvailability}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            View Team Availability
          </button>
        );
      },
      'staff',
      100 // High priority action
    );

    console.log('[Team Module] Hooks registered successfully');
  },

  // Teardown function - cleanup
  teardown: () => {
    console.log('[Team Module] Cleanup complete');
  },

  // Public API exports
  exports: {
    /**
     * React Hooks for Team data fetching
     * Follows Module Exports pattern from CROSS_MODULE_DATA_STRATEGY.md
     */
    hooks: {
      /**
       * Hook factory for teamMembers list
       * Returns the actual hook that components can use
       *
       * @example
       * ```tsx
       * const registry = ModuleRegistry.getInstance();
       * const staffModule = registry.getExports('staff');
       * const useTeamMembersList = staffModule.hooks.useTeamMembersList;
       *
       * function MyComponent() {
       *   const { items: teamMembers, loading } = useTeamMembersList();
       *   // ...\
       * }
       * ```
       */
      useTeamMembersList: () => {
        return useCrudOperations({
          tableName: 'team_members',
          selectQuery: 'id, first_name, last_name, position, hourly_rate, is_active, checked_in, checked_in_at, job_role_id, user_id',
          cacheKey: 'team-members-list',
          cacheTime: 5 * 60 * 1000, // 5 minutes
          enableRealtime: true,
        });
      },

      /**
       * Hook factory for staff roles list
       * Returns active staff roles for allocation/costing
       */
      useJobRoles: () => {
        return useCrudOperations({
          tableName: 'job_roles',
          selectQuery: 'id, name, department, default_hourly_rate, loaded_factor, is_active, sort_order',
          cacheKey: 'staff-roles-list',
          cacheTime: 5 * 60 * 1000,
          enableRealtime: true,
        });
      }
    },

    // =========================================================================
    // COSTING API - For use by Products module
    // See: docs/product/COSTING_ARCHITECTURE.md (Section 5.8)
    // =========================================================================
    costing: {
      /**
       * Get all active staff roles for allocation selectors
       */
      getRolesForAllocation: async () => {
        const { getJobRolesForAllocation } = await import(
          '@/modules/team/services'
        );
        return getJobRolesForAllocation();
      },

      /**
       * Get the loaded hourly cost for a specific role
       */
      getRoleHourlyCost: async (roleId: string) => {
        const { getRoleHourlyCost } = await import(
          '@/modules/team/services'
        );
        return getRoleHourlyCost(roleId);
      },

      /**
       * Get a single staff role by ID
       */
      getJobRole: async (roleId: string) => {
        const { getJobRole } = await import(
          '@/modules/team/services'
        );
        return getJobRole(roleId);
      },

      /**
       * Get labor costing configuration
       */
      getLaborCostingConfig: async () => {
        const { getLaborCostingConfig } = await import(
          '@/modules/team/services'
        );
        return getLaborCostingConfig();
      },

      /**
       * Calculate labor cost for a set of staff allocations
       * Full calculation with loaded factors and rate hierarchy
       */
      calculateLaborCost: async (allocations: Array<{
        role_id: string;
        duration_minutes: number;
        count: number;
        hourly_rate?: number;
        employee_id?: string;
        loaded_factor_override?: number;
      }>) => {
        const { calculateLaborCost } = await import(
          '@/modules/team/services'
        );
        
        // Map to TeamAllocation format
        const staffAllocations = allocations.map(a => ({
          product_id: '', // Not needed for calculation
          role_id: a.role_id,
          employee_id: a.employee_id,
          duration_minutes: a.duration_minutes,
          count: a.count,
          hourly_rate: a.hourly_rate,
          loaded_factor_override: a.loaded_factor_override,
        }));
        
        return calculateLaborCost(staffAllocations);
      },
    },

    // Functions that other modules can call
    getTeamAvailability: async () => {
      // Mock implementation - real version would query database
      // TODO: Implement real database query with date parameter
      return [
        { id: '1', name: 'John Doe', available: true, skills: ['kitchen'] },
        { id: '2', name: 'Jane Smith', available: false, skills: ['service'] }
      ];
    },

    /**
     * Get currently active (checked-in) staff
     * Used by ShiftControlWidget to display active staff count
     */
    getActiveTeam: async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data, error } = await supabase
        .from('teamMembers')
        .select('id, first_name, last_name, position, hourly_rate, checked_in, checked_in_at, job_role_id')
        .eq('is_active', true)
        .eq('checked_in', true);

      if (error) {
        logger.error('App', 'Failed to fetch active staff');
        return [];
      }
      return data || [];
    },

    /** @deprecated Use costing.calculateLaborCost instead */
    calculateLaborCost: (hours: number, rate: number) => {
      return hours * rate;
    }
  },

  // Module metadata
  metadata: {
    category: 'business',
    description: 'TeamMember management, performance tracking, and labor cost analysis',
    author: 'G-Admin Team',
    tags: ['hr', 'staff', 'scheduling', 'performance'],
    navigation: {
      route: '/admin/resources/team',
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

export default teamManifest;

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Team module public API types
 */
export interface TeamAPI {
  hooks: {
    useTeamMembersList: () => {
      items: Array<{
        id: string;
        first_name: string;
        last_name: string;
        position?: string;
        hourly_rate?: number;
        is_active?: boolean;
        job_role_id?: string;
        user_id?: string;
      }>;
      loading: boolean;
      error: string | null;
      fetchAll: () => Promise<unknown[]>;
      refresh: () => Promise<void>;
    };
    useJobRoles: () => {
      items: Array<{
        id: string;
        name: string;
        department?: string;
        default_hourly_rate?: number;
        loaded_factor?: number;
        is_active?: boolean;
      }>;
      loading: boolean;
      error: string | null;
      fetchAll: () => Promise<unknown[]>;
      refresh: () => Promise<void>;
    };
  };
  costing: {
    getRolesForAllocation: () => Promise<Array<{
      id: string;
      name: string;
      department?: string | null;
      default_hourly_rate?: number | null;
      loaded_factor: number;
      loaded_hourly_cost: number;
    }>>;
    getRoleHourlyCost: (roleId: string) => Promise<number>;
    getJobRole: (roleId: string) => Promise<{
      id: string;
      name: string;
      default_hourly_rate?: number | null;
      loaded_factor: number;
    } | null>;
    getLaborCostingConfig: () => Promise<{
      default_loaded_factor: number;
      factors_by_employment_type?: Record<string, number>;
    }>;
    calculateLaborCost: (allocations: Array<{
      role_id: string;
      duration_minutes: number;
      count: number;
      hourly_rate_override?: number;
    }>) => Promise<{
      total_cost: number;
      breakdown: Array<{ role_id: string; hours: number; cost: number }>;
    }>;
  };
  getTeamAvailability: () => Promise<
    Array<{
      id: string;
      name: string;
      available: boolean;
      skills: string[];
    }>
  >;
  getActiveTeam: () => Promise<
    Array<{
      id: string;
      first_name: string;
      last_name: string;
      position?: string;
      hourly_rate?: number;
      job_role_id?: string;
    }>
  >;
  /** @deprecated Use costing.calculateLaborCost instead */
  calculateLaborCost: (hours: number, rate: number) => number;
}
