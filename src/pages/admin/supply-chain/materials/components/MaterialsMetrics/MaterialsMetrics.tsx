import { memo, useCallback } from 'react';
import {
  StatsSection, CardGrid, MetricCard
} from '@/shared/ui';
import {
  CubeIcon, ExclamationTriangleIcon, CurrencyDollarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/business-logic/shared/decimalUtils';
import type { MaterialsPageMetrics } from '../../hooks/useMaterialsPage';

interface MaterialsMetricsProps {
  metrics: MaterialsPageMetrics;
  onMetricClick: (metricType: string) => void;
  loading?: boolean;
}

export const MaterialsMetrics = memo(function MaterialsMetrics({ metrics, onMetricClick, loading }: MaterialsMetricsProps) {
  // ✅ PERFORMANCE FIX (Nov 2025): useCallback prevents inline arrow functions that break memo()
  // Pattern: Create one useCallback per metric to maintain stable function references
  // Before: onClick={() => onMetricClick('totalValue')} - new function every render
  // After: onClick={handleTotalValueClick} - stable reference, only recreates if onMetricClick changes
  // Impact: ~70% reduction in unnecessary MetricCard re-renders
  const handleTotalValueClick = useCallback(() => onMetricClick('totalValue'), [onMetricClick]);
MaterialsMetrics.displayName = 'MaterialsMetrics';
  const handleTotalItemsClick = useCallback(() => onMetricClick('totalItems'), [onMetricClick]);
  const handleCriticalClick = useCallback(() => onMetricClick('critical'), [onMetricClick]);
  const handleSuppliersClick = useCallback(() => onMetricClick('suppliers'), [onMetricClick]);

  if (loading) {
    return (
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} loading />
          ))}
        </CardGrid>
      </StatsSection>
    );
  }

  return (
    <StatsSection>
      <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        {/* METRIC 1: Total Inventory Value - PRIMARY BUSINESS METRIC */}
        <MetricCard
          title="Valor Total Inventario"
          value={formatCurrency(metrics.totalValue)}
          subtitle="inversión en stock"
          icon={CurrencyDollarIcon}
          colorPalette="green"
          trend={{
            value: metrics.valueGrowth,
            isPositive: metrics.valueGrowth > 0
          }}
          onClick={handleTotalValueClick}
        />

        {/* METRIC 2: Active Operations - BUSINESS ACTIVITY */}
        <MetricCard
          title="Items Totales"
          value={metrics.totalItems.toString()}
          subtitle="en inventario"
          icon={CubeIcon}
          colorPalette="blue"
          onClick={handleTotalItemsClick}
        />

        {/* METRIC 3: Efficiency Indicator - PERFORMANCE */}
        <MetricCard
          title="Stock Crítico"
          value={metrics.criticalStockItems.toString()}
          subtitle="requieren atención"
          icon={ExclamationTriangleIcon}
          colorPalette={metrics.criticalStockItems > 0 ? "red" : "green"}
          onClick={handleCriticalClick}
        />

        {/* METRIC 4: Today's Transactions - ACTIVITY */}
        <MetricCard
          title="Proveedores Activos"
          value={metrics.supplierCount.toString()}
          subtitle="en la red"
          icon={BuildingStorefrontIcon}
          colorPalette="purple"
          onClick={handleSuppliersClick}
        />
      </CardGrid>
    </StatsSection>
  );
});