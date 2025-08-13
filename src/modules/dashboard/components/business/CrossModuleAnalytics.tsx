import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button,
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
  NumberInput
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CogIcon,
  EyeIcon,
  DocumentChartBarIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Import event system
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// Cross-Module Analytics Interfaces
interface ModuleMetric {
  moduleId: string;
  moduleName: string;
  metricId: string;
  metricName: string;
  value: number;
  unit: string;
  category: 'financial' | 'operational' | 'customer' | 'inventory' | 'staff';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
}

interface CrossModuleCorrelation {
  id: string;
  metric1: ModuleMetric;
  metric2: ModuleMetric;
  correlationCoefficient: number; // -1 to 1
  correlationStrength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  correlationType: 'positive' | 'negative';
  significance: number; // 0-100% (statistical significance)
  businessInsight: string;
  actionableRecommendation?: string;
  impactScore: number; // 0-100
}

interface BusinessBottleneck {
  id: string;
  name: string;
  type: 'capacity' | 'process' | 'resource' | 'information' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedModules: string[];
  rootCause: string;
  symptoms: string[];
  estimatedImpact: {
    financial: number; // $ impact
    operational: number; // efficiency % loss
    customer: number; // satisfaction impact
  };
  recommendations: BottleneckRecommendation[];
  detectedAt: string;
  priority: number; // 1-10
}

interface BottleneckRecommendation {
  action: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  expectedImprovement: number; // percentage
  cost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface HolisticInsight {
  id: string;
  title: string;
  type: 'opportunity' | 'optimization' | 'risk' | 'trend' | 'pattern';
  scope: 'single_module' | 'cross_module' | 'enterprise_wide';
  confidence: number; // 0-100
  impact: 'very_high' | 'high' | 'medium' | 'low';
  description: string;
  involvedModules: string[];
  keyMetrics: string[];
  correlations: string[];
  businessValue: number; // estimated $ value
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeframe: string;
    resources: string[];
    dependencies: string[];
  };
  aiGenerated: boolean;
}

interface OptimizationOpportunity {
  id: string;
  name: string;
  category: 'cost_reduction' | 'revenue_increase' | 'efficiency_gain' | 'quality_improvement';
  currentState: {
    modules: string[];
    metrics: Record<string, number>;
    performance: number; // 0-100 score
  };
  optimizedState: {
    targetMetrics: Record<string, number>;
    expectedPerformance: number;
    estimatedTimeline: string;
  };
  benefits: {
    financial: number;
    operational: number;
    strategic: number;
  };
  requirements: {
    investment: number;
    effort: 'low' | 'medium' | 'high';
    risks: string[];
    prerequisites: string[];
  };
  feasibilityScore: number; // 0-100
  priorityScore: number; // 0-100
}

interface SystemHealthMetric {
  category: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

interface CrossModuleAnalyticsConfig {
  correlationThreshold: number; // minimum correlation to display
  significanceLevel: number; // statistical significance threshold
  analysisTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  autoRefreshEnabled: boolean;
  refreshInterval: number; // minutes
  alertThresholds: {
    correlationDrop: number;
    bottleneckSeverity: 'medium' | 'high' | 'critical';
    healthScore: number;
  };
}

// Mock data generators
const generateMockModuleMetrics = (): ModuleMetric[] => {
  const modules = [
    { id: 'sales', name: 'Ventas' },
    { id: 'operations', name: 'Operaciones' },
    { id: 'materials', name: 'Materiales' },
    { id: 'customers', name: 'Clientes' },
    { id: 'staff', name: 'Personal' },
    { id: 'scheduling', name: 'Planificación' }
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
    { id: 'attendance', name: 'Asistencia', unit: '%', category: 'staff' }
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
        value: metric.unit === '%' ? Math.min(100, Math.max(0, baseValue % 100)) : 
               metric.unit === '/5' ? Math.min(5, Math.max(1, baseValue % 5)) : baseValue,
        unit: metric.unit,
        category: metric.category as any,
        timestamp: new Date().toISOString(),
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
        change
      });
    });
  });

  return moduleMetrics;
};

const generateMockCorrelations = (metrics: ModuleMetric[]): CrossModuleCorrelation[] => {
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
      
      const strength = absCoeff > 0.8 ? 'very_strong' :
                      absCoeff > 0.6 ? 'strong' :
                      absCoeff > 0.4 ? 'moderate' : 'weak';
      
      correlations.push({
        id: `corr_${i}_${j}`,
        metric1,
        metric2,
        correlationCoefficient: coefficient,
        correlationStrength: strength as any,
        correlationType: coefficient > 0 ? 'positive' : 'negative',
        significance: Math.random() * 30 + 70, // 70-100%
        businessInsight: generateBusinessInsight(metric1, metric2, coefficient),
        actionableRecommendation: Math.random() > 0.5 ? generateActionableRecommendation(metric1, metric2, coefficient) : undefined,
        impactScore: Math.floor(absCoeff * 100)
      });
    }
    
    if (correlations.length >= 12) break; // Limit for demo
  }
  
  return correlations.slice(0, 12);
};

