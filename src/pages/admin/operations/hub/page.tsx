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
  CardWrapper,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@/shared/ui';

// Icons
import { 
  ClockIcon, 
  ChartBarIcon, 
  CogIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui';

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

        {/* Operations Overview CardWrappers - Design System Pattern */}
        <Stack direction={{ base: 'column', lg: 'row' }} gap="md">
          <CardWrapper variant="elevated" padding="md" width="full">
            <CardWrapper.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Icon icon={CalendarIcon} size="lg" color="blue.600" />
                  <Typography variant="title">Planificación</Typography>
                </HStack>
                <Typography variant="body" color="text.muted">
                  Gestión de horarios y recursos
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" padding="md" width="full">
            <CardWrapper.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Icon icon={CogIcon} size="lg" color="green.600" />
                  <Typography variant="title">Cocina</Typography>
                </HStack>
                <Typography variant="body" color="text.muted">
                  Estado y órdenes activas
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" padding="md" width="full">
            <CardWrapper.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Icon icon={ChartBarIcon} size="lg" color="purple.600" />
                  <Typography variant="title">Mesas</Typography>
                </HStack>
                <Typography variant="body" color="text.muted">
                  Ocupación y reservas
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="elevated" padding="md" width="full">
            <CardWrapper.Body>
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Icon icon={ClockIcon} size="lg" color="orange.600" />
                  <Typography variant="title">Monitoreo</Typography>
                </HStack>
                <Typography variant="body" color="text.muted">
                  Métricas en tiempo real
                </Typography>
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        </Stack>

        {/* Tabbed Layout for Sections */}
        <Tabs>
          <TabList>
            <Tab>Planificación</Tab>
            <Tab>Cocina</Tab>
            <Tab>Mesas</Tab>
            <Tab>Monitoreo</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <PlanningSection />
            </TabPanel>
            <TabPanel>
              <KitchenSection />
            </TabPanel>
            <TabPanel>
              <TablesSection />
            </TabPanel>
            <TabPanel>
              <MonitoringSection />
            </TabPanel>
          </TabPanels>
        </Tabs>
    </Stack>
  );
}
