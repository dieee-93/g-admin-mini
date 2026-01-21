/**
 * PICKUP SUB-MODULE MANIFEST
 *
 * Sub-module of Fulfillment for pickup order management.
 * Provides time slot scheduling, QR code generation, and pickup confirmation.
 *
 * INTEGRATION:
 * - Uses core fulfillmentService for queue operations
 * - Extends FulfillmentQueue component with pickup-specific actions
 * - Emits pickup-specific events via EventBus
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import type { ModuleManifest } from '@/lib/modules/types';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

export const fulfillmentPickupManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'fulfillment-pickup',
  name: 'Fulfillment - Pickup Orders',
  version: '1.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * Depends on parent fulfillment module
   * Also requires sales module for order integration
   */
  depends: ['fulfillment', 'sales'],
  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Required features from FeatureRegistry
   * Both pickup order sales AND pickup scheduling must be active
   */
  activatedBy: 'sales_pickup_orders',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
  /**
   * Optional features (enhance functionality if present)
   */

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES to others
     */
    provide: [
      'fulfillment.pickup.timeslot_selected',  // Emitted when customer selects time slot
      'fulfillment.pickup.ready',              // Emitted when order ready for pickup
      'fulfillment.pickup.confirmed',          // Emitted when pickup confirmed
      'fulfillment.pickup.toolbar.actions'     // Actions toolbar for pickup page
    ],

    /**
     * Hooks this module CONSUMES from others
     */
    consume: [
      'sales.order_placed',        // Listen to new pickup orders
      'production.order_ready',    // Listen to production completion
      'fulfillment.order_ready'    // Listen to general fulfillment ready
    ]
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - called when module is registered
   */
  setup: async () => {
    logger.info('App', '📦 Setting up Pickup module');

    try {
      // ============================================
      // CHECK FEATURE AVAILABILITY
      // ============================================

      const [
        { queryClient },
        { businessProfileKeys },
        { FeatureActivationEngine }
      ] = await Promise.all([
        import('@/App'),
        import('@/lib/business-profile/hooks/useBusinessProfile'),
        import('@/lib/features/FeatureEngine')
      ]);

      const profile = queryClient.getQueryData<any>(businessProfileKeys.detail());
      const { activeFeatures } = FeatureActivationEngine.activateFeatures(
        profile?.selectedCapabilities || [],
        profile?.selectedInfrastructure || []
      );
      const hasFeature = (featureId: string) => activeFeatures.includes(featureId as any);

      if (!hasFeature('sales_pickup_orders')) {
        logger.warn('App', 'Pickup orders feature not active');
        return;
      }

      // ============================================
      // EVENT SUBSCRIPTIONS
      // ============================================

      // ⚡ PERFORMANCE: Parallel imports (2 imports)
      const [
        { eventBus },
        { fulfillmentService }
      ] = await Promise.all([
        import('@/lib/events'),
        import('../services/fulfillmentService')
      ]);

      /**
       * Listen to sales.order_placed
       * Queue pickup orders automatically
       */
      eventBus.subscribe('sales.order_placed', async (event) => {
        const { orderId, fulfillmentType, metadata } = event.payload;

        // Only handle pickup orders
        if (fulfillmentType === 'pickup') {
          logger.debug('App', '📦 New pickup order received', { orderId });

          try {
            // Queue the order
            await fulfillmentService.queueOrder(orderId, 'pickup', metadata);

            // Emit pickup-specific event
            eventBus.emit('fulfillment.pickup.queued', {
              orderId,
              timeSlot: metadata?.pickup_time_slot,
              pickupCode: metadata?.pickup_code
            });
          } catch (error) {
            logger.error('App', 'Error queuing pickup order', error);
          }
        }
      }, { moduleId: 'fulfillment-pickup' });

      /**
       * Listen to production.order_ready
       * Notify customer when pickup order is ready
       */
      eventBus.subscribe('production.order_ready', async (event) => {
        const { orderId, fulfillmentType } = event.payload;

        if (fulfillmentType === 'pickup') {
          logger.debug('App', '📦 Pickup order ready from production', { orderId });

          // Get queue item
          const queueItems = await fulfillmentService.getQueue({
            type: 'pickup',
            status: 'in_progress'
          });

          const queueItem = queueItems.find(item => item.order_id === orderId);

          if (queueItem) {
            // Transition to ready
            await fulfillmentService.transitionStatus(queueItem.id, 'ready', {
              pickup_code: queueItem.metadata?.pickup_code
            });

            // Emit ready event
            eventBus.emit('fulfillment.pickup.ready', {
              queueId: queueItem.id,
              orderId,
              pickupCode: queueItem.metadata?.pickup_code,
              estimatedReadyTime: queueItem.estimated_ready_time
            });

            logger.info('App', '✅ Pickup order ready, customer notified');
          }
        }
      }, { moduleId: 'fulfillment-pickup' });

      // ============================================
      // REGISTER TOOLBAR ACTIONS (OPTIONAL)
      // ============================================

      /**
       * Hook: fulfillment.pickup.toolbar.actions
       * Example: Add "Generate QR Codes" button to pickup page
       */
      // This will be consumed by the pickup page itself

      // ============================================
      // HOOK: Pickup Hours Editor
      // ============================================

      /**
       * Hook: settings.hours.tabs + settings.hours.content
       * Inject pickup hours editor into HoursPage
       */
      const { getModuleRegistry } = await import('@/lib/modules');
      const registry = getModuleRegistry();

      if (registry) {
        const { PickupHoursTabTrigger, PickupHoursTabContent } = await import(
          './components/PickupHoursEditor'
        );

        registry.addAction(
          'settings.hours.tabs',
          () => <PickupHoursTabTrigger key="pickup-tab" />,
          'fulfillment-pickup',
          90 // After operating hours
        );

        registry.addAction(
          'settings.hours.content',
          () => <PickupHoursTabContent key="pickup-content" />,
          'fulfillment-pickup',
          90
        );

        logger.debug('App', '✅ Pickup hours hooks registered');
      }

      logger.info('App', '✅ Pickup module setup complete', {
        eventSubscriptions: 2,
        hooksRegistered: registry ? 2 : 0,
        features: {
          pickup_orders: hasFeature('sales_pickup_orders'),
          pickup_scheduling: hasFeature('operations_pickup_scheduling'),
          payment_processing: hasFeature('sales_payment_processing')
        }
      });

    } catch (error) {
      logger.error('App', '❌ Pickup module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  /**
   * Teardown function - cleanup when module is unregistered
   */
  teardown: () => {
    logger.info('App', '🧹 Tearing down Pickup module');

    // Unsubscribe from events
    import('@/lib/events').then(() => {
      // TODO: Fix - eventBus.unsubscribe('sales.order_placed', { moduleId: 'fulfillment-pickup' });
      // TODO: Fix - eventBus.unsubscribe('production.order_ready', { moduleId: 'fulfillment-pickup' });
    });
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================

  /**
   * Public API that other modules can import
   */
  exports: {
    components: {
      PickupTimeSlotPicker: () => import('./components/PickupTimeSlotPicker'),
      PickupQRGenerator: () => import('./components/PickupQRGenerator'),
      PickupConfirmation: () => import('./components/PickupConfirmation'),
      PickupQueue: () => import('./components/PickupQueue')
    },
    services: {
      pickupService: () => import('./services/pickupService')
    }
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'operations',
    description: 'Pickup order management with time slot scheduling and QR code confirmation',
    tags: ['fulfillment', 'pickup', 'timeslots', 'qr-codes'],
    navigation: {
      route: '/admin/operations/fulfillment/pickup',
      icon: ShoppingBagIcon,
      color: 'green',
      domain: 'operations'
    }
  }
};

/**
 * Default export
 */
export default fulfillmentPickupManifest;

/**
 * USAGE EXAMPLES:
 *
 * 1. Queue a pickup order:
 * ```typescript
 * import { fulfillmentService } from '@/modules/fulfillment/services/fulfillmentService';
 *
 * await fulfillmentService.queueOrder('order-123', 'pickup', {
 *   pickup_time_slot: '2025-01-24T15:00:00Z',
 *   pickup_code: 'ABC123',
 *   customer_phone: '+1234567890'
 * });
 * ```
 *
 * 2. Listen to pickup ready events:
 * ```typescript
 * eventBus.subscribe('fulfillment.pickup.ready', (event) => {
 *   const { orderId, pickupCode } = event.payload;
 *   // Send SMS to customer with pickup code
 * });
 * ```
 *
 * 3. Use pickup components:
 * ```typescript
 * import { PickupTimeSlotPicker } from '@/modules/fulfillment/pickup/components';
 *
 * <PickupTimeSlotPicker
 *   onSlotSelected={(slot) => console.log('Selected:', slot)}
 *   date={new Date()}
 * />
 * ```
 */
