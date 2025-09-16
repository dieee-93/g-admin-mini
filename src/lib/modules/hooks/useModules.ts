/**
 * Module System Hooks for G-Admin v3.0
 * React hooks for module management and dynamic loading
 * Based on 2024 React patterns and module federation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getModuleRegistry } from '../ModuleRegistry';
import { getModuleLoader } from '../ModuleLoader';
import { useCapabilities } from '../../capabilities/hooks/useCapabilities';
import type {
  ModuleInterface,
  ModuleRegistryEntry,
  ModuleLoadingState,
  ModuleResolutionResult,
  ModuleHealthCheck
} from '../types/ModuleTypes';

/**
 * Hook for accessing the module registry
 */
export const useModuleRegistry = () => {
  const registry = getModuleRegistry();
  const [registryVersion, setRegistryVersion] = useState(0);

  // Force re-render when registry changes
  useEffect(() => {
    const handleChange = () => setRegistryVersion(v => v + 1);

    registry.on('module:registered', handleChange);
    registry.on('module:unregistered', handleChange);
    registry.on('module:loaded', handleChange);
    registry.on('module:activated', handleChange);
    registry.on('module:deactivated', handleChange);

    return () => {
      registry.off('module:registered', handleChange);
      registry.off('module:unregistered', handleChange);
      registry.off('module:loaded', handleChange);
      registry.off('module:activated', handleChange);
      registry.off('module:deactivated', handleChange);
    };
  }, [registry]);

  const getAllModules = useCallback(() => {
    return registry.getAllModules();
  }, [registry, registryVersion]);

  const getModule = useCallback((moduleId: string) => {
    return registry.getModule(moduleId);
  }, [registry, registryVersion]);

  const getEntry = useCallback((moduleId: string) => {
    return registry.getEntry(moduleId);
  }, [registry, registryVersion]);

  const isLoaded = useCallback((moduleId: string) => {
    return registry.isLoaded(moduleId);
  }, [registry, registryVersion]);

  const isActive = useCallback((moduleId: string) => {
    return registry.isActive(moduleId);
  }, [registry, registryVersion]);

  return {
    getAllModules,
    getModule,
    getEntry,
    isLoaded,
    isActive,
    registry
  };
};

/**
 * Hook for loading modules dynamically
 */
export const useModuleLoader = () => {
  const loader = getModuleLoader();
  const registry = getModuleRegistry();
  const [loadingStates, setLoadingStates] = useState<Record<string, ModuleLoadingState>>({});

  // Track loading states
  useEffect(() => {
    const updateLoadingState = (moduleId: string, state: ModuleLoadingState) => {
      setLoadingStates(prev => ({ ...prev, [moduleId]: state }));
    };

    registry.on('module:loading', (moduleId) => updateLoadingState(moduleId, 'loading'));
    registry.on('module:loaded', (moduleId) => updateLoadingState(moduleId, 'loaded'));
    registry.on('module:error', (moduleId) => updateLoadingState(moduleId, 'error'));

    return () => {
      registry.off('module:loading', updateLoadingState);
      registry.off('module:loaded', updateLoadingState);
      registry.off('module:error', updateLoadingState);
    };
  }, [registry]);

  const loadModule = useCallback(async (moduleId: string) => {
    return loader.loadModule(moduleId);
  }, [loader]);

  const loadModules = useCallback(async (moduleIds: string[]) => {
    return loader.loadModules(moduleIds);
  }, [loader]);

  const preloadModules = useCallback(async (moduleIds: string[]) => {
    return loader.preloadModules(moduleIds);
  }, [loader]);

  const unloadModule = useCallback(async (moduleId: string) => {
    return loader.unloadModule(moduleId);
  }, [loader]);

  const getLoadingState = useCallback((moduleId: string): ModuleLoadingState => {
    return loadingStates[moduleId] || 'idle';
  }, [loadingStates]);

  const isModuleLoading = useCallback((moduleId: string): boolean => {
    return getLoadingState(moduleId) === 'loading';
  }, [getLoadingState]);

  return {
    loadModule,
    loadModules,
    preloadModules,
    unloadModule,
    getLoadingState,
    isModuleLoading,
    loadingStates
  };
};

/**
 * Hook for a specific module
 */
export const useModule = (moduleId: string) => {
  const { getModule, getEntry, isLoaded, isActive } = useModuleRegistry();
  const { loadModule, getLoadingState } = useModuleLoader();
  const [instance, setInstance] = useState<any>(null);

  const module = getModule(moduleId);
  const entry = getEntry(moduleId);
  const loaded = isLoaded(moduleId);
  const active = isActive(moduleId);
  const loadingState = getLoadingState(moduleId);

  // Update instance when module loads
  useEffect(() => {
    if (loaded && entry?.instance) {
      setInstance(entry.instance);
    }
  }, [loaded, entry?.instance]);

  const load = useCallback(async () => {
    if (!loaded) {
      const moduleInstance = await loadModule(moduleId);
      setInstance(moduleInstance);
      return moduleInstance;
    }
    return instance;
  }, [moduleId, loaded, loadModule, instance]);

  return {
    module,
    instance,
    loaded,
    active,
    loadingState,
    load,
    isLoading: loadingState === 'loading',
    hasError: loadingState === 'error'
  };
};