const generateBusinessInsight = (metric1: ModuleMetric, metric2: ModuleMetric, correlation: number): string => {
  const direction = correlation > 0 ? 'aumenta' : 'disminuye';
  const strength = Math.abs(correlation) > 0.7 ? 'fuertemente' : Math.abs(correlation) > 0.5 ? 'moderadamente' : 'ligeramente';
  
  return `Cuando ${metric1.metricName} de ${metric1.moduleName} ${direction}, ${metric2.metricName} de ${metric2.moduleName} tiende a ${direction} ${strength}.`;
};

const generateActionableRecommendation = (metric1: ModuleMetric, metric2: ModuleMetric, correlation: number): string => {
  const recommendations = [
    `Optimizar la coordinación entre ${metric1.moduleName} y ${metric2.moduleName}`,
    `Implementar alertas cruzadas para ${metric1.metricName} y ${metric2.metricName}`,
    `Establecer KPIs combinados que aprovechen esta correlación`,
    `Crear workflows automatizados basados en esta relación`
  ];
  
  return recommendations[Math.floor(Math.random() * recommendations.length)];
};

const generateMockBottlenecks = (): BusinessBottleneck[] => {
  return [
    {
      id: 'bottleneck_1',
      name: 'Tiempo de Preparación en Cocina',
      type: 'capacity',
      severity: 'high',
      affectedModules: ['operations', 'sales', 'customers'],
      rootCause: 'Proceso de preparación no optimizado y falta de coordinación entre estaciones',
      symptoms: [
        'Órdenes con tiempo de espera > 15 minutos',
        'Baja satisfacción del cliente (4.2/5)',
        'Acumulación de órdenes en horas pico'
      ],
      estimatedImpact: {
        financial: -2500,
        operational: -15,
        customer: -8
      },
      recommendations: [
        {
          action: 'Implementar sistema de gestión de colas inteligente',
          effort: 'medium',
          timeframe: '4-6 semanas',
          expectedImprovement: 25,
          cost: 3000,
          riskLevel: 'low'
        },
        {
          action: 'Rediseñar layout de cocina para mejor flujo',
          effort: 'high',
          timeframe: '8-12 semanas',
          expectedImprovement: 35,
          cost: 8000,
          riskLevel: 'medium'
        }
      ],
      detectedAt: new Date().toISOString(),
      priority: 8
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
        'Tiempo perdido en gestión manual de pedidos'
      ],
      estimatedImpact: {
        financial: -1800,
        operational: -10,
        customer: -5
      },
      recommendations: [
        {
          action: 'Implementar sistema de reordenamiento automático',
          effort: 'medium',
          timeframe: '6-8 semanas',
          expectedImprovement: 40,
          cost: 2500,
          riskLevel: 'low'
        }
      ],
      detectedAt: new Date().toISOString(),
      priority: 6
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
        'Decisiones basadas en datos desactualizados'
      ],
      estimatedImpact: {
        financial: -1200,
        operational: -8,
        customer: -3
      },
      recommendations: [
        {
          action: 'Implementar event-driven architecture completa',
          effort: 'high',
          timeframe: '10-14 semanas',
          expectedImprovement: 50,
          cost: 5000,
          riskLevel: 'medium'
        }
      ],
      detectedAt: new Date().toISOString(),
      priority: 7
    }
  ];
};

