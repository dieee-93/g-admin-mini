/**
 * Module Registry for G-Admin v3.0
 * Central registry for module management and federation
 * Based on 2024 module federation and dependency injection patterns
 */

import { EventEmitter } from 'events';
import type {
  ModuleInterface,
  ModuleRegistryEntry,
  ModuleLoadingState,
  ModuleResolutionResult,
  ModuleHealthCheck,
  ModulePerformanceMetrics
} from './types/ModuleTypes';
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';

/**
 * Module registry events
 */
export interface ModuleRegistryEvents {
  'module:registered': (moduleId: string, module: ModuleInterface) => void;
  'module:unregistered': (moduleId: string) => void;
  'module:loading': (moduleId: string) => void;
  'module:loaded': (moduleId: string, instance: any) => void;
  'module:error': (moduleId: string, error: Error) => void;
  'module:activated': (moduleId: string) => void;
  'module:deactivated': (moduleId: string) => void;
  'dependencies:resolved': (moduleId: string, resolution: ModuleResolutionResult) => void;
  'health:checked': (moduleId: string, health: ModuleHealthCheck) => void;
}

/**
 * Module registry for centralized module management
 */
export class ModuleRegistry extends EventEmitter {
  private modules = new Map<string, ModuleRegistryEntry>();
  private dependencyGraph = new Map<string, Set<string>>();
  private performanceMetrics = new Map<string, ModulePerformanceMetrics>();
  private healthChecks = new Map<string, ModuleHealthCheck>();

  constructor() {
    super();
    this.setMaxListeners(50); // Support many modules
  }

