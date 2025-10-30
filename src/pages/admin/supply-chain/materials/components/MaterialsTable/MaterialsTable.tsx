import { useState } from 'react';
import { Stack, Typography, Button, Icon, Badge, Box, Checkbox, Table } from '@/shared/ui';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatQuantity } from '@/business-logic/shared/decimalUtils';
import { HookPoint } from '@/lib/modules';
import type { MaterialItem } from '../../types';

interface MaterialsTableProps {
  materials: MaterialItem[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onEdit?: (material: MaterialItem) => void;
  onView?: (material: MaterialItem) => void;
  onDelete?: (material: MaterialItem) => void;
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

type SortField = 'name' | 'type' | 'stock' | 'unit_cost' | 'category';

export function MaterialsTable({
  materials,
  selectedIds,
  onSelect,
  onSelectAll,
  onDeselectAll,
  onEdit,
  onView,
  onDelete,
  loading = false,
  sortBy = 'name',
  sortOrder = 'asc',
  onSort
}: MaterialsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allSelected = materials.length > 0 && materials.every(m => selectedIds.includes(m.id));
  const someSelected = materials.some(m => selectedIds.includes(m.id)) && !allSelected;

  const getStockStatus = (item: MaterialItem): 'ok' | 'low' | 'critical' | 'out' => {
    const minStock = item.min_stock || 0;
    if (item.stock === 0) return 'out';
    if (item.stock < minStock * 0.5) return 'critical';
    if (item.stock <= minStock) return 'low';
    return 'ok';
  };

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case 'out': return 'red';
      case 'critical': return 'red';
      case 'low': return 'yellow';
      default: return 'green';
    }
  };

  const getABCColor = (abcClass?: string) => {
    switch (abcClass) {
      case 'A': return 'red';
      case 'B': return 'yellow';
      case 'C': return 'green';
      default: return 'gray';
    }
  };

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
        <Typography variant="body" size="sm" fontWeight="600">
          {children}
        </Typography>
        {sortBy === field && onSort && (
          <Icon
            icon={sortOrder === 'asc' ? ChevronUpIcon : ChevronDownIcon}
            size="xs"
          />
        )}
      </Stack>
    </Table.ColumnHeader>
  );

  if (loading) {
    return (
      <Box p="xl" textAlign="center">
        <Typography variant="body" color="gray.500">
          Cargando materiales...
        </Typography>
      </Box>
    );
  }

  if (materials.length === 0) {
    return (
      <Box p="xl" textAlign="center">
        <Typography variant="body" color="gray.500">
          No se encontraron materiales
        </Typography>
      </Box>
    );
  }

  return (
    <Box overflowX="auto" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row bg="gray.50">
            {/* Select All Checkbox */}
            <Table.ColumnHeader width="40px">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={allSelected ? onDeselectAll : onSelectAll}
              />
            </Table.ColumnHeader>

            {/* Sortable Columns */}
            <SortableHeader field="name">Nombre</SortableHeader>
            <SortableHeader field="type">Tipo</SortableHeader>
            <SortableHeader field="category">Categoría</SortableHeader>
            <SortableHeader field="stock">Stock</SortableHeader>
            <Table.ColumnHeader>Min</Table.ColumnHeader>
            <SortableHeader field="unit_cost">Costo</SortableHeader>
            <Table.ColumnHeader>ABC</Table.ColumnHeader>
            <Table.ColumnHeader>Estado</Table.ColumnHeader>
            <Table.ColumnHeader width="140px">Acciones</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {materials.map((material) => {
            const isSelected = selectedIds.includes(material.id);
            const isHovered = hoveredRow === material.id;
            const stockStatus = getStockStatus(material);

            return (
              <Table.Row
                key={material.id}
                bg={isSelected ? 'blue.50' : isHovered ? 'gray.50' : 'white'}
                onMouseEnter={() => setHoveredRow(material.id)}
                onMouseLeave={() => setHoveredRow(null)}
                _hover={{ bg: isSelected ? 'blue.50' : 'gray.50' }}
                cursor="pointer"
              >
                {/* Checkbox */}
                <Table.Cell>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onSelect(material.id)}
                  />
                </Table.Cell>

                {/* Name */}
                <Table.Cell onClick={() => onView?.(material)}>
                  <Typography variant="body" size="sm" fontWeight="500">
                    {material.name}
                  </Typography>
                </Table.Cell>

                {/* Type */}
                <Table.Cell>
                  <Badge size="sm" colorPalette="blue">
                    {material.type === 'MEASURABLE' ? 'Med.' :
                     material.type === 'COUNTABLE' ? 'Cont.' : 'Elab.'}
                  </Badge>
                </Table.Cell>

                {/* Category */}
                <Table.Cell>
                  <Typography variant="body" size="sm" color="gray.600">
                    {material.category || '-'}
                  </Typography>
                </Table.Cell>

                {/* Stock */}
                <Table.Cell>
                  <Typography variant="body" size="sm" fontWeight="500">
                    {formatQuantity(material.stock, material.unit, 1)}
                  </Typography>
                </Table.Cell>

                {/* Min Stock */}
                <Table.Cell>
                  <Typography variant="body" size="sm" color="gray.500">
                    {formatQuantity(material.min_stock || 0, material.unit, 1)}
                  </Typography>
                </Table.Cell>

                {/* Cost */}
                <Table.Cell>
                  <Typography variant="body" size="sm">
                    {formatCurrency(material.unit_cost || 0)}
                  </Typography>
                </Table.Cell>

                {/* ABC Class */}
                <Table.Cell>
                  <Badge
                    size="sm"
                    colorPalette={getABCColor((material as any).abcClass)}
                  >
                    {(material as any).abcClass || 'N/A'}
                  </Badge>
                </Table.Cell>

                {/* Stock Status */}
                <Table.Cell>
                  <Badge
                    size="sm"
                    colorPalette={getStockBadgeColor(stockStatus)}
                  >
                    {stockStatus === 'out' ? 'Agotado' :
                     stockStatus === 'critical' ? 'Crítico' :
                     stockStatus === 'low' ? 'Bajo' : 'OK'}
                  </Badge>
                </Table.Cell>

                {/* Actions */}
                <Table.Cell>
                  <Stack direction="row" gap="xs">
                    {onView && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(material);
                        }}
                      >
                        <Icon icon={EyeIcon} size="sm" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(material);
                        }}
                      >
                        <Icon icon={PencilIcon} size="sm" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(material);
                        }}
                      >
                        <Icon icon={TrashIcon} size="sm" />
                      </Button>
                    )}

                    {/* HookPoint: Supplier Actions - Allows modules to inject supplier-related actions */}
                    <HookPoint
                      name="materials.supplier.actions"
                      data={{ material }}
                      fallback={null}
                      direction="row"
                      gap={1}
                    />
                  </Stack>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
