// EventBusV2.test.ts - Unit tests for EventBus V2.0 core functionality
// Tests: emit, on, off, once, waitFor, replay, module management

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBusV2 } from '../../EventBusV2';
import { TestSetup, EventBusAssertions, testConfigs } from '../helpers/test-utilities';
import { mockEventTemplates } from '../helpers/mock-data';
import { createSalesTestModule, createInventoryTestModule } from '../helpers/test-modules';
import type { EventPattern, NamespacedEvent } from '../../types';

describe('EventBusV2 Core Functionality', () => {
  let eventBus: EventBusV2;
  let assertions: EventBusAssertions;
  let capturedEvents: NamespacedEvent[];

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.unit);
    assertions = new EventBusAssertions();
    capturedEvents = [];

    // Setup event capture
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = async (pattern, payload, options = {}) => {
      const result = await originalEmit(pattern, payload, options);
      
      // Capture emitted events
      capturedEvents.push({
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern,
        payload,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'unit_test',
          ...options
        }
      });
      
      return result;
    };

    assertions.setEvents(capturedEvents);
  });

  afterEach(async () => {
    await TestSetup.cleanup();
    capturedEvents = [];
  });

  describe('Event Emission', () => {
    it('should emit basic event successfully', async () => {
      const pattern: EventPattern = 'test.basic.event';
      const payload = { message: 'Hello World' };

      await eventBus.emit(pattern, payload);

      assertions.assertEventEmitted(pattern);
      assertions.assertEventCount(1);
      assertions.assertEventPayload(pattern, payload);
    });

    it('should emit event with options', async () => {
      const pattern: EventPattern = 'test.options.event';
      const payload = { data: 'test' };
      const options = {
        priority: 'high' as const,
        correlationId: 'test-123',
        userId: 'user-456'
      };

      await eventBus.emit(pattern, payload, options);

      assertions.assertEventEmitted(pattern);
      const event = capturedEvents.find(e => e.pattern === pattern);
      expect(event?.metadata).toMatchObject({
        priority: 'high',
        correlationId: 'test-123',
        userId: 'user-456'
      });
    });

    it('should handle complex payload objects', async () => {
      const pattern: EventPattern = 'test.complex.payload';
      const payload = {
        order: {
          id: 'ORD-001',
          items: [
            { name: 'Item 1', price: 10.99 },
            { name: 'Item 2', price: 15.50 }
          ],
          customer: {
            id: 'CUST-001',
            name: 'John Doe',
            address: {
              street: '123 Main St',
              city: 'New York',
              country: 'USA'
            }
          }
        }
      };

      await eventBus.emit(pattern, payload);

      assertions.assertEventPayload(pattern, payload);
    });

    it('should handle null and undefined values in payload', async () => {
      const pattern: EventPattern = 'test.null.values';
      const payload = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        emptyArray: [],
        emptyObject: {},
        zero: 0,
        false: false
      };

      await eventBus.emit(pattern, payload);

      assertions.assertEventPayload(pattern, payload);
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events with on()', async () => {
      const pattern: EventPattern = 'test.subscription.basic';
      let receivedEvent: NamespacedEvent | null = null;

      const unsubscribe = eventBus.on(pattern, async (event) => {
        receivedEvent = event;
      });

      const payload = { message: 'test subscription' };
      await eventBus.emit(pattern, payload);

      // Wait a bit for async processing
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(receivedEvent).toBeTruthy();
      expect(receivedEvent?.pattern).toBe(pattern);
      expect(receivedEvent?.payload).toEqual(payload);

      unsubscribe();
    });

    it('should support multiple subscribers for same pattern', async () => {
      const pattern: EventPattern = 'test.multiple.subscribers';
      const receivedEvents: NamespacedEvent[] = [];

      // Subscribe 3 handlers
      const unsubscribe1 = eventBus.on(pattern, async (event) => {
        receivedEvents.push({ ...event, source: 'handler1' });
      });

      const unsubscribe2 = eventBus.on(pattern, async (event) => {
        receivedEvents.push({ ...event, source: 'handler2' });
      });

      const unsubscribe3 = eventBus.on(pattern, async (event) => {
        receivedEvents.push({ ...event, source: 'handler3' });
      });

      await eventBus.emit(pattern, { test: true });
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(receivedEvents).toHaveLength(3);
      expect(receivedEvents.every(e => e.pattern === pattern)).toBe(true);

      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    it('should unsubscribe properly with off()', async () => {
      const pattern: EventPattern = 'test.unsubscribe';
      let callCount = 0;

      const handler = async () => {
        callCount++;
      };

      const unsubscribe = eventBus.on(pattern, handler);

      // Emit before unsubscribe
      await eventBus.emit(pattern, {});
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callCount).toBe(1);

      // Unsubscribe
      unsubscribe();

      // Emit after unsubscribe
      await eventBus.emit(pattern, {});
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callCount).toBe(1); // Should still be 1
    });

    it('should support once() for single-use subscriptions', async () => {
      const pattern: EventPattern = 'test.once.subscription';
      let callCount = 0;

      const unsubscribe = eventBus.once(pattern, async () => {
        callCount++;
      });

      // Emit multiple times
      await eventBus.emit(pattern, { attempt: 1 });
      await eventBus.emit(pattern, { attempt: 2 });
      await eventBus.emit(pattern, { attempt: 3 });

      await new Promise(resolve => setTimeout(resolve, 30));

      expect(callCount).toBe(1); // Should only be called once

      unsubscribe(); // Should be safe to call even after auto-unsubscribe
    });

    it('should support subscription options', async () => {
      const pattern: EventPattern = 'test.subscription.options';
      let receivedEvent: NamespacedEvent | null = null;

      const unsubscribe = eventBus.on(
        pattern,
        async (event) => {
          receivedEvent = event;
        },
        {
          priority: 'high',
          persistent: true,
          moduleId: 'test-module'
        }
      );

      await eventBus.emit(pattern, { data: 'test' });
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(receivedEvent).toBeTruthy();
      unsubscribe();
    });
  });

  describe('Event Filtering', () => {
    it('should support wildcard patterns', async () => {
      let receivedEvents: NamespacedEvent[] = [];

      const unsubscribe = eventBus.on('test.wildcard.*', async (event) => {
        receivedEvents.push(event);
      });

      await eventBus.emit('test.wildcard.one', { id: 1 });
      await eventBus.emit('test.wildcard.two', { id: 2 });
      await eventBus.emit('test.different.pattern', { id: 3 });

      await new Promise(resolve => setTimeout(resolve, 30));

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0].pattern).toBe('test.wildcard.one');
      expect(receivedEvents[1].pattern).toBe('test.wildcard.two');

      unsubscribe();
    });

    it('should support event filters in subscriptions', async () => {
      const pattern: EventPattern = 'test.filtered.events';
      let filteredEvents: NamespacedEvent[] = [];

      const unsubscribe = eventBus.on(
        pattern,
        async (event) => {
          filteredEvents.push(event);
        },
        {
          filter: (event) => event.payload.priority === 'high'
        }
      );

      // Emit events with different priorities
      await eventBus.emit(pattern, { priority: 'low', message: 'low priority' });
      await eventBus.emit(pattern, { priority: 'high', message: 'high priority 1' });
      await eventBus.emit(pattern, { priority: 'medium', message: 'medium priority' });
      await eventBus.emit(pattern, { priority: 'high', message: 'high priority 2' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(filteredEvents).toHaveLength(2);
      expect(filteredEvents.every(e => e.payload.priority === 'high')).toBe(true);

      unsubscribe();
    });
  });

  describe('waitFor functionality', () => {
    it('should wait for specific event', async () => {
      const pattern: EventPattern = 'test.wait.specific';
      const expectedPayload = { result: 'success' };

      // Start waiting (in background)
      const waitPromise = eventBus.waitFor(pattern, 1000);

      // Emit the event after a short delay
      setTimeout(async () => {
        await eventBus.emit(pattern, expectedPayload);
      }, 50);

      const receivedEvent = await waitPromise;

      expect(receivedEvent.pattern).toBe(pattern);
      expect(receivedEvent.payload).toEqual(expectedPayload);
    });

    it('should timeout when event is not received', async () => {
      const pattern: EventPattern = 'test.wait.timeout';

      await expect(
        eventBus.waitFor(pattern, 100) // Very short timeout
      ).rejects.toThrow('Timeout');
    });

    it('should support filters in waitFor', async () => {
      const pattern: EventPattern = 'test.wait.filtered';

      // Start waiting with filter
      const waitPromise = eventBus.waitFor(
        pattern,
        1000,
        (event) => event.payload.status === 'completed'
      );

      // Emit events - first should be filtered out
      setTimeout(async () => {
        await eventBus.emit(pattern, { status: 'pending' });
        await eventBus.emit(pattern, { status: 'completed', result: 'done' });
      }, 50);

      const receivedEvent = await waitPromise;

      expect(receivedEvent.payload.status).toBe('completed');
      expect(receivedEvent.payload.result).toBe('done');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in event handlers gracefully', async () => {
      const pattern: EventPattern = 'test.error.handling';
      let errorCaught = false;
      let successCalled = false;

      // Handler that throws error
      const unsubscribe1 = eventBus.on(pattern, async () => {
        throw new Error('Handler error');
      });

      // Handler that should still execute
      const unsubscribe2 = eventBus.on(pattern, async () => {
        successCalled = true;
      });

      // Listen for error events
      const unsubscribeError = eventBus.on('global.eventbus.error', async (event) => {
        errorCaught = true;
        expect(event.payload.originalPattern).toBe(pattern);
      });

      await eventBus.emit(pattern, { test: true });
      await new Promise(resolve => setTimeout(resolve, 30));

      expect(errorCaught).toBe(true);
      expect(successCalled).toBe(true); // Other handlers should still work

      unsubscribe1();
      unsubscribe2();
      unsubscribeError();
    });

    it('should validate event patterns', async () => {
      await expect(
        eventBus.emit('' as EventPattern, {})
      ).rejects.toThrow();

      await expect(
        eventBus.emit('invalid pattern with spaces' as EventPattern, {})
      ).rejects.toThrow();
    });

    it('should handle large payloads', async () => {
      const pattern: EventPattern = 'test.large.payload';
      const largePayload = {
        data: 'x'.repeat(100000), // 100KB string
        array: Array(1000).fill({ nested: { data: 'test' } }),
        metadata: {
          size: 'large',
          timestamp: new Date().toISOString()
        }
      };

      await expect(
        eventBus.emit(pattern, largePayload)
      ).resolves.not.toThrow();

      assertions.assertEventEmitted(pattern);
    });
  });

  describe('Module Integration', () => {
    it('should register modules successfully', async () => {
      const salesModule = createSalesTestModule();
      
      await eventBus.registerModule(salesModule);

      const health = await eventBus.getModuleHealth('test-sales');
      expect(health['test-sales']).toBeTruthy();
      expect(health['test-sales'].status).toBe('active');
    });

    it('should handle module dependencies', async () => {
      const inventoryModule = createInventoryTestModule();
      const salesModule = createSalesTestModule(); // depends on inventory

      // Register dependency first
      await eventBus.registerModule(inventoryModule);
      await eventBus.registerModule(salesModule);

      const health = await eventBus.getModuleHealth();
      expect(health['test-inventory'].status).toBe('active');
      expect(health['test-sales'].status).toBe('active');
    });

    it('should deactivate modules properly', async () => {
      const module = createInventoryTestModule();
      await eventBus.registerModule(module);

      let healthBefore = await eventBus.getModuleHealth('test-inventory');
      expect(healthBefore['test-inventory'].status).toBe('active');

      await eventBus.deactivateModule('test-inventory');

      let healthAfter = await eventBus.getModuleHealth('test-inventory');
      expect(healthAfter['test-inventory'].status).toBe('inactive');
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should collect basic metrics', async () => {
      // Emit several events
      await eventBus.emit('test.metrics.1', {});
      await eventBus.emit('test.metrics.2', {});
      await eventBus.emit('test.metrics.3', {});

      const metrics = await eventBus.getMetrics();

      expect(metrics.totalEvents).toBeGreaterThanOrEqual(3);
      expect(metrics.avgLatencyMs).toBeGreaterThan(0);
      expect(typeof metrics.eventsPerSecond).toBe('number');
    });

    it('should track event patterns', async () => {
      const pattern1: EventPattern = 'test.pattern.tracking.1';
      const pattern2: EventPattern = 'test.pattern.tracking.2';

      await eventBus.emit(pattern1, {});
      await eventBus.emit(pattern1, {});
      await eventBus.emit(pattern2, {});

      const metrics = await eventBus.getMetrics();

      expect(metrics.eventPatterns.get(pattern1)?.totalEvents).toBe(2);
      expect(metrics.eventPatterns.get(pattern2)?.totalEvents).toBe(1);
    });
  });

  describe('Configuration', () => {
    it('should respect configuration settings', async () => {
      const customEventBus = await TestSetup.createEventBus({
        ...testConfigs.unit,
        maxConcurrentEvents: 2,
        defaultEventTimeout: 100
      });

      // Test timeout configuration
      await expect(
        customEventBus.waitFor('test.config.timeout', 200)
      ).rejects.toThrow();
    });
  });

  describe('Business Event Templates', () => {
    it('should handle sales order events', async () => {
      const orderEvent = mockEventTemplates.orderCreated('ORD-TEST-001', 'CUST-TEST-001');
      
      await eventBus.emit(orderEvent.pattern, orderEvent.payload);

      assertions.assertEventEmitted(orderEvent.pattern);
      assertions.assertEventPayload(orderEvent.pattern, orderEvent.payload);
    });

    it('should handle inventory events', async () => {
      const stockEvent = mockEventTemplates.stockLow('ITEM-001', 5, 10);
      
      await eventBus.emit(stockEvent.pattern, stockEvent.payload);

      assertions.assertEventEmitted(stockEvent.pattern);
      expect(capturedEvents[capturedEvents.length - 1].payload.urgency).toBe('warning');
    });

    it('should handle staff events', async () => {
      const clockInEvent = mockEventTemplates.clockIn('STAFF-001');
      
      await eventBus.emit(clockInEvent.pattern, clockInEvent.payload);

      assertions.assertEventEmitted(clockInEvent.pattern);
      expect(capturedEvents[capturedEvents.length - 1].payload.staffId).toBe('STAFF-001');
    });
  });

  describe('Graceful Shutdown', () => {
    it('should shutdown gracefully', async () => {
      const pattern: EventPattern = 'test.shutdown';
      let handlerCompleted = false;

      eventBus.on(pattern, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        handlerCompleted = true;
      });

      // Emit event and start shutdown immediately
      await eventBus.emit(pattern, {});
      
      // Shutdown should wait for handlers to complete
      await eventBus.gracefulShutdown(1000);

      expect(handlerCompleted).toBe(true);
    });

    it('should timeout graceful shutdown if handlers take too long', async () => {
      const pattern: EventPattern = 'test.shutdown.timeout';

      eventBus.on(pattern, async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      });

      await eventBus.emit(pattern, {});

      // Should timeout after 500ms
      const startTime = Date.now();
      await eventBus.gracefulShutdown(500);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // Should timeout before 1 second
    });
  });
});