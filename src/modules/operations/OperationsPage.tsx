// Operations Page - Unified dashboard without nested tabs
import React, { useEffect } from 'react';
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  Grid,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  ClockIcon, 
  ChartBarIcon, 
  CogIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { useNavigation } from '@/contexts/NavigationContext';

// Components
import { OperationsHeader } from './components/OperationsHeader';
import { PlanningSection } from './components/sections/PlanningSection';
import { KitchenSection } from './components/sections/KitchenSection';
import { TablesSection } from './components/sections/TablesSection';
import { MonitoringSection } from './components/sections/MonitoringSection';

export function OperationsPage() {
  const { setQuickActions } = useNavigation();

  useEffect(() => {
    setQuickActions([
      {
        id: 'new-recipe',
        label: 'Nueva Receta',
        icon: CogIcon,
        action: () => console.log('New recipe'),
        color: 'orange'
      }
    ]);
  }, [setQuickActions]);

  return (
    <Box p={{ base: 2, md: 6 }} pb={{ base: '90px', md: 6 }}>
      <OperationsHeader />

      {/* Unified Operations Dashboard - No nested tabs */}
      <VStack gap={6} mt={6} align="stretch">
        {/* Operations Overview Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <Icon icon={CalendarIcon} size="lg" className="text-blue-600" />
                <Heading size="sm">Planificación</Heading>
                <Text fontSize="sm" color="gray.600">
                  Gestión de horarios y recursos
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <Icon icon={CogIcon} size="lg" className="text-green-600" />
                <Heading size="sm">Cocina</Heading>
                <Text fontSize="sm" color="gray.600">
                  Estado y órdenes activas
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <Icon icon={ChartBarIcon} size="lg" className="text-purple-600" />
                <Heading size="sm">Mesas</Heading>
                <Text fontSize="sm" color="gray.600">
                  Ocupación y reservas
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <Icon icon={ClockIcon} size="lg" className="text-orange-600" />
                <Heading size="sm">Monitoreo</Heading>
                <Text fontSize="sm" color="gray.600">
                  Métricas en tiempo real
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* All sections displayed together */}
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
          <Card.Root>
            <Card.Header>
              <Heading size="md">Planificación de Operaciones</Heading>
            </Card.Header>
            <Card.Body>
              <PlanningSection />
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Estado de Cocina</Heading>
            </Card.Header>
            <Card.Body>
              <KitchenSection />
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Gestión de Mesas</Heading>
            </Card.Header>
            <Card.Body>
              <TablesSection />
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Monitoreo en Tiempo Real</Heading>
            </Card.Header>
            <Card.Body>
              <MonitoringSection />
            </Card.Body>
          </Card.Root>
        </Grid>
      </VStack>
    </Box>
  );
}
