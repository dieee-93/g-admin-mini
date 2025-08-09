// src/App.tsx - VERSIÓN CORREGIDA después de reorganización
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';

// ✅ Páginas que funcionan
import { Dashboard } from '@/pages/Dashboard';
import { InventoryPage } from '@/features/inventory/InventoryPage'; // ✅ ESTA funciona

// ✅ Páginas de módulos
import { ProductionPage } from '@/pages/ProductionPage';
import { SalesPage } from '@/pages/SalesPage';  
import { CustomersPage } from '@/pages/CustomersPage';
import { RecipesPage } from '@/pages/RecipesPage';
import { OperationsPage } from "@/features/operations/OperationsPage";
import { StaffPage } from '@/features/staff';

// ✅ Submódulos POS (ahora en features/)
import { QROrderPage } from '@/features/sales/components/QROrdering/QROrderPage';
import { TableManagementPage } from '@/features/sales/components/TableManagement/TableManagementPage';
import { KitchenPage } from '@/features/production/KitchenPage';

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
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/staff" element={<StaffPage />} />
              
              {/* ✅ Submódulos POS */}
              <Route path="/sales/qr-order" element={<QROrderPage />} />
              <Route path="/sales/tables" element={<TableManagementPage />} />
              <Route path="/production/kitchen" element={<KitchenPage />} />
              
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