  /**
   * Register a module in the registry
   */
  register(module: ModuleInterface): void {
    const { id } = module.metadata;

    if (this.modules.has(id)) {
      throw new Error(`Module ${id} is already registered`);
    }

    // Validate module interface
    this.validateModule(module);

    // Create registry entry
    const entry: ModuleRegistryEntry = {
      module,
      state: 'idle',
      active: false
    };

    this.modules.set(id, entry);
    this.updateDependencyGraph(module);

    this.emit('module:registered', id, module);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Module registered: ${id} (${module.metadata.name})`);
    }
  }

  /**
   * Unregister a module
   */
  unregister(moduleId: string): boolean {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      return false;
    }

    // Deactivate if active
    if (entry.active) {
      this.deactivate(moduleId);
    }

    // Remove from registry
    this.modules.delete(moduleId);
    this.dependencyGraph.delete(moduleId);
    this.performanceMetrics.delete(moduleId);
    this.healthChecks.delete(moduleId);

    this.emit('module:unregistered', moduleId);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Module unregistered: ${moduleId}`);
    }

    return true;
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: string): ModuleInterface | null {
    const entry = this.modules.get(moduleId);
    return entry?.module || null;
  }

  /**
   * Get module registry entry
   */
  getEntry(moduleId: string): ModuleRegistryEntry | null {
    return this.modules.get(moduleId) || null;
  }

  /**
   * Get all registered modules
   */
  getAllModules(): Map<string, ModuleInterface> {
    const modules = new Map<string, ModuleInterface>();
    this.modules.forEach((entry, id) => {
      modules.set(id, entry.module);
    });
    return modules;
  }

  /**
   * Get modules by capability
   */
  getModulesByCapability(capability: BusinessCapability): ModuleInterface[] {
    const modules: ModuleInterface[] = [];

    this.modules.forEach(entry => {
      const { module } = entry;
      if (module.dependencies.requiredCapabilities.includes(capability) ||
          module.dependencies.optionalCapabilities?.includes(capability)) {
        modules.push(module);
      }
    });

    return modules;
  }

  /**
   * Get modules by tag
   */
  getModulesByTag(tag: string): ModuleInterface[] {
    const modules: ModuleInterface[] = [];

    this.modules.forEach(entry => {
      const { module } = entry;
      if (module.metadata.tags?.includes(tag)) {
        modules.push(module);
      }
    });

    return modules;
  }

  /**
   * Check if module exists
   */
  hasModule(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  /**
   * Check if module is loaded
   */
  isLoaded(moduleId: string): boolean {
    const entry = this.modules.get(moduleId);
    return entry?.state === 'loaded';
  }

  /**
   * Check if module is active
   */
  isActive(moduleId: string): boolean {
    const entry = this.modules.get(moduleId);
    return entry?.active || false;
  }

  /**
   * Set module loading state
   */
  setLoadingState(moduleId: string, state: ModuleLoadingState, error?: Error): void {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module ${moduleId} not found`);
    }

    entry.state = state;
    if (error) {
      entry.error = error;
    }

    // Emit appropriate events
    switch (state) {
      case 'loading':
        this.emit('module:loading', moduleId);
        break;
      case 'loaded':
        entry.loadedAt = Date.now();
        this.emit('module:loaded', moduleId, entry.instance);
        break;
      case 'error':
        this.emit('module:error', moduleId, error!);
        break;
    }
  }

  /**
   * Set module instance after loading
   */
  setModuleInstance(moduleId: string, instance: any): void {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module ${moduleId} not found`);
    }

    entry.instance = instance;
    entry.state = 'loaded';
    entry.loadedAt = Date.now();

    this.emit('module:loaded', moduleId, instance);
  }

  /**
   * Activate a module
   */
  async activate(moduleId: string): Promise<void> {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (entry.active) {
      return; // Already active
    }

    // Call lifecycle hook
    if (entry.module.lifecycle?.onActivate) {
      await entry.module.lifecycle.onActivate();
    }

    entry.active = true;
    this.emit('module:activated', moduleId);

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Module activated: ${moduleId}`);
    }
  }

  /**
   * Deactivate a module
   */
  async deactivate(moduleId: string): Promise<void> {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (!entry.active) {
      return; // Already inactive
    }

    // Call lifecycle hook
    if (entry.module.lifecycle?.onDeactivate) {
      await entry.module.lifecycle.onDeactivate();
    }

    entry.active = false;
    this.emit('module:deactivated', moduleId);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏸️ Module deactivated: ${moduleId}`);
    }
  }

  /**
   * Resolve module dependencies
   */
  resolveDependencies(
    moduleId: string,
    availableCapabilities: BusinessCapability[]
  ): ModuleResolutionResult {
    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const { dependencies } = module;
    const missingCapabilities: BusinessCapability[] = [];
    const missingModules: string[] = [];
    const conflicts: string[] = [];

    // Check required capabilities
    dependencies.requiredCapabilities.forEach(capability => {
      if (!availableCapabilities.includes(capability)) {
        missingCapabilities.push(capability);
      }
    });

    // Check module dependencies
    dependencies.dependsOn?.forEach(depModuleId => {
      if (!this.hasModule(depModuleId)) {
        missingModules.push(depModuleId);
      }
    });

    // Check conflicts
    dependencies.conflicts?.forEach(conflictModuleId => {
      if (this.hasModule(conflictModuleId) && this.isActive(conflictModuleId)) {
        conflicts.push(conflictModuleId);
      }
    });

    // Generate load order
    const loadOrder = this.generateLoadOrder(moduleId);

    const result: ModuleResolutionResult = {
      satisfied: missingCapabilities.length === 0 && missingModules.length === 0 && conflicts.length === 0,
      missingCapabilities,
      missingModules,
      conflicts,
      loadOrder
    };

    this.emit('dependencies:resolved', moduleId, result);
    return result;
  }

  /**
   * Update performance metrics for a module
   */
  updatePerformanceMetrics(moduleId: string, metrics: Partial<ModulePerformanceMetrics>): void {
    const existing = this.performanceMetrics.get(moduleId) || {
      loadTime: 0,
      initTime: 0,
      componentCount: 0,
      lastAccessed: Date.now()
    };

    const updated = { ...existing, ...metrics };
    this.performanceMetrics.set(moduleId, updated);
  }

  /**
   * Get performance metrics for a module
   */
  getPerformanceMetrics(moduleId: string): ModulePerformanceMetrics | null {
    return this.performanceMetrics.get(moduleId) || null;
  }

  /**
   * Perform health check on a module
   */
  async performHealthCheck(moduleId: string): Promise<ModuleHealthCheck> {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check if module is loaded
    if (entry.state === 'error') {
      issues.push('Module failed to load');
      status = 'unhealthy';
    }

    // Check if module has performance issues
    const metrics = this.getPerformanceMetrics(moduleId);
    if (metrics) {
      if (metrics.loadTime > 5000) {
        issues.push('Slow loading time');
        status = status === 'healthy' ? 'degraded' : status;
      }

      if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
        issues.push('High memory usage');
        status = status === 'healthy' ? 'degraded' : status;
      }
    }

    const healthCheck: ModuleHealthCheck = {
      moduleId,
      status,
      timestamp: Date.now(),
      issues: issues.length > 0 ? issues : undefined,
      performance: metrics || undefined
    };

    this.healthChecks.set(moduleId, healthCheck);
    this.emit('health:checked', moduleId, healthCheck);

    return healthCheck;
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    totalModules: number;
    loadedModules: number;
    activeModules: number;
    errorModules: number;
    averageLoadTime: number;
    totalMemoryUsage: number;
  } {
    let loadedCount = 0;
    let activeCount = 0;
    let errorCount = 0;
    let totalLoadTime = 0;
    let totalMemoryUsage = 0;
    let moduleCount = 0;

    this.modules.forEach(entry => {
      if (entry.state === 'loaded') loadedCount++;
      if (entry.active) activeCount++;
      if (entry.state === 'error') errorCount++;

      const metrics = this.performanceMetrics.get(entry.module.metadata.id);
      if (metrics) {
        totalLoadTime += metrics.loadTime;
        totalMemoryUsage += metrics.memoryUsage || 0;
        moduleCount++;
      }
    });

    return {
      totalModules: this.modules.size,
      loadedModules: loadedCount,
      activeModules: activeCount,
      errorModules: errorCount,
      averageLoadTime: moduleCount > 0 ? totalLoadTime / moduleCount : 0,
      totalMemoryUsage
    };
  }

  private validateModule(module: ModuleInterface): void {
    const { metadata, dependencies, components } = module;

    // Validate metadata
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error('Module metadata must include id, name, and version');
    }

    // Validate ID format
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(metadata.id)) {
      throw new Error('Module ID must be in kebab-case format');
    }

    // Validate dependencies
    if (!dependencies.requiredCapabilities || !Array.isArray(dependencies.requiredCapabilities)) {
      throw new Error('Module must specify required capabilities');
    }

    // Validate components
    if (!components.MainComponent && !components.pages && !components.components) {
      console.warn(`Module ${metadata.id} has no exported components`);
    }
  }

  private updateDependencyGraph(module: ModuleInterface): void {
    const { id } = module.metadata;
    const dependencies = new Set<string>();

    // Add module dependencies
    module.dependencies.dependsOn?.forEach(dep => dependencies.add(dep));

    this.dependencyGraph.set(id, dependencies);
  }

  private generateLoadOrder(moduleId: string): string[] {
    const visited = new Set<string>();
    const loadOrder: string[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      visited.add(id);

      const dependencies = this.dependencyGraph.get(id);
      if (dependencies) {
        dependencies.forEach(dep => visit(dep));
      }

      loadOrder.push(id);
    };

    visit(moduleId);
    return loadOrder;
  }
}

/**
 * Singleton module registry instance
 */
let registryInstance: ModuleRegistry | null = null;

/**
 * Get or create module registry instance
 */
export const getModuleRegistry = (): ModuleRegistry => {
  if (!registryInstance) {
    registryInstance = new ModuleRegistry();
  }
  return registryInstance;
};

/**
 * Reset module registry instance (useful for testing)
 */
export const resetModuleRegistry = (): void => {
  if (registryInstance) {
    registryInstance.removeAllListeners();
  }
  registryInstance = null;
};