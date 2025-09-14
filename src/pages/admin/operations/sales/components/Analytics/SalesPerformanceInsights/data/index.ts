import { PerformanceMetrics } from '../types';

export const generatePerformanceInsights = (): PerformanceMetrics => {
  return {
    overall_score: 87,
    category_scores: {
      revenue: 92,
      efficiency: 78,
      customer: 85,
      operational: 83
    },
    insights: [
      {
        category: 'revenue',
        type: 'success',
        title: 'Revenue Growth Acceleration',
        description: 'Monthly revenue increased by 18.7% above target',
        value: '18.7%',
        trend: 'up',
        action_required: false,
        recommendation: 'Maintain current pricing strategy and expand successful menu items',
        impact: 'high'
      },
      {
        category: 'efficiency',
        type: 'warning',
        title: 'Peak Hour Bottleneck',
        description: 'Order fulfillment time increases by 40% during 7-9 PM',
        value: '23 min',
        trend: 'up',
        action_required: true,
        recommendation: 'Add 2 kitchen staff during peak hours and pre-prepare popular items',
        impact: 'medium'
      },
      {
        category: 'customer',
        type: 'opportunity',
        title: 'Customer Retention Opportunity',
        description: '23% of customers have only made one purchase',
        value: '23%',
        trend: 'stable',
        action_required: true,
        recommendation: 'Implement welcome-back campaign with 15% discount for second visit',
        impact: 'high'
      },
      {
        category: 'operational',
        type: 'critical',
        title: 'Inventory Waste Alert',
        description: 'Food waste has increased to 12% of total inventory',
        value: '12%',
        trend: 'up',
        action_required: true,
        recommendation: 'Implement dynamic pricing for items nearing expiration and improve demand forecasting',
        impact: 'high'
      },
      {
        category: 'revenue',
        type: 'opportunity',
        title: 'Upselling Potential',
        description: 'Only 34% of orders include appetizers or desserts',
        value: '34%',
        trend: 'stable',
        action_required: false,
        recommendation: 'Train staff on suggestive selling techniques and create combo deals',
        impact: 'medium'
      },
      {
        category: 'customer',
        type: 'success',
        title: 'Customer Satisfaction Peak',
        description: 'Customer satisfaction score reached 4.8/5 stars',
        value: '4.8/5',
        trend: 'up',
        action_required: false,
        recommendation: 'Leverage positive reviews for marketing and maintain service quality',
        impact: 'medium'
      }
    ],
    benchmarks: {
      industry_average: 72,
      top_performers: 94,
      your_position: 'strong'
    },
    recommendations: {
      immediate_actions: [
        'Add kitchen staff during 7-9 PM peak hours',
        'Launch customer retention campaign for one-time buyers',
        'Implement dynamic pricing for expiring inventory',
        'Create staff training program for upselling'
      ],
      strategic_initiatives: [
        'Develop predictive inventory management system',
        'Implement customer loyalty program with personalized offers',
        'Optimize menu engineering based on profitability analysis',
        'Expand delivery options to capture additional market share'
      ],
      long_term_goals: [
        'Achieve 95+ overall performance score',
        'Reduce food waste to under 5%',
        'Increase customer retention rate to 85%',
        'Expand to 2 additional locations within 18 months'
      ]
    }
  };
};
