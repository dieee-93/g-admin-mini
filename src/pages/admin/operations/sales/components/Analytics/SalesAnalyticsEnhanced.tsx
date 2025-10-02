/**
 * Sales Analytics Enhanced using AnalyticsEngine
 * Demonstrates unified analytics patterns for sales data
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
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AnalyticsEngine, RFMAnalytics, TrendAnalytics } from '@/shared/services/AnalyticsEngine';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { useSales } from '../hooks/useSales';

import { logger } from '@/lib/logging';
interface SaleData {
  id: string;
  amount: number;
  customer_id?: string;
  created_at: string;
  updated_at?: string;
  payment_method: string;
  items_count: number;
  table_number?: string;
  status: 'completed' | 'pending' | 'cancelled';
  last_activity?: string;
  total_value: number;
}

interface CustomerSalesData {
  id: string;
  customer_id: string;
  customer_name?: string;
  total_value: number;
  frequency: number;
  last_activity: string;
}

export function SalesAnalyticsEnhanced() {
  const { sales, loading, customers } = useSales();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (sales && sales.length > 0) {
      generateSalesAnalytics();
    }
  }, [sales]);

  const generateSalesAnalytics = async () => {
    setAnalyticsLoading(true);

    try {
      // Convert sales data to the expected format
      const salesForAnalysis: SaleData[] = sales.map(sale => ({
        id: sale.id,
        amount: sale.amount || 0,
        customer_id: sale.customer_id,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        payment_method: sale.payment_method || 'cash',
        items_count: sale.items?.length || 0,
        table_number: sale.table_number,
        status: sale.status || 'completed',
        last_activity: sale.updated_at || sale.created_at,
        total_value: sale.amount || 0
      }));

      // Generate comprehensive sales analytics
      const result = await AnalyticsEngine.generateAnalytics(salesForAnalysis, {
        module: 'Sales',
        timeRange: '30d',
        includeForecasting: true,
        includeTrends: true
      });

      // Customer RFM Analysis for sales
      const customerSalesData: CustomerSalesData[] = [];
      const customerMap = new Map<string, CustomerSalesData>();

      salesForAnalysis.forEach(sale => {
        if (sale.customer_id) {
          const existing = customerMap.get(sale.customer_id);
          if (existing) {
            existing.total_value += sale.total_value;
            existing.frequency += 1;
            if (sale.last_activity && sale.last_activity > existing.last_activity) {
              existing.last_activity = sale.last_activity;
            }
          } else {
            customerMap.set(sale.customer_id, {
              id: sale.customer_id,
              customer_id: sale.customer_id,
              customer_name: customers?.find(c => c.id === sale.customer_id)?.name,
              total_value: sale.total_value,
              frequency: 1,
              last_activity: sale.last_activity || sale.created_at
            });
          }
        }
      });

      const customerSalesArray = Array.from(customerMap.values());
      const customerRFM = RFMAnalytics.calculateRFM(customerSalesArray);

      // Payment method analysis
      const paymentMethodStats = salesForAnalysis.reduce((acc, sale) => {
        const method = sale.payment_method || 'unknown';
        acc[method] = {
          count: (acc[method]?.count || 0) + 1,
          value: (acc[method]?.value || 0) + sale.total_value
        };
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      // Hourly performance analysis
      const hourlyStats = salesForAnalysis.reduce((acc, sale) => {
        const hour = new Date(sale.created_at).getHours();
        acc[hour] = {
          count: (acc[hour]?.count || 0) + 1,
          revenue: (acc[hour]?.revenue || 0) + sale.total_value
        };
        return acc;
      }, {} as Record<number, { count: number; revenue: number }>);

      // Peak hours identification
      const peakHour = Object.entries(hourlyStats)
        .sort(([,a], [,b]) => b.revenue - a.revenue)[0];

      setAnalyticsData({
        ...result,
        customerRFM,
        paymentMethodStats,
        hourlyStats,
        peakHour: peakHour ? { hour: parseInt(peakHour[0]), ...peakHour[1] } : null,
        customerSegments: Object.values(customerRFM).reduce((acc, customer) => {
          acc[customer.segment] = (acc[customer.segment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

    } catch (error) {
      logger.error('SalesStore', 'Error generating sales analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading || analyticsLoading) {
    return (
      <ContentLayout>
        <Alert status="info" title="Generando analytics de ventas">
          Procesando datos de transacciones...
        </Alert>
      </ContentLayout>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <ContentLayout>
        <Alert status="warning" title="Sin datos de ventas">
          Necesitas tener ventas registradas para generar análisis
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* Analytics Header */}
      <Section variant="flat" title="📊 Sales Analytics Inteligente">
        <Typography size="sm" color="text.muted">
          Análisis avanzado basado en {sales.length} transacciones
        </Typography>

        <Button
          size="sm"
          variant="outline"
          onClick={generateSalesAnalytics}
          loading={analyticsLoading}
        >
          <ArrowPathIcon className="w-4 h-4" />
          Actualizar Analytics
        </Button>
      </Section>

      {/* Key Financial Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard
            title="Revenue Total"
            value={DecimalUtils.formatCurrency(analyticsData?.metrics?.total_value || 0)}
            subtitle="últimos 30 días"
            icon={CurrencyDollarIcon}
            colorPalette="green"
          />
          <MetricCard
            title="Ticket Promedio"
            value={DecimalUtils.formatCurrency(analyticsData?.metrics?.average_value || 0)}
            subtitle="por transacción"
            icon={ChartBarIcon}
          />
          <MetricCard
            title="Transacciones"
            value={analyticsData?.metrics?.total_count || 0}
            subtitle="completadas"
            icon={UsersIcon}
          />
          <MetricCard
            title="Tasa de Actividad"
            value={`${(analyticsData?.metrics?.activity_rate || 0).toFixed(1)}%`}
            subtitle="ventas recientes"
            icon={analyticsData?.metrics?.activity_rate > 70 ? TrendingUpIcon : TrendingDownIcon}
            colorPalette={analyticsData?.metrics?.activity_rate > 70 ? "green" : "yellow"}
          />
        </CardGrid>
      </StatsSection>

      {/* Insights Section */}
      {analyticsData?.insights && analyticsData.insights.length > 0 && (
        <Section variant="elevated" title="💡 Insights de Ventas">
          {analyticsData.insights.map((insight: string, index: number) => (
            <Typography key={index} size="sm" mb="xs">
              {insight}
            </Typography>
          ))}
        </Section>
      )}

      {/* Customer Segmentation (RFM) */}
      {analyticsData?.customerRFM && Object.keys(analyticsData.customerRFM).length > 0 && (
        <Section variant="elevated" title="👥 Segmentación de Clientes (RFM)">
          <CardGrid columns={{ base: 1, md: 2 }}>
            {/* Customer Segments Summary */}
            <div>
              <Typography size="sm" fontWeight="medium" mb="sm">Segmentos de Clientes</Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(analyticsData.customerSegments || {}).map(([segment, count]) => (
                  <div key={segment} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Badge
                      colorPalette={
                        segment === 'Champions' ? 'green' :
                        segment === 'At Risk' ? 'red' :
                        segment === 'Loyal Customers' ? 'blue' : 'gray'
                      }
                      variant="subtle"
                    >
                      {segment}
                    </Badge>
                    <Typography size="sm">{count} clientes</Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div>
              <Typography size="sm" fontWeight="medium" mb="sm">Top Clientes</Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(analyticsData.customerRFM)
                  .sort(([,a], [,b]) => (b.f + b.m) - (a.f + a.m))
                  .slice(0, 5)
                  .map(([customerId, data]: [string, any]) => (
                  <div key={customerId} style={{
                    padding: '8px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px'
                  }}>
                    <Typography size="xs" fontWeight="medium">
                      Cliente {customerId.slice(0, 8)}
                    </Typography>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      <Badge size="xs" colorPalette="blue">R: {data.r}</Badge>
                      <Badge size="xs" colorPalette="green">F: {data.f}</Badge>
                      <Badge size="xs" colorPalette="purple">M: {data.m}</Badge>
                    </div>
                    <Badge size="xs" variant="outline" colorPalette="gray">
                      {data.segment}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardGrid>
        </Section>
      )}

      {/* Payment Methods Analysis */}
      {analyticsData?.paymentMethodStats && (
        <Section variant="elevated" title="💳 Métodos de Pago">
          <CardGrid columns={{ base: 1, md: 3 }}>
            {Object.entries(analyticsData.paymentMethodStats).map(([method, stats]: [string, any]) => (
              <div key={method} style={{
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px'
              }}>
                <Typography size="sm" fontWeight="medium" mb="xs">
                  {method.toUpperCase()}
                </Typography>
                <Typography size="lg" fontWeight="bold" color="blue.600" mb="xs">
                  {DecimalUtils.formatCurrency(stats.value)}
                </Typography>
                <Typography size="xs" color="text.muted">
                  {stats.count} transacciones
                </Typography>
                <Typography size="xs" color="text.muted">
                  Promedio: {DecimalUtils.formatCurrency(stats.value / stats.count)}
                </Typography>
              </div>
            ))}
          </CardGrid>
        </Section>
      )}

      {/* Peak Hours Analysis */}
      {analyticsData?.peakHour && (
        <Section variant="elevated" title="⏰ Análisis de Horarios Pico">
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--colors-blue-50)',
            borderRadius: '8px',
            border: '1px solid var(--colors-blue-200)'
          }}>
            <Typography size="sm" fontWeight="medium" mb="sm">
              🏆 Hora Pico: {analyticsData.peakHour.hour}:00 - {analyticsData.peakHour.hour + 1}:00
            </Typography>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <Typography size="xs" color="text.muted">Revenue</Typography>
                <Typography size="sm" fontWeight="bold">
                  {DecimalUtils.formatCurrency(analyticsData.peakHour.revenue)}
                </Typography>
              </div>
              <div>
                <Typography size="xs" color="text.muted">Transacciones</Typography>
                <Typography size="sm" fontWeight="bold">
                  {analyticsData.peakHour.count}
                </Typography>
              </div>
              <div>
                <Typography size="xs" color="text.muted">Promedio</Typography>
                <Typography size="sm" fontWeight="bold">
                  {DecimalUtils.formatCurrency(analyticsData.peakHour.revenue / analyticsData.peakHour.count)}
                </Typography>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {analyticsData?.recommendations && analyticsData.recommendations.length > 0 && (
        <Section variant="elevated" title="🎯 Recomendaciones">
          {analyticsData.recommendations.map((rec: string, index: number) => (
            <Typography key={index} size="sm" mb="xs" color="blue.600">
              • {rec}
            </Typography>
          ))}
        </Section>
      )}

      {/* Time Series Visualization Placeholder */}
      {analyticsData?.timeSeries && (
        <Section variant="elevated" title="📈 Tendencias de Ventas">
          <Typography size="sm" color="text.muted" mb="md">
            Evolución de ventas en los últimos 30 días
          </Typography>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))',
            gap: '2px',
            fontSize: '8px'
          }}>
            {analyticsData.timeSeries.slice(-14).map((point: any, index: number) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  height: `${Math.max(10, (point.value / 5) * 30)}px`,
                  backgroundColor: 'var(--colors-green-300)',
                  marginBottom: '2px'
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