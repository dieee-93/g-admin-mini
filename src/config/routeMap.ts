/**
 * AUTOMATED ROUTE ↔ MODULE MAPPING SYSTEM
 * Implementa la solución híbrida: preserva Screaming Architecture + optimiza Developer Experience
 */

// Domain-to-Route mapping automático
export const domainRouteMap = {
  // Business Operations Domain
  'sales': '/admin/sales',
  'operations': '/admin/operations', 
  'customers': '/admin/customers',
  
  // Supply Chain Domain
  'materials': '/admin/materials',
  'products': '/admin/products',
  
  // Financial Domain
  'fiscal': '/admin/fiscal',
  
  // Workforce Domain
  'staff': '/admin/staff',
  'scheduling': '/admin/scheduling',
  'settings': '/admin/settings',
  
  // Dashboard Domain
  'dashboard': '/admin/dashboard'
} as const;

// Route-to-File mapping automático con types  
export const routeToFileMap = {
  // Admin main pages
  '/admin/sales': 'pages/admin/sales/page',
  '/admin/operations': 'pages/admin/operations/page',
  '/admin/customers': 'pages/admin/customers/page',
  '/admin/materials': 'pages/admin/materials/page',
  '/admin/products': 'pages/admin/products/page',
  '/admin/fiscal': 'pages/admin/fiscal/page',
  '/admin/staff': 'pages/admin/staff/page',
  '/admin/scheduling': 'pages/admin/scheduling/page',
  '/admin/settings': 'pages/admin/settings/page',
  '/admin/dashboard': 'pages/admin/dashboard/page',

  // Materials sub-views
  '/admin/materials/abc-analysis': 'pages/admin/materials/abc-analysis',
  '/admin/materials/supply-chain': 'pages/admin/materials/supply-chain',
  '/admin/materials/procurement': 'pages/admin/materials/procurement',

  // Settings sub-views
  '/admin/settings/integrations': 'pages/admin/settings/integrations',
  '/admin/settings/diagnostics': 'pages/admin/settings/diagnostics', 
  '/admin/settings/reporting': 'pages/admin/settings/reporting',
  '/admin/settings/enterprise': 'pages/admin/settings/enterprise',
  
  // Operations sub-views
  '/admin/operations/tables': 'pages/admin/operations/tables',

  // Dashboard sub-views
  '/admin/dashboard/predictive': 'pages/admin/dashboard/predictive',

  // Customer App routes
  '/app/portal': 'pages/app/portal',
  '/app/menu': 'pages/app/menu',
  '/app/orders': 'pages/app/orders',
  '/app/settings': 'pages/app/settings',

  // Public routes
  '/': 'pages/public/landing',
  '/admin': 'pages/public/admin-portal',
  '/login': 'pages/public/login',
  '/admin/login': 'pages/public/admin-login'
} as const;

// Component name mapping
export const routeToComponentMap = {
  // Admin main pages (lazy loaded)
  '/admin/sales': 'LazySalesPage',
  '/admin/operations': 'LazyOperationsPage',
  '/admin/customers': 'LazyCustomersPage',
  '/admin/materials': 'LazyStockLab', // StockLab is the branded name
  '/admin/products': 'LazyProductsPage',
  '/admin/fiscal': 'LazyFiscalPage',
  '/admin/staff': 'LazyStaffPage',
  '/admin/scheduling': 'LazySchedulingPage',
  '/admin/settings': 'LazySettingsPage',
  '/admin/debug/theme-test': 'LazyThemeTestPage',
  '/admin/dashboard': 'Dashboard', // Dashboard not lazy loaded (critical)

  // Sub-views (direct imports)
  '/admin/materials/abc-analysis': 'ABCAnalysisView',
  '/admin/materials/supply-chain': 'LazySupplyChainPage',
  '/admin/materials/procurement': 'LazyProcurementPage',

  '/admin/settings/integrations': 'IntegrationsView',
  '/admin/settings/diagnostics': 'DiagnosticsView',
  '/admin/settings/reporting': 'ReportingView',
  '/admin/settings/enterprise': 'EnterpriseView',

  '/admin/operations/tables': 'TableManagementView',
  '/admin/dashboard/predictive': 'PredictiveAnalyticsView',

  // Customer App (direct imports)
  '/app/portal': 'CustomerPortal',
  '/app/menu': 'CustomerMenu',
  '/app/orders': 'MyOrders',
  '/app/settings': 'CustomerSettings',

  // Public (direct imports)
  '/': 'LandingPage',
  '/admin': 'AdminPortalPage',
  '/login': 'CustomerLoginPage',
  '/admin/login': 'AdminLoginPage'
} as const;

// Types for type safety
export type DomainKey = keyof typeof domainRouteMap;
export type RoutePathAdmin = keyof typeof routeToFileMap;
export type ComponentName = typeof routeToComponentMap[RoutePathAdmin];

// Utility functions
export function getFilePathFromRoute(route: RoutePathAdmin): string {
  return routeToFileMap[route];
}

export function getComponentFromRoute(route: RoutePathAdmin): ComponentName {
  return routeToComponentMap[route];
}

export function getDomainFromRoute(route: string): DomainKey | null {
  const segments = route.split('/');
  const domain = segments[2]; // /admin/[domain]
  
  if (domain && domain in domainRouteMap) {
    return domain as DomainKey;
  }
  
  return null;
}

export function getRouteFromDomain(domain: DomainKey): string {
  return domainRouteMap[domain];
}

// Developer Experience helpers
export function findModuleByRoute(route: string): string {
  console.group(`🔍 Route Mapping Debug`);
  console.log(`Route: ${route}`);
  console.log(`File: ${getFilePathFromRoute(route as RoutePathAdmin)}`);
  console.log(`Component: ${getComponentFromRoute(route as RoutePathAdmin)}`);
  console.log(`Domain: ${getDomainFromRoute(route)}`);
  console.groupEnd();
  
  return getFilePathFromRoute(route as RoutePathAdmin);
}