// RuntimeOptimizations.tsx - Advanced runtime performance optimizations
// Provides memoization, event delegation, and performance monitoring utilities

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect,
  useState,
  createContext,
  useContext
} from 'react';

// ===== ADVANCED MEMOIZATION UTILITIES =====

interface MemoizeOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  serialize?: (args: any[]) => string;
}

/**
 * Advanced memoization with TTL and LRU cache
 */
export function createAdvancedMemoizer<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const {
    maxSize = 100,
    ttl = 5 * 60 * 1000, // 5 minutes default
    serialize = JSON.stringify
  } = options;

  const cache = new Map<string, { value: ReturnType<T>; timestamp: number; hits: number }>();
  const accessOrder = new Map<string, number>();
  let accessCounter = 0;

  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = serialize(args);
    const now = Date.now();
    
    // Check if cached value exists and is still valid
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < ttl) {
      // Update access order for LRU
      cached.hits++;
      accessOrder.set(key, ++accessCounter);
      return cached.value;
    }

    // Compute new value
    const value = fn(...args);
    
    // Store in cache
    cache.set(key, { value, timestamp: now, hits: 1 });
    accessOrder.set(key, ++accessCounter);
    
    // Evict oldest entries if cache is full
    if (cache.size > maxSize) {
      const oldestKey = Array.from(accessOrder.entries())
        .sort((a, b) => a[1] - b[1])[0][0];
      cache.delete(oldestKey);
      accessOrder.delete(oldestKey);
    }
    
    return value;
  }) as T;

  // Add cache introspection methods
  (memoized as any).cache = {
    size: () => cache.size,
    clear: () => {
      cache.clear();
      accessOrder.clear();
      accessCounter = 0;
    },
    stats: () => {
      const stats = Array.from(cache.entries()).map(([key, data]) => ({
        key,
        hits: data.hits,
        age: Date.now() - data.timestamp
      }));
      return stats.sort((a, b) => b.hits - a.hits);
    }
  };

  return memoized;
}

/**
 * Enhanced React.memo with deep comparison options
 */
export function deepMemo<T extends React.ComponentType<any>>(
  Component: T,
  compareDepth: number = 2
): T {
  const deepEqual = (a: any, b: any, depth: number): boolean => {
    if (depth <= 0) return a === b;
    if (a === b) return true;
    if (!a || !b) return false;
    
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;
    
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index], depth - 1));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key], depth - 1));
  };

  return memo(Component, (prevProps, nextProps) => {
    return deepEqual(prevProps, nextProps, compareDepth);
  }) as unknown as T;
}

// ===== EVENT DELEGATION SYSTEM =====

class EventDelegationManager {
  private static instance: EventDelegationManager;
  private delegatedEvents = new Map<string, Map<string, (event: Event) => void>>();
  private rootElement: HTMLElement | null = null;

  static getInstance(): EventDelegationManager {
    if (!EventDelegationManager.instance) {
      EventDelegationManager.instance = new EventDelegationManager();
    }
    return EventDelegationManager.instance;
  }

  initialize(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    if (!this.rootElement) return;

    const eventTypes = ['click', 'change', 'input', 'keydown', 'mouseover', 'mouseout'];
    
    eventTypes.forEach(eventType => {
      this.rootElement!.addEventListener(eventType, (_event) => {
        this.handleDelegatedEvent(eventType, event);
      }, true);
    });
  }

  private handleDelegatedEvent(eventType: string, event: Event) {
    const eventMap = this.delegatedEvents.get(eventType);
    if (!eventMap) return;

    let target = event.target as HTMLElement | null;
    
    while (target && target !== this.rootElement) {
      const selector = target.dataset.delegate || target.className;
      const handler = eventMap.get(selector);
      
      if (handler) {
        handler(event);
        if (event.defaultPrevented) break;
      }
      
      target = target.parentElement;
    }
  }

  addDelegate(eventType: string, selector: string, handler: (event: Event) => void) {
    if (!this.delegatedEvents.has(eventType)) {
      this.delegatedEvents.set(eventType, new Map());
    }
    
    this.delegatedEvents.get(eventType)!.set(selector, handler);
  }

  removeDelegate(eventType: string, selector: string) {
    this.delegatedEvents.get(eventType)?.delete(selector);
  }
}

export const eventDelegation = EventDelegationManager.getInstance();

// ===== PERFORMANCE MONITORING CONTEXT =====

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  reRenderCauses: string[];
  componentMountTime: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  startMeasurement: (name: string) => void;
  endMeasurement: (name: string) => number;
  recordRender: (componentName: string, time: number) => void;
  getComponentStats: (componentName: string) => {
    renders: number;
    averageTime: number;
    lastRenderTime: number;
  } | null;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);
