/**
 * CapabilityCache Tests for G-Admin v3.0
 * Tests caching functionality and performance optimizations
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { CapabilityCache, getCapabilityCache, resetCapabilityCache } from '../CapabilityCache';
import type { BusinessCapability } from '../../types/BusinessCapabilities';

describe('CapabilityCache', () => {
  let cache: CapabilityCache;

  beforeEach(() => {
    resetCapabilityCache();
    cache = getCapabilityCache({
      maxSize: 10,
      defaultTTL: 1000,
      enableStats: true,
      enableWarming: true
    });
  });

  afterEach(() => {
    cache.clear();
  });

  describe('Basic Operations', () => {
    test('should store and retrieve values', () => {
      cache.set('test-key', true);
      expect(cache.get('test-key')).toBe(true);
    });

    test('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    test('should handle TTL expiration', async () => {
      cache.set('expire-key', true, 50); // 50ms TTL
      expect(cache.get('expire-key')).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cache.get('expire-key')).toBeNull();
    });

    test('should check if key exists', () => {
      cache.set('exists-key', true);
      expect(cache.has('exists-key')).toBe(true);
      expect(cache.has('not-exists')).toBe(false);
    });

    test('should delete keys', () => {
      cache.set('delete-key', true);
      expect(cache.has('delete-key')).toBe(true);

      expect(cache.delete('delete-key')).toBe(true);
      expect(cache.has('delete-key')).toBe(false);
      expect(cache.delete('delete-key')).toBe(false);
    });

    test('should clear all entries', () => {
      cache.set('key1', true);
      cache.set('key2', false);

      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('Cache Statistics', () => {
    test('should track hits and misses', () => {
      cache.set('hit-key', true);

      // Hit
      cache.get('hit-key');
      // Miss
      cache.get('miss-key');

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    test('should track cache size', () => {
      cache.set('key1', true);
      cache.set('key2', false);

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('LRU Eviction', () => {
    test('should evict least recently used items', () => {
      // Fill cache to capacity
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, i);
      }

      // Access first key to make it recently used
      cache.get('key0');

      // Add one more to trigger eviction
      cache.set('new-key', 'new-value');

      // key0 should still exist (recently accessed)
      expect(cache.get('key0')).toBe(0);
      // new-key should exist
      expect(cache.get('new-key')).toBe('new-value');
      // key1 should be evicted (least recently used)
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('Cache Warming', () => {
    test('should warm cache with capabilities', () => {
      const capabilities: BusinessCapability[] = ['customer_management', 'sells_products'];
      const capabilityMap = {
        customer_management: true,
        sells_products: true
      };

      cache.warm(capabilities, capabilityMap);

      expect(cache.get('single:customer_management')).toBe(true);
      expect(cache.get('single:sells_products')).toBe(true);
    });
  });

  describe('Performance Recommendations', () => {
    test('should provide recommendations based on stats', () => {
      // Create scenario with low hit rate
      cache.set('key1', true);
      cache.get('missing1');
      cache.get('missing2');
      cache.get('missing3');

      const recommendations = cache.getPerformanceRecommendations();
      expect(recommendations).toContain('Consider increasing cache TTL or warming more frequently');
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const cache1 = getCapabilityCache();
      const cache2 = getCapabilityCache();

      cache1.set('singleton-test', true);
      expect(cache2.get('singleton-test')).toBe(true);
    });

    test('should reset instance', () => {
      const cache1 = getCapabilityCache();
      cache1.set('reset-test', true);

      resetCapabilityCache();
      const cache2 = getCapabilityCache();
      expect(cache2.get('reset-test')).toBeNull();
    });
  });
});