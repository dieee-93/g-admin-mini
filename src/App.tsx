// src/App.tsx - Clean modular structure aligned with Architecture v2.0
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from '@/shared/ui/provider';
import { Toaster } from '@/shared/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';

// Dashboard Module
import { Dashboard } from '@/modules/dashboard/Dashboard';

// Core Modules
import { MaterialsPage } from '@/modules/materials/MaterialsPage';
import { ProductsPage } from '@/modules/products/ProductsPage';
import { OperationsPage } from '@/modules/operations/OperationsPage';
import SalesPage from '@/modules/sales/SalesPage';
import CustomersPage from '@/modules/customers/CustomersPage';
import StaffPage from '@/modules/staff/StaffPage';
import SchedulingPage from '@/modules/scheduling/SchedulingPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';

// Tools
import RecipesPage from '@/tools/intelligence/RecipesPage';

// Customer-facing components
import { QROrderPage } from '@/modules/sales/components/QROrdering/QROrderPage';

function App() {
  return (
    <Provider>
      <Router>
        <NavigationProvider>
          <NavigationBadgeSync />
          
          <ResponsiveLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              
              {/* Core Modules - Following Architecture Final Definitiva */}
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/scheduling" element={<SchedulingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Tools - Intelligence Tier */}
              <Route path="/recipes" element={<RecipesPage />} />
              
              {/* Customer-facing sub-routes */}
              <Route path="/sales/qr-order" element={<QROrderPage />} />
              
              {/* Legacy redirects for backward compatibility */}
              <Route path="/inventory" element={<Navigate to="/materials" replace />} />
              <Route path="/sales/tables" element={<Navigate to="/operations" replace />} />
              <Route path="/production/kitchen" element={<Navigate to="/operations" replace />} />
              <Route path="/production" element={<Navigate to="/operations" replace />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<div>Página no encontrada - Módulo en desarrollo</div>} />
            </Routes>
          </ResponsiveLayout>
          
          <Toaster />
        </NavigationProvider>
      </Router>
    </Provider>
  );
}

export default App;