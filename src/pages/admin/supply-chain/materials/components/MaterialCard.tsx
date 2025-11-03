/**
 * MATERIAL CARD COMPONENT
 *
 * 🎯 ARCHITECTURAL PATTERN: Reusable Card Component
 * - Extracted from MaterialsGrid for reusability
 * - Demonstrates proper component extraction (DRY)
 * - Integrates permissions, theming, and hooks
 *
 * Usage: Used in MaterialsGrid and potentially other views
 */

import React from 'react';
import {
  Stack, Typography, Badge, Button, Alert, Icon
} from '@/shared/ui';
import { PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { CubeIcon } from '@heroicons/react/24/outline';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import type { MaterialItem } from '../types';
import { isMeasurable } from '../types';
import { HookPoint } from '@/lib/modules';

export interface MaterialCardProps {
  item: MaterialItem;
  status: 'ok' | 'low' | 'critical' | 'out';
  displayUnit: string;
  minStock: number;
  totalValue: number;
  onView: (item: MaterialItem) => void;
  onEdit: (item: MaterialItem) => void;
  onDelete: (item: MaterialItem) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  item,
  status,
  displayUnit,
  minStock,
  totalValue,
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete
}) => {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: 'var(--colors-bg-surface)',
        boxShadow: 'var(--shadows-sm)',
        border: '1px solid var(--colors-border-subtle)'
      }}
      tabIndex={0}
      role="article"
      aria-label={`${item.name} - ${isMeasurable(item) ? item.category : item.type.toLowerCase()}`}
    >
      <Stack gap="sm">
        {/* Header: Name + Status Badge */}
        <Stack direction="row" justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Typography variant="body" weight="semibold" size={{ base: 'md', md: 'lg' }}>
              {item.name}
            </Typography>
            <Typography variant="body" size="sm" color="text.muted" style={{ textTransform: 'capitalize' }}>
              {isMeasurable(item) ? item.category : item.type.toLowerCase()}
            </Typography>
          </Stack>

          <Badge
            colorPalette={status === 'critical' || status === 'out' ? 'red' : status === 'low' ? 'orange' : 'green'}
            size="sm"
          >
            {StockCalculation.getStatusLabel(status)}
          </Badge>
        </Stack>

        {/* Stock Information */}
        <Stack gap="xs">
          <Stack direction="row" justify="space-between">
            <Typography variant="body" size="sm" color="text.muted">Stock Actual:</Typography>
            <Typography variant="body" size="sm" weight="semibold" colorPalette={status === 'ok' ? 'green' : 'red'}>
              {item.stock} {displayUnit}
            </Typography>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Typography variant="body" size="sm" color="text.muted">Stock Mínimo:</Typography>
            <Typography variant="body" size="sm">{minStock} {displayUnit}</Typography>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Typography variant="body" size="sm" color="text.muted">Valor Total:</Typography>
            <Typography variant="body" size="sm" weight="semibold">${totalValue.toFixed(2)}</Typography>
          </Stack>
        </Stack>

        {/* Location (if available) */}
        {item.location_id && (
          <Stack direction="row" align="center" gap="1">
            <Icon icon={CubeIcon} size="xs" color="text.muted" />
            <Typography variant="body" size="xs" color="text.muted">
              Location: {item.location_id.slice(0, 8)}
            </Typography>
          </Stack>
        )}

        {/* Critical/Out of Stock Alert */}
        {(status === 'critical' || status === 'out') && (
          <Alert status="error" size="sm">
            {status === 'out' ? 'Sin stock disponible' : 'Stock crítico'}
          </Alert>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--colors-border-subtle)'
        }}>
          {/* 🔓 Ver always visible (read permission assumed for viewing the list) */}
          <Button
            size="xs"
            variant="outline"
            onClick={() => onView(item)}
            style={{ flex: 1 }}
            aria-label={`Ver ${item.name}`}
          >
            <Icon icon={EyeIcon} size="xs" />
            Ver
          </Button>

          {/* 🔒 Editar only if user has 'update' permission */}
          {canUpdate && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => onEdit(item)}
              style={{ flex: 1 }}
              aria-label={`Editar ${item.name}`}
            >
              <Icon icon={PencilIcon} size="xs" />
              Editar
            </Button>
          )}

          {/* 🔒 Eliminar only if user has 'delete' permission */}
          {canDelete && (
            <Button
              size="xs"
              variant="outline"
              colorPalette="red"
              onClick={() => onDelete(item)}
              aria-label={`Eliminar ${item.name}`}
            >
              <Icon icon={TrashIcon} size="xs" />
            </Button>
          )}

          {/* 🔒 Hook point automatically filters by permissions via HookPoint's requiredPermission validation */}
          <HookPoint
            name="materials.row.actions"
            data={{ material: item }}
            direction="row"
            gap="0.5rem"
            fallback={null}
          />
        </div>
      </Stack>
    </div>
  );
};

export default MaterialCard;
