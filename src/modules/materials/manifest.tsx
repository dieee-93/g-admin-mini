/**
 * MATERIALS MODULE MANIFEST
 *
 * Example manifest for inventory and materials management.
 * Demonstrates how to provide hooks for UI extensions and
 * consume hooks from other modules.
 *
 * PATTERN:
 * - Provides row actions for materials grid
 * - Provides dashboard widgets for inventory
 * - Consumes sales events to update stock
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { Button, Icon, Stack, Badge } from '@/shared/ui';
import { CubeIcon } from '@heroicons/react/24/outline';

/**
 * Materials Module Manifest
 *
 * Provides inventory management functionality:
 * - Stock tracking
 * - Low stock alerts
 * - Purchase orders
 * - Dashboard widgets
 */
export const materialsManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'materials',
  name: 'Materials & Inventory',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * No dependencies - can be activated independently
   */
  depends: [],

  autoInstall: false,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Required features from FeatureRegistry
   */
  requiredFeatures: ['inventory_stock_tracking'] as FeatureId[],

  /**
   * Optional features that enhance functionality
   */
  optionalFeatures: [
    'inventory_alert_system',
    'inventory_purchase_orders',
    'inventory_supplier_management',
  ] as FeatureId[],

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'materials.stock_updated', // Emitted when stock changes
      'materials.low_stock_alert', // Emitted when stock is low
      'materials.row.actions', // Provides actions for materials grid
      'dashboard.widgets', // Provides inventory widgets
      'materials.procurement.actions', // Procurement-related actions
    ],

    /**
     * Hooks this module CONSUMES
     */
    consume: [
      'sales.order_completed',          // Update stock when sales are made
      'production.recipe_produced',     // Update stock when recipes are produced
      'scheduling.top_metrics',         // Add inventory alerts to scheduling
      'scheduling.toolbar.actions',     // Add stock check button to scheduling
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register hook handlers
   */
  setup: async (registry) => {
    logger.info('App', '📦 Setting up Materials module');

    try {
      // ============================================
      // HOOK 1: Dashboard Widget
      // ============================================

      registry.addAction(
        'dashboard.widgets',
        () => {
          return {
            id: 'inventory-summary',
            title: 'Inventory Status',
            type: 'inventory',
            priority: 8,
            data: {
              totalItems: 0,
              lowStockItems: 0,
              outOfStockItems: 0,
              totalValue: 0,
            },
          };
        },
        'materials',
        8 // Slightly lower priority than sales
      );

      logger.debug('App', 'Registered dashboard.widgets hook for inventory');

      // ============================================
      // HOOK 2: Materials Grid Row Actions
      // ============================================

      /**
       * Provides default actions for materials grid rows
       * Other modules can add their own actions to this hook
       */
      registry.addAction(
        'materials.row.actions',
        (data) => {
          return [
            {
              id: 'edit-material',
              label: 'Edit',
              icon: 'Pencil',
              priority: 10,
              onClick: (materialId: string) => {
                logger.debug('App', `Editing material: ${materialId}`);
                // Would open edit modal
              },
            },
            {
              id: 'view-history',
              label: 'View History',
              icon: 'Clock',
              priority: 8,
              onClick: (materialId: string) => {
                logger.debug('App', `Viewing history for material: ${materialId}`);
                // Would open history modal
              },
            },
            {
              id: 'create-purchase-order',
              label: 'Create Purchase Order',
              icon: 'ShoppingBag',
              priority: 6,
              onClick: (materialId: string) => {
                logger.debug('App', `Creating PO for material: ${materialId}`);
                // Would open PO form
              },
            },
          ];
        },
        'materials',
        10 // High priority - default actions
      );

      logger.debug('App', 'Registered materials.row.actions hook');

      // ============================================
      // HOOK 3: Procurement Actions
      // ============================================

      /**
       * Provides procurement-related actions
       * Used by procurement/supplier management features
       */
      registry.addAction(
        'materials.procurement.actions',
        () => {
          return {
            id: 'auto-reorder',
            label: 'Enable Auto-Reorder',
            description: 'Automatically create POs when stock is low',
            icon: 'Refresh',
            onClick: (materialId: string) => {
              logger.debug('App', `Enabling auto-reorder for: ${materialId}`);
            },
          };
        },
        'materials',
        5
      );

      logger.debug('App', 'Registered materials.procurement.actions hook');

      // ============================================
      // HOOK 4: Scheduling Toolbar - Stock Check
      // ============================================

      /**
       * Hook: scheduling.toolbar.actions
       * Adds "Check Stock" button to scheduling toolbar
       */
      registry.addAction(
        'scheduling.toolbar.actions',
        (data) => {
          return (
            <Button
              key="materials-stock-check-btn"
              size="sm"
              variant="outline"
              colorPalette="purple"
              onClick={() => {
                logger.info('App', 'Stock Reception clicked from scheduling', {
                  referenceDate: data?.referenceDate
                });

                // Call the callback provided by scheduling page
                data?.onCreateStockReception?.();

                // Show notification
                toaster.create({
                  title: '📦 Recepción de Mercadería',
                  description: 'Modal de recepción pendiente de implementación',
                  type: 'info',
                  duration: 3000
                });
              }}
            >
              <Icon icon={CubeIcon} size="xs" />
              Stock
            </Button>
          );
        },
        'materials',
        80 // Medium-high priority
      );

      logger.debug('App', 'Registered scheduling.toolbar.actions for materials');

      // ============================================
      // HOOK 5: Scheduling Top Metrics - Inventory Alert
      // ============================================

      /**
       * Hook: scheduling.top_metrics
       * Shows critical low stock alerts affecting production
       */
      registry.addAction(
        'scheduling.top_metrics',
        (data) => {
          // Mock low stock data - would query real inventory
          const lowStockCount = 3;
          const criticalItems = ['Harina', 'Azúcar', 'Manteca'];

          return (
            <Stack
              key="materials-low-stock-metric"
              direction="column"
              gap={1}
              p={3}
              bg="orange.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="orange.300"
            >
              <Stack direction="row" align="center" justify="space-between">
                <span style={{ fontSize: '0.75rem', color: '#C2410C', fontWeight: '600' }}>
                  Stock Alert
                </span>
                <Badge size="xs" colorPalette="orange">
                  {lowStockCount}
                </Badge>
              </Stack>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#EA580C' }}>
                Low Stock
              </span>
              <span style={{ fontSize: '0.75rem', color: '#F97316' }}>
                {criticalItems.join(', ')}
              </span>
            </Stack>
          );
        },
        'materials',
        85 // High priority - critical alert
      );

      logger.debug('App', 'Registered scheduling.top_metrics for materials');

      // ============================================
      // CONSUME: Listen to sales events
      // ============================================

      /**
       * React to sales.order_completed to update inventory
       * NOTE: In production, this would be done via EventBus,
       * not directly through ModuleRegistry hooks.
       *
       * This is just for demonstration of the consume pattern.
       */
      // The sales module would emit this event, and we'd subscribe via EventBus:
      // eventBus.on('sales.order_completed', handleOrderCompleted);

      logger.info('App', '✅ Materials module setup complete', {
        hooksProvided: 5,
        hooksConsumed: 2,
      });
    } catch (error) {
      logger.error('App', '❌ Materials module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Materials module');
    // Clean up resources
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================

  /**
   * Public API for other modules
   */
  exports: {
    /**
     * Get current stock level for a material
     */
    getStockLevel: async (materialId: string) => {
      logger.debug('App', 'Getting stock level', { materialId });
      // Implementation would query database
      return { quantity: 100, unit: 'kg' };
    },

    /**
     * Update stock level
     */
    updateStock: async (materialId: string, quantity: number, reason: string) => {
      logger.debug('App', 'Updating stock', { materialId, quantity, reason });
      // Implementation would update database and emit events
      return { success: true };
    },

    /**
     * Check if material is low stock
     */
    isLowStock: async (materialId: string) => {
      logger.debug('App', 'Checking low stock status', { materialId });
      return { isLowStock: false, threshold: 10, current: 100 };
    },
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'business',
    description: 'Inventory and materials management module',
    author: 'G-Admin Team',
    tags: ['inventory', 'materials', 'stock', 'procurement'],
    navigation: {
      route: '/admin/materials',
      icon: CubeIcon,
      color: 'green',
      domain: 'supply-chain',
      isExpandable: false
    }
  },
};

/**
 * Default export
 */
export default materialsManifest;

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Materials module public API types
 */
export interface MaterialsAPI {
  getStockLevel: (
    materialId: string
  ) => Promise<{ quantity: number; unit: string }>;
  updateStock: (
    materialId: string,
    quantity: number,
    reason: string
  ) => Promise<{ success: boolean }>;
  isLowStock: (
    materialId: string
  ) => Promise<{ isLowStock: boolean; threshold: number; current: number }>;
}

/**
 * INTEGRATION EXAMPLES:
 *
 * 1. From another module, add custom row actions:
 * ```typescript
 * // In sales module setup
 * registry.addAction('materials.row.actions', (data) => {
 *   return {
 *     id: 'create-sale',
 *     label: 'Create Sale',
 *     icon: 'ShoppingCart',
 *     onClick: (materialId) => {
 *       // Open sales form
 *     }
 *   };
 * }, 'sales', 5);
 * ```
 *
 * 2. Access materials API from another module:
 * ```typescript
 * const materialsAPI = registry.getExports<MaterialsAPI>('materials');
 * const stock = await materialsAPI.getStockLevel('MAT-001');
 * ```
 *
 * 3. Listen to materials events:
 * ```typescript
 * // Via EventBus (recommended for cross-module communication)
 * eventBus.on('materials.stock_updated', (data) => {
 *   console.log('Stock updated:', data);
 * });
 * ```
 */
