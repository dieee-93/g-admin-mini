/**
 * PRODUCTION EQUIPMENT MODULE MANIFEST
 *
 * Manufacturing equipment with costing (depreciation, maintenance, consumables)
 * Clean architecture, no rental integration
 *
 * @version 2.0.0
 */

import React, { lazy } from 'react'
import { logger } from '@/lib/logging'
import type { ModuleManifest } from '@/lib/modules/types'
import { CubeIcon } from '@heroicons/react/24/outline'

export const productionEquipmentManifest: ModuleManifest = {
  id: 'production-equipment',
  name: 'Production Equipment',
  version: '2.0.0',

  permissionModule: 'operations',

  depends: [],  // Standalone module

  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'production-equipment.status_updated',
      'production-equipment.maintenance_due',
      'dashboard.widgets',
    ],
    consume: [],  // No consume hooks (clean)
  },

  setup: async (registry) => {
    logger.info('App', '🏭 Setting up Production Equipment module')

    try {
      // Dashboard Widget
      const EquipmentWidget = lazy(() =>
        import('./components/ProductionEquipmentWidget')
      )

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Loading equipment...</div>}>
            <EquipmentWidget />
          </React.Suspense>
        ),
        'production-equipment',
        40
      )

      logger.info('App', '✅ Production Equipment module setup complete')
    } catch (error) {
      logger.error('App', '❌ Production Equipment module setup failed', error)
      throw error
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Production Equipment module')
  },

  exports: {
    getEquipment: async (equipmentId: string) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data, error } = await supabase
        .from('production_equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();

      if (error) throw error;
      return data;
    },
    getHourlyCostRate: async (equipmentId: string) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data, error } = await supabase
        .from('production_equipment')
        .select('hourly_cost_rate')
        .eq('id', equipmentId)
        .single();

      if (error) throw error;
      return data?.hourly_cost_rate ?? 0;
    },
  },

  metadata: {
    category: 'business',
    description: 'Production equipment inventory with hourly costing',
    author: 'G-Admin Team',
    tags: ['production', 'equipment', 'costing', 'manufacturing'],
    navigation: {
      route: '/admin/operations/production-equipment',
      icon: CubeIcon,
      color: 'purple',
      domain: 'operations',
      isExpandable: false,
    },
  },
}

export default productionEquipmentManifest
