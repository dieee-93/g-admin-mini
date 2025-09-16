// Mock data for Cross-Module Analytics
import { createListCollection } from '@chakra-ui/react';
import type {
  ModuleMetric,
  CrossModuleCorrelation,
  BusinessBottleneck,
  HolisticInsight,
  SystemHealthMetric
} from './CrossModuleAnalytics';

// Collection item type
interface CollectionItem {
  label: string;
  value: string;
}

// Collections for selects
export const TIMEFRAME_COLLECTION = createListCollection({
  items: [
    { label: 'Último día', value: 'daily' },
    { label: 'Última semana', value: 'weekly' },
    { label: 'Último mes', value: 'monthly' },
    { label: 'Último trimestre', value: 'quarterly' },
    { label: 'Último año', value: 'yearly' }
  ] as CollectionItem[]
});

export const MODULE_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los módulos', value: 'all' },
    { label: 'Materiales', value: 'materials' },
    { label: 'Ventas', value: 'sales' },
    { label: 'Inventario', value: 'inventory' },
    { label: 'Operaciones', value: 'operations' },
    { label: 'Clientes', value: 'customers' },
    { label: 'Proveedores', value: 'suppliers' },
    { label: 'Personal', value: 'staff' },
    { label: 'Finanzas', value: 'finance' }
  ] as CollectionItem[]
});

// Mock data generators
export const generateMockModuleMetrics = (): ModuleMetric[] => {
  const modules = ['materials', 'sales', 'inventory', 'operations', 'customers', 'suppliers', 'staff', 'finance'];
  const trends = ['up', 'down', 'stable'] as const;
  
  const metrics: ModuleMetric[] = [];
  
  modules.forEach(moduleId => {
    const moduleMetrics = [
      {
        moduleId,
        moduleName: getModuleName(moduleId),
        metricId: `${moduleId}_revenue`,
        metricName: 'Revenue',
        value: Math.floor(Math.random() * 100000) + 10000,
        unit: '$',
        category: 'financial' as const,
        timestamp: new Date().toISOString(),
        trend: trends[Math.floor(Math.random() * trends.length)],
        change: (Math.random() - 0.5) * 30
      },
      {
        moduleId,
        moduleName: getModuleName(moduleId),
        metricId: `${moduleId}_efficiency`,
        metricName: 'Efficiency',
        value: Math.floor(Math.random() * 40) + 60,
        unit: '%',
        category: 'operational' as const,
        timestamp: new Date().toISOString(),
        trend: trends[Math.floor(Math.random() * trends.length)],
        change: (Math.random() - 0.5) * 20
      },
      {
        moduleId,
        moduleName: getModuleName(moduleId),
        metricId: `${moduleId}_satisfaction`,
        metricName: 'Customer Satisfaction',
        value: Math.floor(Math.random() * 30) + 70,
        unit: 'score',
        category: 'customer' as const,
        timestamp: new Date().toISOString(),
        trend: trends[Math.floor(Math.random() * trends.length)],
        change: (Math.random() - 0.5) * 15
      }
    ];
    
    metrics.push(...moduleMetrics);
  });
  
  return metrics;
};

export const generateMockCorrelations = (metrics: ModuleMetric[]): CrossModuleCorrelation[] => {
  const correlations: CrossModuleCorrelation[] = [];
  
  // Generate correlations between different modules
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const metric1 = metrics[i];
      const metric2 = metrics[j];
      
      // Only correlate metrics from different modules
      if (metric1.moduleId !== metric2.moduleId && Math.random() > 0.7) {
        const coefficient = (Math.random() - 0.5) * 2; // -1 to 1
        const strength = Math.abs(coefficient) > 0.8 ? 'very_strong' :
                        Math.abs(coefficient) > 0.6 ? 'strong' :
                        Math.abs(coefficient) > 0.4 ? 'moderate' :
                        Math.abs(coefficient) > 0.2 ? 'weak' : 'very_weak';
        
        correlations.push({
          id: `corr_${metric1.moduleId}_${metric2.moduleId}_${Date.now()}_${Math.random()}`,
          metric1,
          metric2,
          correlationCoefficient: coefficient,
          correlationStrength: strength,
          correlationType: coefficient > 0 ? 'positive' : 'negative',
          significance: Math.floor(Math.random() * 40) + 60,
          businessInsight: generateBusinessInsight(metric1, metric2, coefficient),
          actionableRecommendation: Math.random() > 0.6 ? generateRecommendation(metric1, metric2) : undefined,
          impactScore: Math.floor(Math.random() * 50) + 50
        });
      }
    }
  }
  
  return correlations.slice(0, 15); // Limit to 15 correlations
};

