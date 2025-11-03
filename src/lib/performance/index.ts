// Performance Library Index - Advanced performance optimization suite
// Centralized exports for all performance-related utilities and components

// ===== CORE PERFORMANCE MANAGERS =====
export {
  LazyLoadingManager,
  lazyLoadingManager,
  createLazyComponent,
  preloadModule,
  getPerformanceMetrics
} from './LazyLoadingManager';

export {
  BundleOptimizer,
  bundleOptimizer,
  analyzeBundleSize,
  getChunkLoadStats,
  generateOptimizationReport
} from './BundleOptimizer';

// Internal imports for default export
import { lazyLoadingManager } from './LazyLoadingManager';
import { bundleOptimizer } from './BundleOptimizer';
import { LazyWrapper } from './components/LazyWrapper';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { VirtualizedList } from './virtualization/VirtualizedList';
import { useRouteBasedPreloading } from '../../hooks/useRouteBasedPreloading';
import { usePerformance } from './RuntimeOptimizations'; 
import { logger } from '@/lib/logging';
// ===== PERFORMANCE COMPONENTS =====
export {
  LazyWrapper,
  LazyFallback,
  LazyErrorBoundary,
  LazyLoadingMonitor,
  useLazyLoadingState
} from './components/LazyWrapper';

export { default as PerformanceDashboard } from './components/PerformanceDashboard';

// ===== VIRTUALIZATION =====
export {
  default as VirtualizedList,
  useVirtualizedList
} from './virtualization/VirtualizedList';

// ===== RUNTIME OPTIMIZATIONS =====
export {
  createAdvancedMemoizer,
  deepMemo,
  eventDelegation,
  PerformanceProvider,
  usePerformance,
  useOptimizedState,
  useDebouncedCallback,
  useThrottledCallback,
  withPerformance
} from './RuntimeOptimizations';

// ===== HOOKS =====
export {
  useRouteBasedPreloading,
  usePreloadingMetrics
} from '../../hooks/useRouteBasedPreloading';

// ===== LAZY MODULE SYSTEM =====
export {
  lazyModules,
  modulePreloadingConfig,
  moduleMetadata,
  LazySalesPage,
  LazyFulfillmentOnsitePage,
  LazyProductionPage,
  LazyMaterialsPage,
  LazyProductsPage,
  LazyStaffPage,
  LazyCustomersPage,
  LazySchedulingPage,
  LazyFiscalPage,
  LazySettingsPage
} from '../lazy';

// ===== PERFORMANCE TYPES =====
export interface PerformanceConfig {
  // Lazy loading configuration
  lazyLoading: {
    enabled: boolean;
    preloadStrategy: 'aggressive' | 'conservative' | 'smart';
    cacheStrategy: 'memory' | 'service-worker' | 'both';
    retryCount: number;
    timeout: number;
  };
  
  // Bundle optimization
  bundleOptimization: {
    treeshaking: boolean;
    codeSplitting: boolean;
    minification: boolean;
    compression: boolean;
  };
  
  // Runtime optimization
  runtime: {
    memoization: boolean;
    eventDelegation: boolean;
    virtualization: boolean;
    performanceMonitoring: boolean;
  };
  
  // Monitoring configuration
  monitoring: {
    enabled: boolean;
    metricsCollection: boolean;
    alerting: boolean;
    reporting: boolean;
  };
}

export interface PerformanceMetrics {
  // Loading metrics
  loadedModules: number;
  totalModules: number;
  averageLoadTime: number;
  cacheHitRate: number;
  errorRate: number;
  
  // Bundle metrics
  totalChunkSize: number;
  chunkCount: number;
  compressionRatio: number;
  
  // Runtime metrics
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  
  // Performance score
  overallScore: number;
  recommendations: string[];
}

export interface OptimizationRecommendation {
  type: 'bundle' | 'runtime' | 'loading' | 'memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  solution: string;
  estimatedImprovement: string;
}

// ===== CODE SPLITTING =====
export {
  lazyComponents,
  CODE_SPLITTING_CONFIG,
  CodeSplittingMonitor,
  createMonitoredLazyComponent
} from './codeSplitting';

// ===== PERFORMANCE UTILITIES =====

/**
 * Initialize performance monitoring system
 */
