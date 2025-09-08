import type { Sale } from '../../../../types';

export interface AdvancedSalesAnalytics {
  revenue: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    growth: number;
  };
  orders: {
    total: number;
    average_order_value: number;
    conversion_rate: number;
    fulfillment_time: number;
  };
  customers: {
    total_unique: number;
    returning_customers: number;
    new_customers: number;
    retention_rate: number;
  };
  performance: {
    top_selling_items: Array<{ name: string; quantity: number; revenue: number }>;
    peak_hours: Array<{ hour: number; orders: number; revenue: number }>;
    efficiency_score: number;
    profit_margin: number;
  };
  predictions: {
    next_week_revenue: number;
    customer_lifetime_value: number;
    inventory_alerts: number;
    seasonal_trends: string;
  };
}

export type DateRange = 'today' | 'week' | 'month' | 'year';