export const generateMockBottlenecks = (): BusinessBottleneck[] => {
  const bottlenecks: BusinessBottleneck[] = [
    {
      id: 'bottleneck_1',
      name: 'Capacity Constraint in Production',
      type: 'capacity',
      severity: 'high',
      affectedModules: ['materials', 'operations', 'sales'],
      rootCause: 'Limited production capacity during peak demand periods',
      symptoms: [
        'Increased lead times',
        'Backlog accumulation',
        'Customer complaints about delays',
        'Overtime costs rising'
      ],
      estimatedImpact: {
        financial: -25000,
        operational: -15,
        customer: -10
      },
      recommendations: [
        {
          action: 'Invest in additional production equipment',
          effort: 'high',
          timeframe: '3-6 months',
          expectedImprovement: 25,
          cost: 75000,
          riskLevel: 'medium'
        },
        {
          action: 'Implement demand forecasting system',
          effort: 'medium',
          timeframe: '2-3 months',
          expectedImprovement: 15,
          cost: 15000,
          riskLevel: 'low'
        }
      ],
      detectedAt: new Date().toISOString(),
      priority: 8
    },
    {
      id: 'bottleneck_2',
      name: 'Information Silos Between Departments',
      type: 'information',
      severity: 'medium',
      affectedModules: ['sales', 'operations', 'customers'],
      rootCause: 'Lack of integrated communication systems between departments',
      symptoms: [
        'Duplicate data entry',
        'Inconsistent customer information',
        'Delayed response times',
        'Poor coordination'
      ],
      estimatedImpact: {
        financial: -12000,
        operational: -20,
        customer: -8
      },
      recommendations: [
        {
          action: 'Implement integrated CRM system',
          effort: 'medium',
          timeframe: '1-2 months',
          expectedImprovement: 30,
          cost: 25000,
          riskLevel: 'low'
        }
      ],
      detectedAt: new Date().toISOString(),
      priority: 6
    },
    {
      id: 'bottleneck_3',
      name: 'Quality Control Process Inefficiency',
      type: 'quality',
      severity: 'critical',
      affectedModules: ['materials', 'operations'],
      rootCause: 'Manual quality control processes causing delays and errors',
      symptoms: [
        'High defect rates',
        'Rework cycles',
        'Customer returns',
        'Quality inspection bottlenecks'
      ],
      estimatedImpact: {
        financial: -45000,
        operational: -25,
        customer: -20
      },
      recommendations: [
        {
          action: 'Automate quality control processes',
          effort: 'high',
          timeframe: '4-6 months',
          expectedImprovement: 40,
          cost: 85000,
          riskLevel: 'medium'
        },
        {
          action: 'Train staff on quality procedures',
          effort: 'low',
          timeframe: '2-4 weeks',
          expectedImprovement: 15,
          cost: 5000,
          riskLevel: 'low'
        }
      ],
      detectedAt: new Date().toISOString(),
      priority: 9
    }
  ];
  
  return bottlenecks;
};

