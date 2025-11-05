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
import { formatCurrency, safeAdd, safeMul, safeDecimal } from '@/business-logic/shared/decimalUtils';
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
  // 🔬 SCIENTIFIC DEBUG: Track renders with timestamp
  if (!window.__salesPageHookRenders) {
    window.__salesPageHookRenders = [];
    window.__renderSnapshots = [];
  }
  window.__salesPageHookRenders.push(Date.now());
  const renderNum = window.__salesPageHookRenders.length;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔵 [useSalesPage HOOK] RENDER #${renderNum} at ${new Date().toLocaleTimeString()}`);
  console.log(`🔵 [useSalesPage HOOK] WHY? Component re-rendered, so hook re-executes`);
  console.log(`${'='.repeat(80)}`);

  const navigationContext = useNavigationActions();
  const { setQuickActions, updateModuleBadge } = navigationContext;

  // 📸 Snapshot de funciones de navegación para comparar
  const navSnapshot = {
    render: renderNum,
    setQuickActionsId: setQuickActions.toString().substring(0, 100),
    updateModuleBadgeId: updateModuleBadge.toString().substring(0, 100)
  };
  window.__renderSnapshots.push(navSnapshot);

  // 🐛 DEBUG: Log when NavigationContext functions change
  const prevSetQuickActionsRef = useRef(setQuickActions);
  const prevUpdateBadgeRef = useRef(updateModuleBadge);

  if (prevSetQuickActionsRef.current !== setQuickActions) {
    console.log('⚠️ [DEPS CHANGE] setQuickActions CHANGED!');
    prevSetQuickActionsRef.current = setQuickActions;
  }

  if (prevUpdateBadgeRef.current !== updateModuleBadge) {
    console.log('⚠️ [DEPS CHANGE] updateModuleBadge CHANGED!');
    prevUpdateBadgeRef.current = updateModuleBadge;
  }

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
  logger.debug('UseSalesPage', '🔍 [DEBUG] useSalesPage hook initializing - v4 SAFE DECIMAL FIX');

  // 🐛 DEBUG: Count hook executions
  useEffect(() => {
    logger.info('UseSalesPage', '✅ useSalesPage MOUNTED');
    return () => {
      logger.warn('UseSalesPage', '❌ useSalesPage UNMOUNTING!');
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

  // Data state
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [transactionData, setTransactionData] = useState<Sale[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [tableData, setTableData] = useState<Table[]>([]);
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
    const todayTransactions = transactionData.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate.toDateString() === today.toDateString();
    });

    // ✅ Sum amounts (already numbers after processing)
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.amount || t.total || 0), 0);
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
  }, [transactionData, productData, salesData, tableData, periodComparison]); // ✅ FIX: currentSalesMetrics removed - all values calculated internally

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
          const { transactions, products, tables, sales } = JSON.parse(cachedData);
          setTransactionData(transactions || []);
          setProductData(products || []);
          setTableData(tables || []);
          setSalesData(sales || []);

          notify.info('Usando datos offline. Se sincronizará al reconectar.');
          return;
        }
      }

      // ✅ DIRECT API CALLS - RLS provides security
      // Pattern: Hook → Service → Supabase Client → RLS (PostgreSQL)
      const [transactionsRes, productsRes, tablesRes, salesRes] = await Promise.all([
        fetchTransactions(pageState.analyticsTimeRange),
        fetchProductsWithAvailability(),
        fetchTables(),
        fetchOrders('active')
      ]);

      // ✅ Process transactions - validate with safeDecimal then convert to numbers
      // Analytics functions expect numbers, so we validate then extract numeric values
      // 🐛 FIX: Defensive validation to prevent DecimalError with undefined/null values
      const processedTransactions = transactionsRes.map((t: Sale) => {
        // Explicit null/undefined coalescing BEFORE passing to Decimal
        const safeAmount = t?.amount ?? 0;
        const safeDiscount = t?.discount ?? 0;
        const safeRefund = t?.refund_amount ?? 0;
        const safeCost = t?.cost_of_goods ?? 0;

        return {
          ...t,
          amount: safeDecimal(safeAmount, 'financial', 0).toNumber(),
          discount: safeDecimal(safeDiscount, 'financial', 0).toNumber(),
          refund_amount: safeDecimal(safeRefund, 'financial', 0).toNumber(),
          cost_of_goods: safeDecimal(safeCost, 'financial', 0).toNumber(),
          items_count: t?.items_count || 0
        };
      });

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
      handleErrorRef.current(err, 'Sales Data Loading', {
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
      console.log('🔴 [loadSalesData] Setting loading=false - FINAL setState');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.analyticsTimeRange]); // ✅ FIX: Removed isOnline - causes loop because useOfflineStatus updates every 2s

  // Initialize data loading - ONLY ON MOUNT
  // 🔧 FIX: Don't depend on loadSalesData to avoid infinite loop
  // loadSalesData will be called when its dependencies (analyticsTimeRange) actually change
  useEffect(() => {
    console.log('🔥🔥🔥 [CRITICAL useEffect] This should ONLY run on MOUNT - If you see this multiple times, THIS IS THE PROBLEM');
    logger.debug('UseSalesPage', '🔄 useEffect[MOUNT] TRIGGERED - calling loadSalesData()');
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
    logger.debug('UseSalesPage', '🔍 [DEBUG] refreshSalesData called');
    await loadSalesDataRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX: No dependencies, use ref instead

  logger.debug('UseSalesPage', '🔍 [DEBUG] refreshSalesData declared successfully at line 387');

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

      notify.success('Nueva venta iniciada');
    } catch (err) {
      handleErrorRef.current(err, 'New Sale Initiation');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX LOOP: setActiveSection is stable (useCallback with [])

  const handleProcessPayment = useCallback(async (paymentData?: { amount: number; method: string; tip?: number }) => {
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

        notify.success(`Pago procesado: ${formatCurrency(total)}`);
      }
    } catch (err) {
      handleErrorRef.current(err, 'Payment Processing', {
        sale_amount: pageState.currentSale.total,
        payment_method: paymentData?.method
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.currentSale, refreshSalesData]); // ✅ FIX: Using handleErrorRef

  const handleVoidSale = useCallback(async () => {
    try {
      if (pageState.currentSale.isActive && pageState.currentSale.items.length > 0) {
        // TODO: Implement audit logging via database triggers
        logger.warn('SalesStore', 'Sale voided', {
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

      notify.warning('Venta cancelada');
    } catch (err) {
      handleErrorRef.current(err, 'Sale Void');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.currentSale]); // ✅ FIX: Using handleErrorRef

  const handleRefund = useCallback(async (saleId: string, refundAmount?: number) => {
    try {
      // TODO: Implement refund via Edge Function (see docs/EDGE_FUNCTIONS_TODO.md)
      // For now, log the refund request
      logger.warn('SalesStore', 'Refund requested - not yet implemented', {
        sale_id: saleId,
        refund_amount: refundAmount,
        timestamp: new Date().toISOString()
      });

      notify.warning('Función de reembolso en desarrollo. Contacta soporte.');

      // When implemented, will use:
      // const refundResult = await processSaleRefund(saleId, refundAmount);
    } catch (err) {
      handleErrorRef.current(err, 'Refund Processing', { sale_id: saleId, refund_amount: refundAmount });
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
      await seatParty(tableId, 1, orderData); // Default party size to 1 if not provided

      await refreshSalesData();
      notify.success(`Mesa ${tableId} asignada correctamente`);
    } catch (err) {
      handleErrorRef.current(err, 'Table Assignment', { table_id: tableId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSalesData]); // ✅ FIX: Using handleErrorRef

  const handleTableClear = useCallback(async (tableId: string) => {
    try {
      // Use tableApi service - already implemented with RLS
      await clearTable(tableId);

      await refreshSalesData();
      notify.success(`Mesa ${tableId} liberada`);
    } catch (err) {
      handleErrorRef.current(err, 'Table Clear', { table_id: tableId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSalesData]); // ✅ FIX: Using handleErrorRef

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

  // 🔧 MOVED: refreshSalesData declaration moved earlier - removed from here

  // NEW: Component-specific handlers
  const handleMetricClick = useCallback((metric: string, value: string | number) => {
    logger.info('SalesStore', 'Metric clicked:', metric, value);
    // TODO: Implement metric drill-down navigation
  }, []);

  const handleAlertAction = useCallback((action: string, alertId: string) => {
    logger.info('SalesStore', 'Alert action:', action, alertId);
    // TODO: Implement alert action logic
  }, []);

  const handleOrderPlace = useCallback((orderData: Partial<Order>) => {
    logger.info('SalesStore', 'Order placed:', orderData);
    // TODO: Implement order placement logic
  }, []);

  const handlePaymentProcess = useCallback((paymentData: { amount: number; method: string; tip?: number }) => {
    logger.info('SalesStore', 'Payment processed:', paymentData);
    // TODO: Implement payment processing logic
  }, []);

  // Analytics helpers
  const calculateTotalTaxes = useCallback((items: SaleItem[]) => {
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
    salesData.filter(s => s.status !== 'completed'),
    [salesData]
  );

  const recentTransactions = useMemo(() =>
    transactionData.slice(-10),
    [transactionData]
  );

  const tableStatuses = useMemo(() =>
    tableData.reduce((acc, table) => {
      acc[table.id] = table.status;
      return acc;
    }, {} as Record<string, 'available' | 'occupied' | 'reserved' | 'cleaning'>),
    [tableData]
  );

  // 🛑 CIRCUIT BREAKER: Analizar renders sin detener ejecución
  if (renderNum === 5) {
    console.warn('\n⚠️ ADVERTENCIA - 5 renders detectados:');
    console.warn('='.repeat(80));

    // Comparar snapshots
    const snapshots = window.__renderSnapshots || [];
    if (snapshots.length >= 2) {
      const first = snapshots[0];
      const latest = snapshots[snapshots.length - 1];

      console.warn('📊 Comparación Render #1 vs Render #' + renderNum + ':');
      console.warn('setQuickActions cambió:', first.setQuickActionsId !== latest.setQuickActionsId);
      console.warn('updateModuleBadge cambió:', first.updateModuleBadgeId !== latest.updateModuleBadgeId);

      console.table(snapshots);
    }
    console.warn('='.repeat(80));
  }

  // 📊 REPORTE FINAL cuando se estabilice
  if (renderNum === 20) {
    console.log('\n✅ ESTABILIZACIÓN DETECTADA - 20 renders alcanzados:');
    console.log('La página parece haberse estabilizado.');
    console.log('Total de renders:', renderNum);
    console.log('='.repeat(80));
  }

  console.log(`🟢 [useSalesPage HOOK] RETURN - Hook execution complete, returning values to component`);
  console.log(`🟢 [useSalesPage HOOK] loading=${loading}, error=${error ? 'HAS_ERROR' : 'null'}`);

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
    activeSales,
    recentTransactions,
    tableStatuses,
    calculateTotalTaxes,
    getTopPerformingProducts,
    getSalesComparison,
    getRevenueBreakdown
  };
};
