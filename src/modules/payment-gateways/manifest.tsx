/**
 * PAYMENT GATEWAYS MODULE MANIFEST
 *
 * Payment processing integrations (gateways, banks, processors).
 * Manages connections to external payment services.
 *
 * @version 2.0.0
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { LinkIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { SettingCard } from '@/shared/components';

export const paymentGatewaysManifest: ModuleManifest = {
  id: 'payment-gateways',
  name: 'Payment Gateways',
  version: '2.0.0',

  permissionModule: 'billing', // ✅ Uses 'billing' permission

  depends: ['billing'], // Integrations work with billing data

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
    logger.info('App', '🔗 Setting up Payment Gateways module');

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
        'payment-gateways',
        80,
        {
          requiredPermission: {
            module: 'billing',
            action: 'update',
          },
        }
      );
      logger.info('App', '✅ Payment Gateways: Payment Methods settings card registered');

      // Register integration settings panel
      registry.addAction(
        'settings.integrations',
        () => ({
          id: 'payment-gateways-panel',
          title: 'Payment Gateways',
          description: 'Connect to payment processors, gateways, and financial institutions',
          priority: 10,
        }),
        'payment-gateways',
        10
      );

      logger.info('App', '✅ Payment Gateways module setup complete');
    } catch (error) {
      logger.error('App', '❌ Payment Gateways module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Payment Gateways module');
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
    description: 'Payment processing gateways and financial integrations',
    author: 'G-Admin Team',
    tags: ['payments', 'gateways', 'processors', 'integrations', 'finance'],
    navigation: {
      route: '/admin/finance/payment-gateways',
      icon: CreditCardIcon,
      color: 'blue',
      domain: 'finance',
      isExpandable: false,
    },
  },
};

export default paymentGatewaysManifest;
