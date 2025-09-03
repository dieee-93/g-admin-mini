import React from 'react';
import {
  CardGrid, Stack, Typography, Badge, Button, Alert, Section
} from '@/shared/ui';
import { PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { CubeIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { StockCalculations } from '../utils/stockCalculations';
import type { MaterialItem } from '../types';
import { isMeasurable } from '../types';

interface MaterialsGridProps {
  onEdit: (item: MaterialItem) => void;
  onView: (item: MaterialItem) => void;
  onDelete: (item: MaterialItem) => void;
}

// 🎯 Using centralized utilities for all calculations

export const MaterialsGrid: React.FC<MaterialsGridProps> = ({ onEdit, onView, onDelete }) => {
  // 🎯 Use the main hook directly for better reactivity
  const { getFilteredItems, loading } = useMaterials();
  const items = getFilteredItems();

  // 🚀 Calculate status for each item (removed memo for better reactivity)
  const itemsWithStatus = items.map(item => ({
    item,
    status: StockCalculations.getStockStatus(item),
    displayUnit: StockCalculations.getDisplayUnit(item),
    minStock: StockCalculations.getMinStock(item),
    totalValue: StockCalculations.getTotalValue(item)
  }));

  if (loading) {
    return (
      <Section variant="flat">
        <CardGrid columns={{ base: 1, md: 2, lg: 3 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--colors-bg-subtle)' }}>
              <Stack gap="sm">
                <div style={{ height: '16px', width: '100%', borderRadius: '8px', backgroundColor: 'var(--colors-bg-muted)' }} />
                <div style={{ height: '12px', width: '80px', borderRadius: '8px', backgroundColor: 'var(--colors-bg-muted)' }} />
              </Stack>
            </div>
          ))}
        </CardGrid>
      </Section>
    );
  }

  if (itemsWithStatus.length === 0) {
    return (
      <Section variant="flat">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Stack align="center" gap="md">
            <CubeIcon className="w-12 h-12 text-gray-400" />
            <Stack align="center" gap="sm">
              <Typography variant="body" size="lg" weight="semibold" color="text.muted">No se encontraron materiales</Typography>
              <Typography variant="body" size="sm" color="text.muted">Intenta ajustar los filtros o agregar nuevos materiales</Typography>
            </Stack>
          </Stack>
        </div>
      </Section>
    );
  }

  return (
    <Section variant="flat">
      <CardGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }}>
        {itemsWithStatus.map(({ item, status, displayUnit, minStock, totalValue }) => {
          return (
            <div
              key={item.id}
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
                <Stack direction="row" justify="space-between" align="flex-start">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Typography variant="body" weight="semibold" size={{ base: 'md', md: 'lg' }}>{item.name}</Typography>
                    <Typography variant="body" size="sm" color="text.muted" style={{ textTransform: 'capitalize' }}>{isMeasurable(item) ? item.category : item.type.toLowerCase()}</Typography>
                  </Stack>

                  <Badge 
                    colorPalette={status === 'critical' || status === 'out' ? 'red' : status === 'low' ? 'orange' : 'green'} 
                    size="sm"
                  >
                    {StockCalculations.getStatusLabel(status)}
                  </Badge>
                </Stack>

                <Stack gap="xs">
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="text.muted">Stock Actual:</Typography>
                    <Typography variant="body" size="sm" weight="semibold" colorPalette={status === 'ok' ? 'green' : 'red'}>{item.stock} {displayUnit}</Typography>
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

                {(() => {
                  const loc = (item as unknown as { location?: string }).location;
                  return loc ? (
                    <Stack direction="row">
                      <Typography variant="body" size="xs" color="text.muted">📍 {loc}</Typography>
                    </Stack>
                  ) : null;
                })()}

                {(status === 'critical' || status === 'out') && (
                  <Alert status="error" size="sm">
                    {status === 'out' ? 'Sin stock disponible' : 'Stock crítico'}
                  </Alert>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  paddingTop: '0.5rem', 
                  borderTop: '1px solid var(--colors-border-subtle)' 
                }}>
                  <Button size="xs" variant="outline" onClick={() => onView(item)} style={{ flex: 1 }} aria-label={`Ver ${item.name}`}>
                    <EyeIcon className="w-3 h-3" />
                    Ver
                  </Button>

                  <Button size="xs" variant="outline" onClick={() => onEdit(item)} style={{ flex: 1 }} aria-label={`Editar ${item.name}`}>
                    <PencilIcon className="w-3 h-3" />
                    Editar
                  </Button>

                  <Button size="xs" variant="outline" colorPalette="red" onClick={() => onDelete(item)} aria-label={`Eliminar ${item.name}`}>
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                </div>
              </Stack>
            </div>
          );
        })}
      </CardGrid>
    </Section>
  );
};

export default MaterialsGrid;