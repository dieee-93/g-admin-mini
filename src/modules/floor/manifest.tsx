import type { ModuleManifest } from '@/lib/modules/types';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export const floorManifest: ModuleManifest = {
  id: 'floor',
  name: 'Floor Management',
  version: '1.0.0',
  domain: 'operations',
  category: 'core',

  description: 'Comprehensive floor management for restaurant operations including table tracking and reservations',

  icon: BuildingStorefrontIcon,
  path: '/admin/operations/floor',

  requiredFeatures: ['operations_floor_management'],
  optionalFeatures: ['operations_table_assignment', 'operations_floor_plan_config'],

  depends: [],
  autoInstall: false,

  hooks: {
    provide: [
      'floor.table_status',
      'floor.table_selected',
      'floor.quick_view'
    ],
    consume: []
  },

  setup: (registry) => {
    // Floor management hooks can be added here
    // For now, this is a standalone module
  },

  teardown: (registry) => {
    // Cleanup if needed
  },

  exports: {
    // Export FloorPlanQuickView for Sales POS embedding
    FloorPlanQuickView: async () => {
      const { FloorPlanQuickView } = await import(
        '@/pages/admin/operations/floor/components/FloorPlanQuickView'
      );
      return FloorPlanQuickView;
    }
  }
};
