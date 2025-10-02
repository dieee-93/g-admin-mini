// BundleOptimizer.ts - Advanced bundle optimization and analysis
// Provides build-time and runtime optimization recommendations

import { logger } from '@/lib/logging';

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  moduleCount: number;
  chunkCount: number;
  duplicateModules: string[];
  unusedExports: string[];
  largestModules: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  optimization: {
    treeshaking: boolean;
    minification: boolean;
    compression: boolean;
    codeSplitting: boolean;
  };
  recommendations: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  modules: string[];
  async: boolean;
  loadTime?: number;
  cacheHit?: boolean;
}

export class BundleOptimizer {
  private static instance: BundleOptimizer;
  private performanceEntries = new Map<string, PerformanceEntry>();
  private chunkLoadTimes = new Map<string, number>();

  private constructor() {
    this.initializePerformanceMonitoring();
  }

  public static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }

  /**
   * Initialize performance monitoring for bundle analysis
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource' && entry.name.includes('.js')) {
              this.performanceEntries.set(entry.name, entry);
              
              // Track chunk load times
              const chunkMatch = entry.name.match(/chunk[.-]([a-zA-Z0-9]+)/);
              if (chunkMatch) {
                this.chunkLoadTimes.set(chunkMatch[1], entry.duration || 0);
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        logger.error('Performance', 'Performance observer initialization failed:', error);
      }
    }
  }

  /**
   * Analyze current bundle performance
   */
  public async analyzeBundlePerformance(): Promise<BundleAnalysis> {
    const performanceEntries = Array.from(this.performanceEntries.values());
    const jsEntries = performanceEntries.filter(entry => 
      entry.name.includes('.js') && !entry.name.includes('hot-update')
    );

    // Calculate total bundle size (approximation)
    const totalSize = jsEntries.reduce((sum, entry) => {
      const size = (entry as any).transferSize || 0;
      return sum + size;
    }, 0);

    // Find largest modules
    const largestModules = jsEntries
      .map(entry => ({
        name: this.extractModuleName(entry.name),
        size: (entry as any).transferSize || 0,
        percentage: totalSize > 0 ? ((entry as any).transferSize || 0) / totalSize * 100 : 0
      }))
      .filter(module => module.size > 0)
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(largestModules, totalSize);

    return {
      totalSize,
      gzippedSize: totalSize * 0.3, // Approximation
      moduleCount: jsEntries.length,
      chunkCount: this.chunkLoadTimes.size,
      duplicateModules: await this.findDuplicateModules(),
      unusedExports: [], // Would need build-time analysis
      largestModules,
      optimization: {
        treeshaking: true, // Assume modern bundler
        minification: !jsEntries.some(e => e.name.includes('.dev.')),
        compression: true,
        codeSplitting: this.chunkLoadTimes.size > 1
      },
      recommendations
    };
  }

  /**
   * Generate optimization recommendations based on analysis
   */
  private generateOptimizationRecommendations(
    largestModules: Array<{ name: string; size: number; percentage: number }>,
    totalSize: number
  ): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    if (totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Total bundle size is large (>1MB). Consider aggressive code splitting.');
    }

    // Large module recommendations
    largestModules.forEach(module => {
      if (module.percentage > 15) {
        recommendations.push(`Module "${module.name}" is ${module.percentage.toFixed(1)}% of bundle. Consider lazy loading or tree shaking.`);
      }
    });

    // Chunk recommendations
    if (this.chunkLoadTimes.size < 3) {
      recommendations.push('Consider implementing more granular code splitting for better caching.');
    }

    // Performance recommendations
    const slowChunks = Array.from(this.chunkLoadTimes.entries())
      .filter(([_, time]) => time > 1000);
    
    if (slowChunks.length > 0) {
      recommendations.push(`${slowChunks.length} chunks are loading slowly (>1s). Consider preloading or optimization.`);
    }

    return recommendations;
  }

  /**
   * Find potential duplicate modules (heuristic approach)
   */
  private async findDuplicateModules(): Promise<string[]> {
    const moduleNames = Array.from(this.performanceEntries.keys())
      .map(name => this.extractModuleName(name));
    
    const nameCounts = new Map<string, number>();
    moduleNames.forEach(name => {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    });

    return Array.from(nameCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([name, _]) => name);
  }

  /**
   * Extract module name from URL
   */
  private extractModuleName(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.(js|ts|tsx?)(\?.*)?$/, '');
  }

  /**
   * Get chunk loading statistics
   */
  public getChunkStatistics(): Array<ChunkInfo> {
    const stats: Array<ChunkInfo> = [];
    
    this.chunkLoadTimes.forEach((loadTime, chunkId) => {
      const entry = Array.from(this.performanceEntries.values())
        .find(e => e.name.includes(chunkId));
        
      stats.push({
        name: chunkId,
        size: (entry as any)?.transferSize || 0,
        modules: [], // Would need build-time analysis
        async: true,
        loadTime,
        cacheHit: loadTime < 50 // Heuristic for cache hits
      });
    });

    return stats.sort((a, b) => b.loadTime! - a.loadTime!);
  }

  /**
   * Optimize chunk loading order
   */
  public optimizeChunkLoadingOrder(chunks: string[]): string[] {
    const chunkPriorities = new Map<string, number>();
    
    // Priority based on historical load times and usage patterns
    chunks.forEach(chunk => {
      const loadTime = this.chunkLoadTimes.get(chunk) || 1000;
      const priority = loadTime < 100 ? 3 : loadTime < 500 ? 2 : 1;
      chunkPriorities.set(chunk, priority);
    });

    return chunks.sort((a, b) => {
      const priorityA = chunkPriorities.get(a) || 1;
      const priorityB = chunkPriorities.get(b) || 1;
      return priorityB - priorityA;
    });
  }

  /**
   * Generate webpack bundle analyzer report
   */
  public generateWebpackReport(): {
    command: string;
    description: string;
    visualizerUrl?: string;
  } {
    const isDev = process.env.NODE_ENV === 'development';
    
    return {
      command: isDev 
        ? 'npm run build -- --analyze' 
        : 'npx webpack-bundle-analyzer build/static/js/*.js',
      description: 'Run webpack bundle analyzer to visualize bundle composition',
      visualizerUrl: isDev ? 'http://127.0.0.1:8888' : undefined
    };
  }

  /**
   * Monitor runtime performance and suggest optimizations
   */
  public monitorRuntimePerformance(): {
    memoryUsage: number;
    renderTime: number;
    jsHeapSize: number;
    recommendations: string[];
  } {
    const nav = performance as any;
    const memory = nav.memory || {};
    
    const memoryUsage = memory.usedJSHeapSize || 0;
    const jsHeapSize = memory.totalJSHeapSize || 0;
    
    // Measure render time using performance timing
    const renderTime = nav.timing ? 
      nav.timing.loadEventEnd - nav.timing.navigationStart : 0;

    const recommendations: string[] = [];

    // Memory recommendations
    if (memoryUsage > 50 * 1024 * 1024) { // > 50MB
      recommendations.push('High memory usage detected. Consider lazy loading or component cleanup.');
    }

    // Render time recommendations  
    if (renderTime > 3000) { // > 3s
      recommendations.push('Slow initial render. Consider skeleton loading and code splitting.');
    }

    return {
      memoryUsageTime,
      jsHeapSize,
      recommendations
    };
  }

  /**
   * Get performance metrics with cache hit rate
   */
  public getPerformanceMetrics(): {
    cacheHitRate: number;
    memoryUsage: number;
    loadTime: number;
    chunkCount: number;
  } {
    const runtime = this.monitorRuntimePerformance();
    const chunks = this.getChunkStatistics();
    
    // Estimate cache hit rate based on chunk loading patterns
    const cacheHitRate = chunks.length > 0 
      ? Math.max(0, 1 - (chunks.filter(c => c.loadTime > 1000).length / chunks.length))
      : 0.8; // Default to 80% if no data
    
    const avgLoadTime = chunks.length > 0 
      ? chunks.reduce((sum, chunk) => sum + chunk.loadTime, 0) / chunks.length
      : 0;
    
    return {
      cacheHitRate,
      memoryUsage: runtime.memoryUsage,
      loadTime: avgLoadTime,
      chunkCount: chunks.length
    };
  }

  /**
   * Export performance data for external analysis
   */
  public exportPerformanceData(): {
    timestamp: number;
    bundleAnalysis: Promise<BundleAnalysis>;
    chunkStatistics: Array<ChunkInfo>;
    runtimePerformance: ReturnType<typeof this.monitorRuntimePerformance>;
  } {
    return {
      timestamp: Date.now(),
      bundleAnalysis: this.analyzeBundlePerformance(),
      chunkStatistics: this.getChunkStatistics(),
      runtimePerformance: this.monitorRuntimePerformance()
    };
  }
}

// Global instance
export const bundleOptimizer = BundleOptimizer.getInstance();

// Utility functions
export function analyzeBundleSize() {
  return bundleOptimizer.analyzeBundlePerformance();
}

export function getChunkLoadStats() {
  return bundleOptimizer.getChunkStatistics();
}

export function generateOptimizationReport() {
  return bundleOptimizer.exportPerformanceData();
}