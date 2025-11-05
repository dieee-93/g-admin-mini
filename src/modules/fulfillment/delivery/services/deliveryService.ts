/**
 * Delivery Service - Integrates with Fulfillment Queue
 *
 * This service wraps fulfillmentService for delivery-specific operations
 * Phase 1 - Part 3: Delivery Sub-Module
 */

import { fulfillmentService } from '../../services/fulfillmentService';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
  DeliveryOrder,
  DeliveryMetadata,
  DeliveryZone,
  ZoneValidation,
  DriverPerformance,
  // DriverAvailability - TODO: Implement driver availability checking
  DriverAssignment,
  AssignDriverData,
  CreateDeliveryZoneData,
  UpdateDeliveryZoneData,
  DeliveryMetrics,
  Coordinates
} from '../types';
import type { FulfillmentQueueItem, QueueFilters } from '../../services/fulfillmentService';

class DeliveryService {
  // ============================================
  // QUEUE OPERATIONS (via fulfillmentService)
  // ============================================

  /**
   * Queue a delivery order
   */
  async queueDeliveryOrder(
    orderId: string,
    customerId: string,
    customerName: string,
    deliveryMetadata: DeliveryMetadata,
    options?: {
      scheduledTime?: string;
      priority?: 'normal' | 'high' | 'urgent';
      notes?: string;
    }
  ): Promise<FulfillmentQueueItem> {
    logger.info('DeliveryService', 'Queuing delivery order', { orderId });

    return fulfillmentService.queueOrder(
      orderId,
      customerId,
      customerName,
      'delivery',
      deliveryMetadata,
      {
        scheduledTime: options?.scheduledTime,
        priority: options?.priority,
        notes: options?.notes
      }
    );
  }

  /**
   * Get delivery queue with filters
   */
  async getDeliveryQueue(filters?: QueueFilters): Promise<DeliveryOrder[]> {
    const queueFilters: QueueFilters = {
      ...filters,
      type: 'delivery'
    };

    const queueItems = await fulfillmentService.getQueue(queueFilters);

    // Transform to DeliveryOrder
    return queueItems.map(item => this.transformToDeliveryOrder(item));
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    queueId: string,
    newStatus: string,
    metadata?: Partial<DeliveryMetadata>
  ): Promise<void> {
    logger.info('DeliveryService', 'Updating delivery status', { queueId, newStatus });

    await fulfillmentService.updateQueueStatus(queueId, newStatus, metadata);
  }

  /**
   * Transform FulfillmentQueueItem to DeliveryOrder
   */
  private transformToDeliveryOrder(item: FulfillmentQueueItem): DeliveryOrder {
    const metadata = item.metadata as DeliveryMetadata;

    return {
      ...item,
      type: 'delivery',
      delivery_address: metadata.delivery_address,
      delivery_coordinates: metadata.delivery_coordinates,
      delivery_instructions: metadata.delivery_instructions,
      driver_id: metadata.driver_id,
      driver_name: metadata.driver_name,
      zone_id: metadata.zone_id,
      zone_name: metadata.zone_name,
      route: metadata.route,
      distance_km: metadata.distance_km,
      delivery_type: metadata.delivery_type,
      current_location: metadata.current_location
    };
  }

  // ============================================
  // ZONE OPERATIONS
  // ============================================

