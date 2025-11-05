// LazyLoadingManager.ts - Advanced Performance Management for G-Admin Mini
// Provides intelligent code splitting, lazy loading, and performance optimization

import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

import { logger } from '@/lib/logging';
// Performance monitoring interfaces
interface LoadingStats {
  module: string;
  loadTime: number;
  chunkSize?: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface PerformanceMetrics {
  totalModules: number;
  loadedModules: number;
  averageLoadTime: number;
  totalChunkSize: number;
  cacheHitRate: number;
  errorRate: number;
}

interface LazyLoadOptions {
  chunkName?: string;
  preload?: boolean;
  fallbackTimeout?: number;
  retryCount?: number;
  cacheStrategy?: 'memory' | 'service-worker' | 'both';
  priority?: 'high' | 'medium' | 'low';
}

// Module loading states
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error' | 'timeout';

interface ModuleLoadState {
  state: LoadingState;
  component?: ComponentType<any>;
  error?: Error;
  loadTime?: number;
  retryCount: number;
  lastAttempt: number;
}

export class LazyLoadingManager {
  private static instance: LazyLoadingManager;
  private loadingStats: LoadingStats[] = [];
  private moduleStates = new Map<string, ModuleLoadState>();
  private preloadCache = new Map<string, Promise<ComponentType<any>>>();
  private intersectionObserver?: IntersectionObserver;
  private performanceObserver?: PerformanceObserver;

  private constructor() {
    this.initializePerformanceMonitoring();
    this.initializeIntersectionObserver();
  }

  public static getInstance(): LazyLoadingManager {
    if (!LazyLoadingManager.instance) {
      LazyLoadingManager.instance = new LazyLoadingManager();
    }
    return LazyLoadingManager.instance;
  }

  /**
   * Create a lazy-loaded component with advanced options
   */
  public createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    moduleName: string,
    options: LazyLoadOptions = {}
  ): LazyExoticComponent<T> {
    const {
      chunkName = moduleName,
      preload = false,
      fallbackTimeout = 10000,
      retryCount = 3,
      cacheStrategy = 'both',
      priority = 'medium'
    } = options;

    // Initialize module state
    this.moduleStates.set(moduleName, {
      state: 'idle',
      retryCount: 0,
      lastAttempt: 0
    });

    // Enhanced import function with error handling and retries
    const enhancedImport = async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      const moduleState = this.moduleStates.get(moduleName)!;
      
      try {
        moduleState.state = 'loading';
        moduleState.lastAttempt = Date.now();

        // Check cache first
        const cachedComponent = this.getCachedComponent<T>(moduleName, cacheStrategy);
        if (cachedComponent) {
          const loadTime = performance.now() - startTime;
          this.recordLoadingStats(moduleName, loadTime, 0, true);
          moduleState.state = 'loaded';
          return { default: cachedComponent };
        }

        // Add timeout wrapper
        const importPromise = this.withTimeout(importFn(), fallbackTimeout);
        const result = await importPromise;
        
        const loadTime = performance.now() - startTime;
        
        // Cache the component
        this.cacheComponent(moduleName, result.default, cacheStrategy);
        
        // Record successful load
        this.recordLoadingStats(moduleName, loadTime, this.estimateChunkSize(result), true);
        
        moduleState.state = 'loaded';
        moduleState.component = result.default;
        moduleState.loadTime = loadTime;
        
        return result;
        
      } catch (error) {
        const loadTime = performance.now() - startTime;
        moduleState.retryCount++;
        
        // Retry logic with enhanced protection
        if (moduleState.retryCount < retryCount && this.shouldRetry(error as Error)) {
          logger.warn('Performance', `Retrying ${moduleName} load (attempt ${moduleState.retryCount + 1}/${retryCount})`);

          // Enhanced backoff to prevent tight loops
          const backoffDelay = Math.min(10000, 1000 * Math.pow(2, moduleState.retryCount)); // Max 10s
          await this.delay(backoffDelay);

          return enhancedImport();
        }
        
        // Record failed load
        this.recordLoadingStats(moduleName, loadTime, 0, false, (error as Error).message);
        moduleState.state = 'error';
        moduleState.error = error as Error;
        
        throw error;
      }
    };

    // Store import function for potential preloading (NOT executed immediately)
    const preloadPromise = () => enhancedImport().then(result => result.default);
    this.preloadCache.set(moduleName, preloadPromise);

    // Preload if requested
    if (preload) {
      this.preloadModule(moduleName, priority);
    }

    // 🔧 FIX: Cache the promise to prevent React.lazy() from creating new promises on every render
    // React.lazy() requires the SAME promise instance for the same module to avoid remounting
    let cachedModulePromise: Promise<{ default: T }> | null = null;