export function initializePerformanceSystem(config: Partial<PerformanceConfig> = {}) {
  const defaultConfig: PerformanceConfig = {
    lazyLoading: {
      enabled: true,
      preloadStrategy: 'smart',
      cacheStrategy: 'both',
      retryCount: 3,
      timeout: 10000
    },
    bundleOptimization: {
      treeshaking: true,
      codeSplitting: true,
      minification: true,
      compression: true
    },
    runtime: {
      memoization: true,
      eventDelegation: true,
      virtualization: true,
      performanceMonitoring: true
    },
    monitoring: {
      enabled: process.env.NODE_ENV === 'development',
      metricsCollection: true,
      alerting: true,
      reporting: true
    }
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  logger.info('Performance', '🚀 Performance system initialized with config:', finalConfig);
  
  return finalConfig;
}

/**
 * Generate comprehensive performance report
 */
export async function generatePerformanceReport(): Promise<{
  timestamp: number;
  metrics: PerformanceMetrics;
  recommendations: OptimizationRecommendation[];
  bundleAnalysis: any;
  runtimeAnalysis: any;
}> {
  const lazyMetrics = lazyLoadingManager.getPerformanceMetrics();
  const bundleAnalysis = await bundleOptimizer.analyzeBundlePerformance();
  const runtimeAnalysis = bundleOptimizer.monitorRuntimePerformance();
  
  // Calculate overall score
  let overallScore = 100;
  const recommendations: OptimizationRecommendation[] = [];
  
  // Lazy loading analysis
  if (lazyMetrics.averageLoadTime > 2000) {
    overallScore -= 20;
    recommendations.push({
      type: 'loading',
      severity: 'high',
      title: 'Slow Module Loading',
      description: 'Average module load time exceeds 2 seconds',
      impact: 'Poor user experience during navigation',
      solution: 'Implement more aggressive code splitting and preloading',
      estimatedImprovement: '30-50% reduction in perceived load time'
    });
  }
  
  if (lazyMetrics.errorRate > 0.1) {
    overallScore -= 30;
    recommendations.push({
      type: 'loading',
      severity: 'critical',
      title: 'High Module Loading Error Rate',
      description: 'More than 10% of module loads are failing',
      impact: 'Application functionality may be compromised',
      solution: 'Implement better error handling and retry mechanisms',
      estimatedImprovement: '90% reduction in loading errors'
    });
  }
  
  // Memory analysis
  if (runtimeAnalysis.memoryUsage > 50 * 1024 * 1024) {
    overallScore -= 15;
    recommendations.push({
      type: 'memory',
      severity: 'medium',
      title: 'High Memory Usage',
      description: 'Application is using more than 50MB of memory',
      impact: 'May cause performance issues on low-end devices',
      solution: 'Implement lazy loading and component cleanup',
      estimatedImprovement: '25-40% memory reduction'
    });
  }
  
  // Bundle size analysis  
  if (bundleAnalysis.totalSize > 1024 * 1024) {
    overallScore -= 10;
    recommendations.push({
      type: 'bundle',
      severity: 'medium',
      title: 'Large Bundle Size',
      description: 'Total bundle size exceeds 1MB',
      impact: 'Slower initial page loads, especially on slower connections',
      solution: 'Implement more aggressive code splitting and tree shaking',
      estimatedImprovement: '20-30% bundle size reduction'
    });
  }

  const metrics: PerformanceMetrics = {
    // Loading metrics
    loadedModules: 0, // Would be populated by runtime monitoring
    totalModules: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    
    // Bundle metrics
    totalChunkSize: bundleAnalysis.totalSize,
    chunkCount: bundleAnalysis.chunkCount,
    compressionRatio: bundleAnalysis.gzippedSize / bundleAnalysis.totalSize,
    
    // Runtime metrics
    renderCount: 0,
    averageRenderTime: runtimeAnalysis.renderTime,
    memoryUsage: runtimeAnalysis.memoryUsage,
    
    // Performance score
    overallScore: Math.max(0, overallScore),
    recommendations: recommendations.map(r => r.title)
  };

  return {
    timestamp: Date.now(),
    metrics,
    recommendations,
    bundleAnalysis,
    runtimeAnalysis
  };
}

/**
 * Performance monitoring helper for development
 */
export function createPerformanceMonitor() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  let startTime = performance.now();
  const measurements = new Map<string, number>();

  return {
    start: (label: string) => {
      measurements.set(label, performance.now());
    },
    
    end: (label: string) => {
      const start = measurements.get(label);
      if (start) {
        const duration = performance.now() - start;
        logger.info('Performance', `⏱️ ${label}: ${duration.toFixed(2)}ms`);
        measurements.delete(label);
        return duration;
      }
      return 0;
    },
    
    mark: (label: string) => {
      const now = performance.now();
      logger.info('Performance', `📍 ${label}: ${(now - startTime).toFixed(2)}ms`);
      return now - startTime;
    },
    
    reset: () => {
      startTime = performance.now();
      measurements.clear();
    }
  };
}

// ===== PERFORMANCE CONSTANTS =====
export const PERFORMANCE_THRESHOLDS = {
  LOADING: {
    FAST: 500,
    ACCEPTABLE: 1000,
    SLOW: 2000
  },
  MEMORY: {
    LOW: 10 * 1024 * 1024,    // 10MB
    MEDIUM: 25 * 1024 * 1024, // 25MB
    HIGH: 50 * 1024 * 1024    // 50MB
  },
  BUNDLE: {
    SMALL: 256 * 1024,        // 256KB
    MEDIUM: 512 * 1024,       // 512KB
    LARGE: 1024 * 1024        // 1MB
  },
  CACHE_HIT_RATE: {
    EXCELLENT: 0.9,
    GOOD: 0.8,
    FAIR: 0.6
  }
};

export default {
  // Managers
  lazyLoadingManager,
  bundleOptimizer,
  
  // Components
  LazyWrapper,
  PerformanceDashboard,
  VirtualizedList,
  
  // Hooks
  useRouteBasedPreloading,
  usePerformance,
  
  // Utilities
  initializePerformanceSystem,
  generatePerformanceReport,
  createPerformanceMonitor,
  
  // Constants
  PERFORMANCE_THRESHOLDS
};