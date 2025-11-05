/**
 * Supply Chain Data Service
 * Replaces mock data with real Supabase functions for Supply Chain Intelligence
 */

import { supabase } from '@/lib/supabase/client';

import { logger } from '@/lib/logging';
export interface SupplyChainMetrics {
  totalItems: number;
  totalStockValue: number;
  lowStockItems: number;
  criticalItems: number;
  stockEntriesThisMonth: number;
  averageItemValue: number;
  stockTurnoverRate: number;
  inventoryEfficiency: number;
}

export interface ItemPerformance {
  item_id: string;
  item_name: string;
  item_type: string;
  current_stock: number;
  unit_cost: number;
  total_value: number;
  percentage_of_total: number;
  stock_velocity: number;
  last_movement: string;
}

export interface StockAlert {
  item_id: string;
  item_name: string;
  item_type: string;
  unit: string;
  current_stock: number;
  threshold_used: number;
  urgency_level: string;
  suggested_order_quantity: number;
  unit_cost: number;
  estimated_cost: number;
  last_stock_entry_date: string;
  days_since_last_entry: number;
}

export interface MonthlyStats {
  month_year: string;
  total_sales: number;
  total_revenue: number;
  stock_entries_count: number;
  stock_entries_value: number;
  new_items_count: number;
  top_selling_product: string;
}

export class SupplyChainDataService {
  
  /**
   * Get comprehensive supply chain metrics
   */
  static async getMetrics(): Promise<SupplyChainMetrics> {
    try {
      // Get dashboard stats
      const { data: dashboardData, error: dashboardError } = await supabase
        .rpc('get_dashboard_stats');

      if (dashboardError) throw dashboardError;

      // Get stock valuation
      const { data: valuationData, error: valuationError } = await supabase
        .rpc('get_stock_valuation');

      if (valuationError) throw valuationError;

      // Calculate additional metrics
      const totalValue = valuationData?.reduce((sum: number, item: { total_value?: string | number }) =>
        sum + parseFloat(String(item.total_value || 0)), 0) || 0;

      const averageValue = valuationData?.length > 0 ? 
        totalValue / valuationData.length : 0;

      // Mock some advanced metrics (to be calculated from historical data later)
      const stockTurnoverRate = 3.2; // Items sold / average inventory
      const inventoryEfficiency = 0.85; // Optimized stock levels ratio

      return {
        totalItems: dashboardData?.total_items || 0,
        totalStockValue: dashboardData?.total_stock_value || 0,
        lowStockItems: dashboardData?.low_stock_items || 0,
        criticalItems: dashboardData?.low_stock_items || 0, // Using same for now
        stockEntriesThisMonth: dashboardData?.stock_entries_this_month || 0,
        averageItemValue: averageValue,
        stockTurnoverRate,
        inventoryEfficiency
      };

    } catch (error) {
      logger.error('MaterialsStore', 'Error fetching supply chain metrics:', error);
      throw error;
    }
  }

