// LazyModules.ts - Lazy-loaded page definitions with intelligent preloading
// Provides optimized code splitting for all major G-Admin Mini pages
// 🎯 POST-MIGRATION: All references updated from modules/ to pages/ structure

import { createLazyComponent } from '@/lib/performance/LazyLoadingManager';

// Lazy-loaded Setup Wizard (pages/setup/SetupWizard.tsx)
export const LazySetupWizard = createLazyComponent(
  () => import('../../pages/setup/SetupWizard').then(module => ({ default: module.SetupWizard })),
  'setup',
  {
    chunkName: 'setup-wizard',
    preload: false, // Only load when needed
    priority: 'high', // Important for first-time setup
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Sales Page (pages/admin/operations/sales/page.tsx)
export const LazySalesPage = createLazyComponent(
  () => import('../../pages/admin/operations/sales/page'),
  'sales',
  {
    chunkName: 'sales-module',
    preload: true, // High-priority page for POS system
    priority: 'high',
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Operations Page (pages/admin/operations/hub/page.tsx)
export const LazyOperationsPage = createLazyComponent(
  () => import('../../pages/admin/operations/hub/page'),
  'operations',
  {
    chunkName: 'operations-module',
    preload: false, // Load on demand
    priority: 'high', // Critical for restaurant operations
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Materials Page (pages/admin/supply-chain/materials/page.tsx)
export const LazyMaterialsPage = createLazyComponent(
  () => import('../../pages/admin/supply-chain/materials/page'),
  'materials',
  {
    chunkName: 'materials-module', 
    preload: false,
    priority: 'medium',
    cacheStrategy: 'both'
  }
);

// Legacy alias - use LazyMaterialsPage instead
export const LazyStockLab = LazyMaterialsPage;

// Lazy-loaded Staff Page (pages/admin/resources/staff/page.tsx)
export const LazyStaffPage = createLazyComponent(
  () => import('../../pages/admin/resources/staff/page'),
  'staff',
  {
    chunkName: 'staff-module',
    preload: false,
    priority: 'low', // Less frequently accessed
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Customers Page (pages/admin/core/crm/page.tsx)
export const LazyCustomersPage = createLazyComponent(
  () => import('../../pages/admin/core/crm/customers/page'),
  'customers',
  {
    chunkName: 'customers-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Scheduling Page (pages/admin/resources/scheduling/page.tsx)
export const LazySchedulingPage = createLazyComponent(
  () => import('../../pages/admin/resources/scheduling/page'),
  'scheduling',
  {
    chunkName: 'scheduling-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// NOTE: Recipes functionality migrated to services/recipe and dashboard
// LazyRecipesPage removed - use RecipeForm from services/recipe instead

// Lazy-loaded Fiscal Page (pages/admin/finance/fiscal/page.tsx)
export const LazyFiscalPage = createLazyComponent(
  () => import('../../pages/admin/finance/fiscal/page'),
  'fiscal',
  {
    chunkName: 'fiscal-module',
    preload: false,
    priority: 'high', // Critical for compliance and invoicing
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Products Page (pages/admin/supply-chain/products/page.tsx)
export const LazyProductsPage = createLazyComponent(
  () => import('../../pages/admin/supply-chain/products/page'),
  'products',
  {
    chunkName: 'products-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Settings Page (pages/admin/core/settings/page.tsx)
export const LazySettingsPage = createLazyComponent(
  () => import('../../pages/admin/core/settings/page'),
  'settings',
  {
    chunkName: 'settings-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyThemeTestPage = createLazyComponent(
  () => import('../../pages/ThemeTestPage'),
  'debug',
  {
    chunkName: 'debug-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// 🛠️ DEBUG TOOLS - Development only
export const LazyDebugDashboard = createLazyComponent(
  () => import('../../pages/debug/index'),
  'debug-dashboard',
  {
    chunkName: 'debug-dashboard',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyCapabilitiesDebug = createLazyComponent(
  () => import('../../pages/debug/capabilities/index'),
  'capabilities-debug',
  {
    chunkName: 'capabilities-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyThemeDebug = createLazyComponent(
  () => import('../../pages/debug/theme/index'),
  'theme-debug',
  {
    chunkName: 'theme-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyStoresDebug = createLazyComponent(
  () => import('../../pages/debug/stores/index'),
  'stores-debug',
  {
    chunkName: 'stores-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyApiDebug = createLazyComponent(
  () => import('../../pages/debug/api/index'),
  'api-debug',
  {
    chunkName: 'api-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyPerformanceDebug = createLazyComponent(
  () => import('../../pages/debug/performance/index'),
  'performance-debug',
  {
    chunkName: 'performance-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyNavigationDebug = createLazyComponent(
  () => import('../../pages/debug/navigation/index'),
  'navigation-debug',
  {
    chunkName: 'navigation-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyComponentsDebug = createLazyComponent(
  () => import('../../pages/debug/components/index'),
  'components-debug',
  {
    chunkName: 'components-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazySlotsDebug = createLazyComponent(
  () => import('../../pages/debug/slots/index'),
  'slots-debug',
  {
    chunkName: 'slots-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

export const LazyBundleDebug = createLazyComponent(
  () => import('../../pages/debug/bundle/index'),
  'bundle-debug',
  {
    chunkName: 'bundle-debug',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// Materials Sub-Pages (pages/admin/supply-chain/materials/*)
export const LazySupplyChainPage = createLazyComponent(
  () => import('../../pages/admin/supply-chain/materials/components/Procurement').then(module => ({
    default: module.SupplyChainAnalysis
  })),
  'supply-chain',
  {
    chunkName: 'supply-chain-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'memory'
  }
);

export const LazyProcurementPage = createLazyComponent(
  () => import('../../pages/admin/supply-chain/materials/components/Procurement/ProcurementRecommendationsTab'),
  'procurement',
  {
    chunkName: 'procurement-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'memory'
  }
);

// ✅ NEW PHASE 4 & 5 MODULES - Missing lazy loaders added

// Lazy-loaded Gamification Page (pages/admin/gamification/achievements/page.tsx)
export const LazyGamificationPage = createLazyComponent(
  () => import('../../pages/admin/gamification/achievements/page'),
  'gamification',
  {
    chunkName: 'gamification-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Executive Dashboard Page (pages/admin/executive/dashboards/page.tsx)
export const LazyExecutivePage = createLazyComponent(
  () => import('../../pages/admin/executive/dashboards/page'),
  'executive',
  {
    chunkName: 'executive-module',
    preload: false,
    priority: 'high', // Critical for C-Suite analytics
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Finance Billing Page (pages/admin/finance/billing/page.tsx)
export const LazyBillingPage = createLazyComponent(
  () => import('../../pages/admin/finance/billing/page'),
  'billing',
  {
    chunkName: 'billing-module',
    preload: false,
    priority: 'high', // Critical for recurring revenue
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Finance Integrations Page (pages/admin/finance/integrations/page.tsx)
export const LazyIntegrationsPage = createLazyComponent(
  () => import('../../pages/admin/finance/integrations/page'),
  'integrations',
  {
    chunkName: 'integrations-module',
    preload: false,
    priority: 'medium', // Important for Argentina payment ecosystem
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Memberships Page (pages/admin/operations/memberships/page.tsx)
export const LazyMembershipsPage = createLazyComponent(
  () => import('../../pages/admin/operations/memberships/page'),
  'memberships',
  {
    chunkName: 'memberships-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Rentals Page (pages/admin/operations/rentals/page.tsx)
export const LazyRentalsPage = createLazyComponent(
  () => import('../../pages/admin/operations/rentals/page'),
  'rentals',
  {
    chunkName: 'rentals-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Assets Page (pages/admin/operations/assets/page.tsx)
export const LazyAssetsPage = createLazyComponent(
  () => import('../../pages/admin/operations/assets/page'),
  'assets',
  {
    chunkName: 'assets-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Advanced Reporting Page (pages/admin/tools/reporting/page.tsx)
export const LazyReportingPage = createLazyComponent(
  () => import('../../pages/admin/tools/reporting/page'),
  'reporting',
  {
    chunkName: 'reporting-module',
    preload: false,
    priority: 'high', // Critical for business intelligence
    cacheStrategy: 'both'
  }
);

// Page preloading configuration based on usage patterns
export const modulePreloadingConfig = {
  // When user is on dashboard, preload high-usage pages
  dashboard: [
    { module: 'sales', priority: 'high' as const },
    { module: 'operations', priority: 'high' as const },
    { module: 'fiscal', priority: 'high' as const },
    { module: 'materials', priority: 'medium' as const }
  ],
  
  // When user is on sales, preload related pages
  sales: [
    { module: 'operations', priority: 'high' as const },
    { module: 'fiscal', priority: 'high' as const },
    { module: 'materials', priority: 'medium' as const },
    { module: 'customers', priority: 'low' as const }
  ],
  
  // When user is on operations, preload related pages
  operations: [
    { module: 'sales', priority: 'high' as const },
    { module: 'materials', priority: 'medium' as const }
  ],
  
  // When user is on materials, preload related pages
  materials: [
    { module: 'sales', priority: 'high' as const },
    { module: 'operations', priority: 'medium' as const }
  ],
  
  // When user is on staff, preload scheduling
  staff: [
    { module: 'scheduling', priority: 'high' as const }
  ],
  
  // When user is on customers, preload sales
  customers: [
    { module: 'sales', priority: 'high' as const }
  ],
  
  // When user is on fiscal, preload related pages
  fiscal: [
    { module: 'sales', priority: 'high' as const },
    { module: 'settings', priority: 'medium' as const }
  ]
};

// Page metadata for performance tracking
export const moduleMetadata = {
  sales: {
    estimatedSize: '~180KB',
    dependencies: ['offline', 'websocket', 'events'] as const,
    criticality: 'high' as const,
    description: 'Point of Sale system with offline capabilities'
  },
  operations: {
    estimatedSize: '~200KB',
    dependencies: ['websocket', 'events', 'offline'] as const,
    criticality: 'high' as const,
    description: 'Operations hub: Kitchen, Tables, Planning, and Monitoring'
  },
  materials: {
    estimatedSize: '~140KB',
    dependencies: ['offline', 'websocket'] as const,
    criticality: 'medium' as const,
    description: 'Inventory and materials management'
  },
  staff: {
    estimatedSize: '~120KB',
    dependencies: ['offline'] as const,
    criticality: 'medium' as const, 
    description: 'Staff management and time tracking'
  },
  customers: {
    estimatedSize: '~100KB',
    dependencies: ['offline'] as const,
    criticality: 'low' as const,
    description: 'Customer relationship management'
  },
  scheduling: {
    estimatedSize: '~110KB',
    dependencies: ['events'] as const,
    criticality: 'low' as const,
    description: 'Staff scheduling and shift management'
  },
  fiscal: {
    estimatedSize: '~160KB',
    dependencies: ['offline', 'events'] as const,
    criticality: 'high' as const,
    description: 'Fiscal compliance, invoicing, and AFIP integration'
  },
  products: {
    estimatedSize: '~150KB',
    dependencies: ['offline', 'events'] as const,
    criticality: 'medium' as const,
    description: 'Product catalog, menu engineering, and production planning'
  },
  settings: {
    estimatedSize: '~90KB',
    dependencies: [] as const,
    criticality: 'low' as const,
    description: 'Application settings and configuration'
  },
  debug: {
    estimatedSize: '~15KB',
    dependencies: [] as const,
    criticality: 'dev' as const,
    description: 'Development and debugging tools'
  }
};

// Export all lazy pages
export const lazyModules = {
  LazySalesPage,
  LazyOperationsPage,
  LazyMaterialsPage,
  LazyStockLab,
  LazyProductsPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage,
  LazyThemeTestPage,
  LazySupplyChainPage,
  LazyProcurementPage,
  // ✅ NEW PHASE 4 & 5 MODULES
  LazyGamificationPage,
  LazyExecutivePage,
  LazyBillingPage,
  LazyIntegrationsPage,
  LazyMembershipsPage,
  LazyRentalsPage,
  LazyAssetsPage,
  LazyReportingPage
};

export default lazyModules;