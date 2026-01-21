/**
 * INTELLIGENCE MODULE MANIFEST
 *
 * Competitive intelligence and market analysis.
 * Provides insights into market trends and competitors.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export const intelligenceManifest: ModuleManifest = {
  id: 'intelligence',
  name: 'Competitive Intelligence',
  version: '1.0.0',

  permissionModule: 'reporting', // ✅ Uses 'reporting' permission

  depends: [],

  // 🔒 PERMISSIONS: Only ADMINISTRADOR for competitive intelligence
  minimumRole: 'ADMINISTRADOR' as const,

  hooks: {
    provide: [
      'dashboard.widgets',        // Intelligence insights widget
    ],
    consume: [
      'sales.metrics',            // Market share analysis
      'materials.pricing_trends', // Cost analysis
    ],
  },

  setup: async (registry) => {
    logger.info('App', '💡 Setting up Intelligence module');

    try {
      logger.info('App', '✅ Intelligence module setup complete');
    } catch (error) {
      logger.error('App', '❌ Intelligence module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Intelligence module');
  },

  exports: {
    getMarketTrends: async () => {
      logger.debug('App', 'Getting market trends');
      return { trends: [] };
    },
    getCompetitorAnalysis: async () => {
      logger.debug('App', 'Getting competitor analysis');
      return { analysis: null };
    },
  },

  metadata: {
    category: 'analytics',
    description: 'Competitive intelligence and market analysis',
    author: 'G-Admin Team',
    tags: ['intelligence', 'market-analysis', 'competitors', 'trends'],
    navigation: {
      route: '/admin/intelligence',
      icon: LightBulbIcon,
      color: 'yellow',
      domain: 'core',
      isExpandable: false,
    },
  },
};

export default intelligenceManifest;
