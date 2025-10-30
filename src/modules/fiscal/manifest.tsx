/**
 * FISCAL MODULE MANIFEST
 *
 * Fiscal and tax management including AFIP integration.
 * Handles invoicing, receipts, and tax compliance.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { ReceiptPercentIcon } from '@heroicons/react/24/outline';

export const fiscalManifest: ModuleManifest = {
  id: 'fiscal',
  name: 'Fiscal & Tax',
  version: '1.0.0',

  depends: ['sales'], // Fiscal processes sales transactions
  autoInstall: true, // Auto-install when sales is active

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],

  hooks: {
    provide: [
      'fiscal.invoice_generated',   // Emitted when invoice is created
      'dashboard.widgets',          // Fiscal status widgets
      'sales.payment_actions',      // Invoice generation button in POS
    ],
    consume: [
      'sales.order_completed',      // Generate invoices for sales
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🧾 Setting up Fiscal module');

    try {
      // Register fiscal dashboard widget
      registry.addAction(
        'dashboard.widgets',
        () => ({
          id: 'fiscal-summary',
          title: 'Fiscal Status',
          type: 'fiscal',
          priority: 5,
          data: {
            pendingInvoices: 0,
            todayRevenue: 0,
            taxLiability: 0,
          },
        }),
        'fiscal',
        5
      );

      logger.info('App', '✅ Fiscal module setup complete');
    } catch (error) {
      logger.error('App', '❌ Fiscal module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Fiscal module');
  },

  exports: {
    generateInvoice: async (orderId: string) => {
      logger.debug('App', 'Generating invoice', { orderId });
      return { invoice: null };
    },
    getAfipStatus: async () => {
      logger.debug('App', 'Getting AFIP status');
      return { connected: false, lastSync: null };
    },
  },

  metadata: {
    category: 'business',
    description: 'Fiscal management and AFIP integration (Argentina)',
    author: 'G-Admin Team',
    tags: ['fiscal', 'tax', 'afip', 'invoicing'],
    navigation: {
      route: '/admin/fiscal',
      icon: ReceiptPercentIcon,
      color: 'teal',
      domain: 'finance',
      isExpandable: false,
    },
  },
};

export default fiscalManifest;
