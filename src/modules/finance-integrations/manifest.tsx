/**
 * FINANCE INTEGRATIONS MODULE MANIFEST
 *
 * Financial system integrations (banks, payment gateways, accounting).
 * Manages connections to external financial services.
 *
 * @version 2.0.0
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { LinkIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { SettingCard } from '@/shared/components';

export const financeIntegrationsManifest: ModuleManifest = {
  id: 'finance-integrations',
  name: 'Finance Integrations',
  version: '2.0.0',

  permissionModule: 'billing', // ✅ Uses 'billing' permission

  depends: ['finance-fiscal', 'finance-billing'], // Integrations work with fiscal/billing data

  // 🔒 PERMISSIONS: Only administrators can manage integrations
  minimumRole: 'ADMINISTRADOR' as const,

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
      // Register specialized settings card for Payment Methods
      registry.addAction(
        'settings.specialized.cards',
        () => (
          <SettingCard
            title="Métodos de Pago"
            description="Configure formas de pago y gateways de procesamiento"
            icon={CreditCardIcon}
            href="/admin/settings/payment-methods"
            status="configured"
          />
        ),
        'finance-integrations',
        80,
        {
          requiredPermission: {
            module: 'billing',
            action: 'update',
          },
        }
      );
      logger.info('App', '✅ Finance Integrations: Payment Methods settings card registered');

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
    category: 'payments',
    description: 'Multi-model payment gateways and accounting integrations',
    author: 'G-Admin Team',
    tags: ['integrations', 'finance', 'banking', 'accounting', 'payments'],
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
