// codeSplitting.ts - Centralized code splitting configuration
import { lazy } from 'react';
import { createLazyRoute, createLazyFeature } from './lazyLoading';

// Configuration for large components that need splitting
export const CODE_SPLITTING_CONFIG = {
  // Size thresholds in KB
  LARGE_COMPONENT_THRESHOLD: 50,
  MEDIUM_COMPONENT_THRESHOLD: 25,
  
  // Chunk naming strategy
  CHUNK_NAMES: {
    MATERIALS: 'materials-page',
    ANALYTICS: 'cross-module-analytics', 
    EXECUTIVE: 'executive-dashboard',
    RECIPES: 'recipe-intelligence'
  },
  
  // Preload strategy
  PRELOAD_STRATEGY: {
    HIGH_PRIORITY: ['materials', 'sales'], // Load immediately
    MEDIUM_PRIORITY: ['analytics', 'executive'], // Load on interaction
    LOW_PRIORITY: ['recipes', 'settings'] // Load on demand only
  }
};

// Lazy-loaded large components with proper chunking
export const lazyComponents = {
  // Materials module (52KB split into chunks)
  OfflineMaterialsPage: createLazyRoute(
    () => import('@/modules/materials/components/LazyOfflineMaterialsPage'),
    CODE_SPLITTING_CONFIG.CHUNK_NAMES.MATERIALS
  ),
  
  MaterialsHeader: createLazyFeature(
    () => import('@/modules/materials/components/OfflineMaterialsPageHeader'),
    'materials-header'
  ),
  
  MaterialsGrid: createLazyFeature(
    () => import('@/modules/materials/components/MaterialsInventoryGrid'),
    'materials-grid'
  ),
  
  // Analytics module (56KB split into chunks) 
  CrossModuleAnalytics: createLazyRoute(
    () => import('@/modules/dashboard/components/business/LazyCrossModuleAnalytics'),
    CODE_SPLITTING_CONFIG.CHUNK_NAMES.ANALYTICS
  ),
  
  CorrelationsView: createLazyFeature(
    () => import('@/modules/dashboard/components/business/components/CorrelationsView'),
    'analytics-correlations'
  ),
  
  BottlenecksView: createLazyFeature(
    () => import('@/modules/dashboard/components/business/components/BottlenecksView'),
    'analytics-bottlenecks'
  ),
  
  // Executive dashboard (54KB split into chunks)
  ExecutiveDashboard: createLazyRoute(
    () => import('@/modules/dashboard/components/business/LazyExecutiveDashboard'),
    CODE_SPLITTING_CONFIG.CHUNK_NAMES.EXECUTIVE
  ),
  
  ExecutiveKPIGrid: createLazyFeature(
    () => import('@/modules/dashboard/components/business/components/ExecutiveKPIGrid'),
    'executive-kpis'
  ),
  
/*  
  // Recipe form (50KB split into chunks)
  RecipeForm: createLazyRoute(
    () => import('@/tools/intelligence/ui/LazyRecipeForm'),
    CODE_SPLITTING_CONFIG.CHUNK_NAMES.RECIPES
  ),
  
  RecipeBasicForm: createLazyFeature(
    () => import('@/tools/intelligence/ui/components/RecipeBasicForm'),
    'recipe-basic-form'
  ),
  
  RecipeAISuggestions: createLazyFeature(
    () => import('@/tools/intelligence/ui/components/RecipeAISuggestions'),
    'recipe-ai-suggestions'
  ) */
};

// Performance monitoring for code splitting
export class CodeSplittingMonitor {
  private static loadTimes = new Map<string, number[]>();
  private static chunkSizes = new Map<string, number>();
  
  static recordLoadTime(componentName: string, loadTime: number) {
    if (!this.loadTimes.has(componentName)) {
      this.loadTimes.set(componentName, []);
    }
    this.loadTimes.get(componentName)!.push(loadTime);
    
    // Log slow loads
    if (loadTime > 2000) {
      console.warn(`Slow code split load: ${componentName} took ${loadTime}ms`);
    }
  }
  
  static getAverageLoadTime(componentName: string): number {
    const times = this.loadTimes.get(componentName);
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  static recordChunkSize(chunkName: string, size: number) {
    this.chunkSizes.set(chunkName, size);
  }
  
  static getPerformanceReport() {
    const report = {
      loadTimes: Object.fromEntries(this.loadTimes),
      averageLoadTimes: {},
      chunkSizes: Object.fromEntries(this.chunkSizes),
      recommendations: [] as string[]
    };
    
    // Calculate averages
    for (const [component, times] of this.loadTimes) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      report.averageLoadTimes[component] = avgTime;
      
      // Generate recommendations
      if (avgTime > 3000) {
        report.recommendations.push(
          `Consider further splitting ${component} - average load time: ${avgTime.toFixed(0)}ms`
        );
      }
    }
    
    for (const [chunk, size] of this.chunkSizes) {
      if (size > 100 * 1024) { // 100KB
        report.recommendations.push(
          `Chunk ${chunk} is large (${(size / 1024).toFixed(1)}KB) - consider splitting further`
        );
      }
    }
    
    return report;
  }
}

// Helper function to create lazy components with monitoring
export function createMonitoredLazyComponent(
  importFn: () => Promise<any>,
  componentName: string,
  chunkName?: string
) {
  return lazy(async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      CodeSplittingMonitor.recordLoadTime(componentName, loadTime);
      
      return module;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      CodeSplittingMonitor.recordLoadTime(componentName, loadTime);
      throw error;
    }
  });
}

export default {
  lazyComponents,
  CODE_SPLITTING_CONFIG,
  CodeSplittingMonitor,
  createMonitoredLazyComponent
};