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
import { Badge, Stack, Typography, Button, Icon, Section } from '@/shared/ui';
import { BeakerIcon, FireIcon, CogIcon } from '@heroicons/react/24/outline';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';
import { DecimalUtils } from '@/lib/decimal/decimalUtils';

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
  activatedBy: 'production_display_system',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
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
      'materials.row.actions',  // "Check Recipe Availability" button in materials table
      'scheduling.toolbar.actions', // "Kitchen Capacity" button in scheduling toolbar
      'sales.order.actions',    // "Send to Kitchen" button in sales orders
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
    // ============================================
    // HOOK 1: Materials Row Actions - "Check Recipe Availability"
    // Migrated from kitchen/manifest.tsx (lines 178-195)
    // ============================================
    registry.addAction(
      'materials.row.actions',
      () => {
        return {
          id: 'check-recipe-availability',
          label: 'Check Recipe Availability',
          icon: 'ChefHat',
          priority: 7,
          onClick: (materialId: string) => {
            logger.debug('App', `Checking recipe availability for: ${materialId}`);
            // Would check which recipes use this ingredient
            // and if there's enough stock to prepare them
          },
        };
      },
      'production',
      7 // Medium priority
    );

    logger.debug('App', 'Extended materials.row.actions with production actions');

    // ============================================
    // HOOK 2: Calendar Events - Production Blocks
    // Migrated from kitchen/manifest.tsx (lines 253-295)
    // ============================================
    registry.addAction(
      'calendar.events',
      () => {
        // Mock production blocks - would query real production schedule
        const productionBlocks = [
          { time: '08:00-10:00', recipe: 'Pan dulce', batch: 50 },
          { time: '10:00-12:00', recipe: 'Empanadas', batch: 200 }
        ];

        return (
          <Stack
            key="kitchen-production-blocks"
            direction="column"
            gap="2"
            p="3"
            bg="purple.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="purple.200"
          >
            <Stack direction="row" align="center" gap="2">
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B21A8' }}>
                🍳 Producción Programada
              </span>
            </Stack>
            <Stack direction="column" gap="1">
              {productionBlocks.map((block, idx) => (
                <Stack key={idx} direction="row" align="center" gap="2">
                  <Badge size="sm" colorPalette="purple">
                    {block.time}
                  </Badge>
                  <span style={{ fontSize: '0.75rem', color: '#7C3AED' }}>
                    {block.recipe} (×{block.batch})
                  </span>
                </Stack>
              ))}
            </Stack>
          </Stack>
        );
      },
      'production',
      75 // Medium-high priority
    );

    logger.debug('App', 'Registered calendar.events for production schedule');

    // ============================================
    // HOOK 3: Scheduling Toolbar - Kitchen Capacity
    // Migrated from kitchen/manifest.tsx (lines 307-340)
    // ============================================
    registry.addAction(
      'scheduling.toolbar.actions',
      (data) => {
        return (
          <Button
            key="kitchen-capacity-btn"
            size="sm"
            variant="outline"
            colorPalette="purple"
            onClick={() => {
              logger.info('App', 'Production Block clicked from scheduling', {
                referenceDate: data?.referenceDate
              });

              // Call the callback provided by scheduling page
              data?.onCreateProductionBlock?.();

              // Show notification
              toaster.create({
                title: '🍳 Bloque de Producción',
                description: 'Modal de producción pendiente de implementación',
                type: 'info',
                duration: 3000
              });
            }}
          >
            <Icon icon={BeakerIcon} size="xs" />
            Kitchen
          </Button>
        );
      },
      'production',
      75 // Medium-high priority
    );

    logger.debug('App', 'Registered scheduling.toolbar.actions for kitchen capacity');

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
      hooksProvided: 6, // materials.row.actions, calendar.events, scheduling.toolbar.actions, sales.order.actions, products.row.actions, products.detail.sections
      hooksConsumed: 4  // sales.order_placed, materials.stock_updated, products.product_updated, products.price_changed
    });
  },

  // Teardown function - cleanup
  teardown: () => {
    logger.info('Production', 'Module cleanup complete');
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
        const { getModuleRegistry } = await import('@/lib/modules');
        const moduleRegistry = getModuleRegistry();

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
          estimated_cost: DecimalUtils.multiply(
            recipeCost.toString(),
            quantity.toString(),
            'recipe'
          ).toNumber(),
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
          priority: EventPriority.HIGH
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
