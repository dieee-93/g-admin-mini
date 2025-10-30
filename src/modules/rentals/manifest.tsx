/**
 * RENTALS MODULE MANIFEST
 *
 * Asset rental management for equipment, spaces, or items.
 * Handles reservations, availability, and rental billing.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { KeyIcon } from '@heroicons/react/24/outline';

export const rentalsManifest: ModuleManifest = {
  id: 'rentals',
  name: 'Rentals',
  version: '1.0.0',

  depends: ['customers', 'scheduling'], // Rentals book time slots
  autoInstall: true, // Auto-activate when dependencies active

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [
    'scheduling_appointment_booking',
    'scheduling_calendar_management',
  ] as FeatureId[],

  hooks: {
    provide: [
      'rentals.availability',        // Rental item availability
      'rentals.reservation_created', // Reservation events
      'dashboard.widgets',           // Rental metrics
    ],
    consume: [
      'scheduling.slot_booked',      // Reserve rental slots
      'billing.payment_received',    // Confirm rental on payment
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🔑 Setting up Rentals module');

    try {
      registry.addAction(
        'dashboard.widgets',
        () => ({
          id: 'rentals-summary',
          title: 'Rentals',
          type: 'rentals',
          priority: 5,
          data: {
            activeRentals: 0,
            todayReservations: 0,
            utilizationRate: 0,
          },
        }),
        'rentals',
        5
      );

      logger.info('App', '✅ Rentals module setup complete');
    } catch (error) {
      logger.error('App', '❌ Rentals module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Rentals module');
  },

  exports: {
    checkAvailability: async (assetId: string, startTime: Date, endTime: Date) => {
      logger.debug('App', 'Checking rental availability', { assetId });
      return { available: false };
    },
    createReservation: async (assetId: string, customerId: string, slot: any) => {
      logger.debug('App', 'Creating rental reservation', { assetId, customerId });
      return { success: true };
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
