/**
 * PRODUCTS ANALYTICS SUB-MODULE MANIFEST
 *
 * Optional analytics features for Products module.
 * Provides Menu Engineering matrix and Cost Analysis dashboards.
 *
 * INTEGRATION:
 * - Depends on products (parent module)
 * - Injects tabs and content via HookPoints
 * - Only loaded if analytics features are active
 *
 * FEATURES PROVIDED:
 * - Menu Engineering Matrix (BCG Matrix for menu items)
 * - Cost Analysis Dashboard (food cost %, margin analysis)
 *
 * @version 1.0.0
 * @author G-Admin Team
 */

import React, { lazy, Suspense } from 'react';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { logger } from '@/lib/logging';
import { Tabs, Section } from '@/shared/ui';
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Lazy load heavy analytics components
const MenuEngineeringMatrix = lazy(() =>
  import('@/pages/admin/supply-chain/products/components').then(m => ({
    default: m.MenuEngineeringMatrix
  }))
);

const CostAnalysisTab = lazy(() =>
  import('@/pages/admin/supply-chain/products/components').then(m => ({
    default: m.CostAnalysisTab
  }))
);

// ============================================
// MODULE MANIFEST
// ============================================

export const productsAnalyticsManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'products-analytics',
  name: 'Products Analytics',
  version: '1.0.0',

  permissionModule: 'products', // ✅ Uses 'products' permission (analytics submodule)

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * Must have products module active
   */
  depends: ['products'],
  autoInstall: false,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Requires at least ONE analytics feature to be active
   * Module Registry will check this before loading
   */
  requiredFeatures: [] as FeatureId[], // At least one optional feature must be present

  /**
   * Optional features - tabs only show if feature is active
   */
  optionalFeatures: [
    'can_view_menu_engineering',  // Menu Engineering Matrix
    'can_view_cost_analysis'      // Cost Analysis Dashboard
  ] as FeatureId[],

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'products.analytics_tabs',    // Tab triggers for analytics
      'products.analytics_content'  // Tab content for analytics
    ],

    /**
     * Hooks this module CONSUMES
     */
    consume: [
      'materials.stock_updated',  // Recalculate costs when material prices change
      'sales.order_completed'     // Update menu item popularity
    ]
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register analytics tabs and content
   */
  setup: async (registry) => {
    logger.info('App', '📊 Setting up Products Analytics module');

    try {
      // Check which features are active
      const { useCapabilityStore } = await import('@/store/capabilityStore');
      const hasFeature = useCapabilityStore.getState().hasFeature;

      const hasMenuEngineering = hasFeature('can_view_menu_engineering');
      const hasCostAnalysis = hasFeature('can_view_cost_analysis');

      logger.debug('App', 'Products Analytics features', {
        hasMenuEngineering,
        hasCostAnalysis
      });

      // If no analytics features are active, don't register anything
      if (!hasMenuEngineering && !hasCostAnalysis) {
        logger.warn('App', 'No analytics features active - skipping setup');
        return;
      }

      // ============================================
      // HOOK 1: Menu Engineering Tab (if feature active)
      // ============================================

      if (hasMenuEngineering) {
        // Tab trigger
        registry.addAction(
          'products.analytics_tabs',
          () => (
            <Tabs.Trigger key="menu-engineering" value="menu-engineering">
              Menu Engineering
            </Tabs.Trigger>
          ),
          'products-analytics',
          10
        );

        // Tab content
        registry.addAction(
          'products.analytics_content',
          ({ activeTab }) => {
            if (activeTab !== 'menu-engineering') return null;

            return (
              <Tabs.Content key="menu-engineering-content" value="menu-engineering">
                <Section
                  as="article"
                  variant="flat"
                  semanticHeading="Menu Engineering Analysis Dashboard"
                >
                  <Suspense fallback={<div>Loading Menu Engineering...</div>}>
                    <MenuEngineeringMatrix />
                  </Suspense>
                </Section>
              </Tabs.Content>
            );
          },
          'products-analytics',
          10
        );

        logger.debug('App', 'Registered Menu Engineering tab');
      }

      // ============================================
      // HOOK 2: Cost Analysis Tab (if feature active)
      // ============================================

      if (hasCostAnalysis) {
        // Tab trigger
        registry.addAction(
          'products.analytics_tabs',
          () => (
            <Tabs.Trigger key="cost-analysis" value="cost-analysis">
              Cost Analysis
            </Tabs.Trigger>
          ),
          'products-analytics',
          8
        );

        // Tab content
        registry.addAction(
          'products.analytics_content',
          ({ activeTab }) => {
            if (activeTab !== 'cost-analysis') return null;

            return (
              <Tabs.Content key="cost-analysis-content" value="cost-analysis">
                <Section
                  as="article"
                  variant="flat"
                  semanticHeading="Product Cost Analysis Dashboard"
                >
                  <Suspense fallback={<div>Loading Cost Analysis...</div>}>
                    <CostAnalysisTab />
                  </Suspense>
                </Section>
              </Tabs.Content>
            );
          },
          'products-analytics',
          8
        );

        logger.debug('App', 'Registered Cost Analysis tab');
      }

      logger.info('App', '✅ Products Analytics module setup complete', {
        tabsRegistered: (hasMenuEngineering ? 1 : 0) + (hasCostAnalysis ? 1 : 0)
      });

    } catch (error) {
      logger.error('App', '❌ Products Analytics module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Products Analytics module');
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================

  /**
   * No exports needed - this module only provides UI extensions
   */
  exports: {},

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'business',
    description: 'Advanced analytics for product catalog (Menu Engineering, Cost Analysis)',
    author: 'G-Admin Team',
    tags: ['products', 'analytics', 'menu-engineering', 'cost-analysis'],
    navigation: {
      // No separate route - integrates into Products page via hooks
      route: null,
      icon: ChartBarIcon,
      color: 'orange',
      domain: 'supply-chain',
      isExpandable: false
    },
    
  }
};

/**
 * Default export
 */
export default productsAnalyticsManifest;
