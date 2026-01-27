import { useState, memo, useMemo, useCallback } from 'react';
import { Stack, Typography, Button, Icon, Badge, Box, Checkbox, Table } from '@/shared/ui';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatQuantity } from '@/lib/decimal';
import { HookPoint } from '@/lib/modules';
import { usePagination } from '@/hooks';
import type { MaterialItem } from '../../types';

// ✅ PERFORMANCE: Memoize style objects to prevent CSS regeneration
const HOVER_STYLE = { bg: 'gray.50' } as const;
const SELECTED_ROW_BG = 'blue.50';
const HOVERED_ROW_BG = 'gray.50';
const DEFAULT_ROW_BG = 'white';

// ✅ PERFORMANCE: Memoized ActionButtons component with stable handlers
interface ActionButtonsProps {
  material: MaterialItem;
  onView?: (material: MaterialItem) => void;
  onEdit?: (material: MaterialItem) => void;
  onDelete?: (material: MaterialItem) => void;
}

const ActionButtons = memo(({ material, onView, onEdit, onDelete }: ActionButtonsProps) => {
  // ✅ Create stable click handlers using useCallback
  const handleView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(material);
  }, [material, onView]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(material);
  }, [material, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(material);
  }, [material, onDelete]);

  return (
    <Stack direction="row" gap="xs">
      {onView && (
        <Button size="xs" variant="ghost" onClick={handleView}>
          <Icon icon={EyeIcon} size="sm" />
        </Button>
      )}
      {onEdit && (
        <Button size="xs" variant="ghost" onClick={handleEdit}>
          <Icon icon={PencilIcon} size="sm" />
        </Button>
      )}
      {onDelete && (
        <Button size="xs" variant="ghost" colorPalette="red" onClick={handleDelete}>
          <Icon icon={TrashIcon} size="sm" />
        </Button>
      )}

      <HookPoint
        name="materials.supplier.actions"
        data={{ material }}
        fallback={null}
        direction="row"
        gap="1"
      />
    </Stack>
  );
}, (prevProps, nextProps) => {
  // Only re-render if material ID changes or callbacks change
  return (
    prevProps.material.id === nextProps.material.id &&
    prevProps.onView === nextProps.onView &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});
ActionButtons.displayName = 'MaterialActionButtons';

// ✅ PERFORMANCE: Memoized pagination component to prevent re-renders
const PAGE_SIZES = [10, 25, 50, 100] as const;

const PaginationControls = memo(({ pagination }: { pagination: ReturnType<typeof usePagination> }) => (
  <Stack
    direction="row"
    justify="space-between"
    align="center"
    p="md"
    borderWidth="1px"
    borderColor="gray.200"
    borderRadius="lg"
    bg="white"
  >
    {/* Range Info */}
    <Typography variant="body" size="sm" color="gray.600">
      Mostrando {pagination.rangeText} materiales
    </Typography>

    {/* Pagination Controls */}
    <Stack direction="row" align="center" gap="sm">
      {/* First Page */}
      <Button
        size="sm"
        variant="ghost"
        onClick={pagination.goToFirstPage}
        disabled={pagination.isFirstPage}
      >
        Primera
      </Button>

      {/* Previous Page */}
      <Button
        size="sm"
        variant="ghost"
        onClick={pagination.prevPage}
        disabled={!pagination.hasPrevPage}
      >
        <Icon icon={ChevronLeftIcon} size="sm" />
      </Button>

      {/* Page Number */}
      <Typography variant="body" size="sm" fontWeight="600" px="md">
        Página {pagination.currentPage} de {pagination.totalPages}
      </Typography>

      {/* Next Page */}
      <Button
        size="sm"
        variant="ghost"
        onClick={pagination.nextPage}
        disabled={!pagination.hasNextPage}
      >
        <Icon icon={ChevronRightIcon} size="sm" />
      </Button>

      {/* Last Page */}
      <Button
        size="sm"
        variant="ghost"
        onClick={pagination.goToLastPage}
        disabled={pagination.isLastPage}
      >
        Última
      </Button>
    </Stack>

    {/* Page Size Selector */}
    <Stack direction="row" align="center" gap="sm">
      <Typography variant="body" size="sm" color="gray.600">
        Por página:
      </Typography>
      <Stack direction="row" gap="xs">
        {PAGE_SIZES.map((size) => (
          <Button
            key={size}
            size="sm"
            variant={pagination.pageSize === size ? 'solid' : 'ghost'}
            onClick={() => pagination.setPageSize(size)}
          >
            {size}
          </Button>
        ))}
      </Stack>
    </Stack>
  </Stack>
));
PaginationControls.displayName = 'MaterialsPaginationControls';

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
  // ✅ Phase 3: Pagination props
  pageSize?: number;
  enablePagination?: boolean;
}

type SortField = 'name' | 'type' | 'stock' | 'unit_cost' | 'category';

