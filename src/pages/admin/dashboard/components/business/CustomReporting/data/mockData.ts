import {
  type ReportTemplate,
  type GeneratedReport,
  type ReportAutomation,
  type ReportInsight,
} from '../types';

// Mock data generators
export const generateMockReportTemplates = (): ReportTemplate[] => {
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

export const generateMockGeneratedReports = (): GeneratedReport[] => {
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

export const generateMockReportAutomations = (): ReportAutomation[] => {
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

export const generateMockReportInsights = (): ReportInsight[] => {
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
