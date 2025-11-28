// App.tsx - NUEVA ARQUITECTURA DE RUTAS - Clean and organized routing
import * as React from 'react';
import { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/shared/ui';
import { NavigationProvider } from '@/contexts/NavigationContext';
// ResponsiveLayout is used internally by AdminLayout/CustomerLayout
import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { ErrorBoundaryWrapper } from '@/lib/error-handling';
import { LazyWithErrorBoundary } from '@/shared/components';
import { useRouteBasedPreloading } from '@/hooks/useRouteBasedPreloading';
import { useOperationalLockWatcher } from '@/hooks/useOperationalLockWatcher';
import { PerformanceProvider, initializePerformanceSystem } from '@/lib/performance';

// 🚨 SISTEMA UNIFICADO DE ALERTAS
import { AlertsProvider, AutoGlobalAlertsDisplay, NotificationCenter } from '@/shared/alerts';

// 🔐 SISTEMA DE AUTENTICACIÓN
import { RoleGuard, DashboardRoleRouter, PublicOnlyRoute } from '@/components/auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRouteNew } from '@/components/auth/ProtectedRouteNew';

// 🏢 MULTI-LOCATION SYSTEM
import { LocationProvider } from '@/contexts/LocationContext';

// 🆕 PÁGINAS - LOGIN DUAL SYSTEM
import {
  LandingPage,
  CustomerLoginPage,
  AdminLoginPage,
  AdminPortalPage
} from '@/pages/public';

// 📱 SISTEMA OFFLINE-FIRST
import { initializeOffline, OfflineMonitorProvider } from '@/lib/offline';

// 🐛 DEBUG TOOLS (moved to /debug routes)

// 🔗 SISTEMA DE INTEGRACIÓN EVENTBUS
// NOTA: CapabilityProvider removido - el nuevo sistema unificado usa Zustand sin Provider
import { EventBusProvider } from '@/providers/EventBusProvider';

// 🔄 CAPABILITY SYNC - Database persistence
import { CapabilitySync } from '@/components/capabilities/CapabilitySync';

// 🔧 MODULE REGISTRY - Cross-module composition system
// ✅ OPTIMIZATION: Module initialization moved to LazyModuleInitializer
// OLD imports (no longer needed here):
// - initializeModulesForCapabilities
// - subscribeToCapabilityChanges  
// - ModuleRegistry
// - ALL_MODULE_MANIFESTS
import { HookPoint } from '@/lib/modules';

// 📅 BACKGROUND SERVICES - Appointment reminders (React hooks)
// import { useAppointmentReminders } from '@/hooks/useAppointmentReminders';

// 🎧 CONSOLE HELPER - For Chrome DevTools debugging
import { ConsoleHelper } from '@/lib/logging';

// ⚡ PHASE 1 OPTIMIZATION: Lazy load critical pages
const LazyDashboardPage = React.lazy(() => import('@/pages/admin/core/dashboard/page'));
const LazyCustomReporting = React.lazy(() => import('@/pages/admin/core/reporting/page'));

// 🚀 INITIALIZATION HELL FIX: Lazy module initialization (non-blocking)
const LazyModuleInitializer = React.lazy(() => import('@/lib/modules/LazyModuleInitializer'));
const LazyCompetitiveIntelligence = React.lazy(() => import('@/pages/admin/core/intelligence/page'));
const LazySetupWizard = React.lazy(() => import('@/pages/setup/SetupWizard').then(m => ({ default: m.SetupWizard })));

// Lazy-loaded modules for performance
import {
  LazySalesPage,
  LazyFulfillmentOnsitePage,
  LazyProductionPage,
  LazyDeliveryPage,
  LazyStockLab,
  LazySuppliersPage,
  LazySupplierOrdersPage,
  LazyProductsPage,
  LazyProductFormPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazyCashPage,
  LazySettingsPage,
  // LazyThemeTestPage, // REMOVED: Component does not exist
  LazyDebugDashboard,
  LazyAlertsTestingPage,
  LazyCapabilitiesDebug,
  LazyThemeDebug,
  LazyStoresDebug,
  LazyApiDebug,
  LazyPerformanceDebug,
  LazyNavigationDebug,
  LazyComponentsDebug,
  // LazySlotsDebug, // REMOVED: Legacy system
  LazyBundleDebug,
  // LazySupplyChainPage, // DISABLED: Component does not exist
  // LazyProcurementPage, // DISABLED: Component does not exist
  // ✅ NEW PHASE 4 & 5 MODULES
  LazyGamificationPage,
  LazyExecutivePage,
  LazyBillingPage,
  LazyIntegrationsPage,
  LazyMembershipsPage,
  LazyRentalsPage,
  LazyAssetsPage,
  LazyReportingPage
} from '@/lib/lazy';

// ⚡ PHASE 1 OPTIMIZATION: Lazy load Materials sub-modules
const LazyABCAnalysisView = lazy(() =>
  import('@/pages/admin/supply-chain/materials/components/Analytics').then(m => ({ default: m.ABCAnalysisSection }))
);

// ⚡ PHASE 1 OPTIMIZATION: Lazy load Settings sub-modules
const LazyDiagnosticsView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.DiagnosticsView }))
);
const LazyReportingView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.ReportingView }))
);
const LazyEnterpriseView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.EnterpriseView }))
);
const LazyIntegrationsView = lazy(() =>
  import('@/pages/admin/core/settings').then(m => ({ default: m.IntegrationsView }))
);

