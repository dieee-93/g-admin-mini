import type { AdvancedSalesAnalytics } from '../types';

export const generateMockAnalytics = (): AdvancedSalesAnalytics => {
  return {
    revenue: {
      total: 89750.50,
      daily: 2980.25,
      weekly: 18650.00,
      monthly: 67500.75,
      growth: 15.8
    },
    orders: {
      total: 1247,
      average_order_value: 71.95,
      conversion_rate: 87.3,
      fulfillment_time: 16
    },
    customers: {
      total_unique: 892,
      returning_customers: 579,
      new_customers: 313,
      retention_rate: 72.4
    },
    performance: {
      top_selling_items: [
        { name: 'Pasta Carbonara', quantity: 145, revenue: 3625.00 },
        { name: 'Margherita Pizza', quantity: 128, revenue: 2560.00 },
        { name: 'Caesar Salad', quantity: 96, revenue: 1440.00 },
        { name: 'Grilled Salmon', quantity: 87, revenue: 2175.00 },
        { name: 'Tiramisu', quantity: 75, revenue: 675.00 }
      ],
      peak_hours: [
        { hour: 19, orders: 89, revenue: 6405.50 },
        { hour: 20, orders: 76, revenue: 5472.00 },
        { hour: 13, orders: 65, revenue: 4225.25 }
      ],
      efficiency_score: 91,
      profit_margin: 34.7
    },
    predictions: {
      next_week_revenue: 21447.50,
      customer_lifetime_value: 612.08,
      inventory_alerts: 5,
      seasonal_trends: 'Peak dinner hours showing 18% growth'
    }
  };
};
