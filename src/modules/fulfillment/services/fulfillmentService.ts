/**
 * FULFILLMENT SERVICE - CORE
 *
 * Shared service for all fulfillment types (onsite, pickup, delivery).
 * Provides queue management, priority calculation, status transitions,
 * and notifications.
 *
 * REUSE: 100% - Used by all 3 fulfillment channels
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import { supabase } from '@/lib/supabase/client';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Fulfillment type discriminator
 */
export type FulfillmentType = 'onsite' | 'pickup' | 'delivery';

/**
 * Queue item status
 * Flow: pending → in_progress → ready → completed
 *                           ↓
 *                       cancelled (from any state)
 */
export type QueueStatus =
  | 'pending'      // Order received, waiting to be processed
  | 'in_progress'  // Being prepared
  | 'ready'        // Ready for customer
  | 'completed'    // Fulfilled successfully
  | 'cancelled';   // Cancelled

/**
 * Priority levels
 * 0 = Normal, 1 = High, 2 = Urgent, 3 = Critical
 */
export type Priority = 0 | 1 | 2 | 3;

/**
 * Order data (joined from sales table)
 */
export interface OrderData {
  id: string;
  number?: string;
  total?: string;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: string;
  }>;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    type?: 'regular' | 'member' | 'vip' | 'corporate';
  };
  location_id?: string;
  created_at?: string;
}

/**
 * Queue item interface
 */
export interface QueueItem {
  id: string;
  order_id: string;
  fulfillment_type: FulfillmentType;
  status: QueueStatus;
  assigned_to?: string;
  priority: Priority;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  location_id?: string;
  metadata?: OrderMetadata;
  created_at: string;
  updated_at: string;

  // Joined data (optional)
  order?: OrderData;
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Queue filters
 */
export interface QueueFilters {
  type?: FulfillmentType;
  status?: QueueStatus | QueueStatus[];
  location_id?: string;
  assigned_to?: string;
  priority?: Priority;
  date_from?: string;
  date_to?: string;
}

/**
 * Type-specific metadata
 */
export interface OrderMetadata {
  // Onsite
  table_number?: number;
  party_size?: number;
  waiter_id?: string;

  // Pickup
  pickup_time_slot?: string;
  pickup_code?: string;
  customer_phone?: string;

