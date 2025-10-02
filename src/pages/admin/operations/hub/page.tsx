// OperationsPage.tsx - Integrated with EventBus + CapabilityGate
// Following G-Admin Mini v2.1 architecture standards

import React from 'react';

// Design System Components v2.1 (UPDATED)
import {
  // Semantic Layout Components (PRIORITY)
  ContentLayout, Section, StatsSection, CardGrid, MetricCard,

  // Base Components
  Stack, VStack, HStack, Typography, Button, Alert,

  // Legacy (for tabs only)
  Tabs, TabList, Tab, TabPanels, TabPanel
} from '@/shared/ui';

import { Icon } from '@/shared/ui';

// CapabilityGate and Slot integration
import { CapabilityGate } from '@/lib/capabilities';
import { Slot } from '@/lib/composition';

// Module integration
import { useModuleIntegration } from '@/hooks/useModuleIntegration';

// Hooks
import { useHubPage } from './hooks';

// Components
import { OperationsHeader, Planning, Kitchen, Tables, Monitoring } from './components';

import { logger } from '@/lib/logging';
// Module configuration for Operations
const OPERATIONS_MODULE_CONFIG = {
  capabilities: ['restaurant_operations', 'kitchen_management', 'table_service', 'pos_system'],
  events: {
    emits: ['order_created', 'order_ready', 'table_occupied', 'table_freed', 'kitchen_alert'],
    listens: ['sales.order_placed', 'inventory.stock_low', 'staff.shift_changed']
  },
  eventHandlers: {
    'sales.order_placed': (data: any) => {
      logger.info('App', '🍽️ Operations: New order received', data);
      // Handle new order from sales
    },
    'inventory.stock_low': (data: any) => {
      logger.info('App', '📦 Operations: Stock alert received', data);
      // Handle low stock alerts
    },
    'staff.shift_changed': (data: any) => {
      logger.info('App', '👥 Operations: Staff shift update', data);
      // Handle staff changes affecting operations
    }
  },
  slots: ['operations-dashboard', 'kitchen-extensions', 'table-management']
} as const;

export default function OperationsPage() {
  // Module integration (EventBus + CapabilityGate + Slots)
  const { emitEvent, hasCapability, status, registerSlotContent } = useModuleIntegration(
    'operations',
    OPERATIONS_MODULE_CONFIG
  );

  // Page orchestration logic
  const {
    overviewCards,
    tabs,
    metrics,
    loading,
    error
  } = useHubPage();

  // Enhanced actions with EventBus integration
  const handleOrderCreated = (orderData: any) => {
    emitEvent('order_created', {
      orderId: orderData.id,
      tableId: orderData.tableId,
      items: orderData.items,
      totalAmount: orderData.total,
      priority: orderData.priority || 'normal'
    });
  };

  const handleTableStatusChange = (tableId: string, status: 'occupied' | 'free') => {
    emitEvent(status === 'occupied' ? 'table_occupied' : 'table_freed', {
      tableId,
      timestamp: Date.now(),
      capacity: 4 // TODO: get from table data
    });
  };

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de carga">
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* 🔒 Module status indicator */}
      {!status.isActive && (
        <Alert
          variant="subtle"
          title="Module Capabilities Required"
          description={`Missing capabilities: ${status.missingCapabilities.join(', ')}`}
        />
      )}

      {/* Operations Metrics Section */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          {overviewCards.map((card) => (
            <MetricCard
              key={card.id}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              colorPalette={card.status === 'critical' ? 'red' : card.status === 'warning' ? 'yellow' : 'blue'}
            />
          ))}
        </CardGrid>
      </StatsSection>

      {/* Operations Management Tabs */}
      <Section variant="elevated" title="Operations Management">
        <Tabs>
          <TabList>
            {tabs.map((tab) => (
              <Tab key={tab.id}>{tab.label}</Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <CapabilityGate capability="restaurant_operations">
                <Planning onOrderCreated={handleOrderCreated} />
              </CapabilityGate>
            </TabPanel>
            <TabPanel>
              <CapabilityGate capability="kitchen_management">
                <Kitchen />
              </CapabilityGate>
            </TabPanel>
            <TabPanel>
              <CapabilityGate capability="table_service">
                <Tables onTableStatusChange={handleTableStatusChange} />
              </CapabilityGate>
            </TabPanel>
            <TabPanel>
              <CapabilityGate capability="restaurant_operations">
                <Monitoring />
              </CapabilityGate>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Section>

      {/* Extensions Slot */}
      <Slot id="operations-dashboard" fallback={null} />
    </ContentLayout>
  );
}
