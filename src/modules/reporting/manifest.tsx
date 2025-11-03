/**
 * REPORTING MODULE MANIFEST
 *
 * Custom reporting and analytics engine.
 * Generates reports from multiple data sources.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

export const reportingManifest: ModuleManifest = {
  id: 'reporting',
  name: 'Custom Reporting',
  version: '1.0.0',

  depends: [],
  autoInstall: true, // Always available for custom reports

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],

  // 🔒 PERMISSIONS: Supervisors can generate reports
  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'reporting.data_sources',   // Register data sources for reports
      'reporting.chart_types',    // Custom chart types
      'dashboard.widgets',        // Reporting widgets
    ],
    consume: [
      // Reporting can consume data from all modules
    ],
  },

  setup: async (registry) => {
    logger.info('App', '📊 Setting up Reporting module');

    try {
      logger.info('App', '✅ Reporting module setup complete');
    } catch (error) {
      logger.error('App', '❌ Reporting module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Reporting module');
  },

  exports: {
    generateReport: async (reportConfig: any) => {
      logger.debug('App', 'Generating report', { reportConfig });
      return { report: null };
    },
    scheduleReport: async (reportId: string, schedule: any) => {
      logger.debug('App', 'Scheduling report', { reportId, schedule });
      return { success: true };
    },
  },

  metadata: {
    category: 'analytics',
    description: 'Custom reporting and analytics engine',
    author: 'G-Admin Team',
    tags: ['reporting', 'analytics', 'charts', 'dashboards'],
    navigation: {
      route: '/admin/reporting',
      icon: DocumentChartBarIcon,
      color: 'cyan',
      domain: 'core',
      isExpandable: false,
    },
  },
};

export default reportingManifest;
