// src/components/dashboard/DashboardView.tsx
import { 
  Box, 
  Heading, 
  Grid, 
  VStack, 
  Text,
  Alert,
  Button,
  HStack
} from '@chakra-ui/react';
import { QuickStatsCard } from './QuickStatCard';
import { ModuleCard } from './ModuleCard';
import { type DashboardStats, type AppRoute } from '@/types/app';

interface DashboardViewProps {
  stats: DashboardStats;
  onNavigate: (route: AppRoute) => void;
}

export function DashboardView({ stats, onNavigate }: DashboardViewProps) {
  // Formatear valor monetario
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" color="gray.800" mb={2}>
            📊 Dashboard de Gestión
          </Heading>
          <Text color="gray.600">
            Resumen general de tu negocio y acceso rápido a módulos
          </Text>
        </Box>

        {/* Alertas importantes */}
        {!stats.loading && stats.lowStockItems > 0 && (
          <Alert.Root status="warning" borderRadius="md">
            <Alert.Indicator />
            <Alert.Description>
              <strong>{stats.lowStockItems}</strong> productos tienen stock bajo.{' '}
              <Button 
                size="sm" 
                variant="link" 
                colorScheme="orange"
                onClick={() => onNavigate('items')}
              >
                Ver inventario
              </Button>
            </Alert.Description>
          </Alert.Root>
        )}

        {/* Estadísticas rápidas */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            📈 Estadísticas Rápidas
          </Heading>
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} 
            gap={4}
          >
            <QuickStatsCard
              title="Total Insumos"
              value={stats.totalItems}
              subtitle="insumos registrados"
              color="blue"
              loading={stats.loading}
            />
            <QuickStatsCard
              title="Valor de Stock"
              value={formatCurrency(stats.totalStockValue)}
              subtitle="inventario total"
              color="green"
              loading={stats.loading}
            />
            <QuickStatsCard
              title="Entradas del Mes"
              value={stats.stockEntriesThisMonth}
              subtitle="ingresos de stock"
              color="purple"
              loading={stats.loading}
            />
            <QuickStatsCard
              title="Stock Bajo"
              value={stats.lowStockItems}
              subtitle="requieren atención"
              color={stats.lowStockItems > 0 ? "orange" : "gray"}
              loading={stats.loading}
            />
          </Grid>
        </Box>

        {/* Acciones rápidas */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            ⚡ Acciones Rápidas
          </Heading>
          <HStack spacing={4} flexWrap="wrap">
            <Button 
              colorScheme="green" 
              size="sm"
              onClick={() => onNavigate('stock')}
            >
              + Nueva Entrada de Stock
            </Button>
            <Button 
              colorScheme="blue" 
              size="sm"
              onClick={() => onNavigate('items')}
            >
              + Nuevo Insumo
            </Button>
            <Button 
              colorScheme="purple" 
              size="sm"
              variant="outline"
              onClick={() => onNavigate('recipes')}
            >
              📝 Ver Recetas
            </Button>
          </HStack>
        </Box>

        {/* Módulos principales */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            🔧 Módulos del Sistema
          </Heading>
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
            gap={6}
          >
            <ModuleCard
              title="Gestión de Insumos"
              description="Administra tu inventario de materias primas, productos elaborados y más."
              icon="📦"
              stats={{
                value: stats.totalItems,
                label: "insumos registrados"
              }}
              color="blue"
              onNavigate={() => onNavigate('items')}
            />

            <ModuleCard
              title="Entradas de Stock"
              description="Registra nuevas compras y entradas de mercadería al inventario."
              icon="📈"
              stats={{
                value: stats.stockEntriesThisMonth,
                label: "entradas este mes"
              }}
              color="green"
              onNavigate={() => onNavigate('stock')}
            />

            <ModuleCard
              title="Recetas"
              description="Crea y gestiona recetas de productos elaborados con costeo automático."
              icon="📝"
              color="purple"
              onNavigate={() => onNavigate('recipes')}
            />

            <ModuleCard
              title="Productos Finales"
              description="Define productos para venta y controla disponibilidad según stock."
              icon="🎯"
              color="orange"
              disabled={true}
              onNavigate={() => onNavigate('products')}
            />

            <ModuleCard
              title="Ventas"
              description="Registra ventas, genera comprobantes y analiza rendimiento."
              icon="💰"
              color="teal"
              disabled={true}
              onNavigate={() => onNavigate('sales')}
            />

            <ModuleCard
              title="Clientes"
              description="Gestiona base de datos de clientes y su historial de compras."
              icon="👥"
              color="pink"
              disabled={true}
              onNavigate={() => onNavigate('customers')}
            />
          </Grid>
        </Box>

        {/* Footer con información adicional */}
        <Box 
          mt={8} 
          p={4} 
          bg="gray.50" 
          borderRadius="md" 
          textAlign="center"
        >
          <Text fontSize="sm" color="gray.600">
            Sistema de gestión empresarial • v1.0 • 
            {new Date().getFullYear()}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}