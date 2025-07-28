import { Box, Heading, Text, SimpleGrid, Card, Stack, Button, Badge, Flex, Spinner } from "@chakra-ui/react";
import { Toaster } from "./components/ui/toaster";
import { useState } from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
// Importar los módulos reales
import ItemsPage from "./features/items";
import StockEntriesPage from "./features/stock_entries";

// Componentes del dashboard
const ModuleCard = ({ title, description, icon, stats, onNavigate, color = "blue", disabled = false }) => (
  <Card.Root opacity={disabled ? 0.6 : 1}>
    <Card.Body>
      <Stack spacing={3}>
        <Flex align="center" gap={3}>
          <Box fontSize="2xl">{icon}</Box>
          <Box>
            <Heading size="md">{title}</Heading>
            <Text color="gray.600" fontSize="sm">{description}</Text>
          </Box>
        </Flex>
        
        {stats && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color={`${color}.500`}>
              {stats.value}
            </Text>
            <Text fontSize="sm" color="gray.500">{stats.label}</Text>
          </Box>
        )}
        
        <Button 
          size="sm" 
          colorScheme={color}
          onClick={onNavigate}
          disabled={disabled}
        >
          {disabled ? "Próximamente" : "Gestionar"}
        </Button>
      </Stack>
    </Card.Body>
  </Card.Root>
);

