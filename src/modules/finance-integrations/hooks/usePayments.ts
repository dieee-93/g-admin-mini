/**
 * Payment Methods & Gateways - TanStack Query Hooks
 * Server state management for payments configuration
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 * 
 * @module finance-integrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  fetchPaymentMethods,
  fetchActivePaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  fetchPaymentGateways,
  fetchActivePaymentGateways,
  createPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
} from '../services/paymentsApi';
import type { PaymentMethod, PaymentGateway } from '../services/paymentsApi';

// ============================================
// QUERY KEYS
// ============================================

export const paymentMethodsKeys = {
  all: ['payment-methods'] as const,
  lists: () => [...paymentMethodsKeys.all, 'list'] as const,
  list: (activeOnly?: boolean) => [...paymentMethodsKeys.lists(), { activeOnly }] as const,
  details: () => [...paymentMethodsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentMethodsKeys.details(), id] as const,
};

export const paymentGatewaysKeys = {
  all: ['payment-gateways'] as const,
  lists: () => [...paymentGatewaysKeys.all, 'list'] as const,
  list: (activeOnly?: boolean) => [...paymentGatewaysKeys.lists(), { activeOnly }] as const,
  details: () => [...paymentGatewaysKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentGatewaysKeys.details(), id] as const,
};

export const webhookEventsKeys = {
  all: ['webhook-events'] as const,
  lists: () => [...webhookEventsKeys.all, 'list'] as const,
  list: (filters?: { provider?: string; status?: string; limit?: number }) =>
    [...webhookEventsKeys.lists(), filters] as const,
  details: () => [...webhookEventsKeys.all, 'detail'] as const,
  detail: (id: string) => [...webhookEventsKeys.details(), id] as const,
};

// ============================================
// PAYMENT METHODS QUERIES
// ============================================

/**
 * Hook to fetch all payment methods
 */
export function usePaymentMethods(activeOnly = false) {
  return useQuery({
    queryKey: paymentMethodsKeys.list(activeOnly),
    queryFn: async () => {
      return activeOnly 
        ? await fetchActivePaymentMethods() 
        : await fetchPaymentMethods();
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  });
}

/**
 * Hook to fetch active payment methods only
 */
export function useActivePaymentMethods() {
  return usePaymentMethods(true);
}

// ============================================
// PAYMENT METHODS MUTATIONS
// ============================================

/**
 * Hook to create a new payment method
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
      return await createPaymentMethod(method);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
      notify.success({
        title: 'Método de pago creado',
        description: `"${data.name}" agregado correctamente`
      });
    },
    onError: (error) => {
      logger.error('useCreatePaymentMethod', 'Failed to create payment method', error);
      notify.error({
        title: 'Error al crear método de pago',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

/**
 * Hook to update a payment method
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentMethod> }) => {
      return await updatePaymentMethod(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: paymentMethodsKeys.lists() });

      const previousMethods = queryClient.getQueryData(paymentMethodsKeys.list());

      queryClient.setQueryData(paymentMethodsKeys.list(), (old: PaymentMethod[] | undefined) => {
        if (!old) return old;
        return old.map(method => 
          method.id === id ? { ...method, ...updates } : method
        );
      });

      return { previousMethods };
    },
    onError: (error, _, context) => {
      if (context?.previousMethods) {
        queryClient.setQueryData(paymentMethodsKeys.list(), context.previousMethods);
      }
      logger.error('useUpdatePaymentMethod', 'Failed to update payment method', error);
      notify.error({
        title: 'Error al actualizar método de pago',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
      notify.success({
        title: 'Método actualizado',
        description: 'Método de pago actualizado correctamente'
      });
    },
  });
}

/**
 * Hook to delete a payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deletePaymentMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
      notify.success({
        title: 'Método eliminado',
        description: 'Método de pago eliminado correctamente'
      });
    },
    onError: (error) => {
      logger.error('useDeletePaymentMethod', 'Failed to delete payment method', error);
      notify.error({
        title: 'Error al eliminar método de pago',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

// ============================================
// PAYMENT GATEWAYS QUERIES
// ============================================

/**
 * Hook to fetch all payment gateways
 */
export function usePaymentGateways(activeOnly = false) {
  return useQuery({
    queryKey: paymentGatewaysKeys.list(activeOnly),
    queryFn: async () => {
      return activeOnly 
        ? await fetchActivePaymentGateways() 
        : await fetchPaymentGateways();
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  });
}

/**
 * Hook to fetch active payment gateways only
 */
export function useActivePaymentGateways() {
  return usePaymentGateways(true);
}

// ============================================
// PAYMENT GATEWAYS MUTATIONS
// ============================================

/**
 * Hook to create a new payment gateway
 */
export function useCreatePaymentGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gateway: Omit<PaymentGateway, 'id' | 'created_at' | 'updated_at'>) => {
      return await createPaymentGateway(gateway);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentGatewaysKeys.lists() });
      notify.success({
        title: 'Gateway de pago creado',
        description: `"${data.name || data.type}" agregado correctamente`
      });
    },
    onError: (error) => {
      logger.error('useCreatePaymentGateway', 'Failed to create payment gateway', error);
      notify.error({
        title: 'Error al crear gateway de pago',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

/**
 * Hook to update a payment gateway
 */
export function useUpdatePaymentGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentGateway> }) => {
      return await updatePaymentGateway(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: paymentGatewaysKeys.lists() });

      const previousGateways = queryClient.getQueryData(paymentGatewaysKeys.list());

      queryClient.setQueryData(paymentGatewaysKeys.list(), (old: PaymentGateway[] | undefined) => {
        if (!old) return old;
        return old.map(gateway => 
          gateway.id === id ? { ...gateway, ...updates } : gateway
        );
      });

      return { previousGateways };
    },
    onError: (error, _, context) => {
      if (context?.previousGateways) {
        queryClient.setQueryData(paymentGatewaysKeys.list(), context.previousGateways);
      }
      logger.error('useUpdatePaymentGateway', 'Failed to update payment gateway', error);
      notify.error({
        title: 'Error al actualizar gateway de pago',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentGatewaysKeys.lists() });
      notify.success({
        title: 'Gateway actualizado',
        description: 'Gateway de pago actualizado correctamente'
      });
    },
  });
}

