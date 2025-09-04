import { createListCollection } from '@chakra-ui/react';
import type {
  ModuleMetric,
  CrossModuleCorrelation,
  BusinessBottleneck,
  HolisticInsight,
  SystemHealthMetric,
} from './CrossModuleAnalytics';

// Mock data generators
export const generateMockModuleMetrics = (): ModuleMetric[] => {
  const modules = [
    { id: 'sales', name: 'Ventas' },
    { id: 'operations', name: 'Operaciones' },
    { id: 'materials', name: 'Materiales' },
    { id: 'customers', name: 'Clientes' },
    { id: 'staff', name: 'Personal' },
    { id: 'scheduling', name: 'Planificación' },
  ];

  const metrics = [
    { id: 'revenue', name: 'Ingresos', unit: '$', category: 'financial' },
    { id: 'orders', name: 'Órdenes', unit: 'count', category: 'operational' },
    { id: 'efficiency', name: 'Eficiencia', unit: '%', category: 'operational' },
    { id: 'satisfaction', name: 'Satisfacción', unit: '/5', category: 'customer' },
    { id: 'cost', name: 'Costos', unit: '$', category: 'financial' },
    { id: 'utilization', name: 'Utilización', unit: '%', category: 'operational' },
    { id: 'retention', name: 'Retención', unit: '%', category: 'customer' },
    { id: 'productivity', name: 'Productividad', unit: '%', category: 'operational' },
    { id: 'waste', name: 'Desperdicio', unit: '%', category: 'inventory' },
    { id: 'attendance', name: 'Asistencia', unit: '%', category: 'staff' },
  ];

  const moduleMetrics: ModuleMetric[] = [];

  modules.forEach(module => {
    // Each module has 3-4 relevant metrics
    const moduleSpecificMetrics = metrics.slice(0, 4);

    moduleSpecificMetrics.forEach(metric => {
      const baseValue = Math.random() * 1000 + 100;
      const change = (Math.random() - 0.5) * 20; // -10% to +10%

      moduleMetrics.push({
        moduleId: module.id,
        moduleName: module.name,
        metricId: metric.id,
        metricName: metric.name,
        value:
          metric.unit === '%'
            ? Math.min(100, Math.max(0, baseValue % 100))
            : metric.unit === '/5'
            ? Math.min(5, Math.max(1, baseValue % 5))
            : baseValue,
        unit: metric.unit,
        category: metric.category as any,
        timestamp: new Date().toISOString(),
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
        change,
      });
    });
  });

  return moduleMetrics;
};

const generateBusinessInsight = (
  metric1: ModuleMetric,
  metric2: ModuleMetric,
  correlation: number,
): string => {
  const direction = correlation > 0 ? 'aumenta' : 'disminuye';
  const strength =
    Math.abs(correlation) > 0.7
      ? 'fuertemente'
      : Math.abs(correlation) > 0.5
      ? 'moderadamente'
      : 'ligeramente';

  return `Cuando ${metric1.metricName} de ${metric1.moduleName} ${direction}, ${metric2.metricName} de ${metric2.moduleName} tiende a ${direction} ${strength}.`;
};

const generateActionableRecommendation = (
  metric1: ModuleMetric,
  metric2: ModuleMetric,
  correlation: number,
): string => {
  const recommendations = [
    `Optimizar la coordinación entre ${metric1.moduleName} y ${metric2.moduleName}`,
    `Implementar alertas cruzadas para ${metric1.metricName} y ${metric2.metricName}`,
    `Establecer KPIs combinados que aprovechen esta correlación`,
    `Crear workflows automatizados basados en esta relación`,
  ];

  return recommendations[Math.floor(Math.random() * recommendations.length)];
};