    // Create lazy component with enhanced import
    return lazy(() => {
      if (!cachedModulePromise) {
        cachedModulePromise = enhancedImport();
      }
      return cachedModulePromise;
    });
  }

  /**
   * Preload a module without rendering
   */
  public async preloadModule(moduleName: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    const preloadFunction = this.preloadCache.get(moduleName);
    if (!preloadFunction) {
      logger.warn('Performance', `Module ${moduleName} not found in preload cache`);
      return;
    }

    // Check if module is already loaded
    const moduleState = this.moduleStates.get(moduleName);
    if (moduleState && moduleState.state === 'loaded') {
      logger.info('Performance', `Module ${moduleName} already loaded`);
      return;
    }

    try {
      // Use requestIdleCallback for low priority preloads
      if (priority === 'low' && 'requestIdleCallback' in window) {
        return new Promise((resolve) => {
          requestIdleCallback(async () => {
            await (preloadFunction as () => Promise<any>)();
            resolve();
          });
        });
      }
      
      // For high/medium priority, load immediately
      await (preloadFunction as () => Promise<any>)();
      logger.info('Performance', `Module ${moduleName} preloaded successfully`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Performance', `Failed to preload module ${moduleName}: ${errorMessage}`);
    }
  }

  /**
   * Preload modules based on route predictions
   */
  public async preloadPredictedModules(currentRoute: string): Promise<void> {
    const predictions = this.getPredictedModules(currentRoute);
    
    const preloadPromises = predictions.map(({ module, priority }) => 
      this.preloadModule(module, priority)
    );
    
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Create intersection observer for viewport-based loading
   */
  public observeForLazyLoad(element: Element, callback: () => void): void {
    if (!this.intersectionObserver) {
      this.initializeIntersectionObserver();
    }
    
    const wrappedCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    };
    
    // Store callback reference for cleanup
    (element as any).__lazyLoadCallback = wrappedCallback;
    this.intersectionObserver?.observe(element);
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const stats = this.loadingStats;
    const successfulLoads = stats.filter(s => s.success);
    
    // Count unique modules that have been successfully loaded at least once
    const uniqueLoadedModules = new Set(successfulLoads.map(s => s.module)).size;
    
    // Count unique modules that have been registered (should match LazyModules.ts exports)
    const totalRegisteredModules = this.moduleStates.size;
    
    return {
      totalModules: totalRegisteredModules,
      loadedModules: uniqueLoadedModules,
      averageLoadTime: successfulLoads.reduce((sum, s) => sum + s.loadTime, 0) / successfulLoads.length || 0,
      totalChunkSize: stats.reduce((sum, s) => sum + (s.chunkSize || 0), 0),
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: (stats.length - successfulLoads.length) / stats.length || 0
    };
  }

  /**
   * Get loading statistics
   */
  public getLoadingStats(): LoadingStats[] {
    return [...this.loadingStats];
  }

  /**
   * Clear performance data
   */
  public clearPerformanceData(): void {
    this.loadingStats = [];
    this.moduleStates.clear();
    this.preloadCache.clear();
  }

  /**
   * Reset module state to allow fresh loading
   */
  public resetModuleState(moduleName: string): void {
    this.moduleStates.delete(moduleName);
    this.preloadCache.delete(moduleName);
    
    // Remove old stats for this module
    this.loadingStats = this.loadingStats.filter(stat => stat.module !== moduleName);
  }

  /**
   * Optimize bundle loading based on usage patterns
   */
  public optimizeLoadingStrategy(): {
    recommendations: string[];
    preloadCandidates: string[];
    splitCandidates: string[];
  } {
    const stats = this.loadingStats;
    const metrics = this.getPerformanceMetrics();
    
    const recommendations: string[] = [];
    const preloadCandidates: string[] = [];
    const splitCandidates: string[] = [];
    
    // Analyze loading patterns
    const moduleLoadCounts = new Map<string, number>();
    const moduleLoadTimes = new Map<string, number[]>();
    
    stats.forEach(stat => {
      const count = moduleLoadCounts.get(stat.module) || 0;
      moduleLoadCounts.set(stat.module, count + 1);
      
      const times = moduleLoadTimes.get(stat.module) || [];
      times.push(stat.loadTime);
      moduleLoadTimes.set(stat.module, times);
    });
    
    // Generate recommendations
    if (metrics.averageLoadTime > 2000) {
      recommendations.push('Consider code splitting for large modules');
    }
    
    if (metrics.errorRate > 0.1) {
      recommendations.push('Improve error handling and retry strategies');
    }
    
    if (metrics.cacheHitRate < 0.8) {
      recommendations.push('Enhance caching strategy');
    }
    
    // Find preload candidates (frequently accessed modules)
    moduleLoadCounts.forEach((count, module) => {
      if (count > 3) {
        preloadCandidates.push(module);
      }
    });
    
    // Find split candidates (large, slow-loading modules)
    moduleLoadTimes.forEach((times, module) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > 3000) {
        splitCandidates.push(module);
      }
    });
    
    return {
      recommendations,
      preloadCandidates,
      splitCandidates
    };
  }

  // Private methods

  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
            // Process performance entries
            console.debug('Performance entry:', entry);
          }
        });
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Performance', `Performance observer initialization failed: ${errorMessage}`);
      }
    }
  }

  private initializeIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const callback = (entry.target as any).__lazyLoadCallback;
              if (callback) {
                callback([entry]);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Module load timeout after ${timeoutMs}ms`)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(error: Error): boolean {
    // Don't retry syntax errors or import failures
    if (error.message.includes('Unexpected token') || 
        error.message.includes('Failed to fetch')) {
      return false;
    }
    return true;
  }

  private getCachedComponent<T extends ComponentType<any>>(
    moduleName: string,
    strategy: 'memory' | 'service-worker' | 'both'
  ): T | null {
    // Simple memory cache for now
    const moduleState = this.moduleStates.get(moduleName);
    return (moduleState?.component as T) || null;
  }

  private cacheComponent<T extends ComponentType<any>>(
    moduleName: string,
    component: T,
    strategy: 'memory' | 'service-worker' | 'both'
  ): void {
    const moduleState = this.moduleStates.get(moduleName);
    if (moduleState) {
      moduleState.component = component;
    }
  }

  private estimateChunkSize(moduleExport: unknown): number {
    // Simple estimation - in real implementation, this would use build-time data
    return JSON.stringify(moduleExport).length;
  }

  private recordLoadingStats(
    module: string,
    loadTime: number,
    chunkSize: number,
    success: boolean,
    error?: string
  ): void {
    // Check if we already have a recent successful load for this module
    const recentStats = this.loadingStats
      .filter(stat => stat.module === module && stat.success && stat.timestamp > Date.now() - 5000);
    
    // Don't record duplicate successful loads within 5 seconds
    if (success && recentStats.length > 0) {
      return;
    }

    this.loadingStats.push({
      module,
      loadTime,
      chunkSize,
      timestamp: Date.now(),
      success,
      error
    });
    
    // Keep only last 100 stats
    if (this.loadingStats.length > 100) {
      this.loadingStats = this.loadingStats.slice(-100);
    }
  }

  private calculateCacheHitRate(): number {
    // Simple cache hit rate calculation
    const totalRequests = this.loadingStats.length;
    const cacheHits = this.loadingStats.filter(stat => stat.loadTime < 100).length;
    return totalRequests > 0 ? cacheHits / totalRequests : 0;
  }

  private getPredictedModules(currentRoute: string): Array<{ module: string; priority: 'high' | 'medium' | 'low' }> {
    // Route-based predictions
    const predictions: Array<{ module: string; priority: 'high' | 'medium' | 'low' }> = [];
    
    switch (currentRoute) {
      case '/':
      case '/dashboard':
        predictions.push(
          { module: 'sales', priority: 'high' },
          { module: 'operations', priority: 'medium' },
          { module: 'materials', priority: 'low' }
        );
        break;
        
      case '/sales':
        predictions.push(
          { module: 'operations', priority: 'high' },
          { module: 'materials', priority: 'medium' },
          { module: 'customers', priority: 'low' }
        );
        break;
        
      case '/operations':
        predictions.push(
          { module: 'sales', priority: 'high' },
          { module: 'materials', priority: 'medium' }
        );
        break;
        
      case '/materials':
        predictions.push(
          { module: 'sales', priority: 'high' },
          { module: 'operations', priority: 'medium' }
        );
        break;
        
      case '/fiscal':
        predictions.push(
          { module: 'sales', priority: 'high' },
          { module: 'settings', priority: 'medium' }
        );
        break;
    }
    
    return predictions;
  }
}

// Global instance
export const lazyLoadingManager = LazyLoadingManager.getInstance();

// Utility functions
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  moduleName: string,
  options?: LazyLoadOptions
) => lazyLoadingManager.createLazyComponent(importFn, moduleName, options);

export const preloadModule = (moduleName: string, priority?: 'high' | 'medium' | 'low') =>
  lazyLoadingManager.preloadModule(moduleName, priority);

export const getPerformanceMetrics = () => lazyLoadingManager.getPerformanceMetrics();