/**
 * SUPPLIERS MODULE MANIFEST
 *
 * Supplier management module for inventory and procurement.
 * Provides hooks for cross-module integration and events.
 *
 * PATTERN:
 * - Provides supplier actions for materials grid
 * - Provides dashboard widgets for supplier metrics
 * - Consumes materials events to track usage
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { Button, Icon, Stack, Badge } from '@/shared/ui';
import { BuildingStorefrontIcon, StarIcon, TruckIcon } from '@heroicons/react/24/outline';
import { SuppliersWidget } from './components';

/**
 * Suppliers Module Manifest
 *
 * Provides supplier management functionality:
 * - CRUD operations
 * - Performance tracking
 * - Integration with Materials
 * - Dashboard widgets
 */
export const suppliersManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'suppliers',
  name: 'Supplier Management',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * No hard dependencies - can be activated independently
   * But works best with materials module
   */
  depends: [],

  autoInstall: false,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Required features from FeatureRegistry
   */
  requiredFeatures: ['inventory_supplier_management'] as FeatureId[],

  /**
   * Optional features that enhance functionality
   */
  optionalFeatures: [
    'inventory_purchase_orders',
    'inventory_demand_forecasting',
    'operations_vendor_performance'
  ] as FeatureId[],

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: Supervisors can manage suppliers
   */
  minimumRole: 'SUPERVISOR' as const,

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'suppliers.supplier_created',       // Emitted when supplier is created
      'suppliers.supplier_updated',       // Emitted when supplier is updated
      'suppliers.supplier_deleted',       // Emitted when supplier is deleted
      'suppliers.supplier_status_changed', // Emitted when status changes
      'dashboard.widgets',                // Provides supplier widgets
      'materials.supplier.actions'        // Provides actions for materials-supplier integration
    ],

    /**
     * Hooks this module CONSUMES
     */
    consume: [
      'materials.stock_updated',          // Track material usage per supplier
      'materials.low_stock_alert',        // Trigger reorder from suppliers
      'materials.purchase_order_created'  // Link PO to suppliers
    ]
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register hook handlers
   */
  setup: async (registry) => {
    logger.info('App', '🏢 Setting up Suppliers module');

    try {
      // ============================================
      // HOOK 1: Dashboard Widget
      // ============================================

      /**
       * Provides Suppliers summary widget for dashboard
       * Shows total suppliers, active count, and average rating
       *
       * 🔒 PERMISSIONS: Requires 'read' permission on 'suppliers' module
       */
      registry.addAction(
        'dashboard.widgets',
        () => {
          return (
            <SuppliersWidget
              key="suppliers-widget"
              onClick={() => {
                logger.info('App', 'Navigating to suppliers from dashboard widget');
                window.location.href = '/admin/supply-chain/suppliers';
              }}
            />
          );
        },
        'suppliers',
        7,
        { requiredPermission: { module: 'suppliers', action: 'read' } }
      );

      logger.debug('App', 'Registered dashboard.widgets hook for suppliers');

      // ============================================
      // HOOK 2: Materials Integration Actions
      // ============================================

      /**
       * Provides actions when viewing materials that have suppliers
       * Allows quick navigation to supplier details
       *
       * 🔒 PERMISSIONS: Requires 'read' permission on 'suppliers' module
       */
      registry.addAction(
        'materials.supplier.actions',
        (data) => {
          const { material } = data || {};

          if (!material?.supplier_id) {
            return null;
          }

          return (
            <Button
              key="view-supplier-btn"
              size="xs"
              variant="outline"
              colorPalette="purple"
              onClick={() => {
                logger.info('App', 'Viewing supplier from material', {
                  supplierId: material.supplier_id,
                  materialId: material.id
                });

                // Navigate to supplier
                window.location.href = `/admin/suppliers?highlight=${material.supplier_id}`;

                toaster.create({
                  title: '📦 Navegando a Proveedor',
                  description: `Abriendo detalles del proveedor`,
                  type: 'info',
                  duration: 2000
                });
              }}
            >
              <Icon icon={BuildingStorefrontIcon} size="xs" />
              Ver Proveedor
            </Button>
          );
        },
        'suppliers',
        85,
        { requiredPermission: { module: 'suppliers', action: 'read' } }
      );

      logger.debug('App', 'Registered materials.supplier.actions for suppliers');

      // ============================================
      // HOOK 3: Supplier Performance Badge
      // ============================================

      /**
       * Shows supplier rating badge in materials views
       *
       * 🔒 PERMISSIONS: Requires 'read' permission on 'suppliers' module
       */
      registry.addAction(
        'materials.supplier.badge',
        (data) => {
          const { supplier } = data || {};

          if (!supplier?.rating) {
            return null;
          }

          return (
            <Stack
              key="supplier-rating-badge"
              direction="row"
              align="center"
              gap="1"
            >
              <Icon icon={StarIcon} size="xs" color="yellow.500" />
              <Badge size="xs" colorPalette="yellow">
                {supplier.rating.toFixed(1)}
              </Badge>
            </Stack>
          );
        },
        'suppliers',
        90,
        { requiredPermission: { module: 'suppliers', action: 'read' } }
      );

      logger.debug('App', 'Registered materials.supplier.badge for suppliers');

      // ============================================
      // HOOK 4: Materials Row Actions - Create PO Button
      // ============================================

      /**
       * Adds "Create PO" button in materials grid row actions
       *
       * 🔒 PERMISSIONS: Requires 'create' permission on 'suppliers' module
       * Note: Creating a PO is a supplier-level action, requires higher privilege
       */
      registry.addAction(
        'materials.row.actions',
        (data) => {
          const { material } = data || {};

          if (!material) {
            return null;
          }

          return (
            <Button
              key="create-po-from-material"
              size="xs"
              variant="outline"
              colorPalette="blue"
              onClick={() => {
                logger.info('App', 'Creating PO from material', {
                  materialId: material.id,
                  materialName: material.name
                });

                // TODO: Open PO creation modal with material pre-filled
                toaster.create({
                  title: '📦 Crear Orden de Compra',
                  description: `Preparando PO para ${material.name}`,
                  type: 'info',
                  duration: 2000
                });
              }}
            >
              <Icon icon={TruckIcon} size="xs" />
              PO
            </Button>
          );
        },
        'suppliers',
        10,
        { requiredPermission: { module: 'suppliers', action: 'create' } }
      );

      logger.debug('App', 'Registered materials.row.actions for Create PO button');

      // ============================================
      // CONSUME: Listen to materials events
      // ============================================

      /**
       * NOTE: In production, event subscriptions would be done via EventBus:
       * eventBus.on('materials.low_stock_alert', handleLowStockAlert);
       *
       * This allows automatic supplier notifications or PO generation
       */

      logger.info('App', '✅ Suppliers module setup complete', {
        hooksProvided: 5,  // dashboard.widgets + 4 materials hooks
        hooksConsumed: 3
      });
    } catch (error) {
      logger.error('App', '❌ Suppliers module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Suppliers module');
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
     * Get supplier by ID
     */
    getSupplier: async (supplierId: string) => {
      logger.debug('App', 'Getting supplier', { supplierId });
      // Implementation would query database
      return { id: supplierId, name: 'Supplier Name' };
    },

    /**
     * Get active suppliers
     */
    getActiveSuppliers: async () => {
      logger.debug('App', 'Getting active suppliers');
      // Implementation would query database
      return [];
    },

    /**
     * Check supplier performance
     */
    getSupplierPerformance: async (supplierId: string) => {
      logger.debug('App', 'Getting supplier performance', { supplierId });
      // Would use supplierAnalysisEngine
      return { rating: 4.5, onTimeDelivery: 95, qualityScore: 90 };
    }
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'business',
    description: 'Supplier and vendor management module',
    author: 'G-Admin Team',
    tags: ['suppliers', 'vendors', 'procurement', 'purchasing'],
    navigation: {
      route: '/admin/supply-chain/suppliers',
      icon: TruckIcon,
      color: 'blue',
      domain: 'supply-chain',
      isExpandable: false
    }
  }
};

/**
 * Default export
 */
export default suppliersManifest;

/**
 * INTEGRATION EXAMPLES:
 *
 * 1. From materials module, show supplier actions:
 * ```typescript
 * <HookPoint
 *   name="materials.supplier.actions"
 *   data={{ material: selectedMaterial }}
 *   fallback={null}
 * />
 * ```
 *
 * 2. Access suppliers API from another module:
 * ```typescript
 * const suppliersAPI = registry.getExports('suppliers');
 * const supplier = await suppliersAPI.getSupplier('SUPP-001');
 * ```
 *
 * 3. Listen to supplier events:
 * ```typescript
 * eventBus.on('suppliers.supplier_created', (data) => {
 *   console.log('New supplier:', data);
 * });
 * ```
 */
