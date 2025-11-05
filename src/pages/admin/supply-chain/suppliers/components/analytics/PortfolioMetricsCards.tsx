// ============================================
// PORTFOLIO METRICS CARDS
// ============================================
// Summary metrics for the entire supplier portfolio

import { SimpleGrid } from '@/shared/ui';
import { MetricCard } from '@/shared/ui';
import type { SupplierAnalysisResult } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import {
  BuildingStorefrontIcon,
  StarIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface PortfolioMetricsCardsProps {
  metrics: SupplierAnalysisResult['portfolioMetrics'];
}

/**
 * Portfolio Metrics Cards Component
 * Displays high-level metrics about the supplier portfolio
 */
export function PortfolioMetricsCards({ metrics }: PortfolioMetricsCardsProps) {
  // Calculate derived metrics
  const totalSuppliers = Object.values(metrics.ratingDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  const excellentSuppliers = metrics.ratingDistribution.excellent || 0;
  const goodSuppliers = metrics.ratingDistribution.good || 0;
  const healthySupplierPercentage = totalSuppliers > 0
    ? ((excellentSuppliers + goodSuppliers) / totalSuppliers) * 100
    : 0;

  const highRiskSuppliers =
    (metrics.riskDistribution.high || 0) + (metrics.riskDistribution.critical || 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
      {/* Average Rating */}
      <MetricCard
        title="Rating Promedio"
        value={metrics.averageRating.toFixed(1)}
        icon={StarIcon}
        colorPalette={getRatingColor(metrics.averageRating)}
        trend={
          metrics.averageRating >= 70
            ? { value: 'Saludable', direction: 'up' }
            : { value: 'Necesita mejora', direction: 'down' }
        }
      />

      {/* Healthy Suppliers Percentage */}
      <MetricCard
        title="Proveedores Saludables"
        value={`${healthySupplierPercentage.toFixed(0)}%`}
        icon={BuildingStorefrontIcon}
        colorPalette="blue"
        description={`${excellentSuppliers + goodSuppliers} de ${totalSuppliers} proveedores`}
      />

      {/* Total Annual Spend */}
      <MetricCard
        title="Gasto Anual Total"
        value={formatCurrency(metrics.totalAnnualSpend)}
        icon={CurrencyDollarIcon}
        colorPalette="green"
        description="Última año"
      />

      {/* High Risk Suppliers */}
      <MetricCard
        title="Proveedores Alto Riesgo"
        value={highRiskSuppliers.toString()}
        icon={ShieldExclamationIcon}
        colorPalette={highRiskSuppliers > 0 ? 'red' : 'green'}
        description={
          highRiskSuppliers > 0
            ? 'Requieren atención'
            : 'Ninguno identificado'
        }
      />

      {/* Supplier Concentration */}
      <MetricCard
        title="Concentración de Proveedores"
        value={`${metrics.supplierConcentration.toFixed(0)}%`}
        icon={ChartBarIcon}
        colorPalette={
          metrics.supplierConcentration > 60
            ? 'orange'
            : metrics.supplierConcentration > 40
            ? 'yellow'
            : 'green'
        }
        description="Top 3 proveedores"
        trend={
          metrics.supplierConcentration > 60
            ? { value: 'Riesgo alto', direction: 'down' }
            : undefined
        }
      />

      {/* Rating Distribution Summary */}
      <MetricCard
        title="Distribución de Rating"
        value={excellentSuppliers.toString()}
        icon={StarIcon}
        colorPalette="purple"
        description="Proveedores excelentes"
      />

      {/* Risk Distribution Summary */}
      <MetricCard
        title="Distribución de Riesgo"
        value={(metrics.riskDistribution.low || 0).toString()}
        icon={ShieldExclamationIcon}
        colorPalette="green"
        description="Bajo riesgo"
      />

      {/* On-Time Delivery (placeholder for future) */}
      <MetricCard
        title="Entregas a Tiempo"
        value="N/A"
        icon={TruckIcon}
        colorPalette="gray"
        description="Requiere datos históricos"
      />
    </SimpleGrid>
  );
}

/**
 * Get color palette based on rating
 */
function getRatingColor(rating: number): string {
  if (rating >= 85) return 'green';
  if (rating >= 70) return 'blue';
  if (rating >= 55) return 'yellow';
  if (rating >= 40) return 'orange';
  return 'red';
}
