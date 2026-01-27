/**
 * ReceiveOrderModal - Modal for receiving supplier orders
 * Creates stock entries with Event Sourcing metadata
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  Stack,
  Button,
  Text,
  Alert,
  InputField,
  Textarea,
  Table
} from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';
import type { SupplierOrderWithDetails, ReceiveOrderItemData } from '../../types/supplierOrderTypes';

interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SupplierOrderWithDetails | null;
  onReceive: (data: {
    order_id: string;
    received_at: string;
    notes?: string;
    items: ReceiveOrderItemData[];
  }) => Promise<void>;
}

export const ReceiveOrderModal = React.memo(function ReceiveOrderModal({
  isOpen,
  onClose,
  order,
  onReceive
}: ReceiveOrderModalProps) {
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize quantities when order changes
  React.useEffect(() => {
    if (order?.items) {
      const quantities: Record<string, number> = {};
      order.items.forEach(item => {
        quantities[item.id] = item.quantity;
      });
      setItemQuantities(quantities);
    }
  }, [order]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseFloat(value) || 0;
    setItemQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const totalAmount = useMemo(() => {
    if (!order?.items) return DecimalUtils.fromValue(0, 'currency');
    
    return order.items.reduce((sum, item) => {
      const qty = itemQuantities[item.id] || 0;
      const itemTotal = DecimalUtils.multiply(
        DecimalUtils.fromValue(qty, 'quantity'),
        DecimalUtils.fromValue(item.unit_cost, 'currency'),
        'currency'
      );
      return DecimalUtils.add(sum, itemTotal, 'currency');
    }, DecimalUtils.fromValue(0, 'currency'));
  }, [order, itemQuantities]);

  const handleSubmit = async () => {
    if (!order) return;

    try {
      setIsSubmitting(true);

      const items: ReceiveOrderItemData[] = order.items?.map(item => ({
        order_item_id: item.id,
        material_id: item.material_id,
        received_quantity: itemQuantities[item.id] || 0,
        unit_cost: item.unit_cost,
        notes: ''
      })) || [];

      await onReceive({
        order_id: order.id,
        received_at: receivedDate,
        notes: notes || undefined,
        items
      });

      // Reset form
      setNotes('');
      setItemQuantities({});
      onClose();
    } catch (error) {
      console.error('Error receiving order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      setItemQuantities({});
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="4xl">
          <Dialog.Header>
            <Dialog.Title>Recibir Orden de Compra</Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger />

          <Dialog.Body>
            <Stack gap="4">
              {/* Order Info */}
              <Alert status="info" title="Información de la Orden">
                <Stack gap="2">
                  <Text fontSize="sm">
                    <strong>Proveedor:</strong> {order.supplier?.name}
                  </Text>
                  {order.order_number && (
                    <Text fontSize="sm">
                      <strong>Número:</strong> {order.order_number}
                    </Text>
                  )}
                  <Text fontSize="sm">
                    <strong>Fecha de orden:</strong> {new Date(order.order_date).toLocaleDateString()}
                  </Text>
                </Stack>
              </Alert>

              {/* Received Date */}
              <InputField
                label="Fecha de Recepción"
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                required
              />

              {/* Items Table */}
              <Stack gap="2">
                <Text fontWeight="semibold">Artículos a Recibir</Text>
                <Table.Root size="sm" variant="outline">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Material</Table.ColumnHeader>
                      <Table.ColumnHeader>Cantidad Pedida</Table.ColumnHeader>
                      <Table.ColumnHeader>Cantidad Recibida</Table.ColumnHeader>
                      <Table.ColumnHeader>Costo Unitario</Table.ColumnHeader>
                      <Table.ColumnHeader>Total</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {order.items?.map(item => {
                      const receivedQty = itemQuantities[item.id] || 0;
                      const itemTotal = receivedQty * item.unit_cost;
                      
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell>{item.material?.name || 'Material'}</Table.Cell>
                          <Table.Cell>{item.quantity} {item.material?.unit || 'un'}</Table.Cell>
                          <Table.Cell>
                            <InputField
                              type="number"
                              value={receivedQty}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              min={0}
                              step={0.01}
                              size="sm"
                            />
                          </Table.Cell>
                          <Table.Cell>${DecimalUtils.formatCurrency(DecimalUtils.fromValue(item.unit_cost, 'currency'))}</Table.Cell>
                          <Table.Cell>${DecimalUtils.formatCurrency(DecimalUtils.fromValue(itemTotal, 'currency'))}</Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.Cell colSpan={4} fontWeight="bold">Total</Table.Cell>
                      <Table.Cell fontWeight="bold">
                        ${DecimalUtils.formatCurrency(totalAmount)}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Footer>
                </Table.Root>
              </Stack>

              {/* Notes */}
              <Stack gap="2">
                <Text fontWeight="medium">Notas (opcional)</Text>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones sobre la recepción..."
                  rows={3}
                />
              </Stack>

              {/* Event Sourcing Info */}
              <Alert status="warning" title="Event Sourcing">
                Al recibir esta orden, se crearán entradas en el inventario con metadatos completos para auditoría y trazabilidad.
              </Alert>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap="3" justify="end">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                colorPalette="green"
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Recibiendo..."
              >
                Recibir Orden
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
});

export default ReceiveOrderModal;
