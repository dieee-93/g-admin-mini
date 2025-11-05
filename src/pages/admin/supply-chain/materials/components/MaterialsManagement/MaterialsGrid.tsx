import React from 'react';
import {
  CardGrid, Stack, Typography, Section, Icon
} from '@/shared/ui';
import { CubeIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { useAuth } from '@/contexts/AuthContext';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import type { MaterialItem } from '../../types';
import { MaterialCard } from '../MaterialCard'; 

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

  // 🔒 PERMISSIONS: Check user permissions for update and delete actions
  const { canPerformAction } = useAuth();
  const canUpdate = canPerformAction('materials', 'update');
  const canDelete = canPerformAction('materials', 'delete');

  // 🎯 OPTIMIZED: Memoize calculations to avoid re-computation on every render
  const itemsWithStatus = React.useMemo(() =>
    items.map(item => ({
      item,
      status: StockCalculation.getStockStatus(item),
      displayUnit: StockCalculation.getDisplayUnit(item),
      minStock: StockCalculation.getMinStock(item),
      totalValue: StockCalculation.getTotalValue(item)
    })),
    [items]
  );

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
            <Icon icon={CubeIcon} size="xl" color="gray.400" />
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
        {itemsWithStatus.map(({ item, status, displayUnit, minStock, totalValue }) => (
          <MaterialCard
            key={item.id}
            item={item}
            status={status}
            displayUnit={displayUnit}
            minStock={minStock}
            totalValue={totalValue}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ))}
      </CardGrid>
    </Section>
  );
};

export default MaterialsGrid;