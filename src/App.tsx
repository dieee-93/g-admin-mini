import { Box, Heading, Text, SimpleGrid, Card, Stack, Button, Badge, Flex, Icon } from "@chakra-ui/react";
import { Toaster } from "./components/ui/toaster";
import { useState } from "react";

// Iconos simples usando emoji o texto
const ModuleCard = ({ title, description, icon, stats, onNavigate, color = "blue" }) => (
  <Card.Root>
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
        >
          Gestionar
        </Button>
      </Stack>
    </Card.Body>
  </Card.Root>
);

const QuickStatsCard = ({ title, value, subtitle, color = "gray" }) => (
  <Card.Root>
    <Card.Body>
      <Stack spacing={2} textAlign="center">
        <Text fontSize="sm" color="gray.600">{title}</Text>
        <Text fontSize="3xl" fontWeight="bold" color={`${color}.500`}>
          {value}
        </Text>
        <Text fontSize="xs" color="gray.500">{subtitle}</Text>
      </Stack>
    </Card.Body>
  </Card.Root>
);

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleNavigation = (module) => {
    setCurrentView(module);
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (currentView !== 'dashboard') {
    return (
      <Box p={4}>
        <Toaster />
        <Flex align="center" gap={3} mb={6}>
          <Button variant="ghost" onClick={backToDashboard}>
            ← Volver al Dashboard
          </Button>
          <Heading size="lg">
            {currentView === 'items' ? 'Gestión de Insumos' : 
             currentView === 'stock' ? 'Entradas de Stock' :
             currentView === 'recipes' ? 'Recetas' :
             currentView === 'products' ? 'Productos' :
             currentView === 'sales' ? 'Ventas' : 'Módulo'}
          </Heading>
        </Flex>
        
        <Box bg="gray.50" p={6} borderRadius="md" textAlign="center">
          <Text>Módulo en desarrollo...</Text>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Este módulo será implementado próximamente
          </Text>
        </Box>
      </Box>
    );
  }

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

      {/* Stats rápidas */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.700">Resumen del día</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <QuickStatsCard 
            title="Insumos"
            value="12"
            subtitle="registrados"
            color="blue"
          />
          <QuickStatsCard 
            title="Stock total"
            value="$2,450"
            subtitle="valor inventario"
            color="green"
          />
          <QuickStatsCard 
            title="Productos"
            value="8"
            subtitle="disponibles"
            color="purple"
          />
          <QuickStatsCard 
            title="Ventas hoy"
            value="$350"
            subtitle="5 transacciones"
            color="orange"
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
            stats={{ value: "12", label: "insumos registrados" }}
            color="blue"
            onNavigate={() => handleNavigation('items')}
          />
          
          <ModuleCard
            title="Entradas de Stock"
            description="Registrar compras y entradas de mercadería"
            icon="📈"
            stats={{ value: "5", label: "entradas este mes" }}
            color="green"
            onNavigate={() => handleNavigation('stock')}
          />
          
          <ModuleCard
            title="Recetas"
            description="Crear recetas y calcular costos de producción"
            icon="📋"
            stats={{ value: "3", label: "recetas activas" }}
            color="purple"
            onNavigate={() => handleNavigation('recipes')}
          />
          
          <ModuleCard
            title="Productos"
            description="Productos finales y composiciones"
            icon="🛍️"
            stats={{ value: "8", label: "productos disponibles" }}
            color="orange"
            onNavigate={() => handleNavigation('products')}
          />
          
          <ModuleCard
            title="Ventas"
            description="Registrar ventas y controlar ingresos"
            icon="💰"
            stats={{ value: "$1,250", label: "ventas esta semana" }}
            color="teal"
            onNavigate={() => handleNavigation('sales')}
          />
          
          <ModuleCard
            title="Clientes"
            description="Base de datos de clientes"
            icon="👥"
            stats={{ value: "45", label: "clientes registrados" }}
            color="pink"
            onNavigate={() => handleNavigation('customers')}
          />
        </SimpleGrid>
      </Box>

      {/* Acciones rápidas */}
      <Box>
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
                onClick={() => handleNavigation('recipes')}
              >
                + Nueva Receta
              </Button>
              <Button 
                colorScheme="orange" 
                size="lg"
                onClick={() => handleNavigation('sales')}
              >
                + Registrar Venta
              </Button>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </Box>

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