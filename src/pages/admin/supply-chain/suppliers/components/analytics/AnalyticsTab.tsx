// ============================================
// ANALYTICS TAB - Main analytics dashboard
// ============================================

import { Section, Tabs, Spinner, Alert, Stack, Button } from '@/shared/ui';
import { useSupplierAnalytics } from '../../hooks/useSupplierAnalytics';
import { PortfolioMetricsCards } from './PortfolioMetricsCards';
import { SupplierPerformanceGrid } from './SupplierPerformanceGrid';
import { SupplierComparisonChart } from './SupplierComparisonChart';
import { RiskFactorsPanel } from './RiskFactorsPanel';
import { ConsolidationOpportunities } from './ConsolidationOpportunities';
import { StrategicRecommendations } from './StrategicRecommendations';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Analytics Tab Component
 * Main supplier analytics dashboard with multiple views
 */
export function AnalyticsTab() {
  const { analytics, loading, error, refreshAnalytics } = useSupplierAnalytics();

  if (loading) {
    return (
      <Section variant="elevated">
        <Stack direction="row" align="center" justify="center" minH="400px">
          <Spinner size="lg" />
        </Stack>
      </Section>
    );
  }

  if (error) {
    return (
      <Section variant="elevated">
        <Alert status="error" title="Error al cargar analytics">
          {error}
        </Alert>
        <Button mt="4" onClick={refreshAnalytics}>
          Reintentar
        </Button>
      </Section>
    );
  }

  if (!analytics || analytics.suppliersAnalyzed === 0) {
    return (
      <Section variant="elevated">
        <Alert status="info" title="Sin datos">
          No hay suficientes datos para generar analytics. Agrega proveedores y órdenes de compra para ver el análisis.
        </Alert>
      </Section>
    );
  }

  return (
    <Section variant="elevated">
      <Tabs.Root defaultValue="overview">
        <Stack direction="row" justify="space-between" mb="4">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="performance">Performance</Tabs.Trigger>
            <Tabs.Trigger value="comparison">Comparación</Tabs.Trigger>
            <Tabs.Trigger value="risks">Riesgos</Tabs.Trigger>
            <Tabs.Trigger value="opportunities">Oportunidades</Tabs.Trigger>
          </Tabs.List>

          <Button
            size="sm"
            variant="ghost"
            onClick={refreshAnalytics}
            disabled={loading}
          >
            <ArrowPathIcon width={16} height={16} />
            Actualizar
          </Button>
        </Stack>

        {/* Overview Tab */}
        <Tabs.Content value="overview">
          <Stack direction="column" gap="6">
            {/* Portfolio Metrics Summary */}
            <PortfolioMetricsCards metrics={analytics.portfolioMetrics} />

            {/* Top/Bottom Performers */}
            <SupplierPerformanceGrid
              suppliers={analytics.supplierAnalyses}
              showTopPerformers
            />
          </Stack>
        </Tabs.Content>

        {/* Performance Tab */}
        <Tabs.Content value="performance">
          <SupplierPerformanceGrid suppliers={analytics.supplierAnalyses} />
        </Tabs.Content>

        {/* Comparison Tab */}
        <Tabs.Content value="comparison">
          <SupplierComparisonChart data={analytics.supplierAnalyses} />
        </Tabs.Content>

        {/* Risks Tab */}
        <Tabs.Content value="risks">
          <RiskFactorsPanel suppliers={analytics.supplierAnalyses} />
        </Tabs.Content>

        {/* Opportunities Tab */}
        <Tabs.Content value="opportunities">
          <Stack direction="column" gap="6">
            <ConsolidationOpportunities
              opportunities={analytics.consolidationOpportunities}
            />
            <StrategicRecommendations
              recommendations={analytics.strategicRecommendations}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
}
