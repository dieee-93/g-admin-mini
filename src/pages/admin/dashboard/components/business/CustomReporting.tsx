export { default } from './CustomReporting';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Progress,
  Alert,
  Skeleton,
  Select,
  createListCollection,
  Tabs,
  Switch,
  IconButton,
  Input,
  Textarea,
  Checkbox,
  NumberInput
} from '@chakra-ui/react';
import {
  DocumentChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CardWrapper, Button, Icon } from '@/shared/ui';
// Import event system
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// Custom Reporting Interfaces
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'customer' | 'inventory' | 'staff' | 'custom';
  type: 'dashboard' | 'chart' | 'table' | 'kpi' | 'summary';
  dataSources: string[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  groupings: ReportGrouping[];
  visualizations: ReportVisualization[];
  schedule?: ReportSchedule;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastGenerated?: string;
  generationCount: number;
}

interface ReportMetric {
  id: string;
  name: string;
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  format: 'number' | 'currency' | 'percentage' | 'date' | 'text';
  calculation?: string; // Custom calculation formula
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between';
  value: string | number | string[];
  displayName: string;
}

interface ReportGrouping {
  field: string;
  displayName: string;
  sortOrder: 'asc' | 'desc';
}

interface ReportVisualization {
  id: string;
  type: 'bar_chart' | 'line_chart' | 'pie_chart' | 'table' | 'kpi_card' | 'gauge';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0 = Sunday, 6 = Saturday
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'email_summary';
  isEnabled: boolean;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  fileSize?: number;
  downloadUrl?: string;
  parameters: Record<string, any>;
  executionTime: number; // milliseconds
  error?: string;
}

interface ReportAutomation {
  id: string;
  name: string;
  description: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  isEnabled: boolean;
  lastExecuted?: string;
  executionCount: number;
  successRate: number; // 0-100
}

interface AutomationTrigger {
  type: 'schedule' | 'data_change' | 'threshold' | 'manual';
  config: Record<string, any>;
}

interface AutomationAction {
  type: 'generate_report' | 'send_email' | 'create_alert' | 'update_dashboard' | 'webhook';
  config: Record<string, any>;
}

interface AutomationCondition {
  field: string;
  operator: string;
  value: any;
  logicOperator?: 'and' | 'or';
}

interface ReportInsight {
  id: string;
  reportId: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  generatedAt: string;
}

interface CustomReportingConfig {
  maxReportsPerUser: number;
  maxScheduledReports: number;
  retentionDays: number;
  allowedExportFormats: string[];
  aiInsightsEnabled: boolean;
  automationEnabled: boolean;
}

