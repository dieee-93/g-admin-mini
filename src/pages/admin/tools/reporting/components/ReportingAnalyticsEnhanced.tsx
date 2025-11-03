import React from 'react';
import {
  ContentLayout, Section, Stack, Badge, Button, CardGrid, MetricCard
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon, ShieldCheckIcon,
  StarIcon, CogIcon, LightBulbIcon, UserGroupIcon, EyeIcon,
  ArrowRightIcon, PlusIcon, DocumentArrowDownIcon, CalendarIcon,
  ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon
} from '@heroicons/react/24/outline';

interface ReportingSystemData {
  reportCatalog: {
    category: string;
    reports: {
      name: string;
      type: 'financial' | 'operational' | 'customer' | 'executive';
      frequency: string;
      lastGenerated: string;
      status: 'active' | 'scheduled' | 'draft' | 'archived';
      performance: 'excellent' | 'good' | 'average' | 'needs-attention';
      dataPoints: number;
      recipients: number;
      size: string;
    }[];
  }[];

  systemMetrics: {
    totalReports: number;
    activeReports: number;
    avgGenerationTime: string;
    dataAccuracy: number;
    userSatisfaction: number;
    automationRate: number;
    storageUsed: string;
    monthlyGenerated: number;
  };

  generationAnalysis: {
    type: string;
    count: number;
    avgSize: string;
    avgTime: string;
    successRate: number;
    trend: 'up' | 'down' | 'stable';
    peakHours: string;
    resourceUsage: number;
  }[];

  reportingInsights: {
    category: string;
    insight: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
    module: string;
    efficiency: number;
  }[];
}

