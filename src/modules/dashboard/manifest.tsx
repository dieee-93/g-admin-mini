/**
 * DASHBOARD MODULE MANIFEST
 *
 * Central dashboard providing overview of all business domains.
 * Aggregates widgets from all registered modules.
 *
 * PATTERN:
 * - Provides main dashboard hook for widgets
 * - Consumes widgets from all modules
 * - Provides cross-module analytics
 *
 * @version 1.0.0
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { HomeIcon } from '@heroicons/react/24/outline';

/**
 * Dashboard Module Manifest
 *
 * Provides central dashboard functionality:
 * - Widget aggregation from all modules
 * - Cross-module analytics
 * - Quick access to key metrics
 * - Role-based dashboard views
 */
export const dashboardManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * No dependencies - foundation module
   * All other modules can register widgets here
   */
  depends: [],

  autoInstall: true, // Always available

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * No required features - always active
   */
  requiredFeatures: [] as FeatureId[],

  /**
   * Optional features that enhance functionality
   */
  optionalFeatures: ['dashboard'] as FeatureId[],

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: All employees can view dashboard
   */
  minimumRole: 'OPERADOR' as const,

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'dashboard.widgets',        // Main hook for dashboard widgets
      'dashboard.kpi_cards',      // Quick KPI cards at top
      'dashboard.charts',         // Chart widgets
      'dashboard.quick_actions',  // Quick action buttons
    ],

    /**
     * Hooks this module CONSUMES
     */
    consume: [
      'sales.metrics',            // Sales metrics for dashboard
      'materials.stock_status',   // Inventory status
      'staff.attendance',         // Staff attendance
      'scheduling.today_shifts',  // Today's shifts
      'finance.pending_invoices', // Pending invoices
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register hook handlers
   */
  setup: async (registry) => {
    logger.info('App', '🏠 Setting up Dashboard module');

    try {
      // Dashboard provides hooks for other modules to inject widgets
      // The actual widget rendering is handled by the Dashboard page component
      // which uses HookPoint to render all registered widgets


      // ============================================
      // DASHBOARD CHART WIDGETS
      // ============================================

      /**
       * Hook: dashboard.widgets
       * Inyecta charts en el dashboard principal
       */
      const {
        QuickActionsWidget,
        ActivityFeedWidget,
        SalesTrendChartWidget,
        DistributionChartWidget,
        RevenueAreaChartWidget,
        MetricsBarChartWidget
      } = await import('./widgets');

      // ============================================
      // ACTION WIDGETS (Top priority)
      // ============================================

      // Quick Actions Grid (priority: 105)
      registry.addAction(
        'dashboard.widgets',
        () => <QuickActionsWidget key="quick-actions" />,
        'dashboard',
        105
      );

      // ============================================
      // CHART WIDGETS (Medium priority)
      // ============================================

      // Sales Trend Chart (col-span 8)
      registry.addAction(
        'dashboard.widgets',
        () => <SalesTrendChartWidget key="sales-trend-chart" />,
        'dashboard',
        80
      );

      // Distribution Chart (col-span 4)
      registry.addAction(
        'dashboard.widgets',
        () => <DistributionChartWidget key="distribution-chart" />,
        'dashboard',
        79
      );

      // Revenue Area Chart (col-span 7)
      registry.addAction(
        'dashboard.widgets',
        () => <RevenueAreaChartWidget key="revenue-area-chart" />,
        'dashboard',
        70
      );

      // Metrics Bar Chart (col-span 5)
      registry.addAction(
        'dashboard.widgets',
        () => <MetricsBarChartWidget key="metrics-bar-chart" />,
        'dashboard',
        69
      );

      // ============================================
      // ACTIVITY WIDGETS (Lower priority)
      // ============================================

      // Activity Feed (priority: 50)
      registry.addAction(
        'dashboard.widgets',
        () => <ActivityFeedWidget key="activity-feed" />,
        'dashboard',
        50
      );

      logger.debug('App', 'Registered dashboard.widgets hooks (6 total: 1 action + 4 charts + 1 activity)');
      logger.info('App', '✅ Dashboard module setup complete', {
        widgetsInjected: 6,
        hooksProvided: 4,
        hooksConsumed: 5,
      });
    } catch (error) {
      logger.error('App', '❌ Dashboard module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Dashboard module');
    // Clean up resources
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================

  /**
   * Public API for other modules
   */
  exports: {
    /**
     * Register a custom widget
     */
    registerWidget: async (widgetConfig: Record<string, unknown>) => {
      logger.debug('App', 'Registering custom widget', { widgetConfig });
      return { success: true };
    },

    /**
     * Get current dashboard layout
     */
    getLayout: async () => {
      logger.debug('App', 'Getting dashboard layout');
      return { layout: [] as Array<Record<string, unknown>> };
    },
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'core',
    description: 'Central dashboard with aggregated metrics and widgets from all modules',
    author: 'G-Admin Team',
    tags: ['dashboard', 'overview', 'metrics', 'widgets'],
    navigation: {
      route: '/admin/dashboard',
      icon: HomeIcon,
      color: 'blue',
      domain: 'core',
      isExpandable: false,
    },
  },
};

/**
 * Default export
 */
export default dashboardManifest;

/**
 * Dashboard module public API types
 */
export interface DashboardAPI {
  registerWidget: (widgetConfig: Record<string, unknown>) => Promise<{ success: boolean }>;
  getLayout: () => Promise<{ layout: Array<Record<string, unknown>> }>;
}
