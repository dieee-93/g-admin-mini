/**
 * ASSETS METRICS COMPONENT
 * Display key asset metrics using MetricCard
 */

import { Grid, Skeleton, Stack } from '@/shared/ui';
import { MetricCard } from '@/shared/ui/MetricCard';
import {
  CubeIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { AssetMetrics } from '../types';

interface AssetsMetricsProps {
  metrics?: AssetMetrics;
  isLoading?: boolean;
}

export function AssetsMetrics({ metrics, isLoading }: AssetsMetricsProps) {
  if (isLoading || !metrics) {
    return (
      <Grid columns={{ base: 1, md: 2, lg: 5 }} gap={4}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="140px" />
        ))}
      </Grid>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Grid columns={{ base: 1, md: 2, lg: 5 }} gap={4}>
      <MetricCard
        title="Total Assets"
        value={metrics.total_assets}
        icon={CubeIcon}
        colorPalette="blue"
      />

      <MetricCard
        title="Disponibles"
        value={metrics.available_count}
        icon={CheckCircleIcon}
        colorPalette="green"
      />

      <MetricCard
        title="En Uso / Alquilados"
        value={`${metrics.in_use_count} / ${metrics.rented_count}`}
        icon={ClockIcon}
        colorPalette="orange"
      />

      <MetricCard
        title="Mantenimiento"
        value={metrics.maintenance_count}
        subtitle={`${metrics.maintenance_due_soon} próximos`}
        icon={WrenchScrewdriverIcon}
        colorPalette="yellow"
        badge={
          metrics.maintenance_due_soon > 0
            ? {
                value: `${metrics.maintenance_due_soon} urgentes`,
                colorPalette: 'red',
                variant: 'solid',
              }
            : undefined
        }
      />

      <MetricCard
        title="Valor Total"
        value={formatCurrency(metrics.total_value)}
        subtitle={`${metrics.rentable_count} alquilables`}
        icon={BanknotesIcon}
        colorPalette="purple"
      />
    </Grid>
  );
}
