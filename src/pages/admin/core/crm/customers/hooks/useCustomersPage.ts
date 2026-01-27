import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  ChartBarIcon,
  CreditCardIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/shared/alerts';
import { customersAlertsAdapter } from '../services/customersAlertsAdapter';
import { CustomerAnalyticsEngine } from '../services';
import { CustomerAPI } from '../services/customerApi';
import type { Customer, Sale, SaleItem, CustomerAnalyticsResult, CustomerRFMProfile } from '../types';

import { logger } from '@/lib/logging';
import { useCustomersStore } from '@/modules/customers/store';
import { supabase } from '@/lib/supabase/client';
export type CustomerPageSection = 'management' | 'analytics' | 'orders' | 'loyalty';

export interface CustomersPageState {
  activeSection: CustomerPageSection;
  showRFMAnalysis: boolean;
  showCustomerSegments: boolean;
  showChurnPrediction: boolean;
  selectedCustomerId: string | null;
  analyticsTimeRange: 'month' | 'quarter' | 'year';
}

export interface CustomersPageMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customerRetentionRate: number;
  averageCLV: number;
  churnRate: number;
  totalRevenue: number;
  averageOrderValue: number;
  highValueCustomers: number;
  atRiskCustomers: number;
}

export interface CustomersPageActions {
  // Section navigation
  setActiveSection: (section: CustomerPageSection) => void;

  // Customer management
  handleNewCustomer: () => void;
  handleEditCustomer: (customerId: string) => void;
  handleViewCustomer: (customerId: string) => void;
  handleDeleteCustomer: (customerId: string) => void;

  // Analytics actions
  handleRFMAnalysis: () => void;
  handleCustomerSegments: () => void;
  handleChurnPrediction: () => void;
  handleGenerateReport: () => void;

  // Loyalty actions
  handleLoyaltyProgram: () => void;
  handlePointsManagement: () => void;

  // Orders actions
  handleViewOrders: (customerId: string) => void;
  handleOrderHistory: () => void;

  // Toggle handlers
  toggleRFMAnalysis: () => void;
  toggleCustomerSegments: () => void;
  toggleChurnPrediction: () => void;

  // Utility actions
  setAnalyticsTimeRange: (range: 'month' | 'quarter' | 'year') => void;
  refreshAnalytics: () => Promise<void>;
}

export interface UseCustomersPageReturn {
  // State
  pageState: CustomersPageState;

  // Data
  customers: Customer[];
  metrics: CustomersPageMetrics;
  analyticsResult: CustomerAnalyticsResult | null;
  rfmProfiles: CustomerRFMProfile[];
  loading: boolean;
  error: string | null;

  // Actions
  actions: CustomersPageActions;

  // Filtered data
  getCustomersBySegment: (segment: string) => Customer[];
  getHighValueCustomers: () => Customer[];
  getAtRiskCustomers: () => Customer[];
  getNewCustomers: () => Customer[];

  // Analytics helpers
  calculateSegmentMetrics: () => Record<string, { customers: number; revenue: number; averageSpend: number; retentionRate: number }>;
  getChurnPredictions: () => Array<{
    customerId: string;
    churnProbability: number;
    timeToChurn?: number;
    preventionActions: string[];
  }>;
}

