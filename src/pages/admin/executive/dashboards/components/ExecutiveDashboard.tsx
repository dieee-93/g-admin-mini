import React from 'react';
import {
  ContentLayout, Section, Stack, Badge, Button, CardGrid, MetricCard
} from '@/shared/ui';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  CalculatorIcon,
  CheckCircleIcon,
  CubeIcon,
  UserIcon,
  ArchiveBoxIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  SparklesIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface ExecutiveMetrics {
  revenue: {
    current: number;
    previous: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    forecastAccuracy: number;
  };

  profitability: {
    grossMargin: number;
    netMargin: number;
    ebitda: number;
    trend: 'up' | 'down' | 'stable';
  };

  customerMetrics: {
    totalCustomers: number;
    activeCustomers: number;
    churnRate: number;
    ltv: number;
    acquisitionCost: number;
    nps: number;
  };

  operationalEfficiency: {
    assetUtilization: number;
    staffProductivity: number;
    inventoryTurnover: number;
    cashCycle: number;
  };

  strategicKPIs: {
    marketShare: number;
    brandHealth: number;
    innovationIndex: number;
    sustainabilityScore: number;
    riskScore: number;
  };

  executiveAlerts: {
    id: string;
    type: 'opportunity' | 'risk' | 'anomaly' | 'milestone';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    metric?: number;
    action: string;
    deadline?: string;
  }[];
}

const ExecutiveDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState<'ytd' | 'quarterly' | 'monthly'>('quarterly');
  const [view, setView] = React.useState<'financial' | 'operational' | 'strategic'>('financial');

  // Simulated executive data - En producción viene de analytics engine existente
  const executiveData: ExecutiveMetrics = {
    revenue: {
      current: 24890000,
      previous: 21230000,
      target: 26500000,
      trend: 'up',
      forecastAccuracy: 94.2
    },

    profitability: {
      grossMargin: 34.7,
      netMargin: 12.4,
      ebitda: 18.9,
      trend: 'up'
    },

    customerMetrics: {
      totalCustomers: 12547,
      activeCustomers: 8934,
      churnRate: 4.2,
      ltv: 45600,
      acquisitionCost: 1250,
      nps: 67
    },

    operationalEfficiency: {
      assetUtilization: 87.3,
      staffProductivity: 142,
      inventoryTurnover: 12.4,
      cashCycle: 23
    },

    strategicKPIs: {
      marketShare: 8.7,
      brandHealth: 78,
      innovationIndex: 65,
      sustainabilityScore: 72,
      riskScore: 23
    },

    executiveAlerts: [
      {
        id: 'alert_001',
        type: 'opportunity',
        priority: 'high',
        title: 'Expansión de Mercado Detectada',
        description: 'Analytics muestran 34% crecimiento en segmento premium sin competencia directa',
        metric: 34,
        action: 'Evaluar estrategia de expansión premium',
        deadline: '2024-09-30'
      },
      {
        id: 'alert_002',
        type: 'risk',
        priority: 'high',
        title: 'Concentración de Ingresos',
        description: '67% de revenue viene de top 3 clientes - riesgo de concentración',
        metric: 67,
        action: 'Diversificar base de clientes',
        deadline: '2024-10-15'
      },
      {
        id: 'alert_003',
        type: 'milestone',
        priority: 'medium',
        title: 'Target Q3 Superado',
        description: 'Revenue Q3 superó target en 8.2% - momentum positivo confirmed',
        metric: 8.2,
        action: 'Acelerar investment en growth drivers'
      },
      {
        id: 'alert_004',
        type: 'anomaly',
        priority: 'medium',
        title: 'Patrón de Comportamiento Anómalo',
        description: 'Customer lifecycle en segmento enterprise cambió 23% vs modelo predictivo',
        metric: 23,
        action: 'Revisar assumptions del modelo'
      }
    ]
  };

  const revenueProgress = (executiveData.revenue.current / executiveData.revenue.target) * 100;
  const revenueGrowth = ((executiveData.revenue.current - executiveData.revenue.previous) / executiveData.revenue.previous) * 100;

  const renderFinancialView = () => (
    <Stack gap="lg">
      {/* Revenue Performance */}
      <Section title="Performance Financiero" variant="elevated">
        <CardGrid columns={{ base: 2, md: 4 }} gap="md">
          <MetricCard
            title="Revenue Actual"
            value={`$${(executiveData.revenue.current / 1000000).toFixed(1)}M`}
            icon={CurrencyDollarIcon}
            trend={{ value: revenueGrowth, isPositive: true }}
            subtitle={`vs período anterior`}
          />
          <MetricCard
            title="Target Achievement"
            value={`${revenueProgress.toFixed(1)}%`}
            icon={ChartBarIcon}
            colorPalette={revenueProgress >= 100 ? 'green' : revenueProgress >= 90 ? 'orange' : 'red'}
            subtitle={`Target: $${(executiveData.revenue.target / 1000000).toFixed(1)}M`}
          />
          <MetricCard
            title="Gross Margin"
            value={`${executiveData.profitability.grossMargin}%`}
            icon={ArrowTrendingUpIcon}
            colorPalette="green"
            subtitle="vs industry avg 28%"
          />
          <MetricCard
            title="EBITDA"
            value={`${executiveData.profitability.ebitda}%`}
            icon={PresentationChartLineIcon}
            colorPalette="purple"
            subtitle="earnings performance"
          />
        </CardGrid>

        <Stack gap="md" marginTop="md">
          <h4>Revenue Forecast Accuracy: {executiveData.revenue.forecastAccuracy}%</h4>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${revenueProgress}%`,
                height: '100%',
                backgroundColor: revenueProgress >= 100 ? '#38a169' : revenueProgress >= 90 ? '#d69e2e' : '#f56565'
              }}
            />
          </div>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Progress hacia target anual: ${(executiveData.revenue.current / 1000000).toFixed(1)}M / ${(executiveData.revenue.target / 1000000).toFixed(1)}M
          </p>
        </Stack>
      </Section>

      {/* Customer & Business Health */}
      <Section title="Customer & Business Health" variant="elevated">
        <CardGrid columns={{ base: 2, md: 3, lg: 6 }} gap="md">
          <MetricCard
            title="Total Customers"
            value={executiveData.customerMetrics.totalCustomers.toLocaleString()}
            icon={UserGroupIcon}
            colorPalette="blue"
            subtitle="customer base"
          />
          <MetricCard
            title="Customer LTV"
            value={`$${(executiveData.customerMetrics.ltv / 1000).toFixed(0)}K`}
            icon={CurrencyDollarIcon}
            colorPalette="green"
            subtitle="lifetime value"
          />
          <MetricCard
            title="Churn Rate"
            value={`${executiveData.customerMetrics.churnRate}%`}
            icon={ArrowTrendingDownIcon}
            colorPalette={executiveData.customerMetrics.churnRate < 5 ? 'green' : 'red'}
            subtitle="monthly churn"
          />
          <MetricCard
            title="NPS Score"
            value={executiveData.customerMetrics.nps.toString()}
            icon={StarIcon}
            colorPalette={executiveData.customerMetrics.nps > 60 ? 'green' : executiveData.customerMetrics.nps > 40 ? 'orange' : 'red'}
            subtitle="net promoter score"
          />
          <MetricCard
            title="CAC Ratio"
            value={`1:${(executiveData.customerMetrics.ltv / executiveData.customerMetrics.acquisitionCost).toFixed(1)}`}
            icon={CalculatorIcon}
            colorPalette="purple"
            subtitle="LTV:CAC ratio"
          />
          <MetricCard
            title="Active Rate"
            value={`${((executiveData.customerMetrics.activeCustomers / executiveData.customerMetrics.totalCustomers) * 100).toFixed(1)}%`}
            icon={CheckCircleIcon}
            colorPalette="blue"
            subtitle="customer engagement"
          />
        </CardGrid>
      </Section>
    </Stack>
  );

  const renderOperationalView = () => (
    <Stack gap="lg">
      <Section title="Operational Excellence" variant="elevated">
        <CardGrid columns={{ base: 2, md: 4 }} gap="md">
          <MetricCard
            title="Asset Utilization"
            value={`${executiveData.operationalEfficiency.assetUtilization}%`}
            icon={CubeIcon}
            colorPalette="green"
            subtitle="asset efficiency"
          />
          <MetricCard
            title="Staff Productivity"
            value={`${executiveData.operationalEfficiency.staffProductivity}`}
            icon={UserIcon}
            colorPalette="blue"
            subtitle="productivity index"
          />
          <MetricCard
            title="Inventory Turnover"
            value={`${executiveData.operationalEfficiency.inventoryTurnover}x`}
            icon={ArchiveBoxIcon}
            colorPalette="purple"
            subtitle="annual turnover"
          />
          <MetricCard
            title="Cash Cycle"
            value={`${executiveData.operationalEfficiency.cashCycle} days`}
            icon={ClockIcon}
            colorPalette={executiveData.operationalEfficiency.cashCycle < 30 ? 'green' : 'orange'}
            subtitle="cash conversion"
          />
        </CardGrid>
      </Section>

      <Section title="Process Efficiency Insights" variant="elevated">
        <Stack gap="md">
          <p>💡 <strong>Asset Optimization</strong>: Utilización de assets al 87.3% - top quartile industry</p>
          <p>📈 <strong>Staff Performance</strong>: Productivity index 142 vs baseline 100 - exceptional</p>
          <p>🔄 <strong>Inventory Management</strong>: 12.4x turnover vs industry avg 8.2x - efficient operations</p>
          <p>💰 <strong>Cash Management</strong>: 23-day cash cycle vs industry avg 45 days - strong liquidity</p>
        </Stack>
      </Section>
    </Stack>
  );

  const renderStrategicView = () => (
    <Stack gap="lg">
      <Section title="Strategic KPIs" variant="elevated">
        <CardGrid columns={{ base: 2, md: 5 }} gap="md">
          <MetricCard
            title="Market Share"
            value={`${executiveData.strategicKPIs.marketShare}%`}
            icon={GlobeAltIcon}
            colorPalette="blue"
            subtitle="market position"
          />
          <MetricCard
            title="Brand Health"
            value={`${executiveData.strategicKPIs.brandHealth}/100`}
            icon={HeartIcon}
            colorPalette="red"
            subtitle="brand strength"
          />
          <MetricCard
            title="Innovation Index"
            value={`${executiveData.strategicKPIs.innovationIndex}/100`}
            icon={LightBulbIcon}
            colorPalette="yellow"
            subtitle="innovation capability"
          />
          <MetricCard
            title="Sustainability"
            value={`${executiveData.strategicKPIs.sustainabilityScore}/100`}
            icon={SparklesIcon}
            colorPalette="green"
            subtitle="ESG score"
          />
          <MetricCard
            title="Risk Score"
            value={`${executiveData.strategicKPIs.riskScore}/100`}
            icon={ShieldExclamationIcon}
            colorPalette={executiveData.strategicKPIs.riskScore < 30 ? 'green' : executiveData.strategicKPIs.riskScore < 60 ? 'orange' : 'red'}
            subtitle="enterprise risk"
          />
        </CardGrid>
      </Section>

      <Section title="Strategic Positioning" variant="elevated">
        <Stack gap="md">
          <p>🎯 <strong>Market Position</strong>: 8.7% market share con growth trajectory sustained</p>
          <p>🏆 <strong>Brand Strength</strong>: Score 78/100 - strong brand equity y customer loyalty</p>
          <p>🚀 <strong>Innovation</strong>: Index 65/100 - continuous improvement needed</p>
          <p>🌱 <strong>Sustainability</strong>: Score 72/100 - approaching industry leadership</p>
          <p>🛡️ <strong>Risk Management</strong>: Low risk profile (23/100) - well-controlled exposure</p>
        </Stack>
      </Section>
    </Stack>
  );

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'green';
      case 'risk': return 'red';
      case 'milestone': return 'blue';
      case 'anomaly': return 'orange';
      default: return 'gray';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return 'ArrowTrendingUpIcon';
      case 'risk': return 'ExclamationTriangleIcon';
      case 'milestone': return 'TrophyIcon';
      case 'anomaly': return 'QuestionMarkCircleIcon';
      default: return 'InformationCircleIcon';
    }
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        {/* Executive Controls */}
        <Section title="Executive Controls" variant="flat">
          <Stack direction="row" gap="md" align="center">
            <Stack direction="row" gap="sm">
              <Button
                size="sm"
                variant={timeframe === 'monthly' ? 'solid' : 'outline'}
                onClick={() => setTimeframe('monthly')}
              >
                Monthly
              </Button>
              <Button
                size="sm"
                variant={timeframe === 'quarterly' ? 'solid' : 'outline'}
                onClick={() => setTimeframe('quarterly')}
              >
                Quarterly
              </Button>
              <Button
                size="sm"
                variant={timeframe === 'ytd' ? 'solid' : 'outline'}
                onClick={() => setTimeframe('ytd')}
              >
                Year-to-Date
              </Button>
            </Stack>

            <Stack direction="row" gap="sm">
              <Button
                size="sm"
                variant={view === 'financial' ? 'solid' : 'outline'}
                onClick={() => setView('financial')}
                colorPalette="green"
              >
                Financial
              </Button>
              <Button
                size="sm"
                variant={view === 'operational' ? 'solid' : 'outline'}
                onClick={() => setView('operational')}
                colorPalette="blue"
              >
                Operational
              </Button>
              <Button
                size="sm"
                variant={view === 'strategic' ? 'solid' : 'outline'}
                onClick={() => setView('strategic')}
                colorPalette="purple"
              >
                Strategic
              </Button>
            </Stack>
          </Stack>
        </Section>

        {/* Dynamic View Content */}
        {view === 'financial' && renderFinancialView()}
        {view === 'operational' && renderOperationalView()}
        {view === 'strategic' && renderStrategicView()}

        {/* Executive Alerts */}
        <Section title="Executive Alerts & Actions" variant="elevated">
          <Stack gap="md">
            {executiveData.executiveAlerts.map((alert) => (
              <Stack
                key={alert.id}
                padding="md"
                borderRadius="md"
                border="1px solid"
                borderColor={`${getAlertColor(alert.type)}.200`}
                bg={`${getAlertColor(alert.type)}.50`}
              >
                <Stack direction="row" align="center" justify="between">
                  <Stack direction="row" align="center" gap="md">
                    <Stack>
                      <Badge
                        colorPalette={getAlertColor(alert.type)}
                        variant="subtle"
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                      <Badge
                        colorPalette={alert.priority === 'high' ? 'red' : alert.priority === 'medium' ? 'orange' : 'blue'}
                        variant="outline"
                        size="sm"
                      >
                        {alert.priority} priority
                      </Badge>
                    </Stack>
                  </Stack>

                  {alert.metric && (
                    <Badge colorPalette={getAlertColor(alert.type)} variant="solid" size="lg">
                      {alert.metric}%
                    </Badge>
                  )}
                </Stack>

                <h4 style={{ fontWeight: 'bold', fontSize: '16px', margin: '8px 0' }}>
                  {alert.title}
                </h4>

                <p style={{ fontSize: '14px', margin: '4px 0' }}>
                  {alert.description}
                </p>

                <Stack direction="row" align="center" justify="between" marginTop="md">
                  <Stack direction="row" align="center" gap="sm">
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      Action: {alert.action}
                    </span>
                  </Stack>

                  {alert.deadline && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Deadline: {alert.deadline}
                    </span>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Quick Executive Actions */}
        <Section title="Quick Executive Actions" variant="flat">
          <Stack direction="row" gap="md" wrap="wrap">
            <Button colorPalette="purple" size="sm">
              Generate Board Report
            </Button>
            <Button variant="outline" size="sm">
              Schedule Strategy Review
            </Button>
            <Button variant="outline" size="sm">
              Plan Quarterly OKRs
            </Button>
            <Button variant="outline" size="sm">
              Ask Natural Language Question
            </Button>
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
};

export default ExecutiveDashboard;