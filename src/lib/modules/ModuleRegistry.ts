/**
 * MODULE REGISTRY - Core Module Management System
 *
 * Singleton class that manages module lifecycle, dependencies, hooks, and exports.
 * Inspired by WordPress, VS Code, and Odoo module systems.
 *
 * FEATURES:
 * - Module lifecycle: register, unregister, activate, deactivate
 * - Hook system: addAction, doAction, hasHook, removeHook
 * - Exports API: VS Code-style module exports
 * - Dependency validation: circular dependency detection
 * - Performance tracking: setup duration metrics
 * - Priority-based hook execution
 *
 * USAGE:
 * ```typescript
 * import { ModuleRegistry } from '@/lib/modules';
 *
 * const registry = ModuleRegistry.getInstance();
 *
 * // Register a module
 * registry.register({
 *   id: 'sales-analytics',
 *   name: 'Sales Analytics',
 *   version: '1.0.0',
 *   depends: ['sales'],
 *   activatedBy: 'sales_management',  // OPTIONAL module
 *   setup: async (registry) => {
 *     registry.addAction('dashboard.widgets', () => <AnalyticsWidget />);
 *   }
 * });
 *
 * // Execute hooks
 * const widgets = registry.doAction('dashboard.widgets', { user });
 * ```
 *
 * @version 1.0.0
 * @see docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md
 */

import { logger } from '@/lib/logging';
import eventBus from '@/lib/events/EventBus';
import type {
  IModuleRegistry,
  ModuleManifest,
  ModuleInstance,
  HookHandler,
  RegisteredHook,
  ModuleValidationResult,
  ModuleValidationError,
} from './types';

// ============================================
// MODULE REGISTRY SINGLETON
// ============================================

export class ModuleRegistry implements IModuleRegistry {
  private static instance: ModuleRegistry | null = null;

  /** Registered modules Map<moduleId, ModuleInstance> */
  private modules: Map<string, ModuleInstance> = new Map();

  /** Hook registry Map<hookName, RegisteredHook[]> */
  private hooks: Map<string, RegisteredHook[]> = new Map();

  /** Performance metrics Map<moduleId, setupDuration> */
  private performanceMetrics: Map<string, number> = new Map();

  /** Initialization flag */
  private initialized = false;

