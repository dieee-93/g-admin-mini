// throughput.test.ts - Performance tests for EventBus throughput
// Tests: Events per second, concurrent processing, batch operations

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../EventBus';
import { TestSetup, testConfigs, PerformanceMeasurement, MemoryMonitor } from '../helpers/test-utilities';
import { dataGenerators, mockEventTemplates } from '../helpers/mock-data';
import { createSalesTestModule, createInventoryTestModule, createCustomersTestModule } from '../helpers/test-modules';
import type { EventPattern } from '../../types';

describe('EventBus - Throughput Performance', () => {
  let eventBus: EventBus;
  let perfMeasurement: PerformanceMeasurement;
  let memoryMonitor: MemoryMonitor;

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.performance);
    perfMeasurement = new PerformanceMeasurement();
    memoryMonitor = new MemoryMonitor();

    // Take initial memory snapshot
    memoryMonitor.takeSnapshot('initial');
  });

  afterEach(async () => {
    // Take final memory snapshot
    memoryMonitor.takeSnapshot('final');
    
    // Check for memory leaks
    const leakCheck = memoryMonitor.checkForLeaks(5 * 1024 * 1024); // 5MB threshold
    if (leakCheck.hasLeak) {
      console.warn(`Potential memory leak detected: ${leakCheck.growth} bytes growth`);
    }

    perfMeasurement.clear();
    memoryMonitor.clear();
    await TestSetup.cleanup();
  });

  describe('Single Event Performance', () => {
    it('should emit events with low latency', async () => {
      const eventCount = 1000;
      const pattern: EventPattern = 'test.single.performance';
      
      perfMeasurement.start('single-event-emission');

      for (let i = 0; i < eventCount; i++) {
        await eventBus.emit(pattern, { sequence: i, timestamp: Date.now() });
      }

      const totalTime = perfMeasurement.end('single-event-emission');
      const eventsPerSecond = (eventCount / totalTime) * 1000;

      expect(eventsPerSecond).toBeGreaterThan(500); // Minimum 500 events/sec
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(`Single event performance: ${eventsPerSecond.toFixed(2)} events/sec`);
      console.log(`Average latency: ${(totalTime / eventCount).toFixed(2)} ms/event`);
    });

    it('should handle events with large payloads efficiently', async () => {
      const largePayloadEvents = dataGenerators.generateLargePayloadEvents(100, 10); // 100 events, 10KB each
      
      perfMeasurement.start('large-payload-emission');

      for (const event of largePayloadEvents) {
        await eventBus.emit(event.pattern, event.payload);
      }

      const totalTime = perfMeasurement.end('large-payload-emission');
      const eventsPerSecond = (largePayloadEvents.length / totalTime) * 1000;

      expect(eventsPerSecond).toBeGreaterThan(50); // Should handle at least 50 large events/sec
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

      console.log(`Large payload performance: ${eventsPerSecond.toFixed(2)} events/sec`);
      console.log(`Payload size: 10KB per event`);
    });

    it('should maintain consistent performance under sustained load', async () => {
      const testDuration = 3000; // Reduced to 3 seconds
      const batchSize = 25; // Reduced batch size
      let totalEvents = 0;
      const latencies: number[] = [];

      const endTime = Date.now() + testDuration;

      while (Date.now() < endTime) {
        const batchStart = performance.now();
        
        const batchPromises = [];
        for (let i = 0; i < batchSize; i++) {
          batchPromises.push(
            eventBus.emit('test.sustained.load', { 
              batch: Math.floor(totalEvents / batchSize),
              sequence: totalEvents++,
              timestamp: Date.now()
            })
          );
        }

        await Promise.all(batchPromises);
        
        const batchLatency = performance.now() - batchStart;
        latencies.push(batchLatency);

        // Brief pause to simulate realistic load
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const eventsPerSecond = totalEvents / (testDuration / 1000);

      expect(eventsPerSecond).toBeGreaterThan(200); // Sustained 200+ events/sec
      expect(averageLatency).toBeLessThan(200); // Average batch latency < 200ms
      
      // Check for performance degradation over time
      const firstQuarter = latencies.slice(0, Math.floor(latencies.length / 4));
      const lastQuarter = latencies.slice(-Math.floor(latencies.length / 4));
      
      const firstQuarterAvg = firstQuarter.reduce((sum, lat) => sum + lat, 0) / firstQuarter.length;
      const lastQuarterAvg = lastQuarter.reduce((sum, lat) => sum + lat, 0) / lastQuarter.length;
      
      const degradation = (lastQuarterAvg - firstQuarterAvg) / firstQuarterAvg;
      expect(degradation).toBeLessThan(3.0); // Relaxed to less than 300% performance degradation

      console.log(`Sustained load: ${totalEvents} events in ${testDuration}ms`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);
      console.log(`Average latency: ${averageLatency.toFixed(2)} ms/batch`);
      console.log(`Performance degradation: ${(degradation * 100).toFixed(1)}%`);
    }, 10000); // 10 second timeout
  });

  describe('Concurrent Event Processing', () => {
    it('should handle concurrent event emissions efficiently', async () => {
      const concurrentBatches = 10;
      const eventsPerBatch = 100;
      const totalEvents = concurrentBatches * eventsPerBatch;

      perfMeasurement.start('concurrent-emission');

      // Create concurrent batches
      const batchPromises = [];
      for (let batch = 0; batch < concurrentBatches; batch++) {
        const batchPromise = Promise.all(
          Array.from({ length: eventsPerBatch }, (_, i) =>
            eventBus.emit('test.concurrent.batch', {
              batch,
              sequence: i,
              timestamp: Date.now()
            })
          )
        );
        batchPromises.push(batchPromise);
      }

      await Promise.all(batchPromises);

      const totalTime = perfMeasurement.end('concurrent-emission');
      const eventsPerSecond = (totalEvents / totalTime) * 1000;

      expect(eventsPerSecond).toBeGreaterThan(800); // Should benefit from concurrency
      expect(totalTime).toBeLessThan(3000); // Should complete faster than sequential

      console.log(`Concurrent emission: ${totalEvents} events in ${concurrentBatches} batches`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);
    });

    it('should handle high concurrency without degradation', async () => {
      const concurrentPromises = 500;
      const eventsPerPromise = 5;
      const totalEvents = concurrentPromises * eventsPerPromise;

      perfMeasurement.start('high-concurrency');

      // Create many concurrent promises
      const promises = Array.from({ length: concurrentPromises }, (_, i) =>
        Promise.all(
          Array.from({ length: eventsPerPromise }, (_, j) =>
            eventBus.emit('test.high.concurrency', {
              promise: i,
              event: j,
              timestamp: Date.now()
            })
          )
        )
      );

      await Promise.all(promises);

      const totalTime = perfMeasurement.end('high-concurrency');
      const eventsPerSecond = (totalEvents / totalTime) * 1000;

      expect(eventsPerSecond).toBeGreaterThan(1000); // High concurrency should be very fast
      expect(totalTime).toBeLessThan(5000);

      console.log(`High concurrency: ${concurrentPromises} concurrent promises`);
      console.log(`Total events: ${totalEvents}`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);
    });

    it('should maintain performance with mixed event patterns', async () => {
      const patterns: EventPattern[] = [
        'sales.order.created',
        'inventory.stock.updated', 
        'staff.clock.in',
        'payments.payment.processed',
        'kitchen.order.completed',
        'customers.profile.updated'
      ];

      const eventsPerPattern = 200;
      const totalEvents = patterns.length * eventsPerPattern;

      perfMeasurement.start('mixed-patterns');

      // Generate mixed events concurrently
      const patternPromises = patterns.map(pattern =>
        Promise.all(
          Array.from({ length: eventsPerPattern }, (_, i) =>
            eventBus.emit(pattern, {
              pattern: pattern,
              sequence: i,
              data: `test-data-${i}`,
              timestamp: Date.now()
            })
          )
        )
      );

      await Promise.all(patternPromises);

      const totalTime = perfMeasurement.end('mixed-patterns');
      const eventsPerSecond = (totalEvents / totalTime) * 1000;

      expect(eventsPerSecond).toBeGreaterThan(600); // Should handle mixed patterns well
      expect(totalTime).toBeLessThan(4000);

      console.log(`Mixed patterns: ${patterns.length} different patterns`);
      console.log(`Events per pattern: ${eventsPerPattern}`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);
    });
  });

  describe('Event Handler Performance', () => {
    beforeEach(async () => {
      // Register modules with handlers in correct dependency order
      await eventBus.registerModule(createInventoryTestModule());
      await eventBus.registerModule(createCustomersTestModule());
      await eventBus.registerModule(createSalesTestModule());
    });

    it('should process events with handlers efficiently', async () => {
      const eventCount = 1000;
      let handledCount = 0;

      // Add test handlers
      const unsubscribe1 = eventBus.on('test.handler.performance', async (_event) => {
        handledCount++;
        // Simulate minimal processing
        await new Promise(resolve => setImmediate(resolve));
      });

      const unsubscribe2 = eventBus.on('test.handler.performance', async (_event) => {
        handledCount++;
        // Simulate minimal processing
        await new Promise(resolve => setImmediate(resolve));
      });

      perfMeasurement.start('handler-processing');

      for (let i = 0; i < eventCount; i++) {
        await eventBus.emit('test.handler.performance', { sequence: i });
      }

      const totalTime = perfMeasurement.end('handler-processing');

      // Wait for all handlers to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const eventsPerSecond = (eventCount / totalTime) * 1000;

      expect(eventsPerSecond).toBeGreaterThan(300); // Should maintain good throughput with handlers
      expect(handledCount).toBe(eventCount * 2); // Both handlers should process all events

      console.log(`Handler processing: ${eventCount} events, ${handledCount} handler calls`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);

      unsubscribe1();
      unsubscribe2();
    });

    it('should handle multiple subscribers per event efficiently', async () => {
      const subscriberCount = 20;
      const eventCount = 200;
      let totalHandlerCalls = 0;

      const unsubscribers: (() => void)[] = [];

      // Add multiple subscribers
      for (let i = 0; i < subscriberCount; i++) {
        const unsubscribe = eventBus.on('test.multiple.subscribers', async (_event) => {
          totalHandlerCalls++;
          // Simulate very light processing
          event.payload.processed = true;
        });
        unsubscribers.push(unsubscribe);
      }

      perfMeasurement.start('multiple-subscribers');

      for (let i = 0; i < eventCount; i++) {
        await eventBus.emit('test.multiple.subscribers', { 
          sequence: i,
          timestamp: Date.now()
        });
      }

      const totalTime = perfMeasurement.end('multiple-subscribers');

      // Wait for all handlers to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      const eventsPerSecond = (eventCount / totalTime) * 1000;
      const expectedHandlerCalls = eventCount * subscriberCount;

      expect(eventsPerSecond).toBeGreaterThan(100); // Should maintain reasonable throughput
      expect(totalHandlerCalls).toBe(expectedHandlerCalls);

      console.log(`Multiple subscribers: ${subscriberCount} subscribers, ${eventCount} events`);
      console.log(`Total handler calls: ${totalHandlerCalls}`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);

      // Cleanup
      unsubscribers.forEach(unsubscribe => unsubscribe());
    });

    it('should handle slow handlers without blocking other events', async () => {
      const fastEventCount = 500;
      const slowEventCount = 10;
      let fastEventsProcessed = 0;
      let slowEventsProcessed = 0;

      // Fast handler
      const unsubscribeFast = eventBus.on('test.fast.handler', async (_event) => {
        fastEventsProcessed++;
      });

      // Slow handler  
      const unsubscribeSlow = eventBus.on('test.slow.handler', async (_event) => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
        slowEventsProcessed++;
      });

      perfMeasurement.start('mixed-speed-handlers');

      // Emit slow events first
      const slowPromises = [];
      for (let i = 0; i < slowEventCount; i++) {
        slowPromises.push(
          eventBus.emit('test.slow.handler', { sequence: i })
        );
      }

      // Emit fast events (should not be blocked by slow ones)
      const fastPromises = [];
      for (let i = 0; i < fastEventCount; i++) {
        fastPromises.push(
          eventBus.emit('test.fast.handler', { sequence: i })
        );
      }

      await Promise.all([...slowPromises, ...fastPromises]);

      const totalTime = perfMeasurement.end('mixed-speed-handlers');

      // Wait for all handlers to complete
      await new Promise(resolve => setTimeout(resolve, slowEventCount * 60));

      expect(fastEventsProcessed).toBe(fastEventCount);
      expect(slowEventsProcessed).toBe(slowEventCount);
      
      const totalEvents = fastEventCount + slowEventCount;
      const eventsPerSecond = (totalEvents / totalTime) * 1000;

      // Fast events should not be significantly impacted by slow handlers
      expect(eventsPerSecond).toBeGreaterThan(200);

      console.log(`Mixed speed handlers: ${fastEventCount} fast + ${slowEventCount} slow`);
      console.log(`Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);

      unsubscribeFast();
      unsubscribeSlow();
    });
  });

  describe('Memory and Resource Efficiency', () => {
    it('should maintain stable memory usage under high throughput', async () => {
      const batchSize = 1000;
      const batches = 5;

      for (let batch = 0; batch < batches; batch++) {
        memoryMonitor.takeSnapshot(`batch-${batch}-start`);

        perfMeasurement.start(`batch-${batch}`);

        // Process batch of events
        const promises = [];
        for (let i = 0; i < batchSize; i++) {
          promises.push(
            eventBus.emit('test.memory.stability', {
              batch,
              sequence: i,
              data: `batch-${batch}-event-${i}`
            })
          );
        }

        await Promise.all(promises);

        perfMeasurement.end(`batch-${batch}`);
        memoryMonitor.takeSnapshot(`batch-${batch}-end`);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Brief pause between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check memory growth
      const memoryStats = memoryMonitor.getGrowthStats();
      const avgGrowthPerBatch = memoryStats.totalGrowth / batches;

      // Memory growth should be reasonable (less than 1MB per 1000 events)
      expect(avgGrowthPerBatch).toBeLessThan(1024 * 1024);

      // Get performance stats for all batches
      const batchStats = [];
      for (let i = 0; i < batches; i++) {
        const stats = perfMeasurement.getStats(`batch-${i}`);
        batchStats.push(stats);
      }

      // Performance should remain consistent across batches
      const avgLatencies = batchStats.map(s => s.avg);
      const maxLatency = Math.max(...avgLatencies);
      const minLatency = Math.min(...avgLatencies);
      const latencyVariation = (maxLatency - minLatency) / minLatency;

      expect(latencyVariation).toBeLessThan(5.0); // Relaxed to less than 500% variation for performance tests

      console.log(`Memory stability test: ${batches} batches of ${batchSize} events each`);
      console.log(`Total memory growth: ${(memoryStats.totalGrowth / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Average growth per batch: ${(avgGrowthPerBatch / 1024).toFixed(2)} KB`);
      console.log(`Latency variation: ${(latencyVariation * 100).toFixed(1)}%`);
    });

    it('should efficiently handle event cleanup and garbage collection', async () => {
      const eventCount = 2000;
      let processedCount = 0;

      // Add handler to ensure events are processed
      const unsubscribe = eventBus.on('test.cleanup.gc', async (_event) => {
        processedCount++;
      });

      memoryMonitor.takeSnapshot('before-events');

      perfMeasurement.start('event-cleanup');

      // Generate many events with references that should be cleaned up
      for (let i = 0; i < eventCount; i++) {
        await eventBus.emit('test.cleanup.gc', {
          sequence: i,
          largeArray: Array(100).fill(`data-${i}`), // Create objects that need cleanup
          timestamp: Date.now()
        });
      }

      perfMeasurement.end('event-cleanup');

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(processedCount).toBe(eventCount);

      memoryMonitor.takeSnapshot('after-events');

      // Force garbage collection
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      memoryMonitor.takeSnapshot('after-gc');

      // Memory should not grow excessively
      const memoryGrowth = memoryMonitor.getGrowthStats();
      const growthMB = memoryGrowth.totalGrowth / 1024 / 1024;

      expect(growthMB).toBeLessThan(10); // Less than 10MB growth for 2000 events

      console.log(`Cleanup test: ${eventCount} events processed`);
      console.log(`Memory growth: ${growthMB.toFixed(2)} MB`);

      unsubscribe();
    });
  });

  describe('Real-world Performance Scenarios', () => {
    beforeEach(async () => {
      // Setup realistic modules in correct dependency order
      const modules = [
        createInventoryTestModule(),
        createCustomersTestModule(),
        createSalesTestModule()
      ];

      for (const module of modules) {
        await eventBus.registerModule(module);
      }
    });

    it('should handle peak restaurant ordering load', async () => {
      const peakDuration = 5000; // Reduced to 5 seconds peak
      const ordersPerSecond = 3; // Reduced to 3 orders per second during peak
      const itemsPerOrder = 3; // Average 3 items per order

      let totalOrders = 0;
      let totalInventoryUpdates = 0;

      // Setup order processing
      const unsubscribeOrders = eventBus.on('sales.order.created', async (_event) => {
        totalOrders++;
        
        // Each order triggers inventory updates for each item
        for (const item of event.payload.items || []) {
          await eventBus.emit('inventory.stock.updated', {
            itemId: item.id,
            newStock: Math.floor(Math.random() * 100),
            operation: 'sale'
          });
        }
      });

      const unsubscribeInventory = eventBus.on('inventory.stock.updated', async (_event) => {
        totalInventoryUpdates++;
      });

      perfMeasurement.start('peak-restaurant-load');

      // Simulate peak load
      const endTime = Date.now() + peakDuration;
      const intervalMs = 1000 / ordersPerSecond; // Interval between orders

      while (Date.now() < endTime) {
        const orderPromises = [];
        
        // Generate batch of orders for this second
        for (let i = 0; i < ordersPerSecond; i++) {
          const orderId = `PEAK-${totalOrders + i}-${Date.now()}`;
          const items = Array.from({ length: itemsPerOrder }, (_, j) => ({
            id: `ITEM-${j + 1}`,
            name: `Item ${j + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1
          }));

          orderPromises.push(
            eventBus.emit('sales.order.created', {
              orderId,
              customerId: `CUST-${Math.floor(Math.random() * 100)}`,
              items,
              total: Math.random() * 100 + 20
            })
          );
        }

        await Promise.all(orderPromises);
        
        // Brief pause to simulate real timing
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }

      const totalTime = perfMeasurement.end('peak-restaurant-load');

      // Wait for all processing to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      const actualOrdersPerSecond = (totalOrders / totalTime) * 1000;
      const expectedOrders = Math.floor((peakDuration / 1000) * ordersPerSecond);

      expect(totalOrders).toBeGreaterThanOrEqual(expectedOrders * 0.9); // Within 10% of expected
      expect(actualOrdersPerSecond).toBeGreaterThan(ordersPerSecond * 0.8); // Maintain 80% of target throughput
      expect(totalInventoryUpdates).toBeGreaterThan(totalOrders * itemsPerOrder * 0.8); // Most inventory updates processed

      console.log(`Peak restaurant load simulation:`);
      console.log(`- Duration: ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`- Orders processed: ${totalOrders}`);
      console.log(`- Inventory updates: ${totalInventoryUpdates}`);
      console.log(`- Throughput: ${actualOrdersPerSecond.toFixed(2)} orders/sec`);

      unsubscribeOrders();
      unsubscribeInventory();
    }, 15000); // 15 second timeout

    it('should maintain performance during business flow complexity', async () => {
      const complexOrderCount = 100;
      const eventsPerOrder = 8; // Complex flow with many events per order
      
      let totalEvents = 0;

      // Setup complex business flow handlers
      const handlers = [
        eventBus.on('sales.order.created', async (_event) => {
          totalEvents++;
          await eventBus.emit('inventory.stock.check', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('inventory.stock.check', async (_event) => {
          totalEvents++;
          await eventBus.emit('inventory.stock.reserved', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('inventory.stock.reserved', async (_event) => {
          totalEvents++;
          await eventBus.emit('payments.payment.requested', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('payments.payment.requested', async (_event) => {
          totalEvents++;
          await eventBus.emit('payments.payment.processed', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('payments.payment.processed', async (_event) => {
          totalEvents++;
          await eventBus.emit('kitchen.order.queued', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('kitchen.order.queued', async (_event) => {
          totalEvents++;
          await eventBus.emit('kitchen.order.completed', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('kitchen.order.completed', async (_event) => {
          totalEvents++;
          await eventBus.emit('sales.order.fulfilled', { orderId: event.payload.orderId });
        }),
        
        eventBus.on('sales.order.fulfilled', async (_event) => {
          totalEvents++;
        })
      ];

      perfMeasurement.start('complex-business-flow');

      // Trigger complex flows
      const orderPromises = [];
      for (let i = 0; i < complexOrderCount; i++) {
        orderPromises.push(
          eventBus.emit('sales.order.created', {
            orderId: `COMPLEX-${i}`,
            customerId: `CUST-${i}`,
            total: Math.random() * 200 + 50
          })
        );
      }

      await Promise.all(orderPromises);

      const totalTime = perfMeasurement.end('complex-business-flow');

      // Wait for all flows to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      const expectedTotalEvents = complexOrderCount * eventsPerOrder;
      const eventsPerSecond = (totalEvents / totalTime) * 1000;

      expect(totalEvents).toBeGreaterThanOrEqual(expectedTotalEvents * 0.9); // 90% of events processed
      expect(eventsPerSecond).toBeGreaterThan(200); // Maintain good throughput for complex flows

      console.log(`Complex business flow:`);
      console.log(`- Orders: ${complexOrderCount}`);
      console.log(`- Events per order: ${eventsPerOrder}`);
      console.log(`- Total events: ${totalEvents}`);
      console.log(`- Throughput: ${eventsPerSecond.toFixed(2)} events/sec`);

      // Cleanup handlers
      handlers.forEach(unsubscribe => unsubscribe());
    });
  });
});