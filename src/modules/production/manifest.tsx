/**
 * PRODUCTION MODULE MANIFEST
 *
 * Real production management module from src/pages/admin/supply-chain/products
 * Provides recipe management, kitchen display, and production scheduling.
 *
 * MODULE INTEGRATION:
 * - Depends on materials module (requires inventory data)
 * - Provides calendar events (production schedule)
 * - Provides materials row actions ("Use in Kitchen" button)
 * - Consumes sales order events
 * - Consumes material stock updates
 *
 * @version 1.0.0
 * @see src/pages/admin/supply-chain/products/page.tsx
 */

import React from 'react';
import type { ModuleManifest, ModuleRegistry } from '@/lib/modules/types';
import { Badge, Stack, Typography } from '@/shared/ui';
import { CubeIcon, BeakerIcon } from '@heroicons/react/24/outline';

// ============================================
// MODULE MANIFEST
// ============================================

export const productionManifest: ModuleManifest = {
  id: 'production',
  name: 'Production Management',
  version: '1.0.0',

  // Requires materials module for inventory tracking
  depends: ['materials'],

  // Requires kitchen display feature
  requiredFeatures: ['production_kitchen_display'],

  // Optional features enhance functionality
  optionalFeatures: [
    'production_recipe_management',
    'production_order_queue',
    'production_capacity_planning'
  ],

  // Hook points this module provides and consumes
  hooks: {
    provide: [
      'calendar.events',        // Render production schedule
      'materials.row.actions'   // "Use in Kitchen" button in materials table
    ],
    consume: [
      'sales.order_placed',     // React to new orders
      'materials.stock_updated' // Adjust recipes when stock changes
    ]
  },

  // Setup function - register hooks
  setup: (registry: ModuleRegistry) => {
    // Hook 1: Calendar Events - Production schedule overlay
    registry.addAction(
      'calendar.events',
      (data?: { selectedWeek?: string; shifts?: any[] }) => {
        // Mock production schedule - real version would query database
        const productionOrders = [
          { id: '1', recipe: 'Classic Burger', quantity: 50, scheduled: '09:00' },
          { id: '2', recipe: 'Caesar Salad', quantity: 30, scheduled: '10:30' }
        ];

        return (
          <Stack direction="column" gap={2} key="production-calendar-events">
            <Stack direction="row" align="center" gap={2}>
              <BeakerIcon className="w-5 h-5 text-purple-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Production Schedule ({productionOrders.length})
              </Typography>
            </Stack>
            <Stack direction="column" gap={1}>
              {productionOrders.map((order, idx) => (
                <Stack key={idx} direction="row" align="center" gap={2}>
                  <Badge variant="solid" colorPalette="purple">
                    {order.scheduled}
                  </Badge>
                  <Typography variant="body" size="xs" color="text.muted">
                    {order.recipe} ({order.quantity} units)
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        );
      },
      'production',
      70 // Medium priority - renders after staff and scheduling
    );

    // Hook 2: Materials Row Actions - "Use in Kitchen" button
    registry.addAction(
      'materials.row.actions',
      (data?: { material?: any }) => {
        if (!data?.material) return null;

        return (
          <button
            key={`production-use-${data.material.id}`}
            onClick={() => {
              console.log(`[Production] Using material in kitchen: ${data.material.name}`);
              // Trigger production modal or action
            }}
            className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
            title="Use this material in kitchen"
          >
            Use in Kitchen
          </button>
        );
      },
      'production',
      80 // High priority action
    );

    console.log('[Production Module] Hooks registered successfully');
  },

  // Teardown function - cleanup
  teardown: () => {
    console.log('[Production Module] Cleanup complete');
  },

  // Public API exports
  exports: {
    /**
     * Calculate recipe cost based on materials
     * @param recipeId - Recipe identifier
     * @returns Total cost in dollars
     */
    calculateRecipeCost: async (recipeId: string) => {
      // Mock implementation - real version would query database
      console.log(`[Production] Calculating cost for recipe: ${recipeId}`);
      return 12.50; // Mock cost
    },

    /**
     * Check if recipe can be produced with current stock
     * @param recipeId - Recipe identifier
     * @param quantity - Number of units to produce
     * @returns Boolean indicating if production is possible
     */
    canProduceRecipe: async (recipeId: string, quantity: number) => {
      // Mock implementation - real version would check stock levels
      console.log(`[Production] Checking if ${quantity} units of ${recipeId} can be produced`);
      return true; // Mock response
    }
  },

  // Module metadata
  metadata: {
    category: 'business',
    description: 'Recipe management, kitchen display, and production scheduling',
    author: 'G-Admin Team',
    tags: ['production', 'kitchen', 'recipes', 'manufacturing']
  }
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default productionManifest;
