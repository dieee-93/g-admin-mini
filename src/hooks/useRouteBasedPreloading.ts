// useRouteBasedPreloading.ts - Intelligent route-based module preloading
// Preloads modules based on current location and navigation patterns

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { lazyLoadingManager } from '@/lib/performance/LazyLoadingManager';
import { modulePreloadingConfig } from '@/modules/lazy/LazyModules';

// Types for navigation patterns
type ModuleId = 'dashboard' | 'sales' | 'operations' | 'materials' | 'customers' | 'staff' | 'scheduling' | 'fiscal' | 'recipes' | 'settings';
type AffinityMap = Record<ModuleId, Record<string, number>>;
type PreloadPriority = 'high' | 'medium' | 'low';

interface NavigationPatterns {
  sequences: string[][];
  affinity: AffinityMap;
}

// Navigation patterns for predictive preloading
const NAVIGATION_PATTERNS: NavigationPatterns = {
  // Common navigation flows
  sequences: [
    ['dashboard', 'sales', 'operations'],
    ['dashboard', 'materials', 'sales'],
    ['sales', 'customers', 'sales'],
    ['materials', 'recipes', 'operations'],
    ['staff', 'scheduling', 'staff']
  ],
  
  // Module affinity (how likely users are to visit module B after A)
  affinity: {
    dashboard: { sales: 0.8, materials: 0.6, operations: 0.4, fiscal: 0.3 },
    sales: { operations: 0.9, fiscal: 0.8, customers: 0.7, materials: 0.5 },
    operations: { sales: 0.8, materials: 0.6, recipes: 0.4 },
    materials: { sales: 0.7, operations: 0.5, recipes: 0.3 },
    customers: { sales: 0.9, fiscal: 0.4, settings: 0.2 },
    staff: { scheduling: 0.8, settings: 0.3 },
    scheduling: { staff: 0.7 },
    fiscal: { sales: 0.9, settings: 0.5, materials: 0.3 },
    recipes: { materials: 0.6, operations: 0.5 },
    settings: { staff: 0.3, materials: 0.2, fiscal: 0.4 }
  }
} as const;

// Convert path to module ID
function pathToModuleId(path: string): string {
  if (path === '/') return 'dashboard';
  
  const segments = path.split('/').filter(Boolean);
  const moduleMap: Record<string, string> = {
    'materials': 'materials',
    'products': 'products', 
    'operations': 'operations', // operations maps to operations module
    'sales': 'sales',
    'customers': 'customers',
    'staff': 'staff',
    'scheduling': 'scheduling',
    'fiscal': 'fiscal',
    'settings': 'settings',
    'recipes': 'recipes'
  };
  
  return moduleMap[segments[0]] || 'dashboard';
}

// Track navigation history for pattern learning
let navigationHistory: string[] = [];
const MAX_HISTORY_SIZE = 20;

