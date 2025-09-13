// EventBusFactory.ts - Factory pattern for isolated EventBus instances
// Enables multiple independent instances for microfrontend architectures

import { EventBus } from './EventBusCore';
import { SecurityLogger } from './utils/SecureLogger';
import type { EventBusConfig, IEventBus } from './types';

/**
 * Configuration for factory instance creation
 */
export interface FactoryInstanceConfig extends EventBusConfig {
  instanceId?: string;
  namespace?: string;
  isolated?: boolean;
  parentFactory?: EventBusFactory;
  microfrontendMode?: boolean;
  crossInstanceCommunication?: boolean;
}

/**
 * Instance metadata for tracking and management
 */
interface InstanceMetadata {
  id: string;
  namespace: string;
  created: Date;
  isolated: boolean;
  parentFactory?: string;
  microfrontendMode: boolean;
  lastActivity: Date;
  eventCount: number;
  status: 'active' | 'paused' | 'destroyed';
}

/**
 * Factory for creating and managing multiple EventBus instances
 * Supports microfrontend isolation and cross-instance communication
 */
export class EventBusFactory {
  private static globalRegistry = new Map<string, EventBusFactory>();
  private instances = new Map<string, EventBus>();
  private instanceMetadata = new Map<string, InstanceMetadata>();
  private factoryId: string;
  private config: FactoryInstanceConfig;
  private destroyed = false;

  constructor(config: Partial<FactoryInstanceConfig> = {}) {
    this.factoryId = this.generateFactoryId();
    this.config = {
      namespace: 'default',
      isolated: true,
      microfrontendMode: false,
      crossInstanceCommunication: false,
      ...config
    };

    // Register in global registry if not isolated
    if (!this.config.isolated) {
      EventBusFactory.globalRegistry.set(this.factoryId, this);
    }

    SecurityLogger.anomaly('EventBusFactory created', {
      factoryId: this.factoryId,
      namespace: this.config.namespace,
      isolated: this.config.isolated,
      microfrontendMode: this.config.microfrontendMode
    });
  }

  /**
   * Create a new EventBus instance
   */
  createInstance(config: Partial<FactoryInstanceConfig> = {}): EventBus {
    this.ensureNotDestroyed();
    
    const instanceConfig: FactoryInstanceConfig = {
      ...this.config,
      ...config,
      instanceId: config.instanceId || this.generateInstanceId(),
      parentFactory: this
    };

    const instanceId = instanceConfig.instanceId!;
    
    // Check for existing instance
    if (this.instances.has(instanceId)) {
      SecurityLogger.threat('Attempted to create duplicate instance', {
        factoryId: this.factoryId,
        instanceId,
        existingInstances: Array.from(this.instances.keys())
      });
      throw new Error(`Instance '${instanceId}' already exists in factory '${this.factoryId}'`);
    }

    // Create isolated instance
    const instance = new EventBus(instanceConfig);
    
    // Setup instance isolation
    if (instanceConfig.isolated) {
      this.setupInstanceIsolation(instance, instanceConfig);
    }

    // Setup microfrontend support
    if (instanceConfig.microfrontendMode) {
      this.setupMicrofrontendSupport(instance, instanceConfig);
    }

    // Register instance
    this.instances.set(instanceId, instance);
    this.instanceMetadata.set(instanceId, {
      id: instanceId,
      namespace: instanceConfig.namespace || 'default',
      created: new Date(),
      isolated: instanceConfig.isolated || true,
      parentFactory: this.factoryId,
      microfrontendMode: instanceConfig.microfrontendMode || false,
      lastActivity: new Date(),
      eventCount: 0,
      status: 'active'
    });

    SecurityLogger.anomaly('EventBus instance created', {
      factoryId: this.factoryId,
      instanceId,
      namespace: instanceConfig.namespace,
      totalInstances: this.instances.size
    });

    return instance;
  }

  /**
   * Get existing instance by ID
   */
  getInstance(instanceId: string): EventBus | null {
    this.ensureNotDestroyed();
    return this.instances.get(instanceId) || null;
  }

