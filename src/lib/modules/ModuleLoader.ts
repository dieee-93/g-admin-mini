/**
 * Module Loader for G-Admin v3.0
 * Implements dynamic module loading with Module Federation support
 * Based on 2024 Webpack 5 Module Federation patterns
 */

import type {
  ModuleInterface,
  ModuleLoaderConfig,
  ModuleFederationConfig,
  ModulePerformanceMetrics
} from './types/ModuleTypes';
import { getModuleRegistry } from './ModuleRegistry';
import { getCapabilityTelemetry } from '../capabilities/telemetry/CapabilityTelemetry';

/**
 * Module loader class for dynamic loading and federation
 */
export class ModuleLoader {
  private config: ModuleLoaderConfig;
  private loadingPromises = new Map<string, Promise<any>>();
  private loadQueue: string[] = [];
  private currentLoads = 0;

  constructor(config: ModuleLoaderConfig = {}) {
    this.config = {
      baseUrl: '/modules',
      maxConcurrentLoads: 3,
      loadTimeout: 30000,
      enableCaching: true,
      enableHotReload: process.env.NODE_ENV === 'development',
      federationScope: 'default',
      ...config
    };
  }

  /**
   * Load a module dynamically
   */
  async loadModule(moduleId: string): Promise<any> {
    const registry = getModuleRegistry();
    const telemetry = getCapabilityTelemetry();
    const startTime = Date.now();

    // Check if already loading
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    // Check if already loaded
    const entry = registry.getEntry(moduleId);
    if (entry?.state === 'loaded' && entry.instance) {
      return entry.instance;
    }

    if (!entry) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    const module = entry.module;

    // Track loading start
    telemetry.trackLazyLoading(moduleId as any, 'start');
    registry.setLoadingState(moduleId, 'loading');

    // Create loading promise
    const loadingPromise = this.performLoad(module).then(instance => {
      const loadTime = Date.now() - startTime;

      // Update performance metrics
      registry.updatePerformanceMetrics(moduleId, {
        loadTime,
        lastAccessed: Date.now()
      });

      // Track loading complete
      telemetry.trackLazyLoading(moduleId as any, 'complete', loadTime);

      // Set module instance
      registry.setModuleInstance(moduleId, instance);

      // Call lifecycle hooks
      if (module.lifecycle?.onLoad) {
        await module.lifecycle.onLoad();
      }

      if (module.lifecycle?.onInit) {
        await module.lifecycle.onInit();
      }

      // Remove from loading promises
      this.loadingPromises.delete(moduleId);

      return instance;
    }).catch(error => {
      const loadTime = Date.now() - startTime;

      // Track loading error
      telemetry.trackLazyLoading(moduleId as any, 'error', loadTime, error);

      // Set error state
      registry.setLoadingState(moduleId, 'error', error);

      // Remove from loading promises
      this.loadingPromises.delete(moduleId);

      throw error;
    });

    // Store loading promise
    this.loadingPromises.set(moduleId, loadingPromise);

    return loadingPromise;
  }

  /**
   * Load multiple modules in parallel
   */
  async loadModules(moduleIds: string[]): Promise<Record<string, any>> {
    const loadPromises = moduleIds.map(async id => {
      const instance = await this.loadModule(id);
      return { id, instance };
    });

    const results = await Promise.allSettled(loadPromises);
    const instances: Record<string, any> = {};

    results.forEach((result, index) => {
      const moduleId = moduleIds[index];
      if (result.status === 'fulfilled') {
        instances[result.value.id] = result.value.instance;
      } else {
        console.error(`Failed to load module ${moduleId}:`, result.reason);
      }
    });

    return instances;
  }

  /**
   * Preload modules for better performance
   */
  async preloadModules(moduleIds: string[]): Promise<void> {
    const registry = getModuleRegistry();

    // Filter to unloaded modules
    const toPreload = moduleIds.filter(id => {
      const entry = registry.getEntry(id);
      return entry && entry.state !== 'loaded';
    });

    if (toPreload.length === 0) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Preloading modules:', toPreload);
    }

