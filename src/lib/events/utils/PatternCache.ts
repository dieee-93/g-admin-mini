// PatternCache.ts - High-performance LRU cache for pattern validation
// Eliminates repetitive validation in hot paths for enterprise performance

import type { EventPattern } from '../types';
import { SecurityLogger } from './SecureLogger';

interface CacheEntry {
  pattern: EventPattern;
  isValid: boolean;
  validationResult?: {
    namespace: string;
    action: string;
    isGlobal: boolean;
    hasWildcard: boolean;
  };
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  evictions: number;
  hitRate: number;
  avgAccessTime: number;
  hotPatterns: string[];
}

interface PatternCacheConfig {
  maxSize: number;
  ttlMs: number;
  enableMetrics: boolean;
  autoCleanupIntervalMs: number;
}

const DEFAULT_CONFIG: PatternCacheConfig = {
  maxSize: 1000,           // 1000 patterns cached max
  ttlMs: 300000,          // 5 minutes TTL
  enableMetrics: true,    // Performance metrics enabled
  autoCleanupIntervalMs: 60000  // 1 minute cleanup interval
};

export class PatternCache {
  private static instance: PatternCache | null = null;
  private cache = new Map<EventPattern, CacheEntry>();
  private accessOrder: EventPattern[] = []; // LRU tracking
  private config: PatternCacheConfig;
  private metrics: CacheMetrics;
  private cleanupTimer?: number;

  constructor(config: Partial<PatternCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictions: 0,
      hitRate: 0,
      avgAccessTime: 0,
      hotPatterns: []
    };

    // Start auto-cleanup if enabled
    if (this.config.autoCleanupIntervalMs > 0) {
      this.startAutoCleanup();
    }