  /**
   * Private constructor - use getInstance()
   */
  private constructor() {
    logger.debug('App', 'ModuleRegistry instance created');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Reset singleton (for testing only)
   */
  public static resetInstance(): void {
    if (ModuleRegistry.instance) {
      ModuleRegistry.instance.clear();
      ModuleRegistry.instance = null;
      logger.warn('App', 'ModuleRegistry instance reset');
    }
  }

  // ============================================
  // MODULE LIFECYCLE
  // ============================================

  /**
   * Register a module with validation
   *
   * @param manifest - Module manifest definition
   * @returns Promise that resolves when module setup completes
   * @throws Error if manifest is invalid or dependencies are circular
   */
  public async register(manifest: ModuleManifest): Promise<void> {
    const startTime = performance.now();

    try {
      // 1. Validate manifest
      const validation = this.validateManifest(manifest);
      if (!validation.valid) {
        const errorMessages = validation.errors.map((e) => e.message).join('; ');
        throw new Error(`Invalid manifest for module "${manifest.id}": ${errorMessages}`);
      }

      // 2. Check if already registered
      if (this.modules.has(manifest.id)) {
        logger.warn('App', `Module "${manifest.id}" already registered, skipping`);
        return;
      }

      // 3. Validate dependencies
      const depValidation = this.validateDependencies(manifest);
      if (!depValidation.valid) {
        const errorMessages = depValidation.errors.map((e) => e.message).join('; ');
        throw new Error(`Dependency validation failed for "${manifest.id}": ${errorMessages}`);
      }

      // 4. Create module instance
      const instance: ModuleInstance = {
        manifest,
        active: true,
        registeredAt: Date.now(),
        errors: [],
      };

      this.modules.set(manifest.id, instance);

      console.log('✅ [ModuleRegistry.register] Module registered:', manifest.id, 'Total modules:', this.modules.size);
      logger.debug('App', `Module registered: ${manifest.id} v${manifest.version}`, {
        depends: manifest.depends,
        activatedBy: manifest.activatedBy,
      });

      // 5. Run setup function and AWAIT it (critical for HookPoint timing)
      if (manifest.setup) {
        try {
          await manifest.setup(this);
          const duration = performance.now() - startTime;
          this.performanceMetrics.set(manifest.id, duration);

          // Only log slow setups to reduce console noise
          if (duration > 500) {
            logger.warn('App', `Module setup: ${manifest.id} took ${duration.toFixed(2)}ms (threshold: 500ms)`);
          }
        } catch (error) {
          instance.errors?.push(error as Error);
          logger.error('App', `Module setup failed: ${manifest.id}`, error);
          throw error;
        }
      } else {
        const duration = performance.now() - startTime;
        this.performanceMetrics.set(manifest.id, duration);
      }
    } catch (error) {
      logger.error('App', `Failed to register module: ${manifest.id}`, error);
      throw error;
    }
  }

  /**
   * Unregister a module and cleanup hooks
   *
   * @param moduleId - Module identifier
   */
  public unregister(moduleId: string): void {
    const module = this.modules.get(moduleId);

    if (!module) {
      logger.warn('App', `Cannot unregister: module "${moduleId}" not found`);
      return;
    }

    try {
      // 1. Run teardown function
      if (module.manifest.teardown) {
        Promise.resolve(module.manifest.teardown()).catch((error) => {
          logger.error('App', `Module teardown failed: ${moduleId}`, error);
        });
      }

      // 2. Remove all hooks registered by this module
      this.removeHook('*', moduleId);

      // 3. Remove from registry
      this.modules.delete(moduleId);
      this.performanceMetrics.delete(moduleId);

      logger.info('App', `Module unregistered: ${moduleId}`);
    } catch (error) {
      logger.error('App', `Failed to unregister module: ${moduleId}`, error);
      throw error;
    }
  }

  /**
   * Check if a module is registered
   *
   * @param moduleId - Module identifier
   * @returns True if module exists
   */
  public has(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  /**
   * Get a module instance
   *
   * @param moduleId - Module identifier
   * @returns ModuleInstance or undefined
   */
  public getModule(moduleId: string): ModuleInstance | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   *
   * @returns Array of all ModuleInstances
   */
  public getAll(): ModuleInstance[] {
    const modules = Array.from(this.modules.values());
    console.log('🔍 [ModuleRegistry.getAll] Returning modules:', {
      count: modules.length,
      ids: modules.map(m => m.manifest.id)
    });
    return modules;
  }

  // ============================================
  // HOOK SYSTEM
  // ============================================

  /**
   * Register a hook handler (action)
   *
   * @param hookName - Hook identifier (e.g., 'dashboard.widgets')
   * @param handler - Handler function
   * @param moduleId - Module registering the hook (optional, for tracking)
   * @param priority - Execution priority (higher = earlier, default: 10)
   * @param options - Optional hook configuration (NEW: includes requiredPermission)
   */
  public addAction<T = any, R = any>(
    hookName: string,
    handler: HookHandler<T, R>,
    moduleId?: string,
    priority: number = 10,
    options?: {
      requiredPermission?: {
        module: string;
        action: string;
      };
      metadata?: Record<string, any>;
    }
  ): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const registeredHook: RegisteredHook<T, R> = {
      handler,
      context: {
        moduleId: moduleId || 'unknown',
        hookName,
        timestamp: Date.now(),
        requiredPermission: options?.requiredPermission,
        metadata: options?.metadata,
      },
      priority,
    };

    const hooks = this.hooks.get(hookName)!;
    hooks.push(registeredHook);

    // Sort by priority (descending - higher priority first)
    hooks.sort((a, b) => (b.priority || 10) - (a.priority || 10));

    logger.debug('App', `Hook registered: ${hookName}`, {
      moduleId: registeredHook.context.moduleId,
      priority,
      requiredPermission: options?.requiredPermission,
      totalHandlers: hooks.length,
    });
  }

  /**
   * Execute all handlers for a hook
   *
   * 🔒 PERMISSIONS: Hooks with requiredPermission are NOT filtered here.
   * Permission filtering happens at HookPoint component level.
   * If calling doAction programmatically, ensure proper permission checks.
   *
   * @param hookName - Hook identifier
   * @param data - Data to pass to handlers
   * @returns Array of results from all handlers
   */
  public doAction<T = any, R = any>(hookName: string, data?: T): R[] {
    const hooks = this.hooks.get(hookName);

    if (!hooks || hooks.length === 0) {
      logger.debug('App', `No hooks registered for: ${hookName}`);
      return [];
    }

    const startTime = performance.now();
    const results: R[] = [];

    for (const hook of hooks) {
      try {
        const result = hook.handler(data);
        results.push(result);
      } catch (error) {
        logger.error(
          'App',
          `Hook handler error: ${hookName} (module: ${hook.context.moduleId})`,
          error
        );
      }
    }

    const duration = performance.now() - startTime;
    logger.performance('App', `Hook execution: ${hookName} (${hooks.length} handlers)`, duration, 5);

    return results;
  }

  /**
   * Check if a hook has any handlers
   *
   * @param hookName - Hook identifier
   * @returns True if hook has handlers
   */
  public hasHook(hookName: string): boolean {
    const hooks = this.hooks.get(hookName);
    return hooks !== undefined && hooks.length > 0;
  }

  /**
   * Remove hook handlers
   *
   * @param hookName - Hook identifier (use '*' to remove all hooks)
   * @param moduleId - Optional module filter (removes only hooks from this module)
   */
  public removeHook(hookName: string, moduleId?: string): void {
    if (hookName === '*') {
      // Remove all hooks (optionally filtered by moduleId)
      if (moduleId) {
        for (const [name, hooks] of this.hooks.entries()) {
          const filtered = hooks.filter((h) => h.context.moduleId !== moduleId);
          if (filtered.length === 0) {
            this.hooks.delete(name);
          } else {
            this.hooks.set(name, filtered);
          }
        }
        logger.debug('App', `Removed all hooks for module: ${moduleId}`);
      } else {
        this.hooks.clear();
        logger.debug('App', 'Removed all hooks');
      }
      return;
    }

    const hooks = this.hooks.get(hookName);
    if (!hooks) return;

    if (moduleId) {
      // Remove hooks from specific module
      const filtered = hooks.filter((h) => h.context.moduleId !== moduleId);
      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
      logger.debug('App', `Removed hook: ${hookName} (module: ${moduleId})`);
    } else {
      // Remove all hooks with this name
      this.hooks.delete(hookName);
      logger.debug('App', `Removed hook: ${hookName} (all modules)`);
    }
  }

  // ============================================
  // EXPORTS API (VS Code pattern)
  // ============================================

  /**
   * Get module exports
   *
   * @param moduleId - Module identifier
   * @returns Module exports or undefined
   */
  public getExports<T = any>(moduleId: string): T | undefined {
    const module = this.modules.get(moduleId);
    return module?.manifest.exports as T | undefined;
  }

  // ============================================
  // INTROSPECTION
  // ============================================

  /**
   * Get dependency graph for a module (recursive)
   *
   * @param moduleId - Module identifier
   * @returns Array of all dependencies (direct and transitive)
   */
  public getDependencyGraph(moduleId: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const module = this.modules.get(id);
      if (!module) return;

      for (const depId of module.manifest.depends) {
        result.push(depId);
        traverse(depId);
      }
    };

    traverse(moduleId);
    return result;
  }

