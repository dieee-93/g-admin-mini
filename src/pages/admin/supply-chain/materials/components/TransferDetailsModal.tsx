// ================================================================
// TRANSFER DETAILS MODAL COMPONENT
// ================================================================
// Purpose: Display transfer details and workflow actions
// Pattern: Read-only details + action buttons based on status
// ================================================================

import { useState } from 'react';
import {
  Dialog,
  Stack,
  Text,
  Button,
  Alert,
  Box,
  Separator
} from '@/shared/ui';
import {
  XMarkIcon,
  CheckIcon,
  XCircleIcon,
  TruckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { TransferStatusBadge } from './TransferStatusBadge';
import { inventoryTransfersApi } from '../services/inventoryTransfersApi';
import { notify } from '@/lib/notifications';
import type { InventoryTransfer } from '../types/inventoryTransferTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: InventoryTransfer | null;
  onSuccess: () => void;
}

export function TransferDetailsModal({
  isOpen,
  onClose,
  transfer,
  onSuccess
}: TransferDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!transfer) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const handleApprove = async () => {
    setLoading(true);
    setActionError(null);

    try {
      const result = await inventoryTransfersApi.approveTransfer(
        transfer.id,
        'current_user' // TODO: Get from auth context
      );

      if (result.success) {
        notify.success(result.message);
        onSuccess();
        onClose();
      } else {
        setActionError(result.message);
        notify.error(result.message);
      }
    } catch (error) {
      console.error('[TransferDetailsModal] Error approving transfer:', error);
      setActionError('Error al aprobar la transferencia');
      notify.error('Error al aprobar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInTransit = async () => {
    setLoading(true);
    setActionError(null);

    try {
      const result = await inventoryTransfersApi.markInTransit(transfer.id);

      if (result.success) {
        notify.success(result.message);
        onSuccess();
        onClose();
      } else {
        setActionError(result.message);
        notify.error(result.message);
      }
    } catch (error) {
      console.error('[TransferDetailsModal] Error marking in transit:', error);
      setActionError('Error al marcar en tránsito');
      notify.error('Error al marcar en tránsito');
    } finally{
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setActionError(null);

    try {
      const result = await inventoryTransfersApi.completeTransfer(
        transfer.id,
        'current_user' // TODO: Get from auth context
      );

      if (result.success) {
        notify.success(result.message);
        onSuccess();
        onClose();
      } else {
        setActionError(result.message);
        notify.error(result.message);
      }
    } catch (error) {
      console.error('[TransferDetailsModal] Error completing transfer:', error);
      setActionError('Error al completar la transferencia');
      notify.error('Error al completar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('¿Está seguro que desea cancelar esta transferencia?')) {
      return;
    }

    setLoading(true);
    setActionError(null);

    try {
      const result = await inventoryTransfersApi.cancelTransfer(
        transfer.id,
        'current_user', // TODO: Get from auth context
        'Cancelado por usuario'
      );

      if (result.success) {
        notify.success(result.message);
        onSuccess();
        onClose();
      } else {
        setActionError(result.message);
        notify.error(result.message);
      }
    } catch (error) {
      console.error('[TransferDetailsModal] Error canceling transfer:', error);
      setActionError('Error al cancelar la transferencia');
      notify.error('Error al cancelar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const canApprove = transfer.status === 'pending';
  const canMarkInTransit = transfer.status === 'approved';
  const canComplete = ['approved', 'in_transit'].includes(transfer.status);
  const canCancel = ['pending', 'approved'].includes(transfer.status);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Stack direction="row" justify="space-between" align="center" width="100%">
              <Dialog.Title>
                Transferencia {transfer.transfer_number}
              </Dialog.Title>
              <TransferStatusBadge status={transfer.status} size="md" />
            </Stack>
            <Dialog.CloseTrigger onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="4">
              {/* Action Error */}
              {actionError && (
                <Alert status="error" title="Error">
                  {actionError}
                </Alert>
              )}

              {/* Location Information */}
              <Box>
                <Text fontSize="sm" fontWeight="600" mb="2" color="gray.600">
                  Ruta de Transferencia
                </Text>
                <Stack direction="row" align="center" gap="4">
                  <Box flex="1">
                    <Text fontWeight="600">{transfer.from_location?.name}</Text>
                    <Text fontSize="sm" color="gray.600">{transfer.from_location?.code}</Text>
                  </Box>
                  <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                  <Box flex="1">
                    <Text fontWeight="600">{transfer.to_location?.name}</Text>
                    <Text fontSize="sm" color="gray.600">{transfer.to_location?.code}</Text>
                  </Box>
                </Stack>
              </Box>

              <Separator />

              {/* Item Information */}
              <Box>
                <Text fontSize="sm" fontWeight="600" mb="2" color="gray.600">
                  Material
                </Text>
                <Stack gap="2">
                  <Stack direction="row" justify="space-between">
                    <Text color="gray.700">Nombre:</Text>
                    <Text fontWeight="600">{transfer.item?.name || 'N/A'}</Text>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Text color="gray.700">Cantidad:</Text>
                    <Text fontWeight="600">
                      {transfer.quantity} {transfer.unit}
                    </Text>
                  </Stack>
                </Stack>
              </Box>

              <Separator />

              {/* Workflow Information */}
              <Box>
                <Text fontSize="sm" fontWeight="600" mb="2" color="gray.600">
                  Información del Proceso
                </Text>
                <Stack gap="2">
                  <Stack direction="row" justify="space-between">
                    <Text color="gray.700">Solicitado por:</Text>
                    <Text fontWeight="500">{transfer.requested_by || 'N/A'}</Text>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Text color="gray.700">Fecha de solicitud:</Text>
                    <Text fontSize="sm">{formatDate(transfer.requested_at)}</Text>
                  </Stack>

                  {transfer.approved_by && (
                    <>
                      <Stack direction="row" justify="space-between">
                        <Text color="gray.700">Aprobado por:</Text>
                        <Text fontWeight="500">{transfer.approved_by}</Text>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text color="gray.700">Fecha de aprobación:</Text>
                        <Text fontSize="sm">{transfer.approved_at ? formatDate(transfer.approved_at) : 'N/A'}</Text>
                      </Stack>
                    </>
                  )}

                  {transfer.completed_by && (
                    <>
                      <Stack direction="row" justify="space-between">
                        <Text color="gray.700">Completado por:</Text>
                        <Text fontWeight="500">{transfer.completed_by}</Text>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text color="gray.700">Fecha de completado:</Text>
                        <Text fontSize="sm">{transfer.completed_at ? formatDate(transfer.completed_at) : 'N/A'}</Text>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Box>

              {/* Reason & Notes */}
              {(transfer.reason || transfer.notes) && (
                <>
                  <Separator />
                  <Box>
                    {transfer.reason && (
                      <Stack gap="1" mb="3">
                        <Text fontSize="sm" fontWeight="600" color="gray.600">
                          Motivo
                        </Text>
                        <Text fontSize="sm">{transfer.reason}</Text>
                      </Stack>
                    )}
                    {transfer.notes && (
                      <Stack gap="1">
                        <Text fontSize="sm" fontWeight="600" color="gray.600">
                          Notas
                        </Text>
                        <Text fontSize="sm">{transfer.notes}</Text>
                      </Stack>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap="3" justify="space-between" width="100%">
              {/* Left side: Cancel/Close button */}
              <Stack direction="row" gap="2">
                {canCancel && (
                  <Button
                    variant="outline"
                    colorPalette="red"
                    onClick={handleCancel}
                    disabled={loading}
                    leftIcon={<XCircleIcon className="w-4 h-4" />}
                  >
                    Cancelar Transfer
                  </Button>
                )}
              </Stack>

              {/* Right side: Action buttons */}
              <Stack direction="row" gap="2">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cerrar
                </Button>

                {canApprove && (
                  <Button
                    colorPalette="green"
                    onClick={handleApprove}
                    loading={loading}
                    leftIcon={<CheckIcon className="w-4 h-4" />}
                  >
                    Aprobar
                  </Button>
                )}

                {canMarkInTransit && (
                  <Button
                    colorPalette="yellow"
                    onClick={handleMarkInTransit}
                    loading={loading}
                    leftIcon={<TruckIcon className="w-4 h-4" />}
                  >
                    En Tránsito
                  </Button>
                )}

                {canComplete && (
                  <Button
                    colorPalette="blue"
                    onClick={handleComplete}
                    loading={loading}
                    leftIcon={<CheckIcon className="w-4 h-4" />}
                  >
                    Completar
                  </Button>
                )}
              </Stack>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
