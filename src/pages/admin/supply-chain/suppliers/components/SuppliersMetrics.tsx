// ============================================
// SUPPLIERS METRICS - KPIs top bar
// ============================================

import React from 'react';
import { Stack, MetricCard } from '@/shared/ui';
import type { SupplierMetrics } from '../types/supplierTypes';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  StarIcon,
  ExclamationTriangleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface SuppliersMetricsProps {
  metrics: SupplierMetrics;
  loading?: boolean;
  onMetricClick?: (metric: string) => void;
}

export function SuppliersMetrics({ metrics, loading, onMetricClick }: SuppliersMetricsProps) {
  return (
    <Stack direction="row" gap={3} wrap="wrap">
      {/* Total Suppliers */}
      <MetricCard
        label="Total Proveedores"
        value={metrics.totalSuppliers}
        icon={BuildingStorefrontIcon}
        colorPalette="blue"
        loading={loading}
        onClick={() => onMetricClick?.('total_suppliers')}
      />

      {/* Active Suppliers */}
      <MetricCard
        label="Activos"
        value={metrics.activeSuppliers}
        icon={CheckCircleIcon}
        colorPalette="green"
        loading={loading}
        onClick={() => onMetricClick?.('active_suppliers')}
      />

      {/* Average Rating */}
      <MetricCard
        label="Rating Promedio"
        value={metrics.averageRating.toFixed(1)}
        icon={StarIcon}
        colorPalette="yellow"
        loading={loading}
        onClick={() => onMetricClick?.('average_rating')}
      />

      {/* Without Rating */}
      {metrics.suppliersWithoutRating > 0 && (
        <MetricCard
          label="Sin Rating"
          value={metrics.suppliersWithoutRating}
          icon={ExclamationTriangleIcon}
          colorPalette="orange"
          loading={loading}
          onClick={() => onMetricClick?.('without_rating')}
        />
      )}

      {/* Without Contact */}
      {metrics.suppliersWithoutContact > 0 && (
        <MetricCard
          label="Sin Contacto"
          value={metrics.suppliersWithoutContact}
          icon={PhoneIcon}
          colorPalette="red"
          loading={loading}
          onClick={() => onMetricClick?.('without_contact')}
        />
      )}
    </Stack>
  );
}
