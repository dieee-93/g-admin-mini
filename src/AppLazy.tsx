// AppLazy.tsx - Performance-optimized App with lazy loading and code splitting
// Replaces App.tsx with intelligent module loading and preloading strategies

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/shared/ui/provider';
import { Toaster } from '@/shared/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';

// Performance optimization hooks and providers
import { useRouteBasedPreloading } from '@/hooks/useRouteBasedPreloading';
import { LazyWrapper, LazyLoadingMonitor } from '@/lib/performance/components/LazyWrapper';
import { PerformanceProvider, initializePerformanceSystem } from '@/lib/performance';

// Import lazy modules
import {
  LazySalesPage,
  LazyOperationsPage,
  LazyMaterialsPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyRecipesPage,
  LazyFiscalPage,
  LazySettingsPage
} from '@/modules/lazy/LazyModules';

// Critical modules that should not be lazy-loaded (loaded immediately)
import { Dashboard } from '@/modules/dashboard/Dashboard';
import { ProductsPage } from '@/modules/products/ProductsPage';

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
      monitoring: {
        enabled: process.env.NODE_ENV === 'development',
        metricsCollection: true,
        alerting: false, // Disable alerts in production
        reporting: true
      }
    });
  }, []);
  
  return <>{children}</>;
}

// Global loading fallback for route-level suspense
function GlobalLoadingFallback() {
  return (
    <LazyWrapper
      moduleName="application"
      fallbackVariant="skeleton"
      showProgress={true}
      showDetails={false}
    >
      <div />
    </LazyWrapper>
  );
}

// Route-specific lazy wrappers with optimized loading states
function LazyRoute({ 
  Component, 
  moduleName, 
  variant = 'detailed' 
}: { 
  Component: React.ComponentType<any>; 
  moduleName: string;
  variant?: 'minimal' | 'detailed' | 'skeleton';
}) {
  return (
    <LazyWrapper
      moduleName={moduleName}
      fallbackVariant={variant}
      showProgress={true}
      showDetails={true}
    >
      <Component />
    </LazyWrapper>
  );
}

function AppLazy() {
  return (
    <Provider>
      <Router>
        <NavigationProvider>
          <PerformanceProvider>
            <PerformanceWrapper>
              <NavigationBadgeSync />
              
              <ResponsiveLayout>
              <Suspense fallback={<GlobalLoadingFallback />}>
                <Routes>
                  {/* Dashboard - Critical, no lazy loading */}
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Products - Critical for menu management, no lazy loading */}
                  <Route path="/products" element={<ProductsPage />} />
                  
                  {/* High-priority modules with optimized lazy loading */}
                  <Route 
                    path="/sales" 
                    element={
                      <LazyRoute 
                        Component={LazySalesPage} 
                        moduleName="sales"
                        variant="detailed"
                      />
                    } 
                  />
                  
                  <Route 
                    path="/operations" 
                    element={
                      <LazyRoute 
                        Component={LazyOperationsPage} 
                        moduleName="operations"
                        variant="detailed"
                      />
                    } 
                  />
                  
                  <Route 
                    path="/materials" 
                    element={
                      <LazyRoute 
                        Component={LazyMaterialsPage} 
                        moduleName="materials"
                        variant="detailed"
                      />
                    } 
                  />
                  
                  <Route 
                    path="/fiscal" 
                    element={
                      <LazyRoute 
                        Component={LazyFiscalPage} 
                        moduleName="fiscal"
                        variant="detailed"
                      />
                    } 
                  />
                  
                  {/* Medium-priority modules with skeleton loading */}
                  <Route 
                    path="/customers" 
                    element={
                      <LazyRoute 
                        Component={LazyCustomersPage} 
                        moduleName="customers"
                        variant="skeleton"
                      />
                    } 
                  />
                  
                  <Route 
                    path="/staff" 
                    element={
                      <LazyRoute 
                        Component={LazyStaffPage} 
                        moduleName="staff"
                        variant="skeleton"
                      />
                    } 
                  />
                  
                  {/* Low-priority modules with minimal loading */}
                  <Route 
                    path="/scheduling" 
                    element={
                      <LazyRoute 
                        Component={LazySchedulingPage} 
                        moduleName="scheduling"
                        variant="minimal"
                      />
                    } 
                  />
                  
                  <Route 
                    path="/recipes" 
                    element={
                      <LazyRoute 
                        Component={LazyRecipesPage} 
                        moduleName="recipes"
                        variant="minimal"
                      />
                    } 
                  />
                  
                  <Route 
                    path="/settings" 
                    element={
                      <LazyRoute 
                        Component={LazySettingsPage} 
                        moduleName="settings"
                        variant="minimal"
                      />
                    } 
                  />
                  
                  {/* Customer-facing sub-routes - immediate loading for better UX */}
                  <Route path="/sales/qr-order" element={<QROrderPage />} />
                  
                  {/* Legacy redirects for backward compatibility */}
                  <Route path="/inventory" element={<Navigate to="/materials" replace />} />
                  <Route path="/sales/tables" element={<Navigate to="/operations" replace />} />
                  <Route path="/production/kitchen" element={<Navigate to="/operations" replace />} />
                  <Route path="/production" element={<Navigate to="/operations" replace />} />
                  
                  {/* 404 fallback */}
                  <Route 
                    path="*" 
                    element={
                      <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center',
                        minHeight: '50vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        Página no encontrada - Módulo en desarrollo
                      </div>
                    } 
                  />
                </Routes>
              </Suspense>
            </ResponsiveLayout>
            
            <Toaster />
            
            {/* Performance monitoring in development */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                position: 'fixed', 
                bottom: '10px', 
                right: '10px', 
                zIndex: 9999,
                maxWidth: '300px'
              }}>
                <LazyLoadingMonitor />
              </div>
            )}
            </PerformanceWrapper>
          </PerformanceProvider>
        </NavigationProvider>
      </Router>
    </Provider>
  );
}

export default AppLazy;