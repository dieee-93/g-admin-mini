/**
 * SOCIAL MODULE MANIFEST
 *
 * Module for social media integrations (Facebook, Instagram, WhatsApp, Google My Business).
 * Manages social media posts, catalogs, messaging, and analytics.
 *
 * @version 0.1.0
 * @phase Phase 3 - New Module Creation
 */

import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

export const socialManifest: ModuleManifest = {
  id: 'social',
  name: 'Redes Sociales',
  version: '0.1.0',

  depends: [],

  permissionModule: 'marketing',
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [],
    consume: []
  },

  setup: async (registry) => {
    logger.info('Social module initialized');
  },

  exports: {}
};
