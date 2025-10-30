// ============================================
// SUPPLIER ORDERS TABLE - Orders display with action buttons
// ============================================

import React from 'react';
import { Stack, HStack, Text, Badge, Table, Button, IconButton, Menu } from '@/shared/ui';
import type { SupplierOrderWithDetails } from '../types';
import {
  STATUS_CONFIG,
  canEditOrder,
  canDeleteOrder,
  canApproveOrder,
  canReceiveOrder,
  canCancelOrder
} from '../types';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface SupplierOrdersTableProps {
  orders: SupplierOrderWithDetails[];
  loading?: boolean;
  onEdit?: (order: SupplierOrderWithDetails) => void;
  onDelete?: (order: SupplierOrderWithDetails) => void;
  onApprove?: (order: SupplierOrderWithDetails) => void;
  onCancel?: (order: SupplierOrderWithDetails) => void;
  onReceive?: (order: SupplierOrderWithDetails) => void;
  onView?: (order: SupplierOrderWithDetails) => void;
}

export function SupplierOrdersTable({
  orders,
  loading,
  onEdit,
  onDelete,
  onApprove,
  onCancel,
  onReceive,
  onView
}: SupplierOrdersTableProps) {
  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <Stack direction="column" align="center" py={12}>
        <Text color="fg.muted">Cargando órdenes...</Text>
      </Stack>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================

  if (orders.length === 0) {
    return (
      <Stack direction="column" align="center" py={16} gap={2}>
        <Text fontSize="xl" fontWeight="semibold">
          No hay órdenes
        </Text>
        <Text color="fg.muted">Crea tu primera orden para comenzar</Text>
      </Stack>
    );
  }

  // ============================================
  // RENDER TABLE
  // ============================================

  return (
    <Table.Root variant="outline" size="sm">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>N° Orden</Table.ColumnHeader>
          <Table.ColumnHeader>Proveedor</Table.ColumnHeader>
          <Table.ColumnHeader>Estado</Table.ColumnHeader>
          <Table.ColumnHeader>Fecha Esperada</Table.ColumnHeader>
          <Table.ColumnHeader>Total</Table.ColumnHeader>
          <Table.ColumnHeader>Items</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {orders.map(order => {
          // Determine available actions
          const canEdit = canEditOrder(order.status);
          const canDel = canDeleteOrder(order.status);
          const canApp = canApproveOrder(order.status);
          const canRec = canReceiveOrder(order.status);
          const canCan = canCancelOrder(order.status);

          return (
            <Table.Row key={order.id}>
              {/* PO Number */}
              <Table.Cell fontWeight="medium">{order.po_number}</Table.Cell>

              {/* Supplier */}
              <Table.Cell>{order.supplier?.name || '-'}</Table.Cell>

              {/* Status Badge */}
              <Table.Cell>
                <Badge colorPalette={STATUS_CONFIG[order.status].color} size="sm">
                  {STATUS_CONFIG[order.status].label}
                </Badge>
              </Table.Cell>

              {/* Expected Delivery Date */}
              <Table.Cell>
                {order.expected_delivery_date
                  ? new Date(order.expected_delivery_date).toLocaleDateString()
                  : '-'}
              </Table.Cell>

              {/* Total Amount */}
              <Table.Cell fontWeight="semibold">
                ${Number(order.total_amount).toFixed(2)}
              </Table.Cell>

              {/* Items Count */}
              <Table.Cell>{order.items?.length || 0} items</Table.Cell>

              {/* Actions */}
              <Table.Cell>
                <HStack justify="center" gap={1}>
                  {/* Quick Actions - Primary buttons */}
                  {canApp && onApprove && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorPalette="green"
                      onClick={() => onApprove(order)}
                      aria-label="Aprobar orden"
                      title="Aprobar orden"
                    >
                      <CheckIcon style={{ width: 16, height: 16 }} />
                    </IconButton>
                  )}

                  {canRec && onReceive && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => onReceive(order)}
                      aria-label="Recibir orden"
                      title="Recibir orden"
                    >
                      <TruckIcon style={{ width: 16, height: 16 }} />
                    </IconButton>
                  )}

                  {canEdit && onEdit && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => onEdit(order)}
                      aria-label="Editar orden"
                      title="Editar orden"
                    >
                      <PencilIcon style={{ width: 16, height: 16 }} />
                    </IconButton>
                  )}

                  {/* More actions menu */}
                  <Menu.Root positioning={{ placement: 'bottom-end' }}>
                    <Menu.Trigger asChild>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Más acciones"
                        title="Más acciones"
                      >
                        <EllipsisVerticalIcon style={{ width: 16, height: 16 }} />
                      </IconButton>
                    </Menu.Trigger>

                    <Menu.Positioner>
                      <Menu.Content minWidth="180px">
                        {/* View Details */}
                        {onView && (
                          <Menu.Item value="view" onClick={() => onView(order)}>
                            <EyeIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                            Ver Detalles
                          </Menu.Item>
                        )}

                        {/* Edit (if not already shown as quick action) */}
                        {canEdit && onEdit && (
                          <Menu.Item value="edit" onClick={() => onEdit(order)}>
                            <PencilIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                            Editar
                          </Menu.Item>
                        )}

                        {/* Approve (if not already shown as quick action) */}
                        {canApp && onApprove && (
                          <Menu.Item value="approve" onClick={() => onApprove(order)}>
                            <CheckIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                            Aprobar
                          </Menu.Item>
                        )}

                        {/* Receive (if not already shown as quick action) */}
                        {canRec && onReceive && (
                          <Menu.Item value="receive" onClick={() => onReceive(order)}>
                            <TruckIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                            Recibir
                          </Menu.Item>
                        )}

                        {/* Cancel */}
                        {canCan && onCancel && (
                          <>
                            <Menu.Separator />
                            <Menu.Item
                              value="cancel"
                              color="fg.error"
                              onClick={() => onCancel(order)}
                            >
                              <XMarkIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                              Cancelar Orden
                            </Menu.Item>
                          </>
                        )}

                        {/* Delete */}
                        {canDel && onDelete && (
                          <>
                            <Menu.Separator />
                            <Menu.Item
                              value="delete"
                              color="fg.error"
                              onClick={() => onDelete(order)}
                            >
                              <TrashIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                              Eliminar
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Menu.Root>
                </HStack>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
