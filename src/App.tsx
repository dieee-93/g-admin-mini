// src/App.tsx - Versión con Breadcrumb Navigation integrado
import { Box, Heading, Flex, Button } from "@chakra-ui/react";
import { Toaster } from "./components/ui/toaster";
import { useState, lazy, Suspense } from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { DashboardView } from "./components/dashboard/DashboardView";
import { ModuleHeader } from "./components/layout/ModuleHeader";
import { useBreadcrumb, BreadcrumbContext } from "./hooks/useBreadcrumb"; // ✅ NUEVO
import { type AppRoute } from "./types/app";

// Lazy loading de módulos
const ItemsPage = lazy(() => import("./features/items"));
const StockEntriesPage = lazy(() => import("./features/stock_entries"));
const RecipesPage = lazy(() => import("./features/recipes"));
const SalesPage = lazy(() => import("./features/sales"));
const CustomersPage = lazy(() => import("./features/customers"));
const UnderDevelopmentPage = lazy(() => import("./components/common/UnderDevelopment"));

const MODULE_CONFIG = {
  items: { title: "Gestión de Insumos", color: "blue" },
  stock: { title: "Entradas de Stock", color: "green" },
  recipes: { title: "Recetas", color: "purple" },
  products: { title: "Productos", color: "orange" },
  sales: { title: "Ventas", color: "teal" },
  customers: { title: "Clientes", color: "pink" },
} as const;

function App() {
  const [currentView, setCurrentView] = useState<AppRoute>('dashboard');
  const { stats, reloadStats } = useDashboardStats();
  
  // ✅ NUEVO: Hook de breadcrumb
  const { breadcrumbItems, setBreadcrumbContext } = useBreadcrumb(handleNavigation);

  function handleNavigation(module: AppRoute) {
    setCurrentView(module);
    
    // ✅ NUEVO: Actualizar breadcrumb según el módulo
    if (module !== 'dashboard') {
      setBreadcrumbContext(module as BreadcrumbContext);
    }
  }

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setBreadcrumbContext('dashboard'); // ✅ NUEVO: Reset breadcrumb
    reloadStats();
  };

  const renderModule = () => {
    const moduleConfig = MODULE_CONFIG[currentView as keyof typeof MODULE_CONFIG];
    
    if (currentView === 'dashboard') {
      return (
        <DashboardView 
          stats={stats} 
          onNavigate={handleNavigation}
        />
      );
    }

    return (
      <Box>
        <ModuleHeader 
          title={moduleConfig?.title || 'Módulo'}
          color={moduleConfig?.color || 'gray'}
          onBack={backToDashboard}
          breadcrumbItems={breadcrumbItems} // ✅ NUEVO: Pasar breadcrumbs
        />
        
        <Suspense fallback={<LoadingSpinner />}>
          {currentView === 'items' && <ItemsPage />}
          {currentView === 'stock' && <StockEntriesPage />}
          {currentView === 'recipes' && <RecipesPage />}
          {currentView === 'sales' && <SalesPage />}
          {currentView === 'customers' && <CustomersPage />}
          {!['items', 'stock', 'recipes', 'sales', 'customers'].includes(currentView) && (
            <UnderDevelopmentPage onBack={backToDashboard} />
          )}
        </Suspense>
      </Box>
    );
  };

  return (
    <Box>
      <Toaster />
      {renderModule()}
    </Box>
  );
}

export default App;