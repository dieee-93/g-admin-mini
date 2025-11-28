/**
 * ASSETS MODULE MANIFEST
 *
 * Physical asset management and tracking.
 * Manages equipment, tools, vehicles, and facility assets.
 *
 * @version 1.0.0
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

export const assetsManifest: ModuleManifest = {
  id: 'assets',
  name: 'Asset Management',
  version: '1.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission

  depends: [], // Standalone module
  autoInstall: true, // Always available

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],

  // 🔒 PERMISSIONS: Supervisors can manage assets
  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'assets.status_updated',       // Event: Asset status changes
      'assets.maintenance_due',      // Event: Maintenance alerts
      'dashboard.widgets',           // Hook: Asset health widgets
      'assets.row.actions',          // Hook: Buttons in asset grid
      'assets.form.fields',          // Hook: Fields in asset form
      'assets.detail.sections',      // Hook: Sections in asset detail
    ],
    consume: [
      'rentals.asset_rented',        // Track rental usage
      'operations.asset_used',       // Track operational usage
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🏗️ Setting up Assets module');

    try {
      // ✅ Dashboard Widget - Assets status
      const AssetsWidget = lazy(() => import('./components/AssetsWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando assets...</div>}>
            <AssetsWidget />
          </React.Suspense>
        ),
        'assets',
        40 // Medium priority widget
      );

      logger.info('App', '✅ Assets module setup complete');
    } catch (error) {
      logger.error('App', '❌ Assets module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Assets module');
  },

  exports: {
    getAsset: async (assetId: string) => {
      logger.debug('App', 'Getting asset', { assetId });
      return { asset: null };
    },
    scheduleMainten: async (assetId: string, date: Date) => {
      logger.debug('App', 'Scheduling maintenance', { assetId, date });
      return { success: true };
    },
  },

  metadata: {
    category: 'business',
    description: 'Physical asset inventory management (equipment, tools, machinery)',
    author: 'G-Admin Team',
    tags: ['assets', 'equipment', 'inventory', 'maintenance', 'tracking'],
    navigation: {
      route: '/admin/supply-chain/assets',
      icon: CubeTransparentIcon,
      color: 'teal',
      domain: 'supply-chain',
      isExpandable: false,
    },
  },
};

export default assetsManifest;
