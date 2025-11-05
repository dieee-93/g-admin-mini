import React from 'react';
import {
  ContentLayout, FormSection, Stack, Button, Badge
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

import { logger } from '@/lib/logging';
// Report Configuration Schema
const ReportConfigSchema = z.object({
  // Basic Configuration
  name: z.string().min(1, 'Nombre del reporte requerido'),
  description: z.string().optional(),
  type: z.enum(['financial', 'operational', 'customer', 'inventory', 'executive']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on-demand']),

  // Data Sources
  modules: z.array(z.enum(['sales', 'customers', 'materials', 'staff', 'fiscal', 'billing', 'memberships', 'rentals', 'assets'])),
  dateRange: z.object({
    type: z.enum(['last-7-days', 'last-30-days', 'last-quarter', 'last-year', 'custom']),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }),

  // Filters and Segments
  filters: z.object({
    customerSegments: z.array(z.string()).optional(),
    productCategories: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional()
  }).optional(),

  // Visualization
  chartTypes: z.array(z.enum(['line', 'bar', 'pie', 'area', 'scatter', 'heatmap', 'table'])),
  breakdowns: z.array(z.enum(['daily', 'weekly', 'monthly', 'category', 'segment', 'department'])).optional(),

  // Distribution
  recipients: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'manager', 'analyst', 'stakeholder'])
  })).optional(),
  exportFormats: z.array(z.enum(['pdf', 'excel', 'csv', 'powerpoint'])),

  // Advanced Options
  kpis: z.array(z.enum([
    'revenue', 'profit', 'margin', 'growth-rate', 'customer-lifetime-value',
    'customer-acquisition-cost', 'churn-rate', 'inventory-turnover',
    'employee-productivity', 'asset-utilization', 'roi'
  ])).optional(),
  benchmarks: z.object({
    internal: z.boolean().optional(),
    industry: z.boolean().optional(),
    targets: z.array(z.object({
      metric: z.string(),
      target: z.number(),
      period: z.string()
    })).optional()
  }).optional()
});

type ReportConfig = z.infer<typeof ReportConfigSchema>;

