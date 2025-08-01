// src/App.tsx - VERSIÓN ALTERNATIVA con Provider personalizado
// App usando Provider personalizado (RECOMENDADO para proyectos complejos)

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { NavigationBadgeSync } from '@/hooks/useNavigationBadges';

// ✅ Páginas del sistema
import { Dashboard } from '@/pages/Dashboard';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { ProductionPage } from '@/pages/ProductionPage';
import { SalesPage } from '@/pages/SalesPage';
import { CustomersPage } from '@/pages/CustomersPage';

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
              <Route path="/production" element={<ProductionPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
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