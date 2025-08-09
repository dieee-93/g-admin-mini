// src/App.tsx - Updated with new modular structure
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from '@/shared/ui/provider';
import { Toaster } from '@/shared/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/shared/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';

// Dashboard Module
import { Dashboard } from '@/modules/dashboard/Dashboard';

// Core Modules
import { InventoryPage } from '@/modules/materials/InventoryPage';
import { OperationsPage } from "@/modules/operations/OperationsPage";
import { StaffPage } from '@/modules/staff';
import SalesPageRefactored from '@/modules/sales/SalesPageRefactored';
import CustomersPageRefactored from '@/modules/customers/CustomersPageRefactored';
import { SchedulingPageRefactored } from '@/modules/scheduling';
import { SettingsPage } from '@/modules/settings';

// Tools
import { RecipesPageRefactored } from '@/tools/intelligence/exports';

// Legacy page imports (to be phased out)
import { ProductionPage } from '@/pages/ProductionPage';

// Submódulos POS
import { QROrderPage } from '@/modules/sales/components/QROrdering/QROrderPage';

function App() {
  return (
    <Provider>
      <Router>
        <NavigationProvider>
          {/* ✅ Hook para sincronizar badges con alertas */}
          <NavigationBadgeSync />
          
          <ResponsiveLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              
              {/* ✅ Rutas de módulos */}
              <Route path="/production" element={<ProductionPage />} />
              <Route path="/recipes" element={<RecipesPageRefactored />} />
              <Route path="/sales" element={<SalesPageRefactored />} />
              <Route path="/customers" element={<CustomersPageRefactored />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/scheduling" element={<SchedulingPageRefactored />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* ✅ Submódulos POS */}
              <Route path="/sales/qr-order" element={<QROrderPage />} />
              
              {/* Legacy routes - redirect to Operations module */}
              <Route path="/sales/tables" element={<OperationsPage />} />
              <Route path="/production/kitchen" element={<OperationsPage />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<div>Página en construcción</div>} />
            </Routes>
          </ResponsiveLayout>
          
          {/* ✅ Toaster global */}
          <Toaster />
        </NavigationProvider>
      </Router>
    </Provider>
  );
}

export default App;