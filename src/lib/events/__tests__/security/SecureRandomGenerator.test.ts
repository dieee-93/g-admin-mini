// SecureRandomGenerator.test.ts - Tests for cryptographically secure random generation
// Validates entropy quality, uniqueness, and security compliance

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import SecureRandomGenerator from '../../utils/SecureRandomGenerator';

describe('SecureRandomGenerator Security Tests', () => {
  let generator: SecureRandomGenerator;
  
  beforeEach(() => {
    generator = SecureRandomGenerator.getInstance();
  });

  afterEach(() => {
    generator.destroy();
  });

  describe('Cryptographic Security', () => {
    it('should refuse to initialize without crypto support', () => {
      // Mock crypto methods to throw errors
      const originalGetRandomValues = crypto.getRandomValues;
      const originalRandomUUID = crypto.randomUUID;
      
      // Mock methods to throw errors
      crypto.getRandomValues = () => {
        throw new Error('Crypto not available');
      };
      crypto.randomUUID = () => {
        throw new Error('UUID not available');
      };
      
      expect(() => {
        new SecureRandomGenerator();
      }).toThrow('SECURITY: Cryptographically secure random generation unavailable');
      
      // Restore original methods
      crypto.getRandomValues = originalGetRandomValues;
      crypto.randomUUID = originalRandomUUID;
    });

    it('should never use Math.random() fallbacks', () => {
      // Mock Math.random to detect if it's called
      const originalMathRandom = Math.random;
      let mathRandomCalled = false;
      Math.random = () => {
        mathRandomCalled = true;
        return 0.5;
      };
      
      // Generate multiple IDs
      for (let i = 0; i < 100; i++) {
        generator.generateEventId();
        generator.generateSubscriptionId();
        generator.generateTraceId();
        generator.generateSpanId();
      }
      
      expect(mathRandomCalled).toBe(false);
      Math.random = originalMathRandom;
    });

    it('should generate cryptographically secure UUIDs', () => {
      const uuids = new Set<string>();
      
      for (let i = 0; i < 1000; i++) {
        const eventId = generator.generateEventId();
        const traceId = generator.generateTraceId();
        
        // Extract UUID parts from IDs
        const eventUuid = eventId.split('_')[2];
        const traceUuid = traceId.split('_')[2];
        
        // Validate UUID format
        expect(eventUuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(traceUuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        
        uuids.add(eventUuid);
        uuids.add(traceUuid);
      }
      
      // All UUIDs should be unique
      expect(uuids.size).toBe(2000);
    });
  });

  describe('ID Generation Patterns', () => {
    it('should generate unique event IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const id = generator.generateEventId();
        expect(id).toMatch(/^evt_\d+_[0-9a-f-]+$/);
        ids.add(id);
      }
      
      expect(ids.size).toBe(10000);
    });

    it('should generate unique subscription IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const id = generator.generateSubscriptionId();
        expect(id).toMatch(/^sub_\d+_[0-9a-z]+$/);
        ids.add(id);
      }
      
      expect(ids.size).toBe(10000);
    });

    it('should generate unique trace IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const id = generator.generateTraceId();
        expect(id).toMatch(/^trace_\d+_[0-9a-f-]+$/);
        ids.add(id);
      }
      
      expect(ids.size).toBe(10000);
    });

    it('should generate unique span IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const id = generator.generateSpanId();
        expect(id).toMatch(/^span_[0-9a-z]+$/);
        ids.add(id);
      }
      
      expect(ids.size).toBe(10000);
    });

    it('should generate unique test IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const id = generator.generateTestId();
        expect(id).toMatch(/^test_\d+_[0-9a-z]+$/);
        ids.add(id);
      }
      
      expect(ids.size).toBe(10000);
    });

    it('should generate unique transaction IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const id = generator.generateTransactionId();
        expect(id).toMatch(/^TXN-[0-9A-Z]+$/);
        ids.add(id);
      }
      
      expect(ids.size).toBe(10000);
    });
  });

  describe('Secure Number Generation', () => {
    it('should generate secure integers within range', () => {
      const results = new Set<number>();
      const min = 10;
      const max = 50;
      
      for (let i = 0; i < 10000; i++) {
        const num = generator.generateSecureInteger(min, max);
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
        expect(Number.isInteger(num)).toBe(true);
        results.add(num);
      }
      
      // Should use most of the range
      expect(results.size).toBeGreaterThan(30);
    });

    it('should generate secure floats between 0 and 1', () => {
      for (let i = 0; i < 10000; i++) {
        const num = generator.generateSecureFloat();
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThan(1);
        expect(typeof num).toBe('number');
      }
    });

    it('should generate secure booleans with fair distribution', () => {
      let trueCount = 0;
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        if (generator.generateSecureBoolean()) {
          trueCount++;
        }
      }
      
      const ratio = trueCount / iterations;
      // Should be roughly 50/50 with some tolerance
      expect(ratio).toBeGreaterThan(0.45);
      expect(ratio).toBeLessThan(0.55);
    });
  });

  describe('Entropy Quality Tests', () => {
    it('should pass entropy quality tests', () => {
      const results = generator.testEntropy(10000);
      
      console.log('Entropy Test Results:', results);
      
      expect(results.quality).toMatch(/excellent|good/);
      expect(results.entropy).toBeGreaterThan(0.6);
      expect(results.uniformity).toBeGreaterThan(0.5);
      expect(results.predictability).toBeLessThan(0.4);
    });

    it('should maintain consistent entropy across multiple tests', () => {
      const tests = [];
      
      for (let i = 0; i < 5; i++) {
        tests.push(generator.testEntropy(1000));
      }
      
      // All tests should pass quality checks
      tests.forEach(test => {
        expect(test.quality).toMatch(/excellent|good/);
        expect(test.entropy).toBeGreaterThan(0.6);
      });
      
      // Results should be reasonably consistent
      const entropies = tests.map(t => t.entropy);
      const avgEntropy = entropies.reduce((a, b) => a + b) / entropies.length;
      const variance = entropies.reduce((acc, val) => acc + Math.pow(val - avgEntropy, 2), 0) / entropies.length;
      
      expect(variance).toBeLessThan(0.01); // Low variance indicates consistency
    });
  });

  describe('Performance and Security Balance', () => {
    it('should generate IDs quickly while maintaining security', () => {
      const start = performance.now();
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        generator.generateEventId();
        generator.generateSubscriptionId();
        generator.generateTraceId();
        generator.generateSpanId();
      }
      
      const elapsed = performance.now() - start;
      const avgTimePerGeneration = elapsed / (iterations * 4);
      
      console.log(`Average time per ID generation: ${avgTimePerGeneration.toFixed(3)}ms`);
      
      // Should be fast enough for production use
      expect(avgTimePerGeneration).toBeLessThan(1); // <1ms per ID
    });

    it('should handle concurrent generation without collisions', async () => {
      const concurrency = 10;
      const iterationsPerThread = 1000;
      const allIds = new Set<string>();
      
      const promises = Array.from({ length: concurrency }, async () => {
        const threadIds: string[] = [];
        for (let i = 0; i < iterationsPerThread; i++) {
          threadIds.push(generator.generateEventId());
        }
        return threadIds;
      });
      
      const results = await Promise.all(promises);
      const flatResults = results.flat();
      
      // Add all IDs to set to check for uniqueness
      flatResults.forEach(id => allIds.add(id));
      
      expect(allIds.size).toBe(concurrency * iterationsPerThread);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid integer range parameters', () => {
      expect(() => {
        generator.generateSecureInteger(10, 5); // min > max
      }).toThrow('Min must be less than max');
      
      expect(() => {
        generator.generateSecureInteger(5, 5); // min == max
      }).toThrow('Min must be less than max');
    });

    it('should handle edge cases in number generation', () => {
      // Test minimum range
      const result = generator.generateSecureInteger(0, 1);
      expect([0, 1]).toContain(result);
      
      // Test large range
      const largeResult = generator.generateSecureInteger(0, 1000000);
      expect(largeResult).toBeGreaterThanOrEqual(0);
      expect(largeResult).toBeLessThanOrEqual(1000000);
    });
  });

  describe('Memory Management', () => {
    it('should properly cleanup resources on destroy', () => {
      const testGenerator = new SecureRandomGenerator();
      
      // Generate some data to ensure internal state is created
      testGenerator.generateEventId();
      testGenerator.testEntropy(100);
      
      // Destroy should not throw
      expect(() => {
        testGenerator.destroy();
      }).not.toThrow();
      
      // Should be able to create new instance after destroy
      const newGenerator = SecureRandomGenerator.getInstance();
      expect(newGenerator.generateEventId()).toMatch(/^evt_\d+_[0-9a-f-]+$/);
      newGenerator.destroy();
    });
  });
});

