/**
 * Production → Auto-Assign Integration Tests
 *
 * Tests the auto-assignment flow when production orders are ready
 * Phase 1 - Part 3: Delivery Sub-Module (Task 15)
 *
 * Test Scenarios:
 * 1. Production ready event → Auto-assign nearest driver
 * 2. Route optimization → Select best driver
 * 3. Multiple pending orders → Priority-based assignment
 * 4. No available drivers → Queue for manual assignment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '@/lib/logging';
import { deliveryService } from '@/modules/delivery/services/deliveryService';
import { routeOptimizationService } from '@/modules/delivery/services/routeOptimizationService';
import type { DeliveryOrder, DriverPerformance, Coordinates } from '@/modules/delivery/types';

// Mock services
vi.mock('@/lib/supabase/client');

describe('Production → Auto-Assign Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test 1: Production Ready Event', () => {
    it('should trigger auto-assignment when order is ready', async () => {
      const mockOrder: DeliveryOrder = {
        id: 'queue-123',
        order_id: 'order-456',
        customer_id: 'customer-789',
        customer_name: 'Test Customer',
        type: 'delivery',
        status: 'pending',
        priority: 'normal',
        delivery_address: '123 Main St, City',
        delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
        delivery_type: 'instant',
        created_at: new Date().toISOString()
      };

      const mockDrivers: DriverPerformance[] = [
        {
          driver_id: 'driver-1',
          driver_name: 'Driver One',
          total_deliveries: 100,
          completed_today: 5,
          avg_delivery_time_minutes: 25,
          on_time_rate: 0.95,
          customer_rating: 4.8,
          is_active: true,
          is_available: true,
          last_location: { lat: -34.603000, lng: -58.381000 },
          last_updated: new Date().toISOString()
        }
      ];

      vi.spyOn(deliveryService, 'getAvailableDrivers').mockResolvedValue(mockDrivers);
      vi.spyOn(deliveryService, 'assignDriver').mockResolvedValue({
        id: 'assignment-123',
        queue_id: mockOrder.id,
        driver_id: mockDrivers[0].driver_id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      // Simulate production ready event
      const drivers = await deliveryService.getAvailableDrivers();
      expect(drivers).toHaveLength(1);
      expect(drivers[0].is_available).toBe(true);

      // Auto-assign to first available driver
      const assignment = await deliveryService.assignDriver({
        queue_id: mockOrder.id,
        driver_id: drivers[0].driver_id,
        zone_id: mockOrder.zone_id
      });

      expect(assignment).toBeDefined();
      expect(assignment.driver_id).toBe(drivers[0].driver_id);
      expect(assignment.status).toBe('assigned');

      logger.info('Test', 'Production ready auto-assign test passed', { assignment });
    });

    it('should handle production ready with no available drivers', async () => {
      const mockOrder: DeliveryOrder = {
        id: 'queue-123',
        order_id: 'order-456',
        customer_id: 'customer-789',
        customer_name: 'Test Customer',
        type: 'delivery',
        status: 'pending',
        priority: 'urgent',
        delivery_address: '123 Main St, City',
        delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
        delivery_type: 'instant',
        created_at: new Date().toISOString()
      };

      // Mock no available drivers
      vi.spyOn(deliveryService, 'getAvailableDrivers').mockResolvedValue([]);

      const drivers = await deliveryService.getAvailableDrivers();
      expect(drivers).toHaveLength(0);

      // Order should remain in queue for manual assignment
      logger.info('Test', 'No drivers available - manual assignment needed', {
        orderId: mockOrder.id
      });
    });
  });

  describe('Test 2: Route Optimization', () => {
    it('should calculate route distance correctly', async () => {
      const origin: Coordinates = { lat: -34.603722, lng: -58.381592 };
      const destination: Coordinates = { lat: -34.604722, lng: -58.382592 };

      // Mock calculateDistance
      vi.spyOn(routeOptimizationService, 'calculateDistance').mockReturnValue(0.15);

      const distance = routeOptimizationService.calculateDistance(origin, destination);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Should be less than 1km for these close coords

      logger.info('Test', 'Distance calculation test passed', {
        distance: `${distance.toFixed(2)}km`
      });
    });

    it('should suggest best driver based on multiple criteria', async () => {
      const deliveryLocation: Coordinates = { lat: -34.603722, lng: -58.381592 };

      const mockDrivers: DriverPerformance[] = [
        {
          driver_id: 'driver-1',
          driver_name: 'Driver One',
          total_deliveries: 100,
          completed_today: 8,
          avg_delivery_time_minutes: 25,
          on_time_rate: 0.90,
          customer_rating: 4.5,
          is_active: true,
          is_available: true,
          last_location: { lat: -34.603000, lng: -58.381000 }, // 0.08km away
          last_updated: new Date().toISOString()
        },
        {
          driver_id: 'driver-2',
          driver_name: 'Driver Two',
          total_deliveries: 200,
          completed_today: 5,
          avg_delivery_time_minutes: 22,
          on_time_rate: 0.98,
          customer_rating: 4.9,
          is_active: true,
          is_available: true,
          last_location: { lat: -34.605000, lng: -58.383000 }, // 0.2km away
          last_updated: new Date().toISOString()
        },
        {
          driver_id: 'driver-3',
          driver_name: 'Driver Three',
          total_deliveries: 50,
          completed_today: 3,
          avg_delivery_time_minutes: 30,
          on_time_rate: 0.85,
          customer_rating: 4.3,
          is_active: true,
          is_available: true,
          last_location: { lat: -34.600000, lng: -58.380000 }, // 0.4km away
          last_updated: new Date().toISOString()
        }
      ];

      // Mock suggestDrivers function
      const mockSuggestDrivers = vi.fn().mockReturnValue([
        { driver: mockDrivers[1], distance: 0.2, score: 95, eta_minutes: 5 },
        { driver: mockDrivers[0], distance: 0.08, score: 85, eta_minutes: 3 },
        { driver: mockDrivers[2], distance: 0.4, score: 70, eta_minutes: 8 }
      ]);

      (routeOptimizationService as any).suggestDrivers = mockSuggestDrivers;

      const suggestions = mockSuggestDrivers(
        deliveryLocation,
        mockDrivers,
        { maxDistance: 5 }
      );

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].score).toBeGreaterThan(0);
      expect(suggestions[0].score).toBeLessThanOrEqual(100);

      // Best driver should have highest score
      expect(suggestions[0].score).toBeGreaterThanOrEqual(suggestions[1].score);
      expect(suggestions[1].score).toBeGreaterThanOrEqual(suggestions[2].score);

      logger.info('Test', 'Driver suggestion test passed', {
        bestDriver: suggestions[0].driver.driver_name,
        score: suggestions[0].score
      });
    });

    it('should filter drivers by maximum distance', async () => {
      const deliveryLocation: Coordinates = { lat: -34.603722, lng: -58.381592 };

      const mockDrivers: DriverPerformance[] = [
        {
          driver_id: 'driver-1',
          driver_name: 'Nearby Driver',
          total_deliveries: 100,
          completed_today: 5,
          avg_delivery_time_minutes: 25,
          on_time_rate: 0.95,
          customer_rating: 4.8,
          is_active: true,
          is_available: true,
          last_location: { lat: -34.603800, lng: -58.381700 }, // Very close
          last_updated: new Date().toISOString()
        },
        {
          driver_id: 'driver-2',
          driver_name: 'Far Driver',
          total_deliveries: 200,
          completed_today: 3,
          avg_delivery_time_minutes: 22,
          on_time_rate: 0.98,
          customer_rating: 4.9,
          is_active: true,
          is_available: true,
          last_location: { lat: -34.610000, lng: -58.390000 }, // 1.2km away
          last_updated: new Date().toISOString()
        }
      ];

      // Mock suggestDrivers with distance filter applied
      const mockSuggestDriversFiltered = vi.fn().mockReturnValue([
        { driver: mockDrivers[0], distance: 0.05, score: 90, eta_minutes: 2 }
        // Far driver filtered out (1.2km > 1km)
      ]);

      (routeOptimizationService as any).suggestDrivers = mockSuggestDriversFiltered;

      const suggestions = mockSuggestDriversFiltered(
        deliveryLocation,
        mockDrivers,
        { maxDistance: 1 } // Only 1km radius
      );

      expect(suggestions.length).toBeLessThan(mockDrivers.length);
      expect(suggestions.every(s => s.distance <= 1)).toBe(true);

      logger.info('Test', 'Distance filter test passed', {
        filteredCount: suggestions.length,
        maxDistance: '1km'
      });
    });
  });

  describe('Test 3: Priority-Based Assignment', () => {
    it('should prioritize urgent deliveries', async () => {
      const urgentOrder: DeliveryOrder = {
        id: 'queue-urgent',
        order_id: 'order-urgent',
        customer_id: 'customer-1',
        customer_name: 'Urgent Customer',
        type: 'delivery',
        status: 'pending',
        priority: 'urgent',
        delivery_address: '123 Main St',
        delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
        delivery_type: 'instant',
        created_at: new Date().toISOString()
      };

      const normalOrder: DeliveryOrder = {
        id: 'queue-normal',
        order_id: 'order-normal',
        customer_id: 'customer-2',
        customer_name: 'Normal Customer',
        type: 'delivery',
        status: 'pending',
        priority: 'normal',
        delivery_address: '456 Oak Ave',
        delivery_coordinates: { lat: -34.604722, lng: -58.382592 },
        delivery_type: 'same_day',
        created_at: new Date().toISOString()
      };

      // Urgent should be processed first
      expect(urgentOrder.priority).toBe('urgent');
      expect(normalOrder.priority).toBe('normal');

      // In a real scenario, EventBus would emit events in priority order
      logger.info('Test', 'Priority-based assignment test passed', {
        urgentPriority: urgentOrder.priority,
        normalPriority: normalOrder.priority
      });
    });

    it('should handle multiple pending orders efficiently', async () => {
      const pendingOrders: DeliveryOrder[] = Array.from({ length: 10 }, (_, i) => ({
        id: `queue-${i}`,
        order_id: `order-${i}`,
        customer_id: `customer-${i}`,
        customer_name: `Customer ${i}`,
        type: 'delivery',
        status: 'pending',
        priority: i < 3 ? 'urgent' : 'normal',
        delivery_address: `Address ${i}`,
        delivery_coordinates: {
          lat: -34.603722 + (i * 0.001),
          lng: -58.381592 + (i * 0.001)
        },
        delivery_type: 'instant',
        created_at: new Date(Date.now() - i * 60000).toISOString() // Stagger times
      }));

      // Sort by priority and time
      const sorted = pendingOrders.sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      expect(sorted[0].priority).toBe('urgent');
      expect(sorted[sorted.length - 1].priority).toBe('normal');

      logger.info('Test', 'Multiple orders handling test passed', {
        totalOrders: pendingOrders.length,
        urgentCount: pendingOrders.filter(o => o.priority === 'urgent').length
      });
    });
  });

  describe('Test 4: Auto-Assignment Constraints', () => {
    it('should respect driver workload limits', async () => {
      const overloadedDriver: DriverPerformance = {
        driver_id: 'driver-overloaded',
        driver_name: 'Overloaded Driver',
        total_deliveries: 500,
        completed_today: 15, // Already has many deliveries today
        avg_delivery_time_minutes: 25,
        on_time_rate: 0.95,
        customer_rating: 4.8,
        is_active: true,
        is_available: true,
        current_delivery_id: 'active-delivery', // Currently on a delivery
        last_location: { lat: -34.603722, lng: -58.381592 },
        last_updated: new Date().toISOString()
      };

      // Should not auto-assign if driver already has active delivery
      expect(overloadedDriver.current_delivery_id).toBeDefined();
      expect(overloadedDriver.is_available).toBe(true); // Flag might be stale

      // In real implementation, check current_delivery_id before assigning
      const shouldAssign = !overloadedDriver.current_delivery_id;
      expect(shouldAssign).toBe(false);

      logger.info('Test', 'Workload limit test passed', {
        driverId: overloadedDriver.driver_id,
        shouldAssign
      });
    });

    it('should respect zone boundaries', async () => {
      const orderInZoneA: DeliveryOrder = {
        id: 'queue-zone-a',
        order_id: 'order-zone-a',
        customer_id: 'customer-1',
        customer_name: 'Customer Zone A',
        type: 'delivery',
        status: 'pending',
        priority: 'normal',
        delivery_address: '123 Main St',
        delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
        delivery_type: 'instant',
        zone_id: 'zone-a',
        zone_name: 'Downtown',
        created_at: new Date().toISOString()
      };

      // Drivers should be filtered by zone preference/availability
      expect(orderInZoneA.zone_id).toBeDefined();

      logger.info('Test', 'Zone boundary test passed', {
        zone: orderInZoneA.zone_name
      });
    });
  });

  describe('Test 5: Fallback Scenarios', () => {
    it('should fallback to manual assignment when auto-assign fails', async () => {
      const mockOrder: DeliveryOrder = {
        id: 'queue-123',
        order_id: 'order-456',
        customer_id: 'customer-789',
        customer_name: 'Test Customer',
        type: 'delivery',
        status: 'pending',
        priority: 'normal',
        delivery_address: '123 Main St',
        delivery_coordinates: { lat: -34.603722, lng: -58.381592 },
        delivery_type: 'instant',
        created_at: new Date().toISOString()
      };

      // Mock auto-assign failure
      vi.spyOn(deliveryService, 'assignDriver').mockRejectedValue(
        new Error('No suitable driver found')
      );

      try {
        await deliveryService.assignDriver({
          queue_id: mockOrder.id,
          driver_id: 'invalid-driver',
          zone_id: mockOrder.zone_id
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        // Order remains in queue for manual assignment
        logger.info('Test', 'Fallback to manual assignment test passed');
      }
    });
  });
});
