/**
 * SCHEDULING MODULE MANIFEST
 *
 * Real scheduling management module from src/pages/admin/resources/scheduling
 * Provides shift management, time-off tracking, and labor cost optimization.
 *
 * MODULE INTEGRATION:
 * - Depends on staff module (requires staff data)
 * - Provides calendar events (time-off requests)
 * - Provides dashboard widgets (scheduling stats)
 * - Consumes staff availability updates
 * - Consumes sales volume forecasts
 *
 * @version 1.0.0
 * @see src/pages/admin/resources/scheduling/page.tsx
 */

import React from 'react';
import type { ModuleManifest, ModuleRegistry } from '@/lib/modules/types';
import { Badge, Stack, Typography } from '@/shared/ui';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

// ============================================
// MODULE MANIFEST
// ============================================

export const schedulingManifest: ModuleManifest = {
  id: 'scheduling',
  name: 'Scheduling Management',
  version: '1.0.0',

  // Requires staff module to function
  depends: ['staff'],

  // Requires shift management feature
  requiredFeatures: ['staff_shift_management'],

  // Optional features enhance functionality
  optionalFeatures: [
    'staff_time_tracking',
    'staff_labor_cost_tracking',
    'scheduling_appointment_booking',
    'scheduling_calendar_management'
  ],

  // Hook points this module provides and consumes
  hooks: {
    provide: [
      // Calendar integration
      'calendar.events',              // Render time-off requests overlay
      'scheduling.toolbar.actions',   // Custom toolbar buttons (export, bulk ops)
      'scheduling.top_metrics',       // Additional metric widgets
      'scheduling.event.actions',     // Context actions for specific events

      // Global integration
      'dashboard.widgets',            // Scheduling stats widget

      // Extensibility
      'scheduling.filters.custom'     // Custom filter options
    ],
    consume: [
      'staff.availability.updated',   // React to staff availability changes
      'sales.volume_forecast',        // Adjust staffing based on forecasts
      'production.schedule.updated',  // React to production schedule changes
      'materials.stock_alert'         // Alert if low stock affects production
    ]
  },

  // Setup function - register hooks
  setup: (registry: ModuleRegistry) => {
    // Hook 1: Calendar Events - Time-off requests overlay
    registry.addAction(
      'calendar.events',
      (data?: { selectedWeek?: string; shifts?: any[] }) => {
        // Mock time-off data - real version would query database
        const timeOffRequests = [
          { id: '1', employee: 'John Doe', date: '2025-10-15', status: 'pending' },
          { id: '2', employee: 'Jane Smith', date: '2025-10-16', status: 'approved' }
        ];

        return (
          <Stack direction="column" gap={2} key="scheduling-calendar-events">
            <Stack direction="row" align="center" gap={2}>
              <CalendarIcon className="w-5 h-5 text-orange-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Time-Off Requests ({timeOffRequests.length})
              </Typography>
            </Stack>
            <Stack direction="column" gap={1}>
              {timeOffRequests.map((request, idx) => (
                <Stack key={idx} direction="row" align="center" gap={2}>
                  <Badge
                    variant="solid"
                    colorPalette={request.status === 'approved' ? 'green' : 'orange'}
                  >
                    {request.employee}
                  </Badge>
                  <Typography variant="body" size="xs" color="text.muted">
                    {request.date}
                  </Typography>
                  <Badge variant="outline" size="sm">
                    {request.status}
                  </Badge>
                </Stack>
              ))}
            </Stack>
          </Stack>
        );
      },
      'scheduling',
      80 // Medium-high priority - renders after staff shifts
    );

    // Hook 2: Dashboard Widget - Scheduling stats
    registry.addAction(
      'dashboard.widgets',
      () => {
        return (
          <Stack
            direction="column"
            gap={3}
            p={4}
            bg="orange.50"
            borderRadius="md"
            key="scheduling-dashboard-widget"
          >
            <Stack direction="row" align="center" gap={2}>
              <ClockIcon className="w-6 h-6 text-orange-600" />
              <Typography variant="heading" size="md" fontWeight="bold" color="orange.900">
                Scheduling Stats
              </Typography>
            </Stack>
            <Stack direction="column" gap={1}>
              <Typography variant="body" size="sm" color="orange.800">
                Total Shifts: 45
              </Typography>
              <Typography variant="body" size="sm" color="orange.800">
                Coverage: 92%
              </Typography>
              <Typography variant="body" size="sm" color="orange.800">
                Labor Cost: $3,240
              </Typography>
            </Stack>
          </Stack>
        );
      },
      'scheduling',
      70 // Medium priority widget
    );

    console.log('[Scheduling Module] Hooks registered successfully');
  },

  // Teardown function - cleanup
  teardown: () => {
    console.log('[Scheduling Module] Cleanup complete');
  },

  // Public API exports
  exports: {
    /**
     * Get weekly schedule for all staff
     * @param week - ISO week string (YYYY-Www)
     * @returns Array of shifts for the week
     */
    getWeeklySchedule: async (week: string) => {
      // Mock implementation - real version would query database
      console.log(`[Scheduling Module] Fetching schedule for week: ${week}`);
      return [
        { id: '1', employee_id: '1', date: '2025-10-13', start: '09:00', end: '17:00' },
        { id: '2', employee_id: '2', date: '2025-10-14', start: '10:00', end: '18:00' }
      ];
    },

    /**
     * Calculate total labor costs for shifts
     * @param shifts - Array of shift objects
     * @returns Total cost in dollars
     */
    calculateLaborCosts: (shifts: any[]) => {
      const totalHours = shifts.reduce((sum, shift) => {
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      const avgRate = 15; // $15/hour average
      return totalHours * avgRate;
    }
  },

  // Module metadata
  metadata: {
    category: 'business',
    description: 'Shift management, time-off tracking, and labor cost optimization',
    author: 'G-Admin Team',
    tags: ['scheduling', 'shifts', 'time-off', 'labor-costs'],
    navigation: {
      route: '/admin/scheduling',
      icon: CalendarIcon,
      color: 'violet',
      domain: 'resources',
      isExpandable: false
    }
  }
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default schedulingManifest;
