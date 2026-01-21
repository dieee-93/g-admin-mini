// ================================================================
// TRANSFERS TAB COMPONENT
// ================================================================
// Purpose: Tab content for inventory transfers management
// Pattern: Filter + Table + Modals orchestration
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { Stack, Button, SelectField, Text } from '@/shared/ui';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  TransfersTable,
  TransferFormModal,
  TransferDetailsModal
} from '..';
import { inventoryTransfersApi } from '../../services/inventoryTransfersApi';
import { useMaterials } from '@/modules/materials/hooks';
import { useLocation } from '@/contexts/LocationContext';
import { notify } from '@/lib/notifications';
import type { InventoryTransfer, TransferFilters } from '../../types/inventoryTransferTypes';
import { logger } from '@/lib/logging';

export function TransfersTab() {
  const { data: items = [] } = useMaterials();
  const { locations, selectedLocation } = useLocation();

  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<InventoryTransfer | null>(null);

  // Filters
  const [filters, setFilters] = useState<TransferFilters>({
    from_location_id: selectedLocation?.id,
    status: undefined
  });

  // Fetch transfers
  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryTransfersApi.getTransfers(filters);
      setTransfers(data);
    } catch (error) {
      notify.error('Error al cargar las transferencias');
      logger.error('TransfersTab', 'Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleView = (transfer: InventoryTransfer) => {
    setSelectedTransfer(transfer);
    setShowDetailsModal(true);
  };

  const handleApprove = async (transfer: InventoryTransfer) => {
    setSelectedTransfer(transfer);
    setShowDetailsModal(true);
  };

  const handleCancel = async (transfer: InventoryTransfer) => {
    setSelectedTransfer(transfer);
    setShowDetailsModal(true);
  };

  const handleComplete = async (transfer: InventoryTransfer) => {
    setSelectedTransfer(transfer);
    setShowDetailsModal(true);
  };

  const handleSuccess = () => {
    fetchTransfers();
  };

  return (
    <Stack gap="4">
      {/* Toolbar */}
      <Stack direction="row" justify="space-between" align="center" flexWrap="wrap" gap="4">
        {/* Filters */}
        <Stack direction="row" gap="3" flexWrap="wrap" align="center">
          {/* Location Filter - From */}
          <Stack gap="1" minWidth="180px">
            <Text fontSize="xs" fontWeight="600" color="gray.600">
              Ubicación Origen
            </Text>
            <SelectField
              size="sm"
              options={[
                { value: '', label: 'Todas' },
                ...locations.map(loc => ({
                  value: loc.id,
                  label: loc.name
                }))
              ]}
              value={[filters.from_location_id || '']}
              onValueChange={(details) => setFilters({ ...filters, from_location_id: details.value[0] || undefined })}
              noPortal
            />
          </Stack>

          {/* Location Filter - To */}
          <Stack gap="1" minWidth="180px">
            <Text fontSize="xs" fontWeight="600" color="gray.600">
              Ubicación Destino
            </Text>
            <SelectField
              size="sm"
              options={[
                { value: '', label: 'Todas' },
                ...locations.map(loc => ({
                  value: loc.id,
                  label: loc.name
                }))
              ]}
              value={[filters.to_location_id || '']}
              onValueChange={(details) => setFilters({ ...filters, to_location_id: details.value[0] || undefined })}
              noPortal
            />
          </Stack>

          {/* Status Filter */}
          <Stack gap="1" minWidth="150px">
            <Text fontSize="xs" fontWeight="600" color="gray.600">
              Estado
            </Text>
            <SelectField
              size="sm"
              options={[
                { value: '', label: 'Todos' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'approved', label: 'Aprobado' },
                { value: 'in_transit', label: 'En Tránsito' },
                { value: 'completed', label: 'Completado' },
                { value: 'cancelled', label: 'Cancelado' }
              ]}
              value={[filters.status || '']}
              onValueChange={(details) => setFilters({ ...filters, status: (details.value[0] || undefined) as 'pending' | 'approved' | 'rejected' | 'completed' | undefined })}
              noPortal
            />
          </Stack>
        </Stack>

        {/* Actions */}
        <Button
          colorPalette="blue"
          size="sm"
          onClick={() => setShowFormModal(true)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Nueva Transferencia
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction="row" gap="4" flexWrap="wrap">
        <Stack gap="1">
          <Text fontSize="xs" color="gray.600">Total</Text>
          <Text fontSize="lg" fontWeight="700">{transfers.length}</Text>
        </Stack>
        <Stack gap="1">
          <Text fontSize="xs" color="gray.600">Pendientes</Text>
          <Text fontSize="lg" fontWeight="700" color="yellow.600">
            {transfers.filter(t => t.status === 'pending').length}
          </Text>
        </Stack>
        <Stack gap="1">
          <Text fontSize="xs" color="gray.600">En Tránsito</Text>
          <Text fontSize="lg" fontWeight="700" color="blue.600">
            {transfers.filter(t => t.status === 'in_transit').length}
          </Text>
        </Stack>
        <Stack gap="1">
          <Text fontSize="xs" color="gray.600">Completadas</Text>
          <Text fontSize="lg" fontWeight="700" color="green.600">
            {transfers.filter(t => t.status === 'completed').length}
          </Text>
        </Stack>
      </Stack>

      {/* Table */}
      <TransfersTable
        transfers={transfers}
        onView={handleView}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onComplete={handleComplete}
        loading={loading}
      />

      {/* Modals */}
      <TransferFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={handleSuccess}
        materials={items}
      />

      <TransferDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTransfer(null);
        }}
        transfer={selectedTransfer}
        onSuccess={handleSuccess}
      />
    </Stack>
  );
}
