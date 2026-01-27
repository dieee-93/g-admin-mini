/**
 * LAZY COMPONENT DEFINITIONS
 * Centralized lazy loading for better code organization
 */
import * as React from 'react';
import { lazy, Suspense } from 'react';
import { ModuleSkeleton } from '@/shared/components/ModuleSkeleton';

// Wrapper for lazy components with Suspense
export function withSuspense(Component: React.LazyExoticComponent<React.ComponentType<any>>) {
  return (
    <Suspense fallback={<ModuleSkeleton />}>
      <Component />
    </Suspense>
  );
}

// ============================================
// CORE ADMIN PAGES
// ============================================
export const LazyDashboardPage = React.lazy(() => import('@/pages/admin/core/dashboard/page'));
export const LazyCustomReporting = React.lazy(() => import('@/pages/admin/core/reporting/page'));
export const LazyCompetitiveIntelligence = React.lazy(() => import('@/pages/admin/core/intelligence/page'));
export const LazySetupWizard = React.lazy(() => import('@/pages/setup/SetupWizard').then(m => ({ default: m.SetupWizard })));
export const LazyCustomersPage = React.lazy(() => import('@/pages/admin/core/crm/page'));

// ============================================
// OPERATIONS
// ============================================
export const LazySalesPage = React.lazy(() => import('@/pages/admin/operations/sales/page'));
export const LazyFulfillmentOnsitePage = React.lazy(() => import('@/pages/admin/operations/fulfillment/onsite/page'));
export const LazyProductionPage = React.lazy(() => import('@/pages/admin/operations/production/page'));
export const LazyDeliveryPage = React.lazy(() => import('@/pages/admin/operations/delivery/page'));
export const LazyMembershipsPage = React.lazy(() => import('@/pages/admin/operations/memberships/page'));
export const LazyRentalsPage = React.lazy(() => import('@/pages/admin/operations/rentals/page'));

// ============================================
// SUPPLY CHAIN
// ============================================
export const LazyStockLab = React.lazy(() => import('@/pages/admin/supply-chain/materials/page'));
export const LazyProductsPage = React.lazy(() => import('@/pages/admin/supply-chain/products/page'));
export const LazyProductFormPage = React.lazy(() => import('@/pages/admin/supply-chain/products/ProductFormPage'));
export const LazySuppliersPage = React.lazy(() => import('@/pages/admin/supply-chain/suppliers/page'));
export const LazyAssetsPage = React.lazy(() => import('@/pages/admin/supply-chain/assets/page'));

// Supply Chain Sub-modules
export const LazyABCAnalysisView = lazy(() =>
  import('@/pages/admin/supply-chain/materials/components/Analytics').then(m => ({ default: m.ABCAnalysisSection }))
);

// ============================================
// WORKFORCE (RESOURCES)
// ============================================
export const LazyStaffPage = React.lazy(() => import('@/pages/admin/resources/team/page'));
export const LazySchedulingPage = React.lazy(() => import('@/pages/admin/resources/scheduling/page'));

// ============================================
// FINANCE
// ============================================
export const LazyFiscalPage = React.lazy(() => import('@/pages/admin/finance/fiscal/page'));
export const LazyBillingPage = React.lazy(() => import('@/pages/admin/finance/billing/page'));
export const LazyIntegrationsPage = React.lazy(() => import('@/pages/admin/finance/integrations/page'));

// ============================================
// SETTINGS
// ============================================
export const LazySettingsPage = React.lazy(() => import('@/pages/admin/core/settings/page'));

// Settings Sub-pages
export const LazyHoursPage = React.lazy(() => import('@/pages/admin/core/settings/pages/hours/page'));
export const LazyBusinessPage = React.lazy(() => import('@/pages/admin/core/settings/pages/business/page'));
export const LazyPaymentMethodsPage = React.lazy(() => import('@/pages/admin/core/settings/pages/payment-methods/page'));

export const LazyDiagnosticsView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.DiagnosticsView }))
);
export const LazyReportingView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.ReportingView }))
);
export const LazyEnterpriseView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.EnterpriseView }))
);
export const LazyIntegrationsView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.IntegrationsView }))
);

// ============================================
// GAMIFICATION & EXECUTIVE
// ============================================
export const LazyGamificationPage = React.lazy(() => import('@/pages/admin/gamification/achievements/page'));
export const LazyExecutivePage = React.lazy(() => import('@/pages/admin/executive/page'));
export const LazyReportingPage = React.lazy(() => import('@/pages/admin/tools/reporting/page'));

// ============================================
// DEBUG TOOLS (Development only)
// ============================================
export const LazyDebugDashboard = React.lazy(() => import('@/pages/admin/debug/page'));
export const LazyCapabilitiesDebug = React.lazy(() => import('@/pages/admin/debug/capabilities/page'));
export const LazyThemeDebug = React.lazy(() => import('@/pages/admin/debug/theme/page'));
export const LazyStoresDebug = React.lazy(() => import('@/pages/admin/debug/stores/page'));
export const LazyApiDebug = React.lazy(() => import('@/pages/admin/debug/api/page'));
export const LazyPerformanceDebug = React.lazy(() => import('@/pages/admin/debug/performance/page'));
export const LazyNavigationDebug = React.lazy(() => import('@/pages/admin/debug/navigation/page'));
export const LazyComponentsDebug = React.lazy(() => import('@/pages/admin/debug/components/page'));
export const LazyBundleDebug = React.lazy(() => import('@/pages/admin/debug/bundle/page'));
export const LazyFeatureUIMappingDebug = React.lazy(() => import('@/pages/admin/debug/feature-ui-mapping'));

// ============================================
// CUSTOMER APP
// ============================================
export const LazyCustomerPortal = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.CustomerPortal }))
);
export const LazyCustomerMenu = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.CustomerMenu }))
);
export const LazyMyOrders = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.MyOrders }))
);
export const LazyCustomerSettings = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.CustomerSettings }))
);
export const LazyBookingPage = lazy(() => import('@/pages/app/booking/page'));
export const LazyAppointmentsPage = lazy(() => import('@/pages/app/appointments/page'));
export const LazyCatalogPage = lazy(() => import('@/pages/app/catalog/page'));
export const LazyCartPage = lazy(() => import('@/pages/app/cart/page'));
export const LazyCheckoutPage = lazy(() => import('@/pages/app/checkout/page'));
