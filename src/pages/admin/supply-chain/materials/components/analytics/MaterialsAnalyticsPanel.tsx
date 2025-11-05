/**
 * Materials Analytics Panel using AnalyticsEngine
 * Demonstrates unified analytics patterns
 */
import React, { useEffect, useState } from 'react';
import {
  ContentLayout,
  Section,
  StatsSection,
  CardGrid,
  MetricCard,
  Typography,
  Button,
  Badge,
  Alert
} from '@/shared/ui';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { AnalyticsEngine, RFMAnalytics } from '@/shared/services/AnalyticsEngine';
import { useMaterialsPage } from '../../hooks/useMaterialsPage';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

import { logger } from '@/lib/logging';
interface CategoryStat {
  category: string;
  count: number;
  value: number;
}

interface RFMData {
  r: number;
  f: number;
  m: number;
  segment: string;
}

interface TimeSeriesPoint {
  label: string;
  value: number;
}

interface AnalyticsData {
  metrics: Record<string, unknown>;
  rfmAnalysis: Record<string, RFMData>;
  categoryStats: CategoryStat[];
  supplierAnalysis: SupplierData[];
  insights?: string[];
  recommendations?: Array<{ title: string; description: string; priority: string }>;
  timeSeries?: TimeSeriesPoint[];
}

interface SupplierData {
  id: string;
  total_value: number;
  frequency: number;
  last_activity?: string;
}

