// OperationsPage.tsx - Pure Orchestrator Pattern
// Following G-Admin Mini architecture standards

import React from 'react';

// Design System Components
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

import { Icon } from '@/shared/ui';

// Hooks
import { useHubPage } from './hooks';

// Components
import { OperationsHeader, Planning, Kitchen, Tables, Monitoring } from './components';

export default function OperationsPage() {
  // All logic delegated to the orchestrator hook
  const {
    overviewCards,
    tabs
  } = useHubPage();

  return (
      <Stack gap="lg" align="stretch">
        <OperationsHeader />

        {/* Operations Overview CardWrappers - Using hook data */}
        <Stack direction={{ base: 'column', lg: 'row' }} gap="md">
          {overviewCards.map((card) => (
            <CardWrapper key={card.id} variant="elevated" padding="md" width="full">
              <CardWrapper.Body>
                <VStack align="start" gap="xs">
                  <HStack gap="sm">
                    <Icon icon={card.icon} size="lg" color={card.color} />
                    <Typography variant="title">{card.title}</Typography>
                  </HStack>
                  <Typography variant="body" color="text.muted">
                    {card.description}
                  </Typography>
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>
          ))}
        </Stack>

        {/* Tabbed Layout for Sections */}
        <Tabs>
          <TabList>
            {tabs.map((tab) => (
              <Tab key={tab.id}>{tab.label}</Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <Planning />
            </TabPanel>
            <TabPanel>
              <Kitchen />
            </TabPanel>
            <TabPanel>
              <Tables />
            </TabPanel>
            <TabPanel>
              <Monitoring />
            </TabPanel>
          </TabPanels>
        </Tabs>
    </Stack>
  );
}
