// ============================================
// SUPPLIERS MANAGEMENT - Main component with tabs
// ============================================

import React from 'react';
import {
  Section,
  Stack,
  Button,
  InputField,
  Icon,
  Text,
  Tabs
} from '@/shared/ui';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { SuppliersTable } from './SuppliersTable';
import { AnalyticsTab } from './analytics';
import { OrdersList } from './orders/OrdersList';
import type { useSuppliersPage } from '../hooks/useSuppliersPage';

interface SuppliersManagementProps {
  pageState: ReturnType<typeof useSuppliersPage>;
}

// ⚡ PERFORMANCE: Wrap in React.memo to prevent re-renders when parent re-renders
// Component only re-renders if pageState prop actually changes
export const SuppliersManagement = React.memo(function SuppliersManagement({ pageState }: SuppliersManagementProps) {
  const {
    suppliers,
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    sort,
    setSort,
    openCreateModal,
    openEditModal,
    toggleActive,
    deleteSupplier
  } = pageState;

  return (
    <Section variant="elevated">
      <Tabs.Root
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
        variant="line"
        colorPalette="blue"
        lazyMount
        unmountOnExit={false}
      >
        {/* Tab Headers */}
        <Stack direction="row" justify="space-between" align="center" marginBottom={4}>
          <Tabs.List>
            <Tabs.Trigger value="list">
              Proveedores
            </Tabs.Trigger>
            <Tabs.Trigger value="orders">
              Órdenes de Compra
            </Tabs.Trigger>
            <Tabs.Trigger value="analytics">
              Analytics
            </Tabs.Trigger>
            <Tabs.Trigger value="performance">
              Performance
            </Tabs.Trigger>
          </Tabs.List>

          <Button
            size="sm"
            colorPalette="blue"
            onClick={openCreateModal}
          >
            <Icon icon={PlusIcon} size="xs" />
            Nuevo Proveedor
          </Button>
        </Stack>

        {/* Tab Content - Using Content.Group to prevent rerenders */}
        <Tabs.ContentGroup>
          {/* List Tab */}
          <Tabs.Content value="list">
            <Stack direction="column" gap="4">
              {/* Filters */}
              <Stack direction="row" gap="3">
                <InputField
                  placeholder="Buscar proveedores..."
                  value={filters.searchText}
                  onChange={(e) =>
                    setFilters({ searchText: e.target.value })
                  }
                  flex={1}
                />
                <Button variant="outline" size="sm">
                  <Icon icon={FunnelIcon} size="xs" />
                  Filtros
                </Button>
              </Stack>

              {/* Table */}
              <SuppliersTable
                suppliers={suppliers}
                loading={loading}
                sort={sort}
                onSortChange={setSort}
                onEdit={openEditModal}
                onToggleActive={toggleActive}
                onDelete={deleteSupplier}
              />
            </Stack>
          </Tabs.Content>

          {/* Orders Tab - Supplier Orders (replaces old Procurement) */}
          <Tabs.Content value="orders">
            <OrdersList />
          </Tabs.Content>

          {/* Analytics Tab - Lazy loaded */}
          <Tabs.Content value="analytics">
            <AnalyticsTab suppliers={suppliers} />
          </Tabs.Content>

          {/* Performance Tab - Lazy loaded */}
          <Tabs.Content value="performance">
            <Text fontSize="xl" fontWeight="semibold">
              Dashboard de Performance
            </Text>
            <Text color="fg.muted">
              Métricas de rendimiento en desarrollo...
            </Text>
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    </Section>
  );
});

export default SuppliersManagement;
