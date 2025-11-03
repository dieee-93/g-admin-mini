/**
 * REQUEST DEDUPLICATION SYSTEM
 *
 * Prevents multiple identical requests from being sent simultaneously.
 *
 * Problem Solved:
 * When multiple components mount at the same time and call the same API,
 * we were making duplicate requests to Supabase:
 *
 * ❌ BEFORE: 4 components → 4 identical queries
 * ✅ AFTER:  4 components → 1 query (shared Promise)
 *
 * How it works:
 * 1. First request starts → Store Promise in Map
 * 2. Subsequent requests → Return same Promise from Map
 * 3. Request completes → Remove from Map
 *
 * Usage:
 * ```typescript
 * import { deduplicator } from '@/lib/query/requestDeduplication';
 *
 * // In your API service
 * export async function getLocations() {
 *   return deduplicator.dedupe('locations:all', async () => {
 *     const { data } = await supabase.from('locations').select('*');
 *     return data;
 *   });
 * }
 * ```
 *
 * @module RequestDeduplication
 */

import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

/**
 * Unique key identifying a request
 * Format: "resource:operation:params"
 * Example: "locations:all", "materials:item:123"
 */
type RequestKey = string;

/**
 * A pending Promise for an in-flight request
 */
type PendingRequest<T> = Promise<T>;

/**
 * Statistics for monitoring deduplication effectiveness
 */
export interface DeduplicationStats {
  /** Total number of dedupe() calls */
  totalCalls: number;

  /** Number of unique requests actually sent */
  uniqueRequests: number;

  /** Number of requests deduplicated (reused existing Promise) */
  deduplicatedRequests: number;

  /** Percentage of requests saved by deduplication */
  savingsPercentage: number;

  /** Currently in-flight requests */
  inFlightCount: number;
}

/**
 * Options for dedupe behavior
 */
interface DedupeOptions {
  /** Custom timeout in milliseconds (default: 30000 = 30s) */
  timeout?: number;

  /** Whether to log this request (default: true) */
  silent?: boolean;
}

// ============================================
// REQUEST DEDUPLICATOR CLASS
// ============================================

/**
 * Singleton class for deduplicating identical concurrent requests
 *
 * Features:
 * - Automatic cleanup after request completion
 * - Timeout protection (requests auto-cleanup after 30s)
 * - Statistics tracking for monitoring
 * - Type-safe generics
 * - Error propagation to all waiting consumers
 */
class RequestDeduplicator {
  /**
   * Map of in-flight requests
   * Key: Request identifier (e.g., "locations:all")
   * Value: Pending Promise
   */
  private pendingRequests = new Map<RequestKey, PendingRequest<any>>();

  /**
   * Map of timeout handlers for cleanup
   * Key: Request identifier
   * Value: Timeout ID
   */
  private timeouts = new Map<RequestKey, NodeJS.Timeout>();

  /**
   * Statistics for monitoring
   */
  private stats = {
    totalCalls: 0,
    uniqueRequests: 0,
    deduplicatedRequests: 0
  };

  /**
   * Deduplicate a request
   *
   * If an identical request is already in-flight, returns the existing Promise.
   * Otherwise, starts a new request and stores it for future deduplication.
   *
   * @template T - Return type of the request
   * @param key - Unique identifier for this request
   * @param fetcher - Async function that performs the actual request
   * @param options - Optional configuration
   * @returns Promise resolving to the request result
   *
   * @example
   * ```typescript
   * // Multiple components call this simultaneously
   * const data = await deduplicator.dedupe('locations:all', async () => {
   *   return await supabase.from('locations').select('*');
   * });
   * // Only 1 actual database query is made
   * ```
   */
  async dedupe<T>(
    key: RequestKey,
    fetcher: () => Promise<T>,
    options: DedupeOptions = {}
  ): Promise<T> {
    const { timeout = 30000, silent = false } = options;

    this.stats.totalCalls++;

    // Check if request already in-flight
    if (this.pendingRequests.has(key)) {
      this.stats.deduplicatedRequests++;

      if (!silent) {
        logger.debug('RequestDeduplication', `🔄 Reusing in-flight request: ${key}`, {
          inFlight: this.pendingRequests.size,
          totalSavings: this.stats.deduplicatedRequests
        });
      }

      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Start new request
    this.stats.uniqueRequests++;

    if (!silent) {
      logger.debug('RequestDeduplication', `🚀 Starting new request: ${key}`, {
        inFlight: this.pendingRequests.size + 1
      });
    }

    // Create Promise with cleanup
    const promise = fetcher()
      .then((result) => {
        // Successful completion - cleanup
        this.cleanup(key);

        if (!silent) {
          logger.debug('RequestDeduplication', `✅ Request completed: ${key}`);
        }

        return result;
      })
      .catch((error) => {
        // Error occurred - cleanup and propagate
        this.cleanup(key);

        logger.error('RequestDeduplication', `❌ Request failed: ${key}`, { error });

        throw error;
      });

    // Store pending request
    this.pendingRequests.set(key, promise);

    // Set timeout for automatic cleanup (prevents memory leaks)
    const timeoutId = setTimeout(() => {
      if (this.pendingRequests.has(key)) {
        logger.warn('RequestDeduplication', `⏱️ Request timeout: ${key} (exceeded ${timeout}ms)`);
        this.cleanup(key);
      }
    }, timeout);

    this.timeouts.set(key, timeoutId);

    return promise;
  }

  /**
   * Cleanup a completed or failed request
   *
   * @param key - Request key to cleanup
   */
  private cleanup(key: RequestKey): void {
    // Remove from pending requests
    this.pendingRequests.delete(key);

    // Clear timeout
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }
  }