const QuickStatsCard = ({ title, value, subtitle, color = "gray", loading = false }) => (
  <Card.Root>
    <Card.Body>
      <Stack spacing={2} textAlign="center">
        <Text fontSize="sm" color="gray.600">{title}</Text>
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <Text fontSize="3xl" fontWeight="bold" color={`${color}.500`}>
            {value}
          </Text>
        )}
        <Text fontSize="xs" color="gray.500">{subtitle}</Text>
      </Stack>
    </Card.Body>
  </Card.Root>
);

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { stats, reloadStats } = useDashboardStats();

  const handleNavigation = (module) => {
    setCurrentView(module);
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
    // Recargar stats cuando volvemos al dashboard
    reloadStats();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Renderizar módulos reales
  if (currentView === 'items') {
    return (
      <Box>
        <Toaster />
        <Flex align="center" gap={3} mb={6} p={4}>
          <Button variant="ghost" onClick={backToDashboard}>
            ← Dashboard
          </Button>
          <Heading size="lg" color="blue.600">Gestión de Insumos</Heading>
        </Flex>
        <ItemsPage />
      </Box>
    );
  }

  if (currentView === 'stock') {
    return (
      <Box>
        <Toaster />
        <Flex align="center" gap={3} mb={6} p={4}>
          <Button variant="ghost" onClick={backToDashboard}>
            ← Dashboard
          </Button>
          <Heading size="lg" color="green.600">Entradas de Stock</Heading>
        </Flex>
        <StockEntriesPage />
      </Box>
    );
  }

  // Módulos en desarrollo
  if (currentView !== 'dashboard') {
    return (
      <Box p={4}>
        <Toaster />
        <Flex align="center" gap={3} mb={6}>
          <Button variant="ghost" onClick={backToDashboard}>
            ← Dashboard
          </Button>
          <Heading size="lg">
            {currentView === 'recipes' ? 'Recetas' :
             currentView === 'products' ? 'Productos' :
             currentView === 'sales' ? 'Ventas' : 
             currentView === 'customers' ? 'Clientes' : 'Módulo'}
          </Heading>
        </Flex>
        
        <Card.Root>
          <Card.Body textAlign="center" py={12}>
            <Box fontSize="4xl" mb={4}>🚧</Box>
            <Heading size="md" mb={2}>Módulo en desarrollo</Heading>
            <Text color="gray.600" mb={4}>
              Este módulo será implementado próximamente
            </Text>
            <Button onClick={backToDashboard}>
              Volver al Dashboard
            </Button>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }

  // Dashboard principal
  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Toaster />
      
      {/* Header */}
      <Box mb={8}>
        <Flex align="center" gap={3} mb={2}>
          <Box fontSize="2xl">🏪</Box>
          <Heading size="xl" color="gray.800">G-Mini</Heading>
          <Badge colorScheme="green" variant="solid">v1.0</Badge>
        </Flex>
        <Text color="gray.600" fontSize="lg">
          Control simple de stock y recetas para tu negocio
        </Text>
      </Box>

      {/* Stats rápidas con datos reales */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.700">Resumen actual</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <QuickStatsCard 
            title="Insumos"
            value={stats.totalItems.toString()}
            subtitle="registrados"
            color="blue"
            loading={stats.loading}
          />
          <QuickStatsCard 
            title="Valor del stock"
            value={formatCurrency(stats.totalStockValue)}
            subtitle="inventario actual"
            color="green"
            loading={stats.loading}
          />
          <QuickStatsCard 
            title="Entradas mes"
            value={stats.stockEntriesThisMonth.toString()}
            subtitle="este mes"
            color="purple"
            loading={stats.loading}
          />
          <QuickStatsCard 
            title="Stock bajo"
            value={stats.lowStockItems.toString()}
            subtitle="requieren atención"
            color={stats.lowStockItems > 0 ? "red" : "gray"}
            loading={stats.loading}
          />
        </SimpleGrid>
      </Box>

      {/* Módulos principales */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.700">Módulos principales</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <ModuleCard
            title="Insumos"
            description="Gestionar materias primas y productos base"
            icon="📦"
            stats={{ 
              value: stats.loading ? "..." : stats.totalItems.toString(), 
              label: "insumos registrados" 
            }}
            color="blue"
            onNavigate={() => handleNavigation('items')}
          />
          
          <ModuleCard
            title="Entradas de Stock"
            description="Registrar compras y entradas de mercadería"
            icon="📈"
            stats={{ 
              value: stats.loading ? "..." : stats.stockEntriesThisMonth.toString(), 
              label: "entradas este mes" 
            }}
            color="green"
            onNavigate={() => handleNavigation('stock')}
          />
          
          <ModuleCard
            title="Recetas"
            description="Crear recetas y calcular costos de producción"
            icon="📋"
            stats={{ value: "0", label: "próximamente" }}
            color="purple"
            disabled={true}
            onNavigate={() => handleNavigation('recipes')}
          />
          
          <ModuleCard
            title="Productos"
            description="Productos finales y composiciones"
            icon="🛍️"
            stats={{ value: "0", label: "próximamente" }}
            color="orange"
            disabled={true}
            onNavigate={() => handleNavigation('products')}
          />
          
          <ModuleCard
            title="Ventas"
            description="Registrar ventas y controlar ingresos"
            icon="💰"
            stats={{ value: "$0", label: "próximamente" }}
            color="teal"
            disabled={true}
            onNavigate={() => handleNavigation('sales')}
          />
          
          <ModuleCard
            title="Clientes"
            description="Base de datos de clientes"
            icon="👥"
            stats={{ value: "0", label: "próximamente" }}
            color="pink"
            disabled={true}
            onNavigate={() => handleNavigation('customers')}
          />
        </SimpleGrid>
      </Box>

      {/* Acciones rápidas */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.700">Acciones rápidas</Heading>
        <Card.Root>
          <Card.Body>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Button 
                colorScheme="blue" 
                size="lg" 
                onClick={() => handleNavigation('items')}
              >
                + Nuevo Insumo
              </Button>
              <Button 
                colorScheme="green" 
                size="lg"
                onClick={() => handleNavigation('stock')}
              >
                + Entrada Stock
              </Button>
              <Button 
                colorScheme="purple" 
                size="lg"
                disabled
              >
                + Nueva Receta
              </Button>
              <Button 
                colorScheme="orange" 
                size="lg"
                disabled
              >
                + Registrar Venta
              </Button>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </Box>

      {/* Alertas/Avisos */}
      {!stats.loading && stats.lowStockItems > 0 && (
        <Card.Root bg="red.50" borderColor="red.200" mb={6}>
          <Card.Body>
            <Flex align="center" gap={3}>
              <Box fontSize="xl">⚠️</Box>
              <Box>
                <Heading size="sm" color="red.700">
                  ¡Atención! Stock bajo detectado
                </Heading>
                <Text fontSize="sm" color="red.600">
                  {stats.lowStockItems} {stats.lowStockItems === 1 ? 'insumo tiene' : 'insumos tienen'} stock bajo (menos de 10 unidades)
                </Text>
              </Box>
              <Button 
                size="sm" 
                colorScheme="red" 
                onClick={() => handleNavigation('items')}
                ml="auto"
              >
                Revisar
              </Button>
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      {/* Footer info */}
      <Box mt={12} pt={6} borderTop="1px solid" borderColor="gray.200" textAlign="center">
        <Text fontSize="sm" color="gray.500">
          G-Mini Dashboard • Gestión integral de tu negocio
        </Text>
      </Box>
    </Box>
  );
}

export default App;