const ReportingAnalyticsEnhanced: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Simulated data - En producción vendría de APIs reales
  const systemData: ReportingSystemData = {
    reportCatalog: [
      {
        category: 'Executive Reports',
        reports: [
          {
            name: 'Monthly Executive Dashboard',
            type: 'executive',
            frequency: 'monthly',
            lastGenerated: '2024-03-01',
            status: 'active',
            performance: 'excellent',
            dataPoints: 1250,
            recipients: 8,
            size: '2.4MB'
          },
          {
            name: 'Quarterly Board Report',
            type: 'executive',
            frequency: 'quarterly',
            lastGenerated: '2024-01-15',
            status: 'scheduled',
            performance: 'good',
            dataPoints: 890,
            recipients: 5,
            size: '3.1MB'
          }
        ]
      },
      {
        category: 'Financial Reports',
        reports: [
          {
            name: 'P&L Analysis',
            type: 'financial',
            frequency: 'monthly',
            lastGenerated: '2024-03-05',
            status: 'active',
            performance: 'excellent',
            insights: 15,
            recipients: 12
          },
          {
            name: 'Cash Flow Forecast',
            type: 'financial',
            frequency: 'weekly',
            lastGenerated: '2024-03-08',
            status: 'active',
            performance: 'good',
            insights: 6,
            recipients: 6
          },
          {
            name: 'ROI by Department',
            type: 'financial',
            frequency: 'quarterly',
            lastGenerated: '2024-02-20',
            status: 'draft',
            performance: 'average',
            insights: 4,
            recipients: 3
          }
        ]
      },
      {
        category: 'Operational Reports',
        reports: [
          {
            name: 'Asset Utilization Report',
            type: 'operational',
            frequency: 'weekly',
            lastGenerated: '2024-03-10',
            status: 'active',
            performance: 'excellent',
            insights: 9,
            recipients: 15
          },
          {
            name: 'Staff Performance Analytics',
            type: 'operational',
            frequency: 'monthly',
            lastGenerated: '2024-03-01',
            status: 'active',
            performance: 'good',
            insights: 7,
            recipients: 8
          },
          {
            name: 'Inventory Optimization',
            type: 'operational',
            frequency: 'weekly',
            lastGenerated: '2024-03-09',
            status: 'active',
            performance: 'needs-attention',
            insights: 3,
            recipients: 4
          }
        ]
      },
      {
        category: 'Customer Analytics',
        reports: [
          {
            name: 'Customer Lifecycle Report',
            type: 'customer',
            frequency: 'monthly',
            lastGenerated: '2024-03-02',
            status: 'active',
            performance: 'excellent',
            insights: 11,
            recipients: 10
          },
          {
            name: 'Churn Risk Analysis',
            type: 'customer',
            frequency: 'weekly',
            lastGenerated: '2024-03-08',
            status: 'active',
            performance: 'good',
            insights: 5,
            recipients: 7
          }
        ]
      }
    ],

    systemMetrics: {
      totalReports: 47,
      activeReports: 34,
      avgGenerationTime: '2m 45s',
      dataAccuracy: 96.8,
      userSatisfaction: 4.7,
      automationRate: 89.2,
      storageUsed: '127GB',
      monthlyGenerated: 342
    },

    generationAnalysis: [
      {
        type: 'Executive',
        count: 8,
        avgSize: '2.4MB',
        avgTime: '4m 15s',
        successRate: 98.5,
        trend: 'up',
        peakHours: '8-10 AM',
        resourceUsage: 67
      },
      {
        type: 'Financial',
        count: 15,
        avgSize: '1.8MB',
        avgTime: '2m 30s',
        successRate: 97.2,
        trend: 'stable'
      },
      {
        type: 'Operational',
        count: 18,
        avgSize: '3.1MB',
        avgTime: '1m 45s',
        successRate: 95.8,
        trend: 'up'
      },
      {
        type: 'Customer',
        count: 6,
        avgSize: '1.2MB',
        avgTime: '1m 20s',
        successRate: 99.1,
        trend: 'up'
      }
    ],

    reportingInsights: [
      {
        category: 'Performance',
        insight: 'Executive reports show 23% improvement in insights generation vs last quarter',
        impact: 'high',
        action: 'Continue enhancing AI-powered insights engine',
        module: 'reporting'
      },
      {
        category: 'Efficiency',
        insight: 'Automation rate reached 89.2%, reducing manual work by 47 hours/week',
        impact: 'high',
        action: 'Expand automation to remaining 10.8% of reports',
        module: 'all'
      },
      {
        category: 'Data Quality',
        insight: 'Data accuracy at 96.8% - inventory module needs attention (92.1%)',
        impact: 'medium',
        action: 'Implement enhanced validation for inventory data sources',
        module: 'materials'
      },
      {
        category: 'User Adoption',
        insight: 'Customer analytics reports have highest engagement (4.9/5 satisfaction)',
        impact: 'medium',
        action: 'Apply customer analytics patterns to other report types',
        module: 'customers'
      },
      {
        category: 'Resource Optimization',
        insight: 'Peak generation hours: 8-10 AM consuming 67% of server resources',
        impact: 'medium',
        action: 'Implement intelligent scheduling to distribute load',
        module: 'system'
      }
    ]
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'average': return 'yellow';
      case 'needs-attention': return 'red';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'scheduled': return 'blue';
      case 'draft': return 'orange';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowTrendingUpIcon;
      case 'down': return ArrowTrendingDownIcon;
      case 'stable': return MinusIcon;
      default: return MinusIcon;
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

  const filteredCategories = systemData.reportCatalog.filter(category =>
    selectedCategory === 'all' || category.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">
        {/* Controls */}
        <Section title="Controles de Vista" variant="flat">
          <Stack direction="row" gap="md" align="center">
            <Stack direction="row" gap="sm">
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
              <Button
                size="sm"
                variant={timeRange === '1y' ? 'solid' : 'outline'}
                onClick={() => setTimeRange('1y')}
              >
                1 año
              </Button>
            </Stack>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            >
              <option value="all">Todas las Categorías</option>
              <option value="executive">Executive</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="customer">Customer</option>
            </select>
          </Stack>
        </Section>

        {/* Performance Metrics */}
        <Section title="Métricas de Performance del Sistema" variant="elevated">
          <CardGrid columns={{ base: 2, md: 3, lg: 6 }} gap="md">
            <MetricCard
              title="Total Reportes"
              value={dashboardData.performanceMetrics.totalReports.toString()}
              icon={DocumentTextIcon}
              trend={{ value: 12, isPositive: true }}
              subtitle="vs período anterior"
            />
            <MetricCard
              title="Reportes Activos"
              value={dashboardData.performanceMetrics.activeReports.toString()}
              icon={CheckCircleIcon}
              colorPalette="green"
              subtitle={`${Math.round((dashboardData.performanceMetrics.activeReports / dashboardData.performanceMetrics.totalReports) * 100)}% del total`}
            />
            <MetricCard
              title="Tiempo Promedio"
              value={dashboardData.performanceMetrics.avgGenerationTime}
              icon={ClockIcon}
              colorPalette="blue"
              trend={{ value: -15, isPositive: true }}
              subtitle="mejora vs anterior"
            />
            <MetricCard
              title="Precisión de Datos"
              value={`${dashboardData.performanceMetrics.dataAccuracy}%`}
              icon={ShieldCheckIcon}
              colorPalette="purple"
              subtitle="calidad de datos"
            />
            <MetricCard
              title="Satisfacción"
              value={`${dashboardData.performanceMetrics.userSatisfaction}/5`}
              icon={StarIcon}
              colorPalette="yellow"
              subtitle="rating promedio"
            />
            <MetricCard
              title="Automatización"
              value={`${dashboardData.performanceMetrics.automationRate}%`}
              icon={CogIcon}
              colorPalette="green"
              trend={{ value: 8, isPositive: true }}
              subtitle="vs manual"
            />
          </CardGrid>
        </Section>

        {/* Report Type Analysis */}
        <Section title="Análisis por Tipo de Reporte" variant="elevated">
          <Stack gap="md">
            {dashboardData.reportTypeAnalysis.map((type, index) => (
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
                <Stack direction="row" align="center" gap="md" flex="1">
                  <Stack>
                    <Badge colorPalette="blue" variant="subtle" size="lg">
                      {type.type}
                    </Badge>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {type.count} reportes
                    </p>
                  </Stack>

                  <Stack direction="row" gap="lg">
                    <Stack align="center">
                      <p style={{ fontSize: '12px', color: '#666' }}>Tamaño Promedio</p>
                      <p style={{ fontWeight: 'bold' }}>{type.avgSize}</p>
                    </Stack>
                    <Stack align="center">
                      <p style={{ fontSize: '12px', color: '#666' }}>Tiempo Promedio</p>
                      <p style={{ fontWeight: 'bold' }}>{type.avgTime}</p>
                    </Stack>
                    <Stack align="center">
                      <p style={{ fontSize: '12px', color: '#666' }}>Tasa de Éxito</p>
                      <p style={{ fontWeight: 'bold' }}>{type.successRate}%</p>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction="row" align="center" gap="sm">
                  <Icon
                    as={getTrendIcon(type.trend)}
                    color={getTrendColor(type.trend)}
                  />
                  <Badge
                    colorPalette={getTrendColor(type.trend)}
                    variant="subtle"
                  >
                    {type.trend === 'up' ? 'Mejorando' : type.trend === 'down' ? 'Declinando' : 'Estable'}
                  </Badge>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Report Matrix */}
        <Section title="Matrix de Reportes por Categoría" variant="elevated">
          <Stack gap="lg">
            {filteredCategories.map((category, categoryIndex) => (
              <Stack key={categoryIndex} gap="md">
                <Stack direction="row" align="center" justify="between">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {category.category}
                  </h3>
                  <Badge colorPalette="gray" variant="outline">
                    {category.reports.length} reportes
                  </Badge>
                </Stack>

                <Stack gap="sm">
                  {category.reports.map((report, reportIndex) => (
                    <Stack
                      key={reportIndex}
                      direction="row"
                      align="center"
                      justify="between"
                      padding="md"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="gray.50"
                    >
                      <Stack gap="sm" flex="2">
                        <Stack direction="row" align="center" gap="md">
                          <h4 style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {report.name}
                          </h4>
                          <Badge
                            colorPalette={getStatusColor(report.status)}
                            variant="subtle"
                          >
                            {report.status}
                          </Badge>
                          <Badge
                            colorPalette={getPerformanceColor(report.performance)}
                            variant="outline"
                          >
                            {report.performance}
                          </Badge>
                        </Stack>
                        <Stack direction="row" gap="md" align="center">
                          <span style={{ fontSize: '14px', color: '#666' }}>
                            Frecuencia: {report.frequency}
                          </span>
                          <span style={{ fontSize: '14px', color: '#666' }}>
                            Última generación: {report.lastGenerated}
                          </span>
                        </Stack>
                      </Stack>

                      <Stack direction="row" gap="md" align="center">
                        <Stack align="center">
                          <Icon as={LightBulbIcon} size="sm" />
                          <span style={{ fontSize: '12px' }}>{report.insights}</span>
                        </Stack>
                        <Stack align="center">
                          <Icon as={UserGroupIcon} size="sm" />
                          <span style={{ fontSize: '12px' }}>{report.recipients}</span>
                        </Stack>
                        <Button size="sm" variant="outline">
                          <Icon as={EyeIcon} />
                          Ver
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Executive Insights */}
        <Section title="Insights Ejecutivos del Sistema" variant="elevated">
          <Stack gap="md">
            {dashboardData.executiveInsights.map((insight, index) => (
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
                    <Badge colorPalette="gray" variant="outline">
                      {insight.module}
                    </Badge>
                  </Stack>
                </Stack>

                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0' }}>
                  {insight.insight}
                </p>

                <Stack direction="row" align="center" gap="sm">
                  <Icon as={ArrowRightIcon} size="sm" />
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
              <Icon as={PlusIcon} />
              Nuevo Reporte Ejecutivo
            </Button>
            <Button variant="outline" size="sm">
              <Icon as={DocumentArrowDownIcon} />
              Exportar Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Icon as={CogIcon} />
              Configurar Alertas
            </Button>
            <Button variant="outline" size="sm">
              <Icon as={ChartBarIcon} />
              Dashboard Personalizado
            </Button>
            <Button variant="outline" size="sm">
              <Icon as={CalendarIcon} />
              Programar Reportes
            </Button>
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
};

export default ReportingAnalyticsEnhanced;