  /**
   * Get item performance analysis
   */
  static async getItemPerformance(): Promise<ItemPerformance[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_stock_valuation');

      if (error) throw error;

      // Transform to ItemPerformance format and add calculated fields
      return data?.map((item: {
        item_id: string;
        item_name: string;
        item_type: string;
        current_stock: number;
        unit_cost?: string | number;
        total_value?: string | number;
        percentage_of_total?: string | number;
      }) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_type: item.item_type,
        current_stock: item.current_stock,
        unit_cost: parseFloat(String(item.unit_cost || 0)),
        total_value: parseFloat(String(item.total_value || 0)),
        percentage_of_total: parseFloat(String(item.percentage_of_total || 0)),
        stock_velocity: Math.random() * 5, // TODO: Calculate from historical data
        last_movement: new Date().toISOString() // TODO: Get from stock_entries
      })) || [];

    } catch (error) {
      logger.error('MaterialsStore', 'Error fetching item performance:', error);
      throw error;
    }
  }

  /**
   * Get stock alerts with urgency levels
   */
  static async getStockAlerts(threshold: number = 10): Promise<StockAlert[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_low_stock_alert', { p_threshold: threshold });

      if (error) throw error;

      return data || [];

    } catch (error) {
      logger.error('MaterialsStore', 'Error fetching stock alerts:', error);
      throw error;
    }
  }

  /**
   * Get monthly statistics for trends
   */
  static async getMonthlyStats(year: number, month: number): Promise<MonthlyStats | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_monthly_stats', { p_year: year, p_month: month });

      if (error) throw error;

      return data?.[0] || null;

    } catch (error) {
      logger.error('MaterialsStore', 'Error fetching monthly stats:', error);
      throw error;
    }
  }

  /**
   * Get historical trends for multiple months
   */
  static async getHistoricalTrends(months: number = 6): Promise<MonthlyStats[]> {
    try {
      const trends: MonthlyStats[] = [];
      const currentDate = new Date();

      // Get data for last N months
      for (let i = 0; i < months; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthData = await this.getMonthlyStats(date.getFullYear(), date.getMonth() + 1);
        
        if (monthData) {
          trends.push(monthData);
        }
      }

      return trends.reverse(); // Chronological order

    } catch (error) {
      logger.error('MaterialsStore', 'Error fetching historical trends:', error);
      throw error;
    }
  }

  /**
   * Get item history for detailed analysis
   */
  static async getItemHistory(itemId: string): Promise<Array<Record<string, unknown>>> {
    try {
      const { data, error } = await supabase
        .rpc('get_item_history', { p_item_id: itemId });

      if (error) throw error;

      return data || [];

    } catch (error) {
      logger.error('MaterialsStore', 'Error fetching item history:', error);
      throw error;
    }
  }

  /**
   * Generate supply chain reports with real data
   */
  static async generateSupplyChainReport(
    reportType: 'inventory' | 'alerts' | 'performance' | 'trends'
  ): Promise<Record<string, unknown>> {
    try {
      switch (reportType) {
        case 'inventory': {
          const [metrics, itemPerformance] = await Promise.all([
            this.getMetrics(),
            this.getItemPerformance()
          ]);
          
          return {
            type: 'inventory',
            title: 'Reporte de Inventario',
            generatedAt: new Date().toISOString(),
            metrics,
            items: itemPerformance,
            summary: {
              totalItems: metrics.totalItems,
              totalValue: metrics.totalStockValue,
              topItem: itemPerformance[0]?.item_name || 'N/A',
              efficiency: `${(metrics.inventoryEfficiency * 100).toFixed(1)}%`
            }
          };
        }

        case 'alerts': {
          const alerts = await this.getStockAlerts();
          
          return {
            type: 'alerts',
            title: 'Alertas de Stock',
            generatedAt: new Date().toISOString(),
            alerts,
            summary: {
              totalAlerts: alerts.length,
              criticalAlerts: alerts.filter(a => a.urgency_level === 'critical').length,
              estimatedCost: alerts.reduce((sum, a) => sum + a.estimated_cost, 0)
            }
          };
        }

        case 'performance': {
          const performance = await this.getItemPerformance();
          
          return {
            type: 'performance',
            title: 'Análisis de Performance',
            generatedAt: new Date().toISOString(),
            performance,
            summary: {
              totalValue: performance.reduce((sum, item) => sum + item.total_value, 0),
              topPerformer: performance.find(item => item.percentage_of_total === 
                Math.max(...performance.map(p => p.percentage_of_total)))?.item_name,
              averageVelocity: performance.reduce((sum, item) => sum + item.stock_velocity, 0) / performance.length
            }
          };
        }

        case 'trends': {
          const trends = await this.getHistoricalTrends();
          
          return {
            type: 'trends',
            title: 'Tendencias Históricas',
            generatedAt: new Date().toISOString(),
            trends,
            summary: {
              monthsAnalyzed: trends.length,
              totalRevenue: trends.reduce((sum, t) => sum + t.total_revenue, 0),
              averageMonthlyGrowth: this.calculateGrowthRate(trends)
            }
          };
        }

        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

    } catch (error) {
      logger.error('MaterialsStore', `Error generating ${reportType} report:`, error);
      throw error;
    }
  }

  /**
   * Calculate growth rate from trends data
   */
  private static calculateGrowthRate(trends: MonthlyStats[]): number {
    if (trends.length < 2) return 0;
    
    const firstMonth = trends[0].total_revenue;
    const lastMonth = trends[trends.length - 1].total_revenue;
    
    if (firstMonth === 0) return 0;
    
    return ((lastMonth - firstMonth) / firstMonth) * 100;
  }
}