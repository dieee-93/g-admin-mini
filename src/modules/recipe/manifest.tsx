/**
 * Recipe Module Manifest
 *
 * Definición del módulo de recetas para el sistema de módulos de G-Admin Mini
 *
 * @module recipe
 */

import { lazy } from 'react'
import type { ModuleManifest } from '@/lib/modules/types'
import { BeakerIcon } from '@heroicons/react/24/outline'

export const recipeManifest: ModuleManifest = {
  // Identity
  id: 'recipe',
  name: 'Recipe Management',
  description: 'Recipe definition, costing, analytics, and production scheduling',
  domain: 'SUPPLY_CHAIN',
  category: 'core',
  version: '1.0.0',

  // Routes (rutas adicionales del módulo, si las hay)
  routes: [],

  // Hook points
  hooks: {
    // QUÉ PROVEE este módulo
    provide: [
      'recipe.builder',              // Componente RecipeBuilder
      'recipe.cost_calculation',     // Cálculo de costos
      'recipe.analytics',            // Analytics engine
      'recipe.execution',            // Production execution
      'dashboard.widgets'            // Widgets para dashboard
    ],

    // QUÉ CONSUME de otros módulos
    consume: [
      'materials.stock_updated',     // Recalcular disponibilidad
      'products.created',            // Crear recipe automática (futuro)
      'sales.order_completed'        // Tracking de popularidad
    ],
  },

  // Widgets (se implementarán en fase posterior)
  widgets: [
    // {
    //   id: 'recipe-stats',
    //   component: lazy(() => import('./widgets/RecipeStatsWidget')),
    //   title: 'Recipe Statistics',
    //   defaultSize: 'medium'
    // }
  ],

  // Permissions
  permissions: [
    { id: 'recipe.view', name: 'View Recipes' },
    { id: 'recipe.create', name: 'Create Recipes' },
    { id: 'recipe.edit', name: 'Edit Recipes' },
    { id: 'recipe.delete', name: 'Delete Recipes' },
    { id: 'recipe.execute', name: 'Execute Recipes (Production)' },
    { id: 'recipe.manage', name: 'Full Recipe Management' }
  ],

  // Dependencies (ModuleRegistry expects 'depends', not 'dependencies')
  depends: ['materials', 'products'],

  // Auto-install flag - Enable to show in navigation by default
  // Minimum role required
  minimumRole: 'OPERADOR' as const,

  // Icon
  icon: BeakerIcon,

  // ============================================
  // SETUP & TEARDOWN
  // ============================================
  setup: async (registry) => {
    const { logger } = await import('@/lib/logging');
    logger.info('App', '🧪 Setting up Recipe module');

    try {
      // TODO: Register dashboard widgets
      // TODO: Register hooks

      logger.info('App', '✅ Recipe module setup complete');
    } catch (error) {
      logger.error('App', '❌ Recipe module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    const { logger } = await import('@/lib/logging');
    logger.info('App', '🧹 Tearing down Recipe module');
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================
  exports: {
    // Recipe services
    services: {} as typeof import('./services'),

    // Recipe hooks
    hooks: {} as typeof import('./hooks'),

    // Recipe types
    types: {} as typeof import('./types'),
  },

  // ============================================
  // METADATA & NAVIGATION
  // ============================================
  metadata: {
    category: 'business',
    description: 'Recipe management, BOMs, kits and resource compositions',
    author: 'G-Admin Team',
    tags: ['recipes', 'bom', 'kits', 'costing', 'production'],
    navigation: {
      route: '/admin/supply-chain/recipes',
      icon: BeakerIcon,
      color: 'purple',
      domain: 'supply-chain',
      isExpandable: false
    }
  }
}

// Export manifest como default
export default recipeManifest
