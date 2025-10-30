/**
 * FINANCE INTEGRATIONS MODULE MANIFEST
 *
 * Financial system integrations (banks, payment gateways, accounting).
 * Manages connections to external financial services.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { LinkIcon } from '@heroicons/react/24/outline';

export const financeIntegrationsManifest: ModuleManifest = {
  id: 'finance-integrations',
  name: 'Finance Integrations',
  version: '1.0.0',

  depends: ['fiscal', 'billing'], // Integrations work with fiscal/billing data
  autoInstall: true, // Auto-activate when dependencies active

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [
    'sales_online_payment_gateway',
    'operations_shipping_integration',
  ] as FeatureId[],

  hooks: {
    provide: [
      'finance.integration_status',  // Integration health checks
      'settings.integrations',       // Integration config panels
    ],
    consume: [
      'billing.payment_received',    // Sync payments with accounting
      'fiscal.invoice_generated',    // Export to accounting systems
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🔗 Setting up Finance Integrations module');

    try {
      // Register integration settings panel
      registry.addAction(
        'settings.integrations',
        () => ({
          id: 'finance-integrations-panel',
          title: 'Financial Integrations',
          description: 'Connect to banks, payment gateways, and accounting systems',
          priority: 10,
        }),
        'finance-integrations',
        10
      );

      logger.info('App', '✅ Finance Integrations module setup complete');
    } catch (error) {
      logger.error('App', '❌ Finance Integrations module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Finance Integrations module');
  },

  exports: {
    testConnection: async (integrationId: string) => {
      logger.debug('App', 'Testing integration connection', { integrationId });
      return { connected: false };
    },
    syncData: async (integrationId: string) => {
      logger.debug('App', 'Syncing integration data', { integrationId });
      return { success: true, recordsSynced: 0 };
    },
  },

  metadata: {
    category: 'integrations',
    description: 'Financial system integrations (banks, payment gateways, accounting)',
    author: 'G-Admin Team',
    tags: ['integrations', 'finance', 'banking', 'accounting'],
    navigation: {
      route: '/admin/finance/integrations',
      icon: LinkIcon,
      color: 'blue',
      domain: 'finance',
      isExpandable: false,
    },
  },
};

export default financeIntegrationsManifest;