// Mock data generators
const generateMockReportTemplates = (): ReportTemplate[] => {
  return [
    {
      id: 'report_1',
      name: 'Dashboard Financiero Ejecutivo',
      description: 'Resumen ejecutivo de métricas financieras clave con análisis de tendencias',
      category: 'financial',
      type: 'dashboard',
      dataSources: ['sales', 'materials', 'operations'],
      metrics: [
        { id: 'm1', name: 'Ingresos Totales', field: 'revenue', aggregation: 'sum', format: 'currency' },
        { id: 'm2', name: 'Costos Operativos', field: 'costs', aggregation: 'sum', format: 'currency' },
        { id: 'm3', name: 'Margen de Ganancia', field: 'profit_margin', aggregation: 'avg', format: 'percentage' }
      ],
      filters: [
        { id: 'f1', field: 'date', operator: 'between', value: ['2025-08-01', '2025-08-31'], displayName: 'Período' }
      ],
      groupings: [
        { field: 'date', displayName: 'Fecha', sortOrder: 'desc' }
      ],
      visualizations: [
        {
          id: 'v1',
          type: 'kpi_card',
          title: 'Ingresos del Mes',
          config: { metric: 'revenue', target: 130000 },
          position: { x: 0, y: 0, width: 4, height: 2 }
        },
        {
          id: 'v2',
          type: 'line_chart',
          title: 'Tendencia de Ingresos',
          config: { xAxis: 'date', yAxis: 'revenue' },
          position: { x: 4, y: 0, width: 8, height: 4 }
        }
      ],
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
        recipients: ['ceo@restaurant.com', 'cfo@restaurant.com'],
        format: 'pdf',
        isEnabled: true
      },
      isActive: true,
      createdBy: 'Admin',
      createdAt: '2025-08-01T00:00:00Z',
      lastGenerated: '2025-08-10T09:00:00Z',
      generationCount: 15
    },
    {
      id: 'report_2',
      name: 'Análisis de Eficiencia Operacional',
      description: 'Métricas operacionales detalladas con identificación de cuellos de botella',
      category: 'operational',
      type: 'chart',
      dataSources: ['operations', 'staff', 'materials'],
      metrics: [
        { id: 'm4', name: 'Eficiencia Promedio', field: 'efficiency', aggregation: 'avg', format: 'percentage' },
        { id: 'm5', name: 'Tiempo Promedio de Orden', field: 'order_time', aggregation: 'avg', format: 'number' },
        { id: 'm6', name: 'Utilización de Cocina', field: 'kitchen_utilization', aggregation: 'avg', format: 'percentage' }
      ],
      filters: [
        { id: 'f2', field: 'department', operator: 'equals', value: 'kitchen', displayName: 'Departamento' }
      ],
      groupings: [
        { field: 'shift', displayName: 'Turno', sortOrder: 'asc' }
      ],
      visualizations: [
        {
          id: 'v3',
          type: 'bar_chart',
          title: 'Eficiencia por Turno',
          config: { xAxis: 'shift', yAxis: 'efficiency' },
          position: { x: 0, y: 0, width: 6, height: 4 }
        },
        {
          id: 'v4',
          type: 'gauge',
          title: 'Utilización Actual',
          config: { metric: 'kitchen_utilization', min: 0, max: 100 },
          position: { x: 6, y: 0, width: 6, height: 4 }
        }
      ],
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '08:00',
        recipients: ['operations@restaurant.com'],
        format: 'excel',
        isEnabled: true
      },
      isActive: true,
      createdBy: 'Operations Manager',
      createdAt: '2025-08-05T00:00:00Z',
      lastGenerated: '2025-08-09T08:00:00Z',
      generationCount: 8
    },
    {
      id: 'report_3',
      name: 'Reporte de Satisfacción del Cliente',
      description: 'Análisis completo de satisfacción del cliente y métricas de retención',
      category: 'customer',
      type: 'summary',
      dataSources: ['customers', 'sales'],
      metrics: [
        { id: 'm7', name: 'Satisfacción Promedio', field: 'satisfaction', aggregation: 'avg', format: 'number' },
        { id: 'm8', name: 'Tasa de Retención', field: 'retention_rate', aggregation: 'avg', format: 'percentage' },
        { id: 'm9', name: 'NPS Score', field: 'nps', aggregation: 'avg', format: 'number' }
      ],
      filters: [],
      groupings: [
        { field: 'customer_segment', displayName: 'Segmento', sortOrder: 'desc' }
      ],
      visualizations: [
        {
          id: 'v5',
          type: 'pie_chart',
          title: 'Distribución de Satisfacción',
          config: { metric: 'satisfaction', groupBy: 'rating_category' },
          position: { x: 0, y: 0, width: 6, height: 4 }
        }
      ],
      isActive: true,
      createdBy: 'Customer Success',
      createdAt: '2025-08-03T00:00:00Z',
      generationCount: 5
    }
  ];
};

const generateMockGeneratedReports = (): GeneratedReport[] => {
  return [
    {
      id: 'gen_1',
      templateId: 'report_1',
      templateName: 'Dashboard Financiero Ejecutivo',
      generatedAt: '2025-08-10T09:00:00Z',
      generatedBy: 'Automated',
      format: 'pdf',
      status: 'completed',
      fileSize: 2048576, // 2MB
      downloadUrl: '/downloads/financial-dashboard-202508.pdf',
      parameters: { period: 'August 2025' },
      executionTime: 3500
    },
    {
      id: 'gen_2',
      templateId: 'report_2',
      templateName: 'Análisis de Eficiencia Operacional',
      generatedAt: '2025-08-09T08:00:00Z',
      generatedBy: 'Operations Manager',
      format: 'excel',
      status: 'completed',
      fileSize: 1536000, // 1.5MB
      downloadUrl: '/downloads/operational-efficiency-week32.xlsx',
      parameters: { week: 32, year: 2025 },
      executionTime: 2100
    },
    {
      id: 'gen_3',
      templateId: 'report_3',
      templateName: 'Reporte de Satisfacción del Cliente',
      generatedAt: '2025-08-10T14:30:00Z',
      generatedBy: 'Customer Success',
      format: 'csv',
      status: 'generating',
      parameters: { segment: 'all' },
      executionTime: 0
    }
  ];
};

