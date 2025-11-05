// ============================================
// SUPPLIERS TABLE - Data grid with actions
// ============================================

import React, { useState } from 'react';
import {
  Table,
  Button,
  Badge,
  Stack,
  Icon,
  Menu,
  Text,
  Dialog
} from '@/shared/ui';
import type { Supplier, SupplierSort } from '../types/supplierTypes';
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toaster } from '@/shared/ui/toaster';

interface SuppliersTableProps {
  suppliers: Supplier[];
  loading?: boolean;
  sort?: SupplierSort;
  onEdit: (supplier: Supplier) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onSortChange?: (field: SupplierSort['field']) => void;
}

export function SuppliersTable({
  suppliers,
  loading,
  sort,
  onEdit,
  onToggleActive,
  onDelete,
  onSortChange
}: SuppliersTableProps) {
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; supplier: Supplier | null }>({
    isOpen: false,
    supplier: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (supplier: Supplier) => {
    setDeleteDialog({ isOpen: true, supplier });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.supplier) return;

    try {
      setIsDeleting(true);
      await onDelete(deleteDialog.supplier.id);

      toaster.create({
        title: 'Proveedor eliminado',
        description: `${deleteDialog.supplier.name} fue eliminado exitosamente`,
        type: 'success',
        duration: 3000
      });

      setDeleteDialog({ isOpen: false, supplier: null });
    } catch (error) {
      toaster.create({
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el proveedor',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ isOpen: false, supplier: null });
  };

  if (loading) {
    return (
      <Stack direction="column" align="center" justify="center" py="12">
        <Text color="fg.muted" fontSize="lg">
          Cargando proveedores...
        </Text>
      </Stack>
    );
  }

  if (suppliers.length === 0) {
    return (
      <Stack direction="column" align="center" justify="center" py="16" gap="2">
        <Text fontSize="xl" fontWeight="semibold">
          No hay proveedores
        </Text>
        <Text color="fg.muted">
          Crea tu primer proveedor para comenzar
        </Text>
      </Stack>
    );
  }

  return (
    <>
    <Table.Root variant="outline" size="sm">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader
            cursor="pointer"
            onClick={() => onSortChange?.('name')}
          >
            Nombre {sort?.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
          </Table.ColumnHeader>
          <Table.ColumnHeader>Contacto</Table.ColumnHeader>
          <Table.ColumnHeader>Email/Teléfono</Table.ColumnHeader>
          <Table.ColumnHeader
            cursor="pointer"
            onClick={() => onSortChange?.('rating')}
          >
            Rating {sort?.field === 'rating' && (sort.direction === 'asc' ? '↑' : '↓')}
          </Table.ColumnHeader>
          <Table.ColumnHeader>Términos</Table.ColumnHeader>
          <Table.ColumnHeader>Estado</Table.ColumnHeader>
          <Table.ColumnHeader
            cursor="pointer"
            onClick={() => onSortChange?.('created_at')}
          >
            Creado {sort?.field === 'created_at' && (sort.direction === 'asc' ? '↑' : '↓')}
          </Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right">Acciones</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {suppliers.map((supplier) => (
          <Table.Row key={supplier.id}>
            {/* Name */}
            <Table.Cell fontWeight="medium">{supplier.name}</Table.Cell>

            {/* Contact Person */}
            <Table.Cell color={supplier.contact_person ? 'fg' : 'fg.muted'}>
              {supplier.contact_person || '-'}
            </Table.Cell>

            {/* Email/Phone */}
            <Table.Cell>
              <Stack direction="column" gap="0.5">
                {supplier.email && (
                  <span style={{ fontSize: '0.875rem' }}>{supplier.email}</span>
                )}
                {supplier.phone && (
                  <span style={{ fontSize: '0.875rem', color: '#718096' }}>{supplier.phone}</span>
                )}
                {!supplier.email && !supplier.phone && (
                  <span style={{ color: '#A0AEC0' }}>Sin contacto</span>
                )}
              </Stack>
            </Table.Cell>

            {/* Rating */}
            <Table.Cell>
              {supplier.rating ? (
                <Stack direction="row" align="center" gap="1">
                  <Icon icon={StarIcon} size="xs" color="yellow.500" />
                  <span>{supplier.rating.toFixed(1)}</span>
                </Stack>
              ) : (
                <span style={{ color: '#A0AEC0' }}>-</span>
              )}
            </Table.Cell>

            {/* Payment Terms */}
            <Table.Cell color={supplier.payment_terms ? 'fg' : 'fg.muted'}>
              {supplier.payment_terms || '-'}
            </Table.Cell>

            {/* Status */}
            <Table.Cell>
              <Badge colorPalette={supplier.is_active ? 'green' : 'gray'} size="sm">
                {supplier.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </Table.Cell>

            {/* Created At */}
            <Table.Cell color="fg.muted" fontSize="sm">
              {format(new Date(supplier.created_at), 'dd MMM yyyy', { locale: es })}
            </Table.Cell>

            {/* Actions */}
            <Table.Cell textAlign="right">
              <Stack direction="row" gap="1" justify="flex-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(supplier)}
                >
                  <Icon icon={PencilIcon} size="xs" />
                </Button>

                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button size="sm" variant="ghost">
                      <Icon icon={EllipsisVerticalIcon} size="xs" />
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item
                      value="toggle-status"
                      onClick={() => onToggleActive(supplier.id, !supplier.is_active)}
                    >
                      <Icon
                        icon={supplier.is_active ? XCircleIcon : CheckCircleIcon}
                        size="xs"
                      />
                      {supplier.is_active ? 'Desactivar' : 'Activar'}
                    </Menu.Item>
                    <Menu.Item
                      value="delete"
                      color="red.500"
                      onClick={() => handleDeleteClick(supplier)}
                    >
                      <Icon icon={TrashIcon} size="xs" />
                      Eliminar
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Root>
              </Stack>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>

    {/* Delete Confirmation Dialog */}
    <Dialog.Root
      open={deleteDialog.isOpen}
      onOpenChange={(details) => !details.open && handleCancelDelete()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              <Stack direction="row" align="center" gap="2">
                <Icon icon={ExclamationTriangleIcon} size="md" color="red.500" />
                Eliminar Proveedor
              </Stack>
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Stack direction="column" gap="3">
              <Text>
                ¿Estás seguro que deseas eliminar el proveedor{' '}
                <strong>{deleteDialog.supplier?.name}</strong>?
              </Text>
              <Text color="fg.muted" fontSize="sm">
                Esta acción no se puede deshacer. Si el proveedor tiene materiales asociados,
                no podrá ser eliminado.
              </Text>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              colorPalette="red"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Eliminar Proveedor
            </Button>
          </Dialog.Footer>

          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  </>
  );
}