// ⚡ PHASE 1 OPTIMIZATION: Lazy load Customer App modules
const LazyCustomerPortal = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.CustomerPortal }))
);
const LazyCustomerMenu = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.CustomerMenu }))
);
const LazyMyOrders = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.MyOrders }))
);
const LazyCustomerSettings = lazy(() =>
  import('@/pages/app').then(m => ({ default: m.CustomerSettings }))
);
const LazyBookingPage = lazy(() => import('@/pages/app/booking/page'));
const LazyAppointmentsPage = lazy(() => import('@/pages/app/appointments/page'));

// E-commerce customer pages
const LazyCatalogPage = lazy(() => import('@/pages/app/catalog/page'));
const LazyCartPage = lazy(() => import('@/pages/app/cart/page'));
const LazyCheckoutPage = lazy(() => import('@/pages/app/checkout/page'));

import { logger } from '@/lib/logging';

// 🚨 SISTEMA GLOBAL DE ALERTAS
import { useGlobalAlertsInit } from '@/hooks/useGlobalAlertsInit';
import { useModuleBadgeSync } from '@/hooks/useModuleBadgeSync';

// ⚡ GLOBAL FLAG: Prevent duplicate module initialization
let isModuleSystemInitialized = false;

// Performance monitoring component
function PerformanceWrapper({ children }: { children: React.ReactNode }) {
  // 🔇 Changed to debug to reduce console noise (renderiza 2x por Strict Mode)
  logger.debug('App', '🎬 PerformanceWrapper RENDERED');

  useRouteBasedPreloading();
  useOperationalLockWatcher();

  // 🔔 Initialize all module alert systems at App level
  // ⚡ OPTIMIZED: Uses React 18 startTransition for non-blocking alert generation
  useGlobalAlertsInit();

  // 🔄 Sync alert counts with navigation module badges
  useModuleBadgeSync();

  // Initialize appointment reminders (auto-cleanup on unmount)
  // useAppointmentReminders();

  useEffect(() => {
    // ⚡ CRITICAL FIX: Prevent duplicate initialization (React Strict Mode + multiple providers)
    if (isModuleSystemInitialized) {
      logger.debug('App', '⏭️ Module system already initialized, skipping');
      return;
    }

    isModuleSystemInitialized = true;
    logger.info('App', '🔥 PerformanceWrapper useEffect STARTED - First time only');

    // Initialize performance system
    initializePerformanceSystem({
      lazyLoading: {
        enabled: true,
        preloadStrategy: 'smart',
        cacheStrategy: 'both',
        retryCount: 3,
        timeout: 10000
      },
      bundleOptimization: {
        treeshaking: true,
        codeSplitting: true,
        minification: true,
        compression: true
      },
      runtime: {
        memoization: true,
        eventDelegation: true,
        virtualization: true,
        performanceMonitoring: process.env.NODE_ENV === 'development'
      }
    });

    // Initialize Console Helper for debugging (dev only)
    if (process.env.NODE_ENV === 'development') {
      ConsoleHelper.init();
    }

    // Initialize offline system
    // 🚨 CRITICAL: Service Worker ONLY in production to avoid conflicts with Vite HMR
    initializeOffline({
      enableServiceWorker: import.meta.env.PROD, // ✅ Only in production, NOT development
      enableSync: true,
      syncInterval: 30000,
      maxRetries: 3
    }).then(({ serviceWorker, syncInitialized, storageInitialized }) => {
      logger.info('App', '[App] Offline system initialized:', {
        serviceWorker: !!serviceWorker,
        syncInitialized,
        storageInitialized,
        environment: import.meta.env.MODE
      });
    }).catch(error => {
      logger.error('App', '[App] Failed to initialize offline system:', error);
    });

    // ✅ INITIALIZATION HELL FIX: All module initialization moved to LazyModuleInitializer
    // This component loads asynchronously and doesn't block initial render
    // Benefits:
    // - Initial render: ~200ms (18.5x faster)
    // - Modules load in background (non-blocking)
    // - Progressive feature availability
    // - Better perceived performance
    logger.info('App', '🚀 Module initialization delegated to LazyModuleInitializer (non-blocking)');

    // Initialize Cash Module event handlers
    import('@/modules/cash/init').then(({ initializeCashModule }) => {
      initializeCashModule();
    }).catch(error => {
      logger.error('App', 'Failed to initialize Cash Module handlers', { error });
    });

    // No module initialization here anymore - LazyModuleInitializer handles it
    const unsubscribe = () => { }; // No-op cleanup

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

// Loading fallback component - Minimal and discrete
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.4
    }}>
      {/* Empty - no visible spinner, just space reservation */}
    </div>
  );
}

