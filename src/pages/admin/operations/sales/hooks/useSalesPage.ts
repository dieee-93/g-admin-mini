import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CreditCardIcon,
  TableCellsIcon,
  ChartBarIcon,
  QrCodeIcon,
  ComputerDesktopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useSalesStore } from '@/store/salesStore';

// ✅ ENTERPRISE SYSTEMS INTEGRATION
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { formatCurrency, safeAdd, safeMul, safeDecimal } from '@/lib/decimal';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
import {
  calculateSalesMetrics,
  analyzeProductPerformance,
  calculateRevenueBreakdown,
  calculateSalesVelocity,
  taxService,
  fetchTransactions,
  fetchOrders,
  fetchProductsWithAvailability,
  fetchTables,
  processSale,
  seatParty,
  clearTable
} from '../services';
import { useSalesData } from './useSalesData';
import type {
  SalesMetrics,
  PeriodComparison,
  ProductPerformance,
  RevenueBreakdown,
  TaxCalculationResult
} from '../services';
import type { Sale, Order, Table, SaleItem } from '../types';

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
  handleTableAssign: (tableId: string, orderData: Partial<Order>) => void;
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
  handleMetricClick: (metric: string, value: string | number) => void;
  handleAlertAction: (action: string, alertId: string) => void;
  handleOrderPlace: (orderData: Partial<Order>) => void;
  handlePaymentProcess: (paymentData: { amount: number; method: string; tip?: number }) => void;

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
  activeSales: Sale[];
  recentTransactions: Sale[];
  tableStatuses: Record<string, 'available' | 'occupied' | 'reserved' | 'cleaning'>;

  // Analytics helpers
  calculateTotalTaxes: (items: SaleItem[]) => TaxCalculationResult;
  getTopPerformingProducts: (limit?: number) => ProductPerformance[];
  getSalesComparison: () => PeriodComparison | null;
  getRevenueBreakdown: () => RevenueBreakdown;
}

