// OperationsPage.tsx - Redesigned with Design System Patterns
// Following same conventions as CostAnalysisTab.tsx and MenuEngineeringOnly.tsx

import React, { useEffect } from 'react';

// SOLO Design System Components - SIGUIENDO LAS REGLAS
import {
  // Layout & Structure
  Stack,
  VStack,
  HStack,
  
  // Typography
  Typography,
  
  // Components
  Card
} from '@/shared/ui';

// Icons
import { 
  ClockIcon, 
  ChartBarIcon, 
  CogIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useNavigation } from '@/contexts/NavigationContext';

// Components
import { OperationsHeader } from './components/OperationsHeader';
import { PlanningSection } from './components/sections/PlanningSection';
import { KitchenSection } from './components/sections/KitchenSection';
import { TablesSection } from './components/sections/TablesSection';
import { MonitoringSection } from './components/sections/MonitoringSection';

export default function OperationsPage() {
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
      <Stack gap="lg" align="stretch">
        <OperationsHeader />

        {/* Operations Overview Cards - Design System Pattern */}
        <Stack direction={{ base: 'column', lg: 'row' }} gap="md">
          <Card variant="elevated" padding="md" width="full">
            <Card.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                  <Typography variant="title">Planificación</Typography>
                </HStack>
                <Typography variant="body" color="muted">
                  Gestión de horarios y recursos
                </Typography>
              </VStack>
            </Card.Body>
          </CardWrapper>

          <Card variant="elevated" padding="md" width="full">
            <Card.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <CogIcon className="w-6 h-6 text-green-600" />
                  <Typography variant="title">Cocina</Typography>
                </HStack>
                <Typography variant="body" color="muted">
                  Estado y órdenes activas
                </Typography>
              </VStack>
            </Card.Body>
          </CardWrapper>

          <Card variant="elevated" padding="md" width="full">
            <Card.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  <Typography variant="title">Mesas</Typography>
                </HStack>
                <Typography variant="body" color="muted">
                  Ocupación y reservas
                </Typography>
              </VStack>
            </Card.Body>
          </CardWrapper>

          <Card variant="elevated" padding="md" width="full">
            <Card.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                  <Typography variant="title">Monitoreo</Typography>
                </HStack>
                <Typography variant="body" color="muted">
                  Métricas en tiempo real
                </Typography>
              </VStack>
            </Card.Body>
          </CardWrapper>
        </Stack>

        {/* All sections displayed together - Design System Grid */}
        <Stack direction={{ base: 'column', xl: 'row' }} gap="lg">
          <Card variant="elevated" padding="lg" width="full">
            <Card.Header>
              <Typography variant="title">Planificación de Operaciones</Typography>
            </Card.Header>
            <Card.Body>
              <PlanningSection />
            </Card.Body>
          </CardWrapper>

          <Card variant="elevated" padding="lg" width="full">
            <Card.Header>
              <Typography variant="title">Estado de Cocina</Typography>
            </Card.Header>
            <Card.Body>
              <KitchenSection />
            </Card.Body>
          </CardWrapper>
        </Stack>

        <Stack direction={{ base: 'column', xl: 'row' }} gap="lg">
          <Card variant="elevated" padding="lg" width="full">
            <Card.Header>
              <Typography variant="title">Gestión de Mesas</Typography>
            </Card.Header>
            <Card.Body>
              <TablesSection />
            </Card.Body>
          </CardWrapper>

          <Card variant="elevated" padding="lg" width="full">
            <Card.Header>
              <Typography variant="title">Monitoreo en Tiempo Real</Typography>
            </Card.Header>
            <Card.Body>
              <MonitoringSection />
            </Card.Body>
          </CardWrapper>
        </Stack>
    </Stack>
  );
}
