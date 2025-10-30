/**
 * SALES MODULE MANIFEST
 *
 * Example manifest demonstrating module registration pattern.
 * This module provides sales management functionality including
 * order processing, payment handling, and POS features.
 *
 * HOOK PATTERN:
 * - `provide`: Hooks this module offers to others
 * - `consume`: Hooks this module listens to from others
 *
 * SETUP FUNCTION:
 * Registers hook handlers that will be called by other modules.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { Button, Icon, Stack, Badge } from '@/shared/ui';
import { ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

/**
 * Sales Module Manifest
 *
 * Provides core sales functionality:
 * - Order management
 * - Payment processing
 * - POS interface
 * - Dashboard widgets
 */
export const salesManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'sales',
  name: 'Sales Management',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * Dependencies on other modules
   * Empty array = no dependencies (independent module)
   */
  depends: [],

  /**
   * Auto-install when dependencies are available?
   * False for base modules (manual activation via features)
   */
  autoInstall: false,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Required features from FeatureRegistry
   * Module only activates if ALL required features are active
   */
  requiredFeatures: ['sales_order_management'] as FeatureId[],

  /**
   * Optional features (enhance functionality if present)
   */
  optionalFeatures: [
    'sales_payment_processing',
    'sales_pos_onsite',
    'sales_dine_in_orders',
  ] as FeatureId[],

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES to others
     * Other modules can register handlers for these hooks
     */
    provide: [
      'sales.order_placed', // Emitted when order is created
      'sales.order_completed', // Emitted when order is completed
      'sales.payment_received', // Emitted when payment is processed
      'materials.row.actions', // Provides actions for materials grid
      'dashboard.widgets', // Provides dashboard widgets
    ],

    /**
     * Hooks this module CONSUMES from others
     * This module listens to these hooks from other modules
     */
    consume: [
      'materials.stock_updated',        // Listen to inventory changes
      'kitchen.order_ready',            // Listen to kitchen status
      'scheduling.toolbar.actions',     // Add sales forecast button to scheduling
      'scheduling.top_metrics',         // Add sales forecast widget
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - called when module is registered
   *
   * Register hook handlers that other modules can call.
   * This is where you define what happens when hooks are executed.
   *
   * @param registry - ModuleRegistry instance
   */
  setup: async (registry) => {
    logger.info('App', '🛒 Setting up Sales module');

    try {
      // ============================================
      // EXAMPLE 1: Register dashboard widget
      // ============================================

      /**
       * Hook: dashboard.widgets
       * Provides a sales summary widget for the dashboard
       */
      registry.addAction(
        'dashboard.widgets',
        () => {
          // Return React component or data
          return {
            id: 'sales-summary',
            title: 'Sales Summary',
            type: 'sales',
            priority: 10,
            // Component would be lazy-loaded in production
            data: {
              todaySales: 0,
              pendingOrders: 0,
              completedOrders: 0,
            },
          };
        },
        'sales', // moduleId
        10 // priority (higher = executed first)
      );

      logger.debug('App', 'Registered dashboard.widgets hook');

      // ============================================
      // EXAMPLE 2: Register material row actions
      // ============================================

      /**
       * Hook: materials.row.actions
       * Adds "Create Sale" action to materials grid rows
       */
      registry.addAction(
        'materials.row.actions',
        (data) => {
          // data contains material info from materials module
          return {
            id: 'create-sale-from-material',
            label: 'Create Sale',
            icon: 'ShoppingCart',
            onClick: (materialId: string) => {
              logger.debug('App', `Creating sale from material: ${materialId}`);
              // Would open sales form with this material pre-selected
            },
          };
        },
        'sales',
        5 // Lower priority than default actions
      );

      logger.debug('App', 'Registered materials.row.actions hook');

      // ============================================
      // EXAMPLE 3: Scheduling Toolbar Action
      // ============================================

      /**
       * Hook: scheduling.toolbar.actions
       * Adds "View Sales Forecast" button to scheduling toolbar
       */
      registry.addAction(
        'scheduling.toolbar.actions',
        (data) => {
          return (
            <Button
              key="sales-forecast-btn"
              size="sm"
              variant="outline"
              colorPalette="green"
              onClick={() => {
                logger.info('App', 'Sales Forecast clicked from scheduling', {
                  referenceDate: data?.referenceDate,
                  view: data?.calendarView
                });

                // Call the callback provided by scheduling page
                data?.onShowSalesForecast?.();

                // Show notification with forecast info
                toaster.create({
                  title: '📊 Sales Forecast - Próximos 7 días',
                  description: 'Proyección: $12,450 | 145 órdenes | Promedio: $85/orden',
                  type: 'info',
                  duration: 4000
                });
              }}
            >
              <Icon icon={ChartBarIcon} size="xs" />
              Forecast
            </Button>
          );
        },
        'sales',
        85 // High priority - show near other actions
      );

      logger.debug('App', 'Registered scheduling.toolbar.actions hook');

      // ============================================
      // EXAMPLE 4: Scheduling Top Metrics Widget
      // ============================================

      /**
       * Hook: scheduling.top_metrics
       * Adds sales forecast metric to scheduling top bar
       */
      registry.addAction(
        'scheduling.top_metrics',
        (data) => {
          // Mock forecast data - would come from sales forecast API
          const forecastRevenue = '$12,450';
          const forecastOrders = 145;

          return (
            <Stack
              key="sales-forecast-metric"
              direction="column"
              gap={1}
              p={3}
              bg="green.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Stack direction="row" align="center" justify="space-between">
                <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: '600' }}>
                  Sales Forecast
                </span>
                <Badge size="xs" colorPalette="green">
                  Week
                </Badge>
              </Stack>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>
                {forecastRevenue}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#059669' }}>
                {forecastOrders} órdenes proyectadas
              </span>
            </Stack>
          );
        },
        'sales',
        90 // High priority metric
      );

      logger.debug('App', 'Registered scheduling.top_metrics hook');

      // ============================================
      // EXAMPLE 5: Listen to inventory changes
      // ============================================

      /**
       * Hook: materials.stock_updated (consume)
       * React to inventory changes to update available products
       */
      // Note: Consuming hooks would be registered by materials module
      // This is just for documentation - actual consumption happens via EventBus

      logger.info('App', '✅ Sales module setup complete', {
        hooksProvided: 5,
        hooksConsumed: 2,
      });
    } catch (error) {
      logger.error('App', '❌ Sales module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  /**
   * Teardown function - called when module is unregistered
   * Clean up resources, subscriptions, etc.
   */
  teardown: async () => {
    logger.info('App', '🧹 Tearing down Sales module');

    // Clean up any subscriptions, timers, etc.
    // The registry automatically removes hooks, but you may have
    // other cleanup needs (e.g., WebSocket connections)
  },

  // ============================================
  // PUBLIC API EXPORTS (VS Code pattern)
  // ============================================

  /**
   * Public API that other modules can import
   * Accessed via: registry.getExports<SalesAPI>('sales')
   */
  exports: {
    // Example API methods
    createOrder: async (orderData: any) => {
      logger.debug('App', 'Creating order via public API', orderData);
      // Implementation would be here
      return { id: 'order-123', status: 'created' };
    },

    getOrderStatus: async (orderId: string) => {
      logger.debug('App', 'Getting order status', { orderId });
      return { status: 'pending' };
    },
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'business',
    description: 'Core sales and order management module',
    author: 'G-Admin Team',
    tags: ['sales', 'orders', 'pos', 'payments'],
    navigation: {
      route: '/admin/sales',
      icon: CurrencyDollarIcon,
      color: 'teal',
      domain: 'operations',
      isExpandable: false
    }
  },
};

/**
 * Default export
 */
export default salesManifest;

// ============================================
// TYPE DEFINITIONS FOR EXPORTS API
// ============================================

/**
 * Type definition for Sales module public API
 * Other modules can use this for type-safe access
 */
export interface SalesAPI {
  createOrder: (orderData: any) => Promise<{ id: string; status: string }>;
  getOrderStatus: (orderId: string) => Promise<{ status: string }>;
}

/**
 * USAGE EXAMPLES:
 *
 * 1. Access from another module:
 * ```typescript
 * const salesAPI = registry.getExports<SalesAPI>('sales');
 * const order = await salesAPI.createOrder({ items: [...] });
 * ```
 *
 * 2. Execute hooks provided by this module:
 * ```typescript
 * const widgets = registry.doAction('dashboard.widgets');
 * // Returns array of widget data from all modules
 * ```
 *
 * 3. Register handler for this module's hooks:
 * ```typescript
 * registry.addAction('sales.order_placed', (orderData) => {
 *   // React to new order
 *   console.log('New order:', orderData);
 * }, 'my-module');
 * ```
 */
