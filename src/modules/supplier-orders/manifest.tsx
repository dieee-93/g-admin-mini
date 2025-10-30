/**
 * SUPPLIER ORDERS MODULE MANIFEST
 * Purchase orders from suppliers to restock materials inventory
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export const supplierOrdersManifest: ModuleManifest = {
  id: 'supplier-orders',
  name: 'Supplier Orders',
  version: '1.0.0',

  depends: ['suppliers', 'materials'],
  autoInstall: false,

  requiredFeatures: ['inventory_supplier_management'] as FeatureId[],
  optionalFeatures: ['inventory_purchase_orders'] as FeatureId[],

  hooks: {
    provide: [
      'supplier_orders.order_created',
      'supplier_orders.order_updated',
      'supplier_orders.order_deleted',
      'supplier_orders.status_changed',
      'supplier_orders.order_received'
    ],
    consume: [
      'materials.low_stock_alert',
      'suppliers.supplier_updated'
    ]
  },

  setup: async (registry) => {
    logger.info('App', '📦 Setting up Supplier Orders module');

    // Future: Add hook points for integration

    logger.info('App', '✅ Supplier Orders module setup complete');
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Supplier Orders module');
  },

  exports: {},

  metadata: {
    category: 'business',
    description: 'Purchase orders management for supplier restocking',
    author: 'G-Admin Team',
    tags: ['purchase-orders', 'suppliers', 'procurement', 'inventory'],
    navigation: {
      route: '/admin/supplier-orders',
      icon: DocumentTextIcon,
      color: 'purple',
      domain: 'supply-chain',
      isExpandable: false
    }
  }
};

export default supplierOrdersManifest;
