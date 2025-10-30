// ============================================
// SUPPLIER ORDERS METRICS - KPI cards
// ============================================

import React from 'react';
import { Stack, MetricCard } from '@/shared/ui';
import type { SupplierOrderMetrics } from '../types';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SupplierOrdersMetricsProps {
  metrics: SupplierOrderMetrics;
  loading?: boolean;
  onMetricClick?: (metric: string) => void;
}

export function SupplierOrdersMetrics({ metrics, loading, onMetricClick }: SupplierOrdersMetricsProps) {
  return (
    <Stack direction="row" gap={3} wrap="wrap">
      {/* Total Orders */}
      <MetricCard
        label="Total Órdenes"
        value={metrics.totalOrders}
        icon={DocumentTextIcon}
        colorPalette="blue"
        loading={loading}
        onClick={() => onMetricClick?.('total')}
      />

      {/* Draft */}
      <MetricCard
        label="Borradores"
        value={metrics.draftOrders}
        icon={DocumentTextIcon}
        colorPalette="gray"
        loading={loading}
        onClick={() => onMetricClick?.('draft')}
      />

      {/* Pending */}
      <MetricCard
        label="Pendientes"
        value={metrics.pendingOrders}
        icon={ClockIcon}
        colorPalette="yellow"
        loading={loading}
        onClick={() => onMetricClick?.('pending')}
      />

      {/* Approved */}
      <MetricCard
        label="Aprobadas"
        value={metrics.approvedOrders}
        icon={CheckCircleIcon}
        colorPalette="blue"
        loading={loading}
        onClick={() => onMetricClick?.('approved')}
      />

      {/* Received */}
      <MetricCard
        label="Recibidas"
        value={metrics.receivedOrders}
        icon={CheckBadgeIcon}
        colorPalette="green"
        loading={loading}
        onClick={() => onMetricClick?.('received')}
      />

      {/* Pending Value */}
      {metrics.totalPendingValue > 0 && (
        <MetricCard
          label="Valor Pendiente"
          value={`$${metrics.totalPendingValue.toFixed(2)}`}
          icon={CurrencyDollarIcon}
          colorPalette="purple"
          loading={loading}
          onClick={() => onMetricClick?.('pending_value')}
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
          onClick={() => onMetricClick?.('overdue')}
        />
      )}
    </Stack>
  );
}