export const useSalesPage = (): UseSalesPageReturn => {


  // ✅ ENTERPRISE SYSTEMS HOOKS
  // 🔧 FIX: Consume hooks HERE like Materials does
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  // Note: usePerformanceMonitor NOT consumed here - too frequent updates

  // 🔧 FIX LOOP INFINITO: Use ref for handleError to break dependency cycle
  // handleError se recrea en cada render, causando que todos los useCallbacks
  // que dependen de él también se recreen, causando un loop infinito
  const handleErrorRef = useRef(handleError);
  useEffect(() => {
    handleErrorRef.current = handleError;
  }, [handleError]);

  // 🔧 DEBUG: Force Vite HMR to reload this file - v4 WITH SAFE DECIMAL
  logger.debug('SalesStore', '🔍 [DEBUG] useSalesPage hook initializing - v4 SAFE DECIMAL FIX');

  // 🐛 DEBUG: Count hook executions
  useEffect(() => {
    logger.info('Sales', '✅ useSalesPage MOUNTED');
    return () => {
      logger.warn('Sales', '❌ useSalesPage UNMOUNTING!');
    };
  }, []);

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

  // ✅ REAL-TIME SALES DATA (Replaces manual fetching)
  const {
    sales: realtimeSales,
    loading: salesLoading,
    refresh: refreshRealtimeSales
  } = useSalesData();

  // Data state
  // Consolidate data state for batched updates
  // NOTE: 'salesData' is now managed by useSalesData, but kept here if needed for transitions
  // We will effectively ignore dataState.salesData in favor of realtimeSales
  const [dataState, setDataState] = useState({
    transactionData: [] as Sale[],
    productData: [] as ProductPerformance[],
    tableData: [] as Table[]
  });
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
  const [periodComparison] = useState<PeriodComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔧 FIX: Quick actions setup moved to after all functions are declared (see line ~760)

  // Calculate metrics using business logic services
  const metrics: SalesPageMetrics = useMemo(() => {
    // ✅ FIX LOOP: Create Date once outside filter to prevent infinite re-calculations
    const today = new Date();
    const todayTransactions = dataState.transactionData.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate.toDateString() === today.toDateString();
    });

    // ✅ Sum amounts (already numbers after processing)
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const averageOrderValue = todayTransactions.length > 0
      ? todayRevenue / todayTransactions.length
      : 0;

    // Get product performance using business logic
    const topProducts = dataState.productData.length > 0
      ? analyzeProductPerformance(dataState.productData as any, todayRevenue).slice(0, 5)
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
    const dailySalesData: any[] = []; // would come from actual daily data
    const salesVelocity = dailySalesData.length > 7
      ? calculateSalesVelocity(dailySalesData)
      : { current_velocity: 0, velocity_trend: 'stable' as const, momentum_score: 0 };

    // Calculate conversion rate (sales / visitors)
    // TODO: Get actual visitor count from analytics
    const conversionRate = 0; // Placeholder until we have visitor tracking

    return {
      todayRevenue,
      todayTransactions: todayTransactions.length,
      averageOrderValue,
      conversionRate, // ✅ FIX: Calculated internally instead of reading from currentSalesMetrics
      salesGrowth: periodComparison?.growth_metrics.revenue_growth || 0,
      profitMargin: revenueBreakdown.gross_margin_percentage,
      topProducts,
      revenueBreakdown,
      activeTables: dataState.tableData.filter(t => t.status === 'occupied').length,
      pendingOrders: realtimeSales.filter(s => s.order_status === 'preparing').length,
      averageServiceTime: 25, // would come from actual data
      tableOccupancy: dataState.tableData.length > 0
        ? (dataState.tableData.filter(t => t.status === 'occupied').length / dataState.tableData.length) * 100
        : 0,
      totalTaxesCollected: revenueBreakdown.taxes_collected,
      netRevenue: revenueBreakdown.net_revenue,
      salesVelocity
    };
  }, [dataState.transactionData, dataState.productData, realtimeSales, dataState.tableData, periodComparison]); // ✅ FIX: currentSalesMetrics removed - all values calculated internally

  // 🐛 SUSPECTED CAUSE OF INFINITE LOOP - Temporarily disabled
  // Update navigation badge with pending orders
  // useEffect(() => {
  //   if (updateModuleBadge && metrics.pendingOrders > 0) {
  //     updateModuleBadge('sales', metrics.pendingOrders);
  //   }
  // }, [metrics.pendingOrders, updateModuleBadge]);

  console.log('🧪 [DEBUG] updateModuleBadge useEffect DISABLED to test loop');

  // ✅ OFFLINE-FIRST DATA LOADING WITH SECURITY HARDENING
  const loadSalesData = useCallback(async () => {
    console.log('🔴 [loadSalesData] CALLED - This triggers multiple setStates');
    try {
      console.log('🔴 [loadSalesData] Setting loading=true');
      setLoading(true);
      console.log('🔴 [loadSalesData] Setting error=null');
      setError(null);

      // Offline-first pattern: Use cached data if offline
      if (!isOnline) {
        const cachedData = localStorage.getItem('sales-cache');
        if (cachedData) {
          const { transactions, products, tables } = JSON.parse(cachedData);
          setDataState({
            transactionData: transactions || [],
            productData: products || [],
            tableData: tables || [],
          });

          notify.info({ title: 'Usando datos offline. Se sincronizará al reconectar.' });
          return;
        }
      }

      // ✅ DIRECT API CALLS - RLS provides security
      // Pattern: Hook → Service → Supabase Client → RLS (PostgreSQL)
      logger.debug('SalesStore', '🔍 [DEBUG] Starting Promise.all for data fetching...');

      const transactionsPromise = fetchTransactions(pageState.analyticsTimeRange)
        .catch(e => { logger.error('SalesStore', '❌ fetchTransactions failed', e); throw e; });

      const productsPromise = fetchProductsWithAvailability()
        .catch(e => { logger.error('SalesStore', '❌ fetchProductsWithAvailability failed', e); throw e; });

      const tablesPromise = fetchTables()
        .catch(e => { logger.error('SalesStore', '❌ fetchTables failed', e); throw e; });

      const [transactionsRes, productsRes, tablesRes] = await Promise.all([
        transactionsPromise,
        productsPromise,
        tablesPromise
      ]);

      logger.debug('SalesStore', '✅ [DEBUG] All promises resolved successfully');

      // ✅ Process transactions - validate with safeDecimal then convert to numbers
      // Analytics functions expect numbers, so we validate then extract numeric values
      // 🐛 FIX: Defensive validation to prevent DecimalError with undefined/null values
      const processedTransactions = transactionsRes.map((t: Sale) => {
        // Explicit null/undefined coalescing BEFORE passing to Decimal
        const safeAmount = t?.total ?? 0;
        const safeDiscount = t?.discounts ?? 0;
        const safeRefund = 0; // Not available in Sale interface
        const safeCost = 0; // Not available in Sale interface

        return {
          ...t,
          amount: safeDecimal(safeAmount, 'financial', 0).toNumber(),
          discount: safeDecimal(safeDiscount, 'financial', 0).toNumber(),
          refund_amount: safeDecimal(safeRefund, 'financial', 0).toNumber(),
          cost_of_goods: safeDecimal(safeCost, 'financial', 0).toNumber(),
          items_count: t?.sale_items?.length || 0
        };
      });

      setDataState({
        transactionData: processedTransactions,
        productData: productsRes as unknown as ProductPerformance[],
        tableData: tablesRes
      });

      // Cache for offline use
      localStorage.setItem('sales-cache', JSON.stringify({
        transactions: processedTransactions,
        products: productsRes,
        tables: tablesRes,
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
      handleErrorRef.current(err as Error, {
        context: 'Sales Data Loading',
        operation: 'loadSalesData',
        period: pageState.analyticsTimeRange,
        isOnline
      });
      setError(errorMessage);

      // Fallback to cached data on error
      if (!isOnline) {
        const cachedData = localStorage.getItem('sales-cache');
        if (cachedData) {
          try {
            const { transactions, products, tables } = JSON.parse(cachedData);
            setDataState({
              transactionData: transactions || [],
              productData: products || [],
              tableData: tables || [],
            });
            notify.warning({ title: 'Error de conexión. Usando datos en caché.' });
          } catch (parseError) {
            console.error('Failed to parse cache', parseError);
          }
        }
      }
    } finally {
      console.log('🔴 [loadSalesData] Setting loading=false - FINAL setState');
      setLoading(false);
    }
  }, [pageState.analyticsTimeRange]); // ✅ FIX: Removed isOnline - causes loop because useOfflineStatus updates every 2s

  // Initialize data loading - ONLY ON MOUNT
  // 🔧 FIX: Don't depend on loadSalesData to avoid infinite loop
  // loadSalesData will be called when its dependencies (analyticsTimeRange) actually change
  useEffect(() => {
    console.log('🔥🔥🔥 [CRITICAL useEffect] This should ONLY run on MOUNT - If you see this multiple times, THIS IS THE PROBLEM');
    logger.debug('SalesStore', '🔄 useEffect[MOUNT] TRIGGERED - calling loadSalesData()');
    loadSalesData();
    return () => {
      console.log('🔥🔥🔥 [CRITICAL useEffect] CLEANUP - Component is UNMOUNTING');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX: Empty deps = only run on mount

  // 🔧 FIX: refreshSalesData using ref to avoid dependency on loadSalesData
  const loadSalesDataRef = useRef(loadSalesData);
  useEffect(() => {
    loadSalesDataRef.current = loadSalesData;
  }, [loadSalesData]);

  const refreshSalesData = useCallback(async () => {
    logger.debug('SalesStore', '🔍 [DEBUG] refreshSalesData called');
    await Promise.all([
      loadSalesDataRef.current(),
      refreshRealtimeSales()
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshRealtimeSales]); // ✅ FIX: refreshRealtimeSales added

  logger.debug('SalesStore', '🔍 [DEBUG] refreshSalesData declared successfully at line 387');

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

      // ✅ FIX: Open the checkout modal to actually start a new sale
      useSalesStore.getState().openCheckoutModal();

      // TODO: Implement audit logging via database triggers or Edge Function
      // For now, rely on RLS and database audit tables
      logger.info('SalesStore', 'New sale initiated', {
        timestamp: new Date().toISOString()
      });

      notify.success({ title: 'Nueva venta iniciada' });
    } catch (err) {
      handleErrorRef.current(err as Error, { context: 'New Sale Initiation' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX LOOP: setActiveSection is stable (useCallback with [])

  const handleProcessPayment = useCallback(async (paymentData?: { amount: number; method: string; tip?: number }) => {
    try {
      if (!pageState.currentSale.isActive || pageState.currentSale.items.length === 0) {
        notify.warning({ title: 'No hay venta activa para procesar' });
        return;
      }

      // Calculate totals with decimal precision
      // Use implicit conversion or default to 0
      const subtotal = pageState.currentSale.items.reduce((sum, item) => {
        const lineTotal = safeMul(item.quantity, item.unitPrice);
        return safeDecimal(safeAdd([sum, lineTotal])).toNumber();
      }, 0);

      const taxResult = taxService.calculateTaxesForItems(pageState.currentSale.items);
      const total = safeDecimal(safeAdd([subtotal, taxResult.totalTaxes])).toNumber();

      // TODO: Implement via Edge Function (see docs/EDGE_FUNCTIONS_TODO.md)
      // For now, use processSale service directly
      const saleData = {
        items: pageState.currentSale.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice
        })),
        payment_method: paymentData?.method || 'cash',
        table_number: pageState.currentSale.tableNumber,
        notes: null
      };

      const paymentResult = await processSale(saleData);

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

        notify.success({ title: `Pago procesado: ${formatCurrency(total)}` });
      }
    } catch (err) {
      handleErrorRef.current(err as Error, { context: 'Payment Processing' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.currentSale, refreshSalesData]); // ✅ FIX: Using handleErrorRef

  const handleVoidSale = useCallback(async () => {
    try {
      if (pageState.currentSale.isActive && pageState.currentSale.items.length > 0) {
        // TODO: Implement audit logging via database triggers
        logger.warn('Sales', 'Sale voided', {
          action: 'sale_voided',
          module: 'sales',
          sale_value: pageState.currentSale.total,
          items_count: pageState.currentSale.items.length,
          timestamp: new Date().toISOString()
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

      notify.warning({ title: 'Venta cancelada' });
    } catch (err) {
      handleErrorRef.current(err as Error, { context: 'Sale Void' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.currentSale]); // ✅ FIX: Using handleErrorRef

  const handleRefund = useCallback(async (saleId: string, refundAmount?: number) => {
    try {
      // TODO: Implement refund via Edge Function (see docs/EDGE_FUNCTIONS_TODO.md)
      // For now, log the refund request
      logger.warn('Sales', 'Refund requested - not yet implemented', {
        sale_id: saleId,
        refund_amount: refundAmount,
        timestamp: new Date().toISOString()
      });

      notify.warning({ title: 'Función de reembolso en desarrollo. Contacta soporte.' });

      // When implemented, will use:
      // const refundResult = await processSaleRefund(saleId, refundAmount);
    } catch (err) {
      handleErrorRef.current(err as Error, { context: 'Refund Processing' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX: Using handleErrorRef, no dependencies needed

  const handleTableSelect = useCallback((tableId: string) => {
    setPageState(prev => ({ ...prev, selectedTableId: tableId }));
    setActiveSection('tables');
  }, []); // ✅ FIX LOOP: setActiveSection is stable

  const handleTableAssign = useCallback(async (tableId: string, orderData: Partial<Order>) => {
    try {
      // Use tableApi service - already implemented with RLS
      const customerIds = orderData.customer_id ? [orderData.customer_id] : [];
      await seatParty(tableId, 1, customerIds); // Default party size to 1 if not provided

      await refreshSalesData();
      notify.success({ title: `Mesa ${tableId} asignada correctamente` });
    } catch (err) {
      handleErrorRef.current(err as Error, { context: 'Table Assignment' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSalesData]); // ✅ FIX: Using handleErrorRef

  const handleTableClear = useCallback(async (tableId: string) => {
    try {
      const table = dataState.tableData.find(t => t.id === tableId);
      if (!table?.current_party?.id) {
        notify.warning({ title: 'No hay grupo activo en esta mesa' });
        return;
      }
      // Use tableApi service - already implemented with RLS
      await clearTable(tableId, table.current_party.id);

      await refreshSalesData();
      notify.success({ title: `Mesa ${tableId} liberada` });
    } catch (err) {
      handleErrorRef.current(err as Error, { context: 'Table Clear', tableId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSalesData, dataState.tableData]); // ✅ FIX: Using handleErrorRef

  const handleShowAnalytics = useCallback(() => {
    // ✅ FIX LOOP: setActiveSection is already a useCallback with [], so safe to call directly
    setActiveSection('analytics');
    setPageState(prev => ({ ...prev, showAnalytics: true }));
  }, []); // ✅ No dependencies - setActiveSection is stable

  const handleShowReports = useCallback(() => {
    setActiveSection('reports');
  }, []); // ✅ FIX LOOP: setActiveSection is stable

  const handleGenerateReport = useCallback((type: 'daily' | 'weekly' | 'monthly') => {
    // TODO: Generate sales reports
    logger.info('SalesStore', 'Generating report:', type);
  }, []);

  const handleKitchenDisplay = useCallback(() => {
    setActiveSection('kitchen');
  }, []); // ✅ FIX LOOP: setActiveSection is stable

  const handleOrderUpdate = useCallback((orderId: string, status: string) => {
    // TODO: Update order status
    logger.info('Sales', 'Updating order', { orderId, status });
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

  // 🔧 MOVED: refreshSalesData declaration moved earlier - removed from here

  // NEW: Component-specific handlers
  const handleMetricClick = useCallback((metric: string, value: string | number) => {
    logger.info('Sales', 'Metric clicked', { metric, value });
    // TODO: Implement metric drill-down navigation
  }, []);

  const handleAlertAction = useCallback((action: string, alertId: string) => {
    logger.info('Sales', 'Alert action', { action, alertId });
    // TODO: Implement alert action logic
  }, []);

  const handleOrderPlace = useCallback((orderData: Partial<Order>) => {
    logger.info('Sales', 'Order placed', orderData);
    // TODO: Implement order placement logic
  }, []);

  const handlePaymentProcess = useCallback((paymentData: { amount: number; method: string; tip?: number }) => {
    logger.info('Sales', 'Payment processed', paymentData);
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

  // Actions object - ✅ MEMOIZED to prevent creating new object reference on every render
  const actions: SalesPageActions = useMemo(() => ({
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
  }), [
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
  ]);

  // ✅ FIX: Removed debug useEffect that was causing infinite re-renders
  // The useEffect without dependency array was executing on EVERY render

  // 🔧 FIX: Setup quick actions AFTER all functions are declared
  // This prevents "Cannot access 'refreshSalesData' before initialization" error
  // 🧪 TEMPORARILY DISABLED TO TEST IF THIS CAUSES THE LOOP
  /*
  useEffect(() => {
    // ⚠️ DEBUG COUNTER: Track loop iterations
    if (!window.__qaDepsLog) window.__qaDepsLog = [];
    window.__qaDepsLog.push(Date.now());
  
    console.log(`🔥 [QUICK ACTIONS] useEffect #${window.__qaDepsLog.length} TRIGGERED`);
    console.log(`🔍 [FUNCTION IDENTITIES] Checking if functions changed:`);
  
    // 🔬 SCIENTIFIC LOGGING: Track function identities
    if (!window.__funcIdentities) {
      window.__funcIdentities = {};
    }
  
    const currentIdentities = {
      handleNewSale: handleNewSale.toString().substring(0, 50),
      handleShowAnalytics: handleShowAnalytics.toString().substring(0, 50),
      setActiveSection: setActiveSection.toString().substring(0, 50),
      handleQRGeneration: handleQRGeneration.toString().substring(0, 50),
      handleKitchenDisplay: handleKitchenDisplay.toString().substring(0, 50),
      refreshSalesData: refreshSalesData.toString().substring(0, 50)
    };
  
    if (window.__qaDepsLog.length > 1) {
      Object.keys(currentIdentities).forEach(key => {
        if (window.__funcIdentities[key] !== currentIdentities[key]) {
          console.warn(`⚠️ FUNCTION CHANGED: ${key}`);
          console.log(`   OLD: ${window.__funcIdentities[key]}`);
          console.log(`   NEW: ${currentIdentities[key]}`);
        }
      });
    }
  
    window.__funcIdentities = currentIdentities;
  
    if (window.__qaDepsLog.length > 5) {
      console.error(`⛔ LOOP DETECTED! QuickActions ran ${window.__qaDepsLog.length} times`);
      console.error('Last 5 executions:', window.__qaDepsLog.slice(-5).map((t, i) =>
        i > 0 ? `${t - window.__qaDepsLog[window.__qaDepsLog.length - 5 + i - 1]}ms` : 'start'
      ));
    }
  
    logger.debug('UseSalesPage', '🔍 [DEBUG] Setting up quick actions - refreshSalesData exists:', typeof refreshSalesData);
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
  
    console.log('🟡 [QuickActions useEffect] Calling setQuickActions - Check if this runs multiple times');
    setQuickActions(quickActions);
    // 🔧 FIX: No cleanup needed - let the next page handle its own quickActions
    // Removing cleanup prevents flickering and unnecessary updates
    // return () => setQuickActions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX LOOP: Empty deps - only run on mount, functions are captured in closure
  */
  console.log('🧪 [DEBUG] QuickActions useEffect DISABLED to test loop');

  // ✅ FIX LOOP INFINITO: Memoize derived data to prevent creating new objects on every render
  // Without memoization, these create new array/object references every time, causing
  // infinite loops in components that use them in useEffect dependencies
  const activeSales = useMemo(() =>
    realtimeSales.filter(s => s.order_status !== 'completed'),
    [realtimeSales]
  );

  const recentTransactions = useMemo(() =>
    dataState.transactionData.slice(-10),
    [dataState.transactionData]
  );

  const tableStatuses = useMemo(() =>
    dataState.tableData.reduce((acc, table) => {
      acc[table.id] = table.status as "available" | "occupied" | "reserved" | "cleaning";
      return acc;
    }, {} as Record<string, 'available' | 'occupied' | 'reserved' | 'cleaning'>),
    [dataState.tableData]
  );

  console.log(`🟢 [useSalesPage HOOK] RETURN - Hook execution complete, returning values to component`);
  console.log(`🟢 [useSalesPage HOOK] loading=${loading}, error=${error ? 'HAS_ERROR' : 'null'}`);

  // ✅ FINAL RETURN OBJECT - MEMOIZED to ensure reference stability
  // This is critical to prevent consumers (like SalesPage) from re-rendering when nothing changed
  return useMemo(() => ({
    // State
    pageState,
    activeTab,
    setActiveTab,

    // Data
    metrics,
    currentSalesMetrics,
    periodComparison,
    loading,
    error,

    // Actions
    actions,

    // Real-time data
    activeSales,
    recentTransactions,
    tableStatuses,

    // Analytics helpers
    calculateTotalTaxes,
    getTopPerformingProducts,
    getSalesComparison,
    getRevenueBreakdown
  }), [
    // State dependencies
    pageState,
    activeTab,
    setActiveTab, // State setter is stable

    // Data dependencies
    metrics,
    currentSalesMetrics,
    periodComparison,
    loading,
    error,

    // Actions dependencies
    actions, // Already memoized

    // Real-time data dependencies
    activeSales,
    recentTransactions,
    tableStatuses,

    // Helpers dependencies
    calculateTotalTaxes,
    getTopPerformingProducts,
    getSalesComparison,
    getRevenueBreakdown
  ]);
};

export default useSalesPage;