  // Delivery
  delivery_address?: string;
  delivery_zone_id?: string;
  driver_id?: string;
  driver_name?: string;
  eta_minutes?: number;
  current_location?: {
    lat: number;
    lng: number;
  };
}

/**
 * Priority context (for calculation)
 */
export interface PriorityContext {
  customer_type?: 'regular' | 'member' | 'vip' | 'corporate';
  order_value?: number;
  is_rush_hour?: boolean;
  special_instructions?: string;
}

/**
 * Notification event types
 */
export type NotificationEvent =
  | 'order_received'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'table_ready'
  | 'delivered'
  | 'completed';

/**
 * Notification channels
 */
export type NotificationChannel = 'sms' | 'email' | 'push' | 'in_app';

// ============================================
// FULFILLMENT SERVICE
// ============================================

export const fulfillmentService = {

  // ============================================
  // QUEUE OPERATIONS
  // ============================================

  /**
   * Add order to fulfillment queue
   *
   * @param orderId - Sales order ID
   * @param type - Fulfillment type (onsite, pickup, delivery)
   * @param metadata - Type-specific metadata
   * @returns Queue item created
   *
   * @example
   * await fulfillmentService.queueOrder('order-123', 'pickup', {
   *   pickup_time_slot: '2025-01-24T15:00:00Z',
   *   pickup_code: 'ABC123'
   * });
   */
  async queueOrder(
    orderId: string,
    type: FulfillmentType,
    metadata?: OrderMetadata
  ): Promise<QueueItem> {
    try {
      logger.debug('FulfillmentService', 'Queueing order', { orderId, type });

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('sales')
        .select('*, customer:customers(*), location:locations(*)')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Build priority context
      const context: PriorityContext = {
        customer_type: order.customer?.type || 'regular',
        order_value: parseFloat(order.total || '0'),
        is_rush_hour: this._isRushHour(),
      };

      // Calculate priority
      const priority = this.calculatePriority(order, type, context);

      // Calculate estimated ready time
      const estimated_ready_time = this._calculateEstimatedTime(order, type, metadata);

      // Insert into queue
      const { data: queueItem, error } = await supabase
        .from('fulfillment_queue')
        .insert({
          order_id: orderId,
          fulfillment_type: type,
          status: 'pending',
          priority,
          estimated_ready_time,
          location_id: order.location_id,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Emit event
      eventBus.emit(`fulfillment.${type}.queued`, {
        queueId: queueItem.id,
        orderId,
        type,
        priority,
        estimated_ready_time
      });

      logger.info('FulfillmentService', 'Order queued successfully', {
        queueId: queueItem.id,
        orderId,
        type,
        priority
      });

      // Notify staff
      await this.notifyStaff(
        queueItem.id,
        `New ${type} order #${order.number || orderId.slice(0, 8)} - Priority ${priority}`
      );

      return queueItem;
    } catch (error) {
      logger.error('FulfillmentService', 'Error queueing order', error);
      throw error;
    }
  },

  /**
   * Get queue items with filters
   *
   * @param filters - Optional filters
   * @returns Array of queue items
   *
   * @example
   * const pickupQueue = await fulfillmentService.getQueue({
   *   type: 'pickup',
   *   status: 'ready'
   * });
   */
  async getQueue(filters?: QueueFilters): Promise<QueueItem[]> {
    try {
      let query = supabase
        .from('fulfillment_queue')
        .select(`
          *,
          order:sales(
            id,
            number,
            total,
            customer:customers(id, name, email, phone, type)
          ),
          assigned_user:users(id, name, email)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      // Apply filters
      if (filters?.type) {
        query = query.eq('fulfillment_type', filters.type);
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }

      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters?.priority !== undefined) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('FulfillmentService', 'Error getting queue', error);
      throw error;
    }
  },

  /**
   * Get single queue item by ID
   *
   * @param queueId - Queue item ID
   * @returns Queue item or null
   */
  async getQueueItem(queueId: string): Promise<QueueItem | null> {
    try {
      const { data, error } = await supabase
        .from('fulfillment_queue')
        .select(`
          *,
          order:sales(
            id,
            number,
            total,
            items,
            customer:customers(*)
          ),
          assigned_user:users(id, name, email)
        `)
        .eq('id', queueId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('FulfillmentService', 'Error getting queue item', error);
      return null;
    }
  },

  /**
   * Update queue item status
   *
   * @param queueId - Queue item ID
   * @param status - New status
   * @param metadata - Optional metadata updates
   *
   * @example
   * await fulfillmentService.updateQueueStatus('queue-123', 'ready');
   */
  async updateQueueStatus(
    queueId: string,
    status: QueueStatus,
    metadata?: Partial<OrderMetadata>
  ): Promise<void> {
    try {
      // Get current item
      const currentItem = await this.getQueueItem(queueId);

      if (!currentItem) {
        throw new Error(`Queue item not found: ${queueId}`);
      }

      // Validate transition
      if (!this.canTransition(currentItem.status, status)) {
        throw new Error(
          `Invalid status transition: ${currentItem.status} → ${status}`
        );
      }

      // Build updates
      const updates: {
        status: QueueStatus;
        updated_at: string;
        actual_ready_time?: string;
        metadata?: OrderMetadata;
      } = {
        status,
        updated_at: new Date().toISOString()
      };

      // Set actual_ready_time if transitioning to 'ready'
      if (status === 'ready') {
        updates.actual_ready_time = new Date().toISOString();
      }

      // Merge metadata
      if (metadata) {
        updates.metadata = { ...currentItem.metadata, ...metadata };
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('fulfillment_queue')
        .update(updates)
        .eq('id', queueId);

      if (updateError) throw updateError;

      // Emit event
      eventBus.emit(`fulfillment.${currentItem.fulfillment_type}.${status}`, {
        queueId,
        orderId: currentItem.order_id,
        status,
        metadata
      });

      logger.info('FulfillmentService', 'Status updated', {
        queueId,
        oldStatus: currentItem.status,
        newStatus: status
      });

      // Notify customer on specific statuses
      if (status === 'ready' || status === 'completed') {
        await this._notifyCustomerStatus(currentItem, status, metadata);
      }
    } catch (error) {
      logger.error('FulfillmentService', 'Error updating status', error);
      throw error;
    }
  },

  /**
   * Assign order to staff member
   *
   * @param queueId - Queue item ID
   * @param assignedTo - User ID to assign to
   *
   * @example
   * await fulfillmentService.assignOrder('queue-123', 'user-456');
   */
  async assignOrder(queueId: string, assignedTo: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('fulfillment_queue')
        .update({
          assigned_to: assignedTo,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', queueId);

      if (error) throw error;

      // Notify assigned user
      await this.notifyStaff(queueId, 'New order assigned to you', assignedTo);

      logger.info('FulfillmentService', 'Order assigned', { queueId, assignedTo });
    } catch (error) {
      logger.error('FulfillmentService', 'Error assigning order', error);
      throw error;
    }
  },

  /**
   * Remove item from queue (complete or cancel)
   *
   * @param queueId - Queue item ID
   * @param reason - Reason for removal
   */
  async removeFromQueue(
    queueId: string,
    reason: 'completed' | 'cancelled'
  ): Promise<void> {
    try {
      const status: QueueStatus = reason === 'completed' ? 'completed' : 'cancelled';
      await this.updateQueueStatus(queueId, status);

      logger.info('FulfillmentService', 'Item removed from queue', { queueId, reason });
    } catch (error) {
      logger.error('FulfillmentService', 'Error removing from queue', error);
      throw error;
    }
  },

  // ============================================
  // PRIORITY MANAGEMENT
  // ============================================

  /**
   * Calculate priority score for an order
   *
   * Priority factors:
   * - Order value (20% weight)
   * - Customer type (25% weight)
   * - Fulfillment urgency (25% weight)
   * - Wait time (handled dynamically in reorderQueue)
   *
   * @param order - Order data
   * @param type - Fulfillment type
   * @param context - Priority context
   * @returns Priority level (0-3)
   */
  calculatePriority(
    order: OrderData,
    type: FulfillmentType,
    context?: PriorityContext
  ): Priority {
    let score = 0;

    // Order value factor (0-25 points)
    const value = DecimalUtils.fromString(order.total || '0');
    if (value.greaterThan(100)) score += 25;
    else if (value.greaterThan(50)) score += 15;
    else if (value.greaterThan(20)) score += 10;

    // Customer type factor (0-25 points)
    const customerType = context?.customer_type || order.customer?.type || 'regular';
    if (customerType === 'vip') score += 25;
    else if (customerType === 'corporate') score += 20;
    else if (customerType === 'member') score += 10;

    // Fulfillment type urgency (0-25 points)
    if (type === 'onsite') score += 25; // Highest urgency (customer waiting)
    else if (type === 'pickup') score += 15; // Medium urgency (time slot)
    else if (type === 'delivery') score += 10; // Lower urgency (flexible)

    // Rush hour bonus (0-10 points)
    if (context?.is_rush_hour) score += 10;

    // Special instructions bonus (0-5 points)
    if (context?.special_instructions) score += 5;

    // Convert score to priority level
    if (score >= 70) return 3; // Critical
    if (score >= 50) return 2; // Urgent
    if (score >= 30) return 1; // High
    return 0; // Normal
  },

  /**
   * Reorder queue based on priority + wait time
   *
   * Adds dynamic priority boost based on wait time:
   * - >45 min: Critical (priority 3)
   * - >30 min: Urgent (priority 2)
   * - >15 min: High (priority 1)
   *
   * @param locationId - Optional location filter
   */
  async reorderQueue(locationId?: string): Promise<void> {
    try {
      // Get all pending/in_progress items
      const items = await this.getQueue({
        location_id: locationId,
        status: ['pending', 'in_progress']
      });

      // Calculate dynamic priority (add wait time bonus)
      const now = new Date();
      const updates: Array<{ id: string; priority: Priority }> = [];

      for (const item of items) {
        const createdAt = new Date(item.created_at);
        const waitMinutes = (now.getTime() - createdAt.getTime()) / 60000;

        // Calculate dynamic priority
        let dynamicPriority = item.priority;

        if (waitMinutes > 45) {
          dynamicPriority = 3; // Critical after 45 min
        } else if (waitMinutes > 30) {
          dynamicPriority = Math.max(dynamicPriority, 2) as Priority;
        } else if (waitMinutes > 15) {
          dynamicPriority = Math.max(dynamicPriority, 1) as Priority;
        }

        // Only update if changed
        if (dynamicPriority !== item.priority) {
          updates.push({ id: item.id, priority: dynamicPriority });
        }
      }

      // Batch update priorities
      if (updates.length > 0) {
        for (const update of updates) {
          await supabase
            .from('fulfillment_queue')
            .update({ priority: update.priority })
            .eq('id', update.id);
        }

        logger.debug('FulfillmentService', 'Queue reordered', {
          itemsUpdated: updates.length
        });
      }
    } catch (error) {
      logger.error('FulfillmentService', 'Error reordering queue', error);
    }
  },

  /**
   * Manually boost order priority
   *
   * @param queueId - Queue item ID
   * @param boostLevel - Priority boost (1-3)
   */
  async boostPriority(queueId: string, boostLevel: 1 | 2 | 3): Promise<void> {
    try {
      const item = await this.getQueueItem(queueId);

      if (!item) {
        throw new Error(`Queue item not found: ${queueId}`);
      }

      const newPriority = Math.min(3, item.priority + boostLevel) as Priority;

      await supabase
        .from('fulfillment_queue')
        .update({ priority: newPriority })
        .eq('id', queueId);

      logger.info('FulfillmentService', 'Priority boosted', {
        queueId,
        oldPriority: item.priority,
        newPriority
      });

      notify.success({
        title: 'Priority Boosted',
        description: `Order priority increased to ${newPriority}`
      });
    } catch (error) {
      logger.error('FulfillmentService', 'Error boosting priority', error);
      throw error;
    }
  },

  // ============================================
  // STATUS TRANSITIONS
  // ============================================

  /**
   * Validate if status transition is allowed
   *
   * @param from - Current status
   * @param to - Target status
   * @returns True if transition is valid
   */
  canTransition(from: QueueStatus, to: QueueStatus): boolean {
    const validTransitions: Record<QueueStatus, QueueStatus[]> = {
      'pending': ['in_progress', 'cancelled'],
      'in_progress': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': []  // Final state
    };

    return validTransitions[from]?.includes(to) || false;
  },

  /**
   * Get allowed next statuses for a queue item
   *
   * @param currentStatus - Current status
   * @returns Array of allowed next statuses
   */
  getAllowedTransitions(currentStatus: QueueStatus): QueueStatus[] {
    const validTransitions: Record<QueueStatus, QueueStatus[]> = {
      'pending': ['in_progress', 'cancelled'],
      'in_progress': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    return validTransitions[currentStatus] || [];
  },

  /**
   * Transition status with validation
   * Alias for updateQueueStatus
   */
  async transitionStatus(
    queueId: string,
    to: QueueStatus,
    metadata?: Partial<OrderMetadata>
  ): Promise<void> {
    return this.updateQueueStatus(queueId, to, metadata);
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Notify staff member
   *
   * @param queueId - Queue item ID
   * @param message - Notification message
   * @param recipient - Optional specific recipient user ID
   */
  async notifyStaff(
    queueId: string,
    message: string,
    recipient?: string
  ): Promise<void> {
    try {
      logger.info('FulfillmentService', 'Staff notification', {
        queueId,
        message,
        recipient
      });

      // Show in-app toast
      notify.info({
        title: 'Fulfillment Update',
        description: message
      });

      // TODO: Integrate with staff notification system
      // - Push notifications
      // - In-app notifications
      // - SMS for urgent cases

    } catch (error) {
      logger.error('FulfillmentService', 'Error notifying staff', error);
    }
  },

  /**
   * Send batch notifications
   *
   * @param notifications - Array of notification data
   */
  async notifyBatch(
    notifications: Array<{
      queueId: string;
      message: string;
      recipient?: string;
    }>
  ): Promise<void> {
    try {
      for (const notification of notifications) {
        await this.notifyStaff(
          notification.queueId,
          notification.message,
          notification.recipient
        );
      }
    } catch (error) {
      logger.error('FulfillmentService', 'Error sending batch notifications', error);
    }
  },

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Notify customer of status change (PRIVATE)
   */
  async _notifyCustomerStatus(
    queueItem: QueueItem,
    status: QueueStatus,
    metadata?: Partial<OrderMetadata>
  ): Promise<void> {
    try {
      const customer = queueItem.order?.customer;
      const type = queueItem.fulfillment_type;

      if (!customer) {
        logger.warn('FulfillmentService', 'No customer data for notification', {
          queueId: queueItem.id
        });
        return;
      }

      // Build notification message
      let title = '';
      let message = '';

      if (status === 'ready') {
        if (type === 'onsite') {
          title = 'Your table is ready! 🍽️';
          message = `Table #${metadata?.table_number || queueItem.metadata?.table_number || 'N/A'} is now available.`;
        } else if (type === 'pickup') {
          title = 'Your order is ready for pickup! 📦';
          message = `Please proceed to the pickup counter. Code: ${metadata?.pickup_code || queueItem.metadata?.pickup_code || '---'}`;
        } else if (type === 'delivery') {
          title = 'Your order is out for delivery! 🚚';
          const driverName = metadata?.driver_name || queueItem.metadata?.driver_name || 'Our driver';
          const eta = metadata?.eta_minutes || queueItem.metadata?.eta_minutes || 30;
          message = `${driverName} is on the way. ETA: ${eta} minutes`;
        }
      } else if (status === 'completed') {
        title = 'Order completed! ✅';
        message = 'Thank you for your order. We hope you enjoyed it!';
      }

      // Log notification
      logger.info('FulfillmentService', 'Customer notification', {
        customerId: customer.id,
        customerName: customer.name,
        type,
        status,
        title,
        message
      });

      // Show toast in app
      notify.success({ title, description: message });

      // TODO: Integrate with actual notification services:
      // - SMS (Twilio)
      // - Email (SendGrid)
      // - Push notifications (Firebase)
      // - WhatsApp Business API

    } catch (error) {
      logger.error('FulfillmentService', 'Error notifying customer', error);
    }
  },

  /**
   * Calculate estimated ready time (PRIVATE)
   */
  _calculateEstimatedTime(
    order: OrderData,
    type: FulfillmentType,
    metadata?: OrderMetadata
  ): string {
    const now = new Date();
    let minutesToAdd = 0;

    // Base preparation time (from order items complexity)
    const itemCount = order.items?.length || 1;
    minutesToAdd += itemCount * 5; // 5 min per item

    // Add type-specific time
    if (type === 'onsite') {
      minutesToAdd += 10; // Table service overhead
    } else if (type === 'pickup') {
      // Use selected time slot if provided
      if (metadata?.pickup_time_slot) {
        return metadata.pickup_time_slot;
      }
      minutesToAdd += 20; // Default pickup time
    } else if (type === 'delivery') {
      minutesToAdd += 30; // Preparation + delivery time
    }

    now.setMinutes(now.getMinutes() + minutesToAdd);
    return now.toISOString();
  },

  /**
   * Check if current time is rush hour (PRIVATE)
   */
  _isRushHour(): boolean {
    const now = new Date();
    const hour = now.getHours();

    // Typical rush hours: 12-14 (lunch), 19-21 (dinner)
    return (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21);
  }
};

// ============================================
// EXPORTS
// ============================================

export default fulfillmentService;