describe('SecureRandomGenerator Integration', () => {
  it('should integrate properly with EventBus', async () => {
    // This test ensures that SecureRandomGenerator works in the context of EventBus
    const generator = SecureRandomGenerator.getInstance();
    
    // Generate IDs that would be used by EventBus
    const eventId = generator.generateEventId();
    const subscriptionId = generator.generateSubscriptionId();
    const traceId = generator.generateTraceId();
    const spanId = generator.generateSpanId();
    
    // Validate format compliance
    expect(eventId).toMatch(/^evt_\d+_[0-9a-f-]+$/);
    expect(subscriptionId).toMatch(/^sub_\d+_[0-9a-z]+$/);
    expect(traceId).toMatch(/^trace_\d+_[0-9a-f-]+$/);
    expect(spanId).toMatch(/^span_[0-9a-z]+$/);
    
    generator.destroy();
  });

  it('should maintain singleton pattern correctly', () => {
    const instance1 = SecureRandomGenerator.getInstance();
    const instance2 = SecureRandomGenerator.getInstance();
    
    expect(instance1).toBe(instance2);
    
    instance1.destroy();
    
    // After destroy, getInstance should create new instance
    const instance3 = SecureRandomGenerator.getInstance();
    expect(instance3).not.toBe(instance1);
    
    instance3.destroy();
  });
});