/**
 * Hook for capability-based module discovery
 */
export const useModulesByCapability = (capability: string) => {
  const { getAllModules } = useModuleRegistry();
  const { activeCapabilities } = useCapabilities();

  const modules = useMemo(() => {
    const allModules = getAllModules();
    const result: ModuleInterface[] = [];

    allModules.forEach(module => {
      if (module.dependencies.requiredCapabilities.includes(capability as any) ||
          module.dependencies.optionalCapabilities?.includes(capability as any)) {
        result.push(module);
      }
    });

    return result;
  }, [getAllModules, capability]);

  const availableModules = useMemo(() => {
    return modules.filter(module => {
      // Check if user has required capabilities
      return module.dependencies.requiredCapabilities.every(cap =>
        activeCapabilities.includes(cap)
      );
    });
  }, [modules, activeCapabilities]);

  return {
    modules,
    availableModules,
    count: modules.length,
    availableCount: availableModules.length
  };
};

/**
 * Hook for module dependency resolution
 */
export const useModuleDependencies = (moduleId: string) => {
  const registry = getModuleRegistry();
  const { activeCapabilities } = useCapabilities();
  const [resolution, setResolution] = useState<ModuleResolutionResult | null>(null);

  useEffect(() => {
    if (registry.hasModule(moduleId)) {
      const result = registry.resolveDependencies(moduleId, activeCapabilities);
      setResolution(result);
    }
  }, [registry, moduleId, activeCapabilities]);

  const canLoad = resolution?.satisfied || false;
  const missingCapabilities = resolution?.missingCapabilities || [];
  const missingModules = resolution?.missingModules || [];
  const conflicts = resolution?.conflicts || [];

  return {
    resolution,
    canLoad,
    missingCapabilities,
    missingModules,
    conflicts,
    loadOrder: resolution?.loadOrder || []
  };
};

/**
 * Hook for module health monitoring
 */
export const useModuleHealth = (moduleId: string, interval: number = 60000) => {
  const registry = getModuleRegistry();
  const [health, setHealth] = useState<ModuleHealthCheck | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        if (registry.hasModule(moduleId)) {
          const healthCheck = await registry.performHealthCheck(moduleId);
          setHealth(healthCheck);
        }
      } catch (error) {
        console.error(`Health check failed for module ${moduleId}:`, error);
      }

      // Schedule next check
      timeoutId = setTimeout(checkHealth, interval);
    };

    // Perform initial check
    checkHealth();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [registry, moduleId, interval]);

  return {
    health,
    isHealthy: health?.status === 'healthy',
    isDegraded: health?.status === 'degraded',
    isUnhealthy: health?.status === 'unhealthy',
    issues: health?.issues || [],
    lastChecked: health?.timestamp
  };
};

/**
 * Hook for batch module operations
 */
export const useBatchModules = () => {
  const { loadModules, preloadModules } = useModuleLoader();
  const { activeCapabilities } = useCapabilities();
  const registry = getModuleRegistry();

  const loadModulesByCapability = useCallback(async (capability: string) => {
    const modules = registry.getModulesByCapability(capability as any);
    const moduleIds = modules
      .filter(module => {
        // Check if user has required capabilities
        return module.dependencies.requiredCapabilities.every(cap =>
          activeCapabilities.includes(cap)
        );
      })
      .map(module => module.metadata.id);

    return loadModules(moduleIds);
  }, [registry, activeCapabilities, loadModules]);

  const preloadModulesByTag = useCallback(async (tag: string) => {
    const modules = registry.getModulesByTag(tag);
    const moduleIds = modules.map(module => module.metadata.id);
    return preloadModules(moduleIds);
  }, [registry, preloadModules]);

  const loadEssentialModules = useCallback(async () => {
    // Load modules tagged as essential
    return loadModulesByCapability('essential');
  }, [loadModulesByCapability]);

  return {
    loadModulesByCapability,
    preloadModulesByTag,
    loadEssentialModules
  };
};

/**
 * Hook for module statistics and monitoring
 */
export const useModuleStatistics = () => {
  const registry = getModuleRegistry();
  const loader = getModuleLoader();
  const [stats, setStats] = useState(registry.getStatistics());

  useEffect(() => {
    const updateStats = () => {
      setStats(registry.getStatistics());
    };

    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    registry.on('module:loaded', updateStats);
    registry.on('module:activated', updateStats);
    registry.on('module:deactivated', updateStats);

    return () => {
      clearInterval(interval);
      registry.off('module:loaded', updateStats);
      registry.off('module:activated', updateStats);
      registry.off('module:deactivated', updateStats);
    };
  }, [registry]);

  const loadingStats = loader.getLoadingStats();

  return {
    registryStats: stats,
    loadingStats,
    combined: {
      ...stats,
      ...loadingStats
    }
  };
};