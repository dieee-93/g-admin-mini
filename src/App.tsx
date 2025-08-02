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

// 🚧 TODO: Crear estas páginas nuevas
// import { ProductionPage } from '@/pages/ProductionPage';
// import { SalesPage } from '@/pages/SalesPage';  
// import { CustomersPage } from '@/pages/CustomersPage';

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
              
              {/* 🚧 TODO: Uncomment cuando creemos las páginas */}
              {/* <Route path="/production" element={<ProductionPage />} /> */}
              {/* <Route path="/sales" element={<SalesPage />} /> */}
              {/* <Route path="/customers" element={<CustomersPage />} /> */}
              
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