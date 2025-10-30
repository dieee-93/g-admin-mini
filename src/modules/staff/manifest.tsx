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

import React from 'react';
import type { ModuleManifest, ModuleRegistry } from '@/lib/modules/types';
import { Badge, Stack, Typography } from '@/shared/ui';
import { UsersIcon } from '@heroicons/react/24/outline';

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
  setup: (registry: ModuleRegistry) => {
    // Hook 1: Calendar Events - Render staff shifts
    registry.addAction(
      'calendar.events',
      (data?: { selectedWeek?: string; shifts?: any[] }) => {
        const staffShifts = data?.shifts?.filter(s => s.type === 'staff') || [];

        if (staffShifts.length === 0) return null;

        return (
          <Stack direction="column" gap={2} key="staff-calendar-events">
            <Stack direction="row" align="center" gap={2}>
              <UsersIcon className="w-5 h-5 text-blue-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Staff Shifts ({staffShifts.length})
              </Typography>
            </Stack>
            <Stack direction="column" gap={1}>
              {staffShifts.slice(0, 5).map((shift, idx) => (
                <Stack key={idx} direction="row" align="center" gap={2}>
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

    // Hook 2: Dashboard Widget - Staff performance
    registry.addAction(
      'dashboard.widgets',
      () => {
        return (
          <Stack
            direction="column"
            gap={3}
            p={4}
            bg="blue.50"
            borderRadius="md"
            key="staff-dashboard-widget"
          >
            <Stack direction="row" align="center" gap={2}>
              <UsersIcon className="w-6 h-6 text-blue-600" />
              <Typography variant="heading" size="md" fontWeight="bold" color="blue.900">
                Staff Performance
              </Typography>
            </Stack>
            <Stack direction="column" gap={1}>
              <Typography variant="body" size="sm" color="blue.800">
                Active Staff: 12
              </Typography>
              <Typography variant="body" size="sm" color="blue.800">
                Avg. Performance: 87%
              </Typography>
              <Typography variant="body" size="sm" color="blue.800">
                On Shift: 5
              </Typography>
            </Stack>
          </Stack>
        );
      },
      'staff',
      75 // High priority widget
    );

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
    // Functions that other modules can call
    getStaffAvailability: async (date: string) => {
      // Mock implementation - real version would query database
      return [
        { id: '1', name: 'John Doe', available: true, skills: ['kitchen'] },
        { id: '2', name: 'Jane Smith', available: false, skills: ['service'] }
      ];
    },

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
      route: '/admin/staff',
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