export function useRouteBasedPreloading() {
  const location = useLocation();
  
  const updateNavigationHistory = useCallback((currentModule: string) => {
    navigationHistory.push(currentModule);
    if (navigationHistory.length > MAX_HISTORY_SIZE) {
      navigationHistory = navigationHistory.slice(-MAX_HISTORY_SIZE);
    }
  }, []);
  
  const preloadByAffinity = useCallback((currentModule: string) => {
    // Type guard to ensure currentModule is a valid ModuleId
    if (!isValidModuleId(currentModule)) return;
    
    const affinityMap = NAVIGATION_PATTERNS.affinity[currentModule];
    if (!affinityMap) return;
    
    // Preload modules with high affinity scores
    Object.entries(affinityMap).forEach(([targetModule, score]) => {
      const numScore = Number(score);
      if (numScore > 0.6) {
        lazyLoadingManager.preloadModule(targetModule, 'high');
      } else if (numScore > 0.4) {
        lazyLoadingManager.preloadModule(targetModule, 'medium');
      } else if (numScore > 0.2) {
        lazyLoadingManager.preloadModule(targetModule, 'low');
      }
    });
  }, []);

  // Type guard function
  function isValidModuleId(module: string): module is ModuleId {
    return module in NAVIGATION_PATTERNS.affinity;
  }
  
  const preloadBySequencePattern = useCallback((currentModule: string) => {
    // Find sequences that contain the current module
    const relevantSequences = NAVIGATION_PATTERNS.sequences.filter(
      sequence => sequence.includes(currentModule)
    );
    
    relevantSequences.forEach(sequence => {
      const currentIndex = sequence.indexOf(currentModule);
      
      // Preload next modules in the sequence
      if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
        const nextModule = sequence[currentIndex + 1];
        lazyLoadingManager.preloadModule(nextModule, 'medium');
      }
    });
  }, []);
  
  const preloadByConfiguration = useCallback((currentModule: string) => {
    // Type guard for modulePreloadingConfig
    if (!isValidConfigKey(currentModule)) return;
    
    const config = modulePreloadingConfig[currentModule];
    if (!config) return;
    
    config.forEach(({ module, priority }: { module: string; priority: PreloadPriority }) => {
      lazyLoadingManager.preloadModule(module, priority);
    });
  }, []);

  // Type guard for modulePreloadingConfig
  function isValidConfigKey(key: string): key is keyof typeof modulePreloadingConfig {
    return key in modulePreloadingConfig;
  }
  
  const preloadByRecentHistory = useCallback(() => {
    // Analyze recent navigation patterns
    if (navigationHistory.length < 3) return;
    
    const recentHistory = navigationHistory.slice(-5);
    const moduleFrequency = new Map<string, number>();
    
    recentHistory.forEach(module => {
      moduleFrequency.set(module, (moduleFrequency.get(module) || 0) + 1);
    });
    
    // Preload frequently visited modules with low priority
    moduleFrequency.forEach((count, module) => {
      if (count >= 2) {
        lazyLoadingManager.preloadModule(module, 'low');
      }
    });
  }, []);
  
  // Time-based preloading (business hours patterns)
  const preloadByTimePattern = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Lunch rush (11 AM - 2 PM): prioritize sales and operations
    if (hour >= 11 && hour <= 14) {
      lazyLoadingManager.preloadModule('sales', 'high');
      lazyLoadingManager.preloadModule('operations', 'high');
    }
    
    // Dinner rush (6 PM - 9 PM): prioritize sales and operations
    else if (hour >= 18 && hour <= 21) {
      lazyLoadingManager.preloadModule('sales', 'high');
      lazyLoadingManager.preloadModule('operations', 'high');
    }
    
    // Morning prep (7 AM - 10 AM): prioritize materials and recipes
    else if (hour >= 7 && hour <= 10) {
      lazyLoadingManager.preloadModule('materials', 'medium');
      lazyLoadingManager.preloadModule('recipes', 'medium');
    }
    
    // Administrative hours (2 PM - 5 PM): prioritize staff and settings
    else if (hour >= 14 && hour <= 17) {
      lazyLoadingManager.preloadModule('staff', 'medium');
      lazyLoadingManager.preloadModule('settings', 'low');
    }
  }, []);
  
  // Main preloading effect
  useEffect(() => {
    const currentModule = pathToModuleId(location.pathname);
    
    // Update navigation history
    updateNavigationHistory(currentModule);
    
    // TEMPORARILY DISABLED: Too aggressive preloading
    // lazyLoadingManager.preloadPredictedModules(location.pathname);
    
    // Apply multiple preloading strategies with debouncing
    const preloadTimeout = setTimeout(() => {
      // TEMPORARILY DISABLED: Too aggressive preloading
      // preloadByConfiguration(currentModule);
      // preloadByAffinity(currentModule);
      // preloadBySequencePattern(currentModule);
      // preloadByRecentHistory();
      // preloadByTimePattern();
      
      // Only preload if explicitly configured
      if (currentModule === 'sales') {
        preloadByConfiguration(currentModule);
      }
    }, 100); // Debounce rapid navigation changes
    
    return () => clearTimeout(preloadTimeout);
  }, [location.pathname, updateNavigationHistory, preloadByAffinity, preloadBySequencePattern, 
      preloadByConfiguration, preloadByRecentHistory, preloadByTimePattern]);
  
  // Preload critical modules on app startup
  useEffect(() => {
    const startupPreload = setTimeout(() => {
      // TEMPORARILY DISABLED: Only preload sales if explicitly needed
      // lazyLoadingManager.preloadModule('sales', 'high');
      // preloadByTimePattern();
    }, 500); // Wait for initial render
    
    return () => clearTimeout(startupPreload);
  }, [preloadByTimePattern]);
  
  // Return utilities for manual control
  return {
    preloadModule: (moduleId: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
      lazyLoadingManager.preloadModule(moduleId, priority);
    },
    
    getNavigationHistory: () => [...navigationHistory],
    
    clearNavigationHistory: () => {
      navigationHistory = [];
    },
    
    getPreloadingRecommendations: () => {
      const currentModule = pathToModuleId(location.pathname);
      const recommendations: Array<{module: string; reason: string; priority: string}> = [];
      
      // Add affinity-based recommendations
      if (isValidModuleId(currentModule)) {
        const affinityMap = NAVIGATION_PATTERNS.affinity[currentModule];
        if (affinityMap) {
          Object.entries(affinityMap).forEach(([module, score]) => {
            const numScore = Number(score);
            if (numScore > 0.4) {
              recommendations.push({
                module,
                reason: `High user transition probability (${Math.round(numScore * 100)}%)`,
                priority: numScore > 0.6 ? 'high' : 'medium'
              });
            }
          });
        }
      }
      
      // Add configuration-based recommendations
      if (isValidConfigKey(currentModule)) {
        const config = modulePreloadingConfig[currentModule];
        if (config) {
          config.forEach(({ module, priority }) => {
            recommendations.push({
              module,
              reason: 'Configured preload relationship',
              priority
            });
          });
        }
      }
      
      return recommendations;
    }
  };
}

// Hook for monitoring preloading performance
export function usePreloadingMetrics() {
  const getMetrics = useCallback(() => {
    return lazyLoadingManager.getPerformanceMetrics();
  }, []);
  
  const getOptimizationRecommendations = useCallback(() => {
    return lazyLoadingManager.optimizeLoadingStrategy();
  }, []);
  
  return {
    getMetrics,
    getOptimizationRecommendations,
    getLoadingStats: lazyLoadingManager.getLoadingStats
  };
}