/**
 * Hook to delete a payment gateway
 */
export function useDeletePaymentGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deletePaymentGateway(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentGatewaysKeys.lists() });
      notify.success({
        title: 'Gateway eliminado',
        description: 'Gateway de pago eliminado correctamente'
      });
    },
    onError: (error) => {
      logger.error('useDeletePaymentGateway', 'Failed to delete payment gateway', error);
      notify.error({
        title: 'Error al eliminar gateway de pago',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

// ============================================
// COMPUTED QUERIES
// ============================================

/**
 * Hook to get payment statistics
 */
export function usePaymentStats() {
  const { data: methods = [] } = usePaymentMethods();
  const { data: gateways = [] } = usePaymentGateways();

  return {
    totalMethods: methods.length,
    activeMethods: methods.filter(m => m.is_active).length,
    totalGateways: gateways.length,
    activeGateways: gateways.filter(g => g.is_active).length,
    onlineGateways: gateways.filter(g => g.type === 'online' && g.is_active).length,
    subscriptionCapable: gateways.filter(g => g.supports_subscriptions && g.is_active).length,
  };
}

// ============================================
// WEBHOOK EVENTS QUERIES
// ============================================

export interface WebhookEvent {
  id: string;
  provider: string;
  event_type: string;
  payload: any;
  status: 'pending' | 'processed' | 'failed' | 'retrying';
  attempts: number;
  sale_payment_id?: string;
  external_id?: string;
  processed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch webhook events from database
 */
async function fetchWebhookEvents(filters?: {
  provider?: string;
  status?: string;
  limit?: number;
}): Promise<WebhookEvent[]> {
  const { supabase } = await import('@/lib/supabase/client');

  let query = supabase
    .from('webhook_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.provider) {
    query = query.eq('provider', filters.provider);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  } else {
    query = query.limit(100); // Default limit
  }

  const { data, error } = await query;

  if (error) {
    logger.error('fetchWebhookEvents', 'Failed to fetch webhook events', error);
    throw error;
  }

  return data || [];
}

/**
 * Hook to fetch webhook events
 */
export function useWebhookEvents(filters?: {
  provider?: string;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: webhookEventsKeys.list(filters),
    queryFn: async () => {
      logger.debug('useWebhookEvents', 'Fetching webhook events', filters);
      return await fetchWebhookEvents(filters);
    },
    staleTime: 30 * 1000, // 30 seconds - webhooks are time-sensitive
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
}

/**
 * Hook to get webhook statistics
 */
export function useWebhookStats() {
  const { data: events = [] } = useWebhookEvents({ limit: 1000 });

  return {
    totalEvents: events.length,
    pendingEvents: events.filter(e => e.status === 'pending').length,
    processedEvents: events.filter(e => e.status === 'processed').length,
    failedEvents: events.filter(e => e.status === 'failed').length,
    retryingEvents: events.filter(e => e.status === 'retrying').length,
    byProvider: {
      mercadopago: events.filter(e => e.provider === 'mercadopago').length,
      modo: events.filter(e => e.provider === 'modo').length,
    },
    avgAttempts: events.length > 0
      ? events.reduce((sum, e) => sum + e.attempts, 0) / events.length
      : 0,
  };
}

// ============================================
// PAYMENT ANALYTICS
// ============================================

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  avgTransactionAmount: number;
  byProvider: {
    provider: string;
    count: number;
    volume: number;
    successRate: number;
  }[];
  byPaymentType: {
    type: string;
    count: number;
    volume: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
}

/**
 * Fetch payment analytics from sale_payments
 */
async function fetchPaymentAnalytics(timeRange?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<PaymentAnalytics> {
  const { supabase } = await import('@/lib/supabase/client');

  let query = supabase
    .from('sale_payments')
    .select('*');

  if (timeRange?.startDate) {
    query = query.gte('created_at', timeRange.startDate.toISOString());
  }

  if (timeRange?.endDate) {
    query = query.lte('created_at', timeRange.endDate.toISOString());
  }

  const { data: payments, error } = await query;

  if (error) {
    logger.error('fetchPaymentAnalytics', 'Failed to fetch payments', error);
    throw error;
  }

  if (!payments || payments.length === 0) {
    return {
      totalTransactions: 0,
      totalVolume: 0,
      successRate: 0,
      avgTransactionAmount: 0,
      byProvider: [],
      byPaymentType: [],
      byStatus: [],
    };
  }

  // Calculate metrics
  const totalTransactions = payments.length;
  const totalVolume = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const settledPayments = payments.filter(p => p.status === 'SETTLED');
  const successRate = (settledPayments.length / totalTransactions) * 100;
  const avgTransactionAmount = totalVolume / totalTransactions;

  // Group by provider (from metadata)
  const providerMap = new Map<string, { count: number; volume: number; settled: number }>();
  payments.forEach(p => {
    const provider = p.metadata?.provider || p.provider || 'unknown';
    const current = providerMap.get(provider) || { count: 0, volume: 0, settled: 0 };
    current.count += 1;
    current.volume += Number(p.amount) || 0;
    if (p.status === 'SETTLED') current.settled += 1;
    providerMap.set(provider, current);
  });

  const byProvider = Array.from(providerMap.entries()).map(([provider, data]) => ({
    provider,
    count: data.count,
    volume: data.volume,
    successRate: (data.settled / data.count) * 100,
  }));

  // Group by payment type
  const typeMap = new Map<string, { count: number; volume: number }>();
  payments.forEach(p => {
    const type = p.payment_type || 'UNKNOWN';
    const current = typeMap.get(type) || { count: 0, volume: 0 };
    current.count += 1;
    current.volume += Number(p.amount) || 0;
    typeMap.set(type, current);
  });

  const byPaymentType = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    volume: data.volume,
  }));

  // Group by status
  const statusMap = new Map<string, number>();
  payments.forEach(p => {
    const status = p.status || 'UNKNOWN';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    totalTransactions,
    totalVolume,
    successRate,
    avgTransactionAmount,
    byProvider,
    byPaymentType,
    byStatus,
  };
}

/**
 * Hook to fetch payment analytics
 */
export function usePaymentAnalytics(timeRange?: {
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: ['payment-analytics', timeRange],
    queryFn: async () => {
      logger.debug('usePaymentAnalytics', 'Fetching analytics', timeRange);
      return await fetchPaymentAnalytics(timeRange);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
