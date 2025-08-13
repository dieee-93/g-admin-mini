// src/App.tsx - Reorganized by architectural domains following ARCHITECTURE_ROADMAP.md
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/shared/ui/provider';
import { Toaster } from '@/shared/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';
import { ErrorBoundary } from '@/lib/error-handling';
import { initializePerformanceSystem } from '@/lib/performance';

// Dashboard Module - Now expandable with business intelligence
import { Dashboard } from '@/modules/dashboard/Dashboard';
import { 
  ExecutiveDashboard,
  CrossModuleAnalytics,
  CustomReporting,
  CompetitiveIntelligence,
  PredictiveAnalyticsPage
} from '@/modules/dashboard/components';

// Core Modules
import { MaterialsPage } from '@/modules/materials';
import { ABCAnalysisPage } from '@/modules/materials/components';
import { ProductsPage } from '@/modules/products/ProductsPage';
import { OperationsPage } from '@/modules/operations/OperationsPage';
import SalesPage from '@/modules/sales/SalesPage';
import CustomersPage from '@/modules/customers/CustomersPage';
import StaffPage from '@/modules/staff/StaffPage';
import SchedulingPage from '@/modules/scheduling/SchedulingPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';
// Settings expanded components
import { 
  DiagnosticsPage,
  ReportingPage,
  EnterprisePage,
  IntegrationsPage
} from '@/modules/settings/components';

// Tools - REMOVED
import FiscalPage from '@/modules/fiscal/FiscalPage';

// Customer-facing components
import { QROrderPage } from '@/modules/sales/components/QROrdering/QROrderPage';

function App() {
  // Initialize performance monitoring system
  initializePerformanceSystem({
    lazyLoading: {
      enabled: true,
      preloadStrategy: 'smart',
      cacheStrategy: 'both',
      retryCount: 3,
      timeout: 10000
    },
    runtime: {
      memoization: true,
      eventDelegation: true,
      virtualization: true,
      performanceMonitoring: process.env.NODE_ENV === 'development'
    }
  });

  return (
    <ErrorBoundary>
      <Provider>
        <Router>
          <NavigationProvider>
            <NavigationBadgeSync />
            
            <ResponsiveLayout>
              <Routes>
              {/* 🏠 DASHBOARD - Now expandable */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
              <Route path="/dashboard/cross-analytics" element={<CrossModuleAnalytics />} />
              <Route path="/dashboard/custom-reports" element={<CustomReporting />} />
              <Route path="/dashboard/competitive-intelligence" element={<CompetitiveIntelligence />} />
              <Route path="/dashboard/predictive-analytics" element={<PredictiveAnalyticsPage />} />
              
              {/* 🏢 BUSINESS OPERATIONS DOMAIN */}
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              
              {/* 🏭 SUPPLY CHAIN DOMAIN - Materials now expandable */}
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/materials/inventory" element={<MaterialsPage />} />
              <Route path="/materials/abc-analysis" element={<ABCAnalysisPage />} />
              <Route path="/materials/supply-chain" element={<MaterialsPage />} />
              <Route path="/materials/procurement" element={<MaterialsPage />} />
              
              {/* Products expandable routes */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/menu-engineering" element={<ProductsPage />} />
              <Route path="/products/cost-analysis" element={<ProductsPage />} />
              <Route path="/products/production-planning" element={<ProductsPage />} />
              
              {/* 💰 FINANCIAL DOMAIN */}
              <Route path="/fiscal" element={<FiscalPage />} />
              
              {/* 👨‍💼 HUMAN RESOURCES - Staff expandable */}
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/staff/management" element={<StaffPage />} />
              <Route path="/staff/time-tracking" element={<StaffPage />} />
              <Route path="/staff/training" element={<StaffPage />} />
              <Route path="/scheduling" element={<SchedulingPage />} />
              
              {/* 🔧 SETTINGS - Now expandable */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/profile" element={<SettingsPage />} />
              <Route path="/settings/integrations" element={<IntegrationsPage />} />
              <Route path="/settings/diagnostics" element={<DiagnosticsPage />} />
              <Route path="/settings/reporting" element={<ReportingPage />} />
              <Route path="/settings/enterprise" element={<EnterprisePage />} />
              
              {/* Customer-facing sub-routes */}
              <Route path="/sales/qr-order" element={<QROrderPage />} />
          
              {/* 404 fallback */}
              <Route path="*" element={<div>Página no encontrada - Módulo en desarrollo</div>} />
            </Routes>
          </ResponsiveLayout>
          
          <Toaster />
        </NavigationProvider>
      </Router>
    </Provider>
    </ErrorBoundary>
  );
}

export default App;