// Business Analytics Types
export interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface SalesAnalytics {
  revenue: BusinessMetric;
  orders: BusinessMetric;
  average_order_value: BusinessMetric;
  conversion_rate: BusinessMetric;
  top_products: ProductPerformance[];
  revenue_by_channel: ChannelRevenue[];
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  revenue: number;
  quantity_sold: number;
  profit_margin: number;
  growth_rate: number;
}

export interface ChannelRevenue {
  channel: 'dine_in' | 'takeout' | 'delivery' | 'online';
  revenue: number;
  percentage: number;
  orders: number;
}

export interface CustomerInsights {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_lifetime_value: number;
  churn_rate: number;
  satisfaction_score: number;
}