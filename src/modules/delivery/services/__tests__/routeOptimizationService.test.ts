import { describe, it, expect } from 'vitest';
import { routeOptimizationService } from '../routeOptimizationService';
import type { DeliveryOrder, DriverPerformance } from '../../types';

describe('RouteOptimizationService', () => {
  const mockDelivery: DeliveryOrder = {
    id: 'delivery-1',
    sale_id: 'sale-1',
    order_id: 'order-1',
    order_number: 'DEL001',
    customer_id: 'customer-1',
    customer_name: 'Test Customer',
    delivery_address: 'Test Address',
    delivery_coordinates: {
      lat: -34.6037,
      lng: -58.3816
    },
    status: 'pending',
    created_at: new Date().toISOString(),
    items: [],
    total: 100,
    priority: 'normal',
    delivery_type: 'instant'
  };

  const mockDrivers: DriverPerformance[] = [
    {
      driver_id: 'driver-1',
      driver_name: 'Juan',
      is_active: true,
      is_available: true,
      last_location: {
        lat: -34.5500,  // ~8 km de distancia
        lng: -58.4300
      },
      total_deliveries: 100,
      completed_today: 10,  // workload bonus = 10
      avg_delivery_time_minutes: 25,
      on_time_rate: 80,  // On-time rate medio = 12 pts
      customer_rating: 4.0,  // Rating medio = 16 pts
      last_updated: new Date().toISOString()
    },
    {
      driver_id: 'driver-2',
      driver_name: 'María',
      is_active: true,
      is_available: true,
      last_location: {
        lat: -34.7000,  // ~15 km de distancia
        lng: -58.5000
      },
      total_deliveries: 150,
      completed_today: 12,  // workload bonus = 8
      avg_delivery_time_minutes: 22,
      on_time_rate: 75,  // On-time rate bajo = 11.25 pts
      customer_rating: 3.5,  // Rating bajo = 14 pts
      last_updated: new Date().toISOString()
    },
    {
      driver_id: 'driver-3',
      driver_name: 'Carlos',
      is_active: true,
      is_available: false,  // No disponible
      last_location: {
        lat: -34.5900,
        lng: -58.3750
      },
      total_deliveries: 80,
      completed_today: 8,
      avg_delivery_time_minutes: 30,
      on_time_rate: 90,
      customer_rating: 4.2,
      last_updated: new Date().toISOString()
    }
  ];

  describe('getSuggestedDrivers', () => {
    it('should return drivers sorted by score (highest first)', async () => {
      const suggestions = await routeOptimizationService.getSuggestedDrivers(
        mockDelivery,
        mockDrivers
      );

      expect(suggestions).toHaveLength(2); // Carlos excluded (not available)
      expect(suggestions[0].driver.driver_id).toBe('driver-1'); // Juan (closer + better metrics)

      // Both may be capped at 100, but if not capped, Juan should have higher score
      // What matters is that they are sorted correctly
      expect(suggestions[0].score).toBeGreaterThanOrEqual(suggestions[1].score);
    });

    it('should exclude unavailable drivers', async () => {
      const suggestions = await routeOptimizationService.getSuggestedDrivers(
        mockDelivery,
        mockDrivers
      );

      const unavailableDriver = suggestions.find(s => s.driver.driver_id === 'driver-3');
      expect(unavailableDriver).toBeUndefined();
    });

    it('should calculate distance correctly', async () => {
      const suggestions = await routeOptimizationService.getSuggestedDrivers(
        mockDelivery,
        mockDrivers
      );

      const juan = suggestions.find(s => s.driver.driver_id === 'driver-1');

      expect(juan).toBeDefined();
      // Juan is now ~8 km away
      expect(juan!.distance).toBeGreaterThan(5);
      expect(juan!.distance).toBeLessThan(10);
    });

    it('should calculate ETA based on distance', async () => {
      const suggestions = await routeOptimizationService.getSuggestedDrivers(
        mockDelivery,
        mockDrivers
      );

      const juan = suggestions.find(s => s.driver.driver_id === 'driver-1');

      // Juan is ~8 km away
      // ETA = (8 / 30) * 60 = 16 minutes
      expect(juan!.estimatedTime).toBeGreaterThan(10);
      expect(juan!.estimatedTime).toBeLessThan(20);
    });

    it('should give higher score to closer drivers', async () => {
      // Create test with extreme distance difference to avoid score capping
      const testDrivers: DriverPerformance[] = [
        {
          ...mockDrivers[0],
          driver_id: 'close-driver',
          last_location: {
            lat: mockDelivery.delivery_coordinates.lat + 0.001,  // Very close (~100m)
            lng: mockDelivery.delivery_coordinates.lng + 0.001
          },
          customer_rating: 3.0,  // Low rating to avoid capping
          completed_today: 15,  // High workload (low bonus)
          on_time_rate: 70  // Low on-time rate
        },
        {
          ...mockDrivers[0],
          driver_id: 'far-driver',
          last_location: {
            lat: mockDelivery.delivery_coordinates.lat + 0.2,  // Far (~20km)
            lng: mockDelivery.delivery_coordinates.lng + 0.2
          },
          customer_rating: 3.0,  // Same rating
          completed_today: 15,  // Same workload
          on_time_rate: 70  // Same on-time rate
        }
      ];

      const suggestions = await routeOptimizationService.getSuggestedDrivers(
        mockDelivery,
        testDrivers
      );

      const closeDriver = suggestions.find(s => s.driver.driver_id === 'close-driver');
      const farDriver = suggestions.find(s => s.driver.driver_id === 'far-driver');

      // Close driver should have significantly higher score due to distance
      expect(closeDriver!.score).toBeGreaterThan(farDriver!.score);
    });

    it('should bonus drivers with higher rating', async () => {
      const driversWithRating = [
        {
          ...mockDrivers[0],
          driver_id: 'high-rating',
          customer_rating: 5.0,  // Max rating = +20 pts
          last_location: {
            lat: mockDelivery.delivery_coordinates.lat + 0.1,  // Far enough (~10km)
            lng: mockDelivery.delivery_coordinates.lng + 0.1
          },
          completed_today: 15,  // High workload (bonus = 5)
          on_time_rate: 70  // Low on-time rate (bonus = 10.5)
        },
        {
          ...mockDrivers[0],
          driver_id: 'low-rating',
          customer_rating: 2.0,  // Low rating = +8 pts
          last_location: {
            lat: mockDelivery.delivery_coordinates.lat + 0.1,  // Same distance
            lng: mockDelivery.delivery_coordinates.lng + 0.1
          },
          completed_today: 15,  // Same workload
          on_time_rate: 70  // Same on-time rate
        }
      ];

      const suggestions = await routeOptimizationService.getSuggestedDrivers(
        mockDelivery,
        driversWithRating
      );

      const highRating = suggestions.find(s => s.driver.driver_id === 'high-rating');
      const lowRating = suggestions.find(s => s.driver.driver_id === 'low-rating');

      // High rating driver should have higher score (+20 vs +8 = 12 pts difference)
      expect(highRating!.score).toBeGreaterThan(lowRating!.score);
    });
  });

  describe('optimizeRoute', () => {
    it('should return deliveries in nearest-neighbor order', async () => {
      const deliveries: DeliveryOrder[] = [
        {
          ...mockDelivery,
          id: 'd1',
          delivery_coordinates: { lat: -34.6037, lng: -58.3816 }
        },
        {
          ...mockDelivery,
          id: 'd2',
          delivery_coordinates: { lat: -34.6200, lng: -58.4200 }
        },
        {
          ...mockDelivery,
          id: 'd3',
          delivery_coordinates: { lat: -34.6050, lng: -58.3850 }
        }
      ];

      const optimized = await routeOptimizationService.optimizeRoute(deliveries);

      expect(optimized).toHaveLength(3);
      // d1 -> d3 (closest to d1) -> d2 (closest to d3)
      expect(optimized[0].id).toBe('d1');
      expect(optimized[1].id).toBe('d3');
      expect(optimized[2].id).toBe('d2');
    });

    it('should handle single delivery', async () => {
      const deliveries = [mockDelivery];
      const optimized = await routeOptimizationService.optimizeRoute(deliveries);

      expect(optimized).toEqual(deliveries);
    });

    it('should handle empty array', async () => {
      const optimized = await routeOptimizationService.optimizeRoute([]);
      expect(optimized).toEqual([]);
    });
  });
});
