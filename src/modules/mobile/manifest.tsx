import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

export const mobileManifest: ModuleManifest = {
  id: 'mobile',
  name: 'Mobile Operations',
  version: '1.0.0',

  requiredFeatures: ['mobile_location_tracking'], // GPS tracking is essential
  optionalFeatures: [
    'mobile_route_planning', // Daily route optimization
    'mobile_inventory_constraints' // Capacity limits for vehicles
  ],

  depends: ['staff', 'fulfillment', 'materials'],
  autoInstall: false,

  // 🔒 PERMISSIONS: Operadores can use mobile operations
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'mobile.route_updated', // Emit when route changes
      'mobile.location_updated', // Emit when GPS location updates
      'dashboard.widgets' // Provide mobile operations dashboard widget
    ],
    consume: [
      'staff.driver_available', // Listen to driver availability changes
      'fulfillment.delivery.queued', // Listen to new delivery orders
      'materials.stock_updated' // Listen to stock changes (for mobile inventory)
    ]
  },

  setup: async (registry) => {
    logger.info('App', '🚚 Setting up Mobile Operations module');

    try {
      // ============================================
      // REGISTER DASHBOARD WIDGET
      // ============================================

      const { useCapabilityStore } = await import('@/store/capabilityStore');
      const hasFeature = useCapabilityStore.getState().hasFeature;

      if (hasFeature('mobile_location_tracking')) {
        // Lazy load mobile operations widget
        const { MobileOperationsWidget } = await import('./components/MobileOperationsWidget');

        registry.addAction(
          'dashboard.widgets',
          () => <MobileOperationsWidget />,
          'mobile',
          15 // Priority after fulfillment (10)
        );

        logger.debug('App', '✅ Mobile operations widget registered');
      }

      // ============================================
      // LISTEN TO DELIVERY EVENTS (for route planning)
      // ============================================

      const { eventBus } = await import('@/lib/events');

      if (hasFeature('mobile_route_planning')) {
        // Auto-add delivery to route when queued
        eventBus.subscribe(
          'fulfillment.delivery.queued',
          async (event) => {
            logger.debug('App', '🔔 New delivery queued for mobile route', event.payload);

            // TODO: Auto-suggest adding to existing route or create new route
            // This is a future enhancement
          },
          { moduleId: 'mobile' }
        );

        logger.debug('App', '✅ Mobile route planning event listeners registered');
      }

      // ============================================
      // LISTEN TO DRIVER AVAILABILITY (for route assignment)
      // ============================================

      eventBus.subscribe(
        'staff.driver_available',
        (event) => {
          logger.debug('App', '🔔 Driver became available', event.payload);

          // TODO: Check if any routes need assignment
          // This is a future enhancement
        },
        { moduleId: 'mobile' }
      );

      // ============================================
      // LISTEN TO STOCK UPDATES (for mobile inventory sync)
      // ============================================

      if (hasFeature('mobile_inventory_constraints')) {
        eventBus.subscribe(
          'materials.stock_updated',
          async (event) => {
            logger.debug('App', '🔔 Stock updated in warehouse', event.payload);

            // TODO: Notify mobile vehicles if low stock needs restocking
            // This is a future enhancement
          },
          { moduleId: 'mobile' }
        );

        logger.debug('App', '✅ Mobile inventory event listeners registered');
      }

      // ============================================
      // GPS TRACKING AUTO-START (for active routes)
      // ============================================

      // On module load, check for active routes and start GPS tracking
      const { getTodaysActiveRoutes } = await import('./services/mobileService');
      const { data: activeRoutes } = await getTodaysActiveRoutes();

      if (activeRoutes.length > 0) {
        logger.info('App', `📍 Found ${activeRoutes.length} active route(s), GPS tracking ready`);

        // Emit event to notify UI
        eventBus.emit('mobile.routes_active', {
          count: activeRoutes.length,
          routes: activeRoutes.map((r) => r.id)
        });
      }

      logger.info('App', '✅ Mobile Operations module setup complete');
    } catch (error) {
      logger.error('App', '❌ Error setting up Mobile Operations module', error);
    }
  },

  exports: {
    components: {
      MobileOperationsWidget: () => import('./components/MobileOperationsWidget')
      // TODO: RouteMap and RoutePlanner components not yet implemented
    },
    services: {
      mobileService: () => import('./services/mobileService'),
      routePlanningService: () => import('./services/routePlanningService'),
      mobileInventoryService: () => import('./services/mobileInventoryService')
    },
    hooks: {
      useDriverLocation: () => import('@/modules/fulfillment/delivery/hooks/useDriverLocation')
    }
  }
};
