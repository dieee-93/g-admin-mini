import type { ModuleManifest } from '@/lib/modules/types';
import { TruckIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

// Extend globalThis for module cleanup
declare global {
  interface GlobalThis {
    __fulfillmentCleanup?: Array<() => void>;
  }
}

export const fulfillmentManifest: ModuleManifest = {
  id: 'fulfillment',
  name: 'Fulfillment',
  version: '1.0.0',

  requiredFeatures: ['sales_order_management'], // At least one fulfillment feature
  optionalFeatures: [
    // Onsite features
    'operations_table_management',
    'operations_table_assignment',
    'operations_floor_plan_config',
    'operations_waitlist_management',
    // Pickup features
    'operations_pickup_scheduling',
    'sales_pickup_orders',
    // Delivery features
    'operations_delivery_zones',
    'operations_delivery_tracking',
    'sales_delivery_orders',
    // Shared fulfillment features
    'sales_payment_processing',
    'sales_fulfillment_queue'
  ],

  depends: ['sales', 'staff', 'materials'],
  autoInstall: false,

  // 🔒 PERMISSIONS: Operadores can manage fulfillment
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'fulfillment.order_ready',
      'fulfillment.toolbar.actions',
      'dashboard.widgets'
    ],
    consume: [
      'sales.order_placed',
      'production.order_ready',
      'materials.stock_updated'
    ]
  },

  setup: async (registry) => {
    logger.info('App', '🚚 Setting up Fulfillment module');

    try {
      // ============================================
      // REGISTER DASHBOARD WIDGET
      // ============================================

      const { useCapabilityStore } = await import('@/store/capabilityStore');
      const hasFeature = useCapabilityStore.getState().hasFeature;

      if (hasFeature('sales_order_management')) {
        // Lazy load widget only if needed
        const { FulfillmentQueueWidget } = await import('./components/FulfillmentQueueWidget');

        registry.addAction(
          'dashboard.widgets',
          () => <FulfillmentQueueWidget />,
          'fulfillment',
          10
        );

        logger.debug('App', '✅ Fulfillment queue widget registered');
      }

      // ============================================
      // LISTEN TO ORDER EVENTS
      // ============================================

      const { eventBus } = await import('@/lib/events');

      // Store unsubscribe functions for cleanup
      const unsubscribers: Array<() => void> = [];

      // Handle new orders
      const unsub1 = eventBus.subscribe('sales.order_placed', (event) => {
        logger.debug('App', '🔔 New order placed', event.payload);
        // Queue logic handled by FulfillmentService
      }, { moduleId: 'fulfillment' });
      unsubscribers.push(unsub1);

      // Handle production completed
      const unsub2 = eventBus.subscribe('production.order_ready', (event) => {
        logger.debug('App', '✅ Production order ready', event.payload);
        // Notify fulfillment team
      }, { moduleId: 'fulfillment' });
      unsubscribers.push(unsub2);

      // Store cleanup functions globally for teardown
      globalThis.__fulfillmentCleanup = unsubscribers;

      logger.info('App', '✅ Fulfillment module setup complete', {
        widgetRegistered: hasFeature('sales_order_management'),
        eventSubscriptions: 2,
      });
    } catch (error) {
      logger.error('App', '❌ Fulfillment module setup failed', error);
      throw error;
    }
  },

  teardown: () => {
    // Cleanup event subscriptions
    const cleanupFns = globalThis.__fulfillmentCleanup || [];
    cleanupFns.forEach((fn) => fn());
    delete globalThis.__fulfillmentCleanup;
  },

  exports: {
    components: {
      FulfillmentQueue: () => import('./components/FulfillmentQueue'),
    },
    services: {
      fulfillmentService: () => import('./services/fulfillmentService'),
    }
  },

  metadata: {
    category: 'operations',
    description: 'Unified order fulfillment (onsite, pickup, delivery)',
    tags: ['fulfillment', 'orders', 'delivery', 'pickup', 'onsite'],
    navigation: {
      route: '/admin/operations/fulfillment',
      icon: TruckIcon,
      color: 'blue',
      domain: 'operations'
    }
  }
};
