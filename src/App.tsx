// App.tsx - NUEVA ARQUITECTURA DE RUTAS - Clean and organized routing
import * as React from 'react';
import { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, Toaster } from '@/shared/ui';
import { NavigationProvider } from '@/contexts/NavigationContext';

// 🔄 TANSTACK QUERY - Server state management
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// ResponsiveLayout is used internally by AppShell
// import { AdminLayout } from '@/layouts/AdminLayout'; // REMOVED
// import { CustomerLayout } from '@/layouts/CustomerLayout'; // REMOVED
// ✅ NEW UNIFIED LAYOUT SYSTEM - React Router Outlet pattern
import { AppShell, AdminHeaderActions, CustomerHeaderActions } from '@/shared/layout';
import { ErrorBoundaryWrapper } from '@/lib/error-handling';
import { LazyWithErrorBoundary } from '@/shared/components';
import { useRouteBasedPreloading } from '@/hooks';
import { useOperationalLockWatcher } from '@/lib/operations/hooks';
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
import { EventBusProvider } from '@/lib/events/EventBusProvider';

// 🔄 CAPABILITY SYNC - Database persistence
import { CapabilitySync } from '@/components/capabilities/CapabilitySync';

// 🎯 FEATURE FLAG SYSTEM - React Context (Layer 2)
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';

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
// 🔍 DIAGNOSTIC: Added logging to trace lazy import
const LazyModuleInitializer = React.lazy(() => {
  console.log('🔍 [App.tsx] React.lazy() callback executing - about to import LazyModuleInitializer...');
  return import('@/lib/modules/LazyModuleInitializer').then(module => {
    console.log('✅ [App.tsx] LazyModuleInitializer import SUCCESS!', module);
    return module;
  }).catch(error => {
    console.error('❌ [App.tsx] LazyModuleInitializer import FAILED!', error);
    throw error;
  });
});
const LazyCompetitiveIntelligence = React.lazy(() => import('@/pages/admin/core/intelligence/page'));
const LazySetupWizard = React.lazy(() => import('@/pages/setup/SetupWizard').then(m => ({ default: m.SetupWizard })));

// Lazy-loaded modules for performance
import {
  LazySalesPage,
  LazyFulfillmentOnsitePage,
  LazyFulfillmentPage,
  LazyProductionPage,
  LazyDeliveryPage,
  LazyStockLab,
  LazySuppliersPage,
  LazyProductsPage,
  LazyProductFormPage,
  LazyRecipesPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage,
  LazyHoursPage,
  LazyBusinessPage,
  LazyPaymentMethodsPage,
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
  LazyReportingPage,
  LazyCashPage
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
const LazyCheckoutSuccessPage = lazy(() => import('@/pages/app/checkout/success/page'));
const LazyCheckoutFailurePage = lazy(() => import('@/pages/app/checkout/failure/page'));
const LazyDeliveryCoveragePage = lazy(() => import('@/pages/app/delivery-coverage/page'));

import { logger } from '@/lib/logging';

// 🚨 SISTEMA GLOBAL DE ALERTAS
import { useGlobalAlertsInit } from '@/lib/alerts/hooks';
import { useModuleBadgeSync } from '@/lib/modules/hooks';

// ⚡ GLOBAL FLAG: Prevent duplicate module initialization
let isModuleSystemInitialized = false;

// 🔄 TANSTACK QUERY CLIENT - Server state configuration
// ⚠️ EXPORTED for use outside React components (e.g., integration.ts)
// Pattern: TanStack Query official pattern for queryClient.getQueryData()
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min - data considered fresh
      gcTime: 10 * 60 * 1000,         // 10 min - cache garbage collection
      retry: 3,                        // Retry failed requests 3 times
      refetchOnWindowFocus: false,    // Don't refetch on window focus
      refetchOnReconnect: true,       // Refetch on reconnect
    },
    mutations: {
      retry: 1,                        // Retry mutations once
    },
  },
});

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

