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

  depends: [], // Standalone module
  autoInstall: true, // Always available

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],

  // 🔒 PERMISSIONS: Supervisors can manage assets
  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'assets.status_updated',       // Asset status changes
      'assets.maintenance_due',      // Maintenance alerts
      'dashboard.widgets',           // Asset health widgets
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
    description: 'Physical asset management and tracking',
    author: 'G-Admin Team',
    tags: ['assets', 'equipment', 'maintenance', 'tracking'],
    navigation: {
      route: '/admin/operations/assets',
      icon: CubeTransparentIcon,
      color: 'gray',
      domain: 'operations',
      isExpandable: false,
    },
  },
};

export default assetsManifest;
