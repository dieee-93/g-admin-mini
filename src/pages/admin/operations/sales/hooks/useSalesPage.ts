import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CreditCardIcon,
  TableCellsIcon,
  ChartBarIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  PlusIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// ✅ ENTERPRISE SYSTEMS INTEGRATION
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { secureApiCall } from '@/lib/validation/security';
import { FinancialDecimal, formatCurrency, safeAdd, safeMul, safeDiv } from '@/business-logic/shared/decimalUtils';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
import {
  calculateSalesMetrics,
  comparePeriods,
  analyzeProductPerformance,
  calculateRevenueBreakdown,
  calculateSalesVelocity,
  taxService
} from '../services';
import type {
  SalesMetrics,
  PeriodComparison,
  ProductPerformance,
  RevenueBreakdown,
  TaxCalculationResult
} from '../services';

export type SalesPageSection = 'pos' | 'tables' | 'analytics' | 'kitchen' | 'reports';

export interface SalesPageState {
  activeSection: SalesPageSection;
  showAnalytics: boolean;
  showRevenueBreakdown: boolean;
  showProductPerformance: boolean;
  showTaxDetails: boolean;
  selectedTableId: string | null;
  selectedOrderId: string | null;
  analyticsTimeRange: 'today' | 'week' | 'month' | 'quarter';
  currentSale: {
    isActive: boolean;
    tableNumber?: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    subtotal: number;
    taxDetails: TaxCalculationResult | null;
    total: number;
  };
}

export interface SalesPageMetrics {
  // Real-time sales metrics
  todayRevenue: number;
  todayTransactions: number;
  averageOrderValue: number;
  conversionRate: number;

  // Performance metrics
  salesGrowth: number;
  profitMargin: number;
  topProducts: ProductPerformance[];
  revenueBreakdown: RevenueBreakdown;

  // Operational metrics
  activeTables: number;
  pendingOrders: number;
  averageServiceTime: number;
  tableOccupancy: number;

  // Tax and financial
  totalTaxesCollected: number;
  netRevenue: number;
  salesVelocity: {
    current_velocity: number;
    velocity_trend: 'accelerating' | 'stable' | 'decelerating';
    momentum_score: number;
  };
}

export interface SalesPageActions {
  // POS actions
  handleNewSale: () => void;
  handleProcessPayment: () => void;
  handleVoidSale: () => void;
  handleRefund: (saleId: string) => void;

  // Table management
  handleTableSelect: (tableId: string) => void;
  handleTableAssign: (tableId: string, orderData: any) => void;
  handleTableClear: (tableId: string) => void;

  // Analytics actions
  handleShowAnalytics: () => void;
  handleShowReports: () => void;
  handleGenerateReport: (type: 'daily' | 'weekly' | 'monthly') => void;

  // Kitchen integration
  handleKitchenDisplay: () => void;
  handleOrderUpdate: (orderId: string, status: string) => void;

  // QR Code actions
  handleQRGeneration: () => void;
  handleQRCodeManagement: () => void;

  // NEW: Component-specific actions
  handleMetricClick: (metric: string, value: any) => void;
  handleAlertAction: (action: string, alertId: string) => void;
  handleOrderPlace: (orderData: any) => void;
  handlePaymentProcess: (paymentData: any) => void;

  // Toggle handlers
  toggleAnalytics: () => void;
  toggleRevenueBreakdown: () => void;
  toggleProductPerformance: () => void;
  toggleTaxDetails: () => void;

  // Utility actions
  setAnalyticsTimeRange: (range: 'today' | 'week' | 'month' | 'quarter') => void;
  refreshSalesData: () => Promise<void>;
  setActiveSection: (section: SalesPageSection) => void;
}

export interface UseSalesPageReturn {
  // State
  pageState: SalesPageState;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Data
  metrics: SalesPageMetrics;
  currentSalesMetrics: SalesMetrics;
  periodComparison: PeriodComparison | null;
  loading: boolean;
  error: string | null;

  // Actions
  actions: SalesPageActions;

  // Real-time data
  activeSales: any[];
  recentTransactions: any[];
  tableStatuses: Record<string, 'available' | 'occupied' | 'reserved' | 'cleaning'>;

  // Analytics helpers
  calculateTotalTaxes: (items: any[]) => TaxCalculationResult;
  getTopPerformingProducts: (limit?: number) => ProductPerformance[];
  getSalesComparison: () => PeriodComparison | null;
  getRevenueBreakdown: () => RevenueBreakdown;
}

