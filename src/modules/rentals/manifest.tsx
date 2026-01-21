/**
 * RENTALS MODULE MANIFEST
 *
 * Asset rental management for equipment, spaces, or items.
 * Handles reservations, availability, and rental billing.
 *
 * @version 1.0.0
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { KeyIcon } from '@heroicons/react/24/outline';

export const rentalsManifest: ModuleManifest = {
  id: 'rentals',
  name: 'Rentals',
  version: '1.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission

  depends: ['customers', 'scheduling'], // Rentals book time slots
  autoInstall: false, // ✅ FIXED: Controlled by asset_rental capability
  activatedBy: 'rental_item_management',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
  // 🔒 PERMISSIONS: Supervisors can manage rentals
  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'rentals.availability',        // Rental item availability
      'rentals.reservation_created', // Reservation events
      'rentals.asset_rented',        // Event: Asset rented out
      'dashboard.widgets',           // Rental metrics
    ],
    consume: [
      'scheduling.slot_booked',      // Reserve rental slots
      'billing.payment_received',    // Confirm rental on payment
      'assets.row.actions',          // Inject rental actions in asset grid
      'assets.form.fields',          // Inject rental fields in asset form
      'assets.detail.sections',      // Inject rental sections in asset detail
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🔑 Setting up Rentals module');

    try {
      // ============================================
      // ⚡ PERFORMANCE OPTIMIZATION: Load all imports in PARALLEL
      // ============================================
      // Previously: Sequential imports caused ~2.2s delay
      // Now: All imports load simultaneously
      
      const [
        { eventBus },
        { updateReservation },
        { RentAssetButton, RentalFieldsGroup, RentalHistorySection }
      ] = await Promise.all([
        import('@/lib/events'),
        import('@/pages/admin/operations/rentals/services'),
        import('./integrations')
      ]);

      // ✅ Dashboard Widget - Rentals status
      const RentalsWidget = lazy(() => import('./components/RentalsWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando rentals...</div>}>
            <RentalsWidget />
          </React.Suspense>
        ),
        'rentals',
        25 // Medium priority widget
      );

      // ✅ UI Injection - Add "Rent" button to Assets grid (row actions)
      registry.addAction(
        'assets.row.actions',
        (asset: any) => <RentAssetButton asset={asset} />,
        'rentals',
        10
      );

      // ✅ UI Injection - Add rental fields to Assets form
      registry.addAction(
        'assets.form.fields',
        (params: any) => <RentalFieldsGroup {...params} />,
        'rentals',
        20
      );

      // ✅ UI Injection - Add rental history section to Asset detail

      registry.addAction(
        'assets.detail.sections',
        (asset: any) => <RentalHistorySection asset={asset} />,
        'rentals',
        30
      );

      // ✅ EventBus Integration - Listen to payment events
      eventBus.subscribe(
        'billing.payment_received',
        async (event) => {
          const { metadata } = event.payload;

          // Check if this payment is for a rental reservation
          if (metadata?.type === 'rental' && metadata?.reservationId) {
            logger.info('Rentals', 'Payment received for reservation', {
              reservationId: metadata.reservationId,
            });

            try {
              // Update reservation payment status
              await updateReservation(metadata.reservationId, {
                payment_status: 'paid',
                status: 'confirmed',
              });

              // Emit reservation confirmed event
              eventBus.emit('rentals.reservation_created', {
                reservationId: metadata.reservationId,
                confirmed: true,
              });
            } catch (error) {
              logger.error('Rentals', 'Error updating reservation after payment', error);
            }
          }
        },
        { moduleId: 'rentals' }
      );

      // ✅ EventBus Integration - Listen to scheduling slot bookings
      eventBus.subscribe(
        'scheduling.slot_booked',
        async (event) => {
          const { resourceId, slotId, customerId, startTime, endTime, metadata } = event.payload;

          logger.info('Rentals', 'Slot booked - checking if rental item', {
            resourceId,
            slotId,
          });

          try {
            const { getRentalItem, createReservation, checkAvailability } = await import(
              '@/pages/admin/operations/rentals/services'
            );

            // 1. Check if resourceId matches a rental_items.id
            const rentalItem = await getRentalItem(resourceId);

            if (!rentalItem) {
              logger.debug('Rentals', 'Resource is not a rental item, skipping', { resourceId });
              return;
            }

            // 2. Validate required data
            if (!customerId || !startTime || !endTime) {
              logger.warn('Rentals', 'Missing required data for rental reservation', {
                customerId,
                startTime,
                endTime,
              });
              return;
            }

            // 3. Check availability
            const availability = await checkAvailability(
              resourceId,
              startTime,
              endTime
            );

            if (!availability.available) {
              logger.warn('Rentals', 'Rental item not available for booked slot', {
                resourceId,
                reason: availability.reason,
              });
              return;
            }

            // 4. Determine rental rate based on duration
            const start = new Date(startTime);
            const end = new Date(endTime);
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

            let rentalRate = 0;
            let rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily';

            if (durationHours < 24 && rentalItem.hourly_rate) {
              rentalRate = rentalItem.hourly_rate * durationHours;
              rateType = 'hourly';
            } else if (durationHours < 168 && rentalItem.daily_rate) {
              const days = Math.ceil(durationHours / 24);
              rentalRate = rentalItem.daily_rate * days;
              rateType = 'daily';
            } else if (durationHours < 720 && rentalItem.weekly_rate) {
              const weeks = Math.ceil(durationHours / 168);
              rentalRate = rentalItem.weekly_rate * weeks;
              rateType = 'weekly';
            } else if (rentalItem.monthly_rate) {
              const months = Math.ceil(durationHours / 720);
              rentalRate = rentalItem.monthly_rate * months;
              rateType = 'monthly';
            } else {
              rentalRate = rentalItem.daily_rate || 0;
              rateType = 'daily';
            }

            // 5. Create reservation
            const reservation = await createReservation({
              item_id: resourceId,
              customer_id: customerId,
              start_datetime: startTime,
              end_datetime: endTime,
              rental_rate: rentalRate,
              rate_type: rateType,
              deposit_paid: metadata?.depositPaid || 0,
              notes: `Created from scheduling slot ${slotId}`,
            });

            logger.info('Rentals', 'Reservation created from scheduling slot', {
              reservationId: reservation.id,
              slotId,
              itemId: resourceId,
            });

            // 6. Emit reservation created event
            eventBus.emit('rentals.reservation_created', {
              reservationId: reservation.id,
              itemId: resourceId,
              customerId,
              slotId,
              confirmed: false,
              rentalRate,
            });
          } catch (error) {
            logger.error('Rentals', 'Error creating reservation from scheduling slot', error);
          }
        },
        { moduleId: 'rentals' }
      );

      logger.info('App', '✅ Rentals module setup complete with EventBus integration');

      // ============================================
      // HOOK: Rental POS View (Context View)
      // ============================================

      /**
       * Hook: sales.pos.context_view
       * Inject RentalPOSView when 'rental' context is selected
       */
      const RentalPOSView = lazy(() =>
        import('./components/RentalPOSView')
          .then(module => ({ default: module.RentalPOSView }))
      );

      registry.addAction(
        'sales.pos.context_view',
        (data) => {
          // Only render for RENTAL products (Opción B: ProductType-first)
          if (data?.productType !== 'RENTAL') return null;

          return (
            <React.Suspense fallback={<div>Cargando alquileres...</div>}>
              <RentalPOSView
                key="rental-pos-view"
                cart={data?.cart || []}
                onAddToCart={data?.onAddToCart}
                onRemoveItem={data?.onRemoveItem}
                onClearCart={data?.onClearCart}
                totals={data?.totals}
                onConfirmRental={data?.onConfirmRental}
              />
            </React.Suspense>
          );
        },
        'rentals',
        90, // High priority
        { requiredPermission: { module: 'operations', action: 'create' } }
      );

      logger.debug('Rentals', '✅ Rental POS context view registered');
    } catch (error) {
      logger.error('App', '❌ Rentals module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Rentals module');
  },

  exports: {
    checkAvailability: async (
      itemId: string,
      startDatetime: string,
      endDatetime: string
    ) => {
      const { checkAvailability } = await import(
        '@/pages/admin/operations/rentals/services'
      );
      return checkAvailability(itemId, startDatetime, endDatetime);
    },
    createReservation: async (
      itemId: string,
      customerId: string,
      startDatetime: string,
      endDatetime: string,
      rentalRate: number
    ) => {
      const { createReservation } = await import(
        '@/pages/admin/operations/rentals/services'
      );
      return createReservation({
        item_id: itemId,
        customer_id: customerId,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        rental_rate: rentalRate,
      });
    },
  },

  metadata: {
    category: 'business',
    description: 'Asset rental and reservation management',
    author: 'G-Admin Team',
    tags: ['rentals', 'reservations', 'bookings', 'assets'],
    navigation: {
      route: '/admin/operations/rentals',
      icon: KeyIcon,
      color: 'cyan',
      domain: 'operations',
      isExpandable: false,
    },
  },
};

export default rentalsManifest;
