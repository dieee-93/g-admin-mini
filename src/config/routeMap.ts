/**
 * AUTOMATED ROUTE ↔ MODULE MAPPING SYSTEM
 * Implementa la solución híbrida: preserva Screaming Architecture + optimiza Developer Experience
 */

// Domain-to-Route mapping automático
import { logger } from '@/lib/logging';

export const domainRouteMap = {
  // Core Domain
  'dashboard': '/admin/dashboard',
  'reporting': '/admin/reporting',
  'intelligence': '/admin/intelligence',

  // Business Operations Domain
  'sales': '/admin/operations/sales',
  'operations': '/admin/operations',
  'customers': '/admin/customers',
  'production': '/admin/operations/production',
  'delivery': '/admin/operations/delivery',
  'memberships': '/admin/operations/memberships',
  'rentals': '/admin/operations/rentals',

  // Supply Chain Domain
  'materials': '/admin/supply-chain/materials',
  'products': '/admin/supply-chain/products',
  'recipes': '/admin/supply-chain/recipes',
  'suppliers': '/admin/supply-chain/suppliers',
  'assets': '/admin/supply-chain/assets',

  // Financial Domain
  'fiscal': '/admin/finance/fiscal',
  'billing': '/admin/finance/billing',
  'integrations': '/admin/finance/integrations',
  'cash': '/admin/finance/cash',

  // Workforce Domain
  'staff': '/admin/resources/team',
  'scheduling': '/admin/resources/scheduling',

  // Tools & Settings
  'settings': '/admin/settings',
  'tools': '/admin/tools',

  // Gamification Domain
  'gamification': '/admin/gamification',

  // Executive Domain
  'executive': '/admin/executive'
} as const;

// Route-to-File mapping automático con types
export const routeToFileMap = {
  // Public routes
  '/': 'pages/public/landing',
  '/login': 'pages/public/login',
  '/admin': 'pages/public/admin-portal',
  '/admin/login': 'pages/public/admin-login',
  '/setup': 'pages/setup/SetupWizard',

  // Admin Core
  '/admin/dashboard': 'pages/admin/core/dashboard/page',
  '/admin/dashboard/cross-analytics': 'pages/admin/core/dashboard/cross-analytics',
  '/admin/reporting': 'pages/admin/core/reporting/page',
  '/admin/intelligence': 'pages/admin/core/intelligence/page',
  '/admin/customers': 'pages/admin/core/crm/page',

  // Operations
  '/admin/operations/sales': 'pages/admin/operations/sales/page',
  '/admin/operations/fulfillment/onsite': 'pages/admin/operations/fulfillment/onsite/page',
  '/admin/operations/production': 'pages/admin/operations/production/page',
  '/admin/operations/delivery': 'pages/admin/operations/delivery/page',
  '/admin/operations/fulfillment/delivery': 'pages/admin/operations/fulfillment/delivery/page',
  '/admin/operations/memberships/*': 'pages/admin/operations/memberships/page',
  '/admin/operations/rentals/*': 'pages/admin/operations/rentals/page',

  // Supply Chain
  '/admin/supply-chain/materials': 'pages/admin/supply-chain/materials/page',

  '/admin/materials/abc-analysis': 'pages/admin/supply-chain/materials/abc-analysis',
  '/admin/materials/supply-chain': 'pages/admin/supply-chain/materials/supply-chain',
  '/admin/materials/procurement': 'pages/admin/supply-chain/materials/procurement',
  '/admin/materials/predictive-analytics': 'pages/admin/supply-chain/materials/predictive-analytics',
  '/admin/supply-chain/products': 'pages/admin/supply-chain/products/page',
  '/admin/supply-chain/products/new': 'pages/admin/supply-chain/products/ProductFormPage',
  '/admin/supply-chain/products/:id/edit': 'pages/admin/supply-chain/products/ProductFormPage',
  '/admin/supply-chain/products/:id/view': 'pages/admin/supply-chain/products/ProductFormPage',
  '/admin/supply-chain/recipes': 'pages/admin/supply-chain/recipes/page',
  '/admin/supply-chain/suppliers': 'pages/admin/supply-chain/suppliers/page',
  '/admin/supply-chain/assets': 'pages/admin/supply-chain/assets/page',

  // Finance
  '/admin/finance/fiscal': 'pages/admin/finance/fiscal/page',
  '/admin/finance/billing/*': 'pages/admin/finance/billing/page',
  '/admin/finance/integrations/*': 'pages/admin/finance/integrations/page',
  '/admin/finance/cash': 'pages/admin/finance/cash/page',

  // Resources
  '/admin/resources/team': 'pages/admin/resources/team/page',
  '/admin/resources/scheduling': 'pages/admin/resources/scheduling/page',

  // Gamification & Executive
  '/admin/gamification/*': 'pages/admin/gamification/page',
  '/admin/executive/*': 'pages/admin/executive/page',

  // Tools
  '/admin/tools/reporting/*': 'pages/admin/tools/reporting/page',

  // Settings
  '/admin/settings': 'pages/admin/core/settings/page',
  '/admin/settings/business': 'pages/admin/core/settings/pages/business/page',
  '/admin/settings/hours': 'pages/admin/core/settings/pages/hours/page',
  '/admin/settings/payment-methods': 'pages/admin/core/settings/pages/payment-methods/page',

  '/admin/settings/integrations': 'pages/admin/core/settings/integrations',
  '/admin/settings/diagnostics': 'pages/admin/core/settings/diagnostics',
  '/admin/settings/reporting': 'pages/admin/core/settings/reporting',
  '/admin/settings/enterprise': 'pages/admin/core/settings/enterprise',

  // Debug routes
  '/debug': 'pages/debug/dashboard',
  '/debug/capabilities': 'pages/debug/capabilities',
  '/debug/feature-ui-mapping': 'pages/debug/feature-ui-mapping',
  '/debug/theme': 'pages/debug/theme',
  '/debug/stores': 'pages/debug/stores',
  '/debug/api': 'pages/debug/api',
  '/debug/performance': 'pages/debug/performance',
  '/debug/navigation': 'pages/debug/navigation',
  '/debug/components': 'pages/debug/components',
  '/debug/bundle': 'pages/debug/bundle',
  '/debug/slots': 'pages/debug/slots',
  '/admin/debug/theme-test': 'pages/admin/debug/theme-test',

  // Customer App routes
  '/app/portal': 'pages/app/portal',
  '/app/menu': 'pages/app/menu',
  '/app/orders': 'pages/app/orders',
  '/app/settings': 'pages/app/settings',
  '/app/booking': 'pages/app/booking',
  '/app/appointments': 'pages/app/appointments',
  '/app/catalog': 'pages/app/catalog',
  '/app/cart': 'pages/app/cart',
  '/app/checkout': 'pages/app/checkout'
} as const;

