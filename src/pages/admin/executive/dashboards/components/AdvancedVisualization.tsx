import React from 'react';
import {
  ContentLayout, Section, Stack, Button, Badge, Typography,
  CardGrid, MetricCard, Icon
} from '@/shared/ui';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

const AdvancedVisualization: React.FC = () => {
  const [selectedChart, setSelectedChart] = React.useState<string>('financial-overview');
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    ModuleEventUtils.system.moduleLoaded('advanced-visualization');
  }, []);

  const chartConfigs = [
    {
      id: 'financial-overview',
      title: 'Panorama Financiero',
      type: 'multi-line',
      icon: 'CurrencyDollarIcon',
      description: 'Ingresos, gastos y utilidad neta en el tiempo'
    },
    {
      id: 'customer-segments',
      title: 'Segmentación de Clientes',
      type: 'sunburst',
      icon: 'UserGroupIcon',
      description: 'Distribución de clientes por valor y comportamiento'
    },
    {
      id: 'operational-efficiency',
      title: 'Eficiencia Operacional',
      type: 'radar',
      icon: 'CogIcon',
      description: 'KPIs operacionales en múltiples dimensiones'
    },
    {
      id: 'market-analysis',
      title: 'Análisis de Mercado',
      type: 'heatmap',
      icon: 'GlobeAltIcon',
      description: 'Performance por región y segmento'
    },
    {
      id: 'predictive-trends',
      title: 'Tendencias Predictivas',
      type: 'forecast',
      icon: 'TrendingUpIcon',
      description: 'Proyecciones basadas en IA y machine learning'
    },
    {
      id: 'portfolio-performance',
      title: 'Performance de Portfolio',
      type: 'treemap',
      icon: 'ChartBarIcon',
      description: 'Rendimiento de productos y servicios'
    }
  ];

  const mockChartData = {
    'financial-overview': {
      data: [
        { period: 'Ene', ingresos: 2100, gastos: 1600, utilidad: 500 },
        { period: 'Feb', ingresos: 2300, gastos: 1700, utilidad: 600 },
        { period: 'Mar', ingresos: 2800, gastos: 1900, utilidad: 900 },
        { period: 'Abr', ingresos: 2650, gastos: 1850, utilidad: 800 },
        { period: 'May', ingresos: 3100, gastos: 2100, utilidad: 1000 },
        { period: 'Jun', ingresos: 3400, gastos: 2200, utilidad: 1200 }
      ],
      insights: [
        'Crecimiento constante en ingresos (+62% vs período anterior)',
        'Margen de utilidad mejoró del 24% al 35%',
        'Oportunidad: Optimizar gastos operativos en 8%'
      ]
    },
    'customer-segments': {
      segments: [
        { name: 'VIP', value: 15, growth: '+12%', color: '#8B5CF6' },
        { name: 'Premium', value: 28, growth: '+8%', color: '#06B6D4' },
        { name: 'Standard', value: 42, growth: '+3%', color: '#10B981' },
        { name: 'Nuevos', value: 15, growth: '+25%', color: '#F59E0B' }
      ],
      insights: [
        'Segmento VIP genera 45% de los ingresos totales',
        'Nuevos clientes creciendo 25% mensual',
        'Oportunidad: Migrar 30% de Standard a Premium'
      ]
    },
    'operational-efficiency': {
      metrics: [
        { area: 'Productividad', value: 87, target: 90 },
        { area: 'Calidad', value: 94, target: 95 },
        { area: 'Tiempo Ciclo', value: 78, target: 85 },
        { area: 'Satisfacción', value: 91, target: 90 },
        { area: 'Costo', value: 83, target: 80 },
        { area: 'Innovación', value: 76, target: 85 }
      ],
      insights: [
        'Satisfacción del cliente supera objetivo en 1 punto',
        'Tiempo de ciclo requiere optimización (7 puntos bajo target)',
        'Oportunidad: Incrementar innovación en 9 puntos'
      ]
    }
  };

  const exportChart = async (format: 'png' | 'pdf' | 'excel') => {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);

      ModuleEventUtils.executive.chartExported({
        chartId: selectedChart,
        format,
        timestamp: new Date(),
        fileSize: Math.floor(Math.random() * 2000) + 500
      });

      alert(`Gráfico exportado como ${format.toUpperCase()}`);
    }, 2000);
  };

  const renderChart = () => {
    const config = chartConfigs.find(c => c.id === selectedChart);
    const data = mockChartData[selectedChart as keyof typeof mockChartData];

    if (!config || !data) return null;

    switch (config.type) {
      case 'multi-line':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 flex items-center justify-center border">
              <div className="text-center">
                <Icon name="ChartBarIcon" className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <Typography variant="subtitle" color="blue.600">
                  Gráfico Multi-línea: {config.title}
                </Typography>
                <Typography fontSize="sm" color="gray.600" className="mt-2">
                  Simulación de datos financieros con tendencias
                </Typography>
              </div>
            </div>

            <CardGrid columns={{ base: 1, md: 3 }} gap="sm">
              {(data as any).data.slice(-3).map((item: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <Typography fontSize="sm" fontWeight="medium">{item.period}</Typography>
                  <Typography fontSize="xs" color="green.600">
                    Ingresos: ${item.ingresos.toLocaleString()}
                  </Typography>
                  <Typography fontSize="xs" color="red.600">
                    Gastos: ${item.gastos.toLocaleString()}
                  </Typography>
                  <Typography fontSize="xs" color="blue.600">
                    Utilidad: ${item.utilidad.toLocaleString()}
                  </Typography>
                </div>
              ))}
            </CardGrid>
          </div>
        );

      case 'sunburst':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 flex items-center justify-center border">
              <div className="text-center">
                <Icon name="UserGroupIcon" className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <Typography variant="subtitle" color="purple.600">
                  Segmentación Sunburst: {config.title}
                </Typography>
                <Typography fontSize="sm" color="gray.600" className="mt-2">
                  Visualización jerárquica de segmentos de clientes
                </Typography>
              </div>
            </div>

            <CardGrid columns={{ base: 2, md: 4 }} gap="sm">
              {(data as any).segments.map((segment: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <Typography fontSize="sm" fontWeight="medium">{segment.name}</Typography>
                  </div>
                  <Typography fontSize="lg" fontWeight="bold">{segment.value}%</Typography>
                  <Typography fontSize="xs" color="green.600">{segment.growth}</Typography>
                </div>
              ))}
            </CardGrid>
          </div>
        );

      case 'radar':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 flex items-center justify-center border">
              <div className="text-center">
                <Icon name="CogIcon" className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <Typography variant="subtitle" color="green.600">
                  Gráfico Radar: {config.title}
                </Typography>
                <Typography fontSize="sm" color="gray.600" className="mt-2">
                  Análisis multidimensional de KPIs operacionales
                </Typography>
              </div>
            </div>

            <CardGrid columns={{ base: 2, md: 3 }} gap="sm">
              {(data as any).metrics.map((metric: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <Typography fontSize="sm" fontWeight="medium">{metric.area}</Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <Typography fontSize="lg" fontWeight="bold">{metric.value}%</Typography>
                    <Typography fontSize="xs" color="gray.500">
                      (Target: {metric.target}%)
                    </Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(metric.value, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardGrid>
          </div>
        );

      default:
        return (
          <div className="h-64 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 flex items-center justify-center border">
            <div className="text-center">
              <Icon name={config.icon} className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <Typography variant="subtitle" color="gray.600">
                {config.title}
              </Typography>
              <Typography fontSize="sm" color="gray.500" className="mt-2">
                {config.description}
              </Typography>
            </div>
          </div>
        );
    }
  };

  const currentData = mockChartData[selectedChart as keyof typeof mockChartData];
  const insights = currentData?.insights || [];

  return (
    <ContentLayout spacing="normal">
      <Section variant="elevated" title="Visualizaciones Avanzadas">
        <Stack gap="lg">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={timeRange === range ? 'solid' : 'outline'}
                  onClick={() => setTimeRange(range as any)}
                >
                  {range}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportChart('png')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Icon name="ArrowPathIcon" className="animate-spin" />
                ) : (
                  <Icon name="PhotoIcon" />
                )}
                PNG
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportChart('pdf')}
                disabled={isExporting}
              >
                <Icon name="DocumentIcon" />
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportChart('excel')}
                disabled={isExporting}
              >
                <Icon name="TableCellsIcon" />
                Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div>
              <Typography variant="subtitle" className="mb-4">Tipos de Gráfico</Typography>
              <Stack gap="sm">
                {chartConfigs.map((chart) => (
                  <Button
                    key={chart.id}
                    variant={selectedChart === chart.id ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedChart(chart.id)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <Icon name={chart.icon} />
                    <div>
                      <div className="font-medium text-sm">{chart.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{chart.description}</div>
                    </div>
                  </Button>
                ))}
              </Stack>
            </div>

            <div className="lg:col-span-3">
              <div className="space-y-6">
                {renderChart()}

                {insights.length > 0 && (
                  <Section variant="flat" title="Insights Automáticos">
                    <Stack gap="sm">
                      {insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Icon name="LightBulbIcon" className="text-blue-500 mt-0.5" />
                          <Typography fontSize="sm">{insight}</Typography>
                        </div>
                      ))}
                    </Stack>
                  </Section>
                )}
              </div>
            </div>
          </div>

          <Section variant="flat" title="Biblioteca de Visualizaciones">
            <CardGrid columns={{ base: 1, md: 3 }} gap="md">
              <MetricCard
                title="Gráficos Creados"
                value="24"
                subtitle="este mes"
                icon="ChartBarIcon"
                trend="up"
                change="+6"
              />
              <MetricCard
                title="Dashboards Activos"
                value="8"
                subtitle="en uso"
                icon="PresentationChartLineIcon"
                trend="up"
                change="+2"
              />
              <MetricCard
                title="Exportaciones"
                value="156"
                subtitle="último período"
                icon="ArrowDownTrayIcon"
                trend="up"
                change="+23%"
              />
            </CardGrid>

            <div className="mt-6">
              <Typography variant="subtitle" className="mb-4">Templates Disponibles</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Executive Summary', type: 'Multi-KPI', icon: 'PresentationChartLineIcon' },
                  { name: 'Financial Analysis', type: 'Time Series', icon: 'CurrencyDollarIcon' },
                  { name: 'Customer Journey', type: 'Sankey', icon: 'UserGroupIcon' },
                  { name: 'Market Comparison', type: 'Bubble Chart', icon: 'GlobeAltIcon' },
                  { name: 'Performance Matrix', type: 'Scatter Plot', icon: 'ChartBarIcon' },
                  { name: 'Risk Assessment', type: 'Heat Map', icon: 'ExclamationTriangleIcon' },
                  { name: 'Trend Forecast', type: 'Predictive', icon: 'TrendingUpIcon' },
                  { name: 'Portfolio View', type: 'Tree Map', icon: 'Squares2X2Icon' }
                ].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 text-left justify-start"
                  >
                    <Icon name={template.icon} />
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.type}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </Section>
        </Stack>
      </Section>
    </ContentLayout>
  );
};

export default AdvancedVisualization;