/**
 * Cache Service for Materials API
 *
 * Implements in-memory LRU (Least Recently Used) cache with TTL support.
 * Reduces database queries and improves UI responsiveness.
 *
 * Features:
 * - TTL (Time To Live) per entry
 * - Maximum cache size with LRU eviction
 * - Cache key generation from request params
 * - Manual invalidation support
 * - Cache statistics tracking
 */

import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

interface CacheConfig {
  maxSize: number; // Maximum number of entries
  defaultTTL: number; // Default TTL in milliseconds
}

// ============================================
// LRU CACHE IMPLEMENTATION
// ============================================

/**
 * LRU (Least Recently Used) Cache Implementation
 *
 * Provides in-memory caching with automatic eviction of oldest entries
 * when cache reaches maximum size. Supports TTL (Time To Live) for entries
 * and tracks hit/miss statistics for performance monitoring.
 *
 * Features:
 * - **TTL Support**: Entries expire after configured time
 * - **LRU Eviction**: Oldest entries removed when cache is full
 * - **Hit Tracking**: Monitors cache efficiency
 * - **Pattern Invalidation**: Clear multiple entries by regex pattern
 *
 * @template T - Type of cached data
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<MaterialItem[]>({
 *   maxSize: 50,
 *   defaultTTL: 3 * 60 * 1000 // 3 minutes
 * });
 *
 * // Store data
 * cache.set('materials:all', items, 180000);
 *
 * // Retrieve data
 * const cached = cache.get('materials:all');
 * if (cached) {
 *   logger.debug('CacheService', 'Cache hit!', cached);
 * }
 * ```
 */
class LRUCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private stats: CacheStats;

  /**
   * Create new LRU cache instance
   *
   * @param config - Optional cache configuration
   * @param config.maxSize - Maximum number of entries (default: 100)
   * @param config.defaultTTL - Default TTL in milliseconds (default: 5 minutes)
   */
  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize || 100,
      defaultTTL: config.defaultTTL || 5 * 60 * 1000 // 5 minutes default
    };
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      evictions: 0
    };
  }

  /**
   * Retrieve item from cache
   *
   * Returns null if:
   * - Key not found in cache (cache miss)
   * - Entry has expired (age > TTL)
   *
   * On cache hit:
   * - Entry is moved to end of Map (most recently used)
   * - Hit counter incremented
   * - Entry hit count incremented
   *
   * @param key - Cache key to retrieve
   * @returns Cached data or null if not found/expired
   *
   * @example
   * ```typescript
   * const data = cache.get<MaterialItem[]>('materials:all');
   * if (data) {
   *   logger.debug('CacheService', 'Cache hit! Found', data.length, 'items');
   * } else {
   *   logger.debug('CacheService', 'Cache miss - need to fetch from DB');
   * }
   * ```
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug('CacheService', `Cache MISS: ${key}`);
      return null;
    }

    // Check if expired
    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      this.stats.size--;
      this.stats.misses++;
      logger.debug('CacheService', `Cache EXPIRED: ${key} (age: ${age}ms)`);
      return null;
    }

    // Hit! Move to end (most recently used)
    this.cache.delete(key);
    entry.hits++;
    this.cache.set(key, entry);
    this.stats.hits++;

    logger.debug('CacheService', `Cache HIT: ${key} (hits: ${entry.hits})`);
    return entry.data;
  }

  /**
   * Store item in cache
   *
   * If cache is at maxSize and key is new (not an update), oldest entry
   * will be evicted automatically via LRU algorithm.
   *
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Optional TTL in milliseconds (overrides defaultTTL)
   *
   * @example
   * ```typescript
   * // Store with default TTL
   * cache.set('materials:all', items);
   *
   * // Store with custom TTL (1 minute)
   * cache.set('materials:hot', hotItems, 60000);
   * ```
   */
  set(key: string, data: T, ttl?: number): void {
    // Check if we need to evict oldest entry
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;

    logger.debug('CacheService', `Cache SET: ${key} (TTL: ${entry.ttl}ms)`);
  }

  /**
   * Remove specific entry from cache
   *
   * @param key - Cache key to remove
   * @returns true if entry was removed, false if not found
   *
   * @example
   * ```typescript
   * const removed = cache.invalidate('materials:item-123');
   * if (removed) {
   *   logger.error('CacheService', 'Entry invalidated');
   * }
   * ```
   */
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size--;
      logger.debug('CacheService', `Cache INVALIDATED: ${key}`);
    }
    return deleted;
  }

  /**
   * Remove all cache entries matching a pattern
   *
   * Useful for invalidating related entries without clearing entire cache.
   *
   * @param pattern - String pattern or RegExp to match keys against
   * @returns Number of entries removed
   *
   * @example
   * ```typescript
   * // Remove all location-specific queries
   * const count = cache.invalidatePattern(/locationId:loc-1/);
   * logger.debug('CacheService', `Removed ${count} entries`);
   *
   * // Remove all getItems queries
   * cache.invalidatePattern(/^materials:getItems:/);
   * ```
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.size = this.cache.size;
    logger.info('CacheService', `Invalidated ${count} entries matching: ${pattern}`);
    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    logger.info('CacheService', `Cache cleared (${size} entries removed)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Evict oldest (least recently used) entry
   */
  private evictOldest(): void {
    // First key in Map is the oldest (LRU)
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      logger.debug('CacheService', `Cache EVICTED: ${oldestKey}`);
    }
  }
}

