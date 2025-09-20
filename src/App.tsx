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

// 🎮 SISTEMA DE LOGROS Y GAMIFICACIÓN
import { AchievementSystemProvider } from '@/lib/achievements/AchievementSystemIntegration';

// 🔗 SISTEMA DE INTEGRACIÓN EVENTBUS + CAPABILITYGATE
import { EventBusProvider } from '@/providers/EventBusProvider';
import { CapabilityProvider } from '@/lib/capabilities';
import { SlotProvider } from '@/lib/composition';

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
  LazyOperationsPage,
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
} from '@/lib/lazy';

// Materials sub-modules
import { ABCAnalysisSection as ABCAnalysisView } from '@/pages/admin/supply-chain/materials/components/Analytics';
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
      console.log('[App] Offline system initialized:', {
        serviceWorker: !!serviceWorker,
        syncInitialized,
        storageInitialized
      });
    }).catch(error => {
      console.error('[App] Failed to initialize offline system:', error);
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
                <OfflineMonitorProvider>
                  <AchievementSystemProvider>

                    {/* 🔗 INTEGRATION LAYER: EventBus + CapabilityGate + Slots */}
                    <CapabilityProvider>
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
                        <Route path="/admin/operations" element={
                          <ProtectedRouteNew>
                            <RoleGuard requiredModule="operations">
                              <ResponsiveLayout>
                                <LazyWithErrorBoundary moduleName="Operaciones">
                                  <LazyOperationsPage />
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
                        
                        {/* � DEBUG ROUTES - Development only */}
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
                          </NavigationProvider>
                        </SlotProvider>
                      </EventBusProvider>
                    </CapabilityProvider>

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
