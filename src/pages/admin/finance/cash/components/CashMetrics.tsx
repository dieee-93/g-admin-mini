/**
 * Cash Metrics Component
 * Displays key metrics for cash management (sessions, locations, cash on hand)
 * Following materials module pattern
 */

import { memo, useCallback } from 'react';
import { StatsSection, CardGrid, MetricCard } from '@/shared/ui';
import {
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  ClockIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/decimal';
import type { CashPageMetrics } from '../hooks/useCashPage';

interface CashMetricsProps {
  metrics: CashPageMetrics;
  onMetricClick?: (metricType: string) => void;
  loading?: boolean;
}

export const CashMetrics = memo(function CashMetrics({
  metrics,
  onMetricClick = () => {},
  loading,
}: CashMetricsProps) {
  // Performance optimization: stable function references
  const handleCashOnHandClick = useCallback(
    () => onMetricClick('cashOnHand'),
    [onMetricClick]
  );
  const handleActiveSessionsClick = useCallback(
    () => onMetricClick('activeSessions'),
    [onMetricClick]
  );
  const handleLocationsClick = useCallback(
    () => onMetricClick('locations'),
    [onMetricClick]
  );
  const handleExpectedClick = useCallback(
    () => onMetricClick('expected'),
    [onMetricClick]
  );

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
        {/* METRIC 1: Total Cash On Hand */}
        <MetricCard
          title="Efectivo en Caja"
          value={formatCurrency(metrics.totalCashOnHand)}
          subtitle="efectivo disponible"
          icon={BanknotesIcon}
          colorPalette="green"
          onClick={handleCashOnHandClick}
        />

        {/* METRIC 2: Active Sessions */}
        <MetricCard
          title="Sesiones Activas"
          value={metrics.activeSessions.toString()}
          subtitle="cajas abiertas"
          icon={ClockIcon}
          colorPalette={metrics.activeSessions > 0 ? 'blue' : 'gray'}
          onClick={handleActiveSessionsClick}
        />

        {/* METRIC 3: Total Locations */}
        <MetricCard
          title="Ubicaciones"
          value={metrics.totalLocations.toString()}
          subtitle="cajas y bancos"
          icon={BuildingLibraryIcon}
          colorPalette="purple"
          onClick={handleLocationsClick}
        />

        {/* METRIC 4: Expected Total */}
        <MetricCard
          title="Total Esperado"
          value={formatCurrency(metrics.totalExpected)}
          subtitle="según movimientos"
          icon={CurrencyDollarIcon}
          colorPalette="orange"
          onClick={handleExpectedClick}
        />
      </CardGrid>
    </StatsSection>
  );
});

CashMetrics.displayName = 'CashMetrics';
