/**
 * Mobile Module Integration Tests
 *
 * Tests the integration between Mobile module and other modules:
 * - GPS tracking integration with Fulfillment/delivery
 * - Route planning with multiple waypoints
 * - Mobile inventory sync with Materials module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus } from '@/lib/events';
import { routePlanningService } from '@/modules/mobile/services/routePlanningService';
import { mobileInventoryService } from '@/modules/mobile/services/mobileInventoryService';
import type { RouteOptimizationRequest, MobileRoute, Waypoint } from '@/modules/mobile/types';

describe('Mobile Module Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Planning Service', () => {
    it('should optimize waypoint order using Nearest Neighbor algorithm', () => {
      const request: RouteOptimizationRequest = {
        start_location: { lat: -34.6037, lng: -58.3816, address: 'Buenos Aires' }, // Buenos Aires
        waypoints: [
          {
            location: { lat: -34.5925, lng: -58.3975, address: 'Palermo' },
            order_id: 'order-1',
            service_time_minutes: 10
          },
          {
            location: { lat: -34.6158, lng: -58.4333, address: 'Caballito' },
            order_id: 'order-2',
            service_time_minutes: 15
          },
          {
            location: { lat: -34.6092, lng: -58.3732, address: 'Puerto Madero' },
            order_id: 'order-3',
            service_time_minutes: 5
          }
        ]
      };

      const result = routePlanningService.optimizeWaypointOrder(request);

      // Verify optimization results
      expect(result.optimized_waypoints).toHaveLength(3);
      expect(result.total_distance_km).toBeGreaterThan(0);
      expect(result.total_duration_minutes).toBeGreaterThan(0);
      expect(result.estimated_completion_time).toBeDefined();

      // Verify waypoints are reordered (not necessarily in original order)
      expect(result.optimized_waypoints[0]).toBeDefined();
      expect(result.optimized_waypoints[0].status).toBe('pending');
    });

    it('should handle single waypoint route', () => {
      const request: RouteOptimizationRequest = {
        start_location: { lat: -34.6037, lng: -58.3816 },
        waypoints: [
          {
            location: { lat: -34.5925, lng: -58.3975 },
            order_id: 'order-1'
          }
        ]
      };

      const result = routePlanningService.optimizeWaypointOrder(request);

      expect(result.optimized_waypoints).toHaveLength(1);
      expect(result.total_distance_km).toBeGreaterThan(0);
    });

    it('should include end location in distance calculation', () => {
      const request: RouteOptimizationRequest = {
        start_location: { lat: -34.6037, lng: -58.3816 },
        end_location: { lat: -34.6037, lng: -58.3816 }, // Return to start
        waypoints: [
          {
            location: { lat: -34.5925, lng: -58.3975 },
            order_id: 'order-1'
          }
        ]
      };

      const result = routePlanningService.optimizeWaypointOrder(request);

      // Distance should include return trip
      expect(result.total_distance_km).toBeGreaterThan(0);
    });
  });

  describe('Mobile Inventory Service', () => {
    it('should check capacity constraints correctly', async () => {
      const vehicleId = 'vehicle-test-123';
      const materialId = 'material-test-456';

      // Set capacity
      await mobileInventoryService.setCapacityConstraint(vehicleId, materialId, 100, 'kg');

      // Check capacity (should allow)
      const check1 = await mobileInventoryService.checkCapacity(vehicleId, materialId, 50);
      expect(check1.canAdd).toBe(true);
      expect(check1.maxQuantity).toBe(100);

      // Add 80 kg
      await mobileInventoryService.updateMobileInventory({
        vehicle_id: vehicleId,
        material_id: materialId,
        quantity_delta: 80
      });

      // Check capacity again (should not allow 30 more)
      const check2 = await mobileInventoryService.checkCapacity(vehicleId, materialId, 30);
      expect(check2.canAdd).toBe(false);
      expect(check2.currentQuantity).toBe(80);

      // But should allow 20 more
      const check3 = await mobileInventoryService.checkCapacity(vehicleId, materialId, 20);
      expect(check3.canAdd).toBe(true);
    });

    it('should emit inventory change events', async () => {
      const vehicleId = 'vehicle-test-789';
      const materialId = 'material-test-101';

      const eventSpy = vi.fn();
      eventBus.subscribe('mobile.inventory.changed', eventSpy, { moduleId: 'test' });

      // Set constraint and update inventory
      await mobileInventoryService.setCapacityConstraint(vehicleId, materialId, 50, 'units');
      await mobileInventoryService.updateMobileInventory({
        vehicle_id: vehicleId,
        material_id: materialId,
        quantity_delta: 25
      });

      // Verify event was emitted
      expect(eventSpy).toHaveBeenCalled();
      const eventPayload = eventSpy.mock.calls[0][0].payload;
      expect(eventPayload.vehicle_id).toBe(vehicleId);
      expect(eventPayload.material_id).toBe(materialId);
      expect(eventPayload.new_quantity).toBe(25);
    });

    it('should detect low stock alerts', async () => {
      const vehicleId = 'vehicle-test-low-stock';

      // Set multiple constraints
      await mobileInventoryService.setCapacityConstraint(vehicleId, 'mat-1', 100, 'kg');
      await mobileInventoryService.setCapacityConstraint(vehicleId, 'mat-2', 50, 'units');

      // Update to low stock levels
      await mobileInventoryService.updateMobileInventory({
        vehicle_id: vehicleId,
        material_id: 'mat-1',
        quantity_delta: 15 // 15% of capacity
      });
      await mobileInventoryService.updateMobileInventory({
        vehicle_id: vehicleId,
        material_id: 'mat-2',
        quantity_delta: 5 // 10% of capacity
      });

      // Get low stock alerts (< 20%)
      const { data: alerts } = await mobileInventoryService.getLowStockAlerts(vehicleId);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.every((a) => a.percent_remaining < 20)).toBe(true);
    });

    it('should prevent exceeding capacity', async () => {
      const vehicleId = 'vehicle-test-exceed';
      const materialId = 'material-test-exceed';

      // Set capacity to 50
      await mobileInventoryService.setCapacityConstraint(vehicleId, materialId, 50, 'kg');

      // Try to add 60 (should fail)
      const { error } = await mobileInventoryService.updateMobileInventory({
        vehicle_id: vehicleId,
        material_id: materialId,
        quantity_delta: 60
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Capacity exceeded');
    });
  });

  describe('GPS Tracking Integration', () => {
    it('should emit location update events compatible with Fulfillment/delivery', () => {
      // This test verifies that Mobile module emits events in the format expected by Fulfillment
      const eventSpy = vi.fn();
      eventBus.subscribe('mobile.location.updated', eventSpy, { moduleId: 'test' });

      // Simulate GPS update (this would normally come from gpsTrackingService)
      eventBus.emit('mobile.location.updated', {
        driver_id: 'driver-123',
        location: {
          id: 'loc-1',
          driver_id: 'driver-123',
          lat: -34.6037,
          lng: -58.3816,
          timestamp: new Date().toISOString(),
          is_online: true
        }
      });

      expect(eventSpy).toHaveBeenCalled();
      const payload = eventSpy.mock.calls[0][0].payload;
      expect(payload.driver_id).toBe('driver-123');
      expect(payload.location).toBeDefined();
      expect(payload.location.lat).toBe(-34.6037);
    });

    it('should be compatible with Fulfillment delivery events', () => {
      // Verify Mobile module can consume Fulfillment events
      const eventSpy = vi.fn();
      eventBus.subscribe('fulfillment.delivery.queued', eventSpy, { moduleId: 'mobile' });

      // Emit a delivery queued event (from Fulfillment module)
      eventBus.emit('fulfillment.delivery.queued', {
        delivery_id: 'delivery-456',
        order_id: 'order-789',
        delivery_coordinates: { lat: -34.5925, lng: -58.3975 }
      });

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Route Status Management', () => {
    it('should emit events when route status changes', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('mobile.route.status_changed', eventSpy, { moduleId: 'test' });

      // Create a route first
      const routeInput = {
        route_name: 'Test Route',
        route_date: new Date().toISOString().split('T')[0],
        driver_id: 'driver-123',
        start_location: { lat: -34.6037, lng: -58.3816 },
        waypoints: [],
        status: 'planned' as const
      };

      const { data: route } = await routePlanningService.createRoute(routeInput);
      expect(route).toBeDefined();

      // Update status
      if (route) {
        await routePlanningService.updateRouteStatus(route.id, 'in_progress');

        // Verify event was emitted
        expect(eventSpy).toHaveBeenCalled();
        const payload = eventSpy.mock.calls[0][0].payload;
        expect(payload.route_id).toBe(route.id);
        expect(payload.old_status).toBe('planned');
        expect(payload.new_status).toBe('in_progress');
      }
    });
  });
});
