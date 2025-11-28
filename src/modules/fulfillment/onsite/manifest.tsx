import type { ModuleManifest } from '@/lib/modules/types';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { DINEIN_MANDATORY } from '@/modules/achievements/constants';

export const fulfillmentOnsiteManifest: ModuleManifest = {
  id: 'fulfillment-onsite',
  name: 'Fulfillment - Onsite Service',
  version: '2.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission

  requiredFeatures: ['operations_table_management'],
  optionalFeatures: ['operations_table_assignment', 'operations_floor_plan_config'],

  depends: ['sales'],
  autoInstall: false,

  hooks: {
    provide: [
      'fulfillment.onsite.table_status',
      'fulfillment.onsite.table_selected',
      'fulfillment.onsite.quick_view',
      'fulfillment.onsite.toolbar.actions' // ✅ NEW: Actions toolbar for Open Shift button
    ],
    consume: ['sales.order_placed']
  },

  setup: async (registry) => {
    logger.info('App', '🏢 Setting up Floor module');

    try {
      // ============================================
      // REGISTER DINE-IN REQUIREMENTS
      // ============================================

      /**
       * Registrar requirements obligatorios para Dine-In
       * Solo si la feature está activa
       */
      const { useCapabilityStore } = await import('@/store/capabilityStore');
      const hasFeature = useCapabilityStore.getState().hasFeature;

      if (hasFeature('sales_dine_in_orders')) {
        logger.debug('App', 'Registrando Dine-In requirements...');

        registry.doAction('achievements.register_requirement', {
          capability: 'onsite_service',
          requirements: DINEIN_MANDATORY
        });

        logger.debug('App', `✅ Registrados ${DINEIN_MANDATORY.length} requirements Dine-In`);
      }

      // ============================================
      // HOOK: Open Shift Button (Toolbar Action)
      // ============================================

      /**
       * Hook: floor.toolbar.actions
       * Inyecta el botón "Abrir Turno" con validación en Floor page
       */
      if (hasFeature('sales_dine_in_orders')) {
        const { OpenShiftButton } = await import('./components');

        registry.addAction(
          'fulfillment.onsite.toolbar.actions',
          () => <OpenShiftButton />,
          'fulfillment-onsite',
          10
        );

        logger.debug('App', '✅ Open Shift button hook registered');
      }

      logger.info('App', '✅ Fulfillment Onsite module setup complete', {
        requirementsRegistered: hasFeature('sales_dine_in_orders') ? DINEIN_MANDATORY.length : 0,
        hooksRegistered: hasFeature('sales_dine_in_orders') ? 1 : 0,
      });
    } catch (error) {
      logger.error('App', '❌ Fulfillment Onsite module setup failed', error);
      throw error;
    }
  },

  teardown: () => {
    // Cleanup if needed
  },

  exports: {
    FloorPlanQuickView: async () => {
      const { FloorPlanQuickView } = await import(
        '@/pages/admin/operations/fulfillment/onsite/components/FloorPlanQuickView'
      );
      return FloorPlanQuickView;
    }
  },

  metadata: {
    category: 'operations',
    description: 'Comprehensive floor management for restaurant operations including table tracking and reservations',
    tags: ['fulfillment-onsite', 'tables', 'reservations'],
    navigation: {
      route: '/admin/operations/fulfillment/onsite',
      icon: BuildingStorefrontIcon,
      color: 'cyan',
      domain: 'operations'
    }
  }
};