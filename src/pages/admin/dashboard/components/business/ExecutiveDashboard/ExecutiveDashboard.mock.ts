import {
  createListCollection,
} from '@chakra-ui/react';
import type { ExecutiveKPI, StrategicInsight, ExecutiveSummary } from './ExecutiveDashboard';

// Mock data generators
export const generateMockExecutiveKPIs = (): ExecutiveKPI[] => {
  const baseDate = new Date().toISOString();
  
  return [
    // Financial KPIs
    {
      id: 'revenue',
      name: 'Revenue',
      value: 125000,
      unit: '$',
      change: 15.2,
      changeType: 'increase',
      target: 130000,
      category: 'financial',
      trend: 'up',
      priority: 'critical',
      description: 'Total revenue for the current period',
      lastUpdated: baseDate
    },
    {
      id: 'profit_margin',
      name: 'Profit Margin',
      value: 18.5,
      unit: '%',
      change: 2.3,
      changeType: 'increase',
      target: 20,
      category: 'financial',
      trend: 'up',
      priority: 'critical',
      description: 'Net profit margin percentage',
      lastUpdated: baseDate
    },
    {
      id: 'costs',
      name: 'Operating Costs',
      value: 85000,
      unit: '$',
      change: -5.1,
      changeType: 'decrease',
      target: 80000,
      category: 'financial',
      trend: 'down',
      priority: 'high',
      description: 'Total operating expenses',
      lastUpdated: baseDate
    },
    
    // Operational KPIs
    {
      id: 'efficiency',
      name: 'Operational Efficiency',
      value: 87.3,
      unit: '%',
      change: 4.2,
      changeType: 'increase',
      target: 90,
      category: 'operational',
      trend: 'up',
      priority: 'high',
      description: 'Overall operational efficiency score',
      lastUpdated: baseDate
    },
    {
      id: 'avg_order_time',
      name: 'Average Order Time',
      value: 12.5,
      unit: 'min',
      change: -8.3,
      changeType: 'decrease',
      target: 10,
      category: 'operational',
      trend: 'down',
      priority: 'medium',
      description: 'Average time from order to delivery',
      lastUpdated: baseDate
    },
    {
      id: 'kitchen_utilization',
      name: 'Kitchen Utilization',
      value: 78.9,
      unit: '%',
      change: 3.1,
      changeType: 'increase',
      target: 85,
      category: 'operational',
      trend: 'up',
      priority: 'medium',
      description: 'Kitchen capacity utilization rate',
      lastUpdated: baseDate
    },
    
    // Customer KPIs
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      value: 4.6,
      unit: '/5',
      change: 0.3,
      changeType: 'increase',
      target: 4.8,
      category: 'customer',
      trend: 'up',
      priority: 'critical',
      description: 'Average customer satisfaction rating',
      lastUpdated: baseDate
    },
    {
      id: 'customer_retention',
      name: 'Customer Retention',
      value: 68.4,
      unit: '%',
      change: 5.7,
      changeType: 'increase',
      target: 75,
      category: 'customer',
      trend: 'up',
      priority: 'high',
      description: 'Customer retention rate',
      lastUpdated: baseDate
    },
    {
      id: 'avg_order_value',
      name: 'Average Order Value',
      value: 24.50,
      unit: '$',
      change: 7.8,
      changeType: 'increase',
      target: 28,
      category: 'customer',
      trend: 'up',
      priority: 'medium',
      description: 'Average value per customer order',
      lastUpdated: baseDate
    },
    
    // Strategic KPIs
    {
      id: 'market_share',
      name: 'Local Market Share',
      value: 15.2,
      unit: '%',
      change: 1.8,
      changeType: 'increase',
      target: 20,
      category: 'strategic',
      trend: 'up',
      priority: 'high',
      description: 'Estimated local market share',
      lastUpdated: baseDate
    },
    {
      id: 'innovation_index',
      name: 'Innovation Index',
      value: 7.2,
      unit: '/10',
      change: 0.5,
      changeType: 'increase',
      target: 8,
      category: 'strategic',
      trend: 'up',
      priority: 'medium',
      description: 'Innovation and adaptation score',
      lastUpdated: baseDate
    },
    {
      id: 'sustainability_score',
      name: 'Sustainability Score',
      value: 73,
      unit: '/100',
      change: 8.2,
      changeType: 'increase',
      target: 80,
      category: 'strategic',
      trend: 'up',
      priority: 'medium',
      description: 'Environmental and social responsibility score',
      lastUpdated: baseDate
    }
  ];
};

