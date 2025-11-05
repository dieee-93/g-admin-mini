// App.tsx - NUEVA ARQUITECTURA DE RUTAS - Clean and organized routing
import * as React from 'react';
import { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, Toaster } from '@/shared/ui';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { ErrorBoundary } from '@/lib/error-handling';
import { LazyWithErrorBoundary } from '@/shared/components';
import { useRouteBasedPreloading } from '@/hooks/useRouteBasedPreloading';
import { PerformanceProvider, initializePerformanceSystem } from '@/lib/performance';

// 🚨 SISTEMA UNIFICADO DE ALERTAS
import { AlertsProvider, AutoGlobalAlertsDisplay } from '@/shared/alerts';

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
import { initializeModulesForCapabilities, subscribeToCapabilityChanges } from '@/lib/modules/integration';
import { ModuleRegistry, HookPoint } from '@/lib/modules';
import { ALL_MODULE_MANIFESTS } from '@/modules';

// 📅 BACKGROUND SERVICES - Appointment reminders (React hooks)
// import { useAppointmentReminders } from '@/hooks/useAppointmentReminders';

// 🎧 CONSOLE HELPER - For Chrome DevTools debugging
import { ConsoleHelper } from '@/lib/logging';

// ⚡ PHASE 1 OPTIMIZATION: Lazy load critical pages
const LazyDashboardPage = React.lazy(() => import('@/pages/admin/core/dashboard/page'));
const LazyCustomReporting = React.lazy(() => import('@/pages/admin/core/reporting/page'));
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
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage,
  // LazyThemeTestPage, // REMOVED: Component does not exist
  LazyDebugDashboard,
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

// Performance monitoring component
function PerformanceWrapper({ children }: { children: React.ReactNode }) {
  logger.info('App', '🎬 PerformanceWrapper RENDERED');

  useRouteBasedPreloading();

  // Initialize appointment reminders (auto-cleanup on unmount)
  // useAppointmentReminders();

  useEffect(() => {
    logger.info('App', '🔥 PerformanceWrapper useEffect STARTED');
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

    // Initialize Module Registry
    logger.info('App', '⏰ Starting Module Registry initialization...', { manifestCount: ALL_MODULE_MANIFESTS.length });

    initializeModulesForCapabilities(ALL_MODULE_MANIFESTS)
      .then((result) => {
        logger.info('App', '✅ Module Registry INITIALIZED!', {
          initialized: result.initialized.length,
          failed: result.failed.length,
          skipped: result.skipped.length,
          duration: `${result.duration}ms`,
          modules: result.initialized
        });

        // DEBUG: Log detailed module registration
        logger.debug('App', '📋 Registered modules:', result.initialized);
        logger.debug('App', '⏭️ Skipped modules:', result.skipped);

        // DEBUG: Check if achievements module registered
        const registry = ModuleRegistry.getInstance();
        const hasAchievements = registry.has('achievements');
        logger.info('App', `🏆 Achievements module registered: ${hasAchievements}`);

        // DEBUG: Check hook registration
        const stats = registry.getStats();
        logger.info('App', '🔌 Hook registry stats:', stats);

        // DEBUG: Expose registry in window for Chrome DevTools debugging
        interface WindowWithRegistry extends Window {
          __MODULE_REGISTRY__?: typeof registry;
        }
        (window as WindowWithRegistry).__MODULE_REGISTRY__ = registry;
        logger.info('App', '🪟 ModuleRegistry exposed in window.__MODULE_REGISTRY__');

        if (result.failed.length > 0) {
          logger.warn('App', '⚠️ Some modules failed to initialize:', result.failed);
        }
      })
      .catch(error => {
        logger.error('App', '❌ Failed to initialize Module Registry:', error);
      });

    // Subscribe to capability changes and auto-reinitialize modules
    const unsubscribe = subscribeToCapabilityChanges(ALL_MODULE_MANIFESTS);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: '14px'
    }}>
      Cargando módulo...
    </div>
  );
}

