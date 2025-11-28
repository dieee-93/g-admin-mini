/**
 * ASSETS TABLE COMPONENT
 * Display assets in a table with actions
 */

import { Table, Badge, Button, IconButton, Text } from '@/shared/ui';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
// import { HookPoint } from '@/lib/modules/HookPoint';
import type { Asset } from '../types';

interface AssetsTableProps {
  assets: Asset[];
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function AssetsTable({ assets, onView, onEdit, onDelete, isLoading }: AssetsTableProps) {
  if (isLoading) {
    return <Text>Cargando assets...</Text>;
  }

  if (assets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No se encontraron assets. Crea tu primer asset para comenzar.
      </div>
    );
  }

  const getStatusColor = (status: Asset['status']) => {
    const colors = {
      available: 'green',
      in_use: 'blue',
      maintenance: 'yellow',
      retired: 'gray',
      rented: 'purple',
    };
    return colors[status] || 'gray';
  };

  const getConditionColor = (condition: Asset['condition']) => {
    const colors = {
      excellent: 'green',
      good: 'teal',
      fair: 'yellow',
      poor: 'orange',
      broken: 'red',
    };
    return colors[condition] || 'gray';
  };

  return (
    <Table.Root size="sm" variant="line" striped interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Código</Table.ColumnHeader>
          <Table.ColumnHeader>Nombre</Table.ColumnHeader>
          <Table.ColumnHeader>Categoría</Table.ColumnHeader>
          <Table.ColumnHeader>Estado</Table.ColumnHeader>
          <Table.ColumnHeader>Condición</Table.ColumnHeader>
          <Table.ColumnHeader>Ubicación</Table.ColumnHeader>
          <Table.ColumnHeader>Alquilable</Table.ColumnHeader>
          <Table.ColumnHeader numeric>Acciones</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {assets.map((asset) => (
          <Table.Row key={asset.id}>
            <Table.Cell>
              <Text weight="medium">{asset.asset_code}</Text>
            </Table.Cell>
            <Table.Cell>{asset.name}</Table.Cell>
            <Table.Cell>
              <Badge size="sm" variant="subtle">
                {asset.category}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <Badge size="sm" colorPalette={getStatusColor(asset.status)}>
                {asset.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <Badge size="sm" colorPalette={getConditionColor(asset.condition)}>
                {asset.condition}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <Text variant="secondary">{asset.location || '-'}</Text>
            </Table.Cell>
            <Table.Cell>
              {asset.is_rentable ? (
                <Badge size="sm" colorPalette="purple">
                  Sí
                </Badge>
              ) : (
                <Text variant="secondary">No</Text>
              )}
            </Table.Cell>
            <Table.Cell numeric>
              <div
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  justifyContent: 'flex-end',
                }}
              >
                <IconButton
                  size="xs"
                  variant="ghost"
                  onClick={() => onView(asset)}
                  aria-label="Ver detalles"
                >
                  <EyeIcon style={{ width: '1rem', height: '1rem' }} />
                </IconButton>
                <IconButton
                  size="xs"
                  variant="ghost"
                  onClick={() => onEdit(asset)}
                  aria-label="Editar"
                >
                  <PencilIcon style={{ width: '1rem', height: '1rem' }} />
                </IconButton>
                <IconButton
                  size="xs"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => onDelete(asset.id)}
                  aria-label="Eliminar"
                >
                  <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                </IconButton>

                {/* 🎯 HOOK POINT: Rentals can inject "Rent" button here */}
                {/* <HookPoint hookName="assets.row.actions" hookParams={asset} /> */}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
