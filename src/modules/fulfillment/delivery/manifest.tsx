/**
 * DELIVERY SUB-MODULE MANIFEST
 *
 * Sub-module of Fulfillment for delivery order management.
 * Provides delivery zones, driver assignment, GPS tracking, and route optimization.
 *
 * INTEGRATION:
 * - Uses core fulfillmentService for queue operations
 * - Extends FulfillmentQueue component with delivery-specific actions
 * - Emits delivery-specific events via EventBus
 * - Integrates with GPS tracking and route optimization services
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import React from 'react';
import type { ModuleManifest } from '@/lib/modules/types';
import { TruckIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { Button, Icon, Stack } from '@/shared/ui';
import { toaster } from '@/shared/ui/toaster';

export const fulfillmentDeliveryManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'fulfillment-delivery',
  name: 'Fulfillment - Delivery Orders',
  version: '1.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * Depends on:
   * - fulfillment: parent module for queue operations
   * - sales: for order integration
   * - staff: for driver management (optional but recommended)
   */
  depends: ['fulfillment', 'sales'],
  autoInstall: false,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Required features from FeatureRegistry
   * Both delivery order sales AND delivery zones must be active
   */
  requiredFeatures: ['sales_delivery_orders', 'operations_delivery_zones'],

  /**
   * Optional features (enhance functionality if present)
   */
  optionalFeatures: [
    'operations_delivery_tracking',      // GPS tracking
    'mobile_location_tracking',          // Mobile driver app location
    'sales_payment_processing',          // Payment integration
    'operations_deferred_fulfillment',   // Scheduled deliveries
    'mobile_notifications'               // Customer notifications
  ],

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES to others
     */
    provide: [
      'fulfillment.delivery.dispatched',        // Emitted when delivery dispatched
      'fulfillment.delivery.driver_assigned',   // Emitted when driver assigned
      'fulfillment.delivery.in_transit',        // Emitted when driver starts delivery
      'fulfillment.delivery.completed',         // Emitted when delivery completed
      'fulfillment.delivery.toolbar.actions',   // Actions toolbar for delivery page
      'fulfillment.delivery.zone_selected'      // Emitted when zone is validated
    ],

    /**
     * Hooks this module CONSUMES from others
     */
    consume: [
      'sales.order_placed',          // Listen to new delivery orders
      'production.order_ready',      // Listen to production completion
      'fulfillment.order_ready',     // Listen to general fulfillment ready
      'staff.driver_location_update' // Listen to driver location updates (if available)
    ]
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - called when module is registered
   */
  setup: async (registry) => {
    logger.info('App', '🚚 Setting up Delivery module');

    try {
      // ============================================
      // IMPORT DEPENDENCIES
      // ============================================
      // Note: No feature checks needed - Module Registry validates requiredFeatures
      // before calling setup(). If we're here, all required features are active.

      const { eventBus } = await import('@/lib/events');
      const { deliveryService } = await import('./services/deliveryService');
      const { routeOptimizationService } = await import('./services/routeOptimizationService');
      const { setupDeliveryEventListeners } = await import('./services/deliveryEvents');

      // Note: gpsTrackingService is available at '@/lib/tracking' for mobile app integration
      // It's exported in this module's exports for other modules to use
      // Not imported here directly since tracking is initiated from mobile app, not backend

      // ============================================
      // EVENT SUBSCRIPTIONS
      // ============================================

      /**
       * Listen to sales.order_placed
       * Queue delivery orders automatically and validate zone
       */
      eventBus.subscribe('sales.order_placed', async (event) => {
        const { orderId, customerId, customerName, fulfillmentType, metadata } = event.payload;

        // Only handle delivery orders
        if (fulfillmentType === 'delivery') {
          logger.debug('App', '🚚 New delivery order received', { orderId });

          try {
            // Validate delivery address
            const validation = await deliveryService.validateDeliveryAddress(
              metadata.delivery_address,
              metadata.delivery_coordinates
            );

            if (!validation.valid) {
              logger.warn('App', 'Delivery address validation failed', {
                orderId,
                error: validation.error_message
              });

              // Emit validation failed event
              eventBus.emit('fulfillment.delivery.validation_failed', {
                orderId,
                reason: validation.error_message
              });

              return;
            }

            // Queue the delivery order
            await deliveryService.queueDeliveryOrder(
              orderId,
              customerId,
              customerName,
              {
                delivery_address: metadata.delivery_address,
                delivery_coordinates: metadata.delivery_coordinates,
                delivery_instructions: metadata.delivery_instructions,
                delivery_type: metadata.delivery_type || 'instant',
                zone_id: validation.zone_id,
                zone_name: validation.zone_name
              },
              {
                scheduledTime: metadata.scheduled_delivery_time,
                priority: metadata.priority || 'normal',
                notes: metadata.notes
              }
            );

            // Emit delivery queued event
            eventBus.emit('fulfillment.delivery.queued', {
              orderId,
              zone_id: validation.zone_id,
              zone_name: validation.zone_name,
              delivery_fee: validation.delivery_fee,
              estimated_time: validation.estimated_time_minutes
            });

            logger.info('App', '✅ Delivery order queued successfully', { orderId });
          } catch (error) {
            logger.error('App', 'Error queuing delivery order', error);
          }
        }
      }, { moduleId: 'fulfillment-delivery', priority: 100 });

      /**
       * Listen to production.order_ready
       * Auto-assign driver when order is ready
       */
      eventBus.subscribe('production.order_ready', async (event) => {
        const { orderId, fulfillmentType } = event.payload;

        if (fulfillmentType === 'delivery') {
          logger.debug('App', '🚚 Delivery order ready from production', { orderId });

          try {
            // Get delivery from queue
            const deliveries = await deliveryService.getDeliveryQueue({
              orderId
            });

            if (deliveries.length === 0) {
              logger.warn('App', 'Delivery not found in queue', { orderId });
              return;
            }

            const delivery = deliveries[0];

            // Get available drivers
            const availableDrivers = await deliveryService.getAvailableDrivers(delivery.zone_id);

            if (availableDrivers.length === 0) {
              logger.warn('App', 'No available drivers for delivery', { orderId });

              // Emit event for manual assignment
              eventBus.emit('fulfillment.delivery.needs_manual_assignment', {
                orderId,
                reason: 'No available drivers'
              });

              return;
            }

            // Get driver suggestions
            const suggestions = await routeOptimizationService.getSuggestedDrivers(
              delivery,
              availableDrivers
            );

            if (suggestions.length === 0) {
              logger.warn('App', 'No driver suggestions available', { orderId });
              return;
            }

            // Auto-assign to best driver
            const bestDriver = suggestions[0];
            await deliveryService.assignDriver({
              queue_id: delivery.id,
              driver_id: bestDriver.driver.driver_id,
              zone_id: delivery.zone_id
            });

            // Emit driver assigned event
            eventBus.emit('fulfillment.delivery.driver_assigned', {
              orderId,
              driverId: bestDriver.driver.driver_id,
              driverName: bestDriver.driver.driver_name,
              estimatedTime: bestDriver.estimated_time,
              distance: bestDriver.distance
            });

            logger.info('App', '✅ Driver auto-assigned to delivery', {
              orderId,
              driverId: bestDriver.driver.driver_id
            });
          } catch (error) {
            logger.error('App', 'Error auto-assigning driver', error);
          }
        }
      }, { moduleId: 'fulfillment-delivery', priority: 100 });

      /**
       * Listen to fulfillment.delivery.driver_assigned
       * Update delivery status and start GPS tracking if available
       */
      eventBus.subscribe('fulfillment.delivery.driver_assigned', async (event) => {
        const { orderId, driverId } = event.payload;

        logger.debug('App', '🚚 Driver assigned, updating status', { orderId, driverId });

        try {
          // Get deliveries for this order
          const deliveries = await deliveryService.getDeliveryQueue({ orderId });
          if (deliveries.length === 0) return;

          const delivery = deliveries[0];

          // Update status to 'assigned'
          await deliveryService.updateDeliveryStatus(delivery.id, 'assigned');

          // ✅ Start GPS tracking for assigned driver
          // Note: In production, this should be triggered from mobile app
          // when driver accepts the delivery. Here we log the intention.
          logger.info('App', '📍 Driver assigned - GPS tracking available', {
            driverId,
            orderId,
            instructions: 'Driver should start tracking from mobile app'
          });

          // Emit event that mobile app can listen to
          eventBus.emit('fulfillment.delivery.tracking_enabled', {
            orderId,
            driverId,
            message: 'GPS tracking ready - driver should enable in mobile app'
          });

          logger.info('App', '✅ Delivery status updated to assigned', { orderId });
        } catch (error) {
          logger.error('App', 'Error updating delivery status', error);
        }
      }, { moduleId: 'fulfillment-delivery' });

      /**
       * Listen to staff.driver_location_update
       * Update delivery location in real-time when driver sends GPS updates
       *
       * ✅ No feature check needed - this subscription is always active.
       * If mobile_location_tracking feature is disabled, the event simply won't fire.
       */
      eventBus.subscribe('staff.driver_location_update', async (event) => {
        const { driverId, location } = event.payload;

        logger.debug('App', '📍 Driver location update received', { driverId, location });

        try {
          // Get active deliveries for this driver
          const deliveries = await deliveryService.getDeliveryQueue({
            assignedTo: driverId,
            status: ['assigned', 'in_progress']
          });

          if (deliveries.length === 0) {
            logger.debug('App', 'No active deliveries for driver', { driverId });
            return;
          }

          // Update current location for all active deliveries
          for (const delivery of deliveries) {
            await deliveryService.updateDeliveryStatus(delivery.id, delivery.status, {
              current_location: location,
              last_location_update: new Date().toISOString()
            });

            logger.debug('App', 'Updated delivery location', {
              deliveryId: delivery.id,
              location
            });
          }
        } catch (error) {
          logger.error('App', 'Error updating delivery location', error);
        }
      }, { moduleId: 'fulfillment-delivery' });

      // ============================================
      // REGISTER HOOK ACTIONS
      // ============================================

      /**
       * Register toolbar actions for delivery page
       * Quick actions for delivery management
       */
      registry.addAction(
        'fulfillment.delivery.toolbar.actions',
        () => {
          return (
            <Stack direction="row" gap="sm" key="delivery-toolbar-actions">
              <Button
                size="sm"
                variant="outline"
                colorPalette="blue"
                onClick={() => {
                  logger.info('Delivery', 'Refreshing delivery queue');
                  toaster.create({
                    title: '🔄 Actualizando',
                    description: 'Refrescando cola de deliveries',
                    type: 'info'
                  });
                }}
              >
                🔄 Actualizar
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="green"
                onClick={() => {
                  logger.info('Delivery', 'Opening auto-assign dialog');
                  toaster.create({
                    title: '🤖 Asignación Automática',
                    description: 'Asignando repartidores disponibles a pedidos pendientes',
                    type: 'success'
                  });
                }}
              >
                🤖 Auto-Asignar
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="purple"
                onClick={() => {
                  logger.info('Delivery', 'Exporting delivery report');
                  toaster.create({
                    title: '📊 Exportar',
                    description: 'Generando reporte de deliveries del día',
                    type: 'info'
                  });
                }}
              >
                📊 Exportar
              </Button>
            </Stack>
          );
        },
        'fulfillment-delivery',
        100
      );

      /**
       * Register sales order actions - "Assign Driver" button
       * Shows only for delivery orders without driver assigned
       */
      registry.addAction(
        'sales.order.actions',
        (data) => {
          const { order } = data || {};

          // Only show for delivery orders
          if (!order || order.fulfillment_method !== 'delivery') {
            return null;
          }

          // Only show if driver not yet assigned
          if (order.driver_id) {
            return null;
          }

          return (
            <Button
              key="assign-driver"
              size="sm"
              variant="outline"
              colorPalette="blue"
              onClick={() => {
                const orderId = order.order_id || order.id;
                logger.info('Delivery', 'Opening driver assignment modal', { orderId });

                // Emit custom event for driver assignment modal
                // Pages can listen to 'delivery:assign-driver' event
                window.dispatchEvent(new CustomEvent('delivery:assign-driver', {
                  detail: { order }
                }));

                toaster.create({
                  title: '🚚 Asignar Repartidor',
                  description: `Abriendo selector de repartidor para orden #${orderId.substring(0, 8)}`,
                  type: 'info',
                  duration: 2000
                });
              }}
            >
              <Icon icon={TruckIcon} size="xs" />
              Asignar Repartidor
            </Button>
          );
        },
        'fulfillment-delivery',
        12 // Medium-high priority
      );

      // ============================================
      // SETUP ADDITIONAL EVENT LISTENERS
      // ============================================

      /**
       * Setup legacy EventBus v1 listeners for backward compatibility
       * These listen to sales.order.created and sales.order.updated
       */
      setupDeliveryEventListeners();

      logger.info('App', '✅ Delivery module setup complete', {
        hooksProvided: 2,
        eventsConsumed: 4
      });

    } catch (error) {
      logger.error('App', 'Failed to setup Delivery module', error);
    }
  },

  // ============================================
  // EXPORTS (Optional - for other modules)
  // ============================================

  exports: {
    /**
     * Services exported for use by other modules
     */
    services: {
      deliveryService: () => import('./services/deliveryService').then(m => m.deliveryService),
      gpsTrackingService: () => import('@/lib/tracking').then(m => m.gpsTrackingService), // ✅ Transversal service
      routeOptimizationService: () => import('./services/routeOptimizationService').then(m => m.routeOptimizationService)
    },

    /**
     * Components exported for use by other modules
     */
    components: {
      // To be implemented when components are migrated
    },

    /**
     * Types exported for use by other modules
     */
    types: () => import('./types')
  }
};