  /**
   * Get registry statistics
   *
   * @returns Registry stats object
   */
  public getStats(): {
    totalModules: number;
    totalHooks: number;
    modules: string[];
    hooks: Array<{ name: string; handlerCount: number }>;
  } {
    const hookStats = Array.from(this.hooks.entries()).map(([name, handlers]) => ({
      name,
      handlerCount: handlers.length,
    }));

    return {
      totalModules: this.modules.size,
      totalHooks: this.hooks.size,
      modules: Array.from(this.modules.keys()),
      hooks: hookStats,
    };
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate module manifest
   *
   * @param manifest - Module manifest
   * @returns Validation result
   */
  private validateManifest(manifest: ModuleManifest): ModuleValidationResult {
    const errors: ModuleValidationError[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!manifest.id || typeof manifest.id !== 'string') {
      errors.push({
        moduleId: manifest.id || 'unknown',
        type: 'invalid_manifest',
        message: 'Module ID is required and must be a string',
      });
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push({
        moduleId: manifest.id,
        type: 'invalid_manifest',
        message: 'Module name is required and must be a string',
      });
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push({
        moduleId: manifest.id,
        type: 'invalid_manifest',
        message: 'Module version is required and must be a string',
      });
    }

    if (!Array.isArray(manifest.depends)) {
      errors.push({
        moduleId: manifest.id,
        type: 'invalid_manifest',
        message: 'Module depends must be an array',
      });
    }

    // NEW ARCHITECTURE: activatedBy is optional (CORE modules don't have it)
    // No validation needed - undefined means CORE module, string means OPTIONAL module

    // Warnings
    if (manifest.depends.length === 0) {
      warnings.push(`Module "${manifest.id}" has no dependencies`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate module dependencies
   *
   * @param manifest - Module manifest
   * @returns Validation result
   */
  private validateDependencies(manifest: ModuleManifest): ModuleValidationResult {
    const errors: ModuleValidationError[] = [];
    const warnings: string[] = [];

    // Check for missing dependencies
    for (const depId of manifest.depends) {
      if (!this.modules.has(depId)) {
        errors.push({
          moduleId: manifest.id,
          type: 'missing_dependency',
          message: `Missing dependency: ${depId}`,
          details: { dependency: depId },
        });
      }
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (moduleId: string): boolean => {
      if (!visited.has(moduleId)) {
        visited.add(moduleId);
        recursionStack.add(moduleId);

        const module = this.modules.get(moduleId);
        if (module) {
          for (const depId of module.manifest.depends) {
            if (!visited.has(depId) && hasCycle(depId)) {
              return true;
            } else if (recursionStack.has(depId)) {
              return true;
            }
          }
        }
      }

      recursionStack.delete(moduleId);
      return false;
    };

    if (hasCycle(manifest.id)) {
      errors.push({
        moduleId: manifest.id,
        type: 'circular_dependency',
        message: `Circular dependency detected for module: ${manifest.id}`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ============================================
  // EVENTBUS ACCESS
  // ============================================

  /**
   * Get EventBus instance for module setup
   * 
   * @returns EventBus singleton instance
   */
  public getEventBus() {
    // Return EventBus singleton instance
    // Import is at the top of the file to avoid circular dependency issues
    return eventBus;
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Clear all modules and hooks
   */
  public clear(): void {
    // Run teardown for all modules
    for (const [moduleId, instance] of this.modules.entries()) {
      if (instance.manifest.teardown) {
        try {
          Promise.resolve(instance.manifest.teardown()).catch((error) => {
            logger.error('App', `Teardown failed during clear: ${moduleId}`, error);
          });
        } catch (error) {
          logger.error('App', `Teardown error during clear: ${moduleId}`, error);
        }
      }
    }

    this.modules.clear();
    this.hooks.clear();
    this.performanceMetrics.clear();
    this.initialized = false;

    logger.info('App', 'ModuleRegistry cleared');
  }
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

/**
 * Get singleton instance (convenience function)
 */
export const getModuleRegistry = (): ModuleRegistry => {
  return ModuleRegistry.getInstance();
};

/**
 * Default export
 */
export default ModuleRegistry;