const generateMockReportAutomations = (): ReportAutomation[] => {
  return [
    {
      id: 'auto_1',
      name: 'Alerta de Revenue Drop',
      description: 'Genera reporte de emergencia cuando los ingresos caen más del 15%',
      triggers: [
        { type: 'threshold', config: { metric: 'revenue', operator: 'less_than', value: -15, period: 'daily' } }
      ],
      actions: [
        { type: 'generate_report', config: { templateId: 'report_1', format: 'pdf' } },
        { type: 'send_email', config: { recipients: ['ceo@restaurant.com'], subject: 'ALERTA: Caída en Ingresos' } }
      ],
      conditions: [
        { field: 'confidence', operator: 'greater_than', value: 80 }
      ],
      isEnabled: true,
      lastExecuted: '2025-08-05T15:30:00Z',
      executionCount: 3,
      successRate: 100
    },
    {
      id: 'auto_2',
      name: 'Resumen Semanal Automático',
      description: 'Genera y envía resumen semanal todos los lunes',
      triggers: [
        { type: 'schedule', config: { frequency: 'weekly', dayOfWeek: 1, time: '07:00' } }
      ],
      actions: [
        { type: 'generate_report', config: { templateId: 'report_2', format: 'excel' } },
        { type: 'update_dashboard', config: { dashboardId: 'main_ops' } }
      ],
      conditions: [],
      isEnabled: true,
      lastExecuted: '2025-08-05T07:00:00Z',
      executionCount: 12,
      successRate: 91.7
    }
  ];
};

const generateMockReportInsights = (): ReportInsight[] => {
  return [
    {
      id: 'insight_1',
      reportId: 'report_1',
      type: 'trend',
      title: 'Tendencia Ascendente en Ingresos',
      description: 'Los ingresos han mostrado un crecimiento consistente del 12% en las últimas 4 semanas',
      confidence: 89,
      impact: 'high',
      actionable: true,
      generatedAt: '2025-08-10T09:15:00Z'
    },
    {
      id: 'insight_2',
      reportId: 'report_2',
      type: 'anomaly',
      title: 'Pico Anómalo en Tiempo de Orden',
      description: 'Tiempo promedio de orden aumentó 35% el viernes pasado durante horario pico',
      confidence: 94,
      impact: 'medium',
      actionable: true,
      generatedAt: '2025-08-09T10:30:00Z'
    },
    {
      id: 'insight_3',
      reportId: 'report_3',
      type: 'correlation',
      title: 'Correlación Satisfacción-Retención',
      description: 'Alta correlación (0.87) entre tiempo de espera y satisfacción del cliente',
      confidence: 92,
      impact: 'high',
      actionable: true,
      generatedAt: '2025-08-08T16:45:00Z'
    }
  ];
};

// Collections
const CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Financiero', value: 'financial' },
    { label: 'Operacional', value: 'operational' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Inventario', value: 'inventory' },
    { label: 'Personal', value: 'staff' },
    { label: 'Personalizado', value: 'custom' }
  ]
});

const FORMAT_COLLECTION = createListCollection({
  items: [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' },
    { label: 'JSON', value: 'json' }
  ]
});

const FREQUENCY_COLLECTION = createListCollection({
  items: [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Trimestral', value: 'quarterly' }
  ]
});

