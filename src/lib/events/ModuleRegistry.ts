// ModuleRegistry.ts - Enterprise Module Lifecycle Management
// Handles module registration, health monitoring, dependency resolution, and graceful shutdown

import type {
  ModuleId,
  ModuleDescriptor,
  ModuleHealth,
  ModuleMetrics,
  EventSubscription,
  EventBusConfig,
  UnsubscribeFn
} from './types';

import { ModuleStatus, EventBusError, EventBusErrorCode } from './types';

import { logger } from '@/lib/logging';
// Registered module with runtime state
interface RegisteredModule {
  descriptor: ModuleDescriptor;
  status: ModuleStatus;
  health: ModuleHealth;
  subscriptions: Map<string, EventSubscription>;
  unsubscribeFunctions: Map<string, UnsubscribeFn>;
  activatedAt?: Date;
  lastHealthCheck?: Date;
  healthCheckTimer?: number;
  metrics: ModuleMetrics;
}

// Dependency graph node
interface DependencyNode {
  moduleId: ModuleId;
  dependencies: Set<ModuleId>;
  dependents: Set<ModuleId>;
  resolved: boolean;
}

// Health monitoring event
interface HealthEvent {
  moduleId: ModuleId;
  previousStatus: ModuleStatus;
  currentStatus: ModuleStatus;
  health: ModuleHealth;
  timestamp: Date;
}

export class ModuleRegistry {
  private modules = new Map<ModuleId, RegisteredModule>();
  private dependencyGraph = new Map<ModuleId, DependencyNode>();
  private activationOrder: ModuleId[] = [];
  private eventBusInstance: IEventBusV2;
  private config: EventBusConfig;
  private eventListeners = new Map<string, Function[]>();
  
  // Health monitoring
  private globalHealthTimer?: number;
  private isShuttingDown = false;
  
  constructor() {
    // Constructor is now empty
  }

  public setEventBus(eventBus: IEventBusV2): void {
    this.eventBusInstance = eventBus;
    this.config = eventBus.getConfig();
    this.startGlobalHealthMonitoring();
  }

  // Register a new module
  async registerModule(descriptor: ModuleDescriptor): Promise<void> {
    const { id } = descriptor;
    
    // Validate module descriptor
    this.validateDescriptor(descriptor);
    
    // Check if module already exists
    if (this.modules.has(id)) {
      throw new EventBusError(
        `Module '${id}' is already registered`,
        EventBusErrorCode.MODULE_ALREADY_EXISTS,
        { moduleId: id }
      );
    }
    
    // Validate dependencies
    const missingDeps = await this.validateDependencies(descriptor);
    if (missingDeps.length > 0) {
      throw new EventBusError(
        `Module '${id}' has missing dependencies: ${missingDeps.join(', ')}`,
        EventBusErrorCode.DEPENDENCY_MISSING,
        { moduleId: id, missingDependencies: missingDeps }
      );
    }
    
    // Create registered module
    const module: RegisteredModule = {
      descriptor,
      status: ModuleStatus.INACTIVE,
      health: {
        status: ModuleStatus.INACTIVE,
        metrics: this.createInitialMetrics(),
        dependencies: {},
        lastCheck: new Date()
      },
      subscriptions: new Map(),
      unsubscribeFunctions: new Map(),
      metrics: this.createInitialMetrics()
    };
    
    // Register module
    this.modules.set(id, module);
    
    // Update dependency graph
    this.updateDependencyGraph(descriptor);
    
    // Calculate activation order
    this.calculateActivationOrder();
    
    logger.info('EventBus', `[ModuleRegistry] Module '${id}' registered successfully`);
    
    // Emit registration event
    this.emitEvent('moduleRegistered', { moduleId: id, descriptor });
    
    // Auto-activate if dependencies are satisfied
    if (await this.areDependenciesSatisfied(id)) {
      await this.activateModule(id);
    }
  }

