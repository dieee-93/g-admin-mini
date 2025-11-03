// delivery/services/deliveryApi.ts
import { supabase } from '@/lib/supabase/client';
import type { DeliveryOrder, DeliveryZone, DriverPerformance, DeliveryMetrics } from '../types/deliveryTypes';
import { logger } from '@/lib/logging';

/**
 * Delivery API Service
 * Handles all Supabase queries for delivery management
 */

export const deliveryApi = {
  /**
   * Get active delivery orders
   */
  async getActiveDeliveries(): Promise<DeliveryOrder[]> {
    try {
      logger.info('DeliveryAPI', 'Fetching active deliveries...');

      const { data, error } = await supabase
        .from('delivery_orders')
        .select('*')
        .in('status', ['pending', 'assigned', 'picked_up', 'in_transit'])
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('DeliveryAPI', 'Supabase error:', error);
        throw error;
      }

      // Transform database records to DeliveryOrder type
      return (data || []).map(record => ({
        id: record.id,
        sale_id: record.sale_id,
        order_id: record.order_id || record.sale_id,
        order_number: record.id.substring(0, 8).toUpperCase(), // Generate display number from ID
        customer_id: record.customer_id || 'unknown',
        customer_name: record.customer_name,
        delivery_address: record.delivery_address,
        delivery_coordinates: {
          lat: record.delivery_lat || -34.6037,
          lng: record.delivery_lng || -58.3816
        },
        delivery_instructions: record.delivery_instructions,
        driver_id: record.driver_id,
        driver_name: undefined, // Will be populated by join or separate query
        status: record.status,
        created_at: record.created_at,
        scheduled_delivery_time: record.scheduled_delivery_time,
        pickup_time: record.pickup_time,
        estimated_arrival_time: record.estimated_arrival_time,
        actual_delivery_time: record.actual_delivery_time,
        route: undefined, // Will be populated if needed
        current_location: record.current_lat && record.current_lng ? {
          lat: record.current_lat,
          lng: record.current_lng
        } : undefined,
        distance_km: record.distance_km,
        items: record.items || [],
        total: record.total,
        notes: record.notes,
        priority: record.priority || 'normal',
        delivery_type: record.delivery_type || 'instant'
      }));
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to fetch active deliveries:', error);
      throw error;
    }
  },

  /**
   * Get drivers performance data
   */
  async getDrivers(): Promise<DriverPerformance[]> {
    try {
      logger.info('DeliveryAPI', 'Fetching drivers...');

      // Query employees table for delivery drivers
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Delivery')
        .eq('employment_status', 'active')
        .order('first_name');

      if (error) {
        logger.error('DeliveryAPI', 'Supabase error:', error);
        throw error;
      }

      // Transform to DriverPerformance
      return (data || []).map(employee => ({
        driver_id: employee.id,
        driver_name: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        avatar_url: undefined, // employees table doesn't have avatar_url currently
        total_deliveries: employee.total_deliveries || 0,
        completed_today: 0, // TODO: Calculate from today's deliveries
        avg_delivery_time_minutes: 0, // TODO: Calculate from delivery_orders
        on_time_rate: 0, // TODO: Calculate from delivery_orders
        customer_rating: employee.driver_rating || 0,
        is_active: employee.employment_status === 'active',
        is_available: employee.is_available || false,
        current_delivery_id: undefined, // TODO: Get from active delivery
        last_location: undefined, // TODO: Get from driver_locations
        last_updated: employee.updated_at || employee.created_at
      }));
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to fetch drivers:', error);
      throw error;
    }
  },

  /**
   * Get delivery zones configuration
   */
  async getZones(): Promise<DeliveryZone[]> {
    try {
      logger.info('DeliveryAPI', 'Fetching delivery zones...');

      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        logger.error('DeliveryAPI', 'Supabase error:', error);
        throw error;
      }

      return (data || []).map(zone => ({
        id: zone.id,
        name: zone.name,
        boundaries: zone.boundaries || [], // Array of {lat, lng}
        color: zone.color || '#3b82f6',
        delivery_fee: zone.delivery_fee,
        estimated_time_minutes: zone.estimated_time_minutes,
        is_active: zone.is_active,
        created_at: zone.created_at,
        updated_at: zone.updated_at
      }));
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to fetch zones:', error);
      throw error;
    }
  },

  /**
   * Get delivery metrics
   */
  async getMetrics(): Promise<DeliveryMetrics> {
    try {
      logger.info('DeliveryAPI', 'Fetching delivery metrics...');

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get active deliveries count
      const { count: activeCount } = await supabase
        .from('delivery_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['assigned', 'picked_up', 'in_transit']);

      // Get pending assignments count
      const { count: pendingCount } = await supabase
        .from('delivery_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get today's deliveries
      const { data: todayDeliveries } = await supabase
        .from('delivery_orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Get failed deliveries today
      const { count: failedCount } = await supabase
        .from('delivery_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Calculate metrics
      const completedToday = todayDeliveries?.filter(d => d.status === 'delivered') || [];
      const avgDeliveryTime = completedToday.length > 0
        ? completedToday.reduce((sum, d) => {
            if (d.pickup_time && d.actual_delivery_time) {
              const duration = (new Date(d.actual_delivery_time).getTime() - new Date(d.pickup_time).getTime()) / 1000 / 60;
              return sum + duration;
            }
            return sum;
          }, 0) / completedToday.length
        : 0;

      return {
        active_deliveries: activeCount || 0,
        pending_assignments: pendingCount || 0,
        avg_delivery_time_minutes: Math.round(avgDeliveryTime),
        on_time_rate_percentage: 0, // TODO: Calculate based on estimated vs actual times
        eta_accuracy_percentage: 0, // TODO: Calculate ETA accuracy
        total_deliveries_today: todayDeliveries?.length || 0,
        failed_deliveries_today: failedCount || 0
      };
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to fetch metrics:', error);
      throw error;
    }
  },

  /**
   * Create delivery order from sale
   */
  async createDeliveryFromSale(saleId: string): Promise<DeliveryOrder> {
    try {
      logger.info('DeliveryAPI', 'Creating delivery order from sale:', saleId);

      // Fetch sale data
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('*, customer:customers(*), sale_items(*)')
        .eq('id', saleId)
        .single();

      if (saleError) throw saleError;
      if (!sale) throw new Error('Sale not found');

      // Transform sale items to delivery items format
      const items = (sale.sale_items || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Producto',
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.special_instructions
      }));

      // Insert delivery order
      const { data: delivery, error: insertError } = await supabase
        .from('delivery_orders')
        .insert({
          sale_id: saleId,
          order_id: sale.order_id || saleId,
          customer_id: sale.customer_id,
          customer_name: sale.customer?.name || 'Cliente',
          customer_phone: sale.customer?.phone,
          delivery_address: sale.customer?.address || 'Dirección no especificada',
          delivery_lat: null, // TODO: Geocode address
          delivery_lng: null,
          delivery_instructions: sale.special_instructions?.join(', '),
          status: 'pending',
          items,
          total: sale.total,
          notes: sale.note,
          priority: sale.priority_level || 'normal',
          delivery_type: 'instant',
          scheduled_delivery_time: sale.estimated_ready_time,
          estimated_arrival_time: calculateETA(sale.estimated_ready_time)
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return this.transformDeliveryRecord(delivery);
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to create delivery:', error);
      throw error;
    }
  },

  /**
   * Assign driver to delivery
   */
  async assignDriver(deliveryId: string, driverId: string): Promise<void> {
    try {
      logger.info('DeliveryAPI', 'Assigning driver:', { deliveryId, driverId });

      const { error } = await supabase
        .from('delivery_orders')
        .update({
          driver_id: driverId,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', deliveryId);

      if (error) throw error;

      logger.info('DeliveryAPI', '✅ Driver assigned successfully');
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to assign driver:', error);
      throw error;
    }
  },

  /**
   * Update delivery status
   */
  async updateStatus(deliveryId: string, status: string, location?: { lat: number; lng: number }): Promise<void> {
    try {
      logger.info('DeliveryAPI', 'Updating delivery status:', { deliveryId, status });

      const updateData: any = { status };

      // Update location if provided
      if (location) {
        updateData.current_lat = location.lat;
        updateData.current_lng = location.lng;
      }

      // Set timestamps based on status
      const now = new Date().toISOString();
      if (status === 'picked_up') {
        updateData.pickup_time = now;
      } else if (status === 'delivered') {
        updateData.actual_delivery_time = now;
      }

      const { error } = await supabase
        .from('delivery_orders')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;

      logger.info('DeliveryAPI', '✅ Status updated successfully');
    } catch (error) {
      logger.error('DeliveryAPI', 'Failed to update status:', error);
      throw error;
    }
  },

  /**
   * Helper: Transform database record to DeliveryOrder
   */
  transformDeliveryRecord(record: any): DeliveryOrder {
    return {
      id: record.id,
      sale_id: record.sale_id,
      order_id: record.order_id || record.sale_id,
      order_number: record.id.substring(0, 8).toUpperCase(), // Generate display number from ID
      customer_id: record.customer_id || 'unknown',
      customer_name: record.customer_name,
      delivery_address: record.delivery_address,
      delivery_coordinates: {
        lat: record.delivery_lat || -34.6037,
        lng: record.delivery_lng || -58.3816
      },
      delivery_instructions: record.delivery_instructions,
      driver_id: record.driver_id,
      driver_name: undefined,
      status: record.status,
      created_at: record.created_at,
      scheduled_delivery_time: record.scheduled_delivery_time,
      pickup_time: record.pickup_time,
      estimated_arrival_time: record.estimated_arrival_time,
      actual_delivery_time: record.actual_delivery_time,
      route: undefined,
      current_location: record.current_lat && record.current_lng ? {
        lat: record.current_lat,
        lng: record.current_lng
      } : undefined,
      distance_km: record.distance_km,
      items: record.items || [],
      total: record.total,
      notes: record.notes,
      priority: record.priority || 'normal',
      delivery_type: record.delivery_type || 'instant'
    };
  }
};

/**
 * Helper: Calculate ETA based on scheduled time
 */
function calculateETA(scheduledTime?: string): string {
  if (!scheduledTime) {
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + 45);
    return eta.toISOString();
  }

  const eta = new Date(scheduledTime);
  eta.setMinutes(eta.getMinutes() + 30);
  return eta.toISOString();
}