  /**
   * Manually clear a specific request from the deduplication cache
   *
   * Useful for force-refresh scenarios or when you know a request is stale.
   *
   * @param key - Request key to clear (optional, clears all if not provided)
   *
   * @example
   * ```typescript
   * // Clear specific request
   * deduplicator.clear('locations:all');
   *
   * // Clear all in-flight requests (nuclear option)
   * deduplicator.clear();
   * ```
   */
  clear(key?: RequestKey): void {
    if (key) {
      this.cleanup(key);
      logger.debug('RequestDeduplication', `🗑️ Manually cleared: ${key}`);
    } else {
      // Clear all
      const count = this.pendingRequests.size;

      // Clear all timeouts
      for (const timeoutId of this.timeouts.values()) {
        clearTimeout(timeoutId);
      }

      this.pendingRequests.clear();
      this.timeouts.clear();

      logger.debug('RequestDeduplication', `🗑️ Cleared all in-flight requests (${count})`);
    }
  }

  /**
   * Get current deduplication statistics
   *
   * Useful for monitoring effectiveness in production.
   *
   * @returns Statistics object with metrics
   *
   * @example
   * ```typescript
   * const stats = deduplicator.getStats();
   * console.log(`Saved ${stats.deduplicatedRequests} requests`);
   * console.log(`Savings: ${stats.savingsPercentage.toFixed(1)}%`);
   * ```
   */
  getStats(): DeduplicationStats {
    const { totalCalls, uniqueRequests, deduplicatedRequests } = this.stats;

    const savingsPercentage = totalCalls > 0
      ? (deduplicatedRequests / totalCalls) * 100
      : 0;

    return {
      totalCalls,
      uniqueRequests,
      deduplicatedRequests,
      savingsPercentage,
      inFlightCount: this.pendingRequests.size
    };
  }

  /**
   * Reset statistics (useful for testing or monitoring specific operations)
   */
  resetStats(): void {
    this.stats = {
      totalCalls: 0,
      uniqueRequests: 0,
      deduplicatedRequests: 0
    };

    logger.debug('RequestDeduplication', '📊 Statistics reset');
  }

  /**
   * Get list of currently in-flight request keys
   *
   * Useful for debugging to see what requests are currently pending.
   */
  getInFlightKeys(): RequestKey[] {
    return Array.from(this.pendingRequests.keys());
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

/**
 * Global singleton instance
 *
 * Import this in your API services to deduplicate requests.
 *
 * @example
 * ```typescript
 * import { deduplicator } from '@/lib/query/requestDeduplication';
 *
 * export const locationsApi = {
 *   async getAll() {
 *     return deduplicator.dedupe('locations:all', async () => {
 *       const { data } = await supabase.from('locations').select('*');
 *       return data;
 *     });
 *   }
 * };
 * ```
 */
export const deduplicator = new RequestDeduplicator();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate consistent request key from parameters
 *
 * Useful for creating cache keys that include query parameters.
 *
 * @param resource - Resource name (e.g., 'locations', 'materials')
 * @param operation - Operation name (e.g., 'all', 'byId')
 * @param params - Optional parameters object
 * @returns Consistent request key
 *
 * @example
 * ```typescript
 * const key1 = generateRequestKey('materials', 'byLocation', { locationId: '123' });
 * // Result: "materials:byLocation:locationId=123"
 *
 * const key2 = generateRequestKey('sales', 'all');
 * // Result: "sales:all"
 * ```
 */
export function generateRequestKey(
  resource: string,
  operation: string,
  params?: Record<string, any>
): RequestKey {
  const baseKey = `${resource}:${operation}`;

  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }

  // Sort params for consistency
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${baseKey}:${sortedParams}`;
}

// ============================================
// DEBUGGING UTILITIES
// ============================================

/**
 * Log current deduplication statistics
 *
 * Useful for debugging or monitoring in development.
 *
 * @example
 * ```typescript
 * import { logDeduplicationStats } from '@/lib/query/requestDeduplication';
 *
 * // In your component or API
 * logDeduplicationStats();
 * ```
 */
export function logDeduplicationStats(): void {
  const stats = deduplicator.getStats();

  console.group('📊 Request Deduplication Stats');
  console.log(`Total calls: ${stats.totalCalls}`);
  console.log(`Unique requests: ${stats.uniqueRequests}`);
  console.log(`Deduplicated: ${stats.deduplicatedRequests}`);
  console.log(`Savings: ${stats.savingsPercentage.toFixed(1)}%`);
  console.log(`In-flight: ${stats.inFlightCount}`);

  if (stats.inFlightCount > 0) {
    console.log('In-flight keys:', deduplicator.getInFlightKeys());
  }

  console.groupEnd();
}

/**
 * Enable verbose logging for debugging
 *
 * Call this in development to see all deduplication activity.
 *
 * @example
 * ```typescript
 * import { enableDebugMode } from '@/lib/query/requestDeduplication';
 *
 * // In your App.tsx or main entry point
 * if (import.meta.env.DEV) {
 *   enableDebugMode();
 * }
 * ```
 */
export function enableDebugMode(): void {
  logger.info('RequestDeduplication', '🔍 Debug mode enabled');

  // Log stats every 10 seconds
  setInterval(() => {
    const stats = deduplicator.getStats();
    if (stats.totalCalls > 0) {
      logDeduplicationStats();
    }
  }, 10000);
}
