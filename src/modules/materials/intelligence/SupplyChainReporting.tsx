// Supply Chain Reporting - Comprehensive Business Intelligence Dashboard
// Advanced analytics and reporting for supply chain operations

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Progress,
  ProgressTrack,
  ProgressRange,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner,
  Input,
  NumberInputRoot,
  NumberInputField,
  CheckboxRoot,
  CheckboxIndicator,
  CheckboxControl
} from '@chakra-ui/react';
import {
  DocumentChartBarIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CubeIcon,
  UserGroupIcon,
  ScaleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ReportData {
  id: string;
  name: string;
  type: 'inventory' | 'procurement' | 'suppliers' | 'costs' | 'performance' | 'alerts' | 'forecasting';
  category: 'operational' | 'financial' | 'strategic' | 'compliance';
  description: string;
  lastGenerated: string;
  generatedBy: string;
  
  // Data metrics
  dataPoints: number;
  timeRange: {
    start: string;
    end: string;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  
  // Report content
  summary: ReportSummary;
  sections: ReportSection[];
  charts: ChartData[];
  tables: TableData[];
  
  // Export options
  formats: ('pdf' | 'excel' | 'csv' | 'json')[];
  scheduled: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
}

export interface ReportSummary {
  title: string;
  executiveSummary: string;
  keyInsights: KeyInsight[];
  recommendations: string[];
  criticalIssues: CriticalIssue[];
  performance: {
    score: number;
    trend: 'improving' | 'declining' | 'stable';
    benchmarks: Benchmark[];
  };
}

export interface KeyInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: {
    value: number;
    unit: string;
    change: number;
    period: string;
  };
  actionable: boolean;
}

export interface CriticalIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  affectedArea: string;
  estimatedImpact: number;
  timeToResolve: number;
  recommendedActions: string[];
}

export interface Benchmark {
  metric: string;
  current: number;
  target: number;
  industry: number;
  unit: string;
  status: 'above_target' | 'at_target' | 'below_target';
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'analysis' | 'trends' | 'comparison';
  content: {
    text?: string;
    metrics?: MetricItem[];
    trends?: TrendData[];
    comparisons?: ComparisonData[];
  };
  priority: number;
}

export interface MetricItem {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface TrendData {
  period: string;
  value: number;
  forecast?: number;
  target?: number;
}

export interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: ChartDataPoint[];
  xAxis: string;
  yAxis: string;
  colors: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  date?: string;
}

export interface TableData {
  id: string;
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
  sortable: boolean;
  filterable: boolean;
  exportable: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'status';
  sortable: boolean;
  width?: string;
}

export interface TableRow {
  id: string;
  data: Record<string, any>;
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  types: string[];
  materials: string[];
  suppliers: string[];
  includeForecasts: boolean;
  includeComparisons: boolean;
  aggregationLevel: 'daily' | 'weekly' | 'monthly';
}

export interface DashboardMetrics {
  totalReports: number;
  scheduledReports: number;
  generatedThisWeek: number;
  averageGenerationTime: number;
  topCategories: { category: string; count: number }[];
  recentActivity: RecentActivity[];
  systemHealth: {
    dataQuality: number;
    reportAccuracy: number;
    systemUptime: number;
    lastUpdated: string;
  };
}

export interface RecentActivity {
  id: string;
  type: 'generated' | 'scheduled' | 'exported' | 'shared';
  reportName: string;
  user: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockReports = (): ReportData[] => {
  const reportTypes = ['inventory', 'procurement', 'suppliers', 'costs', 'performance', 'alerts', 'forecasting'] as const;
  const categories = ['operational', 'financial', 'strategic', 'compliance'] as const;
  
  return Array.from({ length: 12 }, (_, index) => {
    const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Generate mock data based on report type
    const summary = generateMockSummary(type);
    const sections = generateMockSections(type);
    const charts = generateMockCharts(type);
    const tables = generateMockTables(type);
    
    return {
      id: `report-${index + 1}`,
      name: getReportName(type, category),
      type,
      category,
      description: getReportDescription(type, category),
      lastGenerated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: ['Ana García', 'Luis Pérez', 'María López', 'Carlos Ruiz'][Math.floor(Math.random() * 4)],
      
      dataPoints: Math.floor(Math.random() * 5000) + 1000,
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: ['weekly', 'monthly'][Math.floor(Math.random() * 2)] as any
      },
      
      summary,
      sections,
      charts,
      tables,
      
      formats: ['pdf', 'excel', 'csv'].filter(() => Math.random() > 0.3) as any[],
      scheduled: Math.random() > 0.6,
      frequency: Math.random() > 0.5 ? 'weekly' : 'monthly',
      recipients: Math.random() > 0.7 ? ['manager@company.com', 'operations@company.com'] : undefined
    };
  });
};

