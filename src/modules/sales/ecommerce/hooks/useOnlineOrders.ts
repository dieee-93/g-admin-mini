/**
 * useOnlineOrders Hook
 * Manages online orders from e-commerce channel
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import { salesAlertsAdapter } from '../../services/salesAlertsAdapter';
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

export function useOnlineOrders() {
  const [orders, setOrders] = useState<OnlineOrderExtended[]>([]);
  const [loading, setLoading] = useState(true);
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
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

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
        throw fetchError;
      }

      // Transform data to match interface
      const transformedData = (data || []).map(order => ({
        ...order,
        customer: Array.isArray(order.customer) ? order.customer[0] : order.customer,
      }));

      setOrders(transformedData as OnlineOrderExtended[]);
      logger.info('EcommerceModule', `✅ Loaded ${transformedData.length} online orders`);
    } catch (err) {
      const error = err as Error;
      logger.error('EcommerceModule', '❌ Error loading online orders:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Load Orders',
        description: `Error loading online orders: ${error.message}`,
        metadata: {
          errorCode: error.name,
        },
        autoExpire: 10,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, alertActions]);

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    updates: {
      order_status?: string;
      payment_status?: string;
    }
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId ? { ...o, ...updates } : o
        )
      );

      logger.info('EcommerceModule', `✅ Updated order ${orderId} status`);
      return { success: true };
    } catch (err) {
      const error = err as Error;
      logger.error('EcommerceModule', '❌ Error updating order status:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Update Order',
        description: `Error updating order ${orderId}: ${error.message}`,
        metadata: {
          itemId: orderId,
          errorCode: error.name,
          relatedUrl: `/sales/orders/${orderId}`,
        },
        autoExpire: 15,
      });

      throw error;
    }
  };

  // Load orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    filters,
    setFilters,
    fetchOrders,
    updateOrderStatus,
  };
}
