/**
 * BILLING MODULE MANIFEST
 *
 * Billing and subscription management.
 * Handles recurring billing, subscriptions, and payment plans.
 *
 * @version 1.0.0
 */

import React, { lazy } from 'react';
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

  // 🔒 PERMISSIONS: Supervisors can manage billing
  minimumRole: 'SUPERVISOR' as const,

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
      // ✅ Dashboard Widget - Billing status
      const BillingWidget = lazy(() => import('./components/BillingWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando billing...</div>}>
            <BillingWidget />
          </React.Suspense>
        ),
        'billing',
        35 // Medium priority widget
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
    generateInvoice: async (customerId: string, items: Array<{ productId: string; quantity: number; price: number }>) => {
      logger.debug('App', 'Generating invoice', { customerId, items });

      // Calculate total from items using Decimal.js for precision
      const { calculateInvoiceTotal } = await import('@/pages/admin/finance/billing/services');
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const { amount, taxAmount, totalAmount } = calculateInvoiceTotal(subtotal, 0.21); // 21% IVA

      // Generate invoice using billingApi
      const { generateInvoice: createInvoice } = await import('@/pages/admin/finance/billing/services');
      const { data: invoice, error } = await createInvoice(customerId, {
        amount,
        taxAmount,
        totalAmount,
        currency: 'ARS',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days
      });

      return { invoice, error };
    },
    processPayment: async (invoiceId: string, paymentData: { paymentMethodId: string; amount: number }) => {
      logger.debug('App', 'Processing payment', { invoiceId, paymentData });

      // Process payment using billingApi
      const { processPayment: makePayment } = await import('@/pages/admin/finance/billing/services');
      const { data: payment, error } = await makePayment(invoiceId, {
        ...paymentData,
        currency: 'ARS'
      });

      return { success: !error, payment, error };
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
