// ============================================
// SUPPLIER HISTORY SERVICE
// ============================================
// Service for retrieving and analyzing supplier historical data

import type { SupplierOrderWithDetails } from '@/pages/admin/supply-chain/supplier-orders/types';
import { logger } from '@/lib/logging';

export interface SupplierHistoryMetrics {
  totalOrders: number;
  draftOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  totalValue: number;
  averageOrderValue: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeDeliveryRate: number;
  averageDeliveryDays: number;
  averageDelayDays: number;
}

export interface DeliveryMetric {
  orderId: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  isOnTime: boolean;
  delayDays: number;
  totalValue: number;
}

/**
 * Supplier History Service
 * Provides historical analysis for supplier performance
 */
export const supplierHistoryService = {
  /**
   * Get comprehensive historical metrics for a supplier
   */
  getSupplierHistory(orders: SupplierOrderWithDetails[]): SupplierHistoryMetrics {
    try {
      const totalOrders = orders.length;

      // Count by status
      const draftOrders = orders.filter(o => o.status === 'draft').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const approvedOrders = orders.filter(o => o.status === 'approved').length;
      const receivedOrders = orders.filter(o => o.status === 'received').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

      // Calculate total value
      const totalValue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

      // Calculate delivery metrics
      const deliveredOrders = orders.filter(o =>
        o.status === 'received' &&
        o.received_at &&
        o.expected_delivery_date
      );

      let onTimeDeliveries = 0;
      let lateDeliveries = 0;
      let totalDeliveryDays = 0;
      let totalDelayDays = 0;

      deliveredOrders.forEach(order => {
        const expected = new Date(order.expected_delivery_date!);
        const actual = new Date(order.received_at!);
        const created = new Date(order.created_at);

        const deliveryDays = Math.floor(
          (actual.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDeliveryDays += deliveryDays;

        const delayDays = Math.floor(
          (actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (delayDays <= 0) {
          onTimeDeliveries++;
        } else {
          lateDeliveries++;
          totalDelayDays += delayDays;
        }
      });

      const onTimeDeliveryRate = deliveredOrders.length > 0
        ? (onTimeDeliveries / deliveredOrders.length) * 100
        : 0;

      const averageDeliveryDays = deliveredOrders.length > 0
        ? totalDeliveryDays / deliveredOrders.length
        : 0;

      const averageDelayDays = lateDeliveries > 0
        ? totalDelayDays / lateDeliveries
        : 0;

      return {
        totalOrders,
        draftOrders,
        pendingOrders,
        approvedOrders,
        receivedOrders,
        cancelledOrders,
        totalValue,
        averageOrderValue,
        onTimeDeliveries,
        lateDeliveries,
        onTimeDeliveryRate,
        averageDeliveryDays,
        averageDelayDays
      };
    } catch (error) {
      logger.error('SupplierHistoryService', 'Error calculating supplier history', error);
      throw error;
    }
  },

  /**
   * Get detailed delivery metrics for timeline visualization
   */
  getDeliveryMetrics(orders: SupplierOrderWithDetails[]): DeliveryMetric[] {
    try {
      return orders
        .filter(o => o.status === 'received' && o.received_at)
        .map(order => {
          const expected = order.expected_delivery_date
            ? new Date(order.expected_delivery_date)
            : null;
          const actual = order.received_at
            ? new Date(order.received_at)
            : null;

          let delayDays = 0;
          let isOnTime = true;

          if (expected && actual) {
            delayDays = Math.floor(
              (actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)
            );
            isOnTime = delayDays <= 0;
          }

          return {
            orderId: order.id,
            poNumber: order.po_number,
            orderDate: order.created_at,
            expectedDeliveryDate: order.expected_delivery_date,
            actualDeliveryDate: order.received_at,
            isOnTime,
            delayDays,
            totalValue: Number(order.total_amount)
          };
        })
        .sort((a, b) =>
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        );
    } catch (error) {
      logger.error('SupplierHistoryService', 'Error getting delivery metrics', error);
      throw error;
    }
  },

  /**
   * Get monthly spending trend for a supplier
   */
  getMonthlySpending(orders: SupplierOrderWithDetails[], months: number = 12): Array<{
    month: string;
    spending: number;
    orderCount: number;
  }> {
    try {
      const now = new Date();
      const monthlyData = new Map<string, { spending: number; orderCount: number }>();

      // Initialize last N months
      for (let i = 0; i < months; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(key, { spending: 0, orderCount: 0 });
      }

      // Aggregate orders by month
      orders
        .filter(o => o.status !== 'cancelled')
        .forEach(order => {
          const orderDate = new Date(order.created_at);
          const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

          if (monthlyData.has(key)) {
            const data = monthlyData.get(key)!;
            data.spending += Number(order.total_amount);
            data.orderCount += 1;
          }
        });

      // Convert to array and sort
      return Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          spending: data.spending,
          orderCount: data.orderCount
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      logger.error('SupplierHistoryService', 'Error calculating monthly spending', error);
      throw error;
    }
  },

  /**
   * Calculate defect rate from orders
   * (This would require additional fields in the database to track defects)
   * TODO: Implement defect tracking in supplier_orders table (add defect_count, quality_score columns)
   * TODO: Create defect_reports table to track quality issues
   */
  calculateDefectRate(orders: SupplierOrderWithDetails[]): number {
    // Placeholder: In real implementation, would check for defect records
    // Would query defect_reports table and calculate percentage
    // For now, return 0 until defect tracking is implemented
    logger.debug('SupplierHistoryService', `Defect calculation not implemented - processed ${orders.length} orders`);
    return 0;
  },

  /**
   * Calculate average lead time in days
   */
  calculateAverageLeadTime(orders: SupplierOrderWithDetails[]): number {
    const deliveredOrders = orders.filter(o =>
      o.status === 'received' &&
      o.received_at
    );

    if (deliveredOrders.length === 0) return 0;

    const totalDays = deliveredOrders.reduce((sum, order) => {
      const created = new Date(order.created_at);
      const received = new Date(order.received_at!);
      const days = Math.floor(
        (received.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);

    return totalDays / deliveredOrders.length;
  },

  /**
   * Calculate lead time variability (standard deviation)
   */
  calculateLeadTimeVariability(orders: SupplierOrderWithDetails[]): number {
    const deliveredOrders = orders.filter(o =>
      o.status === 'received' &&
      o.received_at
    );

    if (deliveredOrders.length === 0) return 0;

    // Calculate lead times
    const leadTimes = deliveredOrders.map(order => {
      const created = new Date(order.created_at);
      const received = new Date(order.received_at!);
      return Math.floor(
        (received.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
    });

    // Calculate mean
    const mean = leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length;

    // Calculate variance
    const variance = leadTimes.reduce(
      (sum, time) => sum + Math.pow(time - mean, 2),
      0
    ) / leadTimes.length;

    // Return standard deviation
    return Math.sqrt(variance);
  }
};