function App() {
  return (
    <PerformanceProvider>
      <Provider>
        <ErrorBoundary>
          <AlertsProvider>
            <Router>
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
                            <ResponsiveLayout>
                              <DashboardRoleRouter>
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyDashboardPage />
                                </Suspense>
                              </DashboardRoleRouter>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/dashboard/cross-analytics" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyDashboardPage />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/reporting" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyCustomReporting />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/intelligence" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyCompetitiveIntelligence />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        {/* <Route path="/admin/materials/predictive-analytics" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <PredictiveAnalyticsComponent />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } /> */}

                        {/* 🏢 ADMIN - BUSINESS OPERATIONS */}
                        <Route path="/admin/operations/sales" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="sales">
                              <ResponsiveLayout>
                                <Suspense fallback={<div>Cargando Ventas...</div>}>
                                  <LazySalesPage />
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        {/* 🏢 ADMIN - OPERATIONS - Floor Management */}
                        <Route path="/admin/operations/floor" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Floor Management">
                                  <LazyFulfillmentOnsitePage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 🔥 ADMIN - OPERATIONS - Kitchen Display */}
                        <Route path="/admin/operations/kitchen" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Kitchen Display">
                                  <LazyProductionPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 🚚 ADMIN - OPERATIONS - Delivery Management */}
                        {/* Delivery - Consolidated into Fulfillment */}
                        <Route path="/admin/operations/fulfillment/delivery" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Delivery Management">
                                  <LazyDeliveryPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
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
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Clientes">
                                  <LazyCustomersPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 🏭 ADMIN - SUPPLY CHAIN & Materials */}
                        <Route path="/admin/supply-chain/materials" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="StockLab">
                                  <LazyStockLab />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/materials/abc-analysis" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyABCAnalysisView />
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        {/* DISABLED: LazySupplyChainPage component does not exist
                        <Route path="/admin/materials/supply-chain" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Supply Chain">
                                  <LazySupplyChainPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        */}
                        {/* <Route path="/admin/materials/procurement" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Procurement">
                                  <LazyProcurementPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } /> */}

                        {/* 🏢 ADMIN - SUPPLIERS */}
                        <Route path="/admin/supply-chain/suppliers" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Proveedores">
                                  <LazySuppliersPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 📦 ADMIN - SUPPLIER ORDERS */}
                        <Route path="/admin/supply-chain/supplier-orders" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Órdenes de Compra">
                                  <LazySupplierOrdersPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 🍕 ADMIN - PRODUCTS */}
                        <Route path="/admin/supply-chain/products" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="products">
                              <ResponsiveLayout>
                                <LazyProductsPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 💰 ADMIN - FISCAL */}
                        <Route path="/admin/finance/fiscal" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="fiscal">
                              <ResponsiveLayout>
                                <LazyFiscalPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 👨‍💼 ADMIN - STAFF & HR */}
                        <Route path="/admin/resources/staff" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="staff">
                              <ResponsiveLayout>
                                <LazyStaffPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/resources/scheduling" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="scheduling">
                              <ResponsiveLayout>
                                <LazySchedulingPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 🎮 ADMIN - GAMIFICATION */}
                        <Route path="/admin/gamification/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="gamification">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Gamificación">
                                  <LazyGamificationPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 📈 ADMIN - EXECUTIVE BI */}
                        <Route path="/admin/executive/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Executive BI">
                                  <LazyExecutivePage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 💰 ADMIN - FINANCE ADVANCED */}
                        <Route path="/admin/finance/billing/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="fiscal">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Facturación Avanzada">
                                  <LazyBillingPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/finance/integrations/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="fiscal">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Integraciones de Pago">
                                  <LazyIntegrationsPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 🏢 ADMIN - OPERATIONS ADVANCED */}
                        <Route path="/admin/operations/memberships/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Membresías">
                                  <LazyMembershipsPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/operations/rentals/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Alquileres">
                                  <LazyRentalsPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/operations/assets/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Gestión de Activos">
                                  <LazyAssetsPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 📊 ADMIN - ADVANCED TOOLS */}
                        <Route path="/admin/tools/reporting/*" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Reportes Avanzados">
                                  <LazyReportingPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 🔧 ADMIN - SETTINGS */}
                        <Route path="/admin/settings" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="settings">
                              <ResponsiveLayout>
                                <LazySettingsPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/integrations" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyIntegrationsView />
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/diagnostics" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyDiagnosticsView />
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/reporting" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyReportingView />
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/enterprise" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyEnterpriseView />
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 🛠️ DEBUG ROUTES - Development only */}
                        <Route path="/debug" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Debug Dashboard">
                                  <LazyDebugDashboard />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/capabilities" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Capabilities Debug">
                                  <LazyCapabilitiesDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/feature-ui-mapping" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                  {React.createElement(React.lazy(() => import('@/pages/debug/feature-ui-mapping/FeatureUIMappingDebugger')))}
                                </Suspense>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/theme" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Theme Debug">
                                  <LazyThemeDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/stores" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Store Inspector">
                                  <LazyStoresDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/api" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="API Inspector">
                                  <LazyApiDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/performance" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Performance Monitor">
                                  <LazyPerformanceDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/navigation" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Navigation Debug">
                                  <LazyNavigationDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/debug/components" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Component Library">
                                  <LazyComponentsDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        {/* REMOVED: Slots debug - Legacy system eliminated */}
                        {/* <Route path="/debug/slots" element={...} /> */}
                        <Route path="/debug/bundle" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Bundle Analyzer">
                                  <LazyBundleDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
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
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyCustomerPortal />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/menu" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyCustomerMenu />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/orders" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyMyOrders />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/settings" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyCustomerSettings />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/booking" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyBookingPage />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/appointments" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyAppointmentsPage />
                              </Suspense>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />

                        {/* 🛒 E-COMMERCE - Customer shopping */}
                        <Route path="/app/catalog" element={
                          <ResponsiveLayout>
                            <Suspense fallback={<LoadingFallback />}>
                              <LazyCatalogPage />
                            </Suspense>
                          </ResponsiveLayout>
                        } />
                        <Route path="/app/cart" element={
                          <ResponsiveLayout>
                            <Suspense fallback={<LoadingFallback />}>
                              <LazyCartPage />
                            </Suspense>
                          </ResponsiveLayout>
                        } />
                        <Route path="/app/checkout" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <Suspense fallback={<LoadingFallback />}>
                                <LazyCheckoutPage />
                              </Suspense>
                            </ResponsiveLayout>
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
                  
                  {/* Performance monitoring widget */}
                  {
                  //process.env.NODE_ENV === 'development' && <LazyLoadingMonitor />
                  }
                  
                  <Toaster />

                  {/* 🐛 DEBUG TOOLS moved to /debug routes */}

                          </NavigationProvider>
                      </EventBusProvider>

              </OfflineMonitorProvider>
              </LocationProvider>
              </AuthProvider>
            </Router>
          </AlertsProvider>
        </ErrorBoundary>
      </Provider>
    </PerformanceProvider>
  );
}

export default App;
