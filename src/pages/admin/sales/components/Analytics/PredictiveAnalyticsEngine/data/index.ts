import type { PredictiveMetrics } from '../types';

export const generatePredictiveAnalytics = (): PredictiveMetrics => {
  return {
    revenue_forecast: {
      next_7_days: 24750.50,
      next_30_days: 102480.25,
      next_quarter: 315600.75,
      confidence: 87.3
    },
    demand_forecasting: {
      top_items: [
        { item_name: 'Pasta Carbonara', predicted_demand: 156, confidence: 92, trend: 'up' },
        { item_name: 'Margherita Pizza', predicted_demand: 134, confidence: 89, trend: 'stable' },
        { item_name: 'Caesar Salad', predicted_demand: 98, confidence: 85, trend: 'up' },
        { item_name: 'Grilled Salmon', predicted_demand: 87, confidence: 78, trend: 'down' },
        { item_name: 'Tiramisu', predicted_demand: 76, confidence: 94, trend: 'up' }
      ]
    },
    customer_insights: {
      churn_prediction: {
        at_risk_customers: 23,
        churn_rate: 8.7,
        prevention_opportunities: 18
      },
      lifetime_value: {
        average_clv: 687.45,
        high_value_segments: 3,
        growth_potential: 23.5
      }
    },
    operational_intelligence: {
      peak_times: [
        { day: 'Friday', hour: 19, predicted_volume: 89, recommended_staffing: 8 },
        { day: 'Saturday', hour: 20, predicted_volume: 95, recommended_staffing: 9 },
        { day: 'Sunday', hour: 13, predicted_volume: 76, recommended_staffing: 6 }
      ],
      inventory_alerts: [
        { item: 'Premium Olive Oil', current_stock: 12, predicted_demand: 45, reorder_date: '2024-08-10', urgency: 'high' },
        { item: 'Fresh Basil', current_stock: 8, predicted_demand: 28, reorder_date: '2024-08-12', urgency: 'medium' },
        { item: 'Parmesan Cheese', current_stock: 25, predicted_demand: 67, reorder_date: '2024-08-15', urgency: 'low' }
      ]
    },
    market_trends: {
      seasonal_patterns: {
        current_season: 'Summer',
        expected_change: 15.8,
        recommendations: [
          'Increase cold beverage inventory',
          'Promote outdoor seating options',
          'Add seasonal fruit-based desserts'
        ]
      },
      competitive_analysis: {
        market_position: 'Strong',
        price_optimization: 12.5,
        competitive_advantages: [
          'Superior ingredient quality',
          'Faster service times',
          'Strong customer loyalty'
        ]
      }
    }
  };
};
