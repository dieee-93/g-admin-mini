/**
 * Enhanced Sales Hook using generic patterns
 * Migrated to use useDataFetcher, useDataSearch, AnalyticsEngine and CRUDHandlers
 */
import { useDataFetcher, useDataSearch, useModuleAnalytics } from '@/shared/hooks/business';
import { AnalyticsEngine } from '@/shared/services/AnalyticsEngine';
import { handleAsyncOperation, CRUDHandlers } from '@/shared/utils/errorHandling';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { useSales as useSalesOriginal } from './useSales';
import { useMemo } from 'react';

import { logger } from '@/lib/logging';
interface SaleTransaction {
  id: string;
  order_number: string;
  customer_id?: string;
  table_number?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'digital' | 'credit';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  items: SaleItem[];
  created_at: string;
  updated_at?: string;
  last_activity?: string;
  total_value: number;
}

interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface SalesMetrics {
  todayRevenue: number;
  todayTransactions: number;
  averageOrderValue: number;
  salesGrowth: number;
  activeTables: number;
  tableOccupancy: number;
  pendingOrders: number;
  averageServiceTime: number;
  profitMargin: number;
  paymentMethodBreakdown: Record<string, number>;
  hourlyPerformance: Record<string, number>;
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
}

export function useSalesEnhanced() {
  const originalSalesHook = useSalesOriginal();

  // Generic data fetching for sales transactions
  const {
    data: sales,
    loading,
    error,
    refresh: refreshSales
  } = useDataFetcher<SaleTransaction>({
    fetchFn: async () => {
      // Convert original sales data to enhanced interface
      const originalSales = originalSalesHook.sales || [];
      return originalSales.map(sale => ({
        id: sale.id,
        order_number: sale.order_number || `ORD-${sale.id}`,
        customer_id: sale.customer_id,
        table_number: sale.table_number,
        amount: sale.subtotal || 0,
        tax_amount: sale.tax || 0,
        total_amount: sale.total || sale.amount || 0,
        payment_method: (sale.payment_method as string) || 'cash',
        status: (sale.status as string) || 'completed',
        items: sale.items || [],
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        last_activity: sale.updated_at || sale.created_at,
        total_value: sale.total || sale.amount || 0
      }));
    },
    module: 'sales',
    dependencies: [originalSalesHook.sales]
  });

  // Generic search functionality for sales
  const salesSearch = useDataSearch<SaleTransaction>({
    searchFn: async (query: string) => {
      return sales.filter(sale =>
        sale.order_number.toLowerCase().includes(query.toLowerCase()) ||
        sale.table_number?.toLowerCase().includes(query.toLowerCase()) ||
        sale.customer_id?.toLowerCase().includes(query.toLowerCase()) ||
        sale.items.some(item =>
          item.product_name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  });

  // Analytics using generic engine
  const analytics = useModuleAnalytics<SalesMetrics>({
    module: 'sales',
    timeRange: '30d'
  });

  // Calculate sales metrics
  const salesMetrics = useMemo(() => {
    if (!sales.length) {
      return {
        todayRevenue: 0,
        todayTransactions: 0,
        averageOrderValue: 0,
        salesGrowth: 0,
        activeTables: 0,
        tableOccupancy: 0,
        pendingOrders: 0,
        averageServiceTime: 0,
        profitMargin: 0,
        paymentMethodBreakdown: {},
        hourlyPerformance: {},
        topSellingItems: []
      };
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Today's sales
    const todaySales = sales.filter(sale =>
      new Date(sale.created_at) >= todayStart &&
      sale.status === 'completed'
    );

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const todayTransactions = todaySales.length;
    const averageOrderValue = todayTransactions > 0 ? todayRevenue / todayTransactions : 0;

    // Payment method breakdown
    const paymentMethodBreakdown = sales.reduce((acc, sale) => {
      if (sale.status === 'completed') {
        acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Hourly performance
    const hourlyPerformance = sales.reduce((acc, sale) => {
      if (sale.status === 'completed') {
        const hour = new Date(sale.created_at).getHours().toString().padStart(2, '0') + ':00';
        acc[hour] = (acc[hour] || 0) + sale.total_amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Top selling items
    const itemSales = sales
      .filter(sale => sale.status === 'completed')
      .flatMap(sale => sale.items);

    const itemStats = itemSales.reduce((acc, item) => {
      const existing = acc.find(i => i.name === item.product_name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.total_price;
      } else {
        acc.push({
          name: item.product_name,
          quantity: item.quantity,
          revenue: item.total_price
        });
      }
      return acc;
    }, [] as Array<{ name: string; quantity: number; revenue: number }>);

    const topSellingItems = itemStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Additional metrics
    const pendingOrders = sales.filter(sale => sale.status === 'pending').length;
    const uniqueTables = new Set(sales
      .filter(sale => sale.table_number && sale.status !== 'completed')
      .map(sale => sale.table_number)
    );
    const activeTables = uniqueTables.size;

    return {
      todayRevenue,
      todayTransactions,
      averageOrderValue,
      salesGrowth: 0, // Would need historical data
      activeTables,
      tableOccupancy: activeTables * 12.5, // Assuming 8 tables max
      pendingOrders,
      averageServiceTime: 25, // Mock data
      profitMargin: 35, // Mock data
      paymentMethodBreakdown,
      hourlyPerformance,
      topSellingItems
    };
  }, [sales]);

  // CRUD operations using standardized handlers
  const createSale = async (saleData: Partial<SaleTransaction>) => {
    return await CRUDHandlers.create(
      () => originalSalesHook.createSale(saleData as Partial<Sale>),
      'Venta',
      refreshSales
    );
  };

  const updateSale = async (id: string, saleData: Partial<SaleTransaction>) => {
    return await CRUDHandlers.update(
      () => originalSalesHook.updateSale(id, saleData as Partial<Sale>),
      'Venta',
      refreshSales
    );
  };

  const cancelSale = async (id: string, reason?: string) => {
    return await CRUDHandlers.delete(
      () => originalSalesHook.cancelSale(id, reason),
      'Venta',
      `¿Estás seguro de cancelar esta venta?`,
      refreshSales
    );
  };

  // POS operations
  const processPOSTransaction = async (transactionData: {
    items: SaleItem[];
    customer_id?: string;
    table_number?: string;
    payment_method: string;
  }) => {
    return await handleAsyncOperation(
      () => originalSalesHook.processPOSTransaction(transactionData),
      {
        module: 'sales',
        operation: 'procesar transacción POS'
      }
    );
  };

  // Table management
  const assignTable = async (saleId: string, tableNumber: string) => {
    return await handleAsyncOperation(
      () => originalSalesHook.assignTable(saleId, tableNumber),
      {
        module: 'sales',
        operation: 'asignar mesa'
      }
    );
  };

  // Analytics integration
  const generateSalesAnalytics = async (timeRange: '7d' | '30d' | '90d' = '30d') => {
    try {
      const result = await AnalyticsEngine.generateAnalytics(sales, {
        module: 'sales',
        timeRange,
        includeForecasting: true,
        includeTrends: true
      });

      return {
        ...result,
        salesSpecific: {
          revenueGrowth: result.metrics.total_value,
          transactionTrends: result.timeSeries,
          paymentMethodAnalysis: salesMetrics.paymentMethodBreakdown,
          hourlyPerformance: salesMetrics.hourlyPerformance,
          topItems: salesMetrics.topSellingItems
        }
      };
    } catch (error) {
      logger.error('SalesStore', 'Error generating sales analytics:', error);
      return null;
    }
  };

  // Sales alerts
  const getSalesAlerts = () => {
    const alerts = [];

    if (salesMetrics.pendingOrders > 5) {
      alerts.push({
        type: 'warning',
        title: `${salesMetrics.pendingOrders} órdenes pendientes`,
        description: 'Considera revisar el estado de las órdenes',
        priority: 'high'
      });
    }

    if (salesMetrics.todayRevenue < 1000 && new Date().getHours() > 18) {
      alerts.push({
        type: 'info',
        title: 'Revenue bajo para la hora',
        description: 'Las ventas están por debajo del promedio',
        priority: 'medium'
      });
    }

    if (salesMetrics.activeTables > 6) {
      alerts.push({
        type: 'success',
        title: 'Alta ocupación de mesas',
        description: `${salesMetrics.activeTables} mesas activas`,
        priority: 'low'
      });
    }

    return alerts;
  };

  return {
    // Data
    sales,
    loading,
    error,

    // Metrics
    metrics: salesMetrics,

    // Search
    search: salesSearch.search,
    searchResults: salesSearch.searchResults,
    searchLoading: salesSearch.loading,
    searchQuery: salesSearch.query,
    clearSearch: salesSearch.clearSearch,

    // Analytics
    analytics: analytics.metrics,
    analyticsLoading: analytics.loading,
    generateSalesAnalytics,
    formatCurrency: DecimalUtils.formatCurrency,

    // CRUD operations
    createSale,
    updateSale,
    cancelSale,

    // POS operations
    processPOSTransaction,
    assignTable,

    // Alerts and insights
    alerts: getSalesAlerts(),

    // Utility functions
    refresh: refreshSales,

    // Original hook for backward compatibility
    original: originalSalesHook
  };
}