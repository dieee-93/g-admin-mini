import React from 'react';
import {
  ContentLayout, Section, Stack, Badge, Button, CardGrid, MetricCard
} from '@/shared/ui';
import { Icon } from '@/shared/ui';

interface IntegrationAnalyticsData {
  paymentProviders: {
    provider: string;
    icon: string;
    transactions: number;
    volume: number;
    successRate: number;
    avgProcessingTime: string;
    marketShare: number;
    trend: 'up' | 'down' | 'stable';
    status: 'active' | 'inactive' | 'maintenance';
  }[];

  performanceMetrics: {
    totalTransactions: number;
    totalVolume: number;
    avgSuccessRate: number;
    avgProcessingTime: string;
    webhookReliability: number;
    systemUptime: number;
  };

  paymentMethods: {
    method: string;
    transactions: number;
    volume: number;
    percentage: number;
    avgTicket: number;
  }[];

  integrationInsights: {
    category: string;
    insight: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
    provider?: string;
    metric?: number;
  }[];

  timeSeriesData: {
    date: string;
    mercadopago: number;
    modo: number;
    qr: number;
    total: number;
  }[];
}

const IntegrationsAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [selectedProvider, setSelectedProvider] = React.useState<string>('all');

  // Simulated data - En producción vendría de APIs reales
  const analyticsData: IntegrationAnalyticsData = {
    paymentProviders: [
      {
        provider: 'MercadoPago',
        icon: 'CreditCardIcon',
        transactions: 1247,
        volume: 18765000,
        successRate: 98.2,
        avgProcessingTime: '1.2s',
        marketShare: 74.4,
        trend: 'up',
        status: 'active'
      },
      {
        provider: 'MODO',
        icon: 'BanknotesIcon',
        transactions: 342,
        volume: 5234000,
        successRate: 99.1,
        avgProcessingTime: '0.8s',
        marketShare: 20.4,
        trend: 'up',
        status: 'active'
      },
      {
        provider: 'QR Interoperable',
        icon: 'QrCodeIcon',
        transactions: 156,
        volume: 890000,
        successRate: 97.6,
        avgProcessingTime: '1.5s',
        marketShare: 5.2,
        trend: 'stable',
        status: 'active'
      }
    ],

    performanceMetrics: {
      totalTransactions: 1745,
      totalVolume: 24889000,
      avgSuccessRate: 98.3,
      avgProcessingTime: '1.1s',
      webhookReliability: 99.7,
      systemUptime: 99.9
    },

    paymentMethods: [
      { method: 'Tarjeta de Crédito', transactions: 687, volume: 12450000, percentage: 50.0, avgTicket: 18120 },
      { method: 'Dinero en Cuenta MP', transactions: 423, volume: 6780000, percentage: 27.2, avgTicket: 16026 },
      { method: 'Transferencia Bancaria', transactions: 312, volume: 4120000, percentage: 16.5, avgTicket: 13205 },
      { method: 'QR Payments', transactions: 156, volume: 890000, percentage: 3.6, avgTicket: 5705 },
      { method: 'Tarjeta de Débito', transactions: 167, volume: 649000, percentage: 2.6, avgTicket: 3887 }
    ],

    integrationInsights: [
      {
        category: 'Performance',
        insight: 'MercadoPago procesó 74.4% del volumen con 98.2% de éxito',
        impact: 'high',
        action: 'Mantener optimización actual',
        provider: 'MercadoPago',
        metric: 98.2
      },
      {
        category: 'Market Trends',
        insight: 'MODO creció 34% en transacciones vs mes anterior',
        impact: 'high',
        action: 'Expandir integración MODO para capturar crecimiento',
        provider: 'MODO',
        metric: 34
      },
      {
        category: 'Payment Methods',
        insight: 'QR payments representan solo 3.6% pero crecen 45% mensual',
        impact: 'medium',
        action: 'Promover QR interoperable para aumentar adopción',
        provider: 'QR',
        metric: 45
      },
      {
        category: 'Reliability',
        insight: 'Webhooks mantienen 99.7% de confiabilidad',
        impact: 'medium',
        action: 'Continuar monitoreo proactivo',
        metric: 99.7
      },
      {
        category: 'Cost Optimization',
        insight: 'Transferencias MODO tienen 0% comisión vs 2.99% tarjetas',
        impact: 'high',
        action: 'Incentivar pagos MODO para reducir costos',
        provider: 'MODO'
      }
    ],

    timeSeriesData: [
      { date: '2024-09-01', mercadopago: 42000, modo: 15000, qr: 3000, total: 60000 },
      { date: '2024-09-02', mercadopago: 38000, modo: 18000, qr: 3500, total: 59500 },
      { date: '2024-09-03', mercadopago: 45000, modo: 16500, qr: 2800, total: 64300 },
      { date: '2024-09-04', mercadopago: 41000, modo: 19000, qr: 4200, total: 64200 },
      { date: '2024-09-05', mercadopago: 47000, modo: 17200, qr: 3800, total: 68000 }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'ArrowTrendingUpIcon';
      case 'down': return 'ArrowTrendingDownIcon';
      case 'stable': return 'MinusIcon';
      default: return 'MinusIcon';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      case 'stable': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'maintenance': return 'orange';
      default: return 'gray';
    }
  };

  const filteredProviders = selectedProvider === 'all'
    ? analyticsData.paymentProviders
    : analyticsData.paymentProviders.filter(p => p.provider.toLowerCase().includes(selectedProvider.toLowerCase()));

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        {/* Controls */}
        <Section title="Controles de Vista" variant="flat">
          <Stack direction="row" gap="md" align="center">
            <Stack direction="row" gap="sm">
              <Button
                size="sm"
                variant={timeRange === '24h' ? 'solid' : 'outline'}
                onClick={() => setTimeRange('24h')}
              >
                24h
              </Button>
              <Button
                size="sm"
                variant={timeRange === '7d' ? 'solid' : 'outline'}
                onClick={() => setTimeRange('7d')}
              >
                7 días
              </Button>
              <Button
                size="sm"
                variant={timeRange === '30d' ? 'solid' : 'outline'}
                onClick={() => setTimeRange('30d')}
              >
                30 días
              </Button>
              <Button
                size="sm"
                variant={timeRange === '90d' ? 'solid' : 'outline'}
                onClick={() => setTimeRange('90d')}
              >
                90 días
              </Button>
            </Stack>

            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            >
              <option value="all">Todos los Providers</option>
              <option value="mercadopago">MercadoPago</option>
              <option value="modo">MODO</option>
              <option value="qr">QR Interoperable</option>
            </select>
          </Stack>
        </Section>

        {/* Performance Metrics */}
        <Section title="Métricas de Performance del Sistema" variant="elevated">
          <CardGrid columns={{ base: 2, md: 3, lg: 6 }} gap="md">
            <MetricCard
              title="Transacciones"
              value={analyticsData.performanceMetrics.totalTransactions.toLocaleString()}
              icon="CreditCardIcon"
              trend={{ value: 15, isPositive: true }}
              subtitle="vs período anterior"
            />
            <MetricCard
              title="Volumen Procesado"
              value={`$${(analyticsData.performanceMetrics.totalVolume / 1000000).toFixed(1)}M`}
              icon="BanknotesIcon"
              colorScheme="green"
              subtitle="ARS en el período"
            />
            <MetricCard
              title="Tasa de Éxito"
              value={`${analyticsData.performanceMetrics.avgSuccessRate}%`}
              icon="CheckCircleIcon"
              colorScheme="blue"
              trend={{ value: 2.1, isPositive: true }}
              subtitle="promedio ponderado"
            />
            <MetricCard
              title="Tiempo Procesamiento"
              value={analyticsData.performanceMetrics.avgProcessingTime}
              icon="ClockIcon"
              colorScheme="purple"
              subtitle="tiempo promedio"
            />
            <MetricCard
              title="Confiabilidad Webhooks"
              value={`${analyticsData.performanceMetrics.webhookReliability}%`}
              icon="BoltIcon"
              colorScheme="orange"
              subtitle="delivery rate"
            />
            <MetricCard
              title="System Uptime"
              value={`${analyticsData.performanceMetrics.systemUptime}%`}
              icon="ServerIcon"
              colorScheme="green"
              subtitle="disponibilidad"
            />
          </CardGrid>
        </Section>

        {/* Payment Providers Performance */}
        <Section title="Performance por Payment Provider" variant="elevated">
          <Stack gap="md">
            {filteredProviders.map((provider, index) => (
              <Stack
                key={index}
                direction="row"
                align="center"
                justify="between"
                padding="md"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
              >
                <Stack direction="row" align="center" gap="md" flex="1">
                  <Stack>
                    <Icon name={provider.icon as any} size="lg" />
                    <Badge
                      colorPalette={getStatusColor(provider.status)}
                      variant="subtle"
                      size="sm"
                    >
                      {provider.status}
                    </Badge>
                  </Stack>

                  <Stack gap="xs">
                    <h4 style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {provider.provider}
                    </h4>
                    <Stack direction="row" gap="md" align="center">
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        Market Share: {provider.marketShare}%
                      </span>
                      <Badge
                        colorPalette={getTrendColor(provider.trend)}
                        variant="subtle"
                        size="sm"
                      >
                        <Icon name={getTrendIcon(provider.trend) as any} size="xs" />
                        {provider.trend === 'up' ? 'Creciendo' : provider.trend === 'down' ? 'Declinando' : 'Estable'}
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction="row" gap="lg" align="center">
                  <Stack align="center">
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      {provider.transactions.toLocaleString()}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Transacciones</p>
                  </Stack>
                  <Stack align="center">
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      ${(provider.volume / 1000000).toFixed(1)}M
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Volumen</p>
                  </Stack>
                  <Stack align="center">
                    <p style={{ fontWeight: 'bold', fontSize: '18px', color: provider.successRate > 98 ? '#38a169' : '#f56565' }}>
                      {provider.successRate}%
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Éxito</p>
                  </Stack>
                  <Stack align="center">
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      {provider.avgProcessingTime}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Tiempo</p>
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Payment Methods Analysis */}
        <Section title="Análisis por Método de Pago" variant="elevated">
          <Stack gap="md">
            {analyticsData.paymentMethods.map((method, index) => (
              <Stack
                key={index}
                direction="row"
                align="center"
                justify="between"
                padding="md"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Stack flex="2">
                  <h4 style={{ fontWeight: 'bold' }}>{method.method}</h4>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {method.transactions.toLocaleString()} transacciones ({method.percentage}% del total)
                  </p>
                </Stack>

                <Stack direction="row" gap="lg" align="center">
                  <Stack align="center">
                    <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      ${(method.volume / 1000000).toFixed(1)}M
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Volumen</p>
                  </Stack>
                  <Stack align="center">
                    <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      ${method.avgTicket.toLocaleString()}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Ticket Promedio</p>
                  </Stack>
                  <div style={{
                    width: '100px',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${method.percentage}%`,
                        height: '100%',
                        backgroundColor: '#3182ce'
                      }}
                    />
                  </div>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Integration Insights */}
        <Section title="Insights de Integración" variant="elevated">
          <Stack gap="md">
            {analyticsData.integrationInsights.map((insight, index) => (
              <Stack
                key={index}
                padding="md"
                borderRadius="md"
                border="1px solid"
                borderColor={insight.impact === 'high' ? 'red.200' : insight.impact === 'medium' ? 'orange.200' : 'blue.200'}
                bg={insight.impact === 'high' ? 'red.50' : insight.impact === 'medium' ? 'orange.50' : 'blue.50'}
              >
                <Stack direction="row" align="center" justify="between">
                  <Stack direction="row" align="center" gap="md">
                    <Badge
                      colorPalette={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'orange' : 'blue'}
                      variant="subtle"
                    >
                      {insight.category}
                    </Badge>
                    <Badge
                      colorPalette={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'orange' : 'blue'}
                      variant="outline"
                    >
                      {insight.impact} impact
                    </Badge>
                    {insight.provider && (
                      <Badge colorPalette="gray" variant="outline">
                        {insight.provider}
                      </Badge>
                    )}
                  </Stack>
                  {insight.metric && (
                    <Badge colorPalette="green" variant="subtle" size="lg">
                      {insight.metric}%
                    </Badge>
                  )}
                </Stack>

                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0' }}>
                  {insight.insight}
                </p>

                <Stack direction="row" align="center" gap="sm">
                  <Icon name="ArrowRightIcon" size="sm" />
                  <span style={{ fontSize: '14px', fontStyle: 'italic' }}>
                    Acción recomendada: {insight.action}
                  </span>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Quick Actions */}
        <Section title="Acciones Rápidas" variant="flat">
          <Stack direction="row" gap="md" wrap="wrap">
            <Button colorPalette="blue" size="sm">
              <Icon name="ChartBarIcon" />
              Generar Reporte Detallado
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="CogIcon" />
              Configurar Alertas
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="DocumentArrowDownIcon" />
              Exportar Datos
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="ArrowPathIcon" />
              Refrescar Métricas
            </Button>
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
};

export default IntegrationsAnalytics;