  /**
   * Get all delivery zones
   */
  async getZones(activeOnly = true): Promise<DeliveryZone[]> {
    try {
      logger.info('DeliveryService', 'Fetching delivery zones');

      let query = supabase
        .from('delivery_zones')
        .select('*')
        .order('name');

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('DeliveryService', 'Error fetching zones', { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('DeliveryService', 'Failed to fetch zones', { error });
      throw error;
    }
  }

  /**
   * Create delivery zone
   */
  async createZone(zoneData: CreateDeliveryZoneData): Promise<DeliveryZone> {
    try {
      logger.info('DeliveryService', 'Creating delivery zone', { name: zoneData.name });

      const { data, error } = await supabase
        .from('delivery_zones')
        .insert({
          name: zoneData.name,
          description: zoneData.description,
          boundaries: zoneData.boundaries,
          color: zoneData.color,
          delivery_fee: zoneData.delivery_fee,
          min_order_amount: zoneData.min_order_amount,
          estimated_time_minutes: zoneData.estimated_time_minutes,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('DeliveryService', 'Zone created successfully', { id: data.id });
      return data;
    } catch (error) {
      logger.error('DeliveryService', 'Failed to create zone', { error });
      throw error;
    }
  }

  /**
   * Update delivery zone
   */
  async updateZone(zoneData: UpdateDeliveryZoneData): Promise<void> {
    try {
      logger.info('DeliveryService', 'Updating delivery zone', { id: zoneData.id });

      const { id, ...updates } = zoneData;

      const { error } = await supabase
        .from('delivery_zones')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      logger.info('DeliveryService', 'Zone updated successfully');
    } catch (error) {
      logger.error('DeliveryService', 'Failed to update zone', { error });
      throw error;
    }
  }

  /**
   * Delete delivery zone
   */
  async deleteZone(zoneId: string): Promise<void> {
    try {
      logger.info('DeliveryService', 'Deleting delivery zone', { zoneId });

      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      logger.info('DeliveryService', 'Zone deleted successfully');
    } catch (error) {
      logger.error('DeliveryService', 'Failed to delete zone', { error });
      throw error;
    }
  }

  /**
   * Validate delivery address against zones
   */
  async validateDeliveryAddress(address: string, coordinates: Coordinates): Promise<ZoneValidation> {
    try {
      logger.info('DeliveryService', 'Validating delivery address', { address });

      const zones = await this.getZones();

      // Check if coordinates are within any zone polygon
      for (const zone of zones) {
        if (this.isPointInPolygon(coordinates, zone.boundaries)) {
          return {
            valid: true,
            zone_id: zone.id,
            zone_name: zone.name,
            delivery_fee: zone.delivery_fee,
            estimated_time_minutes: zone.estimated_time_minutes
          };
        }
      }

      return {
        valid: false,
        error_message: 'La dirección está fuera de las zonas de delivery configuradas'
      };
    } catch (error) {
      logger.error('DeliveryService', 'Failed to validate address', { error });
      return {
        valid: false,
        error_message: 'Error al validar la dirección'
      };
    }
  }

  /**
   * Check if a point is inside a polygon (Ray-casting algorithm)
   */
  private isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;

      const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }
    return inside;
  }

  // ============================================
  // DRIVER OPERATIONS
  // ============================================

  /**
   * Get available drivers with performance metrics
   */
  async getAvailableDrivers(zoneId?: string): Promise<DriverPerformance[]> {
    try {
      logger.info('DeliveryService', 'Fetching available drivers', { zoneId });

      // Query staff table for delivery drivers
      const { data: drivers, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'driver')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch performance metrics for all drivers in parallel
      const driversWithMetrics = await Promise.all(
        (drivers || []).map(async (user) => {
          // Get all assignments for this driver
          const { data: assignments } = await supabase
            .from('delivery_assignments')
            .select('*')
            .eq('driver_id', user.id);

          // Get today's assignments
          const { data: todayAssignments } = await supabase
            .from('delivery_assignments')
            .select('*')
            .eq('driver_id', user.id)
            .gte('assigned_at', today.toISOString());

          // Get current active delivery
          const { data: activeDelivery } = await supabase
            .from('delivery_assignments')
            .select('id')
            .eq('driver_id', user.id)
            .in('status', ['assigned', 'accepted', 'picked_up', 'in_transit'])
            .order('assigned_at', { ascending: false })
            .limit(1)
            .single();

          // Get last known location
          const { data: lastLocation } = await supabase
            .from('driver_locations')
            .select('lat, lng, timestamp')
            .eq('driver_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          // Calculate metrics
          const totalDeliveries = assignments?.length || 0;
          const completedToday = todayAssignments?.filter(a => a.status === 'delivered').length || 0;
          const completedAssignments = assignments?.filter(a => a.status === 'delivered' && a.actual_duration_minutes) || [];

          const avgDeliveryTime = completedAssignments.length > 0
            ? Math.round(completedAssignments.reduce((sum, a) => sum + (a.actual_duration_minutes || 0), 0) / completedAssignments.length)
            : 0;

          const onTimeDeliveries = assignments?.filter(a => a.on_time === true).length || 0;
          const onTimeRate = totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0;

          const ratingsWithValue = assignments?.filter(a => a.customer_rating && a.customer_rating > 0) || [];
          const avgRating = ratingsWithValue.length > 0
            ? ratingsWithValue.reduce((sum, a) => sum + (a.customer_rating || 0), 0) / ratingsWithValue.length
            : 0;

          return {
            driver_id: user.id,
            driver_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            avatar_url: user.avatar_url,
            total_deliveries: totalDeliveries,
            completed_today: completedToday,
            avg_delivery_time_minutes: avgDeliveryTime,
            on_time_rate: onTimeRate,
            customer_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            is_active: true,
            is_available: !activeDelivery, // Available if no active delivery
            current_delivery_id: activeDelivery?.id,
            last_location: lastLocation ? { lat: lastLocation.lat, lng: lastLocation.lng } : undefined,
            last_updated: lastLocation?.timestamp || user.updated_at || user.created_at
          };
        })
      );

      return driversWithMetrics;
    } catch (error) {
      logger.error('DeliveryService', 'Failed to fetch drivers', { error });
      throw error;
    }
  }

  /**
   * Assign driver to delivery
   */
  async assignDriver(assignData: AssignDriverData): Promise<DriverAssignment> {
    try {
      logger.info('DeliveryService', 'Assigning driver to delivery', assignData);

      // Create assignment record
      const { data, error } = await supabase
        .from('delivery_assignments')
        .insert({
          queue_id: assignData.queue_id,
          driver_id: assignData.driver_id,
          zone_id: assignData.zone_id,
          status: 'assigned'
        })
        .select()
        .single();

      if (error) throw error;

      // Update fulfillment queue
      await fulfillmentService.assignOrder(assignData.queue_id, assignData.driver_id);

      // Update delivery metadata with driver info
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', assignData.driver_id)
        .single();

      if (userData) {
        await this.updateDeliveryStatus(assignData.queue_id, 'assigned', {
          driver_id: assignData.driver_id,
          driver_name: `${userData.first_name} ${userData.last_name}`
        });
      }

      logger.info('DeliveryService', 'Driver assigned successfully', { assignmentId: data.id });
      return data;
    } catch (error) {
      logger.error('DeliveryService', 'Failed to assign driver', { error });
      throw error;
    }
  }

  // ============================================
  // METRICS
  // ============================================

  /**
   * Get delivery metrics
   */
  async getMetrics(): Promise<DeliveryMetrics> {
    try {
      logger.info('DeliveryService', 'Fetching delivery metrics');

      // Get active deliveries from fulfillment_queue
      const activeDeliveries = await this.getDeliveryQueue({
        status: ['pending', 'assigned', 'in_progress']
      });

      const pendingAssignments = activeDeliveries.filter(d => !d.assigned_to).length;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get delivery assignments for today to calculate metrics
      const { data: todayAssignments } = await supabase
        .from('delivery_assignments')
        .select('*')
        .gte('assigned_at', today.toISOString());

      // Calculate average delivery time from actual_duration_minutes
      const completedWithDuration = todayAssignments?.filter(a => a.status === 'delivered' && a.actual_duration_minutes) || [];
      const avgDeliveryTime = completedWithDuration.length > 0
        ? Math.round(completedWithDuration.reduce((sum, a) => sum + (a.actual_duration_minutes || 0), 0) / completedWithDuration.length)
        : 0;

      // Calculate on-time rate
      const completedDeliveries = todayAssignments?.filter(a => a.status === 'delivered') || [];
      const onTimeDeliveries = completedDeliveries.filter(a => a.on_time === true).length;
      const onTimeRate = completedDeliveries.length > 0
        ? Math.round((onTimeDeliveries / completedDeliveries.length) * 100)
        : 0;

      // Calculate ETA accuracy (compare estimated vs actual duration)
      const deliveriesWithBothTimes = todayAssignments?.filter(
        a => a.status === 'delivered' && a.estimated_duration_minutes && a.actual_duration_minutes
      ) || [];

      let etaAccuracy = 0;
      if (deliveriesWithBothTimes.length > 0) {
        const accuracySum = deliveriesWithBothTimes.reduce((sum, a) => {
          const estimated = a.estimated_duration_minutes || 0;
          const actual = a.actual_duration_minutes || 0;
          // Calculate % accuracy (100% = perfect match, lower if difference is large)
          const difference = Math.abs(estimated - actual);
          const accuracy = Math.max(0, 100 - (difference / estimated) * 100);
          return sum + accuracy;
        }, 0);
        etaAccuracy = Math.round(accuracySum / deliveriesWithBothTimes.length);
      }

      // Calculate failed deliveries
      const failedDeliveries = todayAssignments?.filter(a => a.status === 'failed').length || 0;

      return {
        active_deliveries: activeDeliveries.length,
        pending_assignments: pendingAssignments,
        avg_delivery_time_minutes: avgDeliveryTime,
        on_time_rate_percentage: onTimeRate,
        eta_accuracy_percentage: etaAccuracy,
        total_deliveries_today: completedDeliveries.length,
        failed_deliveries_today: failedDeliveries
      };
    } catch (error) {
      logger.error('DeliveryService', 'Failed to fetch metrics', { error });
      throw error;
    }
  }
}

// Singleton instance
export const deliveryService = new DeliveryService();