export const generateMockCorrelations = (
  metrics: ModuleMetric[],
): CrossModuleCorrelation[] => {
  const correlations: CrossModuleCorrelation[] = [];

  // Generate meaningful correlations
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const metric1 = metrics[i];
      const metric2 = metrics[j];

      // Skip self-correlations and same-module correlations for some variety
      if (metric1.moduleId === metric2.moduleId && Math.random() > 0.3) continue;

      const coefficient = (Math.random() - 0.5) * 2; // -1 to 1
      const absCoeff = Math.abs(coefficient);

      // Only include meaningful correlations
      if (absCoeff < 0.3) continue;

      const strength =
        absCoeff > 0.8
          ? 'very_strong'
          : absCoeff > 0.6
          ? 'strong'
          : absCoeff > 0.4
          ? 'moderate'
          : 'weak';

      correlations.push({
        id: `corr_${i}_${j}`,
        metric1,
        metric2,
        correlationCoefficient: coefficient,
        correlationStrength: strength as any,
        correlationType: coefficient > 0 ? 'positive' : 'negative',
        significance: Math.random() * 30 + 70, // 70-100%
        businessInsight: generateBusinessInsight(metric1, metric2, coefficient),
        actionableRecommendation:
          Math.random() > 0.5
            ? generateActionableRecommendation(metric1, metric2, coefficient)
            : undefined,
        impactScore: Math.floor(absCoeff * 100),
      });
    }

    if (correlations.length >= 12) break; // Limit for demo
  }

  return correlations.slice(0, 12);
};

export const generateMockBottlenecks = (): BusinessBottleneck[] => {
  return [
    {
      id: 'bottleneck_1',
      name: 'Tiempo de Preparación en Cocina',
      type: 'capacity',
      severity: 'high',
      affectedModules: ['operations', 'sales', 'customers'],
      rootCause:
        'Proceso de preparación no optimizado y falta de coordinación entre estaciones',
      symptoms: [
        'Órdenes con tiempo de espera > 15 minutos',
        'Baja satisfacción del cliente (4.2/5)',
        'Acumulación de órdenes en horas pico',
      ],
      estimatedImpact: {
        financial: -2500,
        operational: -15,
        customer: -8,
      },
      recommendations: [
        {
          action: 'Implementar sistema de gestión de colas inteligente',
          effort: 'medium',
          timeframe: '4-6 semanas',
          expectedImprovement: 25,
          cost: 3000,
          riskLevel: 'low',
        },
        {
          action: 'Rediseñar layout de cocina para mejor flujo',
          effort: 'high',
          timeframe: '8-12 semanas',
          expectedImprovement: 35,
          cost: 8000,
          riskLevel: 'medium',
        },
      ],
      detectedAt: new Date().toISOString(),
      priority: 8,
    },
    {
      id: 'bottleneck_2',
      name: 'Gestión de Inventario Reactiva',
      type: 'process',
      severity: 'medium',
      affectedModules: ['materials', 'operations', 'sales'],
      rootCause: 'Falta de predicción de demanda y reordenamiento manual',
      symptoms: [
        'Desabastecimientos frecuentes (3-4 por semana)',
        'Exceso de inventario en algunos items (30% overstock)',
        'Tiempo perdido en gestión manual de pedidos',
      ],
      estimatedImpact: {
        financial: -1800,
        operational: -10,
        customer: -5,
      },
      recommendations: [
        {
          action: 'Implementar sistema de reordenamiento automático',
          effort: 'medium',
          timeframe: '6-8 semanas',
          expectedImprovement: 40,
          cost: 2500,
          riskLevel: 'low',
        },
      ],
      detectedAt: new Date().toISOString(),
      priority: 6,
    },
    {
      id: 'bottleneck_3',
      name: 'Comunicación Entre Módulos',
      type: 'information',
      severity: 'medium',
      affectedModules: ['sales', 'operations', 'staff'],
      rootCause: 'Sistemas aislados sin integración real-time',
      symptoms: [
        'Retrasos en comunicación de cambios',
        'Información duplicada o inconsistente',
        'Decisiones basadas en datos desactualizados',
      ],
      estimatedImpact: {
        financial: -1200,
        operational: -8,
        customer: -3,
      },
      recommendations: [
        {
          action: 'Implementar event-driven architecture completa',
          effort: 'high',
          timeframe: '10-14 semanas',
          expectedImprovement: 50,
          cost: 5000,
          riskLevel: 'medium',
        },
      ],
      detectedAt: new Date().toISOString(),
      priority: 7,
    },
  ];
};

