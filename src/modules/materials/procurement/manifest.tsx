/**
 * MATERIALS PROCUREMENT MODULE MANIFEST
 * Purchase orders management for materials procurement
 *
 * @version 2.0.0 - Converted from standalone supplier-orders to materials submodule
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export const materialsProcurementManifest: ModuleManifest = {
  id: 'materials-procurement',
  name: 'Materials Procurement',
  version: '2.0.0',

  permissionModule: 'materials', // ✅ Uses 'materials' permission (procurement submodule)

  depends: ['materials', 'suppliers'],
  autoInstall: false,

  requiredFeatures: ['inventory_supplier_management'] as FeatureId[],
  optionalFeatures: ['inventory_purchase_orders'] as FeatureId[],

  // 🔒 PERMISSIONS: Supervisors can manage purchase orders
  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'materials.procurement.po_created',
      'materials.procurement.po_updated',
      'materials.procurement.po_deleted',
      'materials.procurement.po_status_changed',
      'materials.procurement.po_received'
    ],
    consume: [
      'materials.low_stock_alert',
      'suppliers.supplier_updated'
    ]
  },

  setup: async () => {
    logger.info('App', '📦 Setting up Materials Procurement module');

    // Future: Add hook points for integration

    logger.info('App', '✅ Materials Procurement module setup complete');
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Materials Procurement module');
  },

  exports: {},

  metadata: {
    category: 'business',
    description: 'Purchase order management for materials procurement',
    author: 'G-Admin Team',
    tags: ['procurement', 'purchase-orders', 'materials', 'inventory'],
    navigation: {
      route: '/admin/supply-chain/materials/procurement',
      icon: DocumentTextIcon,
      color: 'purple',
      domain: 'supply-chain',
      isExpandable: false
    }
  }
};

export default materialsProcurementManifest;