const getReportName = (type: string, category: string): string => {
  const names = {
    inventory: ['Análisis de Inventario', 'Gestión de Stock', 'Control de Almacén'],
    procurement: ['Inteligencia de Compras', 'Análisis de Proveedores', 'Optimización de Compras'],
    suppliers: ['Performance de Proveedores', 'Evaluación de Suministros', 'Scoring de Proveedores'],
    costs: ['Análisis de Costos', 'Control de Gastos', 'Optimización Financiera'],
    performance: ['Performance Operacional', 'KPIs de Gestión', 'Métricas de Eficiencia'],
    alerts: ['Reporte de Alertas', 'Monitoreo de Riesgos', 'Sistema de Notificaciones'],
    forecasting: ['Pronóstico de Demanda', 'Planificación Predictiva', 'Análisis Predictivo']
  };
  return names[type as keyof typeof names][Math.floor(Math.random() * 3)];
};

const getReportDescription = (type: string, category: string): string => {
  const descriptions = {
    inventory: 'Análisis completo del estado del inventario, rotación y optimización de stock.',
    procurement: 'Evaluación de procesos de compras, proveedores y oportunidades de mejora.',
    suppliers: 'Métricas de rendimiento de proveedores y análisis de relaciones comerciales.',
    costs: 'Control de costos operacionales y análisis de variaciones presupuestarias.',
    performance: 'Indicadores clave de rendimiento operacional y eficiencia de procesos.',
    alerts: 'Resumen de alertas críticas y monitoreo de riesgos en la cadena de suministro.',
    forecasting: 'Proyecciones de demanda y planificación estratégica basada en análisis predictivo.'
  };
  return descriptions[type as keyof typeof descriptions];
};