export const useCustomersPage = (): UseCustomersPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigationActions();
  const { user } = useAuth();
  const { actions: alertActions } = useAlerts({ context: 'customers', autoFilter: true });
  const openModal = useCustomersStore((state) => state.openModal);

  // State
  const [pageState, setPageState] = useState<CustomersPageState>({
    activeSection: 'management',
    showRFMAnalysis: false,
    showCustomerSegments: false,
    showChurnPrediction: false,
    selectedCustomerId: null,
    analyticsTimeRange: 'quarter'
  });

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analyticsResult, setAnalyticsResult] = useState<CustomerAnalyticsResult | null>(null);
  const [rfmProfiles, setRfmProfiles] = useState<CustomerRFMProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to set active section
  const setActiveSection = useCallback((section: CustomerPageSection) => {
    setPageState(prev => ({ ...prev, activeSection: section }));
  }, []);

  // Action handlers - defined before useEffect
  const handleNewCustomer = useCallback(() => {
    setActiveSection('management');
    openModal('create', null);
    logger.info('App', 'Opening new customer modal');
  }, [setActiveSection, openModal]);

  const handleRFMAnalysis = useCallback(() => {
    setActiveSection('analytics');
    setPageState(prev => ({
      ...prev,
      showRFMAnalysis: true,
      showCustomerSegments: false,
      showChurnPrediction: false
    }));
  }, [setActiveSection]);

  const handleCustomerSegments = useCallback(() => {
    setActiveSection('analytics');
    setPageState(prev => ({
      ...prev,
      showCustomerSegments: true,
      showRFMAnalysis: false,
      showChurnPrediction: false
    }));
  }, [setActiveSection]);

  const handleChurnPrediction = useCallback(() => {
    setActiveSection('analytics');
    setPageState(prev => ({
      ...prev,
      showChurnPrediction: true,
      showRFMAnalysis: false,
      showCustomerSegments: false
    }));
  }, [setActiveSection]);

  const handleLoyaltyProgram = useCallback(() => {
    setActiveSection('loyalty');
  }, [setActiveSection]);

  // Setup quick actions
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-customer',
        label: 'Nuevo Cliente',
        icon: PlusIcon,
        action: handleNewCustomer,
        color: 'pink'
      },
      {
        id: 'rfm-analysis',
        label: 'Análisis RFM',
        icon: ChartBarIcon,
        action: handleRFMAnalysis,
        color: 'blue'
      },
      {
        id: 'customer-segments',
        label: 'Segmentación',
        icon: UserGroupIcon,
        action: handleCustomerSegments,
        color: 'green'
      },
      {
        id: 'churn-prediction',
        label: 'Riesgo de Churn',
        icon: ExclamationTriangleIcon,
        action: handleChurnPrediction,
        color: 'red'
      },
      {
        id: 'loyalty-program',
        label: 'Programa Lealtad',
        icon: CreditCardIcon,
        action: handleLoyaltyProgram,
        color: 'purple'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions, handleNewCustomer, handleRFMAnalysis, handleCustomerSegments, handleChurnPrediction, handleLoyaltyProgram]);

  // Calculate metrics using business logic services
  const metrics: CustomersPageMetrics = useMemo(() => {
    if (!customers.length || !analyticsResult) {
      return {
        totalCustomers: customers.length,
        activeCustomers: 0,
        newCustomersThisMonth: 0,
        customerRetentionRate: 0,
        averageCLV: 0,
        churnRate: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        highValueCustomers: 0,
        atRiskCustomers: 0
      };
    }

    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const highValueCustomers = customers.filter(c => c.total_spent >= 500).length;
    const atRiskCustomers = analyticsResult.customerAnalyses.filter(
      c => c.churnRisk === 'high' || c.churnRisk === 'critical'
    ).length;

    return {
      totalCustomers: customers.length,
      activeCustomers,
      newCustomersThisMonth: analyticsResult.overallMetrics.newCustomers,
      customerRetentionRate: analyticsResult.overallMetrics.customerRetentionRate,
      averageCLV: analyticsResult.overallMetrics.averageCustomerLifetimeValue,
      churnRate: analyticsResult.overallMetrics.churnRate,
      totalRevenue: analyticsResult.overallMetrics.totalRevenue,
      averageOrderValue: analyticsResult.overallMetrics.averageOrderValue,
      highValueCustomers,
      atRiskCustomers
    };
  }, [customers, analyticsResult]);

  // Update navigation badge with at-risk customers count
  useEffect(() => {
    if (updateModuleBadge && metrics.atRiskCustomers > 0) {
      updateModuleBadge('customers', metrics.atRiskCustomers);
    }
  }, [metrics.atRiskCustomers, updateModuleBadge]);

  // Load and analyze customer data
  const loadCustomerData = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ REAL API CALL - Fetch customers from database
      const fetchedCustomers = await CustomerAPI.getCustomers(user, {
        status: 'active',
        limit: 1000 // Adjust as needed
      });

      setCustomers(fetchedCustomers);

      // Generate analytics using business logic
      if (fetchedCustomers.length > 0) {
        // Fetch real sales data from Sales module
        const customerIds = fetchedCustomers.map(c => c.id);

        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*, sale_items(*)')
          .in('customer_id', customerIds);

        if (salesError) {
          logger.error('App', 'Error loading sales data for analytics:', salesError);
        }

        // Map sales data to expected format
        const sales: Sale[] = salesData?.map(sale => ({
          id: sale.id,
          customer_id: sale.customer_id,
          total: Number(sale.total || 0),
          subtotal: Number(sale.subtotal || 0),
          tax: Number(sale.tax || 0),
          discount: Number(sale.discount || 0),
          created_at: sale.created_at,
          payment_method: sale.payment_method,
          status: sale.status,
        })) || [];

        const saleItems: SaleItem[] = salesData?.flatMap(sale =>
          (sale.sale_items || []).map((item: Record<string, unknown>) => ({
            id: item.id,
            sale_id: item.sale_id,
            product_id: item.product_id,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            subtotal: Number(item.subtotal || 0),
          }))
        ) || [];

        const analytics = await CustomerAnalyticsEngine.generateCustomerAnalytics(
          fetchedCustomers,
          sales,
          saleItems,
          {
            analysisMonths: pageState.analyticsTimeRange === 'month' ? 1 :
                          pageState.analyticsTimeRange === 'quarter' ? 3 : 12,
            includeSeasonalAnalysis: true,
            includePredictiveAnalytics: true,
            includeProductRecommendations: true
          }
        );

        setAnalyticsResult(analytics);

        // Fetch real RFM profiles from database
        const { data: rfmData, error: rfmError } = await supabase
          .from('customer_rfm_profiles')
          .select('*')
          .in('customer_id', customerIds);

        if (rfmError) {
          logger.error('App', 'Error loading RFM profiles:', rfmError);
        }

        const rfmProfiles: CustomerRFMProfile[] = rfmData?.map(profile => ({
          customer_id: profile.customer_id,
          customer_name: profile.customer_name || '',
          email: profile.email,
          recency: profile.recency || 0,
          frequency: profile.frequency || 0,
          monetary: Number(profile.monetary || 0),
          recency_score: profile.recency_score || 0,
          frequency_score: profile.frequency_score || 0,
          monetary_score: profile.monetary_score || 0,
          rfm_score: profile.rfm_score || '',
          segment: profile.segment || 'Unknown',
          total_orders: profile.total_orders || 0,
          total_spent: Number(profile.total_spent || 0),
          avg_order_value: Number(profile.avg_order_value || 0),
          first_purchase_date: profile.first_purchase_date || '',
          last_purchase_date: profile.last_purchase_date || '',
          clv_estimate: Number(profile.clv_estimate || 0),
          churn_risk: profile.churn_risk || 'Low',
          recommended_action: profile.recommended_action || 'Monitor',
        })) || [];

        setRfmProfiles(rfmProfiles);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading customer data');
      await alertActions.create(customersAlertsAdapter.analyticsLoadFailed(error));
      logger.error('App', 'Error loading customer data:', err);
    } finally {
      setLoading(false);
    }
  }, [pageState.analyticsTimeRange, user, alertActions]);

  // Initialize data loading
  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Additional action handlers
  const handleEditCustomer = useCallback((customerId: string) => {
    setPageState(prev => ({ ...prev, selectedCustomerId: customerId }));
    // TODO: Open customer edit modal
    logger.info('App', 'Editing customer:', customerId);
  }, []);

  const handleViewCustomer = useCallback((customerId: string) => {
    setPageState(prev => ({ ...prev, selectedCustomerId: customerId }));
    // TODO: Open customer details modal
    logger.info('App', 'Viewing customer:', customerId);
  }, []);

  const handleDeleteCustomer = useCallback((customerId: string) => {
    // TODO: Implement customer deletion with confirmation
    logger.info('App', 'Deleting customer:', customerId);
  }, []);

  const handleGenerateReport = useCallback(() => {
    // TODO: Generate comprehensive customer report
    logger.info('App', 'Generating customer report...');
  }, []);

  const handlePointsManagement = useCallback(() => {
    // TODO: Open points management interface
    logger.info('App', 'Opening points management...');
  }, []);

  const handleViewOrders = useCallback((customerId: string) => {
    setActiveSection('orders');
    setPageState(prev => ({ ...prev, selectedCustomerId: customerId }));
  }, [setActiveSection]);

  const handleOrderHistory = useCallback(() => {
    setActiveSection('orders');
  }, [setActiveSection]);

  // Toggle handlers
  const toggleRFMAnalysis = useCallback(() => {
    setPageState(prev => ({ ...prev, showRFMAnalysis: !prev.showRFMAnalysis }));
  }, []);

  const toggleCustomerSegments = useCallback(() => {
    setPageState(prev => ({ ...prev, showCustomerSegments: !prev.showCustomerSegments }));
  }, []);

  const toggleChurnPrediction = useCallback(() => {
    setPageState(prev => ({ ...prev, showChurnPrediction: !prev.showChurnPrediction }));
  }, []);

  // Utility handlers
  const setAnalyticsTimeRange = useCallback((range: 'month' | 'quarter' | 'year') => {
    setPageState(prev => ({ ...prev, analyticsTimeRange: range }));
  }, []);

  const refreshAnalytics = useCallback(async () => {
    await loadCustomerData();
  }, [loadCustomerData]);

  // Filtered data helpers
  const getCustomersBySegment = useCallback((segment: string) => {
    if (!analyticsResult) return [];

    const segmentData = analyticsResult.segments.find(s => s.id === segment);
    if (!segmentData) return [];

    return customers.filter(c => segmentData.customerIds.includes(c.id));
  }, [customers, analyticsResult]);

  const getHighValueCustomers = useCallback(() => {
    return customers.filter(c => c.total_spent >= 500);
  }, [customers]);

  const getAtRiskCustomers = useCallback(() => {
    if (!analyticsResult) return [];

    const atRiskIds = analyticsResult.customerAnalyses
      .filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical')
      .map(c => c.customerId);

    return customers.filter(c => atRiskIds.includes(c.id));
  }, [customers, analyticsResult]);

  const getNewCustomers = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return customers.filter(c =>
      new Date(c.registration_date) >= thirtyDaysAgo
    );
  }, [customers]);

  // Analytics helpers
  const calculateSegmentMetrics = useCallback(() => {
    if (!analyticsResult) return {};

    return analyticsResult.segments.reduce((acc, segment) => {
      acc[segment.id] = {
        customers: segment.totalCustomers,
        revenue: segment.totalRevenue,
        averageSpend: segment.averageSpend,
        retentionRate: segment.retentionRate
      };
      return acc;
    }, {} as Record<string, {
      customers: number;
      revenue: number;
      averageSpend: number;
      retentionRate: number;
    }>);
  }, [analyticsResult]);

  const getChurnPredictions = useCallback(() => {
    if (!analyticsResult) return [];
    return analyticsResult.predictions.churnPredictions;
  }, [analyticsResult]);

  // Actions object
  const actions: CustomersPageActions = {
    setActiveSection,
    handleNewCustomer,
    handleEditCustomer,
    handleViewCustomer,
    handleDeleteCustomer,
    handleRFMAnalysis,
    handleCustomerSegments,
    handleChurnPrediction,
    handleGenerateReport,
    handleLoyaltyProgram,
    handlePointsManagement,
    handleViewOrders,
    handleOrderHistory,
    toggleRFMAnalysis,
    toggleCustomerSegments,
    toggleChurnPrediction,
    setAnalyticsTimeRange,
    refreshAnalytics
  };

  return {
    pageState,
    customers,
    metrics,
    analyticsResult,
    rfmProfiles,
    loading,
    error: null, // Deprecated - using useAlerts now
    actions,
    getCustomersBySegment,
    getHighValueCustomers,
    getAtRiskCustomers,
    getNewCustomers,
    calculateSegmentMetrics,
    getChurnPredictions
  };
};