export const MaterialsTable = memo(function MaterialsTable({
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
  onSort,
  pageSize = 25,
  enablePagination = true
}: MaterialsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
MaterialsTable.displayName = 'MaterialsTable';

  // ✅ Phase 3: Pagination integration
  const pagination = usePagination(materials, pageSize, {
    initialPage: 1,
    initialPageSize: pageSize
  });

  // ✅ PERFORMANCE: Memoize hover style objects for selected/unselected states
  const hoverStyleSelected = useMemo(() => ({ bg: SELECTED_ROW_BG }), []);
  const hoverStyleUnselected = useMemo(() => ({ bg: HOVERED_ROW_BG }), []);

  // Use paginated data if pagination is enabled
  const displayedMaterials = enablePagination ? pagination.paginatedData : materials;

  // Memoize selection calculations (based on displayed materials)
  const allSelected = useMemo(
    () => displayedMaterials.length > 0 && displayedMaterials.every(m => selectedIds.includes(m.id)),
    [displayedMaterials, selectedIds]
  );

  const someSelected = useMemo(
    () => displayedMaterials.some(m => selectedIds.includes(m.id)) && !allSelected,
    [displayedMaterials, selectedIds, allSelected]
  );

  // Memoize utility functions
  const getStockStatus = useCallback((item: MaterialItem): 'ok' | 'low' | 'critical' | 'out' => {
    const minStock = item.min_stock || 0;
    if (item.stock === 0) return 'out';
    if (item.stock < minStock * 0.5) return 'critical';
    if (item.stock <= minStock) return 'low';
    return 'ok';
  }, []);

  const getStockBadgeColor = useCallback((status: string) => {
    switch (status) {
      case 'out': return 'red';
      case 'critical': return 'red';
      case 'low': return 'yellow';
      default: return 'green';
    }
  }, []);

  const getABCColor = useCallback((abcClass?: string) => {
    switch (abcClass) {
      case 'A': return 'red';
      case 'B': return 'yellow';
      case 'C': return 'green';
      default: return 'gray';
    }
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (onSort) {
      onSort(field);
    }
  }, [onSort]);

  // Memoize SortableHeader to prevent re-renders
  const SortableHeader = memo(({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Table.ColumnHeader
      cursor={onSort ? 'pointer' : 'default'}
      onClick={() => onSort && handleSort(field)}
      _hover={onSort ? HOVER_STYLE : undefined}
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
  ));

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
    <Stack gap="md" data-testid="materials-grid">
      <Box overflowX="auto" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row bg="gray.50">
            {/* Select All Checkbox */}
            <Table.ColumnHeader width="40px">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected ? true : undefined}
                onChange={allSelected ? onDeselectAll : onSelectAll}
                data-testid="select-all-checkbox"
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
          {displayedMaterials.map((material) => {
            const isSelected = selectedIds.includes(material.id);
            const isHovered = hoveredRow === material.id;
            const stockStatus = getStockStatus(material);

            // ✅ PERFORMANCE: Compute row background once
            const rowBg = isSelected ? SELECTED_ROW_BG : isHovered ? HOVERED_ROW_BG : DEFAULT_ROW_BG;
            const hoverStyle = isSelected ? hoverStyleSelected : hoverStyleUnselected;

            return (
              <Table.Row
                key={material.id}
                bg={rowBg}
                onMouseEnter={() => setHoveredRow(material.id)}
                onMouseLeave={() => setHoveredRow(null)}
                _hover={hoverStyle}
                cursor="pointer"
                data-testid={`material-row-${material.id}`}
              >
                {/* Checkbox */}
                <Table.Cell>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onSelect(material.id)}
                    data-testid="select-checkbox"
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
                    colorPalette={getABCColor((material as MaterialItem & { abcClass?: string }).abcClass)}
                  >
                    {(material as MaterialItem & { abcClass?: string }).abcClass || 'N/A'}
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
                  <ActionButtons
                    material={material}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>

    {/* ✅ Phase 3: Pagination Controls */}
    {enablePagination && pagination.totalPages > 1 && (
      <PaginationControls pagination={pagination} />
    )}
  </Stack>
  );
}, (prevProps, nextProps) => {
  // ✅ PERFORMANCE: Smart comparison for shallow equal check
  // Check materials by length + IDs instead of reference equality
  const materialsUnchanged =
    prevProps.materials.length === nextProps.materials.length &&
    (prevProps.materials.length === 0 || (
      prevProps.materials[0]?.id === nextProps.materials[0]?.id &&
      prevProps.materials[prevProps.materials.length - 1]?.id ===
        nextProps.materials[nextProps.materials.length - 1]?.id
    ));

  // Check if selectedIds changed (deep comparison by joining)
  const selectedIdsUnchanged =
    prevProps.selectedIds.length === nextProps.selectedIds.length &&
    prevProps.selectedIds.join(',') === nextProps.selectedIds.join(',');

  // Only re-render if data or callbacks meaningfully changed
  return (
    materialsUnchanged &&
    selectedIdsUnchanged &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onView === nextProps.onView &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.loading === nextProps.loading &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.sortOrder === nextProps.sortOrder
  );
});
