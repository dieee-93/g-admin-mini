import { useCallback, useMemo, useRef, DependencyList } from 'react';

import { logger } from '@/lib/logging';
/**
 * Enhanced useCallback with dependency comparison and performance monitoring
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  debugName?: string
): T {
  const renderCountRef = useRef(0);
  const lastDepsRef = useRef<DependencyList>();
  const creationTimeRef = useRef<number>();

  // Track render count for debugging
  renderCountRef.current++;

  // Check if dependencies actually changed
  const depsChanged = !lastDepsRef.current || 
    deps.length !== lastDepsRef.current.length ||
    deps.some((dep, index) => !Object.is(dep, lastDepsRef.current![index]));

  if (depsChanged && debugName && process.env.NODE_ENV === 'development') {
    logger.debug('Performance', `useMemoizedCallback(${debugName}): Dependencies changed`, {
      renderCount: renderCountRef.current,
      oldDeps: lastDepsRef.current,
      newDeps: deps
    });
  }

  const memoizedCallback = useCallback(
    (...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = callback(...args);
      const endTime = performance.now();

      // Log slow callbacks in development
      if (process.env.NODE_ENV === 'development' && endTime - startTime > 10) {
        logger.warn('Performance', `Slow callback ${debugName || 'unknown'}: ${(endTime - startTime).toFixed(2)}ms`);
      }

      return result;
    },
    deps // eslint-disable-line react-hooks/exhaustive-deps
  );

  lastDepsRef.current = deps;
  creationTimeRef.current = performance.now();

  return memoizedCallback;
}

/**
 * Enhanced useMemo with performance monitoring
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: DependencyList,
  debugName?: string
): T {
  const renderCountRef = useRef(0);
  const lastDepsRef = useRef<DependencyList>();
  const computationCountRef = useRef(0);

  renderCountRef.current++;

  const depsChanged = !lastDepsRef.current || 
    deps.length !== lastDepsRef.current.length ||
    deps.some((dep, index) => !Object.is(dep, lastDepsRef.current![index]));

  const memoizedValue = useMemo(() => {
    const startTime = performance.now();
    computationCountRef.current++;
    
    const result = factory();
    
    const endTime = performance.now();
    const computationTime = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Performance', `useMemoizedValue(${debugName || 'unknown'}):`, {
        renderCount: renderCountRef.current,
        computationCount: computationCountRef.current,
        computationTime: computationTime.toFixed(2) + 'ms',
        depsChanged
      });

      // Warn about expensive computations
      if (computationTime > 50) {
        logger.warn('Performance', `Expensive computation in ${debugName || 'unknown'}: ${computationTime.toFixed(2)}ms`);
      }
    }

    return result;
  }, deps);

  lastDepsRef.current = deps;

  return memoizedValue;
}

/**
 * Memoization with size-based cache eviction
 */
export class MemoCache<K, V> {
  private cache = new Map<string, { value: V; timestamp: number; hitCount: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  private generateKey(args: K[]): string {
    return JSON.stringify(args);
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictLRU(): void {
    if (this.cache.size <= this.maxSize) return;

    // Find least recently used (lowest hitCount)
    let lruKey = '';
    let minHitCount = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < minHitCount) {
        minHitCount = entry.hitCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  get(args: K[]): V | undefined {
    this.evictExpired();
    
    const key = this.generateKey(args);
    const entry = this.cache.get(key);
    
    if (entry) {
      entry.hitCount++;
      return entry.value;
    }
    
    return undefined;
  }

  set(args: K[], value: V): void {
    this.evictExpired();
    this.evictLRU();
    
    const key = this.generateKey(args);
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hitCount: 1
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hitCount: entry.hitCount,
        age: Date.now() - entry.timestamp
      }))
    };
  }
}

/**
 * Hook for function memoization with cache
 */
export function useMemoizedFunction<Args extends any[], Return>(
  fn: (...args: Args) => Return,
  maxCacheSize = 50
) {
  const cacheRef = useRef(new MemoCache<Args[number], Return>(maxCacheSize));

  return useCallback((...args: Args): Return => {
    const cached = cacheRef.current.get(args);
    
    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);
    cacheRef.current.set(args, result);
    
    return result;
  }, [fn, maxCacheSize]);
}

/**
 * Selector memoization for complex state derivations
 */
export function createMemoizedSelector<State, Selected>(
  selector: (state: State) => Selected,
  equalityFn?: (a: Selected, b: Selected) => boolean
) {
  let lastState: State;
  let lastResult: Selected;

  const defaultEqualityFn = (a: Selected, b: Selected) => Object.is(a, b);
  const equalFn = equalityFn || defaultEqualityFn;

  return (state: State): Selected => {
    if (state === lastState) {
      return lastResult;
    }

    const newResult = selector(state);
    
    if (lastResult !== undefined && equalFn(lastResult, newResult)) {
      lastState = state;
      return lastResult;
    }

    lastState = state;
    lastResult = newResult;
    return newResult;
  };
}

/**
 * Deep equality comparison for complex objects
 */
export function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;

  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Shallow equality comparison for objects
 */
export function shallowEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => Object.is(a[key], b[key]));
}

/**
 * Hook for expensive computations with persistent cache
 */
export function usePersistentMemo<T>(
  factory: () => T,
  deps: DependencyList,
  cacheKey: string
): T {
  const cache = useMemo(() => {
    try {
      const stored = localStorage.getItem(`memo_${cacheKey}`);
      return stored ? JSON.parse(stored) : new Map();
    } catch {
      return new Map();
    }
  }, [cacheKey]);

  return useMemo(() => {
    const depsKey = JSON.stringify(deps);
    
    if (cache.has(depsKey)) {
      return cache.get(depsKey);
    }

    const result = factory();
    cache.set(depsKey, result);

    // Persist to localStorage (with size limit)
    try {
      if (cache.size > 10) {
        // Keep only the 10 most recent entries
        const entries = Array.from(cache.entries());
        const recent = entries.slice(-10);
        cache.clear();
        recent.forEach(([key, value]) => cache.set(key, value));
      }
      
      localStorage.setItem(`memo_${cacheKey}`, JSON.stringify(Array.from(cache.entries())));
    } catch (error) {
      logger.error('Performance', 'Failed to persist memo cache:', error);
    }

    return result;
  }, deps);
}