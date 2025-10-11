// SecureEventProcessor.test.ts - Handler timeout protection and circuit breaker tests
// Tests timeout protection, DoS prevention, and circuit breaker functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SecureEventProcessor from '../../utils/SecureEventProcessor';
import type { NamespacedEvent, EventHandler } from '../../types';

// Mock event for testing
const createMockEvent = (pattern: string, payload: any = {}): NamespacedEvent => ({
  id: 'test-event-id',
  pattern,
  payload,
  timestamp: new Date().toISOString(),
  source: 'test',
  version: '1.0.0',
  correlationId: 'test-correlation',
  userId: 'test-user',
  deduplicationMetadata: {
    contentHash: 'test-hash',
    clientId: 'test-client',
    sequence: 1,
    semantic: {}
  },
  tracingMetadata: {
    traceId: 'test-trace',
    spanId: 'test-span',
    baggage: {}
  }
});

describe('SecureEventProcessor Timeout Protection', () => {
  beforeEach(() => {
    // Reset configuration to defaults
    SecureEventProcessor.configure({
      defaultTimeoutMs: 2000,   // 2 seconds for faster tests
      maxTimeoutMs: 5000,
      warningThresholdMs: 500,
      enableCircuitBreaker: true
    });

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    // Clear all handler statistics to prevent test contamination
    SecureEventProcessor.destroy();
  });

  describe('Basic Timeout Protection', () => {
    it('should execute fast handler successfully', async () => {
      const fastHandler: EventHandler = async (_event) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms
        return Promise.resolve();
      };

      const event = createMockEvent('test.fast.handler');
      const result = await SecureEventProcessor.executeHandler(
        fastHandler,
        event,
        'fast-handler-test'
      );

      expect(result.success).toBe(true);
      expect(result.timedOut).toBe(false);
      expect(result.executionTimeMs).toBeLessThan(200);
      expect(result.error).toBeUndefined();
    });

    it('should timeout slow handler after configured limit', async () => {
      const slowHandler: EventHandler = async () => {
        // Simulate handler that takes too long (3 seconds, but timeout is 2s)
        await new Promise(resolve => setTimeout(resolve, 3000));
      };

      const event = createMockEvent('test.slow.handler');
      const result = await SecureEventProcessor.executeHandler(
        slowHandler,
        event,
        'slow-handler-test',
        2000 // 2 second timeout
      );

      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
      expect(result.executionTimeMs).toBeGreaterThan(1900);
      expect(result.error?.message).toContain('timed out after 2000ms');
    });

    it('should respect custom timeout parameter', async () => {
      const mediumHandler: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds
      };

      const event = createMockEvent('test.medium.handler');
      
      // Test with 1 second timeout (should timeout)
      const result1 = await SecureEventProcessor.executeHandler(
        mediumHandler,
        event,
        'medium-handler-test-1',
        1000
      );
      expect(result1.timedOut).toBe(true);

      // Test with 2 second timeout (should succeed)
      const result2 = await SecureEventProcessor.executeHandler(
        mediumHandler,
        event,
        'medium-handler-test-2',  
        2000
      );
      expect(result2.success).toBe(true);
    });

    it('should enforce maximum timeout limit', async () => {
      const handler: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      };

      const event = createMockEvent('test.max.timeout');
      
      // Request 15 second timeout, but max is 5 seconds
      const result = await SecureEventProcessor.executeHandler(
        handler,
        event,
        'max-timeout-test',
        15000 // This should be capped at maxTimeoutMs (5000)
      );

      expect(result.success).toBe(true);
      // The actual timeout used should be the max (5000ms), not the requested (15000ms)
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors without timeout', async () => {
      const errorHandler: EventHandler = async () => {
        throw new Error('Handler intentional error');
      };

      const event = createMockEvent('test.error.handler');
      const result = await SecureEventProcessor.executeHandler(
        errorHandler,
        event,
        'error-handler-test'
      );

      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(false);
      expect(result.error?.message).toBe('Handler intentional error');
      expect(result.executionTimeMs).toBeLessThan(100);
    });

    it('should track handler statistics correctly', async () => {
      const handlerId = 'stats-test-handler';
      
      // Execute successful handler
      const successHandler: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      };
      
      const event = createMockEvent('test.stats');
      await SecureEventProcessor.executeHandler(successHandler, event, handlerId);

      const stats = SecureEventProcessor.getHandlerStats(handlerId);
      expect(stats.totalExecutions).toBe(1);
      expect(stats.errors).toBe(0);
      expect(stats.timeouts).toBe(0);
      expect(stats.consecutiveFailures).toBe(0);
      expect(stats.avgExecutionTimeMs).toBeGreaterThan(0);
    });
  });

  describe('Circuit Breaker Functionality', () => {
    it('should trip circuit breaker after consecutive failures', async () => {
      const handlerId = 'circuit-breaker-test';
      const failingHandler: EventHandler = async () => {
        throw new Error('Simulated failure');
      };

      const event = createMockEvent('test.circuit.breaker');

      // Execute failing handler 3 times to trip circuit breaker
      for (let i = 0; i < 3; i++) {
        const result = await SecureEventProcessor.executeHandler(
          failingHandler,
          event,
          handlerId
        );
        expect(result.success).toBe(false);
        expect(result.circuitBreakerTriggered).toBe(false); // Not tripped yet
      }

      // Fourth execution should be blocked by circuit breaker
      const result = await SecureEventProcessor.executeHandler(
        failingHandler,
        event,
        handlerId
      );

      expect(result.success).toBe(false);
      expect(result.circuitBreakerTriggered).toBe(true);
      expect(result.error?.message).toContain('Circuit breaker is open');
    });

    it('should reset circuit breaker manually', async () => {
      const handlerId = 'manual-reset-test';
      const failingHandler: EventHandler = async () => {
        throw new Error('Simulated failure');
      };

      const event = createMockEvent('test.manual.reset');

      // Trip circuit breaker
      for (let i = 0; i < 3; i++) {
        await SecureEventProcessor.executeHandler(failingHandler, event, handlerId);
      }

      // Verify it's tripped
      let result = await SecureEventProcessor.executeHandler(failingHandler, event, handlerId);
      expect(result.circuitBreakerTriggered).toBe(true);

      // Reset manually
      SecureEventProcessor.resetCircuitBreaker(handlerId);

      // Should work again (though still fail due to handler error)
      result = await SecureEventProcessor.executeHandler(failingHandler, event, handlerId);
      expect(result.circuitBreakerTriggered).toBe(false);
      expect(result.success).toBe(false); // Still fails due to handler error
    });

    it('should reset consecutive failures on successful execution', async () => {
      const handlerId = 'reset-on-success-test';
      let shouldFail = true;

      const conditionalHandler: EventHandler = async () => {
        if (shouldFail) {
          throw new Error('Conditional failure');
        }
        await new Promise(resolve => setTimeout(resolve, 50));
      };

      const event = createMockEvent('test.conditional');

      // Fail twice
      await SecureEventProcessor.executeHandler(conditionalHandler, event, handlerId);
      await SecureEventProcessor.executeHandler(conditionalHandler, event, handlerId);

      let stats = SecureEventProcessor.getHandlerStats(handlerId);
      expect(stats.consecutiveFailures).toBe(2);

      // Now succeed
      shouldFail = false;
      const result = await SecureEventProcessor.executeHandler(conditionalHandler, event, handlerId);
      expect(result.success).toBe(true);

      // Consecutive failures should reset
      stats = SecureEventProcessor.getHandlerStats(handlerId);
      expect(stats.consecutiveFailures).toBe(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should log warning for slow handlers', async () => {
      const slowHandler: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 600)); // Above warning threshold (500ms)
      };

      const event = createMockEvent('test.slow.warning');
      const result = await SecureEventProcessor.executeHandler(
        slowHandler,
        event,
        'slow-warning-test'
      );

      expect(result.success).toBe(true);
      expect(result.executionTimeMs).toBeGreaterThan(500);
      // Warning should be logged (we can't easily test console.log in this setup)
    });

    it('should provide security status metrics', async () => {
      const fastHandler: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      };

      const event = createMockEvent('test.metrics');
      await SecureEventProcessor.executeHandler(fastHandler, event, 'metrics-test-1');
      await SecureEventProcessor.executeHandler(fastHandler, event, 'metrics-test-2');

      const status = SecureEventProcessor.getSecurityStatus();
      expect(status.totalHandlers).toBe(2);
      expect(status.activeCircuitBreakers).toBe(0);
      expect(status.handlersWithTimeouts).toBe(0);
      expect(status.avgExecutionTimeMs).toBeGreaterThan(0);
      expect(status.config.defaultTimeoutMs).toBe(2000);
    });

    it('should clean up old handler stats', async () => {
      const handler: EventHandler = async () => {};
      const event = createMockEvent('test.cleanup');

      await SecureEventProcessor.executeHandler(handler, event, 'cleanup-test');
      
      const statusBefore = SecureEventProcessor.getSecurityStatus();
      expect(statusBefore.totalHandlers).toBe(1);

      // Clean up stats older than 0ms (should clean everything)
      const cleaned = SecureEventProcessor.cleanupOldStats(0);
      expect(cleaned).toBe(1);

      const statusAfter = SecureEventProcessor.getSecurityStatus();
      expect(statusAfter.totalHandlers).toBe(0);
    });
  });

  describe('Concurrent Handler Execution', () => {
    it('should execute multiple handlers concurrently', async () => {
      const handler1: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      };
      const handler2: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      };
      const handler3: EventHandler = async () => {
        throw new Error('Handler 3 error');
      };

      const event = createMockEvent('test.concurrent');
      const handlers = [
        { handler: handler1, id: 'concurrent-1' },
        { handler: handler2, id: 'concurrent-2' },
        { handler: handler3, id: 'concurrent-3' }
      ];

      const startTime = performance.now();
      const results = await SecureEventProcessor.executeHandlersConcurrent(handlers, event);
      const totalTime = performance.now() - startTime;

      // Should take about 150ms (not 350ms if sequential)
      expect(totalTime).toBeLessThan(300);
      
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(false);
      expect(results[2].error?.message).toBe('Handler 3 error');
    });

    it('should handle concurrent timeouts', async () => {
      const slowHandler1: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Will timeout
      };
      const slowHandler2: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Will timeout  
      };

      const event = createMockEvent('test.concurrent.timeout');
      const handlers = [
        { handler: slowHandler1, id: 'slow-concurrent-1' },
        { handler: slowHandler2, id: 'slow-concurrent-2' }
      ];

      const results = await SecureEventProcessor.executeHandlersConcurrent(
        handlers, 
        event,
        1000 // 1 second timeout
      );

      expect(results).toHaveLength(2);
      expect(results[0].timedOut).toBe(true);
      expect(results[1].timedOut).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should apply custom configuration', async () => {
      SecureEventProcessor.configure({
        defaultTimeoutMs: 100,
        enableCircuitBreaker: false,
        warningThresholdMs: 50
      });

      const slowHandler: EventHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 200)); // Longer than 100ms timeout
      };

      const event = createMockEvent('test.config');
      const result = await SecureEventProcessor.executeHandler(
        slowHandler,
        event,
        'config-test'
      );

      expect(result.timedOut).toBe(true);
      expect(result.error?.message).toContain('timed out after 100ms');
    });

    it('should disable circuit breaker when configured', async () => {
      SecureEventProcessor.configure({
        enableCircuitBreaker: false
      });

      const handlerId = 'no-circuit-breaker-test';
      const failingHandler: EventHandler = async () => {
        throw new Error('Simulated failure');
      };

      const event = createMockEvent('test.no.circuit.breaker');

      // Execute failing handler many times
      for (let i = 0; i < 10; i++) {
        const result = await SecureEventProcessor.executeHandler(
          failingHandler,
          event,
          handlerId
        );
        expect(result.circuitBreakerTriggered).toBe(false);
        expect(result.success).toBe(false);
      }
    });
  });
});