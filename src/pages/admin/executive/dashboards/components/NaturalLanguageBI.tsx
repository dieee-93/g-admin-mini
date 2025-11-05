import React from 'react';
import {
  ContentLayout, Section, Stack, Button, Badge, Typography,
  CardGrid, MetricCard, Icon
} from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  ArchiveBoxIcon,
  CalculatorIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const nlpQuerySchema = z.object({
  query: z.string().min(5, 'La consulta debe tener al menos 5 caracteres'),
  context: z.enum(['financial', 'operational', 'customers', 'inventory', 'sales', 'general']),
  timeRange: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']),
  format: z.enum(['text', 'chart', 'table', 'dashboard'])
});

type NLPQueryData = z.infer<typeof nlpQuerySchema>;

const NaturalLanguageBI: React.FC = () => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [queryHistory, setQueryHistory] = React.useState<Array<{
    id: string;
    query: string;
    response: string;
    timestamp: Date;
    context: string;
  }>>([]);
  const [currentResponse, setCurrentResponse] = React.useState<{
    type: 'text' | 'chart' | 'table' | 'error';
    content: any;
  } | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<NLPQueryData>({
    resolver: zodResolver(nlpQuerySchema),
    defaultValues: {
      context: 'general',
      timeRange: 'month',
      format: 'text'
    }
  });

  React.useEffect(() => {
    ModuleEventUtils.system.moduleLoaded('natural-language-bi');
  }, []);

  const suggestedQueries = [
    {
      query: "¿Cuáles son nuestros productos más rentables este mes?",
      context: "financial" as const,
      icon: CurrencyDollarIcon
    },
    {
      query: "Muéstrame las tendencias de ventas por categoría",
      context: "sales" as const,
      icon: ChartBarIcon
    },
    {
      query: "¿Qué clientes tienen mayor valor de vida?",
      context: "customers" as const,
      icon: UserGroupIcon
    },
    {
      query: "Analiza el rendimiento operacional del último trimestre",
      context: "operational" as const,
      icon: CogIcon
    },
    {
      query: "¿Cuáles son nuestros niveles de stock críticos?",
      context: "inventory" as const,
      icon: ArchiveBoxIcon
    },
    {
      query: "Compara ingresos vs gastos en los últimos 6 meses",
      context: "financial" as const,
      icon: CalculatorIcon
    }
  ];

  const processNLPQuery = async (data: NLPQueryData) => {
    setIsProcessing(true);

    try {
      const mockResponses = {
        financial: {
          text: `Análisis financiero para "${data.query}": Ingresos actuales $2.4M (+15% vs período anterior). Margen bruto 34%. ROI promedio 18.5%. Gastos operativos controlados en 67% del target.`,
          metrics: [
            { label: 'Ingresos', value: '$2.4M', change: '+15%', trend: 'up' as const },
            { label: 'Margen Bruto', value: '34%', change: '+2.1%', trend: 'up' as const },
            { label: 'ROI', value: '18.5%', change: '+1.8%', trend: 'up' as const }
          ]
        },
        operational: {
          text: `Análisis operacional: Eficiencia promedio 87%. Tiempo de ciclo reducido 12%. Productividad del equipo +8%. 3 cuellos de botella identificados en procesos.`,
          metrics: [
            { label: 'Eficiencia', value: '87%', change: '+3%', trend: 'up' as const },
            { label: 'Tiempo Ciclo', value: '4.2h', change: '-12%', trend: 'up' as const },
            { label: 'Productividad', value: '156%', change: '+8%', trend: 'up' as const }
          ]
        },
        customers: {
          text: `Análisis de clientes: CLV promedio $1,850. Tasa de retención 78%. 234 clientes nuevos este período. Satisfacción 4.6/5.`,
          metrics: [
            { label: 'CLV Promedio', value: '$1,850', change: '+12%', trend: 'up' as const },
            { label: 'Retención', value: '78%', change: '+5%', trend: 'up' as const },
            { label: 'Satisfacción', value: '4.6/5', change: '+0.3', trend: 'up' as const }
          ]
        },
        inventory: {
          text: `Estado de inventario: 89% de productos en stock óptimo. 23 items en nivel crítico. Rotación promedio 8.4x. Valor total $890K.`,
          metrics: [
            { label: 'Stock Óptimo', value: '89%', change: '+4%', trend: 'up' as const },
            { label: 'Rotación', value: '8.4x', change: '+1.2x', trend: 'up' as const },
            { label: 'Valor Total', value: '$890K', change: '+6%', trend: 'up' as const }
          ]
        },
        sales: {
          text: `Rendimiento de ventas: Ventas totales $1.8M. Conversión 12.3%. Ticket promedio $145. 15% crecimiento vs período anterior.`,
          metrics: [
            { label: 'Ventas Totales', value: '$1.8M', change: '+15%', trend: 'up' as const },
            { label: 'Conversión', value: '12.3%', change: '+1.8%', trend: 'up' as const },
            { label: 'Ticket Promedio', value: '$145', change: '+8%', trend: 'up' as const }
          ]
        },
        general: {
          text: `Resumen ejecutivo: Performance general sólida. KPIs principales en verde. Oportunidades identificadas en 3 áreas. Proyección positiva para próximo período.`,
          metrics: [
            { label: 'KPIs en Verde', value: '85%', change: '+7%', trend: 'up' as const },
            { label: 'Eficiencia Global', value: '91%', change: '+4%', trend: 'up' as const },
            { label: 'Score General', value: '8.7/10', change: '+0.5', trend: 'up' as const }
          ]
        }
      };

      const response = mockResponses[data.context];

      const newQuery = {
        id: Math.random().toString(36).substr(2, 9),
        query: data.query,
        response: response.text,
        timestamp: new Date(),
        context: data.context
      };

      setQueryHistory(prev => [newQuery, ...prev].slice(0, 10));
      setCurrentResponse({
        type: data.format === 'text' ? 'text' : 'chart',
        content: {
          text: response.text,
          metrics: response.metrics
        }
      });

      ModuleEventUtils.executive.nlpQueryProcessed({
        query: data.query,
        context: data.context,
        responseType: data.format,
        processingTime: 1200,
        confidence: 0.87
      });

    } catch (error) {
      setCurrentResponse({
        type: 'error',
        content: 'Error procesando la consulta. Intenta con una pregunta más específica.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const useSuggestedQuery = (suggested: typeof suggestedQueries[0]) => {
    reset({
      query: suggested.query,
      context: suggested.context,
      timeRange: 'month',
      format: 'text'
    });
  };

  return (
    <ContentLayout spacing="normal">
      <Section variant="elevated" title="Natural Language Business Intelligence">
        <Stack gap="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(processNLPQuery)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Haz tu pregunta de negocio
                  </label>
                  <textarea
                    {...register('query')}
                    placeholder="Ej: ¿Cuáles son nuestros productos más rentables este mes?"
                    className="w-full p-3 border rounded-lg h-24 resize-none"
                    disabled={isProcessing}
                  />
                  {errors.query && (
                    <p className="text-red-500 text-sm mt-1">{errors.query.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contexto</label>
                    <select {...register('context')} className="w-full p-2 border rounded">
                      <option value="general">General</option>
                      <option value="financial">Financiero</option>
                      <option value="operational">Operacional</option>
                      <option value="customers">Clientes</option>
                      <option value="inventory">Inventario</option>
                      <option value="sales">Ventas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Período</label>
                    <select {...register('timeRange')} className="w-full p-2 border rounded">
                      <option value="today">Hoy</option>
                      <option value="week">Esta Semana</option>
                      <option value="month">Este Mes</option>
                      <option value="quarter">Trimestre</option>
                      <option value="year">Año</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Formato</label>
                    <select {...register('format')} className="w-full p-2 border rounded">
                      <option value="text">Texto</option>
                      <option value="chart">Gráfico</option>
                      <option value="table">Tabla</option>
                      <option value="dashboard">Dashboard</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  colorPalette="blue"
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Icon as={ArrowPathIcon} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Icon as={SparklesIcon} />
                      Analizar con IA
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div>
              <Typography variant="subtitle" className="mb-4">
                Consultas Sugeridas
              </Typography>
              <Stack gap="sm">
                {suggestedQueries.map((suggested, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useSuggestedQuery(suggested)}
                    className="text-left justify-start h-auto p-3"
                  >
                    <Icon as={suggested.icon} />
                    <span className="text-xs leading-tight">{suggested.query}</span>
                  </Button>
                ))}
              </Stack>
            </div>
          </div>

          {currentResponse && (
            <Section variant="flat" title="Respuesta del Análisis">
              {currentResponse.type === 'error' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Typography color="red.600">{currentResponse.content}</Typography>
                </div>
              ) : (
                <Stack gap="md">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Typography>{currentResponse.content.text}</Typography>
                  </div>

                  {currentResponse.content.metrics && (
                    <CardGrid columns={{ base: 1, md: 3 }} gap="md">
                      {currentResponse.content.metrics.map((metric: any, index: number) => (
                        <MetricCard
                          key={index}
                          title={metric.label}
                          value={metric.value}
                          change={metric.change}
                          trend={metric.trend}
                          icon={ChartBarIcon}
                        />
                      ))}
                    </CardGrid>
                  )}
                </Stack>
              )}
            </Section>
          )}

          {queryHistory.length > 0 && (
            <Section variant="flat" title="Historial de Consultas">
              <Stack gap="sm">
                {queryHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Typography fontSize="sm" fontWeight="medium">
                        {item.query}
                      </Typography>
                      <Badge colorPalette="gray" size="sm">
                        {item.context}
                      </Badge>
                    </div>
                    <Typography fontSize="xs" color="gray.600">
                      {item.response.substring(0, 120)}...
                    </Typography>
                    <Typography fontSize="xs" color="gray.500" className="mt-1">
                      {item.timestamp.toLocaleString()}
                    </Typography>
                  </div>
                ))}
              </Stack>
            </Section>
          )}
        </Stack>
      </Section>
    </ContentLayout>
  );
};

export default NaturalLanguageBI;