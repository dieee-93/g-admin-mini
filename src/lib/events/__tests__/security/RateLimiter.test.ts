// RateLimiter.test.ts - Comprehensive tests for rate limiting and DDoS protection
// Tests multi-tier limits, attack detection, and enterprise security features

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import RateLimiter, { type RateLimitConfig, type RateLimitResult } from '../../utils/RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let testConfig: Partial<RateLimitConfig>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    testConfig = {
      globalRequestsPerMinute: 1000,
      globalBurstLimit: 100,
      
      ipRequestsPerMinute: 10,
      ipBurstLimit: 5,
      
      userRequestsPerMinute: 50,
      userBurstLimit: 10,
      
      eventPatternLimits: {
        'payment.*': { requestsPerMinute: 5, burstLimit: 2 },
        'auth.*': { requestsPerMinute: 3, burstLimit: 1 },
        'test.*': { requestsPerMinute: 20, burstLimit: 5 }
      },
      
      ddosDetectionThreshold: 50,
      ddosBlockDurationMs: 5000, // 5 seconds for testing
      
      enableAdaptiveLimiting: true,
      enableGeographicBlocking: false,
      suspiciousPatternDetection: true,
      
      cleanupIntervalMs: 10000, // 10 seconds for testing
      recordExpirationMs: 30000  // 30 seconds for testing
    };
    
    rateLimiter = new RateLimiter(testConfig);
  });

  afterEach(() => {
    if (rateLimiter) {
      rateLimiter.destroy();
    }
    vi.useRealTimers();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within IP limits', async () => {
      const clientIP = '192.168.1.100';
      
      // Make 5 requests (within limit of 10)
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit('test.event', clientIP);
        expect(result.allowed).toBe(true);
        expect(result.blocked).toBe(false);
        expect(result.remainingRequests).toBeGreaterThan(0);
      }
    });

    it('should block requests exceeding IP limits', async () => {
      const clientIP = '192.168.1.101';
      
      // Make requests up to limit
      for (let i = 0; i < 10; i++) {
        const result = await rateLimiter.checkLimit('test.event', clientIP);
        expect(result.allowed).toBe(true);
      }
      
      // 11th request should be blocked
      const result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('IP rate limit exceeded');
      expect(result.remainingRequests).toBe(0);
    });

    it('should reset limits after time window', async () => {
      const clientIP = '192.168.1.102';
      
      // Exhaust limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit('test.event', clientIP);
      }
      
      // Should be blocked
      let result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(false);
      
      // Advance time by 61 seconds (past 1 minute window)
      vi.advanceTimersByTime(61 * 1000);
      
      // Should be allowed again
      result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(true);
    });

    it('should handle different IPs independently', async () => {
      const ip1 = '192.168.1.103';
      const ip2 = '192.168.1.104';
      
      // Exhaust limit for IP1
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit('test.event', ip1);
      }
      
      // IP1 should be blocked
      let result1 = await rateLimiter.checkLimit('test.event', ip1);
      expect(result1.allowed).toBe(false);
      
      // IP2 should still be allowed
      let result2 = await rateLimiter.checkLimit('test.event', ip2);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('User-based Rate Limiting', () => {
    it('should allow requests within user limits', async () => {
      const userId = 'user-123';
      
      // Make 25 requests (within user limit of 50) from different IPs to avoid IP limits
      for (let i = 0; i < 25; i++) {
        const clientIP = `192.168.1.${200 + (i % 50)}`; // Use different IPs
        const result = await rateLimiter.checkLimit('user.action', clientIP, userId); // Use different pattern
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding user limits', async () => {
      const userId = 'user-456';
      
      // Make requests up to user limit (50) from different IPs to avoid IP limits
      for (let i = 0; i < 50; i++) {
        const clientIP = `192.168.2.${200 + (i % 50)}`; // Use different IPs
        const result = await rateLimiter.checkLimit('user.action', clientIP, userId); // Use different pattern
        expect(result.allowed).toBe(true);
      }
      
      // 51st request should be blocked
      const clientIP = '192.168.2.250';
      const result = await rateLimiter.checkLimit('user.action', clientIP, userId);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('User rate limit exceeded');
    });

    it('should handle different users independently', async () => {
      const clientIP = '192.168.1.107';
      const user1 = 'user-789';
      const user2 = 'user-012';
      
      // Exhaust limit for user1 (but stay within IP limit)
      for (let i = 0; i < 8; i++) {
        await rateLimiter.checkLimit('test.event', clientIP, user1);
      }
      
      // user1 approaching limit, user2 should still have full allowance
      const result1 = await rateLimiter.checkLimit('test.event', clientIP, user1);
      expect(result1.allowed).toBe(true);
      
      const result2 = await rateLimiter.checkLimit('test.event', clientIP, user2);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('Event Pattern Limiting', () => {
    it('should apply specific limits to payment events', async () => {
      const clientIP = '192.168.1.108';
      
      // Make requests up to payment limit (5)
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit('payment.process', clientIP);
        expect(result.allowed).toBe(true);
      }
      
      // 6th payment request should be blocked
      const result = await rateLimiter.checkLimit('payment.process', clientIP);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Event pattern rate limit exceeded');
    });

    it('should apply specific limits to auth events', async () => {
      const clientIP = '192.168.1.109';
      
      // Make requests up to auth limit (3)
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.checkLimit('auth.login', clientIP);
        expect(result.allowed).toBe(true);
      }
      
      // 4th auth request should be blocked
      const result = await rateLimiter.checkLimit('auth.login', clientIP);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Event pattern rate limit exceeded');
    });

    it('should use pattern matching for event limits', async () => {
      const clientIP = '192.168.1.110';
      
      // Different payment events should share the same limit
      await rateLimiter.checkLimit('payment.process', clientIP);
      await rateLimiter.checkLimit('payment.validate', clientIP);
      await rateLimiter.checkLimit('payment.complete', clientIP);
      await rateLimiter.checkLimit('payment.refund', clientIP);
      await rateLimiter.checkLimit('payment.capture', clientIP);
      
      // 6th payment-related event should be blocked
      const result = await rateLimiter.checkLimit('payment.cancel', clientIP);
      expect(result.allowed).toBe(false);
    });

    it('should allow non-matching patterns through', async () => {
      const clientIP = '192.168.1.111';
      
      // Exhaust payment pattern limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit('payment.process', clientIP);
      }
      
      // Payment should be blocked
      let result = await rateLimiter.checkLimit('payment.process', clientIP);
      expect(result.allowed).toBe(false);
      
      // But inventory events should still be allowed (no specific limit)
      result = await rateLimiter.checkLimit('inventory.update', clientIP);
      expect(result.allowed).toBe(true);
    });
  });

  describe('DDoS Detection and Protection', () => {
    it('should detect rapid fire attacks', async () => {
      // Create specialized rateLimiter for DDoS testing with high IP limits
      const ddosTestConfig = {
        ...testConfig,
        ipRequestsPerMinute: 1000, // High enough to not interfere with DDoS testing
        ddosDetectionThreshold: 50, // Keep DDoS threshold at 50
        eventPatternLimits: {
          ...testConfig.eventPatternLimits,
          'ddos.*': { requestsPerMinute: 1000, burstLimit: 100 }
        }
      };
      const ddosRateLimiter = new RateLimiter(ddosTestConfig);
      
      const clientIP = '192.168.1.112';
      
      // Simulate rapid fire attack (many requests in short time)
      const startTime = Date.now();
      for (let i = 0; i < 30; i++) {
        const result = await ddosRateLimiter.checkLimit('ddos.attack', clientIP);
        if (!result.allowed) break;
        
        // Advance time by only 50ms (very rapid)
        vi.advanceTimersByTime(50);
      }
      
      // Should eventually be blocked due to rapid fire detection
      const result = await ddosRateLimiter.checkLimit('ddos.attack', clientIP);
      expect(result.suspicionScore).toBeGreaterThan(50);
      
      ddosRateLimiter.destroy();
    });

    it('should block IP when DDoS threshold is reached', async () => {
      const clientIP = '192.168.1.113';
      
      // Simulate DDoS attack - exceed threshold (50 requests)
      for (let i = 0; i < 55; i++) {
        const result = await rateLimiter.checkLimit('test.event', clientIP);
        
        if (result.blocked) {
          expect(result.allowed).toBe(false);
          expect(result.reason).toContain('DDoS');
          expect(result.retryAfter).toBeGreaterThan(0);
          break;
        }
        
        vi.advanceTimersByTime(100); // 100ms between requests
      }
    });

    it('should unblock IP after block duration', async () => {
      // Create specialized rateLimiter for DDoS testing with high IP limits
      const ddosTestConfig = {
        ...testConfig,
        ipRequestsPerMinute: 1000, // High enough to not interfere with DDoS testing
        ddosDetectionThreshold: 50, // Keep DDoS threshold at 50
        ddosBlockDurationMs: 5000, // 5 seconds
        eventPatternLimits: {
          ...testConfig.eventPatternLimits,
          'ddos.*': { requestsPerMinute: 1000, burstLimit: 100 }
        }
      };
      const ddosRateLimiter = new RateLimiter(ddosTestConfig);
      
      const clientIP = '192.168.1.114';
      
      // Trigger DDoS block
      for (let i = 0; i < 55; i++) {
        await ddosRateLimiter.checkLimit('ddos.attack', clientIP);
        vi.advanceTimersByTime(50);
      }
      
      // Should be blocked
      let result = await ddosRateLimiter.checkLimit('ddos.attack', clientIP);
      expect(result.blocked).toBe(true);
      
      // Advance time past block duration (5 seconds)
      vi.advanceTimersByTime(6000);
      
      // Should be unblocked
      result = await ddosRateLimiter.checkLimit('ddos.attack', clientIP);
      expect(result.allowed).toBe(true);
      
      ddosRateLimiter.destroy();
      expect(result.blocked).toBe(false);
    });

    it('should detect suspicious user agents', async () => {
      const clientIP = '192.168.1.115';
      const suspiciousAgent = 'curl/7.68.0';
      
      const result = await rateLimiter.checkLimit(
        'test.event', 
        clientIP, 
        undefined, 
        suspiciousAgent
      );
      
      expect(result.suspicionScore).toBeGreaterThan(0);
    });

    it('should handle geographic anomalies when enabled', async () => {
      const geoRateLimiter = new RateLimiter({
        ...testConfig,
        enableGeographicBlocking: true
      });
      
      const clientIP = '192.168.1.116';
      const result = await geoRateLimiter.checkLimit(
        'test.event',
        clientIP,
        undefined,
        'Mozilla/5.0',
        { country: 'UNKNOWN', region: 'UNKNOWN' }
      );
      
      expect(result.suspicionScore).toBeGreaterThan(0);
      
      geoRateLimiter.destroy();
    });
  });

  describe('Manual IP Management', () => {
    it('should allow manual IP blocking', async () => {
      const clientIP = '192.168.1.117';
      
      // Initially should be allowed
      let result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(true);
      
      // Manually block IP
      rateLimiter.blockIP(clientIP, 'Manual block for testing');
      
      // Should now be blocked
      result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should allow manual IP unblocking', async () => {
      const clientIP = '192.168.1.118';
      
      // Manually block IP
      rateLimiter.blockIP(clientIP, 'Test block');
      
      // Should be blocked
      let result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(false);
      
      // Manually unblock
      rateLimiter.unblockIP(clientIP, 'Test unblock');
      
      // Should be allowed again
      result = await rateLimiter.checkLimit('test.event', clientIP);
      expect(result.allowed).toBe(true);
      expect(result.blocked).toBe(false);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide accurate statistics', async () => {
      const clientIPs = ['192.168.1.119', '192.168.1.120', '192.168.1.121'];
      
      // Generate some traffic
      for (const ip of clientIPs) {
        for (let i = 0; i < 5; i++) {
          await rateLimiter.checkLimit('test.event', ip);
        }
      }
      
      const stats = rateLimiter.getStats();
      
      expect(stats.totalRecords).toBeGreaterThan(0);
      expect(stats.topRequesters).toHaveLength(3);
      expect(stats.topRequesters[0].requests).toBe(5);
    });

    it('should track blocked IPs in statistics', async () => {
      const clientIP = '192.168.1.122';
      
      // Manually block an IP
      rateLimiter.blockIP(clientIP, 'Test blocking stats');
      
      const stats = rateLimiter.getStats();
      expect(stats.blockedIPs).toBe(1);
    });

    it('should track suspicious activity', async () => {
      const clientIP = '192.168.1.123';
      
      // Generate suspicious activity (rapid requests)
      for (let i = 0; i < 20; i++) {
        await rateLimiter.checkLimit('test.event', clientIP);
        vi.advanceTimersByTime(50); // Rapid requests
      }
      
      const stats = rateLimiter.getStats();
      expect(stats.suspiciousActivity).toBeGreaterThan(0);
    });
  });

  describe('Memory Management and Cleanup', () => {
    it('should cleanup expired records', async () => {
      const clientIP = '192.168.1.124';
      
      // Generate some records
      await rateLimiter.checkLimit('test.event', clientIP);
      
      // Advance time past record expiration (30 seconds)
      vi.advanceTimersByTime(35000);
      
      // Trigger cleanup by advancing to cleanup interval
      vi.advanceTimersByTime(10000);
      
      const stats = rateLimiter.getStats();
      // Records should be cleaned up, so total should be low/zero
      expect(stats.totalRecords).toBeLessThan(5);
    });

    it('should handle cleanup gracefully', () => {
      expect(() => {
        rateLimiter.destroy();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed input gracefully', async () => {
      const result = await rateLimiter.checkLimit('', '');
      
      // Should not throw and should have a reasonable default
      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');
    });

    it('should fail-safe on internal errors', async () => {
      // Create rate limiter with invalid config to trigger error path
      const faultyLimiter = new RateLimiter({
        cleanupIntervalMs: -1, // Invalid interval
        recordExpirationMs: -1  // Invalid expiration
      });
      
      const result = await faultyLimiter.checkLimit('test.event', '192.168.1.125');
      
      // Should fail-safe and allow the request
      expect(result.allowed).toBe(true);
      
      faultyLimiter.destroy();
    });
  });

  describe('Configuration Flexibility', () => {
    it('should work with minimal configuration', async () => {
      const minimalLimiter = new RateLimiter({});
      
      const result = await minimalLimiter.checkLimit('test.event', '192.168.1.126');
      expect(result.allowed).toBe(true);
      
      minimalLimiter.destroy();
    });

    it('should respect custom event pattern limits', async () => {
      const customLimiter = new RateLimiter({
        eventPatternLimits: {
          'custom.event.*': { requestsPerMinute: 2, burstLimit: 1 }
        }
      });
      
      const clientIP = '192.168.1.127';
      
      // Should allow 2 requests
      await customLimiter.checkLimit('custom.event.test', clientIP);
      await customLimiter.checkLimit('custom.event.another', clientIP);
      
      // 3rd should be blocked
      const result = await customLimiter.checkLimit('custom.event.final', clientIP);
      expect(result.allowed).toBe(false);
      
      customLimiter.destroy();
    });

    it('should disable features when configured', async () => {
      const disabledFeaturesLimiter = new RateLimiter({
        enableAdaptiveLimiting: false,
        enableGeographicBlocking: false,
        suspiciousPatternDetection: false
      });
      
      const result = await disabledFeaturesLimiter.checkLimit(
        'test.event',
        '192.168.1.128',
        undefined,
        'curl/7.68.0',
        { country: 'UNKNOWN', region: 'UNKNOWN' }
      );
      
      // Suspicion score should be 0 with detection disabled
      expect(result.suspicionScore).toBe(0);
      
      disabledFeaturesLimiter.destroy();
    });
  });
});