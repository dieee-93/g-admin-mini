/**
 * KITCHEN MODULE MANIFEST - Link Module Example
 *
 * Demonstrates the "Link Module" pattern (inspired by Odoo).
 * Link modules auto-install when ALL their dependencies are active,
 * bridging functionality between multiple modules.
 *
 * PATTERN:
 * - Depends on BOTH sales AND materials modules
 * - Auto-installs when both dependencies are available
 * - Integrates data from multiple sources
 * - Category: 'integration'
 *
 * USE CASE:
 * Kitchen Display System (KDS) needs both:
 * - Sales data (orders from POS)
 * - Materials data (ingredients, stock levels)
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { LinkModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { Button, Icon, Stack, Badge } from '@/shared/ui';
import { BeakerIcon, FireIcon } from '@heroicons/react/24/outline';

/**
 * Kitchen Link Module Manifest
 *
 * Bridges sales and materials modules to provide:
 * - Kitchen Display System (KDS)
 * - Order queue management
 * - Real-time inventory deduction
 * - Recipe ingredient tracking
 */
export const kitchenManifest: LinkModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'production-kitchen', // RENAMED: kitchen → production-kitchen (sub-module)
  name: 'Kitchen Display Integration',
  version: '1.0.0',

  // ============================================
  // LINK MODULE PATTERN
  // ============================================

  /**
   * CRITICAL: Link modules require at least 2 dependencies
   * TypeScript enforces this with tuple type [string, string, ...string[]]
   */
  depends: ['sales', 'materials'],

  /**
   * CRITICAL: Link modules MUST have autoInstall: true
   * They activate automatically when all dependencies are available
   */
  autoInstall: true,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Required features - needs BOTH sales and production
   */
  requiredFeatures: [
    'sales_order_management', // From sales module
    'production_display_system', // Kitchen-specific feature
  ] as FeatureId[],

  /**
   * Optional features that enhance functionality
   */
  optionalFeatures: [
    'production_bom_management',
    'production_order_queue',
    'inventory_stock_tracking',
  ] as FeatureId[],

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'kitchen.order_ready', // Emitted when order is prepared
      'kitchen.display.orders', // Provides order list for KDS
      'kitchen.ingredient_check', // Check ingredient availability
      'dashboard.widgets', // Kitchen performance widget
    ],

    /**
     * Hooks this module CONSUMES (from dependencies)
     */
    consume: [
      'sales.order_placed',             // Listen to new orders from sales
      'materials.stock_updated',        // Track ingredient stock
      'materials.row.actions',          // Add kitchen-specific actions to materials
      'calendar.events',                // Add production blocks to scheduling calendar
      'scheduling.toolbar.actions',     // Add kitchen capacity button
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register cross-module integration hooks
   *
   * This is where the "link" magic happens - we combine data
   * and functionality from BOTH sales and materials modules.
   */
  setup: async (registry) => {
    logger.info('App', '👨‍🍳 Setting up Kitchen Link Module');

    try {
      // ============================================
      // STEP 1: Verify dependencies are loaded
      // ============================================

      const hasSales = registry.has('sales');
      const hasMaterials = registry.has('materials');

      if (!hasSales || !hasMaterials) {
        throw new Error(
          `Kitchen module requires both sales and materials. Found: sales=${hasSales}, materials=${hasMaterials}`
        );
      }

      logger.debug('App', 'Dependencies verified', { hasSales, hasMaterials });

      // ============================================
      // STEP 2: Access dependency exports (VS Code pattern)
      // ============================================

      /**
       * Get public APIs from dependency modules
       * Type-safe access to other modules' functionality
       */
      // const salesAPI = registry.getExports('sales');
      // const materialsAPI = registry.getExports('materials');

      // ============================================
      // HOOK 1: Kitchen Dashboard Widget
      // ============================================

      // TODO: Convert to React component - currently returns metadata instead of JSX
      // registry.addAction(
      //   'dashboard.widgets',
      //   () => {
      //     return {
      //       id: 'kitchen-performance',
      //       title: 'Kitchen Performance',
      //       type: 'kitchen',
      //       priority: 7,
      //       data: {
      //         ordersInQueue: 0,
      //         averagePrepTime: 0,
      //         delayedOrders: 0,
      //       },
      //     };
      //   },
      //   'kitchen',
      //   7
      // );

      logger.debug('App', 'DISABLED dashboard.widgets hook (needs React component conversion)');

      // ============================================
      // HOOK 2: Add kitchen actions to materials grid
      // ============================================

      /**
       * Extend materials.row.actions with kitchen-specific actions
       * Shows how link modules can extend UI of parent modules
       */
      registry.addAction(
        'materials.row.actions',
        () => {
          return {
            id: 'check-recipe-availability',
            label: 'Check Recipe Availability',
            icon: 'ChefHat',
            priority: 7,
            onClick: (materialId: string) => {
              logger.debug('App', `Checking recipe availability for: ${materialId}`);
              // Would check which recipes use this ingredient
              // and if there's enough stock to prepare them
            },
          };
        },
        'kitchen',
        7 // Medium priority
      );

      logger.debug('App', 'Extended materials.row.actions with kitchen actions');

      // ============================================
      // HOOK 3: Kitchen Display Orders
      // ============================================

      /**
       * Provides order list for Kitchen Display System
       * Combines sales order data with materials availability
       */
      registry.addAction(
        'kitchen.display.orders',
        () => {
          // In production, this would:
          // 1. Get pending orders from sales module API
          // 2. Check ingredient availability from materials module API
          // 3. Calculate prep time based on recipe complexity
          // 4. Return enriched order data for KDS display

          return {
            orders: [
              // Example enriched order
              {
                id: 'ORD-001',
                salesData: {
                  orderNumber: '001',
                  items: ['Burger', 'Fries'],
                  timestamp: Date.now(),
                },
                materialsData: {
                  ingredientsAvailable: true,
                  lowStockItems: [],
                },
                kitchenData: {
                  estimatedPrepTime: 15, // minutes
                  station: 'grill',
                  priority: 'normal',
                },
              },
            ],
          };
        },
        'kitchen',
        10
      );

      logger.debug('App', 'Registered kitchen.display.orders hook');

      // ============================================
      // HOOK 4: Calendar Events - Production Blocks
      // ============================================

      /**
       * Hook: calendar.events
       * Adds production schedule blocks to scheduling calendar
       */
      registry.addAction(
        'calendar.events',
        () => {
          // Mock production blocks - would query real production schedule
          const productionBlocks = [
            { time: '08:00-10:00', recipe: 'Pan dulce', batch: 50 },
            { time: '10:00-12:00', recipe: 'Empanadas', batch: 200 }
          ];

          return (
            <Stack
              key="kitchen-production-blocks"
              direction="column"
              gap="2"
              p="3"
              bg="purple.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="purple.200"
            >
              <Stack direction="row" align="center" gap="2">
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B21A8' }}>
                  🍳 Producción Programada
                </span>
              </Stack>
              <Stack direction="column" gap="1">
                {productionBlocks.map((block, idx) => (
                  <Stack key={idx} direction="row" align="center" gap="2">
                    <Badge size="sm" colorPalette="purple">
                      {block.time}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: '#7C3AED' }}>
                      {block.recipe} (×{block.batch})
                    </span>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          );
        },
        'kitchen',
        75 // Medium-high priority
      );

      logger.debug('App', 'Registered calendar.events for kitchen production');

      // ============================================
      // HOOK 5: Scheduling Toolbar - Kitchen Capacity
      // ============================================

      /**
       * Hook: scheduling.toolbar.actions
       * Adds "Kitchen Capacity" button to scheduling toolbar
       */
      registry.addAction(
        'scheduling.toolbar.actions',
        (data) => {
          return (
            <Button
              key="kitchen-capacity-btn"
              size="sm"
              variant="outline"
              colorPalette="purple"
              onClick={() => {
                logger.info('App', 'Production Block clicked from scheduling', {
                  referenceDate: data?.referenceDate
                });

                // Call the callback provided by scheduling page
                data?.onCreateProductionBlock?.();

                // Show notification
                toaster.create({
                  title: '🍳 Bloque de Producción',
                  description: 'Modal de producción pendiente de implementación',
                  type: 'info',
                  duration: 3000
                });
              }}
            >
              <Icon icon={BeakerIcon} size="xs" />
              Kitchen
            </Button>
          );
        },
        'kitchen',
        75 // Medium-high priority
      );

      logger.debug('App', 'Registered scheduling.toolbar.actions for kitchen');

      // ============================================
      // STEP 3: Set up cross-module event listeners
      // ============================================

      /**
       * Listen to sales.order_placed to update kitchen queue
       * NOTE: In production, use EventBus for cross-module events
       */
      // Example (would be done via EventBus):
      // eventBus.on('sales.order_placed', async (orderData) => {
      //   // 1. Check ingredient availability via materialsAPI
      //   // 2. Add to kitchen queue if ingredients available
      //   // 3. Emit kitchen.order_ready when prepared
      // });

      logger.info('App', '✅ Kitchen Link Module setup complete', {
        linkedModules: ['sales', 'materials'],
        hooksProvided: 4,
        hooksConsumed: 3,
      });
    } catch (error) {
      logger.error('App', '❌ Kitchen Link Module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Kitchen Link Module');
    // Clean up event listeners, subscriptions, etc.
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================

  /**
   * Public API for other modules
   */
  exports: {
    /**
     * Check if an order can be prepared (has all ingredients)
     */
    canPrepareOrder: async (orderId: string) => {
      logger.debug('App', 'Checking if order can be prepared', { orderId });
      // Would check materials API for ingredient availability
      return { canPrepare: true, missingIngredients: [] };
    },

    /**
     * Get current kitchen queue
     */
    getKitchenQueue: async () => {
      logger.debug('App', 'Getting kitchen queue');
      return { orders: [], count: 0 };
    },

    /**
     * Mark order as ready
     */
    markOrderReady: async (orderId: string) => {
      logger.debug('App', 'Marking order as ready', { orderId });
      // Would update order status and emit event
      return { success: true };
    },
  },

  // ============================================
  // METADATA (Link Module specific)
  // ============================================

  metadata: {
    category: 'integration',
    description: 'Integrates sales and inventory for kitchen operations',
    author: 'G-Admin Team',
    tags: ['kitchen', 'integration', 'link-module', 'kds'],
    links: ['sales', 'materials'],
    navigation: {
      route: '/admin/operations/kitchen',
      icon: FireIcon,
      color: 'orange',
      domain: 'operations'
    }
  },
};

/**
 * Default export
 */
export default kitchenManifest;

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Kitchen Order - Represents an order in the kitchen queue
 */
export interface KitchenOrder {
  id: string;
  status: 'pending' | 'preparing' | 'ready';
  priority: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  createdAt: string;
}

/**
 * Kitchen module public API types
 */
export interface KitchenAPI {
  canPrepareOrder: (
    orderId: string
  ) => Promise<{ canPrepare: boolean; missingIngredients: string[] }>;
  getKitchenQueue: () => Promise<{ orders: KitchenOrder[]; count: number }>;
  markOrderReady: (orderId: string) => Promise<{ success: boolean }>;
}

/**
 * LINK MODULE PATTERN - KEY CONCEPTS:
 *
 * 1. AUTO-INSTALLATION:
 *    - autoInstall: true
 *    - Activates when ALL dependencies are available
 *    - No manual activation needed
 *
 * 2. DEPENDENCY COUPLING:
 *    - Depends on multiple modules
 *    - Integrates their functionality
 *    - Enriches data from multiple sources
 *
 * 3. CATEGORY: INTEGRATION:
 *    - metadata.category: 'integration'
 *    - metadata.links: ['sales', 'materials']
 *    - Clearly identifies as bridge module
 *
 * 4. USE CASES:
 *    - Kitchen (sales + materials)
 *    - Analytics (sales + customers + materials)
 *    - Delivery (sales + operations + mobile)
 *    - Multi-location (sales + inventory + operations)
 *
 * USAGE EXAMPLE:
 *
 * ```typescript
 * // User activates sales and materials features in setup
 * // Kitchen module auto-installs (autoInstall: true)
 * // No manual intervention needed!
 *
 * // Access kitchen API from another module
 * const kitchenAPI = registry.getExports<KitchenAPI>('kitchen');
 * const canPrepare = await kitchenAPI.canPrepareOrder('ORD-001');
 * ```
 *
 * ODOO INSPIRATION:
 * In Odoo, link modules like 'sale_stock' bridge 'sale' and 'stock' modules.
 * They auto-install when both dependencies are present, providing integration
 * features that only make sense when both modules are active.
 */