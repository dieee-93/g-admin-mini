/**
 * AUTOMATED ROUTE ↔ MODULE MAPPING SYSTEM
 * Implementa la solución híbrida: preserva Screaming Architecture + optimiza Developer Experience
 */

// Domain-to-Route mapping automático
import { logger } from '@/lib/logging';

export const domainRouteMap = {
  // Business Operations Domain
  'sales': '/admin/operations/sales',
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
  
  // Gamification Domain
  'gamification': '/admin/gamification',
  
  // Dashboard Domain
  'dashboard': '/admin/dashboard'
} as const;

// Route-to-File mapping automático con types
export const routeToFileMap = {
  // Admin main pages
  '/admin/operations/sales': 'pages/admin/operations/sales/page',
  '/admin/operations/fulfillment/onsite': 'pages/admin/operations/fulfillment/onsite/page',
  '/admin/operations/fulfillment/delivery': 'pages/admin/operations/fulfillment/delivery/page',
  '/admin/operations/production': 'pages/admin/operations/production/page',
  '/admin/customers': 'pages/admin/core/crm/page',
  '/admin/materials': 'pages/admin/supply-chain/materials/page',
  '/admin/products': 'pages/admin/supply-chain/products/page',
  '/admin/fiscal': 'pages/admin/finance/fiscal/page',
  '/admin/staff': 'pages/admin/resources/staff/page',
  '/admin/scheduling': 'pages/admin/resources/scheduling/page',
  '/admin/settings': 'pages/admin/core/settings/page',
  '/admin/gamification/achievements': 'pages/admin/gamification/achievements/page',
  '/admin/debug': 'pages/admin/debug/page',
  '/admin/dashboard': 'pages/admin/core/dashboard/page',

  // Materials sub-views
  '/admin/materials/abc-analysis': 'pages/admin/supply-chain/materials/abc-analysis',
  '/admin/materials/supply-chain': 'pages/admin/supply-chain/materials/supply-chain',
  '/admin/materials/procurement': 'pages/admin/supply-chain/materials/procurement',

  // Settings sub-views
  '/admin/settings/integrations': 'pages/admin/core/settings/integrations',
  '/admin/settings/diagnostics': 'pages/admin/core/settings/diagnostics',
  '/admin/settings/reporting': 'pages/admin/core/settings/reporting',
  '/admin/settings/enterprise': 'pages/admin/core/settings/enterprise',

  // Dashboard sub-views
  '/admin/dashboard/predictive': 'pages/admin/core/dashboard/predictive',

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
  '/admin/operations/sales': 'LazySalesPage',
  '/admin/operations/fulfillment/onsite': 'LazyFulfillmentOnsitePage',
  '/admin/operations/fulfillment/delivery': 'LazyDeliveryPage',
  '/admin/operations/production': 'LazyProductionPage',
  '/admin/customers': 'LazyCustomersPage',
  '/admin/materials': 'LazyStockLab', // StockLab is the branded name
  '/admin/products': 'LazyProductsPage',
  '/admin/fiscal': 'LazyFiscalPage',
  '/admin/staff': 'LazyStaffPage',
  '/admin/scheduling': 'LazySchedulingPage',
  '/admin/settings': 'LazySettingsPage',
  '/admin/gamification/achievements': 'LazyAchievementsGalaxy',
  '/admin/debug': 'LazyDebugPage', // Debug tools (SUPER_ADMIN only, dev mode only)
  '/admin/dashboard': 'Dashboard', // Dashboard not lazy loaded (critical)

  // Sub-views (direct imports)
  '/admin/materials/abc-analysis': 'ABCAnalysisView',
  '/admin/materials/supply-chain': 'LazySupplyChainPage',
  '/admin/materials/procurement': 'LazyProcurementPage',

  '/admin/settings/integrations': 'IntegrationsView',
  '/admin/settings/diagnostics': 'DiagnosticsView',
  '/admin/settings/reporting': 'ReportingView',
  '/admin/settings/enterprise': 'EnterpriseView',

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
  logger.info('App', `Route: ${route}`);
  logger.info('App', `File: ${getFilePathFromRoute(route as RoutePathAdmin)}`);
  logger.info('App', `Component: ${getComponentFromRoute(route as RoutePathAdmin)}`);
  logger.info('App', `Domain: ${getDomainFromRoute(route)}`);
  console.groupEnd();
  
  return getFilePathFromRoute(route as RoutePathAdmin);
}