export const generateMockStrategicInsights = (): StrategicInsight[] => {
  return [
    {
      id: 'insight_1',
      title: 'Revenue Growth Acceleration Opportunity',
      type: 'opportunity',
      priority: 'critical',
      impact: 'very_high',
      confidence: 92,
      description: 'Analysis indicates strong potential for 25% revenue growth through menu optimization and strategic pricing adjustments. Customer data shows willingness to pay premium for quality.',
      metrics: [
        { name: 'Potential Revenue Increase', value: '25%', trend: 'positive' },
        { name: 'Customer Price Sensitivity', value: 'Low', trend: 'positive' },
        { name: 'Menu Optimization Score', value: '8.2/10', trend: 'positive' }
      ],
      actionItems: [
        {
          id: 'action_1',
          description: 'Implement dynamic pricing for high-demand items',
          owner: 'Revenue Manager',
          priority: 'high',
          estimatedImpact: '+15% revenue',
          estimatedEffort: '2 weeks',
          deadline: '2025-09-01',
          status: 'pending'
        },
        {
          id: 'action_2',
          description: 'Launch premium product line',
          owner: 'Product Manager',
          priority: 'medium',
          estimatedImpact: '+10% revenue',
          estimatedEffort: '4 weeks',
          status: 'pending'
        }
      ],
      timeline: '3-6 months',
      category: 'revenue',
      aiGenerated: true
    },
    {
      id: 'insight_2',
      title: 'Cost Optimization Through Supply Chain Intelligence',
      type: 'recommendation',
      priority: 'high',
      impact: 'high',
      confidence: 87,
      description: 'Supply chain analysis reveals 12% cost reduction opportunity through strategic supplier partnerships and inventory optimization.',
      metrics: [
        { name: 'Potential Cost Savings', value: '12%', trend: 'positive' },
        { name: 'Inventory Turnover', value: '6.2x', trend: 'positive' },
        { name: 'Supplier Efficiency', value: '78%', trend: 'neutral' }
      ],
      actionItems: [
        {
          id: 'action_3',
          description: 'Negotiate bulk purchasing agreements with top 3 suppliers',
          owner: 'Procurement Manager',
          priority: 'urgent',
          estimatedImpact: '-8% costs',
          estimatedEffort: '3 weeks',
          status: 'in_progress'
        },
        {
          id: 'action_4',
          description: 'Implement automated inventory reordering system',
          owner: 'Operations Manager',
          priority: 'high',
          estimatedImpact: '-4% costs',
          estimatedEffort: '6 weeks',
          status: 'pending'
        }
      ],
      timeline: '2-4 months',
      category: 'costs',
      aiGenerated: true
    },
    {
      id: 'insight_3',
      title: 'Customer Experience Enhancement Impact',
      type: 'trend',
      priority: 'high',
      impact: 'high',
      confidence: 84,
      description: 'Customer satisfaction trends show strong correlation with order accuracy and wait times. 10% improvement in these metrics could increase retention by 15%.',
      metrics: [
        { name: 'Satisfaction-Retention Correlation', value: '0.89', trend: 'positive' },
        { name: 'Order Accuracy', value: '94.2%', trend: 'positive' },
        { name: 'Average Wait Time', value: '12.5 min', change: '-8.3%', trend: 'positive' }
      ],
      actionItems: [
        {
          id: 'action_5',
          description: 'Deploy real-time order tracking system',
          owner: 'Technology Manager',
          priority: 'high',
          estimatedImpact: '+15% retention',
          estimatedEffort: '4 weeks',
          status: 'pending'
        }
      ],
      timeline: '1-3 months',
      category: 'customer',
      aiGenerated: true
    },
    {
      id: 'insight_4',
      title: 'Competitive Positioning Risk',
      type: 'risk',
      priority: 'medium',
      impact: 'medium',
      confidence: 76,
      description: 'Market analysis shows increased competitive pressure in premium segment. Need to strengthen differentiation to maintain market position.',
      metrics: [
        { name: 'Competitive Pressure Index', value: '7.2/10', trend: 'negative' },
        { name: 'Price Competitiveness', value: '92%', trend: 'neutral' },
        { name: 'Brand Differentiation', value: '6.8/10', trend: 'neutral' }
      ],
      actionItems: [
        {
          id: 'action_6',
          description: 'Develop unique value proposition strategy',
          owner: 'Marketing Manager',
          priority: 'medium',
          estimatedImpact: 'Brand strength +20%',
          estimatedEffort: '8 weeks',
          status: 'pending'
        }
      ],
      timeline: '6-12 months',
      category: 'market',
      aiGenerated: true
    }
  ];
};

export const generateMockExecutiveSummary = (): ExecutiveSummary => {
  return {
    period: 'August 2025',
    overallPerformance: 'good',
    keyHighlights: [
      'Revenue increased 15.2% compared to previous period',
      'Customer satisfaction reached 4.6/5, highest in 6 months',
      'Operational efficiency improved by 4.2%',
      'Successfully reduced operating costs by 5.1%'
    ],
    keyConcerns: [
      'Average order time still above target (12.5 min vs 10 min target)',
      'Market share growth slowing down',
      'Kitchen utilization below optimal levels'
    ],
    strategicRecommendations: [
      'Accelerate digital transformation initiatives',
      'Invest in staff training for efficiency improvements',
      'Expand premium product offerings',
      'Strengthen supplier relationships for cost optimization'
    ],
    financialHealth: {
      score: 87,
      revenue: { value: 125000, change: 15.2, trend: 'up' },
      profitability: { value: 18.5, change: 2.3, trend: 'up' },
      costs: { value: 85000, change: -5.1, trend: 'down' },
      cashFlow: { value: 23000, change: 12.8, trend: 'up' }
    },
    operationalEfficiency: {
      score: 82,
      efficiency: { value: 87.3, change: 4.2, trend: 'up' },
      quality: { value: 94.2, change: 1.8, trend: 'up' },
      productivity: { value: 89.1, change: 3.5, trend: 'up' },
      utilization: { value: 78.9, change: 3.1, trend: 'up' }
    },
    marketPosition: {
      score: 78,
      customerSatisfaction: { value: 4.6, change: 6.5, trend: 'up' },
      marketShare: { value: 15.2, change: 1.8, trend: 'up' },
      competitivePosition: { value: 7.2, change: 0.5, trend: 'up' },
      brandStrength: { value: 73, change: 8.2, trend: 'up' }
    }
  };
};

// Collections
export const PERIOD_COLLECTION = createListCollection({
  items: [
    { label: 'Última semana', value: 'weekly' },
    { label: 'Último mes', value: 'monthly' },
    { label: 'Último trimestre', value: 'quarterly' },
    { label: 'Año actual', value: 'yearly' }
  ]
});

export const KPI_CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Financiero', value: 'financial' },
    { label: 'Operacional', value: 'operational' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Estratégico', value: 'strategic' }
  ]
});