    SecurityLogger.anomaly('PatternCache initialized', {
      maxSize: this.config.maxSize,
      ttlMs: this.config.ttlMs
    });
  }

  /**
   * Get singleton instance (recommended for shared cache)
   */
  static getInstance(config?: Partial<PatternCacheConfig>): PatternCache {
    if (!PatternCache.instance) {
      PatternCache.instance = new PatternCache(config);
    }
    return PatternCache.instance;
  }

  /**
   * Validate pattern with caching
   */
  validatePattern(pattern: EventPattern): { isValid: boolean; result?: any } {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    // Check cache first
    const cached = this.getCached(pattern);
    if (cached) {
      this.metrics.cacheHits++;
      this.updateMetrics(performance.now() - startTime);
      
      return {
        isValid: cached.isValid,
        result: cached.validationResult
      };
    }

    // Cache miss - perform validation
    this.metrics.cacheMisses++;
    const validation = this.performValidation(pattern);
    
    // Store in cache
    this.setCached(pattern, validation.isValid, validation.result);
    
    this.updateMetrics(performance.now() - startTime);
    return validation;
  }

  /**
   * Check if pattern exists in cache (without validation)
   */
  has(pattern: EventPattern): boolean {
    const entry = this.cache.get(pattern);
    if (!entry) return false;
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(pattern);
      this.removeFromAccessOrder(pattern);
      return false;
    }
    
    return true;
  }

  /**
   * Manually cache a validation result
   */
  set(pattern: EventPattern, isValid: boolean, result?: any): void {
    this.setCached(pattern, isValid, result);
  }

  /**
   * Clear specific pattern from cache
   */
  delete(pattern: EventPattern): boolean {
    const deleted = this.cache.delete(pattern);
    if (deleted) {
      this.removeFromAccessOrder(pattern);
    }
    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    
    SecurityLogger.anomaly('PatternCache cleared', {
      clearedEntries: this.cache.size
    });
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    this.updateHotPatterns();
    return { ...this.metrics };
  }

  /**
   * Get cache size and capacity info
   */
  getInfo(): {
    size: number;
    maxSize: number;
    utilization: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      utilization: (this.cache.size / this.config.maxSize) * 100,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined
    };
  }

  /**
   * Perform cleanup of expired entries
   */
  cleanup(): number {
    const before = this.cache.size;
    const now = Date.now();
    
    for (const [pattern, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(pattern);
        this.removeFromAccessOrder(pattern);
      }
    }
    
    const cleaned = before - this.cache.size;
    
    if (cleaned > 0) {
      SecurityLogger.anomaly('PatternCache cleanup completed', {
        entriesRemoved: cleaned,
        remainingEntries: this.cache.size
      });
    }
    
    return cleaned;
  }

  /**
   * Warm up cache with common patterns
   */
  warmUp(patterns: EventPattern[]): number {
    let warmed = 0;
    
    for (const pattern of patterns) {
      if (!this.has(pattern)) {
        this.validatePattern(pattern);
        warmed++;
      }
    }
    
    SecurityLogger.anomaly('PatternCache warmed up', {
      patternsWarmed: warmed,
      totalPatterns: patterns.length
    });
    
    return warmed;
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.clear();
    PatternCache.instance = null;
    
    SecurityLogger.anomaly('PatternCache destroyed');
  }

  // === PRIVATE METHODS ===

  private getCached(pattern: EventPattern): CacheEntry | null {
    const entry = this.cache.get(pattern);
    if (!entry) return null;
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(pattern);
      this.removeFromAccessOrder(pattern);
      return null;
    }
    
    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.moveToFront(pattern);
    
    return entry;
  }

  private setCached(pattern: EventPattern, isValid: boolean, result?: any): void {
    const now = Date.now();
    
    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize && !this.cache.has(pattern)) {
      this.evictLRU();
    }
    
    const entry: CacheEntry = {
      pattern,
      isValid,
      validationResult: result,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    };
    
    this.cache.set(pattern, entry);
    this.moveToFront(pattern);
  }

  private performValidation(pattern: EventPattern): { isValid: boolean; result?: any } {
    try {
      const MAX_PATTERN_LENGTH = 256;
      const MAX_SEGMENT_LENGTH = 64;
      // Segments must be lowercase alphanumeric with optional single underscores in between.
      // Cannot start or end with an underscore.
      const SEGMENT_REGEX = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;

      if (typeof pattern !== 'string' || pattern.length === 0 || pattern.length > MAX_PATTERN_LENGTH) {
        return { isValid: false };
      }

      if (pattern.includes('..') || pattern.startsWith('.') || pattern.endsWith('.')) {
        return { isValid: false };
      }

      const parts = pattern.split('.');

      if (parts.length < 2) {
        return { isValid: false };
      }

      const [namespace, ...actionParts] = parts;
      const action = actionParts.join('.');

      // Validate namespace
      const isGlobal = namespace === 'global';
      if (!isGlobal) {
        if (namespace.length > MAX_SEGMENT_LENGTH || !SEGMENT_REGEX.test(namespace)) {
            return { isValid: false };
        }
      }
      
      // Validate action segments
      if (actionParts.length === 0) {
          return { isValid: false };
      }
      
      // Disallow wildcard as a full action, e.g. `users.*`
      if (action === '*') {
           return { isValid: false };
      }

      for (const segment of actionParts) {
          if (segment.length > MAX_SEGMENT_LENGTH || (segment !== '*' && !SEGMENT_REGEX.test(segment))) {
              return { isValid: false };
          }
      }

      const hasWildcard = pattern.includes('*');

      const result = {
          namespace,
          action,
          isGlobal,
          hasWildcard
      };

      return { isValid: true, result };

    } catch (error) {
      SecurityLogger.threat('Pattern validation error', {
        pattern,
        error: (error as Error).message
      });

      return { isValid: false };
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) > this.config.ttlMs;
  }

  private moveToFront(pattern: EventPattern): void {
    this.removeFromAccessOrder(pattern);
    this.accessOrder.unshift(pattern);
  }

  private removeFromAccessOrder(pattern: EventPattern): void {
    const index = this.accessOrder.indexOf(pattern);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const lruPattern = this.accessOrder.pop();
    if (lruPattern) {
      this.cache.delete(lruPattern);
      this.metrics.evictions++;
      
      SecurityLogger.anomaly('PatternCache LRU eviction', {
        evictedPattern: lruPattern,
        cacheSize: this.cache.size
      });
    }
  }

  private updateMetrics(accessTime: number): void {
    if (!this.config.enableMetrics) return;
    
    // Update hit rate
    this.metrics.hitRate = (this.metrics.cacheHits / this.metrics.totalRequests) * 100;
    
    // Update average access time
    this.metrics.avgAccessTime = (this.metrics.avgAccessTime + accessTime) / 2;
  }

  private updateHotPatterns(): void {
    if (!this.config.enableMetrics) return;
    
    // Get top 10 most accessed patterns
    const entries = Array.from(this.cache.entries());
    const sortedByAccess = entries
      .sort(([,a], [,b]) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(([pattern]) => pattern);
    
    this.metrics.hotPatterns = sortedByAccess;
  }

  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.autoCleanupIntervalMs);
  }
}

export default PatternCache;