PerformanceContext.displayName = 'PerformanceContext';

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    reRenderCauses: [],
    componentMountTime: 0
  });

  const measurements = useRef(new Map<string, number>());
  const componentStats = useRef(new Map<string, {
    renders: number;
    totalTime: number;
    lastRenderTime: number;
  }>());

  const startMeasurement = useCallback((name: string) => {
    measurements.current.set(name, performance.now());
  }, []);

  const endMeasurement = useCallback((name: string): number => {
    const startTime = measurements.current.get(name);
    if (!startTime) return 0;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    measurements.current.delete(name);
    
    return duration;
  }, []);

  const recordRender = useCallback((componentName: string, time: number) => {
    const stats = componentStats.current.get(componentName) || {
      renders: 0,
      totalTime: 0,
      lastRenderTime: 0
    };

    stats.renders++;
    stats.totalTime += time;
    stats.lastRenderTime = time;

    componentStats.current.set(componentName, stats);

    // Update global metrics - throttled to prevent infinite loops
    if (stats.renders % 5 === 0 || time > 100) {
      setMetrics(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        averageRenderTime: prev.renderCount > 0 
          ? (prev.averageRenderTime * (prev.renderCount - 1) + time) / prev.renderCount
          : time
      }));
    }
  }, []);

  const getComponentStats = useCallback((componentName: string) => {
    const stats = componentStats.current.get(componentName);
    if (!stats) return null;

    return {
      renders: stats.renders,
      averageTime: stats.totalTime / stats.renders,
      lastRenderTime: stats.lastRenderTime
    };
  }, []);

  // Monitor memory usage periodically
  useEffect(() => {
    let lastMemoryUsage = 0;
    
    const interval = setInterval(() => {
      const nav = performance as any;
      const memory = nav.memory;
      
      if (memory) {
        const currentMemory = memory.usedJSHeapSize;
        // Only update if significant change (>1MB) to prevent infinite loops
        if (Math.abs(currentMemory - lastMemoryUsage) > 1024 * 1024) {
          lastMemoryUsage = currentMemory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: currentMemory
          }));
        }
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const contextValue: PerformanceContextType = {
    metrics,
    startMeasurement,
    endMeasurement,
    recordRender,
    getComponentStats
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// ===== PERFORMANCE-OPTIMIZED HOOKS =====

/**
 * Optimized useState with batching and change detection
 */
export function useOptimizedState<T>(
  initialValue: T,
  equalityFn?: (prev: T, next: T) => boolean
) {
  const [state, setState] = useState(initialValue);
  const equalityCheck = equalityFn || Object.is;

  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      
      return equalityCheck(prev, nextValue) ? prev : nextValue;
    });
  }, [equalityCheck]);

  return [state, optimizedSetState] as const;
}

/**
 * Debounced callback with automatic cleanup
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Throttled callback with leading/trailing options
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  const { leading = true, trailing = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    lastArgsRef.current = args;

    const timeSinceLastCall = now - lastCallTimeRef.current;

    if (timeSinceLastCall >= delay) {
      if (leading) {
        lastCallTimeRef.current = now;
        callback(...args);
      }
    } else {
      if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallTimeRef.current = Date.now();
          callback(...(lastArgsRef.current!));
        }, delay - timeSinceLastCall);
      }
    }
  }, [callback, delay, leading, trailing]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// ===== COMPONENT PERFORMANCE WRAPPER =====

interface WithPerformanceProps {
  componentName?: string;
  enableProfiling?: boolean;
}

export function withPerformance<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const PerformanceWrapper = memo((props: P & WithPerformanceProps) => {
    const { enableProfiling = process.env.NODE_ENV === 'development', ...componentProps } = props;
    const performance = usePerformance();
    const renderStartTime = useRef<number>(0);

    useEffect(() => {
      if (enableProfiling) {
        renderStartTime.current = window.performance.now();
      }
    });

    useEffect(() => {
      if (enableProfiling && renderStartTime.current) {
        const renderTime = window.performance.now() - renderStartTime.current;
        performance.recordRender(componentName || Component.name || 'Unknown', renderTime);
      }
    });

    return <Component {...(componentProps as P)} />;
  });

  PerformanceWrapper.displayName = `withPerformance(${componentName || Component.name})`;
  
  return PerformanceWrapper;
}

export default {
  createAdvancedMemoizer,
  deepMemo,
  eventDelegation,
  PerformanceProvider,
  usePerformance,
  useOptimizedState,
  useDebouncedCallback,
  useThrottledCallback,
  withPerformance
};