// Component name mapping
export const routeToComponentMap = {
  // Public routes
  '/': 'LandingPage',
  '/login': 'CustomerLoginPage',
  '/admin': 'AdminPortalPage',
  '/admin/login': 'AdminLoginPage',
  '/setup': 'LazySetupWizard',

  // Admin Core
  '/admin/dashboard': 'LazyDashboardPage',
  '/admin/dashboard/cross-analytics': 'LazyCrossAnalytics',
  '/admin/reporting': 'LazyCustomReporting',
  '/admin/intelligence': 'LazyCompetitiveIntelligence',
  '/admin/customers': 'LazyCustomersPage',

  // Operations
  '/admin/operations/sales': 'LazySalesPage',
  '/admin/operations/fulfillment/onsite': 'LazyFulfillmentOnsitePage',
  '/admin/operations/production': 'LazyProductionPage',
  '/admin/operations/delivery': 'LazyDeliveryPage',
  '/admin/operations/fulfillment/delivery': 'LazyDeliveryPage',
  '/admin/operations/memberships/*': 'LazyMembershipsPage',
  '/admin/operations/rentals/*': 'LazyRentalsPage',

  // Supply Chain
  '/admin/supply-chain/materials': 'LazyStockLab',

  '/admin/materials/abc-analysis': 'LazyABCAnalysis',
  '/admin/materials/supply-chain': 'LazySupplyChainView',
  '/admin/materials/procurement': 'LazyProcurementPage',
  '/admin/materials/predictive-analytics': 'LazyPredictiveAnalytics',
  '/admin/supply-chain/products': 'LazyProductsPage',
  '/admin/supply-chain/products/new': 'LazyProductFormPage',
  '/admin/supply-chain/products/:id/edit': 'LazyProductFormPage',
  '/admin/supply-chain/products/:id/view': 'LazyProductFormPage',
  '/admin/supply-chain/suppliers': 'LazySuppliersPage',
  '/admin/supply-chain/assets': 'LazyAssetsPage',

  // Finance
  '/admin/finance/fiscal': 'LazyFiscalPage',
  '/admin/finance/billing/*': 'LazyBillingPage',
  '/admin/finance/integrations/*': 'LazyIntegrationsPage',
  '/admin/finance/cash': 'LazyCashPage',

  // Resources
  '/admin/resources/team': 'LazyStaffPage',
  '/admin/resources/scheduling': 'LazySchedulingPage',

  // Gamification & Executive
  '/admin/gamification/*': 'LazyGamificationPage',
  '/admin/executive/*': 'LazyExecutivePage',

  // Tools
  '/admin/tools/reporting/*': 'LazyReportingPage',

  // Settings
  '/admin/settings': 'LazySettingsPage',
  '/admin/settings/business': 'LazyBusinessPage',
  '/admin/settings/hours': 'LazyHoursPage',
  '/admin/settings/payment-methods': 'LazyPaymentMethodsPage',

  '/admin/settings/integrations': 'LazySettingsIntegrations',
  '/admin/settings/diagnostics': 'LazySettingsDiagnostics',
  '/admin/settings/reporting': 'LazySettingsReporting',
  '/admin/settings/enterprise': 'LazySettingsEnterprise',

  // Debug routes
  '/debug': 'LazyDebugDashboard',
  '/debug/capabilities': 'LazyCapabilitiesDebug',
  '/debug/feature-ui-mapping': 'LazyFeatureUIMapping',
  '/debug/theme': 'LazyThemeDebug',
  '/debug/stores': 'LazyStoresDebug',
  '/debug/api': 'LazyApiDebug',
  '/debug/performance': 'LazyPerformanceDebug',
  '/debug/navigation': 'LazyNavigationDebug',
  '/debug/components': 'LazyComponentsDebug',
  '/debug/bundle': 'LazyBundleDebug',
  '/debug/slots': 'LazySlotsDebug',
  '/admin/debug/theme-test': 'LazyThemeTest',

  // Customer App routes
  '/app/portal': 'CustomerPortal',
  '/app/menu': 'CustomerMenu',
  '/app/orders': 'MyOrders',
  '/app/settings': 'CustomerSettings',
  '/app/booking': 'BookingPage',
  '/app/appointments': 'AppointmentsPage',
  '/app/catalog': 'CatalogPage',
  '/app/cart': 'CartPage',
  '/app/checkout': 'CheckoutPage'
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