  // Activate a module
  async activateModule(moduleId: ModuleId): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new EventBusError(
        `Module '${moduleId}' not found`,
        EventBusErrorCode.MODULE_NOT_FOUND,
        { moduleId }
      );
    }
    
    if (module.status === ModuleStatus.ACTIVE) {
      logger.info('EventBus', `[ModuleRegistry] Module '${moduleId}' is already active`);
      return;
    }
    
    try {
      logger.info('EventBus', `[ModuleRegistry] Activating module '${moduleId}'...`);
      module.status = ModuleStatus.ACTIVATING;
      
      // Activate dependencies first (recursive activation)
      await this.activateModuleDependencies(moduleId);
      
      // Check dependencies are now satisfied
      const missingDeps = await this.validateDependencies(module.descriptor);
      if (missingDeps.length > 0) {
        throw new Error(`Missing dependencies after activation: ${missingDeps.join(', ')}`);
      }
      
      // Activate this module directly
      await this.activateModuleDirectly(moduleId);
      
      // Try to activate dependent modules
      await this.activateDependentModules(moduleId);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      module.status = ModuleStatus.ERROR;
      module.health.status = ModuleStatus.ERROR;
      module.health.message = err.message;

      logger.error('EventBus', `[ModuleRegistry] Failed to activate module '${moduleId}':`, err);

      this.emitEvent('moduleActivationFailed', {
        moduleId,
        error: err.message
      });

      throw new EventBusError(
        `Failed to activate module '${moduleId}': ${err.message}`,
        EventBusErrorCode.MODULE_ACTIVATION_FAILED,
        { moduleId, originalError: err }
      );
    }
  }

  // Deactivate a module (graceful shutdown)
  async deactivateModule(moduleId: ModuleId): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new EventBusError(
        `Module '${moduleId}' not found`,
        EventBusErrorCode.MODULE_NOT_FOUND,
        { moduleId }
      );
    }
    
    if (module.status === ModuleStatus.INACTIVE) {
      logger.info('EventBus', `[ModuleRegistry] Module '${moduleId}' is already inactive`);
      return;
    }
    
    // First, deactivate all dependent modules in reverse dependency order
    await this.deactivateDependentModules(moduleId);
    
    try {
      logger.info('EventBus', `[ModuleRegistry] Deactivating module '${moduleId}'...`);
      module.status = ModuleStatus.DEACTIVATING;
      
      // Stop health monitoring
      this.stopModuleHealthMonitoring(moduleId);
      
      // Unregister all event subscriptions
      await this.unregisterModuleSubscriptions(moduleId);
      
      // Call module's onDeactivate hook if exists
      if (module.descriptor.onDeactivate) {
        const timeoutMs = module.descriptor.config?.gracefulShutdownTimeoutMs || 5000;
        
        await Promise.race([
          module.descriptor.onDeactivate(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Graceful shutdown timeout')), timeoutMs)
          )
        ]);
      }
      
      // Update status
      module.status = ModuleStatus.INACTIVE;
      module.health.status = ModuleStatus.INACTIVE;
      module.activatedAt = undefined;
      
      logger.info('EventBus', `[ModuleRegistry] Module '${moduleId}' deactivated successfully`);
      
      // Emit deactivation event
      this.emitEvent('moduleDeactivated', { moduleId });
      
      // Check if any dependent modules need to be deactivated
      await this.checkDependentModules(moduleId);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      module.status = ModuleStatus.ERROR;
      module.health.status = ModuleStatus.ERROR;
      module.health.message = `Deactivation failed: ${err.message}`;

      logger.error('EventBus', `[ModuleRegistry] Failed to deactivate module '${moduleId}':`, err);

      this.emitEvent('moduleDeactivationFailed', {
        moduleId,
        error: err.message
      });

      throw new EventBusError(
        `Failed to deactivate module '${moduleId}': ${err.message}`,
        EventBusErrorCode.MODULE_NOT_FOUND,
        { moduleId, originalError: err }
      );
    }
  }

  // Reactivate a module (restart)
  async reactivateModule(moduleId: ModuleId): Promise<void> {
    await this.deactivateModule(moduleId);
    await this.activateModule(moduleId);
  }

  // Get module health
  async getModuleHealth(moduleId?: ModuleId): Promise<Record<ModuleId, ModuleHealth>> {
    if (moduleId) {
      const module = this.modules.get(moduleId);
      if (!module) {
        throw new EventBusError(
          `Module '${moduleId}' not found`,
          EventBusErrorCode.MODULE_NOT_FOUND,
          { moduleId }
        );
      }
      
      // Perform fresh health check
      await this.performHealthCheck(moduleId);
      
      return { [moduleId]: module.health };
    }
    
    // Get health for all modules
    const healthMap: Record<ModuleId, ModuleHealth> = {};
    
    for (const [id] of this.modules) {
      await this.performHealthCheck(id);
      healthMap[id] = this.modules.get(id)!.health;
    }
    
    return healthMap;
  }

  // Get all registered modules
  getRegisteredModules(): Record<ModuleId, ModuleDescriptor> {
    const modules: Record<ModuleId, ModuleDescriptor> = {};
    
    for (const [id, module] of this.modules) {
      modules[id] = module.descriptor;
    }
    
    return modules;
  }

  // Get module information
  getModuleInfo(moduleId: ModuleId): {
    descriptor: ModuleDescriptor;
    status: ModuleStatus;
    health: ModuleHealth;
    registrationTime: Date;
    activatedAt?: Date;
  } | null {
    const module = this.modules.get(moduleId);
    if (!module) return null;
    
    return {
      descriptor: module.descriptor,
      status: module.status,
      health: module.health,
      registrationTime: new Date(), // TODO: Store actual registration time
      activatedAt: module.activatedAt
    };
  }

  // Get active modules
  getActiveModules(): ModuleId[] {
    const activeModules: ModuleId[] = [];
    
    for (const [id, module] of this.modules) {
      if (module.status === ModuleStatus.ACTIVE) {
        activeModules.push(id);
      }
    }
    
    return activeModules;
  }

  // Get module subscriptions
  getModuleSubscriptions(moduleId: ModuleId): EventSubscription[] {
    const module = this.modules.get(moduleId);
    if (!module) return [];
    
    return Array.from(module.subscriptions.values());
  }

  // Add subscription to module
  addModuleSubscription(moduleId: ModuleId, subscription: EventSubscription, unsubscribeFn: UnsubscribeFn): void {
    const module = this.modules.get(moduleId);
    if (!module) return;
    
    module.subscriptions.set(subscription.id, subscription);
    module.unsubscribeFunctions.set(subscription.id, unsubscribeFn);
  }

  // Remove subscription from module
  removeModuleSubscription(moduleId: ModuleId, subscriptionId: string): void {
    const module = this.modules.get(moduleId);
    if (!module) return;
    
    // Call unsubscribe function
    const unsubscribeFn = module.unsubscribeFunctions.get(subscriptionId);
    if (unsubscribeFn) {
      unsubscribeFn();
    }
    
    module.subscriptions.delete(subscriptionId);
    module.unsubscribeFunctions.delete(subscriptionId);
  }

  // Update module metrics
  updateModuleMetrics(moduleId: ModuleId, updates: Partial<ModuleMetrics>): void {
    const module = this.modules.get(moduleId);
    if (!module) return;
    
    module.metrics = { ...module.metrics, ...updates };
    module.health.metrics = module.metrics;
  }

  // Graceful shutdown of all modules
  async gracefulShutdown(timeoutMs: number = 30000): Promise<void> {
    logger.info('EventBus', '[ModuleRegistry] Starting graceful shutdown...');
    this.isShuttingDown = true;
    
    // Stop global health monitoring
    if (this.globalHealthTimer) {
      clearInterval(this.globalHealthTimer);
    }
    
    // Deactivate modules in reverse dependency order
    const reverseOrder = [...this.activationOrder].reverse();
    
    for (const moduleId of reverseOrder) {
      const module = this.modules.get(moduleId);
      if (module && module.status === ModuleStatus.ACTIVE) {
        try {
          await this.deactivateModule(moduleId);
        } catch (error) {
          logger.error('EventBus', `[ModuleRegistry] Error deactivating module '${moduleId}' during shutdown:`, error);
        }
      }
    }
    
    logger.info('EventBus', '[ModuleRegistry] Graceful shutdown completed');
    this.emitEvent('registryShutdown', { modulesCount: this.modules.size });
  }

  // Event system for registry events
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // === PRIVATE METHODS ===

  // Validate module descriptor
  private validateDescriptor(descriptor: ModuleDescriptor): void {
    if (!descriptor.id) {
      throw new EventBusError('Module ID is required', EventBusErrorCode.MODULE_NOT_FOUND);
    }
    
    if (!descriptor.name) {
      throw new EventBusError('Module name is required', EventBusErrorCode.MODULE_NOT_FOUND);
    }
    
    if (!descriptor.version) {
      throw new EventBusError('Module version is required', EventBusErrorCode.MODULE_NOT_FOUND);
    }
    
    if (!Array.isArray(descriptor.dependencies)) {
      throw new EventBusError('Module dependencies must be an array', EventBusErrorCode.MODULE_NOT_FOUND);
    }
  }

  // Validate module dependencies
  private async validateDependencies(descriptor: ModuleDescriptor): Promise<ModuleId[]> {
    const missing: ModuleId[] = [];
    
    for (const depId of descriptor.dependencies) {
      const depModule = this.modules.get(depId);
      if (!depModule || depModule.status !== ModuleStatus.ACTIVE) {
        missing.push(depId);
      }
    }
    
    return missing;
  }

  // Check if dependencies are satisfied
  private async areDependenciesSatisfied(moduleId: ModuleId): Promise<boolean> {
    const module = this.modules.get(moduleId);
    if (!module) return false;
    
    const missing = await this.validateDependencies(module.descriptor);
    return missing.length === 0;
  }

  // Activate module dependencies recursively
  private async activateModuleDependencies(moduleId: ModuleId, activatingStack: Set<ModuleId> = new Set()): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) return;

    // Check for circular dependencies
    if (activatingStack.has(moduleId)) {
      throw new Error(`Circular dependency detected: ${Array.from(activatingStack).join(' -> ')} -> ${moduleId}`);
    }

    // Add current module to the activation stack
    activatingStack.add(moduleId);

    try {
      // Activate each dependency
      for (const depId of module.descriptor.dependencies) {
        const depModule = this.modules.get(depId);
        
        if (!depModule) {
          throw new Error(`Dependency '${depId}' not found for module '${moduleId}'`);
        }
        
        // If dependency is not active, activate it recursively
        if (depModule.status !== ModuleStatus.ACTIVE) {
          logger.info('EventBus', `[ModuleRegistry] Activating dependency '${depId}' for module '${moduleId}'`);
          
          // First activate dependencies of this dependency (recursive)
          await this.activateModuleDependencies(depId, activatingStack);
          
          // Then activate the dependency itself (direct activation)
          await this.activateModuleDirectly(depId);
        }
      }
    } finally {
      // Remove from activation stack
      activatingStack.delete(moduleId);
    }
  }

  // Activate a module without dependency checks (direct activation)
  private async activateModuleDirectly(moduleId: ModuleId): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module '${moduleId}' not found`);
    }
    
    if (module.status === ModuleStatus.ACTIVE) {
      return;
    }

    logger.info('EventBus', `[ModuleRegistry] Directly activating module '${moduleId}'...`);
    module.status = ModuleStatus.ACTIVATING;
    
    try {
      // Call module's onActivate hook if exists
      if (module.descriptor.onActivate) {
        const context = {
          emit: (pattern: any, payload: any, options: any = {}) => {
            // Force the source to be the module's ID
            const newOptions = { ...options, source: moduleId };
            return this.eventBusInstance.emit(pattern, payload, newOptions);
          }
        };
        await module.descriptor.onActivate(context);
      }
      
      // Register event subscriptions
      await this.registerModuleSubscriptions(moduleId);
      
      // Update status and timestamps
      module.status = ModuleStatus.ACTIVE;
      module.activatedAt = new Date();
      
      // Start individual health monitoring
      this.startModuleHealthMonitoring(moduleId);
      
      // Perform initial health check
      await this.performHealthCheck(moduleId);
      
      logger.info('EventBus', `[ModuleRegistry] Module '${moduleId}' activated directly`);
      
      // Emit activation event
      this.emitEvent('moduleActivated', { moduleId, module: module.descriptor });
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      module.status = ModuleStatus.ERROR;
      module.health.status = ModuleStatus.ERROR;
      module.health.message = err.message;

      logger.error('EventBus', `[ModuleRegistry] Failed to activate module '${moduleId}' directly:`, err);
      throw err;
    }
  }

  // Update dependency graph
  private updateDependencyGraph(descriptor: ModuleDescriptor): void {
    const { id, dependencies } = descriptor;
    
    // Create or update node
    const node: DependencyNode = this.dependencyGraph.get(id) || {
      moduleId: id,
      dependencies: new Set(),
      dependents: new Set(),
      resolved: false
    };
    
    node.dependencies = new Set(dependencies);
    this.dependencyGraph.set(id, node);
    
    // Update dependent relationships
    for (const depId of dependencies) {
      const depNode: DependencyNode = this.dependencyGraph.get(depId) || {
        moduleId: depId,
        dependencies: new Set(),
        dependents: new Set(),
        resolved: false
      };
      
      depNode.dependents.add(id);
      this.dependencyGraph.set(depId, depNode);
    }
  }

  // Calculate module activation order using topological sort
  private calculateActivationOrder(): void {
    const visited = new Set<ModuleId>();
    const visiting = new Set<ModuleId>();
    const order: ModuleId[] = [];
    
    const visit = (moduleId: ModuleId): void => {
      if (visited.has(moduleId)) return;
      if (visiting.has(moduleId)) {
        throw new EventBusError(
          `Circular dependency detected involving module '${moduleId}'`,
          EventBusErrorCode.DEPENDENCY_MISSING,
          { moduleId }
        );
      }
      
      visiting.add(moduleId);
      
      const node = this.dependencyGraph.get(moduleId);
      if (node) {
        for (const depId of node.dependencies) {
          visit(depId);
        }
      }
      
      visiting.delete(moduleId);
      visited.add(moduleId);
      order.push(moduleId);
    };
    
    // Visit all nodes
    for (const moduleId of this.modules.keys()) {
      visit(moduleId);
    }
    
    this.activationOrder = order;
    logger.info('EventBus', '[ModuleRegistry] Activation order calculated:', order);
  }

  // Register module event subscriptions
  private async registerModuleSubscriptions(moduleId: ModuleId): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) return;
    
    // This would be implemented by the EventBus itself
    // For now, just log
    logger.info('EventBus', `[ModuleRegistry] Registering ${module.descriptor.eventSubscriptions.length} subscriptions for module '${moduleId}'`);
  }

  // Unregister module event subscriptions
  private async unregisterModuleSubscriptions(moduleId: ModuleId): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) return;
    
    // Unsubscribe all handlers
    for (const [subscriptionId, unsubscribeFn] of module.unsubscribeFunctions) {
      try {
        unsubscribeFn();
      } catch (error) {
        logger.error('EventBus', `[ModuleRegistry] Error unsubscribing ${subscriptionId}:`, error);
      }
    }
    
    // Clear subscriptions
    module.subscriptions.clear();
    module.unsubscribeFunctions.clear();
    
    logger.info('EventBus', `[ModuleRegistry] Unregistered all subscriptions for module '${moduleId}'`);
  }

  // Activate dependent modules
  private async activateDependentModules(moduleId: ModuleId): Promise<void> {
    const node = this.dependencyGraph.get(moduleId);
    if (!node) return;
    
    for (const dependentId of node.dependents) {
      if (await this.areDependenciesSatisfied(dependentId)) {
        const dependentModule = this.modules.get(dependentId);
        if (dependentModule && dependentModule.status === ModuleStatus.INACTIVE) {
          try {
            await this.activateModule(dependentId);
          } catch (error) {
            logger.error('EventBus', `[ModuleRegistry] Failed to activate dependent module '${dependentId}':`, error);
          }
        }
      }
    }
  }

  // Deactivate dependent modules in correct order (before deactivating the target module)
  private async deactivateDependentModules(moduleId: ModuleId): Promise<void> {
    const node = this.dependencyGraph.get(moduleId);
    if (!node) return;
    
    // Get all active dependent modules that need to be deactivated first
    const dependentsToDeactivate: ModuleId[] = [];
    
    for (const dependentId of node.dependents) {
      const dependentModule = this.modules.get(dependentId);
      if (dependentModule && dependentModule.status === ModuleStatus.ACTIVE) {
        // Check if this dependent requires the module we're trying to deactivate
        const dependentDescriptor = dependentModule.descriptor;
        if (dependentDescriptor.dependencies.includes(moduleId)) {
          dependentsToDeactivate.push(dependentId);
        }
      }
    }
    
    // Sort dependents by reverse dependency order to avoid cascade issues
    const orderedDependents = this.orderDependentsForDeactivation(dependentsToDeactivate);
    
    // Deactivate each dependent (this will recursively call deactivateModule)
    for (const dependentId of orderedDependents) {
      logger.info('EventBus', `[ModuleRegistry] Deactivating dependent module '${dependentId}' before deactivating '${moduleId}'`);
      try {
        await this.deactivateModule(dependentId);
      } catch (error) {
        logger.error('EventBus', `[ModuleRegistry] Failed to deactivate dependent module '${dependentId}':`, error);
      }
    }
  }
  
  // Order dependents for deactivation (most dependent first)
  private orderDependentsForDeactivation(dependentIds: ModuleId[]): ModuleId[] {
    // Simple approach: find the order in activationOrder and reverse it
    const ordered = dependentIds.sort((a, b) => {
      const aIndex = this.activationOrder.indexOf(a);
      const bIndex = this.activationOrder.indexOf(b);
      return bIndex - aIndex; // Reverse order
    });
    
    return ordered;
  }

  // Check dependent modules when deactivating
  private async checkDependentModules(moduleId: ModuleId): Promise<void> {
    const node = this.dependencyGraph.get(moduleId);
    if (!node) return;
    
    // Check if any dependents need to be deactivated
    for (const dependentId of node.dependents) {
      const dependentModule = this.modules.get(dependentId);
      if (dependentModule && dependentModule.status === ModuleStatus.ACTIVE) {
        // Check if this was a required dependency
        const dependentDescriptor = dependentModule.descriptor;
        if (dependentDescriptor.dependencies.includes(moduleId)) {
          logger.info('EventBus', `[ModuleRegistry] Deactivating dependent module '${dependentId}' due to dependency '${moduleId}'`);
          try {
            await this.deactivateModule(dependentId);
          } catch (error) {
            logger.error('EventBus', `[ModuleRegistry] Failed to deactivate dependent module '${dependentId}':`, error);
          }
        }
      }
    }
  }

  // Perform health check for a module
  private async performHealthCheck(moduleId: ModuleId): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module || this.isShuttingDown) return;
    
    const previousStatus = module.health.status;
    
    // Skip health check for inactive modules - they should remain inactive
    if (module.status === ModuleStatus.INACTIVE) {
      module.health.status = ModuleStatus.INACTIVE;
      module.health.lastCheck = new Date();
      return;
    }
    
    try {
      // Call module's health check
      const health = await module.descriptor.healthCheck();
      
      // Update health data
      module.health = {
        ...health,
        lastCheck: new Date()
      };
      
      // Update metrics
      module.metrics = health.metrics;
      
      // Emit health change event if status changed
      if (previousStatus !== health.status) {
        const healthEvent: HealthEvent = {
          moduleId,
          previousStatus,
          currentStatus: health.status,
          health,
          timestamp: new Date()
        };
        
        this.emitEvent('moduleHealthChanged', healthEvent);
        
        logger.info('EventBus', `[ModuleRegistry] Module '${moduleId}' health changed: ${previousStatus} -> ${health.status}`);
      }
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      module.health = {
        status: ModuleStatus.ERROR,
        message: `Health check failed: ${err.message}`,
        metrics: module.metrics,
        dependencies: {},
        lastCheck: new Date()
      };

      logger.error('EventBus', `[ModuleRegistry] Health check failed for module '${moduleId}':`, err);
    }
  }

  // Start health monitoring for a specific module
  private startModuleHealthMonitoring(moduleId: ModuleId): void {
    const module = this.modules.get(moduleId);
    if (!module) return;
    
    const interval = module.descriptor.config?.healthCheckIntervalMs || this.config.healthCheckIntervalMs;
    
    module.healthCheckTimer = window.setInterval(async () => {
      await this.performHealthCheck(moduleId);
    }, interval);
  }

  // Stop health monitoring for a specific module
  private stopModuleHealthMonitoring(moduleId: ModuleId): void {
    const module = this.modules.get(moduleId);
    if (!module || !module.healthCheckTimer) return;
    
    clearInterval(module.healthCheckTimer);
    module.healthCheckTimer = undefined;
  }

  // Start global health monitoring
  private startGlobalHealthMonitoring(): void {
    this.globalHealthTimer = window.setInterval(async () => {
      // Perform periodic maintenance tasks
      await this.performGlobalMaintenance();
    }, this.config.healthCheckIntervalMs);
  }

  // Perform global maintenance tasks
  private async performGlobalMaintenance(): Promise<void> {
    if (this.isShuttingDown) return;
    
    // Check for modules that might need attention
    for (const [moduleId, module] of this.modules) {
      if (module.status === ModuleStatus.ACTIVE) {
        const timeSinceCheck = Date.now() - (module.health.lastCheck?.getTime() || 0);
        const maxInterval = (module.descriptor.config?.healthCheckIntervalMs || this.config.healthCheckIntervalMs) * 2;
        
        // If health check is overdue, perform it
        if (timeSinceCheck > maxInterval) {
          logger.info('EventBus', `[ModuleRegistry] Health check overdue for module '${moduleId}', performing now`);
          await this.performHealthCheck(moduleId);
        }
      }
    }
  }

  // Create initial metrics for a module
  private createInitialMetrics(): ModuleMetrics {
    return {
      eventsProcessed: 0,
      eventsEmitted: 0,
      errorRate: 0,
      avgProcessingTimeMs: 0,
      queueSize: 0
    };
  }

  // Emit registry events
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('EventBus', `[ModuleRegistry] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Destroy registry
  destroy(): void {
    this.isShuttingDown = true;
    
    if (this.globalHealthTimer) {
      clearInterval(this.globalHealthTimer);
    }
    
    // Stop all module health monitoring
    for (const [moduleId] of this.modules) {
      this.stopModuleHealthMonitoring(moduleId);
    }
    
    this.eventListeners.clear();
  }
}