// src/pages/ProductionPage.tsx
// ✅ REDESIGNED: Modern UI with improved navigation and visual hierarchy

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
  Grid,
  Separator
} from '@chakra-ui/react';
import {
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// ✅ Import individual section components (no nesting)
import { ProductionActiveTab } from '@/modules/products/ui/ProductionActiveTab';
import { ProductListOnly } from '@/modules/products/ui/ProductListOnly';
import { MenuEngineeringOnly } from '@/modules/products/ui/MenuEngineeringOnly';
import { CostCalculator } from '@/modules/products/ui/costs/CostCalculator';
import { CostAnalysisReports } from '@/modules/products/ui/costs/CostAnalysisReports';
import { PricingScenarios } from '@/modules/products/ui/costs/PricingScenarios';
import { ProductionPlanningOnly } from '@/modules/products/ui/ProductionPlanningOnly';
import { DemandForecastOnly } from '@/modules/products/ui/DemandForecastOnly';
import { ProductionScheduleOnly } from '@/modules/products/ui/ProductionScheduleOnly';

export function ProductionPage() {
  // ✅ Integración con NavigationContext
  const { setQuickActions } = useNavigation();

  // Local state - navegación completamente plana
  const [activeSection, setActiveSection] = useState('products-list');

  // ✅ Manejador de navegación completamente plano
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // ✅ Configurar quick actions contextuales
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-product',
        label: 'Nuevo Producto',
        icon: DocumentTextIcon,
        action: () => handleSectionChange('products-list'),
        color: 'purple'
      },
      {
        id: 'start-production',
        label: 'Iniciar Producción',
        icon: CogIcon,
        action: () => handleSectionChange('production-active'),
        color: 'green'
      },
      {
        id: 'cost-calculator',
        label: 'Calcular Costos',
        icon: CurrencyDollarIcon,
        action: () => handleSectionChange('cost-calculator'),
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // ✅ Estado para gestionar calculations compartidos
  const [calculations, setCalculations] = useState([]);

  // ✅ Renderizar contenido según sección activa - NAVEGACIÓN PLANA
  const renderContent = () => {
    switch (activeSection) {
      case 'products-list':
        return <ProductListOnly />;
      case 'menu-engineering':
        return <MenuEngineeringOnly />;
      case 'production-active':
        return <ProductionActiveTab />;
      case 'cost-calculator':
        return (
          <CostCalculator 
            calculations={calculations}
            onCalculationComplete={(newCalc) => setCalculations(prev => [newCalc, ...prev])}
          />
        );
      case 'cost-analysis':
        return <CostAnalysisReports calculations={calculations} />;
      case 'pricing-scenarios':
        return <PricingScenarios calculations={calculations} />;
      case 'production-planning':
        return <ProductionPlanningOnly />;
      case 'demand-forecast':
        return <DemandForecastOnly />;
      case 'production-schedule':
        return <ProductionScheduleOnly />;
      default:
        return <ProductListOnly />;
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} maxW="full">
      <VStack gap={6} align="stretch">
        {/* Modern Header with better visual hierarchy */}
        <Card.Root bg="gradient-to-r" bgGradient="linear(to-r, blue.50, purple.50)">
          <Card.Body>
            <VStack align="start" gap={3}>
              <HStack gap={3}>
                <Box 
                  p={3} 
                  bg="white" 
                  borderRadius="xl" 
                  shadow="sm"
                >
                  <BuildingStorefrontIcon className="w-8 h-8 text-blue-600" />
                </Box>
                <VStack align="start" gap={1}>
                  <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.800">
                    Centro de Producción
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    Gestión inteligente de productos y procesos de producción
                  </Text>
                </VStack>
              </HStack>
              
              {/* Quick Stats */}
              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} w="full">
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">24</Text>
                  <Text fontSize="xs" color="gray.600">Productos Activos</Text>
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">3</Text>
                  <Text fontSize="xs" color="gray.600">En Producción</Text>
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">94%</Text>
                  <Text fontSize="xs" color="gray.600">Eficiencia</Text>
                </VStack>
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.600">$2,450</Text>
                  <Text fontSize="xs" color="gray.600">Costos Hoy</Text>
                </VStack>
              </Grid>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Separator />

        {/* NAVEGACIÓN COMPLETAMENTE PLANA - 9 SECCIONES */}
        <Tabs.Root 
          value={activeSection} 
          onValueChange={(e) => handleSectionChange(e.value)}
          variant="enclosed"
          colorPalette="blue"
        >
          <Box overflowX="auto">
            <Tabs.List bg="gray.50" borderRadius="lg" p={1} minW="max-content">
              <Tabs.Trigger value="products-list" gap={2}>
                <DocumentTextIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Productos</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="menu-engineering" gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Menu Engineering</Text>
                <Badge colorPalette="purple" variant="subtle" size="sm">AI</Badge>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="production-active" gap={2}>
                <CogIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Producción Activa</Text>
                <Badge colorPalette="green" variant="outline" size="sm">3</Badge>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="cost-calculator" gap={2}>
                <CurrencyDollarIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Calculadora</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="cost-analysis" gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Análisis Costos</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="pricing-scenarios" gap={2}>
                <PlusIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Escenarios</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="production-planning" gap={2}>
                <ClipboardDocumentListIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Planificación</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="demand-forecast" gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Forecast</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="production-schedule" gap={2}>
                <ClockIcon className="w-4 h-4" />
                <Text display={{ base: "none", lg: "block" }}>Calendario</Text>
              </Tabs.Trigger>
            </Tabs.List>
          </Box>

          {/* Content with proper spacing */}
          <Box mt={6}>
            <Tabs.Content value={activeSection}>
              {renderContent()}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
