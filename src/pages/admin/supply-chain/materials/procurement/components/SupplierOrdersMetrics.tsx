// ============================================
// SUPPLIER ORDERS METRICS - KPI cards
// ============================================

import React, { memo, useCallback } from 'react';
import { Stack, MetricCard } from '@/shared/ui';
import type { SupplierOrderMetrics } from '../types';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SupplierOrdersMetricsProps {
  metrics: SupplierOrderMetrics;
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
export const SupplierOrdersMetrics = memo(function SupplierOrdersMetrics({ metrics, loading, onMetricClick }: SupplierOrdersMetricsProps) {
  // Stable handlers using useCallback - prevents MetricCard re-renders
  const handleTotalClick = useCallback(() => {
    onMetricClick?.('total');
SupplierOrdersMetrics.displayName = 'SupplierOrdersMetrics';
  }, [onMetricClick]);

  const handleDraftClick = useCallback(() => {
    onMetricClick?.('draft');
  }, [onMetricClick]);

  const handlePendingClick = useCallback(() => {
    onMetricClick?.('pending');
  }, [onMetricClick]);

  const handleApprovedClick = useCallback(() => {
    onMetricClick?.('approved');
  }, [onMetricClick]);

  const handleReceivedClick = useCallback(() => {
    onMetricClick?.('received');
  }, [onMetricClick]);

  const handlePendingValueClick = useCallback(() => {
    onMetricClick?.('pending_value');
  }, [onMetricClick]);

  const handleOverdueClick = useCallback(() => {
    onMetricClick?.('overdue');
  }, [onMetricClick]);
  return (
    <Stack direction="row" gap="3" wrap="wrap">
      {/* Total Orders */}
      <MetricCard
        label="Total Órdenes"
        value={metrics.totalOrders}
        icon={DocumentTextIcon}
        colorPalette="blue"
        loading={loading}
        onClick={handleTotalClick}
      />

      {/* Draft */}
      <MetricCard
        label="Borradores"
        value={metrics.draftOrders}
        icon={DocumentTextIcon}
        colorPalette="gray"
        loading={loading}
        onClick={handleDraftClick}
      />

      {/* Pending */}
      <MetricCard
        label="Pendientes"
        value={metrics.pendingOrders}
        icon={ClockIcon}
        colorPalette="yellow"
        loading={loading}
        onClick={handlePendingClick}
      />

      {/* Approved */}
      <MetricCard
        label="Aprobadas"
        value={metrics.approvedOrders}
        icon={CheckCircleIcon}
        colorPalette="blue"
        loading={loading}
        onClick={handleApprovedClick}
      />

      {/* Received */}
      <MetricCard
        label="Recibidas"
        value={metrics.receivedOrders}
        icon={CheckBadgeIcon}
        colorPalette="green"
        loading={loading}
        onClick={handleReceivedClick}
      />

      {/* Pending Value */}
      {metrics.totalPendingValue > 0 && (
        <MetricCard
          label="Valor Pendiente"
          value={`$${metrics.totalPendingValue.toFixed(2)}`}
          icon={CurrencyDollarIcon}
          colorPalette="purple"
          loading={loading}
          onClick={handlePendingValueClick}
        />
      )}

      {/* Overdue */}
      {metrics.overdueOrders > 0 && (
        <MetricCard
          label="Vencidas"
          value={metrics.overdueOrders}
          icon={ExclamationTriangleIcon}
          colorPalette="red"
          loading={loading}
          onClick={handleOverdueClick}
        />
      )}
    </Stack>
  );
});