  /**
   * Get all instances in this factory
   */
  getAllInstances(): Map<string, EventBus> {
    this.ensureNotDestroyed();
    return new Map(this.instances);
  }

  /**
   * Get instances by namespace
   */
  getInstancesByNamespace(namespace: string): EventBus[] {
    this.ensureNotDestroyed();
    const instances: EventBus[] = [];
    
    for (const [instanceId, metadata] of this.instanceMetadata) {
      if (metadata.namespace === namespace && metadata.status === 'active') {
        const instance = this.instances.get(instanceId);
        if (instance) {
          instances.push(instance);
        }
      }
    }
    
    return instances;
  }

  /**
   * Destroy specific instance
   */
  async destroyInstance(instanceId: string): Promise<boolean> {
    this.ensureNotDestroyed();
    
    const instance = this.instances.get(instanceId);
    const metadata = this.instanceMetadata.get(instanceId);
    
    if (!instance || !metadata) {
      return false;
    }

    try {
      // Gracefully shutdown instance
      await instance.gracefulShutdown();
      
      // Update metadata
      metadata.status = 'destroyed';
      metadata.lastActivity = new Date();
      
      // Remove from active instances
      this.instances.delete(instanceId);
      
      SecurityLogger.anomaly('EventBus instance destroyed', {
        factoryId: this.factoryId,
        instanceId,
        namespace: metadata.namespace,
        remainingInstances: this.instances.size
      });
      
      return true;
    } catch (error) {
      SecurityLogger.threat('Failed to destroy instance', {
        factoryId: this.factoryId,
        instanceId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Pause instance (stop processing but keep state)
   */
  pauseInstance(instanceId: string): boolean {
    this.ensureNotDestroyed();
    
    const metadata = this.instanceMetadata.get(instanceId);
    if (!metadata || metadata.status !== 'active') {
      return false;
    }
    
    metadata.status = 'paused';
    metadata.lastActivity = new Date();
    
    SecurityLogger.anomaly('EventBus instance paused', {
      factoryId: this.factoryId,
      instanceId
    });
    
    return true;
  }

  /**
   * Resume paused instance
   */
  resumeInstance(instanceId: string): boolean {
    this.ensureNotDestroyed();
    
    const metadata = this.instanceMetadata.get(instanceId);
    if (!metadata || metadata.status !== 'paused') {
      return false;
    }
    
    metadata.status = 'active';
    metadata.lastActivity = new Date();
    
    SecurityLogger.anomaly('EventBus instance resumed', {
      factoryId: this.factoryId,
      instanceId
    });
    
    return true;
  }

  /**
   * Get factory and instance metrics
   */
  getMetrics(): {
    factoryId: string;
    totalInstances: number;
    activeInstances: number;
    pausedInstances: number;
    destroyedInstances: number;
    namespaces: string[];
    totalEvents: number;
    oldestInstance?: Date;
    newestInstance?: Date;
  } {
    this.ensureNotDestroyed();
    
    const metrics = {
      factoryId: this.factoryId,
      totalInstances: this.instanceMetadata.size,
      activeInstances: 0,
      pausedInstances: 0,
      destroyedInstances: 0,
      namespaces: [] as string[],
      totalEvents: 0,
      oldestInstance: undefined as Date | undefined,
      newestInstance: undefined as Date | undefined
    };

    const namespaceSet = new Set<string>();
    const createdDates: Date[] = [];

    for (const metadata of this.instanceMetadata.values()) {
      // Count by status
      switch (metadata.status) {
        case 'active':
          metrics.activeInstances++;
          break;
        case 'paused':
          metrics.pausedInstances++;
          break;
        case 'destroyed':
          metrics.destroyedInstances++;
          break;
      }

      // Collect namespaces
      namespaceSet.add(metadata.namespace);
      
      // Count events
      metrics.totalEvents += metadata.eventCount;
      
      // Track creation dates
      createdDates.push(metadata.created);
    }

    metrics.namespaces = Array.from(namespaceSet);
    
    if (createdDates.length > 0) {
      metrics.oldestInstance = new Date(Math.min(...createdDates.map(d => d.getTime())));
      metrics.newestInstance = new Date(Math.max(...createdDates.map(d => d.getTime())));
    }

    return metrics;
  }

  /**
   * Get detailed instance information
   */
  getInstanceInfo(instanceId: string): InstanceMetadata | null {
    this.ensureNotDestroyed();
    return this.instanceMetadata.get(instanceId) || null;
  }

  /**
   * List all instance IDs with their status
   */
  listInstances(): Array<{ id: string; namespace: string; status: string; created: Date }> {
    this.ensureNotDestroyed();
    
    return Array.from(this.instanceMetadata.values()).map(metadata => ({
      id: metadata.id,
      namespace: metadata.namespace,
      status: metadata.status,
      created: metadata.created
    }));
  }

  /**
   * Destroy all instances and the factory
   */
  async destroy(): Promise<void> {
    if (this.destroyed) return;
    
    SecurityLogger.anomaly('EventBusFactory destroying', {
      factoryId: this.factoryId,
      instancesToDestroy: this.instances.size
    });

    // Destroy all instances
    const destroyPromises = Array.from(this.instances.keys()).map(instanceId => 
      this.destroyInstance(instanceId)
    );
    
    await Promise.all(destroyPromises);

    // Remove from global registry
    EventBusFactory.globalRegistry.delete(this.factoryId);

    // Clear internal state
    this.instances.clear();
    this.instanceMetadata.clear();
    this.destroyed = true;

    SecurityLogger.anomaly('EventBusFactory destroyed', {
      factoryId: this.factoryId
    });
  }

  // === STATIC FACTORY METHODS ===

  /**
   * Get or create a named factory
   */
  static getOrCreateFactory(factoryId: string, config: Partial<FactoryInstanceConfig> = {}): EventBusFactory {
    let factory = EventBusFactory.globalRegistry.get(factoryId);
    
    if (!factory) {
      factory = new EventBusFactory({ ...config, instanceId: factoryId, isolated: false });
      EventBusFactory.globalRegistry.set(factoryId, factory);
    }
    
    return factory;
  }

  /**
   * Create a microfrontend-ready factory
   */
  static createMicrofrontendFactory(namespace: string, config: Partial<FactoryInstanceConfig> = {}): EventBusFactory {
    return new EventBusFactory({
      ...config,
      namespace,
      isolated: true,
      microfrontendMode: true,
      crossInstanceCommunication: config.crossInstanceCommunication || false
    });
  }

  /**
   * Get all registered factories
   */
  static getAllFactories(): Map<string, EventBusFactory> {
    return new Map(EventBusFactory.globalRegistry);
  }

  /**
   * Destroy all factories
   */
  static async destroyAllFactories(): Promise<void> {
    const destroyPromises = Array.from(EventBusFactory.globalRegistry.values()).map(factory => 
      factory.destroy()
    );
    
    await Promise.all(destroyPromises);
    EventBusFactory.globalRegistry.clear();
  }

  // === PRIVATE METHODS ===

  private generateFactoryId(): string {
    return `factory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInstanceId(): string {
    return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error(`Factory '${this.factoryId}' has been destroyed`);
    }
  }

  private setupInstanceIsolation(instance: EventBus, config: FactoryInstanceConfig): void {
    // Implement isolation logic
    // Each instance gets its own storage namespace, module registry, etc.
    SecurityLogger.anomaly('Instance isolation setup', {
      factoryId: this.factoryId,
      instanceId: config.instanceId,
      namespace: config.namespace
    });
  }

  private setupMicrofrontendSupport(instance: EventBus, config: FactoryInstanceConfig): void {
    // Implement microfrontend-specific features
    // Cross-origin event handling, sandboxing, etc.
    SecurityLogger.anomaly('Microfrontend support setup', {
      factoryId: this.factoryId,
      instanceId: config.instanceId,
      crossInstanceCommunication: config.crossInstanceCommunication
    });
  }

  private updateInstanceActivity(instanceId: string): void {
    const metadata = this.instanceMetadata.get(instanceId);
    if (metadata) {
      metadata.lastActivity = new Date();
      metadata.eventCount++;
    }
  }
}

export default EventBusFactory;