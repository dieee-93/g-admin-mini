/**
 * PRODUCTS MODULE MANIFEST
 *
 * Product catalog and recipe management.
 * Manages finished products, menus, recipes, and pricing.
 *
 * @version 1.0.0
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { RectangleStackIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { Button, Icon } from '@/shared/ui';
import { toaster } from '@/shared/ui/toaster';

export const productsManifest: ModuleManifest = {
  id: 'products',
  name: 'Products & Menu',
  version: '1.0.0',

  depends: ['materials'], // Products use materials in recipes

  activatedBy: 'products_recipe_management',

  // ✅ OPTIONAL MODULE: Only loaded when required feature is active

  // 🔒 PERMISSIONS: Employees can view products
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'products.menu_items',            // Menu items for POS
      'products.recipe_costing',        // Recipe cost calculation
      'products.availability_updated',  // Event: Product availability changed
      'products.sales_recorded',        // Event: Product sale recorded
      'dashboard.widgets',              // Product performance widgets
      'materials.row.actions',          // Recipe Usage button in materials grid
    ],
    consume: [
      'materials.stock_updated',        // Update recipe availability
      'sales.order_completed',          // Track product sales
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🍽️ Setting up Products module');

    try {
      // ============================================
      // HOOK 1: Dashboard Widget
      // ============================================

      /**
       * ✅ CORRECT: Hook returns React component (not metadata)
       * Lazy-loaded for performance
       */
      const ProductsWidget = lazy(() => import('./components/ProductsWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando productos...</div>}>
            <ProductsWidget />
          </React.Suspense>
        ),
        'products',
        6
      );

      // ============================================
      // HOOK 2: Materials Row Actions - Recipe Usage Button
      // ============================================

      /**
       * Adds "Recipe Usage" button in materials grid row actions
       * Shows which recipes use this material
       */
      registry.addAction(
        'materials.row.actions',
        (data) => {
          const { material } = data || {};

          if (!material) {
            return null;
          }

          return (
            <Button
              key="check-recipe-usage"
              size="xs"
              variant="ghost"
              colorPalette="orange"
              onClick={() => {
                logger.info('App', 'Checking recipe usage for material', {
                  materialId: material.id,
                  materialName: material.name
                });

                // TODO: Show modal with recipes that use this material
                toaster.create({
                  title: '🍽️ Uso en Recetas',
                  description: `Verificando recetas con ${material.name}`,
                  type: 'info',
                  duration: 2000
                });
              }}
            >
              <Icon icon={BeakerIcon} size="xs" />
              Recetas
            </Button>
          );
        },
        'products',
        8
      );

      logger.debug('App', 'Registered materials.row.actions for Recipe Usage button');

      // ============================================
      // EVENTBUS LISTENERS: React to cross-module events
      // ============================================

      // ⚡ PERFORMANCE: Parallel imports (2 imports)
      const [
        { eventBus, EventPriority },
        { supabase }
      ] = await Promise.all([
        import('@/lib/events'),
        import('@/lib/supabase/client')
      ]);

      /**
       * LISTENER 1: materials.stock_updated
       * When materials stock changes, recalculate product availability
       */
      eventBus.subscribe('materials.stock_updated', async (event) => {
        const { materialId, newStock, operation } = event.payload || {};

        logger.info('Products', 'Material stock updated', {
          materialId,
          newStock,
          operation
        });

        try {
          // Find products using this material
          const { data: affectedProducts, error } = await supabase
            .from('product_components')
            .select('product_id')
            .eq('item_id', materialId);

          if (error) throw error;

          if (affectedProducts && affectedProducts.length > 0) {
            logger.info('Products', `Found ${affectedProducts.length} products affected by material change`, {
              materialId,
              productCount: affectedProducts.length
            });

            // Emit event to notify other modules (Sales, Production)
            eventBus.emit('products.availability_updated', {
              productIds: affectedProducts.map(p => p.product_id),
              trigger: 'materials_stock_changed',
              materialId,
              timestamp: new Date().toISOString()
            }, {
              priority: EventPriority.MEDIUM,
              moduleId: 'products'
            });

            logger.debug('Products', 'Emitted products.availability_updated event');
          }
        } catch (error) {
          logger.error('Products', 'Error handling materials.stock_updated', error);
        }
      }, {
        moduleId: 'products',
        priority: 100 // High priority - affects availability
      });

      logger.debug('App', 'Registered materials.stock_updated listener');

      /**
       * LISTENER 2: sales.order_completed
       * When sales complete, update product sales metrics for Menu Engineering
       */
      eventBus.subscribe('sales.order_completed', async (event) => {
        const { items, orderId, orderTotal } = event.payload || {};

        logger.info('Products', 'Sales order completed', {
          orderId,
          itemCount: items?.length || 0,
          orderTotal
        });

        try {
          // Update product sales metrics
          if (items && Array.isArray(items)) {
            for (const item of items) {
              if (item.product_id) {
                logger.debug('Products', 'Updating sales metrics', {
                  productId: item.product_id,
                  quantity: item.quantity,
                  revenue: item.total || item.price * item.quantity
                });

                // TODO: Increment sales counter in product_sales_metrics table
                // TODO: Update Menu Engineering BCG matrix data
                // For now, just emit event for potential future consumers
                eventBus.emit('products.sales_recorded', {
                  productId: item.product_id,
                  quantity: item.quantity,
                  revenue: item.total || item.price * item.quantity,
                  orderId,
                  timestamp: new Date().toISOString()
                }, {
                  priority: EventPriority.LOW,
                  moduleId: 'products'
                });
              }
            }
          }
        } catch (error) {
          logger.error('Products', 'Error handling sales.order_completed', error);
        }
      }, {
        moduleId: 'products',
        priority: 50 // Lower priority - analytics can be async
      });

      logger.debug('App', 'Registered sales.order_completed listener');
      logger.debug('App', '✅ EventBus listeners registered in Products module');

      logger.info('App', '✅ Products module setup complete');
    } catch (error) {
      logger.error('App', '❌ Products module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Products module');
  },

  exports: {
    getProduct: async (productId: string) => {
      logger.debug('App', 'Getting product', { productId });
      const { supabase } = await import('@/lib/supabase/client');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        logger.error('App', 'Error fetching product', error);
        return { product: null };
      }

      return { product: data };
    },

    calculateRecipeCost: async (recipeId: string) => {
      logger.debug('App', 'Calculating recipe cost', { recipeId });
      const { supabase } = await import('@/lib/supabase/client');

      // Get product components (BOM)
      const { data: components, error } = await supabase
        .from('product_components')
        .select(`
          quantity,
          items:item_id (
            name,
            cost
          )
        `)
        .eq('product_id', recipeId);

      if (error) {
        logger.error('App', 'Error calculating recipe cost', error);
        return { cost: 0, margin: 0 };
      }

      // Calculate total cost
      const totalCost = (components || []).reduce((sum, comp: any) => {
        const itemCost = comp.items?.cost || 0;
        return sum + (itemCost * comp.quantity);
      }, 0);

      return { cost: totalCost, margin: 0 };
    },

    canProduceRecipe: async (recipeId: string, quantity: number) => {
      logger.debug('App', 'Checking recipe production viability', { recipeId, quantity });
      const { supabase } = await import('@/lib/supabase/client');

      // Get product components (BOM)
      const { data: components, error } = await supabase
        .from('product_components')
        .select(`
          item_id,
          quantity,
          items:item_id (
            name,
            current_stock
          )
        `)
        .eq('product_id', recipeId);

      if (error) {
        logger.error('App', 'Error checking recipe viability', error);
        throw error;
      }

      // Check if we have enough stock for each component
      const missingMaterials: string[] = [];
      let canProduce = true;

      for (const comp of components || []) {
        const requiredStock = comp.quantity * quantity;
        const currentStock = comp.items?.current_stock || 0;

        if (currentStock < requiredStock) {
          canProduce = false;
          missingMaterials.push(comp.items?.name || 'Unknown');
        }
      }

      return {
        canProduce,
        missingMaterials,
        quantity
      };
    },
  },

  metadata: {
    category: 'business',
    description: 'Product catalog, recipes, and menu management',
    author: 'G-Admin Team',
    tags: ['products', 'menu', 'recipes', 'catalog'],
    navigation: {
      route: '/admin/supply-chain/products',
      icon: RectangleStackIcon,
      color: 'orange',
      domain: 'inventory',
      isExpandable: false,
    },
  },
};

export default productsManifest;
