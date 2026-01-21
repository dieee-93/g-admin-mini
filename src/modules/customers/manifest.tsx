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

  permissionModule: 'sales', // ✅ Uses 'sales' permission (CRM)

  depends: [],

  // ✅ CORE MODULE: No activatedBy needed (always loaded)

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
      const eventBus = registry.getEventBus();

      // Register dashboard widget
      const { CustomersWidget } = await import('@/pages/admin/core/crm/customers/components');

      registry.addAction(
        'dashboard.widgets',
        () => <CustomersWidget />,
        'customers',
        40 // Priority - adjust as needed
      );

      /**
       * Listen to sales.order_completed
       * Update customer RFM scores when they complete purchases
       */
      eventBus.subscribe('sales.order_completed', async (event) => {
        logger.info('CustomersModule', 'Order completed notification received', event.payload);

        const { customerId, total, timestamp } = event.payload;

        if (!customerId) {
          logger.warn('CustomersModule', 'No customer ID in order completed event', event.payload);
          return;
        }

        try {
          // Import supabase client dynamically
          const { supabase } = await import('@/lib/supabase/client');

          // Add to RFM update queue for batch processing
          const { error: queueError } = await supabase
            .from('customer_rfm_update_queue')
            .insert({
              customer_id: customerId,
              trigger_event: 'sale_completed',
              event_data: {
                sale_total: total,
                sale_timestamp: timestamp,
              },
              status: 'pending',
            });

          if (queueError) {
            logger.error('CustomersModule', 'Failed to queue RFM update', queueError);
            return;
          }

          // Trigger immediate RFM recalculation for this customer
          const { error: rfmError } = await supabase.rpc('calculate_customer_rfm_profiles', {
            customer_ids: [customerId],
          });

          if (rfmError) {
            logger.error('CustomersModule', 'Failed to calculate RFM', rfmError);
          } else {
            logger.info('CustomersModule', 'Customer RFM scores updated successfully', { customerId });
          }
        } catch (error) {
          logger.error('CustomersModule', 'Error updating customer RFM', error);
        }
      });

      logger.debug('App', '✅ EventBus listeners registered in Customers module');

      logger.info('App', '✅ Customers module setup complete - Dashboard widget and EventBus configured');
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
