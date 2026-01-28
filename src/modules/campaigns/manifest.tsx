/**
 * CAMPAIGNS MODULE MANIFEST
 *
 * Module for marketing campaigns management (promotions, discounts, coupons).
 * Manages promotional campaigns, discount rules, and usage tracking.
 *
 * @version 0.1.0
 * @phase Phase 3 - New Module Creation
 */

import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

export const campaignsManifest: ModuleManifest = {
  id: 'campaigns',
  name: 'Campañas',
  version: '0.1.0',

  depends: [],

  permissionModule: 'marketing',
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [],
    consume: []
  },

  setup: async (registry) => {
    logger.info('Campaigns module initialized');
  },

  exports: {}
};