export const useSalesPage = (): UseSalesPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();

  // ✅ ENTERPRISE SYSTEMS HOOKS
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();

  // State
  const [pageState, setPageState] = useState<SalesPageState>({
    activeSection: 'pos',
    showAnalytics: false,
    showRevenueBreakdown: false,
    showProductPerformance: false,
    showTaxDetails: false,
    selectedTableId: null,
    selectedOrderId: null,
    analyticsTimeRange: 'today',
    currentSale: {
      isActive: false,
      items: [],
      subtotal: 0,
      taxDetails: null,
      total: 0
    }
  });

  // Tab state (matching Materials pattern)
  const [activeTab, setActiveTab] = useState('pos');

  // Data state
  const [salesData, setSalesData] = useState<any[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentSalesMetrics, setCurrentSalesMetrics] = useState<SalesMetrics>({
    total_revenue: 0,
    average_order_value: 0,
    conversion_rate: 0,
    revenue_growth_rate: 0,
    profit_margin: 0,
    units_sold: 0,
    transactions_count: 0,
    refunds_amount: 0,
    net_revenue: 0
  });
  const [periodComparison, setPeriodComparison] = useState<PeriodComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Setup quick actions with sales-specific actions
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: CreditCardIcon,
        action: () => handleNewSale(),
        color: 'teal'
      },
      {
        id: 'view-analytics',
        label: 'Analytics',
        icon: ChartBarIcon,
        action: () => handleShowAnalytics(),
        color: 'blue'
      },
      {
        id: 'table-management',
        label: 'Gestión Mesas',
        icon: TableCellsIcon,
        action: () => setActiveSection('tables'),
        color: 'green'
      },
      {
        id: 'qr-codes',
        label: 'Códigos QR',
        icon: QrCodeIcon,
        action: () => handleQRGeneration(),
        color: 'purple'
      },
      {
        id: 'kitchen-display',
        label: 'Cocina',
        icon: ComputerDesktopIcon,
        action: () => handleKitchenDisplay(),
        color: 'orange'
      },
      {
        id: 'refresh-data',
        label: 'Actualizar',
        icon: ArrowPathIcon,
        action: () => refreshSalesData(),
        color: 'gray'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // Calculate metrics using business logic services
  const metrics: SalesPageMetrics = useMemo(() => {
    const todayTransactions = transactionData.filter(t => {
      const transactionDate = new Date(t.created_at);
      const today = new Date();
      return transactionDate.toDateString() === today.toDateString();
    });

    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const averageOrderValue = todayTransactions.length > 0
      ? todayRevenue / todayTransactions.length
      : 0;

    // Get product performance using business logic
    const topProducts = productData.length > 0
      ? analyzeProductPerformance(productData, todayRevenue).slice(0, 5)
      : [];

    // Calculate revenue breakdown
    const revenueBreakdown = calculateRevenueBreakdown(
      todayRevenue,
      0, // discounts - would come from actual data
      0, // refunds - would come from actual data
      todayRevenue * 0.21, // IVA 21%
      todayRevenue * 0.35 // estimated COGS
    );

    // Calculate sales velocity
    const dailySalesData = []; // would come from actual daily data
    const salesVelocity = dailySalesData.length > 7
      ? calculateSalesVelocity(dailySalesData)
      : { current_velocity: 0, velocity_trend: 'stable' as const, momentum_score: 0 };

    return {
      todayRevenue,
      todayTransactions: todayTransactions.length,
      averageOrderValue,
      conversionRate: currentSalesMetrics.conversion_rate,
      salesGrowth: periodComparison?.growth_metrics.revenue_growth || 0,
      profitMargin: revenueBreakdown.gross_margin_percentage,
      topProducts,
      revenueBreakdown,
      activeTables: tableData.filter(t => t.status === 'occupied').length,
      pendingOrders: salesData.filter(s => s.status === 'preparing').length,
      averageServiceTime: 25, // would come from actual data
      tableOccupancy: tableData.length > 0
        ? (tableData.filter(t => t.status === 'occupied').length / tableData.length) * 100
        : 0,
      totalTaxesCollected: revenueBreakdown.taxes_collected,
      netRevenue: revenueBreakdown.net_revenue,
      salesVelocity
    };
  }, [transactionData, productData, salesData, tableData, currentSalesMetrics, periodComparison]);

  // Update navigation badge with pending orders
  useEffect(() => {
    if (updateModuleBadge && metrics.pendingOrders > 0) {
      updateModuleBadge('sales', metrics.pendingOrders);
    }
  }, [metrics.pendingOrders, updateModuleBadge]);

  // ✅ OFFLINE-FIRST DATA LOADING WITH SECURITY HARDENING
  const loadSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Offline-first pattern: Use cached data if offline
      if (!isOnline) {
        const cachedData = localStorage.getItem('sales-cache');
        if (cachedData) {
          const { transactions, products, tables, sales } = JSON.parse(cachedData);
          setTransactionData(transactions || []);
          setProductData(products || []);
          setTableData(tables || []);
          setSalesData(sales || []);

          notify.info('Usando datos offline. Se sincronizará al reconectar.');
          return;
        }
      }

      // Secure API calls with decimal precision
      const [transactionsRes, productsRes, tablesRes, salesRes] = await Promise.all([
        secureApiCall('/api/sales/transactions', {
          method: 'GET',
          params: { period: pageState.analyticsTimeRange }
        }),
        secureApiCall('/api/sales/products', { method: 'GET' }),
        secureApiCall('/api/sales/tables', { method: 'GET' }),
        secureApiCall('/api/sales/orders', {
          method: 'GET',
          params: { status: 'active' }
        })
      ]);

      // Process with decimal precision for financial calculations
      const processedTransactions = transactionsRes.map((t: any) => ({
        ...t,
        amount: new FinancialDecimal(t.amount),
        discount: new FinancialDecimal(t.discount || 0),
        refund_amount: new FinancialDecimal(t.refund_amount || 0),
        cost_of_goods: new FinancialDecimal(t.cost_of_goods || 0)
      }));

      setTransactionData(processedTransactions);
      setProductData(productsRes);
      setTableData(tablesRes);
      setSalesData(salesRes);

      // Cache for offline use
      localStorage.setItem('sales-cache', JSON.stringify({
        transactions: processedTransactions,
        products: productsRes,
        tables: tablesRes,
        sales: salesRes,
        timestamp: Date.now()
      }));

      // Calculate current metrics using business logic with decimal precision
      const metrics = calculateSalesMetrics(processedTransactions);
      setCurrentSalesMetrics(metrics);

      // Calculate period comparison if we have historical data
      // const previousMetrics = calculateSalesMetrics(previousPeriodTransactions);
      // const comparison = comparePeriods(metrics, previousMetrics);
      // setPeriodComparison(comparison);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading sales data';
      handleError(err, 'Sales Data Loading', {
        operation: 'loadSalesData',
        period: pageState.analyticsTimeRange,
        isOnline
      });
      setError(errorMessage);

      // Fallback to cached data on error
      if (!isOnline) {
        const cachedData = localStorage.getItem('sales-cache');
        if (cachedData) {
          const { transactions, products, tables, sales } = JSON.parse(cachedData);
          setTransactionData(transactions || []);
          setProductData(products || []);
          setTableData(tables || []);
          setSalesData(sales || []);
          notify.warning('Error de conexión. Usando datos en caché.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [pageState.analyticsTimeRange, isOnline, handleError]);

  // Initialize data loading
  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  // ✅ ENTERPRISE ACTION HANDLERS WITH SECURITY & DECIMAL PRECISION
  const setActiveSection = useCallback((section: SalesPageSection) => {
    setPageState(prev => ({ ...prev, activeSection: section }));
  }, []);

  const handleNewSale = useCallback(async () => {
    try {
      setActiveSection('pos');
      setPageState(prev => ({
        ...prev,
        currentSale: {
          ...prev.currentSale,
          isActive: true,
          items: [],
          subtotal: 0,
          total: 0
        }
      }));

      // Security audit log for financial operations
      await secureApiCall('/api/audit/log', {
        method: 'POST',
        body: {
          action: 'new_sale_initiated',
          module: 'sales',
          timestamp: new Date().toISOString(),
          user_id: 'current_user' // would come from auth context
        }
      });

      notify.success('Nueva venta iniciada');
    } catch (err) {
      handleError(err, 'New Sale Initiation');
    }
  }, [setActiveSection, handleError]);

  const handleProcessPayment = useCallback(async (paymentData?: any) => {
    try {
      if (!pageState.currentSale.isActive || pageState.currentSale.items.length === 0) {
        notify.warning('No hay venta activa para procesar');
        return;
      }

      // Calculate totals with decimal precision
      const subtotal = pageState.currentSale.items.reduce((sum, item) =>
        safeAdd(sum, safeMul(item.quantity, item.unitPrice)), 0
      );

      const taxResult = taxService.calculateTaxesForItems(pageState.currentSale.items);
      const total = safeAdd(subtotal, taxResult.total_taxes);

      // Secure payment processing
      const paymentResult = await secureApiCall('/api/sales/process-payment', {
        method: 'POST',
        body: {
          items: pageState.currentSale.items,
          subtotal: subtotal.toString(),
          taxes: taxResult,
          total: total.toString(),
          payment_method: paymentData?.method || 'cash',
          table_number: pageState.currentSale.tableNumber
        }
      });

      if (paymentResult.success) {
        // Reset sale state
        setPageState(prev => ({
          ...prev,
          currentSale: {
            isActive: false,
            items: [],
            subtotal: 0,
            taxDetails: null,
            total: 0
          }
        }));

        // Refresh data to reflect new transaction
        await refreshSalesData();

        notify.success(`Pago procesado: ${formatCurrency(total)}`);
      }
    } catch (err) {
      handleError(err, 'Payment Processing', {
        sale_amount: pageState.currentSale.total,
        payment_method: paymentData?.method
      });
    }
  }, [pageState.currentSale, handleError, refreshSalesData]);

  const handleVoidSale = useCallback(async () => {
    try {
      if (pageState.currentSale.isActive && pageState.currentSale.items.length > 0) {
        // Security audit for voided sales
        await secureApiCall('/api/audit/log', {
          method: 'POST',
          body: {
            action: 'sale_voided',
            module: 'sales',
            sale_value: pageState.currentSale.total,
            items_count: pageState.currentSale.items.length,
            timestamp: new Date().toISOString()
          }
        });
      }

      setPageState(prev => ({
        ...prev,
        currentSale: {
          isActive: false,
          items: [],
          subtotal: 0,
          taxDetails: null,
          total: 0
        }
      }));

      notify.warning('Venta cancelada');
    } catch (err) {
      handleError(err, 'Sale Void');
    }
  }, [pageState.currentSale, handleError]);

  const handleRefund = useCallback(async (saleId: string, refundAmount?: number) => {
    try {
      // Security validation for refund operations
      const refundResult = await secureApiCall('/api/sales/process-refund', {
        method: 'POST',
        body: {
          sale_id: saleId,
          refund_amount: refundAmount ? new FinancialDecimal(refundAmount).toString() : null,
          partial: !!refundAmount,
          timestamp: new Date().toISOString(),
          reason: 'user_requested' // would come from form input
        }
      });

      if (refundResult.success) {
        // Audit log for financial security
        await secureApiCall('/api/audit/log', {
          method: 'POST',
          body: {
            action: 'refund_processed',
            module: 'sales',
            sale_id: saleId,
            refund_amount: refundAmount || refundResult.amount,
            timestamp: new Date().toISOString()
          }
        });

        await refreshSalesData();
        notify.success(`Reembolso procesado: ${formatCurrency(refundResult.amount)}`);
      }
    } catch (err) {
      handleError(err, 'Refund Processing', { sale_id: saleId, refund_amount: refundAmount });
    }
  }, [handleError, refreshSalesData]);

  const handleTableSelect = useCallback((tableId: string) => {
    setPageState(prev => ({ ...prev, selectedTableId: tableId }));
    setActiveSection('tables');
  }, [setActiveSection]);

  const handleTableAssign = useCallback(async (tableId: string, orderData: any) => {
    try {
      // Assign order to table with audit trail
      const assignResult = await secureApiCall('/api/sales/assign-table', {
        method: 'POST',
        body: {
          table_id: tableId,
          order_data: orderData,
          timestamp: new Date().toISOString()
        }
      });

      if (assignResult.success) {
        await refreshSalesData();
        notify.success(`Mesa ${tableId} asignada correctamente`);
      }
    } catch (err) {
      handleError(err, 'Table Assignment', { table_id: tableId });
    }
  }, [handleError, refreshSalesData]);

  const handleTableClear = useCallback(async (tableId: string) => {
    try {
      // Clear table with proper cleanup
      const clearResult = await secureApiCall('/api/sales/clear-table', {
        method: 'POST',
        body: {
          table_id: tableId,
          timestamp: new Date().toISOString()
        }
      });

      if (clearResult.success) {
        await refreshSalesData();
        notify.success(`Mesa ${tableId} liberada`);
      }
    } catch (err) {
      handleError(err, 'Table Clear', { table_id: tableId });
    }
  }, [handleError, refreshSalesData]);

  const handleShowAnalytics = useCallback(() => {
    setActiveSection('analytics');
    setPageState(prev => ({ ...prev, showAnalytics: true }));
  }, [setActiveSection]);

  const handleShowReports = useCallback(() => {
    setActiveSection('reports');
  }, [setActiveSection]);

  const handleGenerateReport = useCallback((type: 'daily' | 'weekly' | 'monthly') => {
    // TODO: Generate sales reports
    logger.info('SalesStore', 'Generating report:', type);
  }, []);

  const handleKitchenDisplay = useCallback(() => {
    setActiveSection('kitchen');
  }, [setActiveSection]);

  const handleOrderUpdate = useCallback((orderId: string, status: string) => {
    // TODO: Update order status
    logger.info('SalesStore', 'Updating order:', orderId, 'to status:', status);
  }, []);

  const handleQRGeneration = useCallback(() => {
    // TODO: Generate QR codes for tables
    logger.info('SalesStore', 'Generating QR codes...');
  }, []);

  const handleQRCodeManagement = useCallback(() => {
    // TODO: Manage existing QR codes
    logger.info('SalesStore', 'Managing QR codes...');
  }, []);

  // Toggle handlers
  const toggleAnalytics = useCallback(() => {
    setPageState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }));
  }, []);

  const toggleRevenueBreakdown = useCallback(() => {
    setPageState(prev => ({ ...prev, showRevenueBreakdown: !prev.showRevenueBreakdown }));
  }, []);

  const toggleProductPerformance = useCallback(() => {
    setPageState(prev => ({ ...prev, showProductPerformance: !prev.showProductPerformance }));
  }, []);

  const toggleTaxDetails = useCallback(() => {
    setPageState(prev => ({ ...prev, showTaxDetails: !prev.showTaxDetails }));
  }, []);

  // Utility handlers
  const setAnalyticsTimeRange = useCallback((range: 'today' | 'week' | 'month' | 'quarter') => {
    setPageState(prev => ({ ...prev, analyticsTimeRange: range }));
  }, []);

  const refreshSalesData = useCallback(async () => {
    await loadSalesData();
  }, [loadSalesData]);

  // NEW: Component-specific handlers
  const handleMetricClick = useCallback((metric: string, value: any) => {
    logger.info('SalesStore', 'Metric clicked:', metric, value);
    // TODO: Implement metric drill-down navigation
  }, []);

  const handleAlertAction = useCallback((action: string, alertId: string) => {
    logger.info('SalesStore', 'Alert action:', action, alertId);
    // TODO: Implement alert action logic
  }, []);

  const handleOrderPlace = useCallback((orderData: any) => {
    logger.info('SalesStore', 'Order placed:', orderData);
    // TODO: Implement order placement logic
  }, []);

  const handlePaymentProcess = useCallback((paymentData: any) => {
    logger.info('SalesStore', 'Payment processed:', paymentData);
    // TODO: Implement payment processing logic
  }, []);

  // Analytics helpers
  const calculateTotalTaxes = useCallback((items: any[]) => {
    // Calculate taxes using the business logic service
    return taxService.calculateTaxesForItems(items);
  }, []);

  const getTopPerformingProducts = useCallback((limit: number = 5) => {
    return metrics.topProducts.slice(0, limit);
  }, [metrics.topProducts]);

  const getSalesComparison = useCallback(() => {
    return periodComparison;
  }, [periodComparison]);

  const getRevenueBreakdown = useCallback(() => {
    return metrics.revenueBreakdown;
  }, [metrics.revenueBreakdown]);

  // Actions object
  const actions: SalesPageActions = {
    handleNewSale,
    handleProcessPayment,
    handleVoidSale,
    handleRefund,
    handleTableSelect,
    handleTableAssign,
    handleTableClear,
    handleShowAnalytics,
    handleShowReports,
    handleGenerateReport,
    handleKitchenDisplay,
    handleOrderUpdate,
    handleQRGeneration,
    handleQRCodeManagement,
    // NEW: Component-specific actions
    handleMetricClick,
    handleAlertAction,
    handleOrderPlace,
    handlePaymentProcess,
    toggleAnalytics,
    toggleRevenueBreakdown,
    toggleProductPerformance,
    toggleTaxDetails,
    setAnalyticsTimeRange,
    refreshSalesData,
    setActiveSection
  };

  return {
    pageState,
    activeTab,
    setActiveTab,
    metrics,
    currentSalesMetrics,
    periodComparison,
    loading,
    error,
    actions,
    activeSales: salesData.filter(s => s.status !== 'completed'),
    recentTransactions: transactionData.slice(-10),
    tableStatuses: tableData.reduce((acc, table) => {
      acc[table.id] = table.status;
      return acc;
    }, {} as Record<string, any>),
    calculateTotalTaxes,
    getTopPerformingProducts,
    getSalesComparison,
    getRevenueBreakdown
  };
};