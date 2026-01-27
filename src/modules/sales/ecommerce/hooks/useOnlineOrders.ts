/**
 * useOnlineOrders Hook
 * Manages online orders from e-commerce channel
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import type { OnlineOrdersFilters } from '../types';

export interface OnlineOrderExtended {
  id: string;
  customer_id?: string;
  order_type: string;
  order_status: string;
  payment_status: string;
  total: number;
  created_at: string;
  updated_at?: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
}

export const ONLINE_ORDERS_QUERY_KEY = ['online-orders'];

export function useOnlineOrders() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OnlineOrdersFilters>({
    status: 'all',
    payment_status: 'all',
  });

  // Connect to global alerts system
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  // Fetch online orders with filters
  const { 
    data: orders = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: [...ONLINE_ORDERS_QUERY_KEY, filters],
    queryFn: async () => {
      logger.debug('App', 'Fetching online orders', filters);
      
      let query = supabase
        .from('sales')
        .select(`
          id,
          customer_id,
          order_type,
          order_status,
          payment_status,
          total,
          created_at,
          updated_at,
          customer:customers(id, name, email)
        `)
        .eq('order_type', 'ECOMMERCE')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('order_status', filters.status.toUpperCase());
      }

      if (filters.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status.toUpperCase());
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // Create alert
        await alertActions.create({
          type: 'operational',
          context: 'sales',
          severity: 'medium',
          title: 'Failed to Load Orders',
          description: `Error loading online orders: ${fetchError.message}`,
          metadata: {
            errorCode: fetchError.code,
          },
          autoExpire: 10,
          intelligence_level: 'simple', 
        });
        throw fetchError;
      }

      // Transform data to match interface
      // Note: Casting 'order' to any to avoid spread errors with unknown types
      const transformedData = (data || []).map((order: any) => ({
        ...order,
        customer: Array.isArray(order.customer) ? order.customer[0] : order.customer,
      }));

      return transformedData as OnlineOrderExtended[];
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      updates 
    }: { 
      orderId: string, 
      updates: { order_status?: string; payment_status?: string } 
    }) => {
      // @ts-ignore
      const { error: updateError } = await (supabase
        .from('sales') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;
      return { orderId, updates };
    },
    onSuccess: ({ orderId, updates }) => {
      queryClient.invalidateQueries({ queryKey: ONLINE_ORDERS_QUERY_KEY });
      logger.info('App', `✅ Updated order ${orderId} status`, updates);
    },
    onError: (err: any, variables) => {
      logger.error('App', '❌ Error updating order status:', err);
      
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Update Order',
        description: `Error updating order ${variables.orderId}: ${err.message}`,
        metadata: {
          itemId: variables.orderId,
          errorCode: err.name,
          relatedUrl: `/sales/orders/${variables.orderId}`,
        },
        autoExpire: 15,
        intelligence_level: 'simple',
      });
    }
  });

  return {
    orders,
    loading,
    error: error as Error | null,
    filters,
    setFilters,
    fetchOrders: async () => { await queryClient.invalidateQueries({ queryKey: ONLINE_ORDERS_QUERY_KEY }) },
    updateOrderStatus: (orderId: string, updates: { order_status?: string; payment_status?: string }) => 
      updateOrderStatusMutation.mutateAsync({ orderId, updates }),
  };
}
