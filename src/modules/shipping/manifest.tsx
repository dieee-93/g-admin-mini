/**
 * SHIPPING MODULE MANIFEST
 *
 * Module for external shipping services management (postal mail, couriers, freight).
 * Manages shipping integrations, tracking, and cost calculation.
 *
 * @version 0.1.0
 * @phase Phase 3 - New Module Creation
 */

import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';

export const shippingManifest: ModuleManifest = {
  id: 'shipping',
  name: 'Envíos por Correo',
  version: '0.1.0',

  depends: [],

  permissionModule: 'operations',
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [],
    consume: []
  },

  setup: async (registry) => {
    logger.info('Shipping module initialized');
  },

  exports: {}
};