const generateMockHolisticInsights = (): HolisticInsight[] => {
  return [
    {
      id: 'insight_1',
      title: 'Oportunidad de Optimización Integral de Eficiencia',
      type: 'opportunity',
      scope: 'enterprise_wide',
      confidence: 89,
      impact: 'very_high',
      description: 'Análisis cruzado identifica potencial de 23% de mejora en eficiencia general a través de sincronización de operaciones, materiales y personal.',
      involvedModules: ['operations', 'materials', 'staff', 'scheduling'],
      keyMetrics: ['efficiency', 'utilization', 'productivity', 'cost'],
      correlations: ['operations-materials', 'staff-scheduling', 'efficiency-cost'],
      businessValue: 15000,
      implementation: {
        complexity: 'high',
        timeframe: '12-16 semanas',
        resources: ['Operations Manager', 'IT Team', 'Process Analyst'],
        dependencies: ['System Integration', 'Staff Training', 'Process Redesign']
      },
      aiGenerated: true
    },
    {
      id: 'insight_2',
      title: 'Patrón de Demanda Cross-Temporal Detectado',
      type: 'pattern',
      scope: 'cross_module',
      confidence: 84,
      impact: 'high',
      description: 'Los datos muestran correlación fuerte entre satisfacción del cliente y eficiencia operacional con lag de 2-3 días, sugiriendo oportunidades de predicción.',
      involvedModules: ['customers', 'operations', 'sales'],
      keyMetrics: ['satisfaction', 'efficiency', 'revenue'],
      correlations: ['customer-operations', 'satisfaction-revenue'],
      businessValue: 8500,
      implementation: {
        complexity: 'medium',
        timeframe: '6-8 semanas',
        resources: ['Data Analyst', 'Customer Success Manager'],
        dependencies: ['Data Pipeline', 'Predictive Model']
      },
      aiGenerated: true
    },
    {
      id: 'insight_3',
      title: 'Riesgo de Cascada en Calidad de Servicio',
      type: 'risk',
      scope: 'cross_module',
      confidence: 76,
      impact: 'medium',
      description: 'Degradación en inventario está correlacionada con caída en satisfacción del cliente 48h después. Necesario sistema de alerta temprana.',
      involvedModules: ['materials', 'customers', 'operations'],
      keyMetrics: ['waste', 'satisfaction', 'quality'],
      correlations: ['materials-quality', 'quality-satisfaction'],
      businessValue: 5200,
      implementation: {
        complexity: 'medium',
        timeframe: '4-6 semanas',
        resources: ['Quality Manager', 'Inventory Manager'],
        dependencies: ['Real-time Monitoring', 'Alert System']
      },
      aiGenerated: true
    }
  ];
};

const generateMockSystemHealth = (): SystemHealthMetric[] => {
  return [
    {
      category: 'Integración de Datos',
      name: 'Sincronización Cross-Module',
      value: 94.2,
      target: 98,
      unit: '%',
      status: 'good',
      trend: 'improving',
      lastUpdated: new Date().toISOString()
    },
    {
      category: 'Flujo de Información',
      name: 'Latencia de Eventos',
      value: 1.8,
      target: 1.0,
      unit: 's',
      status: 'warning',
      trend: 'stable',
      lastUpdated: new Date().toISOString()
    },
    {
      category: 'Correlaciones Activas',
      name: 'Correlaciones Significativas',
      value: 87,
      target: 85,
      unit: '%',
      status: 'excellent',
      trend: 'improving',
      lastUpdated: new Date().toISOString()
    },
    {
      category: 'Optimización',
      name: 'Oportunidades Implementadas',
      value: 62,
      target: 80,
      unit: '%',
      status: 'warning',
      trend: 'improving',
      lastUpdated: new Date().toISOString()
    },
    {
      category: 'Predicción',
      name: 'Precisión Predictiva',
      value: 89.5,
      target: 85,
      unit: '%',
      status: 'excellent',
      trend: 'stable',
      lastUpdated: new Date().toISOString()
    },
    {
      category: 'Automatización',
      name: 'Procesos Automatizados',
      value: 73,
      target: 90,
      unit: '%',
      status: 'good',
      trend: 'improving',
      lastUpdated: new Date().toISOString()
    }
  ];
};

// Collections
const TIMEFRAME_COLLECTION = createListCollection({
  items: [
    { label: 'Última semana', value: 'weekly' },
    { label: 'Último mes', value: 'monthly' },
    { label: 'Último trimestre', value: 'quarterly' }
  ]
});

const MODULE_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los módulos', value: 'all' },
    { label: 'Ventas', value: 'sales' },
    { label: 'Operaciones', value: 'operations' },
    { label: 'Materiales', value: 'materials' },
    { label: 'Clientes', value: 'customers' },
    { label: 'Personal', value: 'staff' },
    { label: 'Planificación', value: 'scheduling' }
  ]
});

