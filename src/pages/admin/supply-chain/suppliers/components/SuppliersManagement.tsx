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
import type { useSuppliersPage } from '../hooks/useSuppliersPage';

interface SuppliersManagementProps {
  pageState: ReturnType<typeof useSuppliersPage>;
}

export function SuppliersManagement({ pageState }: SuppliersManagementProps) {
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
      >
        {/* Tab Headers */}
        <Stack direction="row" justify="space-between" align="center" marginBottom={4}>
          <Tabs.List>
            <Tabs.Trigger value="list">
              Lista de Proveedores
            </Tabs.Trigger>
            <Tabs.Trigger value="analytics">
              Análisis
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

        {/* Tab: List */}
        <Tabs.Content value="list">
          <Stack direction="column" gap={4}>
            {/* Filters */}
            <Stack direction="row" gap={3} align="center">
              <InputField
                placeholder="Buscar proveedores..."
                value={filters.searchText}
                onChange={(e) => setFilters({ searchText: e.target.value })}
                style={{ maxWidth: '320px' }}
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilters({ isActive: filters.isActive === null ? true : null })}
              >
                <Icon icon={FunnelIcon} size="xs" />
                {filters.isActive === null ? 'Todos' : filters.isActive ? 'Activos' : 'Inactivos'}
              </Button>
            </Stack>

            {/* Table */}
            <SuppliersTable
              suppliers={suppliers}
              loading={loading}
              sort={sort}
              onEdit={openEditModal}
              onToggleActive={toggleActive}
              onDelete={deleteSupplier}
              onSortChange={setSort}
            />
          </Stack>
        </Tabs.Content>

        {/* Tab: Analytics */}
        <Tabs.Content value="analytics">
          <AnalyticsTab />
        </Tabs.Content>

        {/* Tab: Performance */}
        <Tabs.Content value="performance">
          <Stack direction="column" align="center" justify="center" py={16} gap={3}>
            <Text fontSize="xl" fontWeight="semibold">
              Performance de Proveedores
            </Text>
            <Text color="fg.muted">
              Métricas de calidad, entregas, y riesgos (próximamente)
            </Text>
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
}

export default SuppliersManagement;
