// App.tsx - Performance-optimized App with lazy loading and expandable navigation
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/shared/ui/provider';
import { Toaster } from '@/shared/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';
import { ErrorBoundary } from '@/lib/error-handling';
import { useRouteBasedPreloading } from '@/hooks/useRouteBasedPreloading';
import { PerformanceProvider, initializePerformanceSystem, LazyLoadingMonitor } from '@/lib/performance';

// Dashboard Module - Critical, not lazy loaded
import { Dashboard } from '@/modules/dashboard/Dashboard';
import { 
  ExecutiveDashboard,
  CrossModuleAnalytics,
  CustomReporting,
  CompetitiveIntelligence,
  PredictiveAnalytics as PredictiveAnalyticsComponent
} from '@/modules/dashboard/components';

// Lazy-loaded modules for performance
import {
  LazySalesPage,
  LazyOperationsPage,
  LazyMaterialsPage,
  LazyProductsPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage
} from '@/modules/lazy/LazyModules';

// Materials sub-modules
import { ABCAnalysisPage } from '@/modules/materials/components';

// Settings sub-modules
import { 
  DiagnosticsPage,
  ReportingPage,
  EnterprisePage,
  IntegrationsPage
} from '@/modules/settings/components';

// Customer-facing components (keep immediate loading for better UX)
import { QROrderPage } from '@/modules/sales/components/QROrdering/QROrderPage';

// Performance monitoring component
function PerformanceWrapper({ children }: { children: React.ReactNode }) {
  useRouteBasedPreloading();
  
  // Initialize performance system on app startup
  React.useEffect(() => {
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
    <ErrorBoundary>
      <PerformanceProvider>
        <Provider>
          <Router>
            <NavigationProvider>
              <NavigationBadgeSync />
              
              <PerformanceWrapper>
                <ResponsiveLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* 🏠 DASHBOARD - Critical, not lazy loaded */}
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
                      <Route path="/dashboard/cross-analytics" element={<CrossModuleAnalytics />} />
                      <Route path="/dashboard/custom-reports" element={<CustomReporting />} />
                      <Route path="/dashboard/competitive-intelligence" element={<CompetitiveIntelligence />} />
                      <Route path="/dashboard/predictive-analytics" element={<PredictiveAnalyticsComponent />} />
                      
                      {/* 🏢 BUSINESS OPERATIONS DOMAIN - Lazy loaded */}
                      <Route path="/sales" element={<LazySalesPage />} />
                      <Route path="/operations" element={<LazyOperationsPage />} />
                      <Route path="/customers" element={<LazyCustomersPage />} />
                      
                      {/* 🏭 SUPPLY CHAIN DOMAIN - Materials expandable + lazy */}
                      <Route path="/materials" element={<LazyMaterialsPage />} />
                      <Route path="/materials/inventory" element={<LazyMaterialsPage />} />
                      <Route path="/materials/abc-analysis" element={<ABCAnalysisPage />} />
                      <Route path="/materials/supply-chain" element={<LazyMaterialsPage />} />
                      <Route path="/materials/procurement" element={<LazyMaterialsPage />} />
                      
                      {/* 🍕 PRODUCTS DOMAIN - Expandable + lazy */}
                      <Route path="/products" element={<LazyProductsPage />} />
                      <Route path="/products/menu-engineering" element={<LazyProductsPage />} />
                      <Route path="/products/cost-analysis" element={<LazyProductsPage />} />
                      <Route path="/products/production-planning" element={<LazyProductsPage />} />
                      
                      {/* 💰 FINANCIAL DOMAIN */}
                      <Route path="/fiscal" element={<LazyFiscalPage />} />
                      
                      {/* 👨‍💼 HUMAN RESOURCES - Staff expandable + lazy */}
                      <Route path="/staff" element={<LazyStaffPage />} />
                      <Route path="/staff/management" element={<LazyStaffPage />} />
                      <Route path="/staff/time-tracking" element={<LazyStaffPage />} />
                      <Route path="/staff/training" element={<LazyStaffPage />} />
                      <Route path="/scheduling" element={<LazySchedulingPage />} />
                      
                      {/* 🔧 SETTINGS - Expandable + lazy */}
                      <Route path="/settings" element={<LazySettingsPage />} />
                      <Route path="/settings/profile" element={<LazySettingsPage />} />
                      <Route path="/settings/integrations" element={<IntegrationsPage />} />
                      <Route path="/settings/diagnostics" element={<DiagnosticsPage />} />
                      <Route path="/settings/reporting" element={<ReportingPage />} />
                      <Route path="/settings/enterprise" element={<EnterprisePage />} />
                      
                      {/* Customer-facing sub-routes */}
                      <Route path="/sales/qr-order" element={<QROrderPage />} />
                      
                      {/* 404 fallback */}
                      <Route path="*" element={
                        <div style={{
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          fontSize: '14px'
                        }}>
                          Página no encontrada - Módulo en desarrollo
                        </div>
                      } />
                    </Routes>
                  </Suspense>
                </ResponsiveLayout>
              </PerformanceWrapper>
              
              {/* Performance monitoring widget - floating bottom right */}
              {process.env.NODE_ENV === 'development' && <LazyLoadingMonitor />}
              
              <Toaster />
            </NavigationProvider>
          </Router>
        </Provider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}

export default App;