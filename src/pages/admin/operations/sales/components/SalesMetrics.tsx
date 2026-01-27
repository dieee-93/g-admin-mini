import React, { memo, useCallback } from 'react';
import { StatsSection, CardGrid, MetricCard, HStack } from '@/shared/ui';
import { HookPoint } from '@/lib/modules';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import type { SalesPageMetrics } from '../hooks/useSalesPage';

interface SalesMetricsProps {
  metrics: SalesPageMetrics;
  onMetricClick?: (metric: string, value: string | number) => void;
  loading?: boolean;
}

/**
 * SalesMetrics - Simplified Core Metrics
 * 
 * Shows 3 core metrics that are ALWAYS visible:
 * - Revenue Hoy
 * - Transacciones
 * - Ticket Promedio
 * 
 * Additional capability-specific metrics are injected via HookPoint:
 * - Onsite module: Mesas Activas, Ocupación
 * - Delivery module: En Ruta, Tiempo Entrega
 */
export const SalesMetrics = memo(function SalesMetrics({
  metrics,
  onMetricClick,
  loading
}: SalesMetricsProps) {
  // Stable handlers using useCallback - prevents MetricCard re-renders
  const handleRevenueClick = useCallback(() => {
    onMetricClick?.('revenue', metrics.todayRevenue);
  }, [onMetricClick, metrics.todayRevenue]);

  const handleTransactionsClick = useCallback(() => {
    onMetricClick?.('transactions', metrics.todayTransactions);
  }, [onMetricClick, metrics.todayTransactions]);

  const handleAverageOrderClick = useCallback(() => {
    onMetricClick?.('averageOrder', metrics.averageOrderValue);
  }, [onMetricClick, metrics.averageOrderValue]);

  if (loading) {
    return (
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 3 }}>
          {[1, 2, 3].map((i) => (
            <MetricCard
              key={i}
              title="Cargando..."
              value="---"
              icon={CurrencyDollarIcon}
              colorPalette="gray"
              loading={true}
            />
          ))}
        </CardGrid>
      </StatsSection>
    );
  }

  return (
    <StatsSection>
      {/* Core Metrics - Always visible (3 cards) */}
      <CardGrid columns={{ base: 1, sm: 3 }}>
        <MetricCard
          title="Revenue Hoy"
          value={`$${metrics.todayRevenue.toLocaleString('es-AR')}`}
          icon={CurrencyDollarIcon}
          colorPalette="green"
          trend={{ value: metrics.salesGrowth, isPositive: metrics.salesGrowth > 0 }}
          onClick={handleRevenueClick}
        />
        <MetricCard
          title="Transacciones"
          value={metrics.todayTransactions}
          icon={CreditCardIcon}
          colorPalette="blue"
          onClick={handleTransactionsClick}
        />
        <MetricCard
          title="Ticket Promedio"
          value={`$${metrics.averageOrderValue.toLocaleString('es-AR')}`}
          icon={ArrowTrendingUpIcon}
          colorPalette="purple"
          onClick={handleAverageOrderClick}
        />
      </CardGrid>

      {/* Dynamic Metrics - Injected by capability modules via HookPoint */}
      <HookPoint
        name="sales.metrics.additional"
        data={{ metrics, onMetricClick }}
        fallback={null}
      />
    </StatsSection>
  );
});

SalesMetrics.displayName = 'SalesMetrics';