/**
 * STOREFRONT MODULE MANIFEST
 *
 * Module for storefront configuration, digital menu, and customer-facing store settings.
 * Manages online store appearance, menu display, and QR menus for tables.
 *
 * @version 0.1.0
 * @phase Phase 3 - New Module Creation
 */

import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

export const storefrontManifest: ModuleManifest = {
  id: 'storefront',
  name: 'Tienda',
  version: '0.1.0',

  depends: [],

  // Permission module
  permissionModule: 'operations',

  // Minimum role
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [],
    consume: []
  },

  setup: async (registry) => {
    logger.info('Storefront module initialized');
  },

  exports: {}
};