// Component
export function CrossModuleAnalytics() {
  // State
  const [metrics, setMetrics] = useState<ModuleMetric[]>([]);
  const [correlations, setCorrelations] = useState<CrossModuleCorrelation[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BusinessBottleneck[]>([]);
  const [insights, setInsights] = useState<HolisticInsight[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'correlations' | 'bottlenecks' | 'insights' | 'optimization'>('overview');
  const [config, setConfig] = useState<CrossModuleAnalyticsConfig>({
    correlationThreshold: 0.5,
    significanceLevel: 80,
    analysisTimeframe: 'monthly',
    autoRefreshEnabled: true,
    refreshInterval: 15,
    alertThresholds: {
      correlationDrop: 0.3,
      bottleneckSeverity: 'high',
      healthScore: 80
    }
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedModule, setSelectedModule] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const mockMetrics = generateMockModuleMetrics();
        const mockCorrelations = generateMockCorrelations(mockMetrics);
        const mockBottlenecks = generateMockBottlenecks();
        const mockInsights = generateMockHolisticInsights();
        const mockSystemHealth = generateMockSystemHealth();
        
        setMetrics(mockMetrics);
        setCorrelations(mockCorrelations);
        setBottlenecks(mockBottlenecks);
        setInsights(mockInsights);
        setSystemHealth(mockSystemHealth);
        
      } catch (error) {
        console.error('Error loading cross-module analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedTimeframe]);

  // Filtered data
  const filteredCorrelations = useMemo(() => {
    let filtered = correlations.filter(corr => 
      Math.abs(corr.correlationCoefficient) >= config.correlationThreshold &&
      corr.significance >= config.significanceLevel
    );
    
    if (selectedModule !== 'all') {
      filtered = filtered.filter(corr => 
        corr.metric1.moduleId === selectedModule || 
        corr.metric2.moduleId === selectedModule
      );
    }
    
    return filtered.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));
  }, [correlations, config.correlationThreshold, config.significanceLevel, selectedModule]);

  // Analytics summary
  const analyticsSummary = useMemo(() => {
    if (metrics.length === 0) return null;
    
    const totalMetrics = metrics.length;
    const activeCorrelations = filteredCorrelations.length;
    const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical').length;
    const highImpactInsights = insights.filter(i => i.impact === 'very_high' || i.impact === 'high').length;
    
    const overallSystemHealth = systemHealth.reduce((sum, metric) => {
      const score = metric.status === 'excellent' ? 100 : 
                   metric.status === 'good' ? 80 : 
                   metric.status === 'warning' ? 60 : 40;
      return sum + score;
    }, 0) / systemHealth.length;
    
    return {
      totalMetrics,
      activeCorrelations,
      criticalBottlenecks,
      highImpactInsights,
      overallSystemHealth: Math.round(overallSystemHealth),
      healthStatus: overallSystemHealth > 90 ? 'excellent' : 
                   overallSystemHealth > 75 ? 'good' : 
                   overallSystemHealth > 60 ? 'warning' : 'critical'
    };
  }, [metrics, filteredCorrelations, bottlenecks, insights, systemHealth]);

  // Run deep analysis
  const runDeepAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Generate additional insights
      const newInsights = [...insights];
      if (Math.random() > 0.5) {
        newInsights.push({
          id: `insight_new_${Date.now()}`,
          title: 'Nueva Oportunidad Detectada por Análisis Profundo',
          type: 'optimization',
          scope: 'cross_module',
          confidence: 85 + Math.random() * 10,
          impact: 'high',
          description: 'Análisis avanzado revela nueva correlación entre módulos con potencial de optimización.',
          involvedModules: ['sales', 'operations'],
          keyMetrics: ['efficiency', 'revenue'],
          correlations: ['sales-operations'],
          businessValue: Math.floor(Math.random() * 10000) + 5000,
          implementation: {
            complexity: 'medium',
            timeframe: '4-8 semanas',
            resources: ['Business Analyst', 'Operations Manager'],
            dependencies: ['Process Review', 'System Updates']
          },
          aiGenerated: true
        });
      }
      
      setInsights(newInsights);
      
      // Emit analysis event
      await EventBus.emit(RestaurantEvents.DATA_SYNCED, {
        type: 'cross_module_analysis_completed',
        metricsAnalyzed: metrics.length,
        correlationsFound: filteredCorrelations.length,
        bottlenecksDetected: bottlenecks.length,
        insightsGenerated: newInsights.length - insights.length,
        systemHealthScore: analyticsSummary?.overallSystemHealth || 0
      }, 'CrossModuleAnalytics');
      
    } catch (error) {
      console.error('Error running deep analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [metrics, filteredCorrelations, bottlenecks, insights, analyticsSummary]);

  // Get correlation strength color
  const getCorrelationColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'purple';
      case 'strong': return 'blue';
      case 'moderate': return 'green';
      case 'weak': return 'yellow';
      default: return 'gray';
    }
  };

  // Get bottleneck severity color
  const getBottleneckColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  // Get system health color
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'warning': return 'yellow';
      default: return 'red';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="80px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {Array.from({ length: 4 }).map((_, i) => (
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
              <Text fontSize="3xl" fontWeight="bold">🔍 Cross-Module Analytics</Text>
              <Text color="gray.600">
                Análisis holístico y correlaciones entre módulos para optimización integral del negocio
              </Text>
            </VStack>
            
            <HStack gap={2}>
              <Select.Root
                collection={TIMEFRAME_COLLECTION}
                value={[selectedTimeframe]}
                onValueChange={(details) => setSelectedTimeframe(details.value[0])}
                width="150px"
                size="sm"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Período" />
                </Select.Trigger>
                <Select.Content>
                  {TIMEFRAME_COLLECTION.items.map(item => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Button 
                size="sm"
                colorPalette="purple"
                onClick={runDeepAnalysis}
                loading={isAnalyzing}
                loadingText="Analizando..."
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Análisis Profundo
              </Button>
              
              <IconButton size="sm" variant="outline">
                <CogIcon className="w-4 h-4" />
              </IconButton>
            </HStack>
          </HStack>

          {/* System Health Banner */}
          {analyticsSummary && (
            <Card.Root variant="outline" bg={`${getHealthColor(analyticsSummary.healthStatus)}.50`} w="full">
              <Card.Body p={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <HStack gap={2}>
                      <Text fontSize="lg" fontWeight="bold" color={`${getHealthColor(analyticsSummary.healthStatus)}.700`}>
                        🏥 Salud del Sistema: {analyticsSummary.healthStatus === 'excellent' ? 'Excelente' :
                                             analyticsSummary.healthStatus === 'good' ? 'Buena' :
                                             analyticsSummary.healthStatus === 'warning' ? 'Advertencia' : 'Crítica'}
                      </Text>
                      <Badge colorPalette={getHealthColor(analyticsSummary.healthStatus)}>
                        {analyticsSummary.overallSystemHealth}/100
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {analyticsSummary.totalMetrics} métricas • {analyticsSummary.activeCorrelations} correlaciones activas • {analyticsSummary.highImpactInsights} insights de alto impacto
                    </Text>
                  </VStack>
                  
                  <Progress 
                    value={analyticsSummary.overallSystemHealth} 
                    colorPalette={getHealthColor(analyticsSummary.healthStatus)}
                    size="lg"
                    width="200px"
                  />
                </HStack>
              </Card.Body>
            </Card.Root>
          )}

          {/* Quick Stats */}
          {analyticsSummary && (
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
              <Card.Root variant="subtle" bg="blue.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {analyticsSummary.totalMetrics}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Métricas Cross-Module</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="purple.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {analyticsSummary.activeCorrelations}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Correlaciones Activas</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="orange.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    {bottlenecks.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Cuellos de Botella</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="green.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {analyticsSummary.highImpactInsights}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Insights Alto Impacto</Text>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          )}
        </VStack>

        {/* Main Content Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="overview">
              <HStack gap={2}>
                <PuzzlePieceIcon className="w-4 h-4" />
                <Text>Resumen</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="correlations">
              <HStack gap={2}>
                <ArrowsRightLeftIcon className="w-4 h-4" />
                <Text>Correlaciones</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="bottlenecks">
              <HStack gap={2}>
                <ExclamationTriangleIcon className="w-4 h-4" />
                <Text>Cuellos de Botella</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="insights">
              <HStack gap={2}>
                <LightBulbIcon className="w-4 h-4" />
                <Text>Insights Holísticos</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="optimization">
              <HStack gap={2}>
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <Text>Optimización</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            {/* Overview Tab */}
            <Tabs.Content value="overview">
              <VStack gap={6} align="stretch">
                {/* System Health Grid */}
                <Card.Root variant="outline">
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="bold">📊 Salud del Sistema por Categoría</Text>
                  </Card.Header>
                  <Card.Body>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                      {systemHealth.map((metric, index) => (
                        <Card.Root key={index} variant="subtle" size="sm">
                          <Card.Body p={4}>
                            <VStack gap={2} align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="medium">
                                  {metric.name}
                                </Text>
                                <Badge colorPalette={getHealthColor(metric.status)} size="xs">
                                  {metric.status === 'excellent' ? 'Excelente' :
                                   metric.status === 'good' ? 'Bueno' :
                                   metric.status === 'warning' ? 'Advertencia' : 'Crítico'}
                                </Badge>
                              </HStack>
                              
                              <HStack justify="space-between">
                                <Text fontSize="lg" fontWeight="bold" color={`${getHealthColor(metric.status)}.600`}>
                                  {metric.value}{metric.unit}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Meta: {metric.target}{metric.unit}
                                </Text>
                              </HStack>
                              
                              <Progress 
                                value={metric.unit === 's' ? Math.max(0, 100 - (metric.value / metric.target * 100)) : (metric.value / metric.target * 100)} 
                                colorPalette={getHealthColor(metric.status)}
                                size="sm"
                              />
                              
                              <HStack justify="space-between" fontSize="xs" color="gray.600">
                                <Text>{metric.category}</Text>
                                <Text>
                                  {metric.trend === 'improving' ? '📈' : 
                                   metric.trend === 'declining' ? '📉' : '➡️'} 
                                  {metric.trend}
                                </Text>
                              </HStack>
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>

                {/* Top Correlations Summary */}
                <Card.Root variant="outline">
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="bold">🔗 Top Correlaciones Cross-Module</Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={3} align="stretch">
                      {filteredCorrelations.slice(0, 5).map((correlation) => (
                        <Card.Root key={correlation.id} variant="subtle" size="sm">
                          <Card.Body p={3}>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" gap={1} flex="1">
                                <HStack gap={2}>
                                  <Badge colorPalette="blue" size="xs">
                                    {correlation.metric1.moduleName}
                                  </Badge>
                                  <ArrowsRightLeftIcon className="w-3 h-3 text-gray-400" />
                                  <Badge colorPalette="purple" size="xs">
                                    {correlation.metric2.moduleName}
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm" fontWeight="medium">
                                  {correlation.metric1.metricName} ↔ {correlation.metric2.metricName}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {correlation.businessInsight}
                                </Text>
                              </VStack>
                              
                              <VStack align="end" gap={1}>
                                <Badge colorPalette={getCorrelationColor(correlation.correlationStrength)}>
                                  {(correlation.correlationCoefficient * 100).toFixed(0)}%
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                  {Math.round(correlation.significance)}% sig.
                                </Text>
                              </VStack>
                            </HStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </VStack>
                  </Card.Body>
                </Card.Root>

                {/* Critical Bottlenecks */}
                {bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'high').length > 0 && (
                  <Card.Root variant="outline">
                    <Card.Header>
                      <Text fontSize="lg" fontWeight="bold">⚠️ Cuellos de Botella Críticos</Text>
                    </Card.Header>
                    <Card.Body>
                      <VStack gap={3} align="stretch">
                        {bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'high').map((bottleneck) => (
                          <Alert.Root key={bottleneck.id} status="warning" variant="subtle">
                            <Alert.Indicator>
                              <ExclamationTriangleIcon className="w-5 h-5" />
                            </Alert.Indicator>
                            <VStack align="start" gap={1} flex="1">
                              <Alert.Title>
                                {bottleneck.name}
                              </Alert.Title>
                              <Alert.Description>
                                {bottleneck.rootCause}
                              </Alert.Description>
                              <HStack gap={4} fontSize="xs" color="gray.600">
                                <Text>Impacto financiero: ${Math.abs(bottleneck.estimatedImpact.financial)}</Text>
                                <Text>Módulos afectados: {bottleneck.affectedModules.length}</Text>
                                <Badge colorPalette={getBottleneckColor(bottleneck.severity)} size="xs">
                                  {bottleneck.severity}
                                </Badge>
                              </HStack>
                            </VStack>
                          </Alert.Root>
                        ))}
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                )}
              </VStack>
            </Tabs.Content>

            {/* Correlations Tab */}
            <Tabs.Content value="correlations">
              <VStack gap={4} align="stretch">
                {/* Filters */}
                <HStack gap={4} flexWrap="wrap">
                  <Select.Root
                    collection={MODULE_COLLECTION}
                    value={[selectedModule]}
                    onValueChange={(details) => setSelectedModule(details.value[0])}
                    width="200px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Módulo" />
                    </Select.Trigger>
                    <Select.Content>
                      {MODULE_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  
                  <HStack gap={2} align="center">
                    <Text fontSize="sm" color="gray.600">Correlación mínima:</Text>
                    <NumberInput.Root
                      value={config.correlationThreshold.toString()}
                      onValueChange={(details) => setConfig({
                        ...config, 
                        correlationThreshold: parseFloat(details.value) || 0.5
                      })}
                      min={0}
                      max={1}
                      step={0.1}
                      width="80px"
                      size="sm"
                    >
                      <NumberInput.Field />
                    </NumberInput.Root>
                  </HStack>
                </HStack>

                {/* Correlations Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  {filteredCorrelations.map((correlation) => (
                    <Card.Root key={correlation.id} variant="outline">
                      <Card.Body p={4}>
                        <VStack gap={3} align="stretch">
                          {/* Header */}
                          <HStack justify="space-between">
                            <HStack gap={2}>
                              <Badge colorPalette="blue" size="sm">
                                {correlation.metric1.moduleName}
                              </Badge>
                              <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400" />
                              <Badge colorPalette="purple" size="sm">
                                {correlation.metric2.moduleName}
                              </Badge>
                            </HStack>
                            <Badge colorPalette={getCorrelationColor(correlation.correlationStrength)}>
                              {correlation.correlationStrength}
                            </Badge>
                          </HStack>

                          {/* Metrics */}
                          <VStack gap={2} align="stretch">
                            <Text fontSize="sm" fontWeight="medium">
                              {correlation.metric1.metricName} ↔ {correlation.metric2.metricName}
                            </Text>
                            
                            <HStack justify="space-between" bg="gray.50" p={2} borderRadius="sm" fontSize="sm">
                              <VStack align="start" gap={0}>
                                <Text color="gray.600">Coeficiente:</Text>
                                <Text fontWeight="bold" color={correlation.correlationType === 'positive' ? 'green.600' : 'red.600'}>
                                  {correlation.correlationCoefficient.toFixed(3)}
                                </Text>
                              </VStack>
                              <VStack align="center" gap={0}>
                                <Text color="gray.600">Significancia:</Text>
                                <Text fontWeight="bold">{Math.round(correlation.significance)}%</Text>
                              </VStack>
                              <VStack align="end" gap={0}>
                                <Text color="gray.600">Impacto:</Text>
                                <Text fontWeight="bold" color="blue.600">{correlation.impactScore}/100</Text>
                              </VStack>
                            </HStack>
                          </VStack>

                          {/* Business Insight */}
                          <VStack gap={2} align="stretch">
                            <Text fontSize="sm" color="gray.700">
                              {correlation.businessInsight}
                            </Text>
                            {correlation.actionableRecommendation && (
                              <Card.Root variant="subtle" size="sm">
                                <Card.Body p={2}>
                                  <HStack gap={2}>
                                    <LightBulbIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <Text fontSize="xs" color="blue.700">
                                      {correlation.actionableRecommendation}
                                    </Text>
                                  </HStack>
                                </Card.Body>
                              </Card.Root>
                            )}
                          </VStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </SimpleGrid>
              </VStack>
            </Tabs.Content>

            {/* Bottlenecks Tab */}
            <Tabs.Content value="bottlenecks">
              <VStack gap={4} align="stretch">
                {bottlenecks.map((bottleneck) => (
                  <Card.Root key={bottleneck.id} variant="outline">
                    <Card.Header>
                      <HStack justify="space-between">
                        <HStack gap={3}>
                          <Box p={2} bg={`${getBottleneckColor(bottleneck.severity)}.100`} borderRadius="md">
                            <ExclamationTriangleIcon className={`w-5 h-5 text-${getBottleneckColor(bottleneck.severity)}-600`} />
                          </Box>
                          <VStack align="start" gap={0}>
                            <Text fontSize="lg" fontWeight="bold">{bottleneck.name}</Text>
                            <HStack gap={2}>
                              <Badge colorPalette={getBottleneckColor(bottleneck.severity)}>
                                {bottleneck.severity}
                              </Badge>
                              <Badge colorPalette="gray" size="sm">
                                {bottleneck.type}
                              </Badge>
                              <Badge colorPalette="blue" size="sm">
                                Prioridad: {bottleneck.priority}/10
                              </Badge>
                            </HStack>
                          </VStack>
                        </HStack>
                      </HStack>
                    </Card.Header>
                    
                    <Card.Body>
                      <VStack gap={4} align="stretch">
                        {/* Description */}
                        <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                          <Text as="span" fontWeight="medium">Causa raíz:</Text> {bottleneck.rootCause}
                        </Text>

                        {/* Symptoms */}
                        <VStack gap={2} align="stretch">
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Síntomas detectados:</Text>
                          <VStack gap={1} align="stretch" pl={3}>
                            {bottleneck.symptoms.map((symptom, index) => (
                              <HStack key={index} gap={2}>
                                <Box w="4px" h="4px" bg="red.400" borderRadius="full" mt={1} />
                                <Text fontSize="sm" color="gray.600">{symptom}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </VStack>

                        {/* Impact */}
                        <SimpleGrid columns={3} gap={4} bg="gray.50" p={3} borderRadius="md">
                          <VStack>
                            <Text fontSize="xs" color="gray.600">Impacto Financiero</Text>
                            <Text fontSize="sm" fontWeight="bold" color="red.600">
                              ${Math.abs(bottleneck.estimatedImpact.financial)}
                            </Text>
                          </VStack>
                          <VStack>
                            <Text fontSize="xs" color="gray.600">Pérdida Operacional</Text>
                            <Text fontSize="sm" fontWeight="bold" color="orange.600">
                              -{Math.abs(bottleneck.estimatedImpact.operational)}%
                            </Text>
                          </VStack>
                          <VStack>
                            <Text fontSize="xs" color="gray.600">Impacto Cliente</Text>
                            <Text fontSize="sm" fontWeight="bold" color="yellow.600">
                              -{Math.abs(bottleneck.estimatedImpact.customer)}%
                            </Text>
                          </VStack>
                        </SimpleGrid>

                        {/* Affected Modules */}
                        <HStack gap={2} align="center">
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Módulos afectados:</Text>
                          <HStack gap={1}>
                            {bottleneck.affectedModules.map((moduleId, index) => (
                              <Badge key={index} colorPalette="blue" size="sm">
                                {moduleId}
                              </Badge>
                            ))}
                          </HStack>
                        </HStack>

                        {/* Recommendations */}
                        <VStack gap={2} align="stretch">
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Recomendaciones:</Text>
                          <VStack gap={2} align="stretch">
                            {bottleneck.recommendations.map((rec, index) => (
                              <Card.Root key={index} variant="subtle" size="sm">
                                <Card.Body p={3}>
                                  <VStack gap={2} align="stretch">
                                    <Text fontSize="sm" fontWeight="medium">{rec.action}</Text>
                                    <HStack gap={4} fontSize="xs" color="gray.600">
                                      <Text>Esfuerzo: {rec.effort}</Text>
                                      <Text>Tiempo: {rec.timeframe}</Text>
                                      <Text>Mejora: +{rec.expectedImprovement}%</Text>
                                      <Text>Costo: ${rec.cost}</Text>
                                      <Badge colorPalette={rec.riskLevel === 'low' ? 'green' : rec.riskLevel === 'medium' ? 'yellow' : 'red'} size="xs">
                                        Riesgo {rec.riskLevel}
                                      </Badge>
                                    </HStack>
                                  </VStack>
                                </Card.Body>
                              </Card.Root>
                            ))}
                          </VStack>
                        </VStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Holistic Insights Tab */}
            <Tabs.Content value="insights">
              <VStack gap={4} align="stretch">
                {insights.map((insight) => (
                  <Card.Root key={insight.id} variant="outline">
                    <Card.Header>
                      <HStack justify="space-between">
                        <HStack gap={3}>
                          <Box p={2} bg="purple.100" borderRadius="md">
                            <LightBulbIcon className="w-5 h-5 text-purple-600" />
                          </Box>
                          <VStack align="start" gap={0}>
                            <Text fontSize="lg" fontWeight="bold">{insight.title}</Text>
                            <HStack gap={2}>
                              <Badge colorPalette="purple">
                                {insight.type}
                              </Badge>
                              <Badge colorPalette="blue" size="sm">
                                {insight.scope === 'enterprise_wide' ? 'Empresa' : 
                                 insight.scope === 'cross_module' ? 'Cross-Module' : 'Módulo'}
                              </Badge>
                              {insight.aiGenerated && (
                                <Badge colorPalette="green" size="sm">
                                  🤖 IA
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                        
                        <VStack align="end" gap={0}>
                          <Text fontSize="sm" fontWeight="bold" color="purple.600">
                            {insight.confidence}% confianza
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Valor: ${insight.businessValue.toLocaleString()}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card.Header>
                    
                    <Card.Body>
                      <VStack gap={4} align="stretch">
                        <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                          {insight.description}
                        </Text>

                        {/* Involved Modules */}
                        <HStack gap={2} align="center">
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Módulos involucrados:</Text>
                          <HStack gap={1}>
                            {insight.involvedModules.map((moduleId, index) => (
                              <Badge key={index} colorPalette="blue" size="sm">
                                {moduleId}
                              </Badge>
                            ))}
                          </HStack>
                        </HStack>

                        {/* Key Metrics */}
                        <HStack gap={2} align="center">
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Métricas clave:</Text>
                          <HStack gap={1}>
                            {insight.keyMetrics.map((metric, index) => (
                              <Badge key={index} colorPalette="green" size="sm">
                                {metric}
                              </Badge>
                            ))}
                          </HStack>
                        </HStack>

                        {/* Implementation Details */}
                        <Card.Root variant="subtle" size="sm">
                          <Card.Body p={3}>
                            <VStack gap={3} align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="medium">Plan de Implementación</Text>
                                <Badge colorPalette={insight.implementation.complexity === 'low' ? 'green' : insight.implementation.complexity === 'medium' ? 'yellow' : 'red'}>
                                  {insight.implementation.complexity}
                                </Badge>
                              </HStack>
                              
                              <SimpleGrid columns={2} gap={3} fontSize="xs">
                                <VStack align="start" gap={1}>
                                  <Text color="gray.600">Timeline:</Text>
                                  <Text fontWeight="medium">{insight.implementation.timeframe}</Text>
                                </VStack>
                                <VStack align="start" gap={1}>
                                  <Text color="gray.600">Recursos:</Text>
                                  <VStack align="start" gap={0}>
                                    {insight.implementation.resources.map((resource, index) => (
                                      <Text key={index}>{resource}</Text>
                                    ))}
                                  </VStack>
                                </VStack>
                              </SimpleGrid>
                              
                              {insight.implementation.dependencies.length > 0 && (
                                <VStack align="start" gap={1}>
                                  <Text fontSize="xs" color="gray.600">Dependencias:</Text>
                                  <HStack gap={1} flexWrap="wrap">
                                    {insight.implementation.dependencies.map((dep, index) => (
                                      <Badge key={index} colorPalette="gray" size="xs">
                                        {dep}
                                      </Badge>
                                    ))}
                                  </HStack>
                                </VStack>
                              )}
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Optimization Tab */}
            <Tabs.Content value="optimization">
              <Card.Root variant="subtle">
                <Card.Body p={8} textAlign="center">
                  <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <Text fontSize="lg" fontWeight="medium" mb={2}>
                    Optimización Avanzada
                  </Text>
                  <Text color="gray.600">
                    Panel de optimización integral con simulaciones de escenarios y recomendaciones automatizadas.
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    * Funcionalidad avanzada disponible en versión completa
                  </Text>
                </Card.Body>
              </Card.Root>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}