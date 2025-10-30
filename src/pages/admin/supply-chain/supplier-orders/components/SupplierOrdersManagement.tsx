// ============================================
// SUPPLIER ORDERS MANAGEMENT - Main orchestration component
// ============================================

import React, { useState } from 'react';
import { Dialog, Collapsible } from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';
import { Section, Stack, HStack, Button, Icon, Text, Badge } from '@/shared/ui';
import { PlusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { SupplierOrdersTable } from './SupplierOrdersTable';
import { SupplierOrderFormModal } from './SupplierOrderFormModal';
import { ReceiveOrderModal } from './ReceiveOrderModal';
import { SupplierOrdersFilters } from './SupplierOrdersFilters';
import type { useSupplierOrdersPage } from '../hooks/useSupplierOrdersPage';
import type { SupplierOrderWithDetails } from '../types';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';

interface SupplierOrdersManagementProps {
  pageState: ReturnType<typeof useSupplierOrdersPage>;
}

export function SupplierOrdersManagement({ pageState }: SupplierOrdersManagementProps) {
  const {
    orders,
    loading,
    isCreateModalOpen,
    isEditModalOpen,
    isReceiveModalOpen,
    selectedOrder,
    filters,
    openCreateModal,
    openEditModal,
    openReceiveModal,
    closeModals,
    setFilters,
    resetFilters,
    createOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    receiveOrder
  } = pageState;

  // ============================================
  // LOCAL STATE - Confirmation dialogs & filters
  // ============================================

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState<SupplierOrderWithDetails | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Count active filters
  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.supplier_id ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.showOverdue ? 1 : 0);

  // ============================================
  // HANDLERS - Edit/Delete/View
  // ============================================

  const handleEdit = (order: SupplierOrderWithDetails) => {
    openEditModal(order.id);
  };

  const handleView = (order: SupplierOrderWithDetails) => {
    // For now, open edit modal in view mode
    // TODO: Create dedicated view modal in Phase 2
    logger.info('SupplierOrdersManagement', 'View order:', order.id);
    toaster.create({
      title: 'Vista de detalles',
      description: 'Modal de vista detallada en desarrollo (Phase 2)',
      type: 'info',
      duration: 3000
    });
  };

  const handleDeleteClick = (order: SupplierOrderWithDetails) => {
    setTargetOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetOrder) return;

    try {
      await deleteOrder(targetOrder.id);

      toaster.create({
        title: 'Orden eliminada',
        description: `Orden ${targetOrder.po_number} eliminada exitosamente`,
        type: 'success',
        duration: 3000
      });

      setDeleteDialogOpen(false);
      setTargetOrder(null);
    } catch (error) {
      logger.error('SupplierOrdersManagement', 'Error deleting order', error);
    }
  };

  // ============================================
  // HANDLERS - Status changes
  // ============================================

  const handleApproveClick = (order: SupplierOrderWithDetails) => {
    setTargetOrder(order);
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!targetOrder) return;

    try {
      await updateStatus(targetOrder.id, 'approved');

      toaster.create({
        title: 'Orden aprobada',
        description: `Orden ${targetOrder.po_number} ha sido aprobada`,
        type: 'success',
        duration: 3000
      });

      setApproveDialogOpen(false);
      setTargetOrder(null);
    } catch (error) {
      logger.error('SupplierOrdersManagement', 'Error approving order', error);
    }
  };

  const handleCancelClick = (order: SupplierOrderWithDetails) => {
    setTargetOrder(order);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!targetOrder) return;

    try {
      await updateStatus(targetOrder.id, 'cancelled');

      toaster.create({
        title: 'Orden cancelada',
        description: `Orden ${targetOrder.po_number} ha sido cancelada`,
        type: 'info',
        duration: 3000
      });

      setCancelDialogOpen(false);
      setTargetOrder(null);
    } catch (error) {
      logger.error('SupplierOrdersManagement', 'Error cancelling order', error);
    }
  };

  const handleReceive = (order: SupplierOrderWithDetails) => {
    openReceiveModal(order.id);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <Section variant="elevated">
        {/* Header with tabs and actions */}
        <Stack direction="row" justify="space-between" mb={4}>
          <Tabs.Root value="list">
            <Tabs.List>
              <Tabs.Trigger value="list">Órdenes</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Icon icon={AdjustmentsHorizontalIcon} size="xs" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge ml={2} colorPalette="blue" size="sm">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <Button size="sm" colorPalette="blue" onClick={openCreateModal}>
              <Icon icon={PlusIcon} size="xs" />
              Nueva Orden
            </Button>
          </HStack>
        </Stack>

        {/* Collapsible filters panel */}
        <Collapsible.Root open={showFilters} mb={4}>
          <Collapsible.Content>
            <SupplierOrdersFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Orders table */}
        <SupplierOrdersTable
          orders={orders}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onApprove={handleApproveClick}
          onCancel={handleCancelClick}
          onReceive={handleReceive}
          onView={handleView}
        />
      </Section>

      {/* Create/Edit Modal */}
      <SupplierOrderFormModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={closeModals}
        onSubmit={isEditModalOpen && selectedOrder ?
          (data) => updateOrder(selectedOrder.id, data) :
          createOrder
        }
        order={isEditModalOpen ? selectedOrder : null}
      />

      {/* Receive Order Modal */}
      <ReceiveOrderModal
        isOpen={isReceiveModalOpen}
        onClose={closeModals}
        onSubmit={selectedOrder ?
          (data) => receiveOrder(selectedOrder.id, data) :
          async () => {}
        }
        order={selectedOrder}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialogOpen}
        onOpenChange={(details) => !details.open && setDeleteDialogOpen(false)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Eliminar Orden</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                ¿Estás seguro que deseas eliminar la orden{' '}
                <strong>{targetOrder?.po_number}</strong>?
              </Text>
              <Text color="fg.muted" fontSize="sm" mt={2}>
                Esta acción no se puede deshacer. Solo se pueden eliminar órdenes en estado
                borrador.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button colorPalette="red" onClick={handleDeleteConfirm}>
                Eliminar
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Approve Confirmation Dialog */}
      <Dialog.Root
        open={approveDialogOpen}
        onOpenChange={(details) => !details.open && setApproveDialogOpen(false)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Aprobar Orden</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                ¿Deseas aprobar la orden <strong>{targetOrder?.po_number}</strong>?
              </Text>
              <Text color="fg.muted" fontSize="sm" mt={2}>
                Al aprobar, la orden será enviada al proveedor y no podrá ser editada.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button colorPalette="green" onClick={handleApproveConfirm}>
                Aprobar Orden
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Cancel Confirmation Dialog */}
      <Dialog.Root
        open={cancelDialogOpen}
        onOpenChange={(details) => !details.open && setCancelDialogOpen(false)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Cancelar Orden</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                ¿Estás seguro que deseas cancelar la orden{' '}
                <strong>{targetOrder?.po_number}</strong>?
              </Text>
              <Text color="fg.muted" fontSize="sm" mt={2}>
                La orden será marcada como cancelada. Esta acción no se puede deshacer.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                No, mantener orden
              </Button>
              <Button colorPalette="red" onClick={handleCancelConfirm}>
                Sí, cancelar orden
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
