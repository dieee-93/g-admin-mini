// ============================================
// SUPPLIER ORDERS FILTERS - Advanced filtering panel
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  Stack,
  HStack,
  Button,
  InputField,
  SelectField,
  createListCollection,
  Checkbox,
  Badge,
  Text
} from '@/shared/ui';
import type { SupplierOrderFilters, SupplierOrderStatus } from '../types';
import { STATUS_CONFIG } from '../types';
import type { Supplier } from '../../suppliers/types/supplierTypes';
import { suppliersApi } from '../../materials/services/suppliersApi';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

interface SupplierOrdersFiltersProps {
  filters: SupplierOrderFilters;
  onFiltersChange: (filters: Partial<SupplierOrderFilters>) => void;
  onReset: () => void;
}

export function SupplierOrdersFilters({
  filters,
  onFiltersChange,
  onReset
}: SupplierOrdersFiltersProps) {
  // ============================================
  // STATE - Data sources
  // ============================================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // ============================================
  // EFFECTS - Load suppliers
  // ============================================

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const data = await suppliersApi.getActiveSuppliers();
      setSuppliers(data);
    } catch (error) {
      logger.error('SupplierOrdersFilters', 'Error loading suppliers', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // ============================================
  // COLLECTIONS
  // ============================================

  const suppliersCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Todos los proveedores', value: '' },
          ...suppliers.map(s => ({ label: s.name, value: s.id }))
        ]
      }),
    [suppliers]
  );

  const statusOptions: { label: string; value: SupplierOrderStatus | 'all' }[] = [
    { label: 'Todos los estados', value: 'all' },
    { label: STATUS_CONFIG.draft.label, value: 'draft' },
    { label: STATUS_CONFIG.pending.label, value: 'pending' },
    { label: STATUS_CONFIG.approved.label, value: 'approved' },
    { label: STATUS_CONFIG.received.label, value: 'received' },
    { label: STATUS_CONFIG.cancelled.label, value: 'cancelled' }
  ];

  const statusCollection = createListCollection({
    items: statusOptions.map(opt => ({ label: opt.label, value: opt.value }))
  });

  // ============================================
  // COMPUTED - Active filters count
  // ============================================

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.status !== 'all') count++;
    if (filters.supplier_id) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.showOverdue) count++;
    return count;
  }, [filters]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ searchText: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value as SupplierOrderStatus | 'all' });
  };

  const handleSupplierChange = (value: string) => {
    onFiltersChange({ supplier_id: value || null });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        from: e.target.value || null
      }
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        to: e.target.value || null
      }
    });
  };

  const handleOverdueChange = (checked: boolean) => {
    onFiltersChange({ showOverdue: checked });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Stack
      direction="column"
      gap={4}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor="border.default"
      bg="bg.subtle"
    >
      {/* Header */}
      <HStack justify="space-between">
        <HStack gap={2}>
          <FunnelIcon style={{ width: 20, height: 20 }} />
          <Text fontWeight="semibold">Filtros</Text>
          {activeFiltersCount > 0 && (
            <Badge colorPalette="blue" size="sm">
              {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </HStack>

        {activeFiltersCount > 0 && (
          <Button size="xs" variant="ghost" onClick={onReset}>
            <XMarkIcon style={{ width: 14, height: 14, marginRight: 4 }} />
            Limpiar
          </Button>
        )}
      </HStack>

      {/* Search */}
      <InputField
        label="Buscar"
        placeholder="Buscar por N° de orden, notas..."
        value={filters.searchText}
        onChange={handleSearchChange}
      />

      {/* Status and Supplier */}
      <HStack gap={3}>
        <SelectField
          label="Estado"
          placeholder="Seleccionar estado"
          collection={statusCollection}
          value={filters.status}
          onValueChange={(details) => handleStatusChange(details.value[0] || 'all')}
        />

        <SelectField
          label="Proveedor"
          placeholder="Seleccionar proveedor"
          collection={suppliersCollection}
          value={filters.supplier_id || ''}
          onValueChange={(details) => handleSupplierChange(details.value[0] || '')}
          disabled={loadingSuppliers}
        />
      </HStack>

      {/* Date Range */}
      <Stack direction="column" gap={2}>
        <Text fontSize="sm" fontWeight="medium">
          Rango de Fechas (Entrega Esperada)
        </Text>
        <HStack gap={3}>
          <InputField
            label="Desde"
            type="date"
            value={filters.dateRange.from || ''}
            onChange={handleDateFromChange}
          />

          <InputField
            label="Hasta"
            type="date"
            value={filters.dateRange.to || ''}
            onChange={handleDateToChange}
          />
        </HStack>
      </Stack>

      {/* Overdue checkbox */}
      <Checkbox
        checked={filters.showOverdue}
        onCheckedChange={(details) => handleOverdueChange(!!details.checked)}
      >
        <Text fontSize="sm">Solo órdenes vencidas (aprobadas con fecha pasada)</Text>
      </Checkbox>

      {/* Results info */}
      {activeFiltersCount > 0 && (
        <Text fontSize="xs" color="fg.muted" textAlign="center">
          Mostrando resultados filtrados
        </Text>
      )}
    </Stack>
  );
}
