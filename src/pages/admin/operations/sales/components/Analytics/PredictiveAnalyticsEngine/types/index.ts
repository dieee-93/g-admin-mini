export interface PredictiveMetrics {
  revenue_forecast: {
    next_7_days: number;
    next_30_days: number;
    next_quarter: number;
    confidence: number;
  };
  demand_forecasting: {
    top_items: Array<{
      item_name: string;
      predicted_demand: number;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  customer_insights: {
    churn_prediction: {
      at_risk_customers: number;
      churn_rate: number;
      prevention_opportunities: number;
    };
    lifetime_value: {
      average_clv: number;
      high_value_segments: number;
      growth_potential: number;
    };
  };
  operational_intelligence: {
    peak_times: Array<{
      day: string;
      hour: number;
      predicted_volume: number;
      recommended_staffing: number;
    }>;
    inventory_alerts: Array<{
      item: string;
      current_stock: number;
      predicted_demand: number;
      reorder_date: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
  };
  market_trends: {
    seasonal_patterns: {
      current_season: string;
      expected_change: number;
      recommendations: string[];
    };
    competitive_analysis: {
      market_position: string;
      price_optimization: number;
      competitive_advantages: string[];
    };
  };
}

export type Timeframe = 'week' | 'month' | 'quarter';
