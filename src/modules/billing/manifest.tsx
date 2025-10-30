/**
 * BILLING MODULE MANIFEST
 *
 * Billing and subscription management.
 * Handles recurring billing, subscriptions, and payment plans.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export const billingManifest: ModuleManifest = {
  id: 'billing',
  name: 'Billing & Subscriptions',
  version: '1.0.0',

  depends: ['customers'], // Billing tracks customer accounts
  autoInstall: true, // Auto-activate when customers active

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [
    'finance_corporate_accounts',
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms',
  ] as FeatureId[],

  hooks: {
    provide: [
      'billing.invoice_generated',  // Invoice events
      'billing.payment_received',   // Payment notifications
      'dashboard.widgets',          // Billing status widgets
    ],
    consume: [
      'sales.order_completed',      // Generate invoices
      'customers.account_created',  // Setup billing profile
    ],
  },

  setup: async (registry) => {
    logger.info('App', '💳 Setting up Billing module');

    try {
      registry.addAction(
        'dashboard.widgets',
        () => ({
          id: 'billing-summary',
          title: 'Billing Status',
          type: 'billing',
          priority: 4,
          data: {
            pendingInvoices: 0,
            overdueAmount: 0,
            monthlyRecurring: 0,
          },
        }),
        'billing',
        4
      );

      logger.info('App', '✅ Billing module setup complete');
    } catch (error) {
      logger.error('App', '❌ Billing module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Billing module');
  },

  exports: {
    generateInvoice: async (customerId: string, items: any[]) => {
      logger.debug('App', 'Generating invoice', { customerId, items });
      return { invoice: null };
    },
    processPayment: async (invoiceId: string, paymentData: any) => {
      logger.debug('App', 'Processing payment', { invoiceId });
      return { success: true };
    },
  },

  metadata: {
    category: 'business',
    description: 'Billing, subscriptions, and payment management',
    author: 'G-Admin Team',
    tags: ['billing', 'subscriptions', 'payments', 'invoices'],
    navigation: {
      route: '/admin/finance/billing',
      icon: CreditCardIcon,
      color: 'green',
      domain: 'finance',
      isExpandable: false,
    },
  },
};

export default billingManifest;
