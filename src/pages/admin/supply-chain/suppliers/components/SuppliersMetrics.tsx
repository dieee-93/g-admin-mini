// ============================================
// SUPPLIERS METRICS - KPIs top bar
// ============================================

import React, { memo, useCallback } from 'react';
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

/**
 * PERFORMANCE OPTIMIZATION:
 * Using useCallback for onClick handlers prevents MetricCard re-renders when parent updates.
 * Without useCallback: inline arrow functions create new references every render → memo() fails
 * With useCallback: stable function references → memo() prevents unnecessary re-renders
 * Pattern from React.dev: https://react.dev/reference/react/useCallback
 */
export const SuppliersMetrics = memo(function SuppliersMetrics({ metrics, loading, onMetricClick }: SuppliersMetricsProps) {
  // Stable handlers using useCallback - prevents MetricCard re-renders
  const handleTotalClick = useCallback(() => {
    onMetricClick?.('total_suppliers');
SuppliersMetrics.displayName = 'SuppliersMetrics';
  }, [onMetricClick]);

  const handleActiveClick = useCallback(() => {
    onMetricClick?.('active_suppliers');
  }, [onMetricClick]);

  const handleAverageRatingClick = useCallback(() => {
    onMetricClick?.('average_rating');
  }, [onMetricClick]);

  const handleNoRatingClick = useCallback(() => {
    onMetricClick?.('suppliers_without_rating');
  }, [onMetricClick]);

  const handleNoContactClick = useCallback(() => {
    onMetricClick?.('suppliers_without_contact');
  }, [onMetricClick]);

  return (
    <Stack direction="row" gap="3" wrap="wrap">
      {/* Total Suppliers */}
      <MetricCard
        label="Total Proveedores"
        value={metrics.totalSuppliers}
        icon={BuildingStorefrontIcon}
        colorPalette="blue"
        loading={loading}
        onClick={handleTotalClick}
      />

      {/* Active Suppliers */}
      <MetricCard
        label="Activos"
        value={metrics.activeSuppliers}
        icon={CheckCircleIcon}
        colorPalette="green"
        loading={loading}
        onClick={handleActiveClick}
      />

      {/* Average Rating */}
      <MetricCard
        label="Rating Promedio"
        value={metrics.averageRating.toFixed(1)}
        icon={StarIcon}
        colorPalette="yellow"
        loading={loading}
        onClick={handleAverageRatingClick}
      />

      {/* Without Rating */}
      {metrics.suppliersWithoutRating > 0 && (
        <MetricCard
          label="Sin Rating"
          value={metrics.suppliersWithoutRating}
          icon={ExclamationTriangleIcon}
          colorPalette="orange"
          loading={loading}
          onClick={handleNoRatingClick}
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
          onClick={handleNoContactClick}
        />
      )}
    </Stack>
  );
});
