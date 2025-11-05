// ================================================================
// TRANSFERS TABLE COMPONENT
// ================================================================
// Purpose: Display inventory transfers with filtering and actions
// Pattern: Table with status badges, location info, and workflow actions
// ================================================================

import { Stack, Text, Button, Icon, Box, Table } from '@/shared/ui';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { TransferStatusBadge } from './TransferStatusBadge';
import type { InventoryTransfer } from '../types/inventoryTransferTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransfersTableProps {
  transfers: InventoryTransfer[];
  onView?: (transfer: InventoryTransfer) => void;
  onApprove?: (transfer: InventoryTransfer) => void;
  onCancel?: (transfer: InventoryTransfer) => void;
  onComplete?: (transfer: InventoryTransfer) => void;
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

type SortField = 'transfer_number' | 'created_at' | 'status' | 'quantity';

export function TransfersTable({
  transfers,
  onView,
  onApprove,
  onCancel,
  onComplete,
  loading = false,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSort
}: TransfersTableProps) {
  // const [hoveredRow, setHoveredRow] = useState<string | null>(null); // Disabled - hover functionality not implemented

  const handleSort = (field: SortField) => {
    if (onSort) {
      onSort(field);
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Table.ColumnHeader
      cursor={onSort ? 'pointer' : 'default'}
      onClick={() => onSort && handleSort(field)}
      _hover={onSort ? { bg: 'gray.50' } : undefined}
      userSelect="none"
    >
      <Stack direction="row" align="center" gap="xs">
        <Text fontSize="sm" fontWeight="600">
          {children}
        </Text>
        {sortBy === field && onSort && (
          <Icon
            icon={sortOrder === 'asc' ? ChevronUpIcon : ChevronDownIcon}
            size="xs"
          />
        )}
      </Stack>
    </Table.ColumnHeader>
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const canApprove = (transfer: InventoryTransfer) => transfer.status === 'pending';
  const canCancel = (transfer: InventoryTransfer) => ['pending', 'approved'].includes(transfer.status);
  const canComplete = (transfer: InventoryTransfer) => ['approved', 'in_transit'].includes(transfer.status);

  if (loading) {
    return (
      <Box p="xl" textAlign="center">
        <Text color="gray.500">
          Cargando transferencias...
        </Text>
      </Box>
    );
  }

  if (transfers.length === 0) {
    return (
      <Box p="xl" textAlign="center">
        <Text color="gray.500">
          No se encontraron transferencias
        </Text>
        <Text color="gray.400" fontSize="sm" mt="2">
          Las transferencias entre locations aparecerán aquí
        </Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row bg="gray.50">
            <SortableHeader field="transfer_number">Número</SortableHeader>
            <Table.ColumnHeader>Material</Table.ColumnHeader>
            <Table.ColumnHeader>Origen</Table.ColumnHeader>
            <Table.ColumnHeader>Destino</Table.ColumnHeader>
            <SortableHeader field="quantity">Cantidad</SortableHeader>
            <SortableHeader field="status">Estado</SortableHeader>
            <SortableHeader field="created_at">Fecha</SortableHeader>
            <Table.ColumnHeader>Solicitado por</Table.ColumnHeader>
            <Table.ColumnHeader width="180px">Acciones</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {transfers.map((transfer) => (
            <Table.Row
              key={transfer.id}
              _hover={{ bg: 'gray.50' }}
              onMouseEnter={() => setHoveredRow(transfer.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Transfer Number */}
              <Table.Cell>
                <Text fontWeight="600" fontFamily="mono" fontSize="sm">
                  {transfer.transfer_number}
                </Text>
              </Table.Cell>

              {/* Item Name */}
              <Table.Cell>
                <Text fontSize="sm" fontWeight="500">
                  {transfer.item?.name || 'N/A'}
                </Text>
              </Table.Cell>

              {/* From Location */}
              <Table.Cell>
                <Stack direction="column" gap="0">
                  <Text fontSize="sm" fontWeight="500">
                    {transfer.from_location?.name || 'N/A'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {transfer.from_location?.code}
                  </Text>
                </Stack>
              </Table.Cell>

              {/* To Location */}
              <Table.Cell>
                <Stack direction="column" gap="0">
                  <Text fontSize="sm" fontWeight="500">
                    {transfer.to_location?.name || 'N/A'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {transfer.to_location?.code}
                  </Text>
                </Stack>
              </Table.Cell>

              {/* Quantity */}
              <Table.Cell>
                <Text fontSize="sm" fontWeight="600">
                  {transfer.quantity} {transfer.unit}
                </Text>
              </Table.Cell>

              {/* Status */}
              <Table.Cell>
                <TransferStatusBadge status={transfer.status} />
              </Table.Cell>

              {/* Created At */}
              <Table.Cell>
                <Text fontSize="xs" color="gray.600">
                  {formatDate(transfer.created_at)}
                </Text>
              </Table.Cell>

              {/* Requested By */}
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  {transfer.requested_by || 'N/A'}
                </Text>
              </Table.Cell>

              {/* Actions */}
              <Table.Cell>
                <Stack direction="row" gap="xs">
                  {/* View Details */}
                  {onView && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => onView(transfer)}
                      title="Ver detalles"
                    >
                      <Icon icon={EyeIcon} size="sm" />
                    </Button>
                  )}

                  {/* Approve */}
                  {canApprove(transfer) && onApprove && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="green"
                      onClick={() => onApprove(transfer)}
                      title="Aprobar"
                    >
                      <Icon icon={CheckIcon} size="sm" />
                    </Button>
                  )}

                  {/* Mark In Transit */}
                  {canComplete(transfer) && onComplete && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={() => onComplete(transfer)}
                      title="Completar"
                    >
                      <Icon icon={TruckIcon} size="sm" />
                    </Button>
                  )}

                  {/* Cancel */}
                  {canCancel(transfer) && onCancel && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => onCancel(transfer)}
                      title="Cancelar"
                    >
                      <Icon icon={XMarkIcon} size="sm" />
                    </Button>
                  )}
                </Stack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
