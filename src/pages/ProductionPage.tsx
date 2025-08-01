// src/pages/ProductionPage.tsx
// ✅ NUEVO: Página de producción integrada con NavigationContext

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Tabs,
  Badge,
  Grid
} from '@chakra-ui/react';
import {
  CogIcon,
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

export function ProductionPage() {
  // ✅ Integración con NavigationContext
  const { setQuickActions } = useNavigation();

  // Local state
  const [activeTab, setActiveTab] = useState('recipes');
  const [productionStats] = useState({
    totalRecipes: 0,
    activeProductions: 0,
    avgCostPerUnit: 0,
    monthlyProduced: 0
  });

  // ✅ Configurar quick actions contextuales
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: DocumentTextIcon,
        action: () => setActiveTab('recipes'),
        color: 'purple'
      },
      {
        id: 'start-production',
        label: 'Iniciar Producción',
        icon: CogIcon,
        action: () => setActiveTab('production'),
        color: 'green'
      },
      {
        id: 'cost-calculator',
        label: 'Calcular Costos',
        icon: CurrencyDollarIcon,
        action: () => setActiveTab('costs'),
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* Header con métricas */}
        <VStack align="start" gap="2">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Producción</Text>
              <Text color="gray.600">
                Recetas, costos y planificación de producción
              </Text>
            </VStack>

            {/* Estadísticas */}
            <Grid templateColumns="repeat(4, 1fr)" gap="6">
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {productionStats.totalRecipes}
                </Text>
                <Text fontSize="xs" color="gray.500">Recetas</Text>
              </VStack>
              
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {productionStats.activeProductions}
                </Text>
                <Text fontSize="xs" color="gray.500">En Producción</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  ${productionStats.avgCostPerUnit}
                </Text>
                <Text fontSize="xs" color="gray.500">Costo Promedio</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {productionStats.monthlyProduced}
                </Text>
                <Text fontSize="xs" color="gray.500">Mes Actual</Text>
              </VStack>
            </Grid>
          </HStack>
        </VStack>

        {/* Tabs */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="recipes">
              <DocumentTextIcon className="w-4 h-4" />
              Recetas
              <Badge colorPalette="purple" variant="subtle">
                {productionStats.totalRecipes}
              </Badge>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="production">
              <CogIcon className="w-4 h-4" />
              Producción Activa
            </Tabs.Trigger>
            
            <Tabs.Trigger value="costs">
              <CurrencyDollarIcon className="w-4 h-4" />
              Análisis de Costos
            </Tabs.Trigger>

            <Tabs.Trigger value="planning">
              <ClockIcon className="w-4 h-4" />
              Planificación
            </Tabs.Trigger>
          </Tabs.List>

          {/* TAB: Recetas */}
          <Tabs.Content value="recipes">
            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Gestión de Recetas</Text>
                  <Button colorPalette="purple">
                    <PlusIcon className="w-4 h-4" />
                    Nueva Receta
                  </Button>
                </HStack>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Módulo en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás crear y gestionar recetas, calcular ingredientes y costos de producción.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* TAB: Producción */}
          <Tabs.Content value="production">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">Producción Activa</Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <CogIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Control de producción en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás monitorear producciones activas, tiempos y cantidades.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* TAB: Costos */}
          <Tabs.Content value="costs">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">Análisis de Costos</Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <CurrencyDollarIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Calculadora de costos en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás analizar costos de producción, márgenes y rentabilidad.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* TAB: Planificación */}
          <Tabs.Content value="planning">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">Planificación de Producción</Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <ClockIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Sistema de planificación en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás planificar producciones futuras basadas en demanda y stock disponible.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
