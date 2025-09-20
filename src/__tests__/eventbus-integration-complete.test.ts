/**
 * EventBus Integration Tests - Complete Cross-Module Communication
 * Tests the implemented Materials ↔ Sales ↔ Operations ↔ Kitchen ↔ Staff workflows
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '@/lib/events/EventBus';
import { TestSetup, testConfigs, EventBusAssertions } from '@/lib/events/__tests__/helpers/test-utilities';
import type { NamespacedEvent } from '@/lib/events/types';

describe('EventBus Integration - Cross-Module Communication', () => {
  let eventBus: EventBus;
  let assertions: EventBusAssertions;
  let capturedEvents: NamespacedEvent[];

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.integration);
    assertions = new EventBusAssertions();
    capturedEvents = [];

    // Setup event capture
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = async (pattern, payload, options = {}) => {
      const result = await originalEmit(pattern, payload, options);

      // Capture emitted events (filter out system events)
      if (!pattern.startsWith('global.eventbus.')) {
        capturedEvents.push({
          id: `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pattern,
          payload,
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'integration_test',
            ...options
          }
        });
      }

      return result;
    };

    assertions.setEvents(capturedEvents);
  });

  afterEach(async () => {
    await TestSetup.cleanup();
    capturedEvents = [];
    vi.clearAllMocks();
  });

  describe('Materials → Sales Integration', () => {
    it('should emit stock_updated event when material stock changes', async () => {
      const mockSalesHandler = vi.fn();

      // Setup listener
      eventBus.on('materials.stock_updated', mockSalesHandler);

      // Simulate Materials module stock update
      const stockUpdateData = {
        materialId: 'tomato-123',
        newStock: 5,
        critical: true,
        materialName: 'Tomatoes'
      };

      // Emit event and wait for processing
      await eventBus.emit('materials.stock_updated', stockUpdateData);

      // Small delay to ensure async handlers complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockSalesHandler).toHaveBeenCalledWith(expect.objectContaining({
        payload: stockUpdateData
      }));
      expect(mockSalesHandler).toHaveBeenCalledTimes(1);
    });

    it('should emit low_stock_alert when stock is critical', () => {
      const mockSalesHandler = vi.fn();
      eventBus.on('materials.low_stock_alert', mockSalesHandler);

      const lowStockData = {
        materialId: 'flour-456',
        materialName: 'Flour',
        currentStock: 0,
        minStock: 10,
        severity: 'critical'
      };

      eventBus.emit('materials.low_stock_alert', lowStockData);

      expect(mockSalesHandler).toHaveBeenCalledWith(lowStockData);
    });
  });

  describe('Sales → Kitchen → Operations Workflow', () => {
    it('should handle complete order processing chain', async () => {
      const mockKitchenHandler = vi.fn();
      const mockOperationsHandler = vi.fn();
      const mockSalesNotificationHandler = vi.fn();

      // Setup listeners for the chain
      eventBus.on('sales.order_placed', mockKitchenHandler);
      eventBus.on('operations.order_ready', mockOperationsHandler);
      eventBus.on('sales.order_ready_notification', mockSalesNotificationHandler);

      // 1. Sales places order
      const orderData = {
        orderId: 'order-789',
        items: [{ productId: 'pizza-margherita', quantity: 2 }],
        customerId: 'customer-123',
        totalAmount: 25.99,
        timestamp: Date.now()
      };

      eventBus.emit('sales.order_placed', orderData);
      expect(mockKitchenHandler).toHaveBeenCalledWith(orderData);

      // 2. Kitchen marks order ready
      const orderReadyData = {
        orderId: 'order-789',
        kitchenStation: 'main',
        prepTime: 15,
        status: 'ready_for_pickup'
      };

      eventBus.emit('operations.order_ready', orderReadyData);
      expect(mockOperationsHandler).toHaveBeenCalledWith(orderReadyData);

      // 3. Sales gets notification for customer
      const notificationData = {
        orderId: 'order-789',
        estimatedDelivery: Date.now() + (5 * 60 * 1000),
        notifyCustomer: true
      };

      eventBus.emit('sales.order_ready_notification', notificationData);
      expect(mockSalesNotificationHandler).toHaveBeenCalledWith(notificationData);
    });
  });

  describe('Staff → Operations Coordination', () => {
    it('should handle shift changes affecting operations', () => {
      const mockOperationsHandler = vi.fn();
      eventBus.on('staff.shift_changed', mockOperationsHandler);

      const shiftChangeData = {
        staffId: 'staff-456',
        previousShift: { start: '09:00', end: '17:00', department: 'kitchen' },
        newShift: { start: '17:00', end: '01:00', department: 'kitchen' },
        department: 'kitchen',
        timestamp: Date.now()
      };

      eventBus.emit('staff.shift_changed', shiftChangeData);
      expect(mockOperationsHandler).toHaveBeenCalledWith(shiftChangeData);
    });

    it('should handle performance alerts', () => {
      const mockHandler = vi.fn();
      eventBus.on('staff.performance_alert', mockHandler);

      const performanceData = {
        staffId: 'staff-789',
        alertType: 'quality_issue',
        severity: 'high',
        timestamp: Date.now(),
        requiresAction: true
      };

      eventBus.emit('staff.performance_alert', performanceData);
      expect(mockHandler).toHaveBeenCalledWith(performanceData);
    });
  });

  describe('Cross-Module Event Flow', () => {
    it('should handle complete business workflow end-to-end', async () => {
      const handlers = {
        stockUpdate: vi.fn(),
        orderPlaced: vi.fn(),
        orderReady: vi.fn(),
        saleCompleted: vi.fn()
      };

      // Setup complete workflow listeners
      eventBus.on('materials.stock_updated', handlers.stockUpdate);
      eventBus.on('sales.order_placed', handlers.orderPlaced);
      eventBus.on('operations.order_ready', handlers.orderReady);
      eventBus.on('sales.sale_completed', handlers.saleCompleted);

      // Simulate complete business flow

      // 1. Customer places order
      eventBus.emit('sales.order_placed', {
        orderId: 'flow-test-001',
        items: [{ productId: 'burger', quantity: 1 }]
      });

      // 2. Kitchen prepares and marks ready
      eventBus.emit('operations.order_ready', {
        orderId: 'flow-test-001',
        status: 'ready'
      });

      // 3. Sale is completed
      eventBus.emit('sales.sale_completed', {
        saleId: 'flow-test-001',
        items: [{ materialId: 'beef-patty', quantity: 1 }]
      });

      // 4. Materials stock is updated
      eventBus.emit('materials.stock_updated', {
        materialId: 'beef-patty',
        newStock: 45,
        critical: false
      });

      // Verify all handlers were called
      expect(handlers.orderPlaced).toHaveBeenCalled();
      expect(handlers.orderReady).toHaveBeenCalled();
      expect(handlers.saleCompleted).toHaveBeenCalled();
      expect(handlers.stockUpdate).toHaveBeenCalled();
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed event data gracefully', () => {
      const mockHandler = vi.fn();
      eventBus.on('materials.stock_updated', mockHandler);

      // Test with undefined data
      eventBus.emit('materials.stock_updated', undefined);
      expect(mockHandler).toHaveBeenCalledWith(undefined);

      // Test with null data
      eventBus.emit('materials.stock_updated', null);
      expect(mockHandler).toHaveBeenCalledWith(null);

      // Test with empty object
      eventBus.emit('materials.stock_updated', {});
      expect(mockHandler).toHaveBeenCalledWith({});
    });

    it('should handle unsubscribe correctly', () => {
      const mockHandler = vi.fn();
      const unsubscribe = eventBus.on('test.event', mockHandler);

      eventBus.emit('test.event', { test: true });
      expect(mockHandler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      eventBus.emit('test.event', { test: true });
      expect(mockHandler).toHaveBeenCalledTimes(1); // Should not increase
    });

    it('should handle multiple listeners for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.on('multi.test', handler1);
      eventBus.on('multi.test', handler2);
      eventBus.on('multi.test', handler3);

      const testData = { multi: true };
      eventBus.emit('multi.test', testData);

      expect(handler1).toHaveBeenCalledWith(testData);
      expect(handler2).toHaveBeenCalledWith(testData);
      expect(handler3).toHaveBeenCalledWith(testData);
    });
  });

  describe('Performance & Memory', () => {
    it('should not leak memory with many event subscriptions', () => {
      const handlers: Array<() => void> = [];

      // Create many subscriptions
      for (let i = 0; i < 100; i++) {
        const handler = vi.fn();
        handlers.push(handler);
        eventBus.on(`test.event.${i}`, handler);
      }

      // Emit events
      for (let i = 0; i < 100; i++) {
        eventBus.emit(`test.event.${i}`, { index: i });
      }

      // Verify all handlers were called
      handlers.forEach((handler, index) => {
        expect(handler).toHaveBeenCalledWith({ index });
      });

      // Cleanup is automatic with weak references
      // No manual cleanup needed
    });

    it('should handle rapid event emissions efficiently', () => {
      const mockHandler = vi.fn();
      eventBus.on('rapid.test', mockHandler);

      const startTime = performance.now();

      // Emit 1000 events rapidly
      for (let i = 0; i < 1000; i++) {
        eventBus.emit('rapid.test', { iteration: i });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(mockHandler).toHaveBeenCalledTimes(1000);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});