const generateMockSummary = (type: string): ReportSummary => {
  return {
    title: `Resumen Ejecutivo - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    executiveSummary: `Durante el período analizado, se observaron tendencias ${Math.random() > 0.5 ? 'positivas' : 'mixtas'} en las métricas clave de ${type}. Los indicadores principales muestran un rendimiento ${Math.random() > 0.6 ? 'superior' : 'acorde'} a los objetivos establecidos.`,
    keyInsights: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
      id: `insight-${i}`,
      type: ['positive', 'negative', 'neutral', 'warning'][Math.floor(Math.random() * 4)] as any,
      title: `Insight clave ${i + 1}`,
      description: `Análisis detallado de tendencias en ${type}`,
      impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      metric: {
        value: Math.random() * 100,
        unit: '%',
        change: (Math.random() - 0.5) * 20,
        period: '30 días'
      },
      actionable: Math.random() > 0.4
    })),
    recommendations: [
      `Optimizar procesos de ${type}`,
      'Implementar mejoras en eficiencia',
      'Revisar políticas actuales',
      'Fortalecer controles de calidad'
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    criticalIssues: Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
      id: `issue-${i}`,
      severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)] as any,
      title: `Problema crítico ${i + 1}`,
      description: `Situación que requiere atención en ${type}`,
      affectedArea: type,
      estimatedImpact: Math.random() * 50000,
      timeToResolve: Math.floor(Math.random() * 72) + 24,
      recommendedActions: ['Acción inmediata requerida', 'Escalamiento a gerencia', 'Implementar plan de contingencia']
    })),
    performance: {
      score: Math.random() * 40 + 60,
      trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as any,
      benchmarks: [
        {
          metric: 'Eficiencia',
          current: Math.random() * 20 + 80,
          target: 85,
          industry: Math.random() * 10 + 75,
          unit: '%',
          status: 'above_target'
        }
      ]
    }
  };
};

const generateMockSections = (type: string): ReportSection[] => {
  return [
    {
      id: 'metrics',
      title: 'Métricas Principales',
      type: 'metrics',
      content: {
        metrics: Array.from({ length: 5 }, (_, i) => ({
          name: `Métrica ${i + 1}`,
          value: Math.random() * 1000,
          unit: ['%', '$', 'unidades', 'días', 'kg'][i],
          change: (Math.random() - 0.5) * 20,
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
          target: Math.random() * 1000 + 500,
          status: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)] as any
        }))
      },
      priority: 1
    },
    {
      id: 'trends',
      title: 'Análisis de Tendencias',
      type: 'trends',
      content: {
        trends: Array.from({ length: 12 }, (_, i) => ({
          period: `Sem ${i + 1}`,
          value: Math.random() * 1000 + 500,
          forecast: Math.random() * 1000 + 400,
          target: 750
        }))
      },
      priority: 2
    }
  ];
};

const generateMockCharts = (type: string): ChartData[] => {
  return [
    {
      id: 'trend-chart',
      title: `Tendencia de ${type}`,
      type: 'line',
      data: Array.from({ length: 30 }, (_, i) => ({
        label: `Día ${i + 1}`,
        value: Math.random() * 1000 + 200,
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString()
      })),
      xAxis: 'Fecha',
      yAxis: 'Valor',
      colors: ['#3B82F6', '#10B981', '#F59E0B']
    },
    {
      id: 'category-chart',
      title: `Distribución por Categoría`,
      type: 'pie',
      data: [
        { label: 'Categoría A', value: Math.random() * 100 },
        { label: 'Categoría B', value: Math.random() * 100 },
        { label: 'Categoría C', value: Math.random() * 100 }
      ],
      xAxis: 'Categoría',
      yAxis: 'Porcentaje',
      colors: ['#EF4444', '#F59E0B', '#10B981']
    }
  ];
};

const generateMockTables = (type: string): TableData[] => {
  return [
    {
      id: 'summary-table',
      title: `Resumen de ${type}`,
      columns: [
        { key: 'item', title: 'Item', type: 'text', sortable: true },
        { key: 'value', title: 'Valor', type: 'number', sortable: true },
        { key: 'change', title: 'Cambio', type: 'percentage', sortable: true },
        { key: 'status', title: 'Estado', type: 'status', sortable: false }
      ],
      rows: Array.from({ length: 10 }, (_, i) => ({
        id: `row-${i}`,
        data: {
          item: `Item ${i + 1}`,
          value: Math.floor(Math.random() * 10000),
          change: (Math.random() - 0.5) * 40,
          status: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)]
        }
      })),
      sortable: true,
      filterable: true,
      exportable: true
    }
  ];
};

const generateMockDashboardMetrics = (): DashboardMetrics => {
  return {
    totalReports: Math.floor(Math.random() * 50) + 20,
    scheduledReports: Math.floor(Math.random() * 15) + 5,
    generatedThisWeek: Math.floor(Math.random() * 10) + 3,
    averageGenerationTime: Math.random() * 300 + 60,
    topCategories: [
      { category: 'Operacional', count: Math.floor(Math.random() * 20) + 10 },
      { category: 'Financiero', count: Math.floor(Math.random() * 15) + 8 },
      { category: 'Estratégico', count: Math.floor(Math.random() * 10) + 5 }
    ],
    recentActivity: Array.from({ length: 8 }, (_, i) => ({
      id: `activity-${i}`,
      type: ['generated', 'scheduled', 'exported', 'shared'][Math.floor(Math.random() * 4)] as any,
      reportName: `Reporte ${i + 1}`,
      user: ['Ana García', 'Luis Pérez'][Math.floor(Math.random() * 2)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: ['success', 'failed', 'pending'][Math.floor(Math.random() * 3)] as any
    })),
    systemHealth: {
      dataQuality: Math.random() * 20 + 80,
      reportAccuracy: Math.random() * 15 + 85,
      systemUptime: Math.random() * 5 + 95,
      lastUpdated: new Date().toISOString()
    }
  };
};

// ============================================================================
// SUPPLY CHAIN REPORTING COMPONENT
// ============================================================================

const reportTypeOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'inventory', label: 'Inventario' },
    { value: 'procurement', label: 'Compras' },
    { value: 'suppliers', label: 'Proveedores' },
    { value: 'costs', label: 'Costos' },
    { value: 'performance', label: 'Performance' },
    { value: 'alerts', label: 'Alertas' },
    { value: 'forecasting', label: 'Pronósticos' }
  ]
});

const reportCategoryOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'operational', label: 'Operacional' },
    { value: 'financial', label: 'Financiero' },
    { value: 'strategic', label: 'Estratégico' },
    { value: 'compliance', label: 'Cumplimiento' }
  ]
});

export function SupplyChainReporting() {
  // State management
  const [reports, setReports] = useState<ReportData[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'generator' | 'scheduled'>('dashboard');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Report generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>(['inventory']);

  // Load reports data
  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockReports = generateMockReports();
      const mockMetrics = generateMockDashboardMetrics();
      
      setReports(mockReports);
      setDashboardMetrics(mockMetrics);
      
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [reports, typeFilter, categoryFilter, searchTerm]);

  // Generate new report
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Create new report
      const newReport = generateMockReports()[0];
      newReport.id = `report-${Date.now()}`;
      newReport.name = `Reporte Personalizado - ${new Date().toLocaleDateString()}`;
      newReport.lastGenerated = new Date().toISOString();
      newReport.generatedBy = 'Usuario Actual';
      
      setReports(prev => [newReport, ...prev]);
      
      // Update metrics
      if (dashboardMetrics) {
        setDashboardMetrics({
          ...dashboardMetrics,
          totalReports: dashboardMetrics.totalReports + 1,
          generatedThisWeek: dashboardMetrics.generatedThisWeek + 1
        });
      }
      
      // Emit event
      await EventBus.emit(
        RestaurantEvents.DATA_SYNCED,
        {
          type: 'report_generated',
          reportId: newReport.id,
          reportName: newReport.name
        },
        'SupplyChainReporting'
      );
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const handleExportReport = async (reportId: string, format: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    console.log(`Exporting report "${report.name}" as ${format}`);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Emit event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      {
        type: 'report_exported',
        reportId,
        format
      },
      'SupplyChainReporting'
    );
  };

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="blue" />
          <Text>Cargando sistema de reportes...</Text>
          <Text fontSize="sm" color="gray.600">Preparando dashboards y análisis</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <Card.Root>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
                  <Text fontSize="xl" fontWeight="bold">Supply Chain Reporting</Text>
                  <Badge colorPalette="blue" size="sm">Business Intelligence</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Dashboard integral con reportes avanzados y análisis de inteligencia de negocios
                </Text>
              </VStack>

              <HStack gap="2">
                <Button
                  variant="outline"
                  colorPalette="green"
                  onClick={handleGenerateReport}
                  loading={isGenerating}
                  loadingText="Generando..."
                  size="sm"
                >
                  <DocumentChartBarIcon className="w-4 h-4" />
                  Generar Reporte
                </Button>
                
                <Button
                  colorPalette="blue"
                  onClick={loadReportsData}
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Actualizar
                </Button>
              </HStack>
            </HStack>

            {/* Dashboard Summary Cards */}
            {dashboardMetrics && (
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {dashboardMetrics.totalReports}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Total Reportes</Text>
                      <Text fontSize="xs" color="blue.600">disponibles</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {dashboardMetrics.scheduledReports}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Programados</Text>
                      <Text fontSize="xs" color="green.600">automáticos</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="purple.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {dashboardMetrics.generatedThisWeek}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Esta Semana</Text>
                      <Text fontSize="xs" color="purple.600">generados</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="orange.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {(dashboardMetrics.averageGenerationTime / 60).toFixed(1)}m
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tiempo Prom.</Text>
                      <Text fontSize="xs" color="orange.600">generación</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="dashboard">
            <HStack gap={2}>
              <ChartBarIcon className="w-4 h-4" />
              <Text>Dashboard</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="reports">
            <HStack gap={2}>
              <DocumentChartBarIcon className="w-4 h-4" />
              <Text>Reportes</Text>
              <Badge colorPalette="blue" size="sm">{reports.length}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="generator">
            <HStack gap={2}>
              <PresentationChartLineIcon className="w-4 h-4" />
              <Text>Generador</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="scheduled">
            <HStack gap={2}>
              <CalendarDaysIcon className="w-4 h-4" />
              <Text>Programados</Text>
              {dashboardMetrics && dashboardMetrics.scheduledReports > 0 && (
                <Badge colorPalette="green" size="sm">{dashboardMetrics.scheduledReports}</Badge>
              )}
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Dashboard Tab */}
          <Tabs.Content value="dashboard">
            <ReportingDashboard 
              metrics={dashboardMetrics}
              reports={reports}
            />
          </Tabs.Content>

          {/* Reports Tab */}
          <Tabs.Content value="reports">
            <VStack gap="4" align="stretch">
              {/* Filters */}
              <HStack gap="4" flexWrap="wrap">
                <Box flex="1" minW="250px">
                  <Input
                    placeholder="Buscar reportes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Box>
                
                <Select.Root
                  collection={reportTypeOptions}
                  value={[typeFilter]}
                  onValueChange={(details) => setTypeFilter(details.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {reportTypeOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                
                <Select.Root
                  collection={reportCategoryOptions}
                  value={[categoryFilter]}
                  onValueChange={(details) => setCategoryFilter(details.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {reportCategoryOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </HStack>
              
              <ReportsTable 
                reports={filteredReports}
                onExport={handleExportReport}
              />
            </VStack>
          </Tabs.Content>

          {/* Generator Tab */}
          <Tabs.Content value="generator">
            <ReportGenerator 
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating}
              selectedTypes={selectedReportTypes}
              onTypesChange={setSelectedReportTypes}
            />
          </Tabs.Content>

          {/* Scheduled Tab */}
          <Tabs.Content value="scheduled">
            <ScheduledReports 
              reports={reports.filter(r => r.scheduled)}
              metrics={dashboardMetrics}
            />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ReportingDashboardProps {
  metrics: DashboardMetrics | null;
  reports: ReportData[];
}

function ReportingDashboard({ metrics, reports }: ReportingDashboardProps) {
  if (!metrics) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <ChartBarIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay métricas disponibles</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* System Health */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Estado del Sistema</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            <VStack align="start" gap="2">
              <Text fontSize="sm" color="gray.600">Calidad de Datos</Text>
              <Progress.Root
                value={metrics.systemHealth.dataQuality}
                colorPalette="green"
                size="lg"
              >
                <ProgressTrack>
                  <ProgressRange />
                </ProgressTrack>
              </Progress.Root>
              <Text fontSize="sm" fontWeight="bold">
                {metrics.systemHealth.dataQuality.toFixed(1)}%
              </Text>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" color="gray.600">Precisión de Reportes</Text>
              <Progress.Root
                value={metrics.systemHealth.reportAccuracy}
                colorPalette="blue"
                size="lg"
              >
                <ProgressTrack>
                  <ProgressRange />
                </ProgressTrack>
              </Progress.Root>
              <Text fontSize="sm" fontWeight="bold">
                {metrics.systemHealth.reportAccuracy.toFixed(1)}%
              </Text>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" color="gray.600">Tiempo de Actividad</Text>
              <Progress.Root
                value={metrics.systemHealth.systemUptime}
                colorPalette="purple"
                size="lg"
              >
                <ProgressTrack>
                  <ProgressRange />
                </ProgressTrack>
              </Progress.Root>
              <Text fontSize="sm" fontWeight="bold">
                {metrics.systemHealth.systemUptime.toFixed(1)}%
              </Text>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Recent Activity & Top Categories */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root>
          <Card.Header>
            <Text fontWeight="bold">Actividad Reciente</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap="3" align="stretch">
              {metrics.recentActivity.slice(0, 6).map((activity) => (
                <HStack key={activity.id} justify="space-between">
                  <VStack align="start" gap="0">
                    <Text fontSize="sm" fontWeight="medium">{activity.reportName}</Text>
                    <Text fontSize="xs" color="gray.600">
                      {activity.type} por {activity.user}
                    </Text>
                  </VStack>
                  <VStack align="end" gap="0">
                    <Badge 
                      colorPalette={activity.status === 'success' ? 'green' : activity.status === 'failed' ? 'red' : 'yellow'} 
                      size="xs"
                    >
                      {activity.status}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Text fontWeight="bold">Categorías Principales</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap="4" align="stretch">
              {metrics.topCategories.map((category, index) => (
                <HStack key={category.category} justify="space-between">
                  <HStack gap="2">
                    <Text fontSize="lg">{index + 1}.</Text>
                    <Text fontWeight="medium">{category.category}</Text>
                  </HStack>
                  <Text color="blue.600" fontWeight="bold">
                    {category.count} reportes
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </VStack>
  );
}

interface ReportsTableProps {
  reports: ReportData[];
  onExport: (reportId: string, format: string) => void;
}

function ReportsTable({ reports, onExport }: ReportsTableProps) {
  const getTypeColor = (type: string) => {
    const colors = {
      inventory: 'blue',
      procurement: 'green',
      suppliers: 'purple',
      costs: 'orange',
      performance: 'teal',
      alerts: 'red',
      forecasting: 'pink'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      operational: 'blue',
      financial: 'green',
      strategic: 'purple',
      compliance: 'orange'
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  if (reports.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <DocumentChartBarIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No se encontraron reportes</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">
          Biblioteca de Reportes - {reports.length} disponibles
        </Text>
      </Card.Header>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Reporte</Table.ColumnHeader>
              <Table.ColumnHeader>Tipo</Table.ColumnHeader>
              <Table.ColumnHeader>Categoría</Table.ColumnHeader>
              <Table.ColumnHeader>Última Generación</Table.ColumnHeader>
              <Table.ColumnHeader>Datos</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.slice(0, 15).map((report) => (
              <Table.Row key={report.id}>
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium" fontSize="sm">{report.name}</Text>
                    <Text fontSize="xs" color="gray.600">
                      {report.description}
                    </Text>
                    <HStack gap="2">
                      {report.scheduled && (
                        <Badge colorPalette="green" size="xs">Programado</Badge>
                      )}
                      <Badge colorPalette="gray" size="xs">
                        {report.dataPoints.toLocaleString()} datos
                      </Badge>
                    </HStack>
                  </VStack>
                </Table.Cell>
                
                <Table.Cell>
                  <Badge colorPalette={getTypeColor(report.type)} size="sm">
                    {report.type}
                  </Badge>
                </Table.Cell>
                
                <Table.Cell>
                  <Badge colorPalette={getCategoryColor(report.category)} size="sm" variant="subtle">
                    {report.category}
                  </Badge>
                </Table.Cell>
                
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontSize="sm">
                      {new Date(report.lastGenerated).toLocaleDateString()}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      por {report.generatedBy}
                    </Text>
                  </VStack>
                </Table.Cell>
                
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontSize="sm">
                      {report.timeRange.period} 
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(report.timeRange.start).toLocaleDateString()} - {new Date(report.timeRange.end).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Table.Cell>
                
                <Table.Cell>
                  <HStack gap="1">
                    <IconButton
                      size="xs"
                      variant="ghost"
                      colorPalette="blue"
                      aria-label="Ver reporte"
                    >
                      <EyeIcon className="w-3 h-3" />
                    </IconButton>
                    
                    {report.formats.includes('pdf') && (
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => onExport(report.id, 'pdf')}
                        aria-label="Exportar PDF"
                      >
                        <DocumentArrowDownIcon className="w-3 h-3" />
                      </IconButton>
                    )}
                    
                    {report.formats.includes('excel') && (
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorPalette="green"
                        onClick={() => onExport(report.id, 'excel')}
                        aria-label="Exportar Excel"
                      >
                        <DocumentArrowDownIcon className="w-3 h-3" />
                      </IconButton>
                    )}
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        
        {reports.length > 15 && (
          <Text fontSize="sm" color="gray.600" mt="3" textAlign="center">
            Mostrando 15 de {reports.length} reportes. Use filtros para refinar la búsqueda.
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

interface ReportGeneratorProps {
  onGenerate: () => void;
  isGenerating: boolean;
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

function ReportGenerator({ onGenerate, isGenerating, selectedTypes, onTypesChange }: ReportGeneratorProps) {
  const reportOptions = [
    { id: 'inventory', label: 'Análisis de Inventario', description: 'Estado completo del inventario y rotación' },
    { id: 'procurement', label: 'Inteligencia de Compras', description: 'Análisis de procesos de adquisición' },
    { id: 'suppliers', label: 'Performance de Proveedores', description: 'Evaluación de proveedores y calidad' },
    { id: 'costs', label: 'Control de Costos', description: 'Análisis financiero y variaciones' },
    { id: 'performance', label: 'KPIs Operacionales', description: 'Métricas de rendimiento y eficiencia' },
    { id: 'forecasting', label: 'Pronóstico Predictivo', description: 'Proyecciones de demanda y planificación' }
  ];

  return (
    <VStack gap="6" align="stretch">
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Generador de Reportes Personalizados</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600">
              Seleccione los tipos de análisis que desea incluir en su reporte personalizado:
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              {reportOptions.map((option) => (
                <Card.Root key={option.id} variant="outline" size="sm">
                  <Card.Body p="4">
                    <HStack gap="3">
                      <CheckboxRoot
                        checked={selectedTypes.includes(option.id)}
                        onCheckedChange={(details) => {
                          if (details.checked) {
                            onTypesChange([...selectedTypes, option.id]);
                          } else {
                            onTypesChange(selectedTypes.filter(t => t !== option.id));
                          }
                        }}
                      >
                        <CheckboxControl>
                          <CheckboxIndicator />
                        </CheckboxControl>
                      </CheckboxRoot>
                      <VStack align="start" gap="1" flex="1">
                        <Text fontWeight="medium" fontSize="sm">{option.label}</Text>
                        <Text fontSize="xs" color="gray.600">{option.description}</Text>
                      </VStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
            
            <HStack justify="center" pt="4">
              <Button
                colorPalette="blue"
                size="lg"
                onClick={onGenerate}
                loading={isGenerating}
                loadingText="Generando reporte..."
                disabled={selectedTypes.length === 0}
              >
                <DocumentChartBarIcon className="w-5 h-5" />
                Generar Reporte Completo
              </Button>
            </HStack>
            
            {isGenerating && (
              <Alert.Root status="info" variant="subtle">
                <Alert.Title>Generando reporte personalizado</Alert.Title>
                <Alert.Description>
                  Procesando {selectedTypes.length} módulos de análisis. Esto puede tomar unos minutos...
                </Alert.Description>
              </Alert.Root>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

interface ScheduledReportsProps {
  reports: ReportData[];
  metrics: DashboardMetrics | null;
}

function ScheduledReports({ reports, metrics }: ScheduledReportsProps) {
  if (reports.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay reportes programados</Text>
            <Text fontSize="sm" color="gray.400">Configure reportes automáticos para recibir actualizaciones regulares</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack gap="4" align="stretch">
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Reportes Automáticos Programados - {reports.length}</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="3" align="stretch">
            {reports.map((report) => (
              <Card.Root key={report.id} variant="outline" size="sm">
                <Card.Body p="4">
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium">{report.name}</Text>
                      <Text fontSize="sm" color="gray.600">{report.description}</Text>
                      <HStack gap="4">
                        <HStack gap="1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <Text fontSize="xs" color="gray.500">
                            Frecuencia: {report.frequency}
                          </Text>
                        </HStack>
                        {report.recipients && (
                          <HStack gap="1">
                            <UserGroupIcon className="w-3 h-3 text-gray-400" />
                            <Text fontSize="xs" color="gray.500">
                              {report.recipients.length} destinatarios
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>
                    <VStack align="end" gap="1">
                      <Badge colorPalette="green" size="sm">Activo</Badge>
                      <Text fontSize="xs" color="gray.500">
                        Último: {new Date(report.lastGenerated).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

export default SupplyChainReporting;