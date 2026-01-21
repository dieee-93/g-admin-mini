/**
 * SHIFT CONTROL MODULE MANIFEST
 *
 * Operational shift management for tracking business operations
 * Coordinates with multiple modules through events and hookpoints
 *
 * @version 2.2.0 - Fixed TypeScript any types
 */

import { logger } from '@/lib/logging/Logger';
import eventBus from '@/lib/events/EventBus';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { ClockIcon } from '@heroicons/react/24/outline';
import { shiftEventHandlers } from './handlers';
import type {
  OpenShiftData,
  CloseShiftData,
} from './types';

const MODULE_ID = 'shift-control';

export const shiftControlManifest: ModuleManifest = {
  id: MODULE_ID,
  name: 'Shift Control',
  version: '2.1.0',

  permissionModule: 'operations', // Operations-level access

  depends: [],

  // 🔒 PERMISSIONS: Accessible by managers and above
  minimumRole: 'GERENTE' as const,

  hooks: {
    provide: [
      'shift.opened',
      'shift.closed',
      'shift.close_validation.requested',
      'shift.close_validation.failed',
      'shift-control.indicators',
      'shift-control.quick-actions',
      'shift-control.alerts',
      'shift-control.close-validation',
    ],
    consume: [
      // Cash events
      'cash.session.opened',
      'cash.session.closed',

      // Staff events
      'staff.employee.checked_in',
      'staff.employee.checked_out',

      // Table events (POS)
      'tables.table.opened',
      'tables.table.closed',

      // Delivery events
      'delivery.started',
      'delivery.completed',
      'delivery.cancelled',

      // Order events
      'order.created',
      'order.completed',
      'order.cancelled',

      // Inventory events
      'inventory.stock.low',
      'inventory.stock.restocked',
    ],
  },

  setup: async () => {
    logger.info(MODULE_ID, '⏱️  Setting up Shift Control module');

    try {
      // ============================================
      // EVENT SUBSCRIPTIONS
      // ============================================

      // Subscribe to all consumed events
      Object.entries(shiftEventHandlers).forEach(([pattern, handler]) => {
        eventBus.subscribe(pattern, handler, MODULE_ID);
        logger.debug(MODULE_ID, `Subscribed to event: ${pattern}`);
      });

      logger.info(MODULE_ID, `✅ Subscribed to ${Object.keys(shiftEventHandlers).length} events`);

      // ============================================
      // HOOKPOINT REGISTRATIONS
      // ============================================

      // NOTE: Widget registration is handled by dashboard module
      // See: src/modules/dashboard/manifest.tsx
      // The ShiftControlWidget component is available for use

      logger.info(MODULE_ID, '✅ Shift Control module setup complete');
    } catch (error) {
      logger.error(MODULE_ID, '❌ Shift Control module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info(MODULE_ID, '🧹 Tearing down Shift Control module');

    try {
      // Unsubscribe from all events
      Object.keys(shiftEventHandlers).forEach((pattern) => {
        eventBus.unsubscribe(pattern, MODULE_ID);
      });

      logger.info(MODULE_ID, '✅ Unsubscribed from all events');
    } catch (error) {
      logger.error(MODULE_ID, '❌ Shift Control teardown failed', error);
    }
  },

  exports: {
    /**
     * React Hooks for Shift Control management
     */
    hooks: {
      /**
       * Hook for shift control operations
       * Returns a dynamic import of the useShiftControl hook
       *
       * @example
       * ```tsx
       * const { useShiftControl } = await shiftControlModule.hooks.useShiftControl();
       * const {
       *   currentShift,
       *   isOperational,
       *   openShift,
       *   closeShift,
       *   loading
       * } = useShiftControl();
       * ```
       */
      useShiftControl: () => import('./hooks/useShiftControl'),
    },

    /**
     * Service functions for direct API calls (without hooks)
     */
    services: {
      /**
       * Get the currently active operational shift
       * @param businessId - Business ID
       */
      getActiveShift: async (businessId: string) => {
        const { getActiveShift } = await import('./services/shiftService');
        return getActiveShift(businessId);
      },

      /**
       * Validate if a shift can be closed
       * @param shiftId - ID of the shift to validate
       */
      validateCloseShift: async (shiftId: string) => {
        const { validateCloseShift } = await import('./services/shiftService');
        return validateCloseShift(shiftId);
      },

      /**
       * Open a new operational shift
       * @param data - Shift opening parameters
       * @param businessId - Business ID
       */
      openShift: async (data: OpenShiftData, businessId: string) => {
        const { openShift } = await import('./services/shiftService');
        return openShift(data, businessId);
      },

      /**
       * Close an active operational shift
       * @param shiftId - ID of the shift to close
       * @param data - Shift closing parameters
       */
      closeShift: async (shiftId: string, data: CloseShiftData) => {
        const { closeShift } = await import('./services/shiftService');
        return closeShift(shiftId, data);
      },

      /**
       * Force close a shift (admin override)
       * @param shiftId - ID of the shift to close
       * @param data - Shift closing parameters
       */
      forceCloseShift: async (shiftId: string, data: CloseShiftData) => {
        const { forceCloseShift } = await import('./services/shiftService');
        return forceCloseShift(shiftId, data);
      },

      /**
       * Update shift statistics
       * @param shiftId - ID of the shift to update
       * @param updates - Statistics to update
       */
      updateShiftStats: async (shiftId: string, updates: Partial<{ total_sales: number; labor_cost: number; active_staff_count: number }>) => {
        const { updateShiftStats } = await import('./services/shiftService');
        return updateShiftStats(shiftId, updates);
      },
    },

    /**
     * Store access for other modules
     */
    store: {
      /**
       * Get the shift store instance
       */
      useShiftStore: () => import('./store/shiftStore').then((m) => m.useShiftStore),
    },
  },

  metadata: {
    category: 'operations',
    description: 'Operational shift management with multi-module coordination',
    author: 'G-Admin Team',
    tags: ['shift', 'operations', 'management', 'coordination', 'events'],
    navigation: {
      route: '/admin/operations/shift-control',
      icon: ClockIcon,
      color: 'blue',
      domain: 'operations',
      isExpandable: false,
    },
  },
};

export default shiftControlManifest;
