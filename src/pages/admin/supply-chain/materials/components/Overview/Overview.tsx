// Overview.tsx - Vista general con headers y métricas de materials
import React from 'react';
import { Section, Stack } from '@/shared/ui';

// Sub-componentes internos
import { MaterialsHeader } from './MaterialsHeader';
import { StockLabHeader } from './StockLabHeader';

interface OverviewProps {
  onAddItem: () => void;
  onShowAnalytics?: () => void;
  showStockLab?: boolean;
}

export function Overview({ onAddItem, onShowAnalytics, showStockLab = false }: OverviewProps) {
  return (
    <Stack gap="md">
      <MaterialsHeader
        onAddItem={onAddItem}
        onShowAnalytics={onShowAnalytics}
      />

      {showStockLab && (
        <StockLabHeader />
      )}
    </Stack>
  );
}

export default Overview;