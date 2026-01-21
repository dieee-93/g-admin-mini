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
import { CubeIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { useCrudOperations } from '@/hooks/core/useCrudOperations';

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

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Single feature that activates this module
   */
  activatedBy: 'inventory_stock_tracking',

  // ✅ OPTIONAL MODULE: Only loaded when required feature is active

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: Minimum role required to access this module
   * - employee: Can view and update inventory (read, update)
   * - supervisor: + Can create materials (read, update, create)
   * - manager/admin: Full access (read, update, create, delete, export, configure)
   *
   * Granular permissions checked at component level via usePermissions()
   */
  minimumRole: 'OPERADOR' as const, // Employee level and above

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES (Injects into other modules)
     */
    provide: [
      'materials.stock_updated',          // Event: Stock level changed
      'materials.low_stock_alert',        // Event: Stock below threshold
      'materials.material_created',       // Event: New material added
      'materials.material_updated',       // Event: Material properties changed
      'materials.material_deleted',       // Event: Material removed
      'materials.row.actions',            // Hook: Actions for materials grid rows
      'dashboard.widgets',                // Hook: Inventory summary widget
      'materials.procurement.actions',    // Hook: Procurement-related actions
      'materials.toolbar.actions',        // Hook: Custom toolbar actions
      'scheduling.top_metrics',           // Hook: Low stock alert widget
      'scheduling.toolbar.actions',       // Hook: Stock reception button
      'sales.order.actions',              // Hook: Check stock button
      'production.toolbar.actions',       // Hook: Materials alert button
    ],

    /**
     * Events/Hooks this module CONSUMES (Listens to other modules)
     */
    consume: [
      'sales.order_placed',               // Reserve stock when order placed
      'sales.completed',                  // Deduct stock when sale completed
      'sales.order_cancelled',            // Release reserved stock
      'products.recipe_updated',          // Recalculate material requirements
      'production.order.created',         // Reserve materials for production
      'production.order.completed',       // Update stock after production
      'materials.procurement.po_received', // Auto-update stock on delivery
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

      /**
       * 🎯 ARCHITECTURAL PATTERN: Dashboard Widget Hook
       * - Returns JSX (React component), not metadata
       * - Uses InventoryWidget component for proper encapsulation
       * - 🔒 PERMISSIONS: Requires 'read' permission on 'materials' module
       */

      // Lazy load KPI widget for dashboard
      const { PendingOrdersWidget } = await import('./widgets');

      registry.addAction(
        'dashboard.widgets',
        () => <PendingOrdersWidget key="pending-orders-widget" />,
        'materials',
        97, // Fourth position (after Revenue, Sales, Staff)
        { requiredPermission: { module: 'materials', action: 'read' } }
      );

      logger.debug('App', 'Registered dashboard.widgets hook (PendingOrdersWidget)');

      // ============================================
      // SHIFT CONTROL INTEGRATION
      // ============================================

      const { StockAlertIndicator } = await import('./widgets/StockAlertIndicator');

      registry.addAction(
        'shift-control.indicators',
        ({ stockAlerts }) => (
          <StockAlertIndicator 
            lowStockAlerts={stockAlerts?.length || 0}
            key="stock-alert-indicator"
          />
        ),
        'materials',
        70
      );

      logger.debug('App', 'Registered shift-control.indicators hook (StockAlertIndicator)');

      // ============================================
      // HOOK 2: Materials Grid Row Actions
      // ============================================

      /**
       * Provides default actions for materials grid rows
       * Other modules can add their own actions to this hook
       *
       * 🔒 PERMISSIONS: Requires 'read' permission on 'materials' module
       * Note: Only provides metadata - actual rendering happens in MaterialsGrid
       */
      registry.addAction(
        'materials.row.actions',
        () => {
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
        10, // High priority - default actions
        { requiredPermission: { module: 'materials', action: 'read' } }
      );

      logger.debug('App', 'Registered materials.row.actions hook');

      // ============================================
      // HOOK 3: Procurement Actions
      // ============================================

      /**
       * Provides procurement-related actions
       * Used by procurement/supplier management features
       *
       * 🔒 PERMISSIONS: Requires 'create' permission on 'materials' module
       * Note: Auto-reorder is a procurement action, requires create privilege
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
        5,
        { requiredPermission: { module: 'materials', action: 'create' } }
      );

      logger.debug('App', 'Registered materials.procurement.actions hook');

      // ============================================
      // HOOK 4: Scheduling Toolbar - Stock Check
      // ============================================

      /**
       * Hook: scheduling.toolbar.actions
       * Adds "Check Stock" button to scheduling toolbar
       *
       * 🔒 PERMISSIONS: Requires 'create' permission on 'materials' module
       * Note: Stock reception is a create operation, modifies inventory
       *
       * 🎯 ARCHITECTURAL PATTERN: Cross-Module UI Injection
       * - This demonstrates how Materials module injects UI into Scheduling
       * - Hook consumed by: Scheduling module
       * - Rendered when: User has 'create' permission on 'materials'
       * - Priority: 80 (medium-high)
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
        80, // Medium-high priority
        { requiredPermission: { module: 'materials', action: 'create' } }
      );

      logger.debug('App', 'Registered scheduling.toolbar.actions for materials');

      // ============================================
      // HOOK 5: Scheduling Top Metrics - Inventory Alert
      // ============================================

      /**
       * Hook: scheduling.top_metrics
       * Shows critical low stock alerts affecting production
       *
       * 🔒 PERMISSIONS: Requires 'read' permission on 'materials' module
       *
       * 🎯 ARCHITECTURAL PATTERN: Cross-Module Widget Injection
       * - Demonstrates how Materials provides metrics to other modules
       * - Hook consumed by: Scheduling module
       * - Rendered when: User has 'read' permission on 'materials'
       * - Priority: 85 (high - critical alerts should be prominent)
       * - Returns: JSX (React component, not metadata)
       */
      registry.addAction(
        'scheduling.top_metrics',
        () => {
          // Mock low stock data - would query real inventory
          const lowStockCount = 3;
          const criticalItems = ['Harina', 'Azúcar', 'Manteca'];

          return (
            <Stack
              key="materials-low-stock-metric"
              direction="column"
              gap="1"
              p="3"
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
        85, // High priority - critical alert
        { requiredPermission: { module: 'materials', action: 'read' } }
      );

      logger.debug('App', 'Registered scheduling.top_metrics for materials');

      // ============================================
      // HOOK 6: Sales Order Actions - Check Stock Button
      // ============================================

      /**
       * 🎯 ARCHITECTURAL PATTERN: Cross-Module Action Injection
       * - Injects "Check Stock" button into Sales order actions
       * - Uses Materials API to validate stock availability
       * - Provides immediate feedback to sales staff
       * - 🔒 PERMISSIONS: Requires 'read' permission on 'materials'
       */
      registry.addAction(
        'sales.order.actions',
        (data) => {
          const { order } = data || {};

          if (!order) return null;

          return (
            <Button
              key="check-stock-materials"
              size="sm"
              variant="outline"
              colorPalette="purple"
              onClick={async () => {
                const orderId = order.order_id || order.id;

                logger.info('Materials', 'Checking stock for order', { orderId });

                toaster.create({
                  title: '🔍 Verificando Stock',
                  description: 'Consultando disponibilidad de materiales...',
                  type: 'info',
                  duration: 2000
                });

                try {
                  // ✅ Call Materials API using registry exports
                  const materialsAPI = registry.getExports<MaterialsAPI>('materials');

                  if (!materialsAPI || !materialsAPI.checkOrderStockAvailability) {
                    throw new Error('Materials API not available');
                  }

                  const stockCheck = await materialsAPI.checkOrderStockAvailability(orderId);

                  // Display result to user
                  toaster.create({
                    title: stockCheck.available ? '✅ Stock Disponible' : '⚠️ Stock Insuficiente',
                    description: stockCheck.message,
                    type: stockCheck.available ? 'success' : 'warning',
                    duration: 4000
                  });

                  logger.debug('Materials', 'Stock check result', {
                    orderId,
                    available: stockCheck.available,
                    totalItems: stockCheck.totalItems,
                    insufficientCount: stockCheck.insufficientItems.length
                  });
                } catch (error) {
                  logger.error('Materials', 'Error checking stock', error);

                  toaster.create({
                    title: '❌ Error',
                    description: 'No se pudo verificar el stock. Intenta nuevamente.',
                    type: 'error',
                    duration: 3000
                  });
                }
              }}
            >
              <Icon icon={CubeIcon} size="xs" />
              Check Stock
            </Button>
          );
        },
        'materials',
        12, // High priority - show prominently
        { requiredPermission: { module: 'materials', action: 'read' } }
      );

      logger.debug('App', 'Registered sales.order.actions hook (Check Stock)');

      // ============================================
      // HOOK 7: Production Toolbar - Materials Alert
      // ============================================

      /**
       * 🎯 ARCHITECTURAL PATTERN: Cross-Module Toolbar Injection
       * - Injects "Materials Alert" button into Production toolbar
       * - Shows materials needed for pending production orders
       * - 🔒 PERMISSIONS: Requires 'read' permission on 'materials'
       */
      registry.addAction(
        'production.toolbar.actions',
        () => {
          return (
            <Button
              key="materials-production-alert"
              size="sm"
              variant="outline"
              colorPalette="orange"
              onClick={() => {
                toaster.create({
                  title: '📊 Materiales Requeridos',
                  description: 'Análisis de materiales para producción pendiente',
                  type: 'info',
                  duration: 3000
                });
              }}
            >
              <Icon icon={CubeIcon} size="xs" />
              Materials Alert
            </Button>
          );
        },
        'materials',
        80,
        { requiredPermission: { module: 'materials', action: 'read' } }
      );

      logger.debug('App', 'Registered production.toolbar.actions hook (Materials Alert)');

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
        hooksProvided: 7, // dashboard.widgets, row.actions, procurement, scheduling.toolbar, scheduling.metrics, sales.order.actions, production.toolbar
        hooksConsumed: 2, // sales.order_completed, production.recipe_produced
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
     * Service layer exports
     * Provides access to all business logic engines and API services
     * 
     * @example
     * ```tsx
     * const materialsAPI = registry.getExports('materials');
     * const abcAnalysis = materialsAPI.services.ABCAnalysisEngine.analyzeInventory(items);
     * ```
     */
    services: {} as typeof import('./services'),

    /**
     * Zustand store for Materials UI state
     * 
     * @example
     * ```tsx
     * import { useMaterialsStore } from '@/modules/materials/store';
     * 
     * function MyComponent() {
     *   const { filters, setFilter } = useMaterialsStore();
     *   // ...
     * }
     * ```
     */
    store: {} as typeof import('./store'),

    /**
     * React Hook to fetch materials list
     * Exports a function that returns a hook to avoid premature initialization
     *
     * @example
     * ```tsx
     * const registry = ModuleRegistry.getInstance();
     * const materialsModule = registry.getExports('materials');
     * const useMaterialsList = materialsModule.hooks.useMaterialsList;
     *
     * function MyComponent() {
     *   const { items, loading } = useMaterialsList();
     *   // ...
     * }
     * ```
     */
    hooks: {
      /**
       * Hook factory for materials list
       * Returns the actual hook that components can use
       */
      useMaterialsList: () => {
        return useCrudOperations({
          tableName: 'items',
          selectQuery: 'id, name, unit, unit_cost, category, stock, is_active',
          cacheKey: 'materials-list',
          cacheTime: 5 * 60 * 1000, // 5 minutes
          enableRealtime: true,
        });
      }
    },

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

    /**
     * Check stock availability for an order
     * Used by Sales module to validate orders before confirmation
     */
    checkOrderStockAvailability: async (orderId: string) => {
      logger.debug('Materials', 'Checking stock availability for order', { orderId });

      try {
        // Import supabase client
        const { supabase } = await import('@/lib/supabase/client');

        // Query order items
        const { data: orderItems, error: orderError } = await supabase
          .from('sales_items')
          .select('material_id, quantity')
          .eq('sale_id', orderId);

        if (orderError) throw orderError;

        if (!orderItems || orderItems.length === 0) {
          return {
            available: false,
            message: 'No items found for order',
            insufficientItems: []
          };
        }

        const insufficientItems = [];

        // Check stock for each item
        for (const item of orderItems) {
          const { data: material } = await supabase
            .from('materials')
            .select('id, name, stock')
            .eq('id', item.material_id)
            .single();

          if (!material || (material.stock || 0) < item.quantity) {
            insufficientItems.push({
              materialId: item.material_id,
              materialName: material?.name || 'Unknown',
              required: item.quantity,
              available: material?.stock || 0,
              deficit: item.quantity - (material?.stock || 0)
            });
          }
        }

        return {
          available: insufficientItems.length === 0,
          message: insufficientItems.length === 0
            ? `Stock disponible para ${orderItems.length} items`
            : `${insufficientItems.length} items con stock insuficiente`,
          insufficientItems,
          totalItems: orderItems.length
        };
      } catch (error) {
        logger.error('Materials', 'Error checking order stock availability', error);
        return {
          available: false,
          message: 'Error al verificar disponibilidad',
          insufficientItems: [],
          error: String(error)
        };
      }
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
      route: '/admin/supply-chain/materials',
      icon: ArchiveBoxIcon,
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
  hooks: {
    useMaterialsList: () => () => {
      items: Array<{
        id: string;
        name: string;
        unit?: string;
        unit_cost?: number;
        category?: string;
        stock?: number;
        is_active?: boolean;
      }>;
      loading: boolean;
      error: string | null;
      fetchAll: () => Promise<any[]>;
      refresh: () => Promise<void>;
    };
  };
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
  checkOrderStockAvailability: (
    orderId: string
  ) => Promise<{
    available: boolean;
    message: string;
    insufficientItems: Array<{
      materialId: string;
      materialName: string;
      required: number;
      available: number;
      deficit: number;
    }>;
    totalItems?: number;
    error?: string;
  }>;
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
