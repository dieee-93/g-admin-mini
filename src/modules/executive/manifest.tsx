/**
 * EXECUTIVE MODULE MANIFEST
 *
 * Executive dashboards and strategic analytics.
 * High-level KPIs and insights for decision-makers.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export const executiveManifest: ModuleManifest = {
  id: 'executive',
  name: 'Executive Dashboard',
  version: '1.0.0',

  depends: [], // Aggregates data from all modules
  autoInstall: true, // Always available for executives

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: ['executive'] as FeatureId[],

  hooks: {
    provide: [
      'executive.kpi_panels',     // Executive KPI panels
      'executive.insights',       // Strategic insights
    ],
    consume: [
      'sales.metrics',            // Revenue metrics
      'materials.stock_status',   // Inventory health
      'staff.performance',        // Team performance
      'finance.cash_flow',        // Financial metrics
    ],
  },

  setup: async (registry) => {
    logger.info('App', '📈 Setting up Executive module');

    try {
      logger.info('App', '✅ Executive module setup complete');
    } catch (error) {
      logger.error('App', '❌ Executive module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Executive module');
  },

  exports: {
    getKPIs: async (period: string) => {
      logger.debug('App', 'Getting executive KPIs', { period });
      return { kpis: [] };
    },
    getInsights: async () => {
      logger.debug('App', 'Getting strategic insights');
      return { insights: [] };
    },
  },

  metadata: {
    category: 'analytics',
    description: 'Executive dashboards and strategic analytics',
    author: 'G-Admin Team',
    tags: ['executive', 'kpi', 'analytics', 'strategic'],
    navigation: {
      route: '/admin/executive',
      icon: ChartBarIcon,
      color: 'pink',
      domain: 'advanced',
      isExpandable: false,
    },
  },
};

export default executiveManifest;