    // Load in background without waiting
    toPreload.forEach(id => {
      this.loadModule(id).catch(error => {
        console.warn(`Preload failed for module ${id}:`, error);
      });
    });
  }

  /**
   * Load module via Module Federation
   */
  private async loadModuleFederation(
    federation: ModuleFederationConfig,
    exposedModule: string
  ): Promise<any> {
    const { name, remoteEntry } = federation;

    if (!remoteEntry) {
      throw new Error(`Module federation requires remoteEntry URL`);
    }

    try {
      // Load remote module using webpack's module federation
      const container = await this.loadRemoteContainer(name, remoteEntry);
      const factory = await container.get(exposedModule);
      const module = factory();

      return module;
    } catch (error) {
      throw new Error(`Failed to load federated module ${name}/${exposedModule}: ${error}`);
    }
  }

  /**
   * Load remote container for module federation
   */
  private async loadRemoteContainer(name: string, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = url;

      script.onload = () => {
        // Access the remote container
        const container = (window as any)[name];
        if (!container) {
          reject(new Error(`Remote container ${name} not found`));
          return;
        }

        // Initialize the container
        container.init((window as any).__webpack_share_scopes__?.default);
        resolve(container);
      };

      script.onerror = () => {
        reject(new Error(`Failed to load remote script: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load module via dynamic import
   */
  private async loadModuleDynamic(modulePath: string): Promise<any> {
    try {
      const module = await import(
        /* webpackChunkName: "[request]" */
        /* webpackMode: "lazy" */
        modulePath
      );

      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to dynamically import module ${modulePath}: ${error}`);
    }
  }

  /**
   * Perform the actual module loading
   */
  private async performLoad(module: ModuleInterface): Promise<any> {
    const { metadata, federation } = module;

    // Apply load timeout
    const loadPromise = this.doLoad(module);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Module load timeout: ${metadata.id}`));
      }, this.config.loadTimeout);
    });

    return Promise.race([loadPromise, timeoutPromise]);
  }

  /**
   * Internal load implementation
   */
  private async doLoad(module: ModuleInterface): Promise<any> {
    const { metadata, federation } = module;

    // Try Module Federation first
    if (federation && federation.remoteEntry) {
      try {
        return await this.loadModuleFederation(federation, './Module');
      } catch (error) {
        console.warn(`Module Federation failed for ${metadata.id}, falling back to dynamic import:`, error);
      }
    }

    // Fallback to dynamic import
    const modulePath = `${this.config.baseUrl}/${metadata.id}/index.js`;
    return await this.loadModuleDynamic(modulePath);
  }

  /**
   * Unload a module
   */
  async unloadModule(moduleId: string): Promise<void> {
    const registry = getModuleRegistry();
    const entry = registry.getEntry(moduleId);

    if (!entry) {
      return;
    }

    // Call lifecycle hook
    if (entry.module.lifecycle?.onUnload) {
      await entry.module.lifecycle.onUnload();
    }

    // Deactivate if active
    if (entry.active) {
      await registry.deactivate(moduleId);
    }

    // Clear loading promise
    this.loadingPromises.delete(moduleId);

    // Reset entry state
    entry.state = 'idle';
    entry.instance = undefined;
    entry.error = undefined;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️ Module unloaded: ${moduleId}`);
    }
  }

  /**
   * Get loading statistics
   */
  getLoadingStats(): {
    currentLoads: number;
    queueSize: number;
    totalLoaded: number;
    averageLoadTime: number;
  } {
    const registry = getModuleRegistry();
    const stats = registry.getStatistics();

    return {
      currentLoads: this.loadingPromises.size,
      queueSize: this.loadQueue.length,
      totalLoaded: stats.loadedModules,
      averageLoadTime: stats.averageLoadTime
    };
  }

  /**
   * Clear all caches and reset loader
   */
  reset(): void {
    this.loadingPromises.clear();
    this.loadQueue = [];
    this.currentLoads = 0;
  }
}

/**
 * Singleton module loader instance
 */
let loaderInstance: ModuleLoader | null = null;

/**
 * Get or create module loader instance
 */
export const getModuleLoader = (config?: ModuleLoaderConfig): ModuleLoader => {
  if (!loaderInstance) {
    loaderInstance = new ModuleLoader(config);
  }
  return loaderInstance;
};

/**
 * Reset module loader instance (useful for testing)
 */
export const resetModuleLoader = (): void => {
  loaderInstance = null;
};