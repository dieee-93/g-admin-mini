// ============================================
// SUPPLIERS METRICS - KPIs top bar
// ============================================

import React, { memo, useCallback } from 'react';
import { SimpleGrid, Icon } from '@/shared/ui';
import { StatCard } from '@/shared/widgets/StatCard';
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
 * Suppliers Metrics Cards
 * Using StatCard component (same as dashboard) for consistency
 */
export const SuppliersMetrics = memo(function SuppliersMetrics({
  metrics,
  loading,
  onMetricClick
}: SuppliersMetricsProps) {

  // Calculate derived metrics
  const activePercentage = metrics.totalSuppliers > 0
    ? ((metrics.activeSuppliers / metrics.totalSuppliers) * 100).toFixed(0)
    : '0';

  const inactiveCount = metrics.totalSuppliers - metrics.activeSuppliers;
  const hasRating = metrics.averageRating > 0;

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap="6">
      {/* Total Suppliers */}
      <StatCard
        title="Total Proveedores"
        value={metrics.totalSuppliers.toString()}
        icon={<Icon as={BuildingStorefrontIcon} boxSize={6} />}
        accentColor="blue.500"
        footer="Registrados"
        onClick={onMetricClick ? () => onMetricClick('total_suppliers') : undefined}
      />

      {/* Active Suppliers */}
      <StatCard
        title="Proveedores Activos"
        value={metrics.activeSuppliers.toString()}
        icon={<Icon as={CheckCircleIcon} boxSize={6} />}
        accentColor="green.500"
        footer={inactiveCount > 0 ? `${inactiveCount} inactivo${inactiveCount > 1 ? 's' : ''}` : 'Todos activos'}
        footerValue={`${activePercentage}%`}
        footerColor="green.600"
        onClick={onMetricClick ? () => onMetricClick('active_suppliers') : undefined}
      />

      {/* Average Rating */}
      <StatCard
        title="Rating Promedio"
        value={hasRating ? metrics.averageRating.toFixed(1) : '—'}
        subtitle={hasRating ? 'De 5.0 estrellas' : 'Sin evaluaciones'}
        icon={<Icon as={StarIcon} boxSize={6} />}
        accentColor="yellow.500"
        footer="Calidad general"
        onClick={onMetricClick ? () => onMetricClick('average_rating') : undefined}
      />

      {/* Without Rating - Always visible */}
      <StatCard
        title="Sin Rating"
        value={metrics.suppliersWithoutRating.toString()}
        icon={<Icon as={ExclamationTriangleIcon} boxSize={6} />}
        accentColor={metrics.suppliersWithoutRating > 0 ? 'orange.500' : 'gray.400'}
        footer={metrics.suppliersWithoutRating > 0 ? 'Requieren evaluación' : 'Todo evaluado'}
        onClick={onMetricClick ? () => onMetricClick('suppliers_without_rating') : undefined}
      />

      {/* Without Contact - Always visible */}
      <StatCard
        title="Sin Contacto"
        value={metrics.suppliersWithoutContact.toString()}
        icon={<Icon as={PhoneIcon} boxSize={6} />}
        accentColor={metrics.suppliersWithoutContact > 0 ? 'red.500' : 'gray.400'}
        footer={metrics.suppliersWithoutContact > 0 ? 'Información incompleta' : 'Todo completo'}
        onClick={onMetricClick ? () => onMetricClick('suppliers_without_contact') : undefined}
      />
    </SimpleGrid>
  );
});