export const generateMockHolisticInsights = (): HolisticInsight[] => {
  const insights: HolisticInsight[] = [
    {
      id: 'insight_1',
      title: 'Cross-Module Revenue Optimization Opportunity',
      type: 'opportunity',
      scope: 'cross_module',
      confidence: 87,
      impact: 'very_high',
      description: 'Analysis reveals strong correlation between material quality metrics and customer satisfaction scores. Improving material standards could significantly boost revenue.',
      involvedModules: ['materials', 'customers', 'sales'],
      keyMetrics: ['material_quality', 'customer_satisfaction', 'revenue'],
      correlations: ['materials-customers', 'customers-sales'],
      businessValue: 85000,
      implementation: {
        complexity: 'medium',
        timeframe: '3-4 months',
        resources: ['Quality Manager', 'Sales Team', 'Data Analyst'],
        dependencies: ['Quality System Upgrade', 'Training Program']
      },
      aiGenerated: true
    },
    {
      id: 'insight_2',
      title: 'Inventory Optimization Pattern',
      type: 'pattern',
      scope: 'cross_module',
      confidence: 92,
      impact: 'high',
      description: 'Seasonal patterns in sales data suggest optimal inventory levels could reduce holding costs by 20% while maintaining service levels.',
      involvedModules: ['inventory', 'sales', 'finance'],
      keyMetrics: ['inventory_turnover', 'sales_volume', 'holding_costs'],
      correlations: ['sales-inventory', 'inventory-finance'],
      businessValue: 45000,
      implementation: {
        complexity: 'low',
        timeframe: '4-6 weeks',
        resources: ['Inventory Manager', 'Sales Analyst'],
        dependencies: ['Sales Forecasting Model']
      },
      aiGenerated: false
    },
    {
      id: 'insight_3',
      title: 'Customer Lifecycle Value Enhancement',
      type: 'optimization',
      scope: 'enterprise_wide',
      confidence: 78,
      impact: 'very_high',
      description: 'Integration of customer service metrics with sales and operations data reveals opportunities to increase customer lifetime value through targeted service improvements.',
      involvedModules: ['customers', 'sales', 'operations', 'finance'],
      keyMetrics: ['customer_lifetime_value', 'service_quality', 'retention_rate'],
      correlations: ['customers-sales', 'operations-customers'],
      businessValue: 120000,
      implementation: {
        complexity: 'high',
        timeframe: '6-8 months',
        resources: ['Customer Success Manager', 'Operations Director', 'Data Science Team'],
        dependencies: ['Customer Data Platform', 'Service Level Agreements', 'Performance Metrics']
      },
      aiGenerated: true
    },
    {
      id: 'insight_4',
      title: 'Operational Efficiency Risk',
      type: 'risk',
      scope: 'cross_module',
      confidence: 85,
      impact: 'high',
      description: 'Declining correlation between staff productivity and operational efficiency suggests potential burnout or process degradation that could impact long-term performance.',
      involvedModules: ['staff', 'operations', 'finance'],
      keyMetrics: ['staff_productivity', 'operational_efficiency', 'employee_satisfaction'],
      correlations: ['staff-operations'],
      businessValue: -35000,
      implementation: {
        complexity: 'medium',
        timeframe: '2-3 months',
        resources: ['HR Manager', 'Operations Manager', 'Wellness Coordinator'],
        dependencies: ['Employee Survey', 'Process Review', 'Training Budget']
      },
      aiGenerated: true
    }
  ];
  
  return insights;
};

export const generateMockSystemHealth = (): SystemHealthMetric[] => {
  const categories = [
    'Performance',
    'Reliability',
    'Security',
    'Integration',
    'User Experience',
    'Data Quality',
    'Process Efficiency',
    'Resource Utilization'
  ];
  
  const trends = ['improving', 'stable', 'declining'] as const;
  
  return categories.map((category) => {
    const value = Math.floor(Math.random() * 40) + 60; // 60-100
    const target = Math.floor(Math.random() * 20) + 80; // 80-100
    const status = value >= 90 ? 'excellent' :
                  value >= 75 ? 'good' :
                  value >= 60 ? 'warning' : 'critical';
    
    return {
      category,
      name: category,
      value,
      target,
      unit: category === 'Performance' ? 's' : category === 'Resource Utilization' ? '%' : 'score',
      status,
      trend: trends[Math.floor(Math.random() * trends.length)],
      lastUpdated: new Date().toISOString()
    };
  });
};

// Helper functions
function getModuleName(moduleId: string): string {
  const names: Record<string, string> = {
    materials: 'Materiales',
    sales: 'Ventas',
    inventory: 'Inventario',
    operations: 'Operaciones',
    customers: 'Clientes',
    suppliers: 'Proveedores',
    staff: 'Personal',
    finance: 'Finanzas'
  };
  return names[moduleId] || moduleId;
}

function generateBusinessInsight(metric1: ModuleMetric, metric2: ModuleMetric, coefficient: number): string {
  const relationship = coefficient > 0 ? 'positiva' : 'negativa';
  const strength = Math.abs(coefficient) > 0.7 ? 'fuerte' : 
                  Math.abs(coefficient) > 0.5 ? 'moderada' : 'débil';
  
  return `Correlación ${relationship} ${strength} entre ${metric1.metricName} de ${metric1.moduleName} y ${metric2.metricName} de ${metric2.moduleName}. Esto sugiere que las mejoras en una métrica pueden impactar la otra.`;
}

function generateRecommendation(metric1: ModuleMetric, metric2: ModuleMetric): string {
  const recommendations = [
    `Considere optimizar ${metric1.metricName} para mejorar ${metric2.metricName}`,
    `Implemente métricas conjuntas para ${metric1.moduleName} y ${metric2.moduleName}`,
    `Alinee los equipos de ${metric1.moduleName} y ${metric2.moduleName} para maximizar sinergias`,
    `Establezca objetivos coordinados entre ${metric1.moduleName} y ${metric2.moduleName}`
  ];
  
  return recommendations[Math.floor(Math.random() * recommendations.length)];
}