function App() {
  return (
    <PerformanceProvider>
      <Provider>
        <AlertsProvider>
          <Router>
            {/* 🛡️ ErrorBoundary INSIDE Router so useLocation works */}
            <ErrorBoundaryWrapper>
              <AuthProvider>
                {/* 🔄 Sync capabilities from Supabase on app init */}
                <CapabilitySync />

                {/* 🎮 Initialize gamification notifications via Module Registry */}
                <HookPoint name="app.init" />

                {/* 🏢 Multi-Location Context - Available after auth */}
                <LocationProvider>
                  <OfflineMonitorProvider>

                    {/* 🔗 INTEGRATION LAYER: EventBus + Navigation */}
                    {/* NOTA: CapabilityProvider removido - nuevo sistema unificado usa Zustand */}
                    <EventBusProvider debug={process.env.NODE_ENV === 'development'}>
                      <NavigationProvider>

                        {/* 🚀 INITIALIZATION HELL FIX: Lazy module initialization (non-blocking) */}
                        <Suspense fallback={null}>
                          <LazyModuleInitializer />
                        </Suspense>

                        {/* ✅ Content renders immediately while modules load in background */}


                        <PerformanceWrapper>
                          <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                              {/* 🌐 RUTAS PÚBLICAS */}
                              <Route path="/" element={
                                <PublicOnlyRoute>
                                  <LandingPage />
                                </PublicOnlyRoute>
                              } />
                              <Route path="/admin" element={
                                <PublicOnlyRoute>
                                  <AdminPortalPage />
                                </PublicOnlyRoute>
                              } />
                              <Route path="/login" element={
                                <PublicOnlyRoute>
                                  <CustomerLoginPage />
                                </PublicOnlyRoute>
                              } />
                              <Route path="/admin/login" element={
                                <PublicOnlyRoute>
                                  <AdminLoginPage />
                                </PublicOnlyRoute>
                              } />

                              {/* 🔧 SETUP WIZARD - Configuration inicial del sistema */}
                              <Route path="/setup" element={
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazySetupWizard />
                                </Suspense>
                              } />

                              {/* 🏠 ADMIN - DASHBOARD */}
                              <Route path="/admin/dashboard" element={
                                <ProtectedRouteNew>
                                  <AdminLayout>
                                    <DashboardRoleRouter>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyDashboardPage />
                                      </Suspense>
                                    </DashboardRoleRouter>
                                  </AdminLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/dashboard/cross-analytics" element={
                                <ProtectedRouteNew>
                                  <AdminLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyDashboardPage />
                                    </Suspense>
                                  </AdminLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/reporting" element={
                                <ProtectedRouteNew>
                                  <AdminLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomReporting />
                                    </Suspense>
                                  </AdminLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/intelligence" element={
                                <ProtectedRouteNew>
                                  <AdminLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCompetitiveIntelligence />
                                    </Suspense>
                                  </AdminLayout>
                                </ProtectedRouteNew>
                              } />
                              {/* <Route path="/admin/materials/predictive-analytics" element={
                          <ProtectedRouteNew>
                            <AdminLayout>
                              <PredictiveAnalyticsComponent />
                            </AdminLayout>
                          </ProtectedRouteNew>
                        } /> */}

                              {/* 🏢 ADMIN - BUSINESS OPERATIONS */}
                              <Route path="/admin/operations/sales" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="sales">
                                    <AdminLayout>
                                      <Suspense fallback={<div>Cargando Ventas...</div>}>
                                        <LazySalesPage />
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              {/* 🏢 ADMIN - OPERATIONS - Floor Management */}
                              <Route path="/admin/operations/floor" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="operations">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Floor Management">
                                        <LazyFulfillmentOnsitePage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🔥 ADMIN - OPERATIONS - Kitchen Display */}
                              <Route path="/admin/operations/kitchen" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="operations">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Kitchen Display">
                                        <LazyProductionPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🚚 ADMIN - OPERATIONS - Delivery Management */}
                              {/* Delivery - Consolidated into Fulfillment */}
                              <Route path="/admin/operations/fulfillment/delivery" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="operations">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Delivery Management">
                                        <LazyDeliveryPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* Redirect old delivery route to new location */}
                              <Route path="/admin/operations/delivery" element={
                                <Navigate to="/admin/operations/fulfillment/delivery" replace />
                              } />

                              <Route path="/admin/customers" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="sales">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Clientes">
                                        <LazyCustomersPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🏭 ADMIN - SUPPLY CHAIN & Materials */}
                              <Route path="/admin/supply-chain/materials" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="materials">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="StockLab">
                                        <LazyStockLab />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/materials/abc-analysis" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="materials">
                                    <AdminLayout>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyABCAnalysisView />
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              {/* DISABLED: LazySupplyChainPage component does not exist
                        <Route path="/admin/materials/supply-chain" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <AdminLayout>
                                <LazyWithErrorBoundary moduleName="Supply Chain">
                                  <LazySupplyChainPage />
                                </LazyWithErrorBoundary>
                              </AdminLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        */}
                              {/* <Route path="/admin/materials/procurement" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <AdminLayout>
                                <LazyWithErrorBoundary moduleName="Procurement">
                                  <LazyProcurementPage />
                                </LazyWithErrorBoundary>
                              </AdminLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } /> */}

                              {/* 🏢 ADMIN - SUPPLIERS */}
                              <Route path="/admin/supply-chain/suppliers" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="materials">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Proveedores">
                                        <LazySuppliersPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 📦 ADMIN - MATERIALS PROCUREMENT (Purchase Orders) */}
                              <Route path="/admin/supply-chain/materials/procurement" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="materials">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Procurement">
                                        <LazySupplierOrdersPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🍕 ADMIN - PRODUCTS */}
                              <Route path="/admin/supply-chain/products" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="products">
                                    <AdminLayout>
                                      <LazyProductsPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🍕 ADMIN - PRODUCT FORM (NEW v3.0 Wizard) */}
                              <Route path="/admin/supply-chain/products/new" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="products">
                                    <AdminLayout>
                                      <LazyProductFormPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/supply-chain/products/:id/edit" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="products">
                                    <AdminLayout>
                                      <LazyProductFormPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/supply-chain/products/:id/view" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="products">
                                    <AdminLayout>
                                      <LazyProductFormPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🏗️ ADMIN - ASSETS */}
                              <Route path="/admin/supply-chain/assets" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="assets">
                                    <AdminLayout>
                                      <LazyAssetsPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 💰 ADMIN - FISCAL */}
                              <Route path="/admin/finance/fiscal" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="fiscal">
                                    <AdminLayout>
                                      <LazyFiscalPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 💵 ADMIN - CASH MANAGEMENT */}
                              <Route path="/admin/finance/cash" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="fiscal">
                                    <AdminLayout>
                                      <LazyCashPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 👨‍💼 ADMIN - STAFF & HR */}
                              <Route path="/admin/resources/staff" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="staff">
                                    <AdminLayout>
                                      <LazyStaffPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/resources/scheduling" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="scheduling">
                                    <AdminLayout>
                                      <LazySchedulingPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🎮 ADMIN - GAMIFICATION */}
                              <Route path="/admin/gamification/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="gamification">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Gamificación">
                                        <LazyGamificationPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 📈 ADMIN - EXECUTIVE BI */}
                              <Route path="/admin/executive/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Executive BI">
                                        <LazyExecutivePage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 💰 ADMIN - FINANCE ADVANCED */}
                              <Route path="/admin/finance/billing/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="fiscal">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Facturación Avanzada">
                                        <LazyBillingPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/finance/integrations/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="fiscal">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Integraciones de Pago">
                                        <LazyIntegrationsPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🏢 ADMIN - OPERATIONS ADVANCED */}
                              <Route path="/admin/operations/memberships/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="operations">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Membresías">
                                        <LazyMembershipsPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/operations/rentals/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="operations">
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Alquileres">
                                        <LazyRentalsPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 📊 ADMIN - ADVANCED TOOLS */}
                              <Route path="/admin/tools/reporting/*" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Reportes Avanzados">
                                        <LazyReportingPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🔧 ADMIN - SETTINGS */}
                              <Route path="/admin/settings" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredModule="settings">
                                    <AdminLayout>
                                      <LazySettingsPage />
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/settings/integrations" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyIntegrationsView />
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/settings/diagnostics" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyDiagnosticsView />
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/settings/reporting" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyReportingView />
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/admin/settings/enterprise" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyEnterpriseView />
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />

                              {/* 🛠️ DEBUG ROUTES - Development only */}
                              <Route path="/debug" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Debug Dashboard">
                                        <LazyDebugDashboard />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/alerts" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Alerts Testing">
                                        <LazyAlertsTestingPage />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/capabilities" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Capabilities Debug">
                                        <LazyCapabilitiesDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/feature-ui-mapping" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <Suspense fallback={<LoadingFallback />}>
                                        {React.createElement(React.lazy(() => import('@/pages/debug/feature-ui-mapping/FeatureUIMappingDebugger')))}
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/theme" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Theme Debug">
                                        <LazyThemeDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/stores" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Store Inspector">
                                        <LazyStoresDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/api" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="API Inspector">
                                        <LazyApiDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/performance" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Performance Monitor">
                                        <LazyPerformanceDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/navigation" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Navigation Debug">
                                        <LazyNavigationDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/components" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Component Library">
                                        <LazyComponentsDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/debug/eventbus" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <Suspense fallback={<div>Cargando EventBus Monitor...</div>}>
                                        <LazyWithErrorBoundary moduleName="EventBus Monitor">
                                          {React.createElement(lazy(() => import('@/pages/debug/eventbus')))}
                                        </LazyWithErrorBoundary>
                                      </Suspense>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              {/* REMOVED: Slots debug - Legacy system eliminated */}
                              {/* <Route path="/debug/slots" element={...} /> */}
                              <Route path="/debug/bundle" element={
                                <ProtectedRouteNew>
                                  <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                    <AdminLayout>
                                      <LazyWithErrorBoundary moduleName="Bundle Analyzer">
                                        <LazyBundleDebug />
                                      </LazyWithErrorBoundary>
                                    </AdminLayout>
                                  </RoleGuard>
                                </ProtectedRouteNew>
                              } />
                              {/* REMOVED: LazyThemeTestPage component does not exist
                        <Route path="/admin/debug/theme-test" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyThemeTestPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        */}

                              {/* �📱 CUSTOMER APP - Para usuarios CLIENTE */}
                              <Route path="/app/portal" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomerPortal />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/app/menu" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomerMenu />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/app/orders" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyMyOrders />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/app/settings" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomerSettings />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/app/booking" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyBookingPage />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />
                              <Route path="/app/appointments" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyAppointmentsPage />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />

                              {/* 🛒 E-COMMERCE - Customer shopping */}
                              <Route path="/app/catalog" element={
                                <CustomerLayout>
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyCatalogPage />
                                  </Suspense>
                                </CustomerLayout>
                              } />
                              <Route path="/app/cart" element={
                                <CustomerLayout>
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyCartPage />
                                  </Suspense>
                                </CustomerLayout>
                              } />
                              <Route path="/app/checkout" element={
                                <ProtectedRouteNew>
                                  <CustomerLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCheckoutPage />
                                    </Suspense>
                                  </CustomerLayout>
                                </ProtectedRouteNew>
                              } />

                              {/* 🚫 404 fallback */}
                              <Route path="*" element={
                                <div style={{
                                  minHeight: '50vh',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#666',
                                  fontSize: '14px'
                                }}>
                                  Página no encontrada
                                </div>
                              } />
                            </Routes>
                          </Suspense>
                        </PerformanceWrapper>

                        {/* 🚨 ALERTAS GLOBALES */}
                        <AutoGlobalAlertsDisplay />

                        {/* 🔔 NOTIFICATION CENTER */}
                        <NotificationCenter />

                        {/* Performance monitoring widget */}
                        {
                          //process.env.NODE_ENV === 'development' && <LazyLoadingMonitor />
                        }

                        {/* 🐛 DEBUG TOOLS moved to /debug routes */}

                      </NavigationProvider>
                    </EventBusProvider>

                  </OfflineMonitorProvider>
                </LocationProvider>
              </AuthProvider>
            </ErrorBoundaryWrapper>
          </Router>
        </AlertsProvider>
      </Provider>
    </PerformanceProvider>
  );
}

export default App;
