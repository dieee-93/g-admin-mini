import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';
import { lazy, Suspense } from 'react';
import { Spinner, Center } from '@/shared/ui';

export const mobileManifest: ModuleManifest = {
  id: 'mobile',
  name: 'Mobile Operations',
  version: '1.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission

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
      // OPTIMIZED: Parallel imports for critical dependencies
      // ============================================
      const [{ useCapabilityStore }, { eventBus }] = await Promise.all([
        import('@/store/capabilityStore'),
        import('@/lib/events')
      ]);

      const hasFeature = useCapabilityStore.getState().hasFeature;

      // ============================================
      // REGISTER DASHBOARD WIDGET (React.lazy pattern)
      // ============================================
      if (hasFeature('mobile_location_tracking')) {
        // ✅ FIX: Move lazy() to module level (React best practice)
        // React.lazy must be declared outside of render, not inside a function called during render
        // See: https://react.dev/reference/react/lazy#troubleshooting
        const MobileOperationsWidget = lazy(() =>
          import('./components/MobileOperationsWidget').then((m) => ({
            default: m.MobileOperationsWidget
          }))
        );

        // Register widget with registry - handler returns stable JSX
        registry.addAction(
          'dashboard.widgets',
          () => (
            <Suspense
              fallback={
                <Center minH="100px">
                  <Spinner size="sm" />
                </Center>
              }
            >
              <MobileOperationsWidget />
            </Suspense>
          ),
          'mobile',
          15 // Priority after fulfillment (10)
        );

        logger.debug('App', '✅ Mobile operations widget registered (lazy)');
      }

      // ============================================
      // DEFERRED: EventBus subscriptions (microtask queue)
      // Prevents blocking module setup - subscriptions run after registration
      // ============================================
      queueMicrotask(() => {
        // Subscription 1: Route planning
        if (hasFeature('mobile_route_planning')) {
          eventBus.subscribe(
            'fulfillment.delivery.queued',
            async (event) => {
              logger.debug('App', '🔔 New delivery queued for mobile route', event.payload);
              // TODO: Auto-suggest adding to existing route or create new route
            },
            { moduleId: 'mobile' }
          );
          logger.debug('App', '✅ Mobile route planning event listeners registered');
        }

        // Subscription 2: Driver availability
        eventBus.subscribe(
          'staff.driver_available',
          (event) => {
            logger.debug('App', '🔔 Driver became available', event.payload);
            // TODO: Check if any routes need assignment
          },
          { moduleId: 'mobile' }
        );

        // Subscription 3: Inventory sync
        if (hasFeature('mobile_inventory_constraints')) {
          eventBus.subscribe(
            'materials.stock_updated',
            async (event) => {
              logger.debug('App', '🔔 Stock updated in warehouse', event.payload);
              // TODO: Notify mobile vehicles if low stock needs restocking
            },
            { moduleId: 'mobile' }
          );
          logger.debug('App', '✅ Mobile inventory event listeners registered');
        }
      });

      // ============================================
      // DEFERRED: GPS tracking check (async, non-blocking)
      // Check active routes in background after module registration
      // ============================================
      queueMicrotask(async () => {
        try {
          const { getTodaysActiveRoutes } = await import('./services/mobileService');
          const { data: activeRoutes } = await getTodaysActiveRoutes();

          if (activeRoutes && activeRoutes.length > 0) {
            logger.info('App', `📍 Found ${activeRoutes.length} active route(s), GPS tracking ready`);
            eventBus.emit('mobile.routes_active', {
              count: activeRoutes.length,
              routes: activeRoutes.map((r) => r.id)
            });
          }
        } catch (error) {
          logger.error('App', '❌ Error checking active routes', error);
        }
      });

      logger.info('App', '✅ Mobile Operations module setup complete (optimized)');
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