// 🔍 DIAGNOSTIC: Suspense wrapper with logging
function DiagnosticSuspenseWrapper({ children }: { children: React.ReactNode }) {
  console.log('🔍 [DiagnosticSuspenseWrapper] Rendering...');
  
  React.useEffect(() => {
    console.log('🔍 [DiagnosticSuspenseWrapper] Mounted (children rendered successfully)');
    return () => {
      console.log('🔍 [DiagnosticSuspenseWrapper] Unmounting');
    };
  }, []);

  return (
    <React.Suspense 
      fallback={
        (() => {
          console.log('⏳ [DiagnosticSuspenseWrapper] FALLBACK TRIGGERED! Lazy component loading...');
          return null;
        })()
      }
    >
      {children}
    </React.Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <Provider>
          <AlertsProvider>
            <Router>
            {/* 🛡️ ErrorBoundary INSIDE Router so useLocation works */}
            <ErrorBoundaryWrapper>
              <AuthProvider>
                {/* 🔄 Sync capabilities from Supabase on app init */}
                <CapabilitySync />

                {/* 🎯 Feature Flag System - Computes active features from profile */}
                <FeatureFlagProvider>

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
                        {/* 🔍 DIAGNOSTIC: Wrapped with logging to trace Suspense behavior */}
                        <DiagnosticSuspenseWrapper>
                          <LazyModuleInitializer />
                        </DiagnosticSuspenseWrapper>

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

                              {/* ✅ MIGRATED TO NESTED ROUTES - React Router Outlet Pattern */}
                              {/* 🏠 ADMIN - Unified AppShell with nested child routes */}
                              <Route 
                                path="/admin" 
                                element={
                                  <ProtectedRouteNew>
                                    <AppShell headerActions={<AdminHeaderActions />} />
                                  </ProtectedRouteNew>
                                }
                              >
                                {/* ✅ ALL ADMIN CHILD ROUTES - Migrated to Nested Pattern */}
                                {/* These routes render inside <AppShell> via <Outlet /> */}
                                {/* NO ProtectedRouteNew wrapper (parent has it) */}
                                {/* NO AdminLayout wrapper (AppShell replaces it) */}
                                {/* YES RoleGuard, Suspense, LazyWithErrorBoundary preserved */}
                                
                                {/* 🏠 CORE - Dashboard */}
                                <Route 
                                  path="dashboard" 
                                  element={
                                    <DashboardRoleRouter>
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyDashboardPage />
                                      </Suspense>
                                    </DashboardRoleRouter>
                                  } 
                                />
                                <Route 
                                  path="dashboard/cross-analytics" 
                                  element={
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyDashboardPage />
                                    </Suspense>
                                  } 
                                />
                                
                                {/* 📊 CORE - Reporting & Intelligence */}
                                <Route 
                                  path="reporting" 
                                  element={
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomReporting />
                                    </Suspense>
                                  } 
                                />
                                <Route 
                                  path="intelligence" 
                                  element={
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCompetitiveIntelligence />
                                    </Suspense>
                                  } 
                                />
                                
                                {/* 🏢 OPERATIONS */}
                                <Route 
                                  path="operations/sales" 
                                  element={
                                    <RoleGuard requiredModule="sales">
                                      <Suspense fallback={<div>Cargando Ventas...</div>}>
                                        <LazySalesPage />
                                      </Suspense>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="operations/fulfillment" 
                                  element={
                                    <RoleGuard requiredModule="operations">
                                      <LazyWithErrorBoundary moduleName="Fulfillment">
                                        <LazyFulfillmentPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                {/* Redirect legacy kitchen route to production */}
                                <Route
                                  path="operations/kitchen"
                                  element={<Navigate to="/admin/operations/production" replace />}
                                />
                                <Route
                                  path="operations/production"
                                  element={
                                    <RoleGuard requiredModule="operations">
                                      <LazyWithErrorBoundary moduleName="Production">
                                        <LazyProductionPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  }
                                />
                                <Route 
                                  path="operations/fulfillment/delivery" 
                                  element={
                                    <RoleGuard requiredModule="operations">
                                      <LazyWithErrorBoundary moduleName="Delivery Management">
                                        <LazyDeliveryPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="operations/delivery" 
                                  element={<Navigate to="/admin/operations/fulfillment/delivery" replace />} 
                                />
                                <Route 
                                  path="operations/memberships/*" 
                                  element={
                                    <RoleGuard requiredModule="memberships">
                                      <LazyWithErrorBoundary moduleName="Memberships">
                                        <LazyMembershipsPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="operations/rentals/*" 
                                  element={
                                    <RoleGuard requiredModule="rentals">
                                      <LazyWithErrorBoundary moduleName="Rentals">
                                        <LazyRentalsPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 👥 CUSTOMERS */}
                                <Route 
                                  path="customers" 
                                  element={
                                    <RoleGuard requiredModule="sales">
                                      <LazyWithErrorBoundary moduleName="Clientes">
                                        <LazyCustomersPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 🏭 SUPPLY CHAIN */}
                                <Route 
                                  path="supply-chain/materials" 
                                  element={
                                    <RoleGuard requiredModule="materials">
                                      <LazyWithErrorBoundary moduleName="StockLab">
                                        <LazyStockLab />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="materials/abc-analysis" 
                                  element={
                                    <RoleGuard requiredModule="materials">
                                      <Suspense fallback={<LoadingFallback />}>
                                        <LazyABCAnalysisView />
                                      </Suspense>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/suppliers" 
                                  element={
                                    <RoleGuard requiredModule="materials">
                                      <LazyWithErrorBoundary moduleName="Proveedores">
                                        <LazySuppliersPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/products" 
                                  element={
                                    <RoleGuard requiredModule="products">
                                      <LazyProductsPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/products/new" 
                                  element={
                                    <RoleGuard requiredModule="products">
                                      <LazyProductFormPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/products/:id/edit" 
                                  element={
                                    <RoleGuard requiredModule="products">
                                      <LazyProductFormPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/products/:id/view" 
                                  element={
                                    <RoleGuard requiredModule="products">
                                      <LazyProductFormPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/recipes" 
                                  element={
                                    <RoleGuard requiredModule="recipe">
                                      <LazyRecipesPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="supply-chain/assets" 
                                  element={
                                    <RoleGuard requiredModule="assets">
                                      <LazyAssetsPage />
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 💰 FINANCE */}
                                <Route 
                                  path="finance/fiscal" 
                                  element={
                                    <RoleGuard requiredModule="fiscal">
                                      <LazyFiscalPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="finance/cash" 
                                  element={
                                    <RoleGuard requiredModule="fiscal">
                                      <LazyCashPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="finance/billing/*" 
                                  element={
                                    <RoleGuard requiredModule="billing">
                                      <LazyWithErrorBoundary moduleName="Billing">
                                        <LazyBillingPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="finance/integrations/*" 
                                  element={
                                    <RoleGuard requiredModule="integrations">
                                      <LazyWithErrorBoundary moduleName="Finance Integrations">
                                        <LazyIntegrationsPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 👨‍💼 RESOURCES */}
                                <Route 
                                  path="resources/team" 
                                  element={
                                    <RoleGuard requiredModule="staff">
                                      <LazyStaffPage />
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="resources/scheduling" 
                                  element={
                                    <RoleGuard requiredModule="scheduling">
                                      <LazySchedulingPage />
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 🎮 GAMIFICATION */}
                                <Route 
                                  path="gamification/*" 
                                  element={
                                    <RoleGuard requiredModule="gamification">
                                      <LazyWithErrorBoundary moduleName="Gamificación">
                                        <LazyGamificationPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 📈 EXECUTIVE BI */}
                                <Route 
                                  path="executive/*" 
                                  element={
                                    <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                      <LazyWithErrorBoundary moduleName="Executive Dashboard">
                                        <LazyExecutivePage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* 🔧 TOOLS */}
                                <Route 
                                  path="tools/reporting/*" 
                                  element={
                                    <RoleGuard requiredModule="reporting">
                                      <LazyWithErrorBoundary moduleName="Reporting Tools">
                                        <LazyReportingPage />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                
                                {/* ⚙️ SETTINGS */}
                                <Route 
                                  path="settings" 
                                  element={
                                    <LazyWithErrorBoundary moduleName="Settings">
                                      <LazySettingsPage />
                                    </LazyWithErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="settings/business" 
                                  element={
                                    <LazyWithErrorBoundary moduleName="Business Settings">
                                      <LazyBusinessPage />
                                    </LazyWithErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="settings/diagnostics" 
                                  element={
                                    <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                                      <LazyWithErrorBoundary moduleName="Diagnostics">
                                        <LazyDiagnosticsView />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="settings/enterprise" 
                                  element={
                                    <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                                      <LazyWithErrorBoundary moduleName="Enterprise Settings">
                                        <LazyEnterpriseView />
                                      </LazyWithErrorBoundary>
                                    </RoleGuard>
                                  } 
                                />
                                <Route 
                                  path="settings/hours" 
                                  element={
                                    <LazyWithErrorBoundary moduleName="Business Hours">
                                      <LazyHoursPage />
                                    </LazyWithErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="settings/integrations" 
                                  element={
                                    <LazyWithErrorBoundary moduleName="Integrations">
                                      <LazyIntegrationsPage />
                                    </LazyWithErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="settings/payment-methods" 
                                  element={
                                    <LazyWithErrorBoundary moduleName="Payment Methods">
                                      <LazyPaymentMethodsPage />
                                    </LazyWithErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="settings/reporting" 
                                  element={
                                    <LazyWithErrorBoundary moduleName="Reporting Settings">
                                      <LazyReportingView />
                                    </LazyWithErrorBoundary>
                                  } 
                                />
                                
                                {/* 🐛 DEBUG - ThemeTest removed */}
                                
                              </Route>

                              {/* ✅ LEGACY ADMIN ROUTES REMOVED (Migrated to Nested Pattern) */}
                              {/* 📱 CUSTOMER APP - Unified AppShell with nested child routes */}
                              <Route 
                                path="/app" 
                                element={<AppShell headerActions={<CustomerHeaderActions />} />}
                              >
                                {/* Protected Routes */}
                                <Route path="portal" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomerPortal />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />
                                <Route path="menu" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomerMenu />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />
                                <Route path="orders" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyMyOrders />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />
                                <Route path="settings" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCustomerSettings />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />
                                <Route path="booking" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyBookingPage />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />
                                <Route path="appointments" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyAppointmentsPage />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />
                                <Route path="checkout" element={
                                  <ProtectedRouteNew>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <LazyCheckoutPage />
                                    </Suspense>
                                  </ProtectedRouteNew>
                                } />

                                {/* Public Routes (Catalog, Cart, etc) */}
                                <Route path="catalog" element={
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyCatalogPage />
                                  </Suspense>
                                } />
                                <Route path="cart" element={
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyCartPage />
                                  </Suspense>
                                } />
                                <Route path="checkout/success" element={
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyCheckoutSuccessPage />
                                  </Suspense>
                                } />
                                <Route path="checkout/failure" element={
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyCheckoutFailurePage />
                                  </Suspense>
                                } />
                                <Route path="delivery-coverage" element={
                                  <Suspense fallback={<LoadingFallback />}>
                                    <LazyDeliveryCoveragePage />
                                  </Suspense>
                                } />
                              </Route>
                              {/* �📱 CUSTOMER APP - Para usuarios CLIENTE */}

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
                      </NavigationProvider>
                    </EventBusProvider>

                  </OfflineMonitorProvider>
                </LocationProvider>

                </FeatureFlagProvider>
              </AuthProvider>
            </ErrorBoundaryWrapper>
          </Router>
          
          {/* 🍞 CHAKRA UI TOASTER - Global toast notifications */}
          {/* ✅ CRITICAL: Must be inside Provider for Chakra context */}
          <Toaster />
        </AlertsProvider>
      </Provider>
      
      {/* 🔍 TANSTACK QUERY DEVTOOLS - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </PerformanceProvider>
  </QueryClientProvider>
  );
}

export default App;
