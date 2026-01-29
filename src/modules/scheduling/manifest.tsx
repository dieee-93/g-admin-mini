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

import React, { lazy } from 'react';
import type { ModuleManifest, ModuleRegistry } from '@/lib/modules/types';
import { Badge, Stack, Typography } from '@/shared/ui';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

// ============================================
// MODULE MANIFEST
// ============================================

export const schedulingManifest: ModuleManifest = {
  id: 'scheduling',
  name: 'Scheduling Management',
  version: '1.0.0',

  // Requires team module to function
  depends: ['team'],

  // Requires shift management feature
  activatedBy: 'staff_shift_management',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
  // 🔒 PERMISSIONS: Supervisors can manage schedules
  minimumRole: 'SUPERVISOR' as const,

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

      // POS Integration (SERVICE flow)
      'sales.pos.product_flow',       // SERVICE product flow (DateTimePickerLite)
      'sales.metrics',                // SERVICE metrics for POS dashboard

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
      () => {
        // Mock time-off data - real version would query database
        const timeOffRequests = [
          { id: '1', employee: 'John Doe', date: '2025-10-15', status: 'pending' },
          { id: '2', employee: 'Jane Smith', date: '2025-10-16', status: 'approved' }
        ];

        return (
          <Stack direction="column" gap="2" key="scheduling-calendar-events">
            <Stack direction="row" align="center" gap="2">
              <CalendarIcon className="w-5 h-5 text-orange-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Time-Off Requests ({timeOffRequests.length})
              </Typography>
            </Stack>
            <Stack direction="column" gap="1">
              {timeOffRequests.map((request, idx) => (
                <Stack key={idx} direction="row" align="center" gap="2">
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

    // ✅ Hook 2: Dashboard Widget - Scheduling stats
    const SchedulingWidget = lazy(() => import('@/pages/admin/core/dashboard/components/widgets/SchedulingWidget'));

    registry.addAction(
      'dashboard.widgets',
      () => (
        <React.Suspense fallback={<div>Cargando scheduling...</div>}>
          <SchedulingWidget />
        </React.Suspense>
      ),
      'scheduling',
      70 // Medium priority widget
    );

    // ============================================
    // POS INTEGRATION HOOKS (SERVICE flow)
    // ============================================

    // ✅ Hook 3: SERVICE POS Flow - DateTimePickerLite
    registry.addAction(
      'sales.pos.product_flow',
      (data) => {
        // Only render for SERVICE products
        if (data?.productType !== 'SERVICE') return null;

        // Lazy load DateTimePickerLite component
        const DateTimePickerLite = lazy(() =>
          import('@/shared/ui/components/business/DateTimePickerLite')
            .then(module => ({ default: module.DateTimePickerLite }))
        );

        return (
          <React.Suspense fallback={<div>Cargando selector de fecha...</div>}>
            <DateTimePickerLite
              serviceId={data?.selectedProduct?.id || ''}
              onSelect={(datetime) => {
                // Notify parent component that flow is complete
                data?.onFlowComplete?.({
                  datetime,
                  serviceId: data?.selectedProduct?.id
                });
              }}
              compactMode={true}
              title="Seleccionar Fecha y Hora del Servicio"
            />
          </React.Suspense>
        );
      },
      'scheduling',
      90, // High priority - SERVICE is a primary use case
      {
        requiredPermission: { module: 'scheduling', action: 'create' }
      }
    );

    // ✅ Hook 4: SERVICE Metrics for POS Dashboard
    registry.addAction(
      'sales.metrics',
      () => {
        // TODO: Replace with real ServiceMetrics component
        return (
          <Stack direction="column" gap="2" key="scheduling-service-metrics">
            <Badge variant="solid" colorPalette="purple">
              <Stack direction="row" align="center" gap="2">
                <CalendarIcon className="w-4 h-4" />
                <Typography variant="body" size="sm">
                  Appointments Hoy: 12
                </Typography>
              </Stack>
            </Badge>
          </Stack>
        );
      },
      'scheduling',
      80, // Medium-high priority
      {
        requiredPermission: { module: 'scheduling', action: 'read' }
      }
    );

    logger.info('Scheduling', '✅ Scheduling module setup complete - POS hooks registered');

    // ============================================
    // HOOK 5: Appointment POS View (Context View)
    // ============================================

    /**
     * Hook: sales.pos.context_view
     * Inject AppointmentPOSView when 'appointment' context is selected
     */
    const AppointmentPOSView = lazy(() =>
      import('./components/AppointmentPOSView')
        .then(module => ({ default: module.AppointmentPOSView }))
    );

    registry.addAction(
      'sales.pos.context_view',
      (data) => {
        // Only render for SERVICE products (Opción B: ProductType-first)
        if (data?.productType !== 'SERVICE') return null;

        return (
          <React.Suspense fallback={<div>Cargando citas...</div>}>
            <AppointmentPOSView
              key="appointment-pos-view"
              cart={data?.cart || []}
              onAddToCart={data?.onAddToCart}
              onRemoveItem={data?.onRemoveItem}
              onClearCart={data?.onClearCart}
              totals={data?.totals}
              onConfirmBooking={data?.onConfirmBooking}
            />
          </React.Suspense>
        );
      },
      'scheduling',
      90, // High priority
      { requiredPermission: { module: 'scheduling', action: 'create' } }
    );

    logger.debug('Scheduling', '✅ Appointment POS context view registered');
  },

  // Teardown function - cleanup
  teardown: () => {
    logger.info('Scheduling', 'Module teardown complete');
  },

  // Public API exports
  exports: {
    /**
     * React Hooks for Scheduling management
     *
     * @example
     * ```tsx
     * import { ModuleRegistry } from '@/lib/modules';
     *
     * async function MyComponent() {
     *   const registry = ModuleRegistry.getInstance();
     *   const schedulingModule = registry.getExports('scheduling');
     *
     *   // Dynamic import of the hook
     *   const { useScheduling } = await schedulingModule.hooks.useScheduling();
     *
     *   const {
     *     shifts,
     *     schedules,
     *     timeOffRequests,
     *     loading,
     *     createShift,
     *     updateShift,
     *     deleteShift,
     *     publishSchedule,
     *     refreshData
     *   } = useScheduling();
     *
     *   // Use the hook...
     * }
     * ```
     */
    hooks: {
      /**
       * Hook for unified scheduling management
       * Returns a dynamic import of the useScheduling hook
       *
       * Pattern: Dynamic Import (following finance-corporate pattern)
       * Benefits: Lazy loading, tree-shaking, better code splitting
       *
       * Features:
       * - Shift management (create, update, delete, bulk operations)
       * - Schedule management (create, publish, copy, optimize)
       * - Time-off management (create, approve, deny requests)
       * - Real-time features (available slots, dashboard, labor costs, coverage analysis)
       * - Filters and navigation (date ranges, week/day navigation)
       *
       * State Management: Uses useState (not Zustand)
       * Hook Size: 499 lines (complex hook)
       */
      useScheduling: () => import('./hooks/index').then(module => ({ useScheduling: module.useScheduling })),
    },

    /**
     * Service functions for direct API calls (without hooks)
     * Used when you need to call scheduling operations outside React components
     */
    services: {
      /**
       * Get weekly schedule for all staff
       * @param week - ISO week string (YYYY-Www)
       * @returns Array of shifts for the week
       */
      getWeeklySchedule: async (week: string) => {
        // Mock implementation - real version would query database
        logger.debug('Scheduling', `Fetching weekly schedule for: ${week}`);
        return [
          { id: '1', employee_id: '1', date: '2025-10-13', start: '09:00', end: '17:00' },
          { id: '2', employee_id: '2', date: '2025-10-14', start: '10:00', end: '18:00' }
        ];
      },

      /**
       * Calculate total labor costs for shifts
       * @param shifts - Array of shift objects with start_time and end_time
       * @returns Total cost in dollars
       */
      calculateLaborCosts: (shifts: Array<{ start_time: string; end_time: string }>) => {
        const totalHours = shifts.reduce((sum, shift) => {
          const start = new Date(`2000-01-01T${shift.start_time}`);
          const end = new Date(`2000-01-01T${shift.end_time}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);

        const avgRate = 15; // $15/hour average
        return totalHours * avgRate;
      }
    }
  },

  // Module metadata
  metadata: {
    category: 'business',
    description: 'Shift management, time-off tracking, and labor cost optimization',
    author: 'G-Admin Team',
    tags: ['scheduling', 'shifts', 'time-off', 'labor-costs'],
    navigation: {
      route: '/admin/resources/scheduling',
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
