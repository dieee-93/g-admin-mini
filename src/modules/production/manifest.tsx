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

  permissionModule: 'operations', // ✅ Uses 'operations' permission

  // Requires materials module for inventory tracking and products for recipe data
  depends: ['materials', 'products'],

  // Requires kitchen display feature
  requiredFeatures: ['production_display_system'],

  // Optional features enhance functionality
  optionalFeatures: [
    'production_order_management',
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
      'materials.row.actions',  // "Use in Kitchen" button in materials table
      'products.row.actions',   // "Produce Batch" button in products table
      'products.detail.sections' // "Production Info" section in product detail
    ],
    consume: [
      'sales.order_placed',     // React to new orders
      'materials.stock_updated', // Adjust recipes when stock changes
      'products.product_updated', // Recipe changed
      'products.price_changed'   // Cost changed
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

    // ============================================
    // INJECTION 1: Products Row Actions - "Produce Batch" Button
    // ============================================
    logger.info('App', 'Registering products.row.actions injection (Production)');

    registry.addAction(
      'products.row.actions',
      (data) => {
        const { product } = data || {};

        if (!product) return null;

        // Only show for products that require production
        const requiresProduction = product.config?.requires_production ||
                                   product.type === 'ELABORATED';

        if (!requiresProduction) return null;

        return (
          <Button
            key="produce-batch"
            size="xs"
            variant="ghost"
            colorPalette="purple"
            onClick={() => {
              logger.info('Production', 'Creating production order', {
                productId: product.id,
                productName: product.name
              });

              toaster.create({
                title: '🏭 Production Order',
                description: `Creating batch for ${product.name}`,
                type: 'info',
                duration: 2000
              });

              // TODO: Open production order modal
            }}
          >
            <Icon icon={CogIcon} size="xs" />
            Produce Batch
          </Button>
        );
      },
      'production',
      8
    );

    logger.debug('App', 'Registered products.row.actions injection');

    // ============================================
    // INJECTION 2: Products Detail Sections - "Production Info"
    // ============================================
    logger.info('App', 'Registering products.detail.sections injection (Production)');

    registry.addAction(
      'products.detail.sections',
      (data) => {
        const { product } = data || {};

        if (!product) return null;

        const requiresProduction = product.config?.requires_production ||
                                   product.type === 'ELABORATED';

        if (!requiresProduction) return null;

        return (
          <Section key="production-info" variant="elevated">
            <Stack direction="row" align="center" gap="2">
              <BeakerIcon className="w-5 h-5 text-purple-500" />
              <Typography variant="heading" size="sm" fontWeight="semibold">
                Production Information
              </Typography>
            </Stack>
            <Stack direction="column" gap="2" mt="4">
              <Stack direction="row" justify="space-between">
                <Typography variant="body" size="sm" color="text.muted">
                  Kitchen capacity
                </Typography>
                <Badge variant="solid" colorPalette="purple">
                  50 units/hour
                </Badge>
              </Stack>
              <Stack direction="row" justify="space-between">
                <Typography variant="body" size="sm" color="text.muted">
                  Avg prep time
                </Typography>
                <Badge variant="solid" colorPalette="blue">
                  {product.config?.duration_minutes || 10} minutes
                </Badge>
              </Stack>
              <Stack direction="row" justify="space-between">
                <Typography variant="body" size="sm" color="text.muted">
                  Production type
                </Typography>
                <Badge variant="outline" colorPalette="green">
                  {product.config?.production_type || 'kitchen'}
                </Badge>
              </Stack>
            </Stack>
          </Section>
        );
      },
      'production',
      7
    );

    logger.debug('App', 'Registered products.detail.sections injection');

    logger.info('Production', '✅ Production module hooks registered', {
      hooksProvided: 5,
      hooksConsumed: 4
    });
  },

  // Teardown function - cleanup
  teardown: () => {
    console.log('[Production Module] Cleanup complete');
  },

  // Public API exports
  exports: {
    /**
     * Create a production order
     * Uses Products API for recipe data and cost calculation
     * @param recipeId - Recipe/Product identifier
     * @param quantity - Number of units to produce
     * @returns Production order object
     */
    createProductionOrder: async (recipeId: string, quantity: number) => {
      logger.info('Production', 'Creating production order', { recipeId, quantity });

      try {
        // Get module registry to access Products API
        const { moduleRegistry } = await import('@/lib/modules');

        // Use Products API for recipe data (no duplicate logic)
        const productsAPI = moduleRegistry.getExports('products');
        if (!productsAPI) {
          throw new Error('Products module not available');
        }

        // Get recipe/product data
        const { product } = await productsAPI.getProduct(recipeId);
        if (!product) {
          throw new Error(`Product ${recipeId} not found`);
        }

        // Calculate recipe cost using Products API
        const { cost: recipeCost } = await productsAPI.calculateRecipeCost(recipeId);

        // Check if we can produce using Products API
        const { canProduce, missingMaterials } = await productsAPI.canProduceRecipe(recipeId, quantity);

        if (!canProduce) {
          throw new Error(`Cannot produce: Missing materials - ${missingMaterials.join(', ')}`);
        }

        // Create production order (mock - real implementation would insert to DB)
        const order = {
          id: `prod-${Date.now()}`,
          recipe_id: recipeId,
          recipe_name: product.name,
          quantity,
          estimated_cost: recipeCost * quantity,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        logger.info('Production', 'Production order created', { orderId: order.id });

        // Emit event
        const { eventBus, EventPriority } = await import('@/lib/events');
        eventBus.emit('production.order_created', {
          orderId: order.id,
          recipeId,
          quantity,
          estimatedCost: order.estimated_cost
        }, {
          priority: EventPriority.HIGH,
          moduleId: 'production'
        });

        return order;
      } catch (error) {
        logger.error('Production', 'Error creating production order', error);
        throw error;
      }
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
