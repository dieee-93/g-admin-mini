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

  // Load and calculate sales data
  const loadSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API calls
      // In a real implementation, these would come from your API
      const mockTransactions = [
        {
          id: '1',
          amount: 45.50,
          items_count: 3,
          discount: 0,
          refund_amount: 0,
          cost_of_goods: 15.75,
          created_at: new Date().toISOString()
        },
        // ... more mock data
      ];

      const mockProducts = [];
      const mockTables = [];
      const mockSales = [];

      setTransactionData(mockTransactions);
      setProductData(mockProducts);
      setTableData(mockTables);
      setSalesData(mockSales);

      // Calculate current metrics using business logic
      const metrics = calculateSalesMetrics(mockTransactions);
      setCurrentSalesMetrics(metrics);

      // Calculate period comparison if we have historical data
      // const previousMetrics = calculateSalesMetrics(previousPeriodTransactions);
      // const comparison = comparePeriods(metrics, previousMetrics);
      // setPeriodComparison(comparison);

    } catch (err) {
      console.error('Error loading sales data:', err);
      setError(err instanceof Error ? err.message : 'Error loading sales data');
    } finally {
      setLoading(false);
    }
  }, [pageState.analyticsTimeRange]);

  // Initialize data loading
  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  // Action handlers
  const setActiveSection = useCallback((section: SalesPageSection) => {
    setPageState(prev => ({ ...prev, activeSection: section }));
  }, []);

  const handleNewSale = useCallback(() => {
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
  }, [setActiveSection]);

  const handleProcessPayment = useCallback(() => {
    // TODO: Implement payment processing
    console.log('Processing payment...');
  }, []);

  const handleVoidSale = useCallback(() => {
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
  }, []);

  const handleRefund = useCallback((saleId: string) => {
    // TODO: Implement refund processing
    console.log('Processing refund for sale:', saleId);
  }, []);

  const handleTableSelect = useCallback((tableId: string) => {
    setPageState(prev => ({ ...prev, selectedTableId: tableId }));
    setActiveSection('tables');
  }, [setActiveSection]);

  const handleTableAssign = useCallback((tableId: string, orderData: any) => {
    // TODO: Implement table assignment
    console.log('Assigning order to table:', tableId, orderData);
  }, []);

  const handleTableClear = useCallback((tableId: string) => {
    // TODO: Implement table clearing
    console.log('Clearing table:', tableId);
  }, []);

  const handleShowAnalytics = useCallback(() => {
    setActiveSection('analytics');
    setPageState(prev => ({ ...prev, showAnalytics: true }));
  }, [setActiveSection]);

  const handleShowReports = useCallback(() => {
    setActiveSection('reports');
  }, [setActiveSection]);

  const handleGenerateReport = useCallback((type: 'daily' | 'weekly' | 'monthly') => {
    // TODO: Generate sales reports
    console.log('Generating report:', type);
  }, []);

  const handleKitchenDisplay = useCallback(() => {
    setActiveSection('kitchen');
  }, [setActiveSection]);

  const handleOrderUpdate = useCallback((orderId: string, status: string) => {
    // TODO: Update order status
    console.log('Updating order:', orderId, 'to status:', status);
  }, []);

  const handleQRGeneration = useCallback(() => {
    // TODO: Generate QR codes for tables
    console.log('Generating QR codes...');
  }, []);

  const handleQRCodeManagement = useCallback(() => {
    // TODO: Manage existing QR codes
    console.log('Managing QR codes...');
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