// ============================================
// CACHE INSTANCE & HELPERS
// ============================================

// Singleton cache instance for materials
const materialsCache = new LRUCache({
  maxSize: 50, // Cache up to 50 different queries
  defaultTTL: 3 * 60 * 1000 // 3 minutes default
});

/**
 * Generate consistent cache key from operation and parameters
 *
 * Keys are generated in format: `materials:operation:param1:value1|param2:value2`
 * Parameters are sorted alphabetically to ensure consistency.
 *
 * @param operation - Operation name (e.g., 'getItems', 'getItem')
 * @param params - Query parameters as key-value object
 * @returns Consistent cache key string
 *
 * @example
 * ```typescript
 * const key1 = generateCacheKey('getItems', { locationId: 'loc-1', category: 'food' });
 * // Result: "materials:getItems:category:food|locationId:loc-1"
 *
 * const key2 = generateCacheKey('getItems', { category: 'food', locationId: 'loc-1' });
 * // Result: "materials:getItems:category:food|locationId:loc-1" (same as key1!)
 * ```
 */
function generateCacheKey(
  operation: string,
  params: Record<string, unknown> = {}
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `materials:${operation}:${sortedParams}`;
}

/**
 * Execute operation with automatic caching
 *
 * Wraps async operation to use cache when available, falling back
 * to executing operation and storing result in cache on miss.
 *
 * @template T - Return type of operation
 * @param cacheKey - Key to use for caching
 * @param operation - Async function to execute on cache miss
 * @param ttl - Optional custom TTL (overrides default)
 * @returns Promise resolving to cached or fresh data
 *
 * @example
 * ```typescript
 * const items = await withCache(
 *   'materials:all',
 *   async () => {
 *     // This only runs on cache miss
 *     const { data } = await supabase.from('items').select('*');
 *     return data;
 *   },
 *   3 * 60 * 1000 // 3 minutes
 * );
 * ```
 */
async function withCache<T>(
  cacheKey: string,
  operation: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = materialsCache.get(cacheKey);
  if (cached !== null) {
    return cached as T;
  }

  // Cache miss - execute operation
  const result = await operation();

  // Store in cache
  materialsCache.set(cacheKey, result, ttl);

  return result;
}

// ============================================
// EXPORTS
// ============================================

export const CacheService = {
  /**
   * Get cached value
   */
  get: <T>(key: string): T | null => materialsCache.get(key),

  /**
   * Set cached value
   */
  set: <T>(key: string, data: T, ttl?: number): void =>
    materialsCache.set(key, data, ttl),

  /**
   * Wrap operation with caching
   */
  withCache,

  /**
   * Generate cache key
   */
  generateKey: generateCacheKey,

  /**
   * Invalidate specific entry
   */
  invalidate: (key: string): boolean => materialsCache.invalidate(key),

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern: (pattern: string | RegExp): number =>
    materialsCache.invalidatePattern(pattern),

  /**
   * Clear all cache
   */
  clear: (): void => materialsCache.clear(),

  /**
   * Get cache statistics
   */
  getStats: (): CacheStats => materialsCache.getStats(),

  /**
   * Get hit rate percentage
   */
  getHitRate: (): number => materialsCache.getHitRate()
};

// ============================================
// CACHE INVALIDATION HELPERS
// ============================================

/**
 * Invalidate all cached materials list queries
 *
 * Use after operations that affect the materials list (add, delete, bulk update).
 * Removes all cache entries matching pattern: `materials:getItems:*`
 *
 * @example
 * ```typescript
 * await createMaterial(newMaterial);
 * invalidateMaterialsListCache(); // Clear all getItems() queries
 * ```
 */
export function invalidateMaterialsListCache(): void {
  CacheService.invalidatePattern(/^materials:getItems:/);
  logger.info('CacheService', 'Materials list cache invalidated');
}

/**
 * Invalidate all cached data for a specific material
 *
 * Use after operations that modify a single material (update, stock change).
 * Removes all cache entries containing the itemId.
 *
 * @param itemId - ID of material to invalidate
 *
 * @example
 * ```typescript
 * await updateMaterial('item-123', { stock: 500 });
 * invalidateMaterialCache('item-123'); // Clear this item's cache
 * invalidateMaterialsListCache();      // Also clear list caches
 * ```
 */
export function invalidateMaterialCache(itemId: string): void {
  CacheService.invalidatePattern(new RegExp(`itemId.*${itemId}`));
  logger.info('CacheService', `Material cache invalidated: ${itemId}`);
}

/**
 * Clear entire cache (nuclear option)
 *
 * Use sparingly - only after major operations like:
 * - Large bulk imports
 * - Database migrations
 * - When experiencing persistent stale data issues
 *
 * ⚠️ Warning: All subsequent queries will be cache misses until cache warms up again.
 *
 * @example
 * ```typescript
 * await bulkImport(1000, items);
 * invalidateAllCache(); // Clear everything
 * ```
 */
export function invalidateAllCache(): void {
  CacheService.clear();
  logger.info('CacheService', 'All cache invalidated');
}
