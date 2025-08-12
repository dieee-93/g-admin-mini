// src/App.tsx - Reorganized by architectural domains following ARCHITECTURE_ROADMAP.md
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/shared/ui/provider';
import { Toaster } from '@/shared/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';
import { ErrorBoundary } from '@/lib/error-handling';
import { initializePerformanceSystem } from '@/lib/performance';

// Dashboard Module
import { Dashboard } from '@/modules/dashboard/Dashboard';

// Core Modules
import { MaterialsPage } from '@/modules/materials';
import { ProductsPage } from '@/modules/products/ProductsPage';
import { OperationsPage } from '@/modules/operations/OperationsPage';
import SalesPage from '@/modules/sales/SalesPage';
import CustomersPage from '@/modules/customers/CustomersPage';
import StaffPage from '@/modules/staff/StaffPage';
import SchedulingPage from '@/modules/scheduling/SchedulingPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';

// Tools
import { ToolsPage } from '@/tools/index';
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
              <Route path="/" element={<Dashboard />} />
              
              {/* 🏢 BUSINESS OPERATIONS DOMAIN */}
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              
              {/* 🏭 SUPPLY CHAIN DOMAIN */}
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              
              {/* 💰 FINANCIAL DOMAIN */}
              <Route path="/fiscal" element={<FiscalPage />} />
              
              {/* 👨‍💼 WORKFORCE DOMAIN */}
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/scheduling" element={<SchedulingPage />} />
              
              {/* 🔧 INTELLIGENCE & TOOLS */}
              <Route path="/tools/*" element={<ToolsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
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