export function MaterialsAnalyticsPanel() {
  const { materials, loading } = useMaterialsPage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const generateAnalytics = React.useCallback(async () => {
    setAnalyticsLoading(true);

    try {
      // Generate comprehensive analytics using the unified engine
      const result = await AnalyticsEngine.generateAnalytics(materials, {
        module: 'Materials',
        timeRange: '30d',
        includeForecasting: true,
        includeTrends: true
      });

      // Materials-specific RFM analysis (for suppliers or categories)
      const supplierData = materials.reduce((acc, material) => {
        if (!material.supplier_id) return acc;

        const existing = acc.find(s => s.id === material.supplier_id);
        const materialValue = (material.stock || 0) * (material.unit_cost || 0);

        if (existing) {
          existing.total_value = (existing.total_value || 0) + materialValue;
          existing.frequency = (existing.frequency || 0) + 1;
          existing.last_activity = material.updated_at || existing.last_activity;
        } else {
          acc.push({
            id: material.supplier_id,
            total_value: materialValue,
            frequency: 1,
            last_activity: material.updated_at
          });
        }

        return acc;
      }, [] as SupplierData[]);

      const rfmAnalysis = RFMAnalytics.calculateRFM(supplierData);

      // Category analysis
      const categoryStats = Object.entries(result.metrics.total_count ? {} : {}).map(([category, count]) => ({
        category,
        count: Number(count),
        value: materials
          .filter(m => m.category === category)
          .reduce((sum, m) => sum + (m.total_value || 0), 0)
      }));

      setAnalyticsData({
        ...result,
        rfmAnalysis,
        categoryStats,
        supplierAnalysis: supplierData
      });

    } catch (error) {
      logger.error('MaterialsStore', 'Error generating materials analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [materials]);

  useEffect(() => {
    if (materials && materials.length > 0) {
      generateAnalytics();
    }
  }, [materials, generateAnalytics]);

  if (loading || analyticsLoading) {
    return (
      <ContentLayout>
        <Alert status="info" title="Generando análisis">
          Procesando datos de inventario...
        </Alert>
      </ContentLayout>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <ContentLayout>
        <Alert status="warning" title="Sin datos suficientes">
          Necesitas tener materiales registrados para generar análisis
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* Analytics Header */}
      <Section variant="flat" title="📊 Analytics de Materiales">
        <Typography size="sm" color="text.muted">
          Análisis inteligente basado en {materials.length} materiales registrados
        </Typography>

        <Button
          size="sm"
          variant="outline"
          onClick={generateAnalytics}
          loading={analyticsLoading}
        >
          🔄 Actualizar Análisis
        </Button>
      </Section>

      {/* Key Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard
            title="Valor Total"
            value={DecimalUtils.formatCurrency(analyticsData?.metrics?.total_value || 0)}
            subtitle="inventario completo"
            icon={CurrencyDollarIcon}
            colorPalette="green"
          />
          <MetricCard
            title="Valor Promedio"
            value={DecimalUtils.formatCurrency(analyticsData?.metrics?.average_value || 0)}
            subtitle="por material"
            icon={ChartBarIcon}
          />
          <MetricCard
            title="Tasa de Actividad"
            value={`${(analyticsData?.metrics?.activity_rate || 0).toFixed(1)}%`}
            subtitle="materiales activos"
            icon={analyticsData?.metrics?.activity_rate > 70 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
            colorPalette={analyticsData?.metrics?.activity_rate > 70 ? "green" : "yellow"}
          />
          <MetricCard
            title="Proveedores"
            value={analyticsData?.supplierAnalysis?.length || 0}
            subtitle="activos"
            icon={BuildingStorefrontIcon}
          />
        </CardGrid>
      </StatsSection>

      {/* Insights Section */}
      {analyticsData?.insights && analyticsData.insights.length > 0 && (
        <Section variant="elevated" title="💡 Insights Inteligentes">
          {analyticsData.insights.map((insight: string, index: number) => (
            <Typography key={index} size="sm" mb="xs">
              {insight}
            </Typography>
          ))}
        </Section>
      )}

      {/* Recommendations Section */}
      {analyticsData?.recommendations && analyticsData.recommendations.length > 0 && (
        <Section variant="elevated" title="🎯 Recomendaciones">
          {analyticsData.recommendations.map((rec: string, index: number) => (
            <Typography key={index} size="sm" mb="xs" color="blue.600">
              • {rec}
            </Typography>
          ))}
        </Section>
      )}

      {/* Category Breakdown */}
      {analyticsData?.categoryStats && (
        <Section variant="elevated" title="📈 Análisis por Categoría">
          <CardGrid columns={{ base: 1, md: 3 }} gap="md">
            {analyticsData.categoryStats.map((cat) => (
              <div key={cat.category} style={{
                padding: '12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px'
              }}>
                <Typography size="sm" fontWeight="medium">{cat.category}</Typography>
                <Typography size="lg" fontWeight="bold" color="blue.600">
                  {cat.count} items
                </Typography>
                <Typography size="xs" color="text.muted">
                  Valor: {DecimalUtils.formatCurrency(cat.value)}
                </Typography>
              </div>
            ))}
          </CardGrid>
        </Section>
      )}

      {/* Supplier RFM Analysis */}
      {analyticsData?.rfmAnalysis && Object.keys(analyticsData.rfmAnalysis).length > 0 && (
        <Section variant="elevated" title="🏢 Análisis de Proveedores (RFM)">
          <CardGrid columns={{ base: 1, md: 2 }} gap="md">
            {Object.entries(analyticsData.rfmAnalysis).map(([supplier, data]) => (
              <div key={supplier} style={{
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px'
              }}>
                <Typography size="sm" fontWeight="medium" mb="xs">{supplier}</Typography>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <Badge size="sm" colorPalette="blue">R: {data.r}</Badge>
                  <Badge size="sm" colorPalette="green">F: {data.f}</Badge>
                  <Badge size="sm" colorPalette="purple">M: {data.m}</Badge>
                </div>
                <Badge
                  colorPalette={
                    data.segment === 'Champions' ? 'green' :
                    data.segment === 'At Risk' ? 'red' : 'blue'
                  }
                  variant="subtle"
                >
                  {data.segment}
                </Badge>
              </div>
            ))}
          </CardGrid>
        </Section>
      )}

      {/* Time Series Chart Placeholder */}
      {analyticsData?.timeSeries && (
        <Section variant="elevated" title="📉 Tendencias Temporales">
          <Typography size="sm" color="text.muted" mb="md">
            Evolución del inventario en los últimos 30 días
          </Typography>

          {/* Simple text representation - in real app would use charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: '4px',
            fontSize: '10px'
          }}>
            {analyticsData.timeSeries.slice(-14).map((point, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  height: `${Math.max(20, (point.value / 10) * 40)}px`,
                  backgroundColor: 'var(--colors-blue-200)',
                  marginBottom: '4px'
                }}></div>
                <Typography size="xs">{point.label}</Typography>
              </div>
            ))}
          </div>
        </Section>
      )}
    </ContentLayout>
  );
}