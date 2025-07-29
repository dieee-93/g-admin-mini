// src/App.tsx - Versión refactorizada CON SALES
import { Box, Heading, Flex, Button } from "@chakra-ui/react";
import { Toaster } from "./components/ui/toaster";
import { useState, lazy, Suspense } from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { DashboardView } from "./components/dashboard/DashboardView";
import { ModuleHeader } from "./components/layout/ModuleHeader";
import { type AppRoute } from "./types/app";

// Lazy loading de módulos
const ItemsPage = lazy(() => import("./features/items"));
const StockEntriesPage = lazy(() => import("./features/stock_entries"));
const RecipesPage = lazy(() => import("./features/recipes"));
const SalesPage = lazy(() => import("./features/sales")); // ✅ NUEVO
const UnderDevelopmentPage = lazy(() => import("./components/common/UnderDevelopment"));

const MODULE_CONFIG = {
  items: { title: "Gestión de Insumos", color: "blue" },
  stock: { title: "Entradas de Stock", color: "green" },
  recipes: { title: "Recetas", color: "purple" },
  products: { title: "Productos", color: "orange" },
  sales: { title: "Ventas", color: "teal" }, // ✅ NUEVO
  customers: { title: "Clientes", color: "pink" },
} as const;

function App() {
  const [currentView, setCurrentView] = useState<AppRoute>('dashboard');
  const { stats, reloadStats } = useDashboardStats();

  const handleNavigation = (module: AppRoute) => {
    setCurrentView(module);
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
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
        />
        
        <Suspense fallback={<LoadingSpinner />}>
          {currentView === 'items' && <ItemsPage />}
          {currentView === 'stock' && <StockEntriesPage />}
          {currentView === 'recipes' && <RecipesPage />}
          {currentView === 'sales' && <SalesPage />}
          {!['items', 'stock', 'recipes', 'sales'].includes(currentView) && (
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