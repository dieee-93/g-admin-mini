/**
 * OrdersList Component - Supplier Orders Management
 * Displays and manages purchase orders from suppliers
 */

import React, { useState } from 'react';
import {
  Stack,
  Button,
  Icon,
  Text,
  EmptyState,
  Alert,
  Table
} from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { OrderFormModal } from './OrderFormModal';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ReceiveOrderModal } from './ReceiveOrderModal';
import {
  useSupplierOrders,
  useApproveSupplierOrder,
  useCancelSupplierOrder,
  useReceiveSupplierOrder
} from '../../hooks/useSupplierOrders';
import { DecimalUtils } from '@/lib/decimal';
import type { SupplierOrderWithDetails } from '../../types/supplierOrderTypes';

export const OrdersList = React.memo(function OrdersList() {
  const createModal = useDisclosure();
  const receiveModal = useDisclosure();
  const [currentOrder, setCurrentOrder] = useState<SupplierOrderWithDetails | null>(null);
  
  // ✅ TanStack Query hooks
  const { data: orders = [], isLoading: loading, error } = useSupplierOrders();
  const approveMutation = useApproveSupplierOrder();
  const cancelMutation = useCancelSupplierOrder();
  const receiveMutation = useReceiveSupplierOrder();

  const handleReceiveOrder = (order: SupplierOrderWithDetails) => {
    setCurrentOrder(order);
    receiveModal.onOpen();
  };

  const handleCloseReceiveModal = () => {
    receiveModal.onClose();
    setCurrentOrder(null);
  };

  const handleApproveOrder = async (orderId: string) => {
    await approveMutation.mutateAsync(orderId);
  };

  const handleCancelOrder = async (orderId: string) => {
    await cancelMutation.mutateAsync(orderId);
  };

  return (
    <Stack direction="column" gap="4">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="semibold">
          Órdenes de Compra
        </Text>
        <Button
          size="sm"
          colorPalette="blue"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Icon icon={PlusIcon} size="xs" />
          Nueva Orden
        </Button>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" title="Error">
          {error instanceof Error ? error.message : 'Error al cargar órdenes'}
        </Alert>
      )}

      {/* Info Alert */}
      <Alert status="info" title="Sistema de Órdenes de Compra">
        Gestiona las órdenes de compra a proveedores. Al recibir una orden, se actualizará automáticamente el inventario con Event Sourcing.
      </Alert>

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <Text>Cargando órdenes...</Text>
      ) : orders.length === 0 ? (
        <Stack direction="column" gap="4" align="center" py="8">
          <EmptyState
            title="No hay órdenes registradas"
            description="Comienza creando tu primera orden de compra"
            action={
              <Button
                size="sm"
                colorPalette="blue"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Icon icon={PlusIcon} size="xs" />
                Nueva Orden
              </Button>
            }
          />
        </Stack>
      ) : (
        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Número</Table.ColumnHeader>
              <Table.ColumnHeader>Proveedor</Table.ColumnHeader>
              <Table.ColumnHeader>Fecha</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader>Total</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map(order => (
              <Table.Row key={order.id}>
                <Table.Cell>{order.po_number || 'N/A'}</Table.Cell>
                <Table.Cell>{order.supplier?.name || 'N/A'}</Table.Cell>
                <Table.Cell>
                  {new Date(order.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <OrderStatusBadge status={order.status} />
                </Table.Cell>
                <Table.Cell>
                  ${DecimalUtils.formatCurrency(DecimalUtils.fromValue(order.total_amount, 'currency'))}
                </Table.Cell>
                <Table.Cell>
                  <Stack direction="row" gap="2">
                    {order.status === 'approved' && (
                      <Button
                        size="xs"
                        colorPalette="green"
                        variant="outline"
                        onClick={() => handleReceiveOrder(order)}
                      >
                        <Icon icon={CheckIcon} size="xs" />
                        Recibir
                      </Button>
                    )}
                    {(order.status === 'draft' || order.status === 'pending') && (
                      <>
                        <Button
                          size="xs"
                          colorPalette="blue"
                          variant="outline"
                          onClick={() => handleApproveOrder(order.id)}
                          loading={approveMutation.isPending}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="xs"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => handleCancelOrder(order.id)}
                          loading={cancelMutation.isPending}
                        >
                          <Icon icon={XMarkIcon} size="xs" />
                        </Button>
                      </>
                    )}
                  </Stack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {/* Create Modal */}
      <OrderFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Receive Modal */}
      <ReceiveOrderModal
        isOpen={isReceiveModalOpen}
        onClose={handleCloseReceiveModal}
        order={currentOrder}
        onReceive={(data) => receiveMutation.mutateAsync(data)}
      />
    </Stack>
  );
});

export default OrdersList;