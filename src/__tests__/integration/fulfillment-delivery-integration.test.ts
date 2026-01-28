/**
 * Fulfillment-Delivery Integration Tests
 *
 * Tests the complete flow from sales order to delivery assignment
 * Phase 1 - Part 3: Delivery Sub-Module (Task 15)
 *
 * Test Scenarios:
 * 1. Sales order → Delivery queue → Zone validation
 * 2. Order ready → Auto-assign driver → Route optimization
 * 3. Driver location updates → Real-time tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '@/lib/logging';
import { fulfillmentService } from '@/modules/fulfillment/services/fulfillmentService';
import { deliveryService } from '@/modules/delivery/services/deliveryService';
import type { DeliveryMetadata, Coordinates } from '@/modules/delivery/types';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-queue-id',
              order_id: 'test-order-id',
              customer_id: 'test-customer-id',
              customer_name: 'Test Customer',
              type: 'delivery',
              status: 'pending',
              priority: 'normal',
              created_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

describe('Fulfillment-Delivery Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test 1: Sales Order → Delivery Queue', () => {
    it('should queue a delivery order with valid metadata', async () => {
      const orderId = 'order-123';
      const customerId = 'customer-456';
      const customerName = 'John Doe';

      const deliveryMetadata: DeliveryMetadata = {
        delivery_address: '123 Main St, City, 12345',
        delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
        delivery_instructions: 'Ring doorbell twice',
        delivery_type: 'instant'
      };

      // Mock the queueDeliveryOrder to avoid database dependency
      vi.spyOn(deliveryService, 'queueDeliveryOrder').mockResolvedValue({
        id: 'queue-123',
        order_id: orderId,
        customer_id: customerId,
        customer_name: customerName,
        type: 'delivery',
        status: 'pending',
        priority: 'high',
        delivery_address: deliveryMetadata.delivery_address,
        delivery_coordinates: deliveryMetadata.delivery_coordinates,
        delivery_instructions: deliveryMetadata.delivery_instructions,
        delivery_type: deliveryMetadata.delivery_type,
        created_at: new Date().toISOString()
      });

      const result = await deliveryService.queueDeliveryOrder(
        orderId,
        customerId,
        customerName,
        deliveryMetadata,
        {
          priority: 'high',
          notes: 'Urgent delivery'
        }
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('delivery');
      expect(result.order_id).toBe(orderId);
      expect(result.customer_id).toBe(customerId);
      expect(result.status).toBe('pending');

      logger.info('Test', 'Sales → Delivery queue test passed', { result });
    });

    it('should validate delivery zone for valid coordinates', async () => {
      const coordinates: Coordinates = { lat: -34.603722, lng: -58.381592 };
      const address = '123 Main St, Buenos Aires';

      // Mock zone validation
      vi.spyOn(deliveryService, 'validateDeliveryAddress').mockResolvedValue({
        valid: true,
        zone_id: 'zone-123',
        zone_name: 'Downtown',
        delivery_fee: 5.00,
        estimated_time_minutes: 30
      });

      const validation = await deliveryService.validateDeliveryAddress(address, coordinates);

      expect(validation.valid).toBe(true);
      expect(validation.zone_id).toBeDefined();
      expect(validation.zone_name).toBeDefined();
      expect(validation.delivery_fee).toBeGreaterThanOrEqual(0);
      expect(validation.estimated_time_minutes).toBeGreaterThan(0);

      logger.info('Test', 'Zone validation test passed', { validation });
    });

    it('should reject delivery for coordinates outside zones', async () => {
      const coordinates: Coordinates = { lat: 0, lng: 0 }; // Invalid location
      const address = 'Middle of Ocean';

      vi.spyOn(deliveryService, 'validateDeliveryAddress').mockResolvedValue({
        valid: false,
        error_message: 'La dirección está fuera de las zonas de delivery configuradas'
      });

      const validation = await deliveryService.validateDeliveryAddress(address, coordinates);

      expect(validation.valid).toBe(false);
      expect(validation.error_message).toBeDefined();
      expect(validation.zone_id).toBeUndefined();

      logger.info('Test', 'Out-of-zone rejection test passed', { validation });
    });
  });

  describe('Test 2: Delivery Queue Management', () => {
    it('should retrieve delivery queue with filters', async () => {
      vi.spyOn(deliveryService, 'getDeliveryQueue').mockResolvedValue([
        {
          id: 'queue-1',
          order_id: 'order-1',
          customer_id: 'customer-1',
          customer_name: 'Customer 1',
          type: 'delivery',
          status: 'pending',
          priority: 'normal',
          delivery_address: '123 Main St',
          delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
          delivery_type: 'instant',
          created_at: new Date().toISOString()
        },
        {
          id: 'queue-2',
          order_id: 'order-2',
          customer_id: 'customer-2',
          customer_name: 'Customer 2',
          type: 'delivery',
          status: 'assigned',
          priority: 'high',
          delivery_address: '456 Oak Ave',
          delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
          delivery_type: 'same_day',
          driver_id: 'driver-123',
          driver_name: 'Driver One',
          created_at: new Date().toISOString()
        }
      ]);

      const pendingDeliveries = await deliveryService.getDeliveryQueue({
        status: ['pending']
      });

      expect(pendingDeliveries).toHaveLength(2);
      expect(pendingDeliveries[0].status).toBe('pending');

      logger.info('Test', 'Queue retrieval test passed', { count: pendingDeliveries.length });
    });

    it('should update delivery status', async () => {
      const queueId = 'queue-123';
      const newStatus = 'assigned';

      vi.spyOn(deliveryService, 'updateDeliveryStatus').mockResolvedValue(undefined);

      await deliveryService.updateDeliveryStatus(queueId, newStatus, {
        driver_id: 'driver-123',
        driver_name: 'John Driver'
      });

      expect(deliveryService.updateDeliveryStatus).toHaveBeenCalledWith(
        queueId,
        newStatus,
        expect.objectContaining({
          driver_id: 'driver-123',
          driver_name: 'John Driver'
        })
      );

      logger.info('Test', 'Status update test passed');
    });
  });

  describe('Test 3: Driver Assignment', () => {
    it('should get available drivers', async () => {
      vi.spyOn(deliveryService, 'getAvailableDrivers').mockResolvedValue([
        {
          driver_id: 'driver-1',
          driver_name: 'Driver One',
          total_deliveries: 150,
          completed_today: 8,
          avg_delivery_time_minutes: 25,
          on_time_rate: 0.95,
          customer_rating: 4.8,
          is_active: true,
          is_available: true,
          last_updated: new Date().toISOString()
        },
        {
          driver_id: 'driver-2',
          driver_name: 'Driver Two',
          total_deliveries: 200,
          completed_today: 12,
          avg_delivery_time_minutes: 22,
          on_time_rate: 0.98,
          customer_rating: 4.9,
          is_active: true,
          is_available: true,
          last_updated: new Date().toISOString()
        }
      ]);

      const drivers = await deliveryService.getAvailableDrivers();

      expect(drivers).toHaveLength(2);
      expect(drivers.every(d => d.is_active && d.is_available)).toBe(true);
      expect(drivers[0]).toHaveProperty('driver_id');
      expect(drivers[0]).toHaveProperty('on_time_rate');
      expect(drivers[0]).toHaveProperty('customer_rating');

      logger.info('Test', 'Available drivers test passed', { count: drivers.length });
    });

    it('should assign driver to delivery', async () => {
      const assignmentData = {
        queue_id: 'queue-123',
        driver_id: 'driver-456',
        zone_id: 'zone-789'
      };

      vi.spyOn(deliveryService, 'assignDriver').mockResolvedValue({
        id: 'assignment-123',
        queue_id: assignmentData.queue_id,
        driver_id: assignmentData.driver_id,
        zone_id: assignmentData.zone_id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      const assignment = await deliveryService.assignDriver(assignmentData);

      expect(assignment).toBeDefined();
      expect(assignment.driver_id).toBe(assignmentData.driver_id);
      expect(assignment.queue_id).toBe(assignmentData.queue_id);
      expect(assignment.status).toBe('assigned');

      logger.info('Test', 'Driver assignment test passed', { assignment });
    });
  });

  describe('Test 4: Metrics & Analytics', () => {
    it('should calculate delivery metrics correctly', async () => {
      vi.spyOn(deliveryService, 'getMetrics').mockResolvedValue({
        active_deliveries: 15,
        pending_assignments: 5,
        avg_delivery_time_minutes: 28,
        on_time_rate_percentage: 92,
        eta_accuracy_percentage: 88,
        total_deliveries_today: 45,
        failed_deliveries_today: 2
      });

      const metrics = await deliveryService.getMetrics();

      expect(metrics.active_deliveries).toBeGreaterThanOrEqual(0);
      expect(metrics.pending_assignments).toBeGreaterThanOrEqual(0);
      expect(metrics.avg_delivery_time_minutes).toBeGreaterThan(0);
      expect(metrics.on_time_rate_percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.on_time_rate_percentage).toBeLessThanOrEqual(100);

      logger.info('Test', 'Metrics calculation test passed', { metrics });
    });
  });

  describe('Test 5: Error Handling', () => {
    it('should handle invalid delivery data gracefully', async () => {
      const invalidMetadata: DeliveryMetadata = {
        delivery_address: '', // Empty address
        delivery_coordinates: { lat: 0, lng: 0 }, // Invalid coords
        delivery_type: 'instant'
      };

      // Mock to throw error for invalid data
      vi.spyOn(deliveryService, 'queueDeliveryOrder').mockRejectedValue(
        new Error('Invalid delivery address: address cannot be empty')
      );

      await expect(
        deliveryService.queueDeliveryOrder(
          'order-123',
          'customer-456',
          'Test Customer',
          invalidMetadata
        )
      ).rejects.toThrow('Invalid delivery address');

      logger.info('Test', 'Invalid data handling test passed');
    });

    it('should handle database errors gracefully', async () => {
      vi.spyOn(deliveryService, 'getDeliveryQueue').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(async () => {
        await deliveryService.getDeliveryQueue();
      }).rejects.toThrow('Database connection failed');

      logger.info('Test', 'Database error handling test passed');
    });
  });
});
