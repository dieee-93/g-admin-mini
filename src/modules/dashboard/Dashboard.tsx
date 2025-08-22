// Dashboard Moderno 2025 - Diseño basado en mejores prácticas
// ✅ Jerarquía visual + Sin duplicación + Responsive + Operacional

import {
  Box,
  VStack,
  Text,
  Grid,
  HStack
} from '@chakra-ui/react';

// Componentes modernos
import {
  HeroMetricCard,
  MetricCard,
  SummaryPanel,
  QuickActionCard
} from '@/shared/components/widgets';
import { useModernDashboard } from './hooks';

export function Dashboard() {
  const {
    heroMetric,
    secondaryMetrics,
    summaryMetrics,
    summaryStatus,
    operationalActions,
    onConfigure
  } = useModernDashboard();

  return (
    <Box p={{ base: "4", md: "6" }} bg={{ base: "gray.50", _dark: "gray.900" }} minH="100vh">
  <VStack gap="4" align="stretch" maxW="container.xl" mx="auto">
        {/* Header compacto */}
        <HStack justify="space-between" align="end">
          <VStack align="start" gap="0">
            <Text fontSize="2xl" fontWeight="bold" color={{ base: "gray.900", _dark: "gray.50" }}>
              🏠 Dashboard
            </Text>
            <Text color={{ base: "gray.600", _dark: "gray.300" }} fontSize="md">
              Centro de comando · G-Admin
            </Text>
          </VStack>
        </HStack>

        {/* MÉTRICAS EN FORMATO HORIZONTAL COMPACTO */}
        <Grid 
          templateColumns={{ 
            base: "1fr", 
            md: "1.5fr 1fr 1fr", 
            lg: "2fr 1fr 1fr 1fr" 
          }} 
          gap="4"
          alignItems="stretch"
        >
          {/* Hero Metric - Más compacto */}
          <Box>
            <HeroMetricCard {...heroMetric} />
          </Box>
          
          {/* Secondary Metrics - Horizontales */}
          {secondaryMetrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </Grid>

        {/* RESUMEN OPERACIONAL - Expandido por defecto y más compacto */}
        <SummaryPanel
          title="Resumen Operacional"
          metrics={summaryMetrics}
          status={summaryStatus}
          onConfigure={onConfigure}
          defaultExpanded={true}
        />

        {/* ACCIONES RÁPIDAS - Más compactas */}
        <VStack align="start" gap="3">
          <Text fontSize="md" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.200" }}>
            ⚡ Acciones Rápidas
          </Text>
          
          <Grid 
            templateColumns={{ 
              base: "repeat(3, 1fr)", 
              md: "repeat(5, 1fr)", 
              lg: "repeat(5, 1fr)" 
            }} 
            gap="2"
            w="full"
          >
            {operationalActions.map((action) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                description={action.description}
                icon={action.icon}
                colorPalette={action.colorPalette}
                onClick={action.onClick}
              />
            ))}
          </Grid>
        </VStack>

        {/* SECCIÓN ADICIONAL - Actividad y Rendimiento */}
        <Grid 
          templateColumns={{ 
            base: "1fr", 
            md: "1fr 1fr", 
            lg: "1fr 1fr 1fr" 
          }} 
          gap="4"
        >
          {/* Actividad Reciente */}
          <Box bg={{ base: "white", _dark: "gray.800" }} p="4" borderRadius="lg" border="1px solid" borderColor={{ base: "gray.200", _dark: "gray.700" }} shadow="sm">
            <VStack align="start" gap="3">
              <Text fontSize="md" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.200" }}>
                📈 Tendencias Hoy
              </Text>
              <VStack align="stretch" gap="2" w="full">
                <HStack justify="space-between">
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Ventas</Text>
                  <Text fontSize="sm" fontWeight="medium" color="green.600">+12%</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Inventario</Text>
                  <Text fontSize="sm" fontWeight="medium" color="blue.600">Estable</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Personal</Text>
                  <Text fontSize="sm" fontWeight="medium" color="orange.600">85%</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Alertas */}
          <Box bg={{ base: "white", _dark: "gray.800" }} p="4" borderRadius="lg" border="1px solid" borderColor={{ base: "gray.200", _dark: "gray.700" }} shadow="sm">
            <VStack align="start" gap="3">
              <Text fontSize="md" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.200" }}>
                🔔 Notificaciones
              </Text>
              <VStack align="stretch" gap="2" w="full">
                <HStack>
                  <Box w="2" h="2" bg="orange.500" borderRadius="full" />
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Stock bajo: 3 productos</Text>
                </HStack>
                <HStack>
                  <Box w="2" h="2" bg="green.500" borderRadius="full" />
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Turno completo</Text>
                </HStack>
                <HStack>
                  <Box w="2" h="2" bg="blue.500" borderRadius="full" />
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>2 pedidos pendientes</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Performance */}
          <Box bg={{ base: "white", _dark: "gray.800" }} p="4" borderRadius="lg" border="1px solid" borderColor={{ base: "gray.200", _dark: "gray.700" }} shadow="sm">
            <VStack align="start" gap="3">
              <Text fontSize="md" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.200" }}>
                ⚡ Rendimiento
              </Text>
              <VStack align="stretch" gap="2" w="full">
                <HStack justify="space-between">
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Sistema</Text>
                  <Text fontSize="sm" fontWeight="medium" color="green.600">Óptimo</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Carga</Text>
                  <Text fontSize="sm" fontWeight="medium" color="blue.600">Normal</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>Respuesta</Text>
                  <Text fontSize="sm" fontWeight="medium" color="green.600">&lt; 100ms</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
}