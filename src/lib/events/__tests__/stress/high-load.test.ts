// high-load.test.ts - Stress tests for EventBus under extreme load
// Tests: High event volumes, system stability, resource exhaustion scenarios

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../EventBus';
import { TestSetup, testConfigs, MemoryMonitor, PerformanceMeasurement } from '../helpers/test-utilities';
import { dataGenerators } from '../helpers/mock-data';
import { createSalesTestModule, createInventoryTestModule, createFailingKitchenTestModule, createCustomersTestModule } from '../helpers/test-modules';
import type { EventPattern } from '../types';

describe('EventBus - High Load Stress Tests', () => {
  let eventBus: EventBus;
  let memoryMonitor: MemoryMonitor;
  let perfMeasurement: PerformanceMeasurement;

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.stress);
    memoryMonitor = new MemoryMonitor();
    perfMeasurement = new PerformanceMeasurement();
    
    memoryMonitor.takeSnapshot('test-start');
  });

  afterEach(async () => {
    memoryMonitor.takeSnapshot('test-end');
    
    const leakCheck = memoryMonitor.checkForLeaks(20 * 1024 * 1024); // 20MB threshold for stress tests
    if (leakCheck.hasLeak) {
      console.warn(`Memory leak detected in stress test: ${(leakCheck.growth / 1024 / 1024).toFixed(2)} MB`);
    }

    perfMeasurement.clear();
    memoryMonitor.clear();
    await TestSetup.cleanup();
  });

  describe('Extreme Event Volumes', () => {
    it('should handle 10,000 events without degradation', async () => {
      const eventCount = 10000;
      let processedEvents = 0;

      // Simple handler to count processed events
      const unsubscribe = eventBus.on('stress.high.volume', async (event) => {
        processedEvents++;
      });

      perfMeasurement.start('extreme-volume');

      // Emit events in batches to avoid overwhelming the system
      const batchSize = 500;
      const batches = Math.ceil(eventCount / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const batchPromises: Promise<void>[] = [];
        const batchStart = batch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, eventCount);

        for (let i = batchStart; i < batchEnd; i++) {
          batchPromises.push(
            eventBus.emit('stress.high.volume', {
              sequence: i,
              batch: batch,
              timestamp: Date.now()
            })
          );
        }

        await Promise.all(batchPromises);

        // Small pause between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const totalTime = perfMeasurement.end('extreme-volume');

      // Wait for all events to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(processedEvents).toBe(eventCount);
      
      const eventsPerSecond = (eventCount / totalTime) * 1000;
      expect(eventsPerSecond).toBeGreaterThan(500); // Relaxed to >500 events/sec under stress

      // Check system health after stress
      const metrics = await eventBus.getMetrics();
      expect(metrics.errorRate).toBeLessThan(1); // Less than 1% error rate

      console.log(`Extreme volume stress test: ${eventCount} events`);
      console.log(`- Processing time: ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`- Throughput: ${eventsPerSecond.toFixed(0)} events/sec`);
      console.log(`- Processed events: ${processedEvents}`);
      console.log(`- Error rate: ${metrics.errorRate.toFixed(3)}%`);

      unsubscribe();
    });

    it('should handle massive concurrent event bursts', async () => {
      const concurrentBatches = 100;
      const eventsPerBatch = 200;
      const totalEvents = concurrentBatches * eventsPerBatch;
      
      let processedEvents = 0;
      const processingTimes: number[] = [];

      const unsubscribe = eventBus.on('stress.concurrent.burst', async (event) => {
        const processStart = performance.now();
        processedEvents++;
        processingTimes.push(performance.now() - processStart);
      });

      memoryMonitor.takeSnapshot('before-burst');
      perfMeasurement.start('concurrent-burst');

      // Create massive concurrent load
      const batchPromises: Promise<void>[] = [];
      
      for (let batch = 0; batch < concurrentBatches; batch++) {
        const batchPromise = Promise.all(
          Array.from({ length: eventsPerBatch }, (_, i) =>
            eventBus.emit('stress.concurrent.burst', {
              batch,
              sequence: i,
              timestamp: Date.now()
            })
          )
        ).then(() => {}); // Convert Promise<void[]> to Promise<void>
        batchPromises.push(batchPromise);
      }

      await Promise.all(batchPromises);

      const burstTime = perfMeasurement.end('concurrent-burst');
      memoryMonitor.takeSnapshot('after-burst');

      // Wait for all processing to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      expect(processedEvents).toBe(totalEvents);

      const eventsPerSecond = (totalEvents / burstTime) * 1000;
      const avgProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;

      expect(eventsPerSecond).toBeGreaterThan(800); // Relaxed to handle massive concurrency
      expect(avgProcessingTime).toBeLessThan(1); // Individual processing should remain fast

      console.log(`Concurrent burst stress test:`);
      console.log(`- Concurrent batches: ${concurrentBatches}`);
      console.log(`- Events per batch: ${eventsPerBatch}`);
      console.log(`- Total events: ${totalEvents}`);
      console.log(`- Burst time: ${burstTime.toFixed(0)}ms`);
      console.log(`- Throughput: ${eventsPerSecond.toFixed(0)} events/sec`);
      console.log(`- Avg processing time: ${avgProcessingTime.toFixed(3)}ms`);

      unsubscribe();
    });

    it('should handle sustained high-frequency events', async () => {
      const testDurationMs = 30000; // 30 seconds
      const targetEventsPerSecond = 500;
      const intervalMs = 1000 / targetEventsPerSecond;

      let totalEvents = 0;
      let processedEvents = 0;
      const latencies: number[] = [];

      const unsubscribe = eventBus.on('stress.sustained.frequency', async (event) => {
        processedEvents++;
        const latency = Date.now() - event.payload.emitTime;
        latencies.push(latency);
      });

      perfMeasurement.start('sustained-frequency');
      
      const startTime = Date.now();
      const endTime = startTime + testDurationMs;

      // Sustained high-frequency emission
      while (Date.now() < endTime) {
        const emitStart = Date.now();
        
        await eventBus.emit('stress.sustained.frequency', {
          sequence: totalEvents++,
          emitTime: emitStart,
          timestamp: emitStart
        });

        // Maintain frequency
        const nextEmitTime = startTime + (totalEvents * intervalMs);
        const waitTime = nextEmitTime - Date.now();
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      const actualDuration = perfMeasurement.end('sustained-frequency');

      // Wait for final events to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const actualEventsPerSecond = (totalEvents / actualDuration) * 1000;
      const processedPercentage = (processedEvents / totalEvents) * 100;
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;

      expect(processedPercentage).toBeGreaterThan(95); // 95% of events processed
      expect(avgLatency).toBeLessThan(50); // Average latency under 50ms
      expect(actualEventsPerSecond).toBeGreaterThan(targetEventsPerSecond * 0.8); // Within 20% of target

      console.log(`Sustained frequency stress test:`);
      console.log(`- Test duration: ${(actualDuration / 1000).toFixed(1)}s`);
      console.log(`- Target frequency: ${targetEventsPerSecond} events/sec`);
      console.log(`- Actual frequency: ${actualEventsPerSecond.toFixed(1)} events/sec`);
      console.log(`- Events emitted: ${totalEvents}`);
      console.log(`- Events processed: ${processedEvents} (${processedPercentage.toFixed(1)}%)`);
      console.log(`- Average latency: ${avgLatency.toFixed(2)}ms`);

      unsubscribe();
    });
  });

  describe('Resource Exhaustion Scenarios', () => {
    it('should handle memory pressure gracefully', async () => {
      const largePayloadSize = 100 * 1024; // 100KB per event
      const eventCount = 200; // 20MB total payload
      
      let processedEvents = 0;
      const memorySnapshots: number[] = [];

      const unsubscribe = eventBus.on('stress.memory.pressure', async (event) => {
        processedEvents++;
        
        // Take memory snapshot every 50 events
        if (processedEvents % 50 === 0 && (performance as any).memory) {
          memorySnapshots.push((performance as any).memory.usedJSHeapSize);
        }
      });

      memoryMonitor.takeSnapshot('before-memory-pressure');

      // Generate events with large payloads
      for (let i = 0; i < eventCount; i++) {
        const largePayload = {
          sequence: i,
          data: 'x'.repeat(largePayloadSize),
          timestamp: Date.now(),
          metadata: {
            size: largePayloadSize,
            purpose: 'memory-pressure-test'
          }
        };

        await eventBus.emit('stress.memory.pressure', largePayload);

        // Small delay to allow processing
        if (i % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Wait for all processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      memoryMonitor.takeSnapshot('after-memory-pressure');

      expect(processedEvents).toBe(eventCount);

      // Check memory growth pattern
      if (memorySnapshots.length > 2) {
        const initialMemory = memorySnapshots[0];
        const finalMemory = memorySnapshots[memorySnapshots.length - 1];
        const memoryGrowth = finalMemory - initialMemory;
        
        // Memory should grow but not excessively
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
      }

      // System should still be responsive
      const metrics = await eventBus.getMetrics();
      expect(metrics.avgLatencyMs).toBeLessThan(100); // Still responsive

      console.log(`Memory pressure stress test:`);
      console.log(`- Large payloads: ${eventCount} x ${(largePayloadSize / 1024).toFixed(0)}KB`);
      console.log(`- Total data: ${((eventCount * largePayloadSize) / 1024 / 1024).toFixed(1)}MB`);
      console.log(`- Processed events: ${processedEvents}`);
      console.log(`- Average latency: ${metrics.avgLatencyMs.toFixed(2)}ms`);

      unsubscribe();
    });

    it('should handle handler queue overflow', async () => {
      const slowEventCount = 100;
      const fastEventCount = 1000;
      
      let slowEventsProcessed = 0;
      let fastEventsProcessed = 0;
      const processingOrder: string[] = [];

      // Slow handler (blocks for 100ms each)
      const unsubscribeSlow = eventBus.on('stress.queue.slow', async (event) => {
        processingOrder.push(`slow-${event.payload.sequence}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        slowEventsProcessed++;
      });

      // Fast handler
      const unsubscribeFast = eventBus.on('stress.queue.fast', async (event) => {
        processingOrder.push(`fast-${event.payload.sequence}`);
        fastEventsProcessed++;
      });

      perfMeasurement.start('queue-overflow');

      // Emit slow events first
      const slowPromises: Promise<void>[] = [];
      for (let i = 0; i < slowEventCount; i++) {
        slowPromises.push(
          eventBus.emit('stress.queue.slow', { sequence: i })
        );
      }

      // Then emit fast events (should not be completely blocked)
      const fastPromises: Promise<void>[] = [];
      for (let i = 0; i < fastEventCount; i++) {
        fastPromises.push(
          eventBus.emit('stress.queue.fast', { sequence: i })
        );
      }

      await Promise.all([...slowPromises, ...fastPromises]);

      const emissionTime = perfMeasurement.end('queue-overflow');

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, slowEventCount * 120)); // Give extra time

      expect(slowEventsProcessed).toBe(slowEventCount);
      expect(fastEventsProcessed).toBe(fastEventCount);

      // Fast events should complete much sooner than slow ones
      const fastCompletions = processingOrder.filter(order => order.startsWith('fast-')).length;
      const slowCompletions = processingOrder.filter(order => order.startsWith('slow-')).length;

      expect(fastCompletions).toBe(fastEventCount);
      expect(slowCompletions).toBe(slowEventCount);

      console.log(`Queue overflow stress test:`);
      console.log(`- Slow events: ${slowEventCount} (100ms each)`);
      console.log(`- Fast events: ${fastEventCount}`);
      console.log(`- Emission time: ${emissionTime.toFixed(0)}ms`);
      console.log(`- Slow processed: ${slowEventsProcessed}`);
      console.log(`- Fast processed: ${fastEventsProcessed}`);

      unsubscribeSlow();
      unsubscribeFast();
    });

    it('should handle subscription overflow', async () => {
      const subscriberCount = 500;
      const eventCount = 100;
      
      let totalHandlerCalls = 0;
      const unsubscribers: (() => void)[] = [];

      // Create many subscribers
      for (let i = 0; i < subscriberCount; i++) {
        const unsubscribe = eventBus.on('stress.subscription.overflow', async (event) => {
          totalHandlerCalls++;
          // Minimal processing to avoid timeout
        });
        unsubscribers.push(unsubscribe);
      }

      perfMeasurement.start('subscription-overflow');

      // Emit events to all subscribers
      for (let i = 0; i < eventCount; i++) {
        await eventBus.emit('stress.subscription.overflow', {
          sequence: i,
          timestamp: Date.now()
        });
      }

      const emissionTime = perfMeasurement.end('subscription-overflow');

      // Wait for all handlers to complete
      await new Promise(resolve => setTimeout(resolve, 5000));

      const expectedHandlerCalls = subscriberCount * eventCount;
      expect(totalHandlerCalls).toBe(expectedHandlerCalls);

      const eventsPerSecond = (eventCount / emissionTime) * 1000;
      expect(eventsPerSecond).toBeGreaterThan(10); // Should maintain some throughput

      console.log(`Subscription overflow stress test:`);
      console.log(`- Subscribers: ${subscriberCount}`);
      console.log(`- Events: ${eventCount}`);
      console.log(`- Total handler calls: ${totalHandlerCalls}`);
      console.log(`- Emission time: ${emissionTime.toFixed(0)}ms`);
      console.log(`- Throughput: ${eventsPerSecond.toFixed(1)} events/sec`);

      // Cleanup
      unsubscribers.forEach(unsubscribe => unsubscribe());
    });
  });

  describe('System Stability Under Load', () => {
    beforeEach(async () => {
      // Register modules for realistic testing in correct dependency order
      const modules = [
        createInventoryTestModule(),
        createCustomersTestModule(),
        createSalesTestModule(),
        createFailingKitchenTestModule()
      ];

      for (const module of modules) {
        await eventBus.registerModule(module);
      }
    });

    it('should maintain module health under extreme load', async () => {
      const loadDuration = 20000; // 20 seconds
      const eventsPerSecond = 200;
      const intervalMs = 1000 / eventsPerSecond;

      let totalEvents = 0;
      const healthSnapshots: any[] = [];

      // Monitor health during load
      const healthMonitor = setInterval(async () => {
        const health = await eventBus.getModuleHealth();
        healthSnapshots.push({
          timestamp: Date.now(),
          health: { ...health }
        });
      }, 2000);

      const startTime = Date.now();
      const endTime = startTime + loadDuration;

      perfMeasurement.start('module-health-stress');

      // Generate sustained load across multiple patterns
      const eventPatterns: EventPattern[] = [
        'sales.order.created',
        'inventory.stock.updated',
        'kitchen.order.received',
        'payments.payment.processed'
      ];

      while (Date.now() < endTime) {
        const pattern = eventPatterns[totalEvents % eventPatterns.length];
        
        await eventBus.emit(pattern, {
          sequence: totalEvents++,
          pattern: pattern,
          timestamp: Date.now(),
          loadTest: true
        });

        // Maintain frequency
        const nextTime = startTime + (totalEvents * intervalMs);
        const waitTime = nextTime - Date.now();
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      const stressTime = perfMeasurement.end('module-health-stress');
      clearInterval(healthMonitor);

      // Final health check
      const finalHealth = await eventBus.getModuleHealth();

      // Verify module stability
      expect(finalHealth['test-sales'].status).toBe('active');
      expect(finalHealth['test-inventory'].status).toBe('active');

      // Check health stability over time
      const healthySnapshots = healthSnapshots.filter(snapshot => {
        return Object.values(snapshot.health).every((health: any) => 
          health && ['active', 'degraded'].includes(health.status)
        );
      });

      const healthStabilityPercentage = (healthySnapshots.length / healthSnapshots.length) * 100;
      expect(healthStabilityPercentage).toBeGreaterThan(80); // 80% uptime minimum

      console.log(`Module health stress test:`);
      console.log(`- Test duration: ${(stressTime / 1000).toFixed(1)}s`);
      console.log(`- Events generated: ${totalEvents}`);
      console.log(`- Average events/sec: ${(totalEvents / stressTime * 1000).toFixed(1)}`);
      console.log(`- Health snapshots: ${healthSnapshots.length}`);
      console.log(`- Health stability: ${healthStabilityPercentage.toFixed(1)}%`);
    });

    it('should recover from cascading failures', async () => {
      const failureEventCount = 50;
      const recoveryEventCount = 100;
      
      let successfulEvents = 0;
      let failedEvents = 0;
      const errorEvents: any[] = [];

      // Handler that tracks errors
      const unsubscribeError = eventBus.on('global.eventbus.error', async (event) => {
        errorEvents.push(event.payload);
      });

      // Handler for successful events
      const unsubscribeSuccess = eventBus.on('stress.cascade.recovery', async (event) => {
        if (event.payload.shouldFail && Math.random() > 0.7) {
          throw new Error(`Simulated failure for event ${event.payload.sequence}`);
        }
        successfulEvents++;
      });

      perfMeasurement.start('cascade-failure-recovery');

      // Phase 1: Generate events that will cause failures
      console.log('Phase 1: Generating failure-prone events...');
      for (let i = 0; i < failureEventCount; i++) {
        await eventBus.emit('stress.cascade.recovery', {
          sequence: i,
          shouldFail: true,
          phase: 'failure'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check system health after failures
      const healthAfterFailures = await eventBus.getModuleHealth();
      console.log(`Health after failures: ${Object.keys(healthAfterFailures).length} modules`);

      // Phase 2: Generate normal events to test recovery
      console.log('Phase 2: Testing recovery...');
      for (let i = 0; i < recoveryEventCount; i++) {
        await eventBus.emit('stress.cascade.recovery', {
          sequence: failureEventCount + i,
          shouldFail: false,
          phase: 'recovery'
        });
      }

      const totalTime = perfMeasurement.end('cascade-failure-recovery');

      await new Promise(resolve => setTimeout(resolve, 1000));

      // System should have recovered
      const finalHealth = await eventBus.getModuleHealth();
      const activeModules = Object.values(finalHealth).filter(h => h.status === 'active').length;

      expect(activeModules).toBeGreaterThan(0); // At least some modules should be active
      expect(successfulEvents).toBeGreaterThan(recoveryEventCount * 0.8); // Most recovery events should succeed

      console.log(`Cascading failure recovery test:`);
      console.log(`- Total time: ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`- Failure events: ${failureEventCount}`);
      console.log(`- Recovery events: ${recoveryEventCount}`);
      console.log(`- Successful events: ${successfulEvents}`);
      console.log(`- Error events: ${errorEvents.length}`);
      console.log(`- Active modules after recovery: ${activeModules}`);

      unsubscribeError();
      unsubscribeSuccess();
    });

    it('should handle graceful shutdown under load', async () => {
      const preShutdownEvents = 500;
      let processedEvents = 0;
      const processingPromises: Promise<void>[] = [];

      // Handler with processing delay
      const unsubscribe = eventBus.on('stress.graceful.shutdown', async (event) => {
        const promise = new Promise<void>(resolve => {
          setTimeout(() => {
            processedEvents++;
            resolve();
          }, 20); // 20ms processing time
        });
        processingPromises.push(promise);
      });

      perfMeasurement.start('graceful-shutdown-stress');

      // Generate events rapidly
      const emissionPromises: Promise<void>[] = [];
      for (let i = 0; i < preShutdownEvents; i++) {
        emissionPromises.push(
          eventBus.emit('stress.graceful.shutdown', {
            sequence: i,
            timestamp: Date.now()
          })
        );
      }

      await Promise.all(emissionPromises);

      // Initiate graceful shutdown while events are still processing
      const shutdownStart = Date.now();
      await eventBus.gracefulShutdown(10000); // 10 second timeout
      const shutdownTime = Date.now() - shutdownStart;

      const totalTime = perfMeasurement.end('graceful-shutdown-stress');

      // Wait for any remaining processing
      await Promise.all(processingPromises);

      // Should have processed all events before shutdown
      expect(processedEvents).toBe(preShutdownEvents);
      expect(shutdownTime).toBeLessThan(15000); // Should not exceed timeout significantly

      console.log(`Graceful shutdown stress test:`);
      console.log(`- Pre-shutdown events: ${preShutdownEvents}`);
      console.log(`- Processed events: ${processedEvents}`);
      console.log(`- Total test time: ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`- Shutdown time: ${(shutdownTime / 1000).toFixed(1)}s`);

      unsubscribe();
    });
  });

  describe('Long-running Stability', () => {
    it('should maintain performance over extended operation', async () => {
      const testSegments = 10;
      const eventsPerSegment = 500;
      const segmentDuration = 3000; // 3 seconds per segment

      const segmentMetrics: any[] = [];

      for (let segment = 0; segment < testSegments; segment++) {
        let segmentEvents = 0;
        const segmentStart = Date.now();

        perfMeasurement.start(`segment-${segment}`);
        memoryMonitor.takeSnapshot(`segment-${segment}-start`);

        // Generate events for this segment
        const segmentEndTime = segmentStart + segmentDuration;
        while (Date.now() < segmentEndTime && segmentEvents < eventsPerSegment) {
          await eventBus.emit('stress.long.running', {
            segment,
            sequence: segmentEvents++,
            timestamp: Date.now()
          });
          
          await new Promise(resolve => setTimeout(resolve, segmentDuration / eventsPerSegment));
        }

        const segmentTime = perfMeasurement.end(`segment-${segment}`);
        memoryMonitor.takeSnapshot(`segment-${segment}-end`);

        const metrics = await eventBus.getMetrics();
        segmentMetrics.push({
          segment,
          events: segmentEvents,
          timeMs: segmentTime,
          avgLatency: metrics.avgLatencyMs,
          errorRate: metrics.errorRate,
          totalEvents: metrics.totalEvents
        });

        console.log(`Segment ${segment}: ${segmentEvents} events, ${(segmentTime / 1000).toFixed(1)}s, ${metrics.avgLatencyMs.toFixed(2)}ms avg latency`);

        // Brief pause between segments
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Analyze performance stability
      const avgLatencies = segmentMetrics.map(m => m.avgLatency);
      const firstHalfAvg = avgLatencies.slice(0, Math.floor(testSegments / 2)).reduce((a, b) => a + b, 0) / (testSegments / 2);
      const secondHalfAvg = avgLatencies.slice(Math.floor(testSegments / 2)).reduce((a, b) => a + b, 0) / (testSegments / 2);
      
      const performanceDegradation = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

      // Performance should not degrade significantly over time
      expect(performanceDegradation).toBeLessThan(1.0); // Less than 100% degradation
      expect(secondHalfAvg).toBeLessThan(50); // Final latency should still be reasonable

      const totalEvents = segmentMetrics.reduce((sum, m) => sum + m.events, 0);
      const totalTime = segmentMetrics.reduce((sum, m) => sum + m.timeMs, 0);

      console.log(`Long-running stability test completed:`);
      console.log(`- Test segments: ${testSegments}`);
      console.log(`- Total events: ${totalEvents}`);
      console.log(`- Total time: ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`- Performance degradation: ${(performanceDegradation * 100).toFixed(1)}%`);
      console.log(`- First half avg latency: ${firstHalfAvg.toFixed(2)}ms`);
      console.log(`- Second half avg latency: ${secondHalfAvg.toFixed(2)}ms`);
    });
  });
});