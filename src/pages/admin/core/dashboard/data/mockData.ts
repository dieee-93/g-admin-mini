// Centralized mock data for all dashboard modules
// This consolidates all mock data previously scattered across multiple files

import type {
  ExecutiveKPI,
  StrategicInsight,
  ExecutiveSummary,
  PerformanceCorrelation
} from '../types';

// === EXECUTIVE DASHBOARD MOCK DATA ===
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
    }
  ];
};

export const generateMockExecutiveSummary = (): ExecutiveSummary => {
  return {
    period: 'September 2025',
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

export const generateMockPerformanceCorrelations = (): PerformanceCorrelation[] => {
  return [
    {
      metric1: 'Customer Satisfaction',
      metric2: 'Order Accuracy',
      correlationStrength: 0.89,
      insight: 'Strong positive correlation between order accuracy and customer satisfaction',
      businessImplication: 'Improving order accuracy by 1% could increase satisfaction by 0.89%',
      confidence: 92
    },
    {
      metric1: 'Revenue',
      metric2: 'Average Order Value',
      correlationStrength: 0.76,
      insight: 'Revenue growth strongly tied to order value increases',
      businessImplication: 'Focus on upselling strategies to boost revenue',
      confidence: 88
    },
    {
      metric1: 'Operating Costs',
      metric2: 'Kitchen Utilization',
      correlationStrength: -0.67,
      insight: 'Higher kitchen utilization reduces per-unit costs',
      businessImplication: 'Optimizing kitchen schedules could reduce costs by 8-12%',
      confidence: 83
    }
  ];
};

// === PREDICTIVE ANALYTICS MOCK DATA ===
export const generateMockPredictiveData = () => {
  return {
    demandForecasting: {
      nextWeekPrediction: {
        totalOrders: 287,
        peakHours: '18:00-20:00',
        confidence: 87,
        topProducts: [
          { name: 'Pizza Margherita', predictedDemand: 45, confidence: 92 },
          { name: 'Pasta Bolognese', predictedDemand: 38, confidence: 89 },
          { name: 'Caesar Salad', predictedDemand: 32, confidence: 85 }
        ]
      },
      seasonalTrends: [
        { period: 'Weekend', multiplier: 1.4, confidence: 94 },
        { period: 'Lunch Hours', multiplier: 0.8, confidence: 91 },
        { period: 'Holidays', multiplier: 2.1, confidence: 76 }
      ]
    },
    inventoryOptimization: {
      reorderRecommendations: [
        { item: 'Tomatoes', currentStock: 12, recommendedOrder: 50, urgency: 'high' },
        { item: 'Mozzarella', currentStock: 8, recommendedOrder: 25, urgency: 'medium' },
        { item: 'Basil', currentStock: 5, recommendedOrder: 15, urgency: 'low' }
      ],
      wasteReduction: {
        potentialSavings: 1240,
        topWasteItems: ['Lettuce', 'Bread', 'Milk'],
        optimizationScore: 78
      }
    }
  };
};

// === COMPETITIVE INTELLIGENCE MOCK DATA ===
export const generateMockCompetitiveData = () => {
  return {
    competitors: [
      {
        id: 'comp_1',
        name: 'Restaurant A',
        type: 'direct' as const,
        category: 'Italian Restaurant',
        location: {
          address: '123 Main St',
          distance: 2.5,
          zone: 'Downtown'
        },
        businessMetrics: {
          estimatedRevenue: 450000,
          marketShare: 12.3,
          customerBase: 2500,
          operatingHours: '11:00-23:00',
          deliveryRadius: 5,
          averageTicket: 28.50
        },
        menuAnalysis: {
          totalItems: 45,
          categories: ['Pasta', 'Pizza', 'Salads', 'Desserts'],
          priceRange: { min: 8, max: 35, average: 22 },
          uniqueItems: 12,
          seasonalItems: 5
        },
        pricingIntelligence: [],
        performance: {
          customerRating: 4.2,
          reviewCount: 245,
          responseTime: 15,
          deliveryTime: 35,
          popularityTrend: 'stable' as const,
          marketPosition: 'challenger' as const
        },
        digitalPresence: {
          website: true,
          socialMedia: { instagram: 5200, facebook: 8400, tiktok: 1200 },
          onlineOrdering: true,
          deliveryApps: ['Uber Eats', 'DoorDash'],
          marketingBudget: 25000
        },
        analysis: {
          strengths: ['Location', 'Speed', 'Delivery'],
          weaknesses: ['Quality', 'Variety', 'Ambiance'],
          opportunities: ['Catering', 'Premium offerings'],
          threats: ['New competitors', 'Rising costs']
        },
        lastUpdated: new Date().toISOString(),
        dataQuality: 85
      },
      {
        id: 'comp_2',
        name: 'Restaurant B',
        type: 'direct' as const,
        category: 'Fine Dining',
        location: {
          address: '456 Oak Ave',
          distance: 3.2,
          zone: 'Uptown'
        },
        businessMetrics: {
          estimatedRevenue: 680000,
          marketShare: 8.7,
          customerBase: 1800,
          operatingHours: '17:00-24:00',
          deliveryRadius: 3,
          averageTicket: 65.00
        },
        menuAnalysis: {
          totalItems: 32,
          categories: ['Gourmet', 'Wine', 'Desserts'],
          priceRange: { min: 25, max: 95, average: 58 },
          uniqueItems: 18,
          seasonalItems: 12
        },
        pricingIntelligence: [],
        performance: {
          customerRating: 4.5,
          reviewCount: 189,
          responseTime: 10,
          deliveryTime: 45,
          popularityTrend: 'up' as const,
          marketPosition: 'leader' as const
        },
        digitalPresence: {
          website: true,
          socialMedia: { instagram: 12000, facebook: 15000, tiktok: 3500 },
          onlineOrdering: false,
          deliveryApps: [],
          marketingBudget: 45000
        },
        analysis: {
          strengths: ['Quality', 'Ambiance', 'Service'],
          weaknesses: ['Price', 'Speed', 'Limited delivery'],
          opportunities: ['Online expansion', 'Events'],
          threats: ['Economic downturn', 'Competition']
        },
        lastUpdated: new Date().toISOString(),
        dataQuality: 92
      }
    ],
    marketTrends: [
      {
        id: 'trend_1',
        category: 'Plant-based options',
        trend: 'growing' as const,
        growthRate: 23,
        timeframe: 'year' as const,
        description: 'Increasing demand for vegan and vegetarian options',
        impact: 'high' as const,
        opportunity: 'Expand plant-based menu offerings',
        recommendedActions: ['Add 5-7 plant-based dishes', 'Partner with local suppliers'],
        dataPoints: []
      },
      {
        id: 'trend_2',
        category: 'Delivery optimization',
        trend: 'growing' as const,
        growthRate: 18,
        timeframe: 'quarter' as const,
        description: 'Focus on faster delivery times and better packaging',
        impact: 'medium' as const,
        opportunity: 'Improve delivery infrastructure',
        recommendedActions: ['Optimize delivery routes', 'Upgrade packaging'],
        dataPoints: []
      },
      {
        id: 'trend_3',
        category: 'Sustainability focus',
        trend: 'growing' as const,
        growthRate: 15,
        timeframe: 'year' as const,
        description: 'Customers prefer eco-friendly practices',
        impact: 'high' as const,
        opportunity: 'Implement sustainable practices',
        recommendedActions: ['Use biodegradable packaging', 'Source locally'],
        dataPoints: []
      }
    ]
  };
};

// === CUSTOM REPORTING MOCK DATA ===
export const generateMockReportingData = () => {
  return {
    templates: [
      {
        id: 'template_1',
        name: 'Monthly Performance Report',
        category: 'financial',
        usage: 23,
        lastUsed: '2025-09-06'
      },
      {
        id: 'template_2',
        name: 'Inventory Status Report',
        category: 'operational',
        usage: 31,
        lastUsed: '2025-09-08'
      }
    ],
    generatedReports: [
      {
        id: 'report_1',
        title: 'Q3 Sales Analysis',
        createdDate: '2025-09-01',
        status: 'completed',
        format: 'PDF'
      },
      {
        id: 'report_2',
        title: 'Weekly Inventory Report',
        createdDate: '2025-09-08',
        status: 'processing',
        format: 'Excel'
      }
    ]
  };
};