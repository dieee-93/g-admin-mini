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
import { Badge, Stack, Typography, Button, Icon } from '@/shared/ui';
import { BeakerIcon, FireIcon } from '@heroicons/react/24/outline';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';

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
  requiredFeatures: ['production_display_system'],

  // Optional features enhance functionality
  optionalFeatures: [
    'production_bom_management',
    'production_order_queue',
    'production_capacity_planning'
  ],

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: Minimum role required to access this module
   * - employee: Can view kitchen display (read)
   * - supervisor: + Can update order status (read, update)
   * - manager/admin: Full access (read, update, configure)
   *
   * Granular permissions checked at component level via usePermissions()
   */
  minimumRole: 'OPERADOR' as const, // Employee level and above

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
      () => {
        // Mock production schedule - real version would query database
        const productionOrders = [
          { id: '1', recipe: 'Classic Burger', quantity: 50, scheduled: '09:00' },
          { id: '2', recipe: 'Caesar Salad', quantity: 30, scheduled: '10:30' }
        ];

        return (
          <Stack direction="column" gap="2" key="production-calendar-events">
            <Stack direction="row" align="center" gap="2">
              <BeakerIcon className="w-5 h-5 text-purple-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Production Schedule ({productionOrders.length})
              </Typography>
            </Stack>
            <Stack direction="column" gap="1">
              {productionOrders.map((order, idx) => (
                <Stack key={idx} direction="row" align="center" gap="2">
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
      () => {
        return {
          id: 'use-in-production',
          label: 'Use in Production',
          icon: 'BeakerIcon',
          onClick: (materialId: string) => {
            console.log(`[Production] Using material in production: ${materialId}`);
            // Trigger production modal or action
          }
        };
      },
      'production',
      80 // High priority action
    );

    // Hook 3: Sales Order Actions - "Send to Kitchen" button
    registry.addAction(
      'sales.order.actions',
      (data) => {
        const { order, onStatusChange } = data || {};

        // Only show for confirmed orders (not yet in production)
        if (!order || order.status !== 'confirmed') {
          return null;
        }

        return (
          <Button
            key="send-to-kitchen"
            size="sm"
            variant="solid"
            colorPalette="orange"
            onClick={() => {
              logger.info('Production', 'Sending order to kitchen', {
                orderId: order.order_id || order.id,
                items: order.items?.length || 0
              });

              // TODO: Create production order
              // TODO: Update order status
              if (onStatusChange) {
                onStatusChange(order.order_id || order.id, 'in_production');
              }

              toaster.create({
                title: '🔥 Orden Enviada a Cocina',
                description: `Orden #${(order.order_id || order.id).substring(0, 8)} en producción`,
                type: 'success',
                duration: 3000
              });
            }}
          >
            <Icon icon={FireIcon} size="xs" />
            Enviar a Cocina
          </Button>
        );
      },
      'production',
      15 // High priority - shows before other actions
    );

    logger.info('Production', '✅ Production module hooks registered', {
      hooksProvided: 3,
      hooksConsumed: 2
    });
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