// Component
export function CustomReporting() {
  // State
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [automations, setAutomations] = useState<ReportAutomation[]>([]);
  const [insights, setInsights] = useState<ReportInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'automation' | 'insights' | 'builder'>('templates');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  // Report Builder State
  const [builderStep, setBuilderStep] = useState<'basic' | 'data' | 'visualization' | 'schedule'>('basic');
  const [newReport, setNewReport] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    type: 'dashboard',
    dataSources: [],
    metrics: [],
    filters: [],
    visualizations: [],
    isActive: true
  });

  // Load data
  useEffect(() => {
    const loadReportingData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockTemplates = generateMockReportTemplates();
        const mockGenerated = generateMockGeneratedReports();
        const mockAutomations = generateMockReportAutomations();
        const mockInsights = generateMockReportInsights();
        
        setTemplates(mockTemplates);
        setGeneratedReports(mockGenerated);
        setAutomations(mockAutomations);
        setInsights(mockInsights);
        
      } catch (error) {
        console.error('Error loading custom reporting data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportingData();
  }, []);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return templates;
    return templates.filter(template => template.category === selectedCategory);
  }, [templates, selectedCategory]);

  // Reporting summary
  const reportingSummary = useMemo(() => {
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const scheduledReports = templates.filter(t => t.schedule?.isEnabled).length;
    const totalGenerated = generatedReports.length;
    const activeAutomations = automations.filter(a => a.isEnabled).length;
    const totalInsights = insights.length;
    
    return {
      totalTemplates,
      activeTemplates,
      scheduledReports,
      totalGenerated,
      activeAutomations,
      totalInsights
    };
  }, [templates, generatedReports, automations, insights]);

  // Generate report
  const generateReport = useCallback(async (templateId: string, format: string = 'pdf') => {
    setIsGenerating(templateId);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      const newGeneratedReport: GeneratedReport = {
        id: `gen_${Date.now()}`,
        templateId,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Current User',
        format: format as any,
        status: 'completed',
        fileSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
        downloadUrl: `/downloads/${template.name.toLowerCase().replace(/\s+/g, '-')}.${format}`,
        parameters: { generated_on_demand: true },
        executionTime: Math.floor(Math.random() * 5000) + 1000
      };
      
      setGeneratedReports(prev => [newGeneratedReport, ...prev]);
      
      // Update template generation count
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, generationCount: t.generationCount + 1, lastGenerated: new Date().toISOString() }
          : t
      ));
      
      // Emit generation event
      await EventBus.emit(RestaurantEvents.DATA_SYNCED, {
        type: 'custom_report_generated',
        templateId,
        templateName: template.name,
        format,
        fileSize: newGeneratedReport.fileSize,
        executionTime: newGeneratedReport.executionTime
      }, 'CustomReporting');
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(null);
    }
  }, [templates]);

  // Toggle automation
  const toggleAutomation = useCallback((automationId: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === automationId
        ? { ...automation, isEnabled: !automation.isEnabled }
        : automation
    ));
  }, []);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'green';
      case 'operational': return 'blue';
      case 'customer': return 'purple';
      case 'inventory': return 'orange';
      case 'staff': return 'pink';
      default: return 'gray';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'generating': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="80px" />
          <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="120px" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="start" gap={3}>
          <HStack justify="space-between" w="full">
            <VStack align="start" gap={1}>
              <Text fontSize="3xl" fontWeight="bold">📊 Custom Reporting</Text>
              <Text color="gray.600">
                Constructor de reportes flexible con automatización y análisis inteligente
              </Text>
            </VStack>
            
            <HStack gap={2}>
              <Button 
                colorPalette="blue"
                leftIcon={<Icon icon={PlusIcon} size="sm" />}
                onClick={() => {
                  setActiveTab('builder');
                  setBuilderStep('basic');
                }}
              >
                Nuevo Reporte
              </Button>
            </HStack>
          </HStack>

          {/* Summary Stats */}
          <SimpleGrid columns={{ base: 2, md: 6 }} gap={4} w="full">
            <CardWrapper variant="subtle" bg="blue.50">
              <CardWrapper.Body p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {reportingSummary.totalTemplates}
                </Text>
                <Text fontSize="sm" color="gray.600">Plantillas</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" >
              <CardWrapper.Body p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {reportingSummary.activeTemplates}
                </Text>
                <Text fontSize="sm" color="gray.600">Activas</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" bg="purple.50">
              <CardWrapper.Body p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {reportingSummary.scheduledReports}
                </Text>
                <Text fontSize="sm" color="gray.600">Programados</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" bg="orange.50">
              <CardWrapper.Body p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {reportingSummary.totalGenerated}
                </Text>
                <Text fontSize="sm" color="gray.600">Generados</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" bg="pink.50">
              <CardWrapper.Body p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="pink.600">
                  {reportingSummary.activeAutomations}
                </Text>
                <Text fontSize="sm" color="gray.600">Automatizaciones</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle" bg="yellow.50">
              <CardWrapper.Body p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                  {reportingSummary.totalInsights}
                </Text>
                <Text fontSize="sm" color="gray.600">Insights</Text>
              </CardWrapper.Body>
            </CardWrapper>
          </SimpleGrid>
        </VStack>

        {/* Main Content Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="templates">
              <HStack gap={2}>
                <Icon icon={DocumentChartBarIcon} size="sm" />
                <Text>Plantillas</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="generated">
              <HStack gap={2}>
                <Icon icon={ArrowDownTrayIcon} size="sm" />
                <Text>Reportes Generados</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="automation">
              <HStack gap={2}>
                <Icon icon={CogIcon} size="sm" />
                <Text>Automatización</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="insights">
              <HStack gap={2}>
                <Icon icon={ChartBarIcon} size="sm" />
                <Text>Insights</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="builder">
              <HStack gap={2}>
                <Icon icon={PlusIcon} size="sm" />
                <Text>Constructor</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            {/* Templates Tab */}
            <Tabs.Content value="templates">
              <VStack gap={4} align="stretch">
                {/* Filters */}
                <HStack gap={4} flexWrap="wrap">
                  <Select.Root
                    collection={CATEGORY_COLLECTION}
                    value={[selectedCategory]}
                    onValueChange={(details) => setSelectedCategory(details.value[0])}
                    width="200px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Categoría" />
                    </Select.Trigger>
                    <Select.Content>
                      {CATEGORY_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                {/* Templates Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  {filteredTemplates.map((template) => (
                    <CardWrapper key={template.id} variant="outline">
                      <CardWrapper.Body p={4}>
                        <VStack align="stretch" gap={3}>
                          {/* Header */}
                          <HStack justify="space-between">
                            <VStack align="start" gap={0}>
                              <Text fontSize="md" fontWeight="bold">
                                {template.name}
                              </Text>
                              <HStack gap={1}>
                                <Badge colorPalette={getCategoryColor(template.category)} size="xs">
                                  {template.category}
                                </Badge>
                                <Badge variant="outline" size="xs">
                                  {template.type}
                                </Badge>
                                {!template.isActive && (
                                  <Badge colorPalette="gray" size="xs">
                                    Inactivo
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>

                          {/* Description */}
                          <Text fontSize="sm" color="gray.600" lineHeight={1.4}>
                            {template.description}
                          </Text>

                          {/* Stats */}
                          <SimpleGrid columns={2} gap={2} fontSize="xs">
                            <VStack align="start" gap={0}>
                              <Text color="gray.500">Generaciones:</Text>
                              <Text fontWeight="medium">{template.generationCount}</Text>
                            </VStack>
                            <VStack align="end" gap={0}>
                              <Text color="gray.500">Última generación:</Text>
                              <Text fontWeight="medium">
                                {template.lastGenerated 
                                  ? new Date(template.lastGenerated).toLocaleDateString()
                                  : 'Nunca'
                                }
                              </Text>
                            </VStack>
                          </SimpleGrid>

                          {/* Schedule Info */}
                          {template.schedule?.isEnabled && (
                            <HStack gap={2} fontSize="xs" color="blue.600" bg="blue.50" p={2} borderRadius="sm">
                              <Icon icon={CalendarIcon} size="xs" />
                              <Text>
                                Programado: {template.schedule.frequency} a las {template.schedule.time}
                              </Text>
                            </HStack>
                          )}

                          {/* Actions */}
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              flex="1"
                              onClick={() => generateReport(template.id, 'pdf')}
                              loading={isGenerating === template.id}
                              loadingText="Generando..."
                            >
                              <Icon icon={PlayIcon} size="xs" style={{ marginRight: "4px" }} />
                              Generar
                            </Button>
                            
                            <IconButton size="sm" variant="outline">
                              <Icon icon={EyeIcon} size="xs" />
                            </IconButton>
                            
                            <IconButton size="sm" variant="outline">
                              <Icon icon={PencilIcon} size="xs" />
                            </IconButton>
                            
                            <IconButton size="sm" variant="outline" colorPalette="red">
                              <Icon icon={TrashIcon} size="xs" />
                            </IconButton>
                          </HStack>
                        </VStack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </SimpleGrid>
              </VStack>
            </Tabs.Content>

            {/* Generated Reports Tab */}
            <Tabs.Content value="generated">
              <VStack gap={4} align="stretch">
                {generatedReports.map((report) => (
                  <CardWrapper key={report.id} variant="outline">
                    <CardWrapper.Body p={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={2} flex="1">
                          <HStack gap={2}>
                            <Text fontSize="md" fontWeight="bold">
                              {report.templateName}
                            </Text>
                            <Badge colorPalette={getStatusColor(report.status)}>
                              {report.status === 'completed' ? 'Completado' :
                               report.status === 'generating' ? 'Generando' : 'Fallido'}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {report.format.toUpperCase()}
                            </Badge>
                          </HStack>
                          
                          <HStack gap={4} fontSize="sm" color="gray.600">
                            <HStack gap={1}>
                              <Icon icon={CalendarIcon} size="sm" />
                              <Text>{new Date(report.generatedAt).toLocaleString()}</Text>
                            </HStack>
                            <HStack gap={1}>
                              <Icon icon={ClockIcon} size="sm" />
                              <Text>{(report.executionTime / 1000).toFixed(1)}s</Text>
                            </HStack>
                            {report.fileSize && (
                              <Text>
                                Tamaño: {(report.fileSize / (1024 * 1024)).toFixed(1)} MB
                              </Text>
                            )}
                          </HStack>
                          
                          <Text fontSize="xs" color="gray.500">
                            Generado por: {report.generatedBy}
                          </Text>
                        </VStack>
                        
                        <VStack gap={2}>
                          {report.status === 'generating' && (
                            <Progress.Root colorPalette="blue" size="sm" width="100px" indeterminate />
                          )}
                          
                          {report.status === 'completed' && report.downloadUrl && (
                            <Button size="sm" variant="outline" colorPalette="green">
                              <Icon icon={ArrowDownTrayIcon} size="xs" style={{ marginRight: "4px" }} />
                              Descargar
                            </Button>
                          )}
                          
                          {report.status === 'failed' && (
                            <Button size="sm" variant="outline" colorPalette="red">
                              <Icon icon={ExclamationTriangleIcon} size="xs" style={{ marginRight: "4px" }} />
                              Error
                            </Button>
                          )}
                        </VStack>
                      </HStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Automation Tab */}
            <Tabs.Content value="automation">
              <VStack gap={4} align="stretch">
                {automations.map((automation) => (
                  <CardWrapper key={automation.id} variant="outline">
                    <CardWrapper.Body p={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={2} flex="1">
                          <HStack gap={2}>
                            <Text fontSize="md" fontWeight="bold">
                              {automation.name}
                            </Text>
                            <Switch.Root
                              checked={automation.isEnabled}
                              onCheckedChange={() => toggleAutomation(automation.id)}
                              colorPalette="green"
                              size="sm"
                            />
                          </HStack>
                          
                          <Text fontSize="sm" color="gray.600" lineHeight={1.4}>
                            {automation.description}
                          </Text>
                          
                          <HStack gap={4} fontSize="sm" color="gray.600">
                            <Text>Ejecutado: {automation.executionCount} veces</Text>
                            <Text>Éxito: {automation.successRate.toFixed(1)}%</Text>
                            {automation.lastExecuted && (
                              <Text>
                                Último: {new Date(automation.lastExecuted).toLocaleDateString()}
                              </Text>
                            )}
                          </HStack>
                          
                          {/* Triggers */}
                          <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700">
                              Disparadores:
                            </Text>
                            <HStack gap={1} flexWrap="wrap">
                              {automation.triggers.map((trigger, index) => (
                                <Badge key={index} colorPalette="blue" size="xs">
                                  {trigger.type === 'schedule' ? 'Programado' :
                                   trigger.type === 'threshold' ? 'Umbral' :
                                   trigger.type === 'data_change' ? 'Cambio de Datos' : 'Manual'}
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                          
                          {/* Actions */}
                          <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700">
                              Acciones:
                            </Text>
                            <HStack gap={1} flexWrap="wrap">
                              {automation.actions.map((action, index) => (
                                <Badge key={index} colorPalette="green" size="xs">
                                  {action.type === 'generate_report' ? 'Generar Reporte' :
                                   action.type === 'send_email' ? 'Enviar Email' :
                                   action.type === 'create_alert' ? 'Crear Alerta' : action.type}
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                        </VStack>
                        
                        <VStack gap={2}>
                          <IconButton size="sm" variant="outline">
                            <Icon icon={PencilIcon} size="xs" />
                          </IconButton>
                          
                          <IconButton size="sm" variant="outline" colorPalette="red">
                            <Icon icon={TrashIcon} size="xs" />
                          </IconButton>
                        </VStack>
                      </HStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Insights Tab */}
            <Tabs.Content value="insights">
              <VStack gap={4} align="stretch">
                {insights.map((insight) => (
                  <CardWrapper key={insight.id} variant="outline">
                    <CardWrapper.Body p={4}>
                      <VStack align="stretch" gap={3}>
                        {/* Header */}
                        <HStack justify="space-between">
                          <HStack gap={2}>
                            <Badge colorPalette="purple">
                              {insight.type === 'trend' ? 'Tendencia' :
                               insight.type === 'anomaly' ? 'Anomalía' :
                               insight.type === 'correlation' ? 'Correlación' :
                               insight.type === 'forecast' ? 'Pronóstico' : 'Recomendación'}
                            </Badge>
                            <Badge colorPalette={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'yellow' : 'green'}>
                              Impacto {insight.impact}
                            </Badge>
                            {insight.actionable && (
                              <Badge colorPalette="blue" size="sm">
                                Accionable
                              </Badge>
                            )}
                          </HStack>
                          
                          <Text fontSize="sm" color="blue.600" fontWeight="medium">
                            {insight.confidence}% confianza
                          </Text>
                        </HStack>

                        {/* Content */}
                        <VStack align="start" gap={2}>
                          <Text fontSize="md" fontWeight="bold">
                            {insight.title}
                          </Text>
                          <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                            {insight.description}
                          </Text>
                        </VStack>

                        {/* Meta */}
                        <HStack justify="space-between" fontSize="xs" color="gray.500">
                          <Text>
                            Generado: {new Date(insight.generatedAt).toLocaleString()}
                          </Text>
                          <Text>
                            Reporte: {templates.find(t => t.id === insight.reportId)?.name || 'Desconocido'}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Report Builder Tab */}
            <Tabs.Content value="builder">
              <CardWrapper variant="outline">
                <CardWrapper.Header>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">🏗️ Constructor de Reportes</Text>
                    <HStack gap={2}>
                      {['basic', 'data', 'visualization', 'schedule'].map((step, index) => (
                        <Badge 
                          key={step}
                          colorPalette={builderStep === step ? 'blue' : index < ['basic', 'data', 'visualization', 'schedule'].indexOf(builderStep) ? 'green' : 'gray'}
                          variant={builderStep === step ? 'solid' : 'outline'}
                        >
                          {index + 1}. {step === 'basic' ? 'Básico' : 
                             step === 'data' ? 'Datos' : 
                             step === 'visualization' ? 'Visualización' : 'Programación'}
                        </Badge>
                      ))}
                    </HStack>
                  </HStack>
                </CardWrapper.Header>
                
                <CardWrapper.Body p={6}>
                  {builderStep === 'basic' && (
                    <VStack gap={4} align="stretch">
                      <Text fontSize="md" fontWeight="medium" mb={2}>
                        Información Básica del Reporte
                      </Text>
                      
                      <VStack gap={4} align="stretch">
                        <Box>
                          <Text fontSize="sm" color="gray.700" mb={1}>Nombre del Reporte</Text>
                          <Input
                            placeholder="Ej: Dashboard de Ventas Mensual"
                            value={newReport.name || ''}
                            onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.700" mb={1}>Descripción</Text>
                          <Textarea
                            placeholder="Describe qué información mostrará este reporte..."
                            value={newReport.description || ''}
                            onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                          />
                        </Box>
                        
                        <SimpleGrid columns={2} gap={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.700" mb={1}>Categoría</Text>
                            <Select.Root
                              collection={createListCollection({
                                items: CATEGORY_COLLECTION.items.filter(item => item.value !== 'all')
                              })}
                              value={newReport.category ? [newReport.category] : []}
                              onValueChange={(details) => setNewReport(prev => ({ ...prev, category: details.value[0] as any }))}
                            >
                              <Select.Trigger>
                                <Select.ValueText placeholder="Seleccionar categoría" />
                              </Select.Trigger>
                              <Select.Content>
                                {CATEGORY_COLLECTION.items.filter(item => item.value !== 'all').map(item => (
                                  <Select.Item key={item.value} item={item}>
                                    {item.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Box>
                          
                          <Box>
                            <Text fontSize="sm" color="gray.700" mb={1}>Tipo de Reporte</Text>
                            <Select.Root
                              collection={createListCollection({
                                items: [
                                  { label: 'Dashboard', value: 'dashboard' },
                                  { label: 'Gráfico', value: 'chart' },
                                  { label: 'Tabla', value: 'table' },
                                  { label: 'KPIs', value: 'kpi' },
                                  { label: 'Resumen', value: 'summary' }
                                ]
                              })}
                              value={newReport.type ? [newReport.type] : []}
                              onValueChange={(details) => setNewReport(prev => ({ ...prev, type: details.value[0] as any }))}
                            >
                              <Select.Trigger>
                                <Select.ValueText placeholder="Tipo de reporte" />
                              </Select.Trigger>
                              <Select.Content>
                                {[
                                  { label: 'Dashboard', value: 'dashboard' },
                                  { label: 'Gráfico', value: 'chart' },
                                  { label: 'Tabla', value: 'table' },
                                  { label: 'KPIs', value: 'kpi' },
                                  { label: 'Resumen', value: 'summary' }
                                ].map(item => (
                                  <Select.Item key={item.value} item={item}>
                                    {item.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                      
                      <HStack justify="flex-end" mt={6}>
                        <Button
                          colorPalette="blue"
                          onClick={() => setBuilderStep('data')}
                          disabled={!newReport.name || !newReport.category || !newReport.type}
                        >
                          Siguiente: Datos
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                  
                  {/* Other builder steps would be implemented here */}
                  {builderStep !== 'basic' && (
                    <CardWrapper variant="subtle">
                      <CardWrapper.Body p={8} textAlign="center">
                        <Icon icon={PlusIcon} size="3xl" color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px auto" }} />
                        <Text fontSize="lg" fontWeight="medium" mb={2}>
                          Constructor de Reportes - {builderStep}
                        </Text>
                        <Text color="gray.600">
                          Esta sección del constructor de reportes será implementada en la versión completa.
                        </Text>
                        <HStack justify="center" gap={2} mt={4}>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const steps = ['basic', 'data', 'visualization', 'schedule'];
                              const currentIndex = steps.indexOf(builderStep);
                              if (currentIndex > 0) {
                                setBuilderStep(steps[currentIndex - 1] as any);
                              }
                            }}
                          >
                            Anterior
                          </Button>
                          <Button
                            colorPalette="blue"
                            onClick={() => {
                              const steps = ['basic', 'data', 'visualization', 'schedule'];
                              const currentIndex = steps.indexOf(builderStep);
                              if (currentIndex < steps.length - 1) {
                                setBuilderStep(steps[currentIndex + 1] as any);
                              }
                            }}
                          >
                            Siguiente
                          </Button>
                        </HStack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  )}
                </CardWrapper.Body>
              </CardWrapper>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}