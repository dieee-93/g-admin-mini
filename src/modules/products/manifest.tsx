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
  autoInstall: false,

  requiredFeatures: [] as FeatureId[], // Optional - user activates
  optionalFeatures: ['production_bom_management',
    'sales_catalog_menu',
    'sales_catalog_ecommerce',
    'sales_package_management',
  ] as FeatureId[],

  // 🔒 PERMISSIONS: Employees can view products
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'products.menu_items',        // Menu items for POS
      'products.recipe_costing',    // Recipe cost calculation
      'dashboard.widgets',          // Product performance widgets
    ],
    consume: [
      'materials.stock_updated',    // Update recipe availability
      'sales.order_completed',      // Track product sales
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
      return { product: null };
    },
    calculateRecipeCost: async (recipeId: string) => {
      logger.debug('App', 'Calculating recipe cost', { recipeId });
      return { cost: 0, margin: 0 };
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
      domain: 'supply-chain',
      isExpandable: false,
    },
  },
};

export default productsManifest;
