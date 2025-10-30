/**
 * PRODUCTS MODULE MANIFEST
 *
 * Product catalog and recipe management.
 * Manages finished products, menus, recipes, and pricing.
 *
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { RectangleStackIcon } from '@heroicons/react/24/outline';

export const productsManifest: ModuleManifest = {
  id: 'products',
  name: 'Products & Menu',
  version: '1.0.0',

  depends: ['materials'], // Products use materials in recipes
  autoInstall: false,

  requiredFeatures: [] as FeatureId[], // Optional - user activates
  optionalFeatures: ['production_recipe_management',
    'sales_catalog_menu',
    'sales_catalog_ecommerce',
    'sales_package_management',
  ] as FeatureId[],

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
      // Register products dashboard widget
      registry.addAction(
        'dashboard.widgets',
        () => ({
          id: 'products-summary',
          title: 'Product Performance',
          type: 'products',
          priority: 6,
          data: {
            totalProducts: 0,
            bestSeller: null,
            averageMargin: 0,
          },
        }),
        'products',
        6
      );

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
      route: '/admin/products',
      icon: RectangleStackIcon,
      color: 'orange',
      domain: 'supply-chain',
      isExpandable: false,
    },
  },
};

export default productsManifest;
