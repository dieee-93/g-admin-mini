// Performance optimization types

export interface LazyComponentOptions {
  fallback?: React.ComponentType;
  delay?: number;
  retries?: number;
  preload?: boolean;
  chunkName?: string;
}

export interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
  estimateItemSize?: (index: number) => number;
}

export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
  componentCounts: Record<string, number>;
  largestContentfulPaint: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableMemoization: boolean;
  enableVirtualization: boolean;
  enableImageOptimization: boolean;
  enablePrefetching: boolean;
  bundleSplitting: {
    enabled: boolean;
    strategy: 'route' | 'feature' | 'vendor';
    maxChunks?: number;
  };
  caching: {
    enabled: boolean;
    strategy: 'memory' | 'localStorage' | 'sessionStorage';
    ttl: number;
  };
}

export interface ComponentPerformance {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  propsChanges: number;
  lastRender: Date;
}

export interface BundleChunk {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  async: boolean;
}

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
}

export interface PrefetchOptions {
  priority: 'high' | 'low';
  strategy: 'visible' | 'hover' | 'immediate';
  delay?: number;
  conditions?: () => boolean;
}