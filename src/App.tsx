// App.tsx - NUEVA ARQUITECTURA DE RUTAS - Clean and organized routing
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// 🎮 SISTEMA DE LOGROS Y GAMIFICACIÓN
import { AchievementSystemProvider } from '@/lib/achievements/AchievementSystemIntegration';

// 🔗 SISTEMA DE INTEGRACIÓN EVENTBUS + SLOTS
// NOTA: CapabilityProvider removido - el nuevo sistema unificado usa Zustand sin Provider
import { EventBusProvider } from '@/providers/EventBusProvider';
import { SlotProvider } from '@/lib/composition';

// 🔄 CAPABILITY SYNC - Database persistence
import { CapabilitySync } from '@/components/capabilities/CapabilitySync';

// 🔧 MODULE REGISTRY - Cross-module composition system
import { initializeModulesForCapabilities } from '@/lib/modules/integration';
import { ALL_MODULE_MANIFESTS } from '@/modules';

// Dashboard Module - Critical, not lazy loaded
import DashboardPage from '@/pages/admin/core/dashboard/page';
// Removed CrossModuleAnalytics - consolidated into Dashboard with CrossModuleInsights
import { PredictiveAnalytics as PredictiveAnalyticsComponent } from '@/pages/admin/supply-chain/materials/components/PredictiveAnalytics';
import CustomReporting from '@/pages/admin/core/reporting/page';
import CompetitiveIntelligence from '@/pages/admin/core/intelligence/page';

// Setup Wizard - Direct import to avoid lazy loading issues temporarily
import { SetupWizard } from '@/pages/setup/SetupWizard';

// Lazy-loaded modules for performance
import {
  LazySalesPage,
  LazyFloorPage,
  LazyKitchenPage,
  LazyStockLab,
  LazySuppliersPage,
  LazySupplierOrdersPage,
  LazyProductsPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage,
  LazyThemeTestPage,
  LazyDebugDashboard,
  LazyCapabilitiesDebug,
  LazyThemeDebug,
  LazyStoresDebug,
  LazyApiDebug,
  LazyPerformanceDebug,
  LazyNavigationDebug,
  LazyComponentsDebug,
  LazySlotsDebug,
  LazyBundleDebug,
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
} from '@/lib/lazy';

// Materials sub-modules
import { ABCAnalysisSection as ABCAnalysisView } from '@/pages/admin/supply-chain/materials/components/Analytics';
import { logger } from '@/lib/logging';
// LazySupplyChainPage and LazyProcurementPage now imported from central LazyModules

// Settings sub-modules
import {
  DiagnosticsView,
  ReportingView,
  EnterpriseView,
  IntegrationsView
} from '@/pages/admin/core/settings';

// Customer modules - Experiencia específica para usuarios CLIENTE
import { 
  CustomerPortal, 
  CustomerMenu, 
  MyOrders, 
  CustomerSettings 
} from '@/pages/app';

// Performance monitoring component
function PerformanceWrapper({ children }: { children: React.ReactNode }) {
  useRouteBasedPreloading();
  
  React.useEffect(() => {
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

    // Initialize offline system
    initializeOffline({
      enableServiceWorker: true,
      enableSync: true,
      syncInterval: 30000,
      maxRetries: 3
    }).then(({ serviceWorker, syncInitialized, storageInitialized }) => {
      logger.info('App', '[App] Offline system initialized:', {
        serviceWorker: !!serviceWorker,
        syncInitialized,
        storageInitialized
      });
    }).catch(error => {
      logger.error('App', '[App] Failed to initialize offline system:', error);
    });

    // Initialize Module Registry
    initializeModulesForCapabilities(ALL_MODULE_MANIFESTS)
      .then((result) => {
        logger.info('App', '🔧 Module Registry initialized:', {
          initialized: result.initialized.length,
          failed: result.failed.length,
          skipped: result.skipped.length,
          duration: `${result.duration}ms`
        });

        if (result.failed.length > 0) {
          logger.warn('App', '⚠️ Some modules failed to initialize:', result.failed);
        }
      })
      .catch(error => {
        logger.error('App', '❌ Failed to initialize Module Registry:', error);
      });
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

                <OfflineMonitorProvider>
                  <AchievementSystemProvider>

                    {/* 🔗 INTEGRATION LAYER: EventBus + Slots + Navigation */}
                    {/* NOTA: CapabilityProvider removido - nuevo sistema unificado usa Zustand */}
                      <EventBusProvider debug={process.env.NODE_ENV === 'development'}>
                        <SlotProvider>
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
                        <Route path="/setup" element={<SetupWizard />} />
                        
                        {/* 🏠 ADMIN - DASHBOARD */}
                        <Route path="/admin/dashboard" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <DashboardRoleRouter>
                                <DashboardPage />
                              </DashboardRoleRouter>
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/dashboard/cross-analytics" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <DashboardPage />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/reporting" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <CustomReporting />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/intelligence" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <CompetitiveIntelligence />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/materials/predictive-analytics" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <PredictiveAnalyticsComponent />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 🏢 ADMIN - BUSINESS OPERATIONS */}
                        <Route path="/admin/sales" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="sales">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Ventas">
                                  <LazySalesPage />
                                </LazyWithErrorBoundary>
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
                                  <LazyFloorPage />
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
                                  <LazyKitchenPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
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
                        <Route path="/admin/materials" element={
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
                                <ABCAnalysisView />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
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
                        <Route path="/admin/materials/procurement" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="materials">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Procurement">
                                  <LazyProcurementPage />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />

                        {/* 🏢 ADMIN - SUPPLIERS */}
                        <Route path="/admin/suppliers" element={
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
                        <Route path="/admin/supplier-orders" element={
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
                        <Route path="/admin/products" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="products">
                              <ResponsiveLayout>
                                <LazyProductsPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 💰 ADMIN - FISCAL */}
                        <Route path="/admin/fiscal" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="fiscal">
                              <ResponsiveLayout>
                                <LazyFiscalPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* 👨‍💼 ADMIN - STAFF & HR */}
                        <Route path="/admin/staff" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="staff">
                              <ResponsiveLayout>
                                <LazyStaffPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/scheduling" element={
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
                                <IntegrationsView />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/diagnostics" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <DiagnosticsView />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/reporting" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <ReportingView />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/admin/settings/enterprise" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <EnterpriseView />
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
                        <Route path="/debug/slots" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Slots System">
                                  <LazySlotsDebug />
                                </LazyWithErrorBoundary>
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
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
                        <Route path="/admin/debug/theme-test" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredRoles={['SUPER_ADMIN']}>
                              <ResponsiveLayout>
                                <LazyThemeTestPage />
                              </ResponsiveLayout>
                            </RoleGuard>
                          </ProtectedRouteNew>
                        } />
                        
                        {/* �📱 CUSTOMER APP - Para usuarios CLIENTE */}
                        <Route path="/app/portal" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <CustomerPortal />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/menu" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <CustomerMenu />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/orders" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <MyOrders />
                            </ResponsiveLayout>
                          </ProtectedRouteNew>
                        } />
                        <Route path="/app/settings" element={
                          <ProtectedRouteNew>
                            <ResponsiveLayout>
                              <CustomerSettings />
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
                        </SlotProvider>
                      </EventBusProvider>

                </AchievementSystemProvider>
              </OfflineMonitorProvider>
              </AuthProvider>
            </Router>
          </AlertsProvider>
        </ErrorBoundary>
      </Provider>
    </PerformanceProvider>
  );
}

export default App;
