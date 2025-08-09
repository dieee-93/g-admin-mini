// Operations Page - Main hub for Kitchen + Tables + Production + Monitoring
import React, { useState } from 'react';
import {
  Box,
  Card,
  Heading,
  Text,
  HStack,
  Tabs,
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
  const [activeTab, setActiveTab] = useState('planning');

  const tabs = [
    {
      id: 'planning',
      label: 'Planificación',
      icon: CalendarIcon,
      component: <PlanningSection />
    },
    {
      id: 'kitchen',
      label: 'Cocina',
      icon: CogIcon,
      component: <KitchenSection />
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: ChartBarIcon,
      component: <TablesSection />
    },
    {
      id: 'monitoring',
      label: 'Monitoreo',
      icon: ClockIcon,
      component: <MonitoringSection />
    }
  ];

  return (
    <Box p={{ base: 2, md: 6 }} pb={{ base: '90px', md: 6 }}>
      <OperationsHeader />

      <Card.Root mt={6}>
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                <HStack gap={2}>
                  <Icon icon={tab.icon} size="sm" />
                  <Text>{tab.label}</Text>
                </HStack>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {tabs.map((tab) => (
            <Tabs.Content key={tab.id} value={tab.id}>
              <Box p={4}>
                {tab.component}
              </Box>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Card.Root>
    </Box>
  );
}
