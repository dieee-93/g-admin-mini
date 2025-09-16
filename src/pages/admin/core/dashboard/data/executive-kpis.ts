// Copied from src/pages/admin/core/dashboard/components/ExecutiveDashboard/types/index.ts
export interface ExecutiveKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  changeType: 'increase' | 'decrease';
  target?: number;
  category: 'financial' | 'operational' | 'customer' | 'strategic';
  trend: 'up' | 'down' | 'stable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lastUpdated: string;
}

// Copied from src/pages/admin/core/dashboard/data/mockData.ts
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
