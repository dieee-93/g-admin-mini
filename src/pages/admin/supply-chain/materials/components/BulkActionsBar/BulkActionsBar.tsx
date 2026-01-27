// ✅ PERFORMANCE: React.memo (Phase 2 Round 2)
import { memo } from 'react';
import { Stack, Typography, Button, Icon, Badge } from '@/shared/ui';
import {
  ArrowUpTrayIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface BulkActionsBarProps {
  selectedCount: number;
  onExport?: () => void;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  onBulkAddStock?: () => void;
  onBulkRemoveStock?: () => void;
  onBulkChangeCategory?: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export const BulkActionsBar = memo<BulkActionsBarProps>(function BulkActionsBar({
  selectedCount,
  onExport,
  onBulkEdit,
  onBulkDelete,
  onBulkAddStock,
  onBulkRemoveStock,
  onBulkChangeCategory,
  onClearSelection,
  disabled = false
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      align="center"
      justify="space-between"
      gap="md"
      bg="blue.50"
      borderColor="blue.200"
      borderWidth="1px"
      borderRadius="lg"
      p="md"
      position="sticky"
      bottom="20px"
      zIndex="sticky"
      boxShadow="lg"
      data-testid="bulk-actions-bar"
    >
      {/* Selection Info */}
      <Stack direction="row" align="center" gap="md">
        <Badge size="lg" colorPalette="blue" variant="solid" data-testid="selected-count">
          {selectedCount}
        </Badge>
        <Typography variant="body" size="sm" fontWeight="600" color="blue.700">
          {selectedCount === 1 ? '1 item seleccionado' : `${selectedCount} items seleccionados`}
        </Typography>
      </Stack>

      {/* Actions */}
      <Stack direction="row" align="center" gap="sm" wrap="wrap">
        {/* Export */}
        {onExport && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={onExport}
            disabled={disabled}
          >
            <Icon icon={ArrowUpTrayIcon} size="sm" />
            Exportar
          </Button>
        )}

        {/* Add Stock */}
        {onBulkAddStock && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="green"
            onClick={onBulkAddStock}
            disabled={disabled}
          >
            <Icon icon={PlusCircleIcon} size="sm" />
            Agregar Stock
          </Button>
        )}

        {/* Remove Stock */}
        {onBulkRemoveStock && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="orange"
            onClick={onBulkRemoveStock}
            disabled={disabled}
          >
            <Icon icon={MinusCircleIcon} size="sm" />
            Reducir Stock
          </Button>
        )}

        {/* Change Category */}
        {onBulkChangeCategory && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="purple"
            onClick={onBulkChangeCategory}
            disabled={disabled}
          >
            <Icon icon={TagIcon} size="sm" />
            Cambiar Categoría
          </Button>
        )}

        {/* Edit */}
        {onBulkEdit && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={onBulkEdit}
            disabled={disabled}
          >
            <Icon icon={PencilIcon} size="sm" />
            Editar
          </Button>
        )}

        {/* Delete */}
        {onBulkDelete && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={onBulkDelete}
            disabled={disabled}
          >
            <Icon icon={TrashIcon} size="sm" />
            Eliminar
          </Button>
        )}

        {/* Clear Selection */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={disabled}
        >
          <Icon icon={XMarkIcon} size="sm" />
          Limpiar
        </Button>
      </Stack>
    </Stack>
  );
});

BulkActionsBar.displayName = 'BulkActionsBar';
