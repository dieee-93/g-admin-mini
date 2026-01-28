/**
 * BILLING MODULE MANIFEST
 *
 * Consolidated billing and fiscal management module.
 * Combines functionality from finance-billing and finance-fiscal modules.
 * Manages invoicing, fiscal documents, and tax compliance.
 *
 * @version 1.0.0
 * @phase Phase 4 - Finance Consolidation
 */

import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

export const billingManifest: ModuleManifest = {
  id: 'billing',
  name: 'Facturación e Impuestos',
  version: '1.0.0',

  depends: ['customers'], // Billing requires customer data

  permissionModule: 'billing',
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'billing.invoice_created',
      'billing.invoice_paid',
      'fiscal.document_issued',
      'dashboard.widgets'
    ],
    consume: [
      'sales.order_completed',
      'customers.created'
    ]
  },

  setup: async (registry) => {
    logger.info('Billing module initialized (consolidated from finance-billing + finance-fiscal)');
  },

  exports: {}
};
