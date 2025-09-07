import { lazy, Suspense, useEffect, useState, ComponentType, ReactNode } from 'react';
import { Box, Skeleton, VStack } from '@chakra-ui/react';
import { LazyComponentOptions } from './types';
import { errorHandler } from '@/lib/error-handling';

/**
 * Enhanced lazy loading wrapper with error boundaries and retries
 */
export class LazyComponentWrapper {
  private static loadedComponents = new Set<string>();
  private static loadingComponents = new Map<string, Promise<any>>();

  static create<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
  ): ComponentType<any> {
    const {
      fallback: CustomFallback,
      delay = 0,
      retries = 3,
      preload = false,
      chunkName = 'unknown'
    } = options;

    // Create lazy component with retry logic
    const LazyComponent = lazy(() => {
      return this.loadWithRetry(importFn, retries, chunkName);
    });

    // Preload if requested
    if (preload && typeof window !== 'undefined') {
      this.preloadComponent(importFn, chunkName);
    }

    // Return wrapped component
    return (props: unknown) => {
      const [showFallback, setShowFallback] = useState(delay > 0);

      useEffect(() => {
        if (delay > 0) {
          const timer = setTimeout(() => setShowFallback(false), delay);
          return () => clearTimeout(timer);
        }
      }, []);

      if (showFallback) {
        return CustomFallback ? <CustomFallback /> : <DefaultFallback />;
      }

      return (
        <Suspense fallback={CustomFallback ? <CustomFallback /> : <DefaultFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      );
    };
  }

  private static async loadWithRetry<T>(
    importFn: () => Promise<{ default: T }>,
    retries: number,
    chunkName: string
  ): Promise<{ default: T }> {
    const cacheKey = chunkName;
    
    // Check if already loaded
    if (this.loadedComponents.has(cacheKey)) {
      return importFn();
    }

    // Check if currently loading
    if (this.loadingComponents.has(cacheKey)) {
      return this.loadingComponents.get(cacheKey)!;
    }

    // Start loading with retry logic
    const loadPromise = this.attemptLoad(importFn, retries, chunkName);
    this.loadingComponents.set(cacheKey, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedComponents.add(cacheKey);
      this.loadingComponents.delete(cacheKey);
      return result;
    } catch (error) {
      this.loadingComponents.delete(cacheKey);
      throw error;
    }
  }

  private static async attemptLoad<T>(
    importFn: () => Promise<{ default: T }>,
    retries: number,
    chunkName: string
  ): Promise<{ default: T }> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const startTime = performance.now();
        const result = await importFn();
        const loadTime = performance.now() - startTime;

        // Log performance metrics
        console.log(`Lazy loaded ${chunkName} in ${loadTime.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const isLastAttempt = attempt === retries;
        
        if (isLastAttempt) {
          errorHandler.handle(error as Error, {
            operation: 'lazyLoad',
            chunkName,
            attempt,
            totalAttempts: retries
          });
          throw new Error(`Failed to load component ${chunkName} after ${retries} attempts`);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    throw new Error(`Unexpected error loading ${chunkName}`);
  }

  private static preloadComponent(importFn: () => Promise<any>, chunkName: string): void {
    // Preload during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().catch(error => {
          console.warn(`Preload failed for ${chunkName}:`, error);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFn().catch(error => {
          console.warn(`Preload failed for ${chunkName}:`, error);
        });
      }, 0);
    }
  }

  /**
   * Preload multiple components
   */
  static preloadComponents(imports: Array<{ importFn: () => Promise<any>; chunkName: string }>): void {
    imports.forEach(({ importFn, chunkName }) => {
      this.preloadComponent(importFn, chunkName);
    });
  }

  /**
   * Get loading statistics
   */
  static getStats() {
    return {
      loaded: Array.from(this.loadedComponents),
      loading: Array.from(this.loadingComponents.keys())
    };
  }
}

/**
 * HOC for lazy loading components
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: LazyComponentOptions = {}
): ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const LazyComponent = LazyComponentWrapper.create(
    () => Promise.resolve({ default: Component }),
    { ...options, chunkName: displayName }
  );

  LazyComponent.displayName = `withLazyLoading(${displayName})`;
  return LazyComponent;
}

/**
 * Default fallback component
 */
const DefaultFallback = () => (
  <Box p={4}>
    <VStack gap={3}>
      <Skeleton height="40px" width="100%" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="20px" width="60%" />
    </VStack>
  </Box>
);

/**
 * Route-based code splitting helper
 */
export const createLazyRoute = (
  importFn: () => Promise<any>,
  chunkName?: string
) => {
  return LazyComponentWrapper.create(importFn, {
    chunkName: chunkName || 'route',
    preload: false,
    retries: 3,
    fallback: () => (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minH="400px"
      >
        <VStack gap={4}>
          <Skeleton height="60px" width="300px" />
          <Skeleton height="40px" width="200px" />
          <Skeleton height="40px" width="250px" />
        </VStack>
      </Box>
    )
  });
};

/**
 * Feature-based code splitting
 */
export const createLazyFeature = (
  importFn: () => Promise<any>,
  featureName: string
) => {
  return LazyComponentWrapper.create(importFn, {
    chunkName: `feature-${featureName}`,
    preload: true, // Features can be preloaded
    retries: 2,
    fallback: () => (
      <Box p={6} textAlign="center">
        <VStack gap={3}>
          <Skeleton height="30px" width="200px" />
          <Skeleton height="15px" width="300px" />
          <Skeleton height="15px" width="250px" />
        </VStack>
      </Box>
    )
  });
};

/**
 * Hook for component preloading
 */
export function useComponentPreloader() {
  const preload = (importFn: () => Promise<any>, priority: 'high' | 'low' = 'low') => {
    const delay = priority === 'high' ? 0 : 2000;
    
    setTimeout(() => {
      LazyComponentWrapper.preloadComponent(importFn, 'preloaded');
    }, delay);
  };

  const preloadOnHover = (importFn: () => Promise<any>) => {
    return {
      onMouseEnter: () => preload(importFn, 'high'),
      onTouchStart: () => preload(importFn, 'high')
    };
  };

  const preloadOnVisible = (importFn: () => Promise<any>, threshold = 0.1) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            preload(importFn, 'high');
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    return (element: Element | null) => {
      if (element) {
        observer.observe(element);
      }
    };
  };

  return {
    preload,
    preloadOnHover,
    preloadOnVisible
  };
}