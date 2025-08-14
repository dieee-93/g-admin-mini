// LazyModules.ts - Lazy-loaded module definitions with intelligent preloading
// Provides optimized code splitting for all major G-Admin Mini modules

import { createLazyComponent } from '@/lib/performance/LazyLoadingManager';

// Lazy-loaded Sales Module
export const LazySalesPage = createLazyComponent(
  () => import('../sales/SalesPage'),
  'sales',
  {
    chunkName: 'sales-module',
    preload: true, // High-priority module for POS system
    priority: 'high',
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Operations Module (includes Kitchen, Tables, Planning, Monitoring)
export const LazyOperationsPage = createLazyComponent(
  () => import('@/modules/operations/OperationsPage'),
  'operations',
  {
    chunkName: 'operations-module',
    preload: false, // Load on demand
    priority: 'high', // Critical for restaurant operations
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Materials/Inventory Module
export const LazyMaterialsPage = createLazyComponent(
  () => import('../materials/MaterialsPage'),
  'materials',
  {
    chunkName: 'materials-module', 
    preload: false,
    priority: 'medium',
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Staff Module
export const LazyStaffPage = createLazyComponent(
  () => import('../staff/StaffPage'),
  'staff',
  {
    chunkName: 'staff-module',
    preload: false,
    priority: 'low', // Less frequently accessed
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Customers Module
export const LazyCustomersPage = createLazyComponent(
  () => import('../customers/CustomersPage'),
  'customers',
  {
    chunkName: 'customers-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// Lazy-loaded Scheduling Module
export const LazySchedulingPage = createLazyComponent(
  () => import('../scheduling/SchedulingPage'),
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

// Lazy-loaded Fiscal Module (TIER 1 - Critical)
export const LazyFiscalPage = createLazyComponent(
  () => import('../fiscal/FiscalPage'),
  'fiscal',
  {
    chunkName: 'fiscal-module',
    preload: false,
    priority: 'high', // Critical for compliance and invoicing
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Products Module
export const LazyProductsPage = createLazyComponent(
  () => import('../products/ProductsPage'),
  'products',
  {
    chunkName: 'products-module',
    preload: false,
    priority: 'medium',
    cacheStrategy: 'both'
  }
);

// Lazy-loaded Settings Module
export const LazySettingsPage = createLazyComponent(
  () => import('../settings/SettingsPage'),
  'settings',
  {
    chunkName: 'settings-module',
    preload: false,
    priority: 'low',
    cacheStrategy: 'memory'
  }
);

// Module preloading configuration based on usage patterns
export const modulePreloadingConfig = {
  // When user is on dashboard, preload high-usage modules
  dashboard: [
    { module: 'sales', priority: 'high' as const },
    { module: 'operations', priority: 'high' as const },
    { module: 'fiscal', priority: 'high' as const },
    { module: 'materials', priority: 'medium' as const }
  ],
  
  // When user is on sales, preload related modules
  sales: [
    { module: 'operations', priority: 'high' as const },
    { module: 'fiscal', priority: 'high' as const },
    { module: 'materials', priority: 'medium' as const },
    { module: 'customers', priority: 'low' as const }
  ],
  
  // When user is on operations, preload related modules
  operations: [
    { module: 'sales', priority: 'high' as const },
    { module: 'materials', priority: 'medium' as const }
  ],
  
  // When user is on materials, preload related modules
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
  
  // When user is on fiscal, preload related modules
  fiscal: [
    { module: 'sales', priority: 'high' as const },
    { module: 'settings', priority: 'medium' as const }
  ]
};

// Module metadata for performance tracking
export const moduleMetadata = {
  sales: {
    estimatedSize: '~180KB',
    dependencies: ['offline', 'websocket', 'events'],
    criticality: 'high',
    description: 'Point of Sale system with offline capabilities'
  },
  operations: {
    estimatedSize: '~200KB',
    dependencies: ['websocket', 'events', 'offline'],
    criticality: 'high',
    description: 'Operations hub: Kitchen, Tables, Planning, and Monitoring'
  },
  materials: {
    estimatedSize: '~140KB',
    dependencies: ['offline', 'websocket'],
    criticality: 'medium',
    description: 'Inventory and materials management'
  },
  staff: {
    estimatedSize: '~120KB',
    dependencies: ['offline'],
    criticality: 'medium', 
    description: 'Staff management and time tracking'
  },
  customers: {
    estimatedSize: '~100KB',
    dependencies: ['offline'],
    criticality: 'low',
    description: 'Customer relationship management'
  },
  scheduling: {
    estimatedSize: '~110KB',
    dependencies: ['events'],
    criticality: 'low',
    description: 'Staff scheduling and shift management'
  },
  fiscal: {
    estimatedSize: '~160KB',
    dependencies: ['offline', 'events'],
    criticality: 'high',
    description: 'Fiscal compliance, invoicing, and AFIP integration'
  },
  products: {
    estimatedSize: '~150KB',
    dependencies: ['offline', 'events'],
    criticality: 'medium',
    description: 'Product catalog, menu engineering, and production planning'
  },
  settings: {
    estimatedSize: '~90KB',
    dependencies: [],
    criticality: 'low',
    description: 'Application settings and configuration'
  }
};

// Export all lazy modules
export const lazyModules = {
  LazySalesPage,
  LazyOperationsPage,
  LazyMaterialsPage,
  LazyProductsPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage
};

export default lazyModules;