export const generateMockHolisticInsights = (): HolisticInsight[] => {
  return [
    {
      id: 'insight_1',
      title: 'Oportunidad de Optimización Integral de Eficiencia',
      type: 'opportunity',
      scope: 'enterprise_wide',
      confidence: 89,
      impact: 'very_high',
      description:
        'Análisis cruzado identifica potencial de 23% de mejora en eficiencia general a través de sincronización de operaciones, materiales y personal.',
      involvedModules: ['operations', 'materials', 'staff', 'scheduling'],
      keyMetrics: ['efficiency', 'utilization', 'productivity', 'cost'],
      correlations: ['operations-materials', 'staff-scheduling', 'efficiency-cost'],
      businessValue: 15000,
      implementation: {
        complexity: 'high',
        timeframe: '12-16 semanas',
        resources: ['Operations Manager', 'IT Team', 'Process Analyst'],
        dependencies: ['System Integration', 'Staff Training', 'Process Redesign'],
      },
      aiGenerated: true,
    },
    {
      id: 'insight_2',
      title: 'Patrón de Demanda Cross-Temporal Detectado',
      type: 'pattern',
      scope: 'cross_module',
      confidence: 84,
      impact: 'high',
      description:
        'Los datos muestran correlación fuerte entre satisfacción del cliente y eficiencia operacional con lag de 2-3 días, sugiriendo oportunidades de predicción.',
      involvedModules: ['customers', 'operations', 'sales'],
      keyMetrics: ['satisfaction', 'efficiency', 'revenue'],
      correlations: ['customer-operations', 'satisfaction-revenue'],
      businessValue: 8500,
      implementation: {
        complexity: 'medium',
        timeframe: '6-8 semanas',
        resources: ['Data Analyst', 'Customer Success Manager'],
        dependencies: ['Data Pipeline', 'Predictive Model'],
      },
      aiGenerated: true,
    },
    {
      id: 'insight_3',
      title: 'Riesgo de Cascada en Calidad de Servicio',
      type: 'risk',
      scope: 'cross_module',
      confidence: 76,
      impact: 'medium',
      description:
        'Degradación en inventario está correlacionada con caída en satisfacción del cliente 48h después. Necesario sistema de alerta temprana.',
      involvedModules: ['materials', 'customers', 'operations'],
      keyMetrics: ['waste', 'satisfaction', 'quality'],
      correlations: ['materials-quality', 'quality-satisfaction'],
      businessValue: 5200,
      implementation: {
        complexity: 'medium',
        timeframe: '4-6 semanas',
        resources: ['Quality Manager', 'Inventory Manager'],
        dependencies: ['Real-time Monitoring', 'Alert System'],
      },
      aiGenerated: true,
    },
  ];
};

export const generateMockSystemHealth = (): SystemHealthMetric[] => {
  return [
    {
      category: 'Integración de Datos',
      name: 'Sincronización Cross-Module',
      value: 94.2,
      target: 98,
      unit: '%',
      status: 'good',
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
    },
    {
      category: 'Flujo de Información',
      name: 'Latencia de Eventos',
      value: 1.8,
      target: 1.0,
      unit: 's',
      status: 'warning',
      trend: 'stable',
      lastUpdated: new Date().toISOString(),
    },
    {
      category: 'Correlaciones Activas',
      name: 'Correlaciones Significativas',
      value: 87,
      target: 85,
      unit: '%',
      status: 'excellent',
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
    },
    {
      category: 'Optimización',
      name: 'Oportunidades Implementadas',
      value: 62,
      target: 80,
      unit: '%',
      status: 'warning',
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
    },
    {
      category: 'Predicción',
      name: 'Precisión Predictiva',
      value: 89.5,
      target: 85,
      unit: '%',
      status: 'excellent',
      trend: 'stable',
      lastUpdated: new Date().toISOString(),
    },
    {
      category: 'Automatización',
      name: 'Procesos Automatizados',
      value: 73,
      target: 90,
      unit: '%',
      status: 'good',
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
    },
  ];
};

// Collections
export const TIMEFRAME_COLLECTION = createListCollection({
  items: [
    { label: 'Última semana', value: 'weekly' },
    { label: 'Último mes', value: 'monthly' },
    { label: 'Último trimestre', value: 'quarterly' },
  ],
});

export const MODULE_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los módulos', value: 'all' },
    { label: 'Ventas', value: 'sales' },
    { label: 'Operaciones', value: 'operations' },
    { label: 'Materiales', value: 'materials' },
    { label: 'Clientes', value: 'customers' },
    { label: 'Personal', value: 'staff' },
    { label: 'Planificación', value: 'scheduling' },
  ],
});
