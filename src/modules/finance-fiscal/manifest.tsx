/**
 * FINANCE FISCAL MODULE MANIFEST
 *
 * Fiscal and tax management including AFIP integration.
 * Handles invoicing, receipts, and tax compliance.
 *
 * @version 2.0.0
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { ReceiptPercentIcon } from '@heroicons/react/24/outline';

export const financeFiscalManifest: ModuleManifest = {
  id: 'finance-fiscal',
  name: 'Fiscal & Tax',
  version: '2.0.0',

  depends: ['sales'], // Fiscal processes sales transactions
  autoInstall: true, // Auto-install when sales is active

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],

  // 🔒 PERMISSIONS: Supervisors and above can manage fiscal documents
  minimumRole: 'SUPERVISOR' as const,

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
      // ✅ Dashboard Widget - Fiscal status
      const FiscalWidget = lazy(() => import('./components/FiscalWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando fiscal...</div>}>
            <FiscalWidget />
          </React.Suspense>
        ),
        'finance-fiscal',
        50 // Medium-high priority widget
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
    category: 'compliance',
    description: 'Fiscal management and AFIP integration (Argentina)',
    author: 'G-Admin Team',
    tags: ['fiscal', 'tax', 'afip', 'invoicing'],
    navigation: {
      route: '/admin/finance/fiscal',
      icon: ReceiptPercentIcon,
      color: 'teal',
      domain: 'finance',
      isExpandable: false,
    },
  },
};

export default financeFiscalManifest;