const ReportingFormEnhanced: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ReportConfig>({
    resolver: zodResolver(ReportConfigSchema),
    defaultValues: {
      type: 'executive',
      frequency: 'monthly',
      modules: ['sales', 'customers'],
      dateRange: { type: 'last-30-days' },
      chartTypes: ['line', 'bar'],
      exportFormats: ['pdf', 'excel']
    }
  });

  const [reportPreview, setReportPreview] = React.useState<any>(null);
  const [generationProgress, setGenerationProgress] = React.useState(0);

  const watchedValues = watch();

  // Real-time report preview generation
  React.useEffect(() => {
    if (watchedValues.modules && watchedValues.type) {
      generateReportPreview();
    }
  }, [watchedValues.modules, watchedValues.type, watchedValues.dateRange]);

  const generateReportPreview = async () => {
    const preview = {
      estimatedDataPoints: calculateDataPoints(),
      estimatedGenerationTime: calculateGenerationTime(),
      availableMetrics: getAvailableMetrics(),
      reportSize: estimateReportSize(),
      complexity: calculateComplexity()
    };
    setReportPreview(preview);
  };

  const calculateDataPoints = (): number => {
    const moduleMultiplier = {
      sales: 1000,
      customers: 500,
      materials: 300,
      staff: 100,
      fiscal: 200,
      billing: 400,
      memberships: 350,
      rentals: 250,
      assets: 150
    };

    return watchedValues.modules?.reduce((total, module) =>
      total + (moduleMultiplier[module] || 0), 0
    ) || 0;
  };

  const calculateGenerationTime = (): string => {
    const dataPoints = calculateDataPoints();
    const complexity = calculateComplexity();
    const baseTime = dataPoints / 1000; // seconds per 1000 data points
    const complexityMultiplier = complexity === 'high' ? 3 : complexity === 'medium' ? 2 : 1;
    const totalTime = baseTime * complexityMultiplier;

    if (totalTime < 60) return `${Math.round(totalTime)}s`;
    return `${Math.round(totalTime / 60)}m ${Math.round(totalTime % 60)}s`;
  };

  const getAvailableMetrics = (): string[] => {
    const moduleMetrics = {
      sales: ['Revenue', 'Transactions', 'Average Order Value', 'Peak Hours'],
      customers: ['Customer Count', 'RFM Segments', 'Retention Rate', 'LTV'],
      materials: ['Inventory Value', 'Stock Turnover', 'Supplier Performance'],
      staff: ['Productivity', 'Performance Scores', 'Utilization Rate'],
      fiscal: ['Tax Compliance', 'P&L', 'Cash Flow', 'Margins'],
      billing: ['MRR', 'Churn Rate', 'LTV', 'Payment Success Rate'],
      memberships: ['Member Retention', 'Engagement Score', 'Facility Usage'],
      rentals: ['Asset Utilization', 'Revenue per Asset', 'Damage Rate'],
      assets: ['ROI', 'Depreciation', 'Maintenance Costs', 'Lifecycle Status']
    };

    return watchedValues.modules?.flatMap(module => moduleMetrics[module] || []) || [];
  };

  const estimateReportSize = (): string => {
    const dataPoints = calculateDataPoints();
    const charts = watchedValues.chartTypes?.length || 0;
    const baseSize = (dataPoints / 100) + (charts * 50); // KB

    if (baseSize < 1024) return `${Math.round(baseSize)}KB`;
    return `${Math.round(baseSize / 1024)}MB`;
  };

  const calculateComplexity = (): 'low' | 'medium' | 'high' => {
    const factors = [
      (watchedValues.modules?.length || 0) > 5,
      (watchedValues.chartTypes?.length || 0) > 4,
      watchedValues.filters && Object.keys(watchedValues.filters).length > 2,
      (watchedValues.kpis?.length || 0) > 5,
      watchedValues.benchmarks?.industry
    ];

    const complexityScore = factors.filter(Boolean).length;
    if (complexityScore >= 4) return 'high';
    if (complexityScore >= 2) return 'medium';
    return 'low';
  };

  const onSubmit = async (data: ReportConfig) => {
    try {
      setGenerationProgress(10);

      // Simulate report generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const next = prev + Math.random() * 20;
          return next > 90 ? 90 : next;
        });
      }, 500);

      // Emit report creation event
      ModuleEventUtils.reporting.created(
        `report-${Date.now()}`,
        data.name,
        data.type,
        data.modules,
        calculateDataPoints()
      );

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Emit completion event
      ModuleEventUtils.reporting.generated(
        `report-${Date.now()}`,
        'success',
        calculateGenerationTime(),
        estimateReportSize()
      );

    } catch (error) {
      logger.error('App', 'Error generating report:', error);
      ModuleEventUtils.reporting.error(
        `report-${Date.now()}`,
        error instanceof Error ? error.message : 'Unknown error',
        'generation_failed'
      );
    }
  };

  return (
    <ContentLayout spacing="normal">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          {/* Basic Configuration */}
          <FormSection
            title="Configuración Básica"
            description="Información fundamental del reporte ejecutivo"
          >
            <Stack gap="md">
              <Stack direction="row" gap="md">
                <Stack flex="1">
                  <label>Nombre del Reporte</label>
                  <input
                    {...register('name')}
                    placeholder="Ej: Dashboard Ejecutivo Mensual"
                  />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </Stack>
                <Stack flex="1">
                  <label>Tipo de Reporte</label>
                  <select {...register('type')}>
                    <option value="executive">Ejecutivo</option>
                    <option value="financial">Financiero</option>
                    <option value="operational">Operacional</option>
                    <option value="customer">Customer Analytics</option>
                    <option value="inventory">Inventario</option>
                  </select>
                </Stack>
              </Stack>

              <Stack direction="row" gap="md">
                <Stack flex="1">
                  <label>Frecuencia</label>
                  <select {...register('frequency')}>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="yearly">Anual</option>
                    <option value="on-demand">Bajo Demanda</option>
                  </select>
                </Stack>
                <Stack flex="2">
                  <label>Descripción</label>
                  <textarea
                    {...register('description')}
                    placeholder="Descripción opcional del reporte..."
                    rows={2}
                  />
                </Stack>
              </Stack>
            </Stack>
          </FormSection>

          {/* Data Sources */}
          <FormSection
            title="Fuentes de Datos"
            description="Selecciona los módulos y rangos de fecha para el análisis"
          >
            <Stack gap="md">
              <Stack>
                <label>Módulos a Incluir</label>
                <Stack direction="row" gap="sm" wrap="wrap">
                  {['sales', 'customers', 'materials', 'staff', 'fiscal', 'billing', 'memberships', 'rentals', 'assets'].map(module => (
                    <label key={module} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        value={module}
                        {...register('modules')}
                      />
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </label>
                  ))}
                </Stack>
              </Stack>

              <Stack direction="row" gap="md">
                <Stack flex="1">
                  <label>Rango de Fecha</label>
                  <select {...register('dateRange.type')}>
                    <option value="last-7-days">Últimos 7 días</option>
                    <option value="last-30-days">Últimos 30 días</option>
                    <option value="last-quarter">Último trimestre</option>
                    <option value="last-year">Último año</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </Stack>

                {watchedValues.dateRange?.type === 'custom' && (
                  <>
                    <Stack flex="1">
                      <label>Fecha Inicio</label>
                      <input type="date" {...register('dateRange.startDate')} />
                    </Stack>
                    <Stack flex="1">
                      <label>Fecha Fin</label>
                      <input type="date" {...register('dateRange.endDate')} />
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>
          </FormSection>

          {/* Visualization */}
          <FormSection
            title="Visualización y KPIs"
            description="Configura charts, métricas y indicadores clave"
          >
            <Stack gap="md">
              <Stack>
                <label>Tipos de Gráficos</label>
                <Stack direction="row" gap="sm" wrap="wrap">
                  {['line', 'bar', 'pie', 'area', 'scatter', 'heatmap', 'table'].map(chart => (
                    <label key={chart} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        value={chart}
                        {...register('chartTypes')}
                      />
                      {chart.charAt(0).toUpperCase() + chart.slice(1)}
                    </label>
                  ))}
                </Stack>
              </Stack>

              <Stack>
                <label>KPIs Principales</label>
                <Stack direction="row" gap="sm" wrap="wrap">
                  {['revenue', 'profit', 'margin', 'growth-rate', 'customer-lifetime-value', 'churn-rate', 'inventory-turnover', 'asset-utilization', 'roi'].map(kpi => (
                    <label key={kpi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        value={kpi}
                        {...register('kpis')}
                      />
                      {kpi.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </FormSection>

          {/* Export and Distribution */}
          <FormSection
            title="Distribución y Exportación"
            description="Configura formatos de exportación y destinatarios"
          >
            <Stack gap="md">
              <Stack>
                <label>Formatos de Exportación</label>
                <Stack direction="row" gap="sm">
                  {['pdf', 'excel', 'csv', 'powerpoint'].map(format => (
                    <label key={format} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        value={format}
                        {...register('exportFormats')}
                      />
                      {format.toUpperCase()}
                    </label>
                  ))}
                </Stack>
              </Stack>

              <Stack>
                <label>Benchmarks</label>
                <Stack direction="row" gap="md">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" {...register('benchmarks.internal')} />
                    Comparación Interna (periodos anteriores)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" {...register('benchmarks.industry')} />
                    Benchmarks de Industria
                  </label>
                </Stack>
              </Stack>
            </Stack>
          </FormSection>

          {/* Real-time Preview */}
          {reportPreview && (
            <FormSection
              title="Preview del Reporte"
              description="Vista previa de la configuración y métricas estimadas"
            >
              <Stack gap="md">
                <Stack direction="row" gap="md" wrap="wrap">
                  <Badge colorPalette="blue" variant="subtle">
                    {reportPreview.estimatedDataPoints} puntos de datos
                  </Badge>
                  <Badge colorPalette="green" variant="subtle">
                    Tiempo: {reportPreview.estimatedGenerationTime}
                  </Badge>
                  <Badge colorPalette="purple" variant="subtle">
                    Tamaño: {reportPreview.reportSize}
                  </Badge>
                  <Badge
                    colorPalette={reportPreview.complexity === 'high' ? 'red' : reportPreview.complexity === 'medium' ? 'orange' : 'green'}
                    variant="subtle"
                  >
                    Complejidad: {reportPreview.complexity}
                  </Badge>
                </Stack>

                <Stack>
                  <label>Métricas Disponibles ({reportPreview.availableMetrics.length})</label>
                  <Stack direction="row" gap="sm" wrap="wrap">
                    {reportPreview.availableMetrics.slice(0, 8).map((metric: string, index: number) => (
                      <Badge key={index} colorPalette="gray" variant="outline" size="sm">
                        {metric}
                      </Badge>
                    ))}
                    {reportPreview.availableMetrics.length > 8 && (
                      <Badge colorPalette="gray" variant="outline" size="sm">
                        +{reportPreview.availableMetrics.length - 8} más
                      </Badge>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </FormSection>
          )}

          {/* Generation Progress */}
          {generationProgress > 0 && generationProgress < 100 && (
            <FormSection title="Generando Reporte" description="Procesando datos y creando visualizaciones">
              <Stack gap="md">
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${generationProgress}%`,
                      height: '100%',
                      backgroundColor: '#3182ce',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <p>Progreso: {Math.round(generationProgress)}%</p>
              </Stack>
            </FormSection>
          )}

          {/* Submit Button */}
          <Stack direction="row" gap="md" justify="end">
            <Button variant="outline" type="button">
              <Icon as={EyeIcon} />
              Vista Previa
            </Button>
            <Button
              type="submit"
              colorPalette="blue"
              loading={isSubmitting || (generationProgress > 0 && generationProgress < 100)}
            >
              <Icon as={DocumentArrowDownIcon} />
              {generationProgress === 100 ? 'Reporte Generado' : 'Generar Reporte'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </ContentLayout>
  );
};

export default ReportingFormEnhanced;
