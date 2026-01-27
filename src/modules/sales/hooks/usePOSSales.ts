/**
 * usePOSSales Hook
 * TanStack Query hook for managing POS sales operations
 * 
 * FEATURES:
 * - Sales list with filters (date, customer, status, payment method)
 * - Individual sale queries
 * - Sales mutations (create, delete)
 * - Sales summary and analytics
 * - Auto-refresh and caching
 * - Integrated error handling
 * 
 * ARCHITECTURE:
 * - Uses posApi from module services
 * - TanStack Query for state management
 * - Global alerts integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchSales,
  fetchSaleById,
  deleteSale,
  getSalesSummary,
  processSale,
  fetchTransactions,
  fetchOrders,
  getTopSellingProducts,
  getCustomerPurchases,
} from '../services/posApi';
import type {
  SalesListFilters,
  CreateSaleData,
  SaleProcessResult,
} from '../types/pos';

// ==================== Query Keys ====================

export const POS_SALES_KEYS = {
  all: ['pos-sales'] as const,
  lists: () => [...POS_SALES_KEYS.all, 'list'] as const,
  list: (filters?: SalesListFilters) => [...POS_SALES_KEYS.lists(), filters] as const,
  details: () => [...POS_SALES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...POS_SALES_KEYS.details(), id] as const,
  summary: (dateFrom: string, dateTo: string) => 
    [...POS_SALES_KEYS.all, 'summary', dateFrom, dateTo] as const,
  transactions: (period: string) => 
    [...POS_SALES_KEYS.all, 'transactions', period] as const,
  orders: (status?: string) => 
    [...POS_SALES_KEYS.all, 'orders', status] as const,
  topProducts: (dateFrom: string, dateTo: string, limit: number) =>
    [...POS_SALES_KEYS.all, 'top-products', dateFrom, dateTo, limit] as const,
  customerPurchases: (customerId: string) =>
    [...POS_SALES_KEYS.all, 'customer-purchases', customerId] as const,
};

// ==================== Main Hook ====================

/**
 * Get POS sales with filters
 */
export function usePOSSales(filters?: SalesListFilters) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  const queryKey = POS_SALES_KEYS.list(filters);

  // Fetch sales
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchSales(filters, user),
    staleTime: 5 * 60 * 1000, // 5 minutes - increased from 30s to reduce refetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache time (formerly cacheTime)
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: (saleData: CreateSaleData) => processSale(saleData),
    onSuccess: (result: SaleProcessResult) => {
      queryClient.invalidateQueries({ queryKey: POS_SALES_KEYS.lists() });
      logger.info('App', '✅ Sale created successfully', { saleId: result.sale.id });
      
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'low',
        title: 'Sale Created',
        description: `Sale #${result.sale.id} processed successfully`,
        autoExpire: 5,
        intelligence_level: 'simple',
      });
    },
    onError: (error: any) => {
      logger.error('App', '❌ Error creating sale:', error);
      
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'high',
        title: 'Sale Creation Failed',
        description: error.message || 'Failed to create sale',
        autoExpire: 10,
        intelligence_level: 'simple',
      });
    },
  });

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_SALES_KEYS.lists() });
      logger.info('App', '✅ Sale deleted successfully');
    },
    onError: (error: any) => {
      logger.error('App', '❌ Error deleting sale:', error);
      
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Sale Deletion Failed',
        description: error.message || 'Failed to delete sale',
        autoExpire: 10,
        intelligence_level: 'simple',
      });
    },
  });

  return {
    // Data
    sales: data,
    isLoading,
    error: error as Error | null,
    
    // Actions
    refetch,
    createSale: createSaleMutation.mutateAsync,
    deleteSale: deleteSaleMutation.mutateAsync,
    
    // Mutation states
    isCreating: createSaleMutation.isPending,
    isDeleting: deleteSaleMutation.isPending,
  };
}

// ==================== Individual Sale Hook ====================

/**
 * Get a single sale by ID
 */
export function usePOSSale(id: string) {
  const queryKey = POS_SALES_KEYS.detail(id);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchSaleById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    sale: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// ==================== Sales Summary Hook ====================

/**
 * Get sales summary for a date range
 */
export function usePOSSalesSummary(dateFrom: string, dateTo: string) {
  const queryKey = POS_SALES_KEYS.summary(dateFrom, dateTo);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getSalesSummary(dateFrom, dateTo),
    enabled: !!(dateFrom && dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    summary: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// ==================== Transactions Hook ====================

/**
 * Get transactions for a period
 */
export function usePOSTransactions(period: string = 'today') {
  const queryKey = POS_SALES_KEYS.transactions(period);

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTransactions(period),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  return {
    transactions: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// ==================== Orders Hook ====================

/**
 * Get orders by status
 */
export function usePOSOrders(status?: string) {
  const queryKey = POS_SALES_KEYS.orders(status);

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchOrders(status),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 45 * 1000, // Auto-refresh every 45 seconds
  });

  return {
    orders: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// ==================== Top Products Hook ====================

/**
 * Get top selling products for a date range
 */
export function usePOSTopProducts(
  dateFrom: string,
  dateTo: string,
  limit: number = 10
) {
  const queryKey = POS_SALES_KEYS.topProducts(dateFrom, dateTo, limit);

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getTopSellingProducts(dateFrom, dateTo, limit),
    enabled: !!(dateFrom && dateTo),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    topProducts: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// ==================== Customer Purchases Hook ====================

/**
 * Get purchases for a specific customer
 */
export function usePOSCustomerPurchases(customerId: string) {
  const queryKey = POS_SALES_KEYS.customerPurchases(customerId);

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getCustomerPurchases(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    purchases: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
