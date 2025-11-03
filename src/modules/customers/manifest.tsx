/**
 * CUSTOMERS MODULE MANIFEST (CRM)
 *
 * Customer Relationship Management functionality.
 * Tracks customer data, preferences, loyalty, and service history.
 *
 * @version 1.0.0
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { UsersIcon } from '@heroicons/react/24/outline';

interface CustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  note?: string;
}

export const customersManifest: ModuleManifest = {
  id: 'customers',
  name: 'Customers (CRM)',
  version: '1.0.0',

  depends: [],
  autoInstall: false,

  requiredFeatures: [] as FeatureId[], // No required - user activates manually
  optionalFeatures: [
    'customers',
    'customer_service_history',
    'customer_preference_tracking',
    'customer_loyalty_program',
    'customer_online_accounts',
  ] as FeatureId[],

  // 🔒 PERMISSIONS: Employees can create/view customers
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'customers.profile_sections', // Customer profile extensions
      'customers.quick_actions',    // Quick actions in customer view
      'dashboard.widgets',          // CRM widgets for dashboard
    ],
    consume: [
      'sales.order_completed',      // Track customer purchase history
    ],
  },

  setup: async (registry) => {
    logger.info('App', '👥 Setting up Customers module');

    try {
      // Register dashboard widget
      const { CustomersWidget } = await import('@/pages/admin/core/crm/customers/components');

      registry.addAction(
        'dashboard.widgets',
        () => <CustomersWidget />,
        'customers',
        40 // Priority - adjust as needed
      );

      logger.info('App', '✅ Customers module setup complete - Dashboard widget registered');
    } catch (error) {
      logger.error('App', '❌ Customers module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Customers module');
  },

  exports: {
    getCustomer: async (customerId: string) => {
      logger.debug('App', 'Getting customer', { customerId });
      return { customer: null };
    },
    updateCustomer: async (customerId: string, data: CustomerData) => {
      logger.debug('App', 'Updating customer', { customerId, data });
      return { success: true };
    },
  },

  metadata: {
    category: 'business',
    description: 'Customer relationship management and analytics',
    author: 'G-Admin Team',
    tags: ['crm', 'customers', 'loyalty', 'analytics'],
    navigation: {
      route: '/admin/customers',
      icon: UsersIcon,
      color: 'purple',
      domain: 'core',
      isExpandable: false,
    },
  },
};

export default customersManifest;
