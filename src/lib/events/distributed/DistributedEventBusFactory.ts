// DistributedEventBusFactory.ts - Factory pattern for managing multiple distributed EventBus instances
// Supports microfrontend architecture with isolated instances and cross-instance communication

import { DistributedEventBus, DistributedConfig } from './DistributedEventBus';
import { EventBusConfig, ModuleId } from '../types';
import { SecureLogger } from '../utils/SecureLogger';

export interface FactoryConfig {
  factoryId: string;
  defaultBusConfig?: Partial<DistributedConfig>;
  crossInstanceCommunication: boolean;    // Enable communication between instances
  isolated: boolean;                      // Enable isolation between instances
  maxInstances?: number;                  // Maximum number of instances (default: 10)
  autoCleanup?: boolean;                  // Auto cleanup inactive instances (default: true)
  cleanupIntervalMs?: number;             // Cleanup interval (default: 5 minutes)
}

export interface InstanceConfig {
  instanceId: string;
  namespace: string;                      // Namespace for storage and events
  config?: Partial<DistributedConfig>;    // Instance-specific configuration
  modules?: ModuleId[];                   // Modules to register automatically
  isolated?: boolean;                     // Override factory isolation setting
}

export interface InstanceInfo {
  instanceId: string;
  namespace: string;
  busId: string;
  status: 'creating' | 'active' | 'paused' | 'error' | 'destroying';
  created: Date;
  lastActivity: Date;
  metrics: {
    eventsProcessed: number;
    eventsEmitted: number;
    activeModules: number;
  };
}

export interface FactoryMetrics {
  factoryId: string;
  totalInstances: number;
  activeInstances: number;
  pausedInstances: number;
  errorInstances: number;
  namespaces: string[];
  totalEventsProcessed: number;
  uptime: number;
}

export class DistributedEventBusFactory {
  private config: FactoryConfig;
  private instances = new Map<string, DistributedEventBus>();
  private instanceInfo = new Map<string, InstanceInfo>();
  private cleanupTimer?: number;
  private createdAt: Date;
  private isDestroyed = false;

  // Static registry for global factory management
  private static globalRegistry = new Map<string, DistributedEventBusFactory>();

  constructor(config: FactoryConfig) {
    this.config = {
      maxInstances: 10,
      autoCleanup: true,
      cleanupIntervalMs: 5 * 60 * 1000, // 5 minutes
      ...config
    };

    this.createdAt = new Date();

    // Register in global registry
    DistributedEventBusFactory.globalRegistry.set(this.config.factoryId, this);

    if (this.config.autoCleanup) {
      this.startCleanupTimer();
    }

    SecureLogger.info('EventBus', 'Distributed EventBus factory created', {
      factoryId: this.config.factoryId,
      crossInstanceCommunication: this.config.crossInstanceCommunication,
      isolated: this.config.isolated,
      maxInstances: this.config.maxInstances
    });
  }

  /**
   * Create a new EventBus instance
   */
  async createInstance(instanceConfig: InstanceConfig): Promise<DistributedEventBus> {
    if (this.isDestroyed) {
      throw new Error('Factory has been destroyed');
    }

    const { instanceId, namespace } = instanceConfig;

    // Check if instance already exists
    if (this.instances.has(instanceId)) {
      throw new Error(`Instance ${instanceId} already exists`);
    }

    // Check max instances limit
    if (this.instances.size >= this.config.maxInstances!) {
      throw new Error(`Maximum instances limit reached (${this.config.maxInstances})`);
    }

    try {
      // Create instance info
      const info: InstanceInfo = {
        instanceId,
        namespace,
        busId: this.generateBusId(instanceId, namespace),
        status: 'creating',
        created: new Date(),
        lastActivity: new Date(),
        metrics: {
          eventsProcessed: 0,
          eventsEmitted: 0,
          activeModules: 0
        }
      };

      this.instanceInfo.set(instanceId, info);

      // Merge configurations
      const mergedConfig = this.mergeConfigurations(instanceConfig);

      // Create EventBus instance
      const eventBus = new DistributedEventBus(mergedConfig);

      // Store instance
      this.instances.set(instanceId, eventBus);

      // Update status
      info.status = 'active';
      info.lastActivity = new Date();

      // Setup activity tracking
      this.setupActivityTracking(instanceId, eventBus);

      SecureLogger.info('EventBus', 'EventBus instance created', {
        factoryId: this.config.factoryId,
        instanceId,
        namespace,
        busId: info.busId
      });

      return eventBus;
    } catch (error) {
      // Update status on error
      const info = this.instanceInfo.get(instanceId);
      if (info) {
        info.status = 'error';
      }

      SecureLogger.error('EventBus', 'Failed to create EventBus instance', {
        factoryId: this.config.factoryId,
        instanceId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get existing instance
   */
  getInstance(instanceId: string): DistributedEventBus | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Pause instance (stop processing but keep in memory)
   */
  async pauseInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    const info = this.instanceInfo.get(instanceId);

    if (!instance || !info) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    try {
      // For now, we don't have a built-in pause mechanism in EventBus
      // This could be implemented by disconnecting from distributed layers
      info.status = 'paused';
      info.lastActivity = new Date();

      SecureLogger.info('EventBus', 'EventBus instance paused', {
        factoryId: this.config.factoryId,
        instanceId
      });
    } catch (error) {
      info.status = 'error';
      throw error;
    }
  }

  /**
   * Resume paused instance
   */
  async resumeInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    const info = this.instanceInfo.get(instanceId);

    if (!instance || !info) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    try {
      info.status = 'active';
      info.lastActivity = new Date();

      SecureLogger.info('EventBus', 'EventBus instance resumed', {
        factoryId: this.config.factoryId,
        instanceId
      });
    } catch (error) {
      info.status = 'error';
      throw error;
    }
  }

  /**
   * Destroy specific instance
   */
  async destroyInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    const info = this.instanceInfo.get(instanceId);

    if (!instance || !info) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    try {
      info.status = 'destroying';

      // Graceful shutdown
      await instance.gracefulShutdown();

      // Remove from maps
      this.instances.delete(instanceId);
      this.instanceInfo.delete(instanceId);

      SecureLogger.info('EventBus', 'EventBus instance destroyed', {
        factoryId: this.config.factoryId,
        instanceId
      });
    } catch (error) {
      SecureLogger.error('EventBus', 'Error destroying EventBus instance', {
        factoryId: this.config.factoryId,
        instanceId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get all instances
   */
  getAllInstances(): Map<string, DistributedEventBus> {
    return new Map(this.instances);
  }

  /**
   * Get instance information
   */
  getInstanceInfo(instanceId?: string): InstanceInfo[] {
    if (instanceId) {
      const info = this.instanceInfo.get(instanceId);
      return info ? [info] : [];
    }

    return Array.from(this.instanceInfo.values());
  }

  /**
   * Get factory metrics
   */
  async getMetrics(): Promise<FactoryMetrics> {
    const instances = Array.from(this.instanceInfo.values());

    const totalEventsProcessed = instances.reduce(
      (sum, info) => sum + info.metrics.eventsProcessed,
      0
    );

    return {
      factoryId: this.config.factoryId,
      totalInstances: this.instances.size,
      activeInstances: instances.filter(i => i.status === 'active').length,
      pausedInstances: instances.filter(i => i.status === 'paused').length,
      errorInstances: instances.filter(i => i.status === 'error').length,
      namespaces: [...new Set(instances.map(i => i.namespace))],
      totalEventsProcessed,
      uptime: Date.now() - this.createdAt.getTime()
    };
  }

  /**
   * Broadcast event to all instances
   */
  async broadcastEvent(pattern: string, payload: any, options?: any): Promise<void> {
    const promises = Array.from(this.instances.entries()).map(async ([instanceId, eventBus]) => {
      try {
        await eventBus.emit(pattern, payload, options);
      } catch (error) {
        SecureLogger.error('EventBus', 'Error broadcasting event to instance', {
          factoryId: this.config.factoryId,
          instanceId,
          pattern,
          error: error.message
        });
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Merge factory and instance configurations
   */
  private mergeConfigurations(instanceConfig: InstanceConfig): DistributedConfig {
    const baseConfig: DistributedConfig = {
      // Standard EventBus configuration
      maxEventHistorySize: 5000,
      maxConcurrentEvents: 50,
      defaultEventTimeout: 30000,
      handlerTimeoutMs: 5000,
      persistenceEnabled: true,
      persistenceStoreName: `eventbus-${instanceConfig.namespace}`,
      maxStorageSize: 25 * 1024 * 1024, // 25MB per instance
      deduplicationEnabled: true,
      defaultDeduplicationWindow: 5 * 60 * 1000,
      cleanupIntervalMs: 2 * 60 * 1000,
      defaultRetryPolicy: {
        maxAttempts: 3,
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 30000,
        retryableErrors: ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT']
      },
      metricsEnabled: true,
      healthCheckIntervalMs: 30000,
      testModeEnabled: false,
      offlineSyncEnabled: true,

      // Distributed configuration
      distributed: {
        enabled: true,
        busId: this.generateBusId(instanceConfig.instanceId, instanceConfig.namespace),
        instanceId: instanceConfig.instanceId,
        leaderElection: {
          enabled: true,
          heartbeatIntervalMs: 2000,
          electionTimeoutMs: 5000
        },
        crossInstance: {
          enabled: this.config.crossInstanceCommunication,
          broadcastChannelName: `eventbus-${this.config.factoryId}`,
          maxMessageSize: 64 * 1024,
          compressionEnabled: true
        },
        partitioning: {
          enabled: true,
          partitionCount: 4,
          orderingGuarantees: true
        },
        resilience: {
          partitionTolerance: true,
          conflictResolution: 'vectorClock',
          circuitBreakerEnabled: true,
          maxRetries: 3
        }
      }
    };

    // Apply factory defaults
    const configWithDefaults = this.deepMerge(baseConfig, this.config.defaultBusConfig || {});

    // Apply instance-specific configuration
    const finalConfig = this.deepMerge(configWithDefaults, instanceConfig.config || {});

    // Override isolation if specified
    if (instanceConfig.isolated !== undefined) {
      finalConfig.distributed.crossInstance.enabled = !instanceConfig.isolated;
    } else if (this.config.isolated) {
      finalConfig.distributed.crossInstance.enabled = false;
    }

    return finalConfig;
  }

  /**
   * Generate unique bus ID for instance
   */
  private generateBusId(instanceId: string, namespace: string): string {
    return `${this.config.factoryId}-${namespace}-${instanceId}`;
  }

  /**
   * Setup activity tracking for instance
   */
  private setupActivityTracking(instanceId: string, eventBus: DistributedEventBus): void {
    // This would require hooking into the EventBus to track activity
    // For now, we'll update lastActivity periodically
    const updateActivity = () => {
      const info = this.instanceInfo.get(instanceId);
      if (info && info.status === 'active') {
        info.lastActivity = new Date();
        
        // Update metrics (this would need to be implemented in EventBus)
        eventBus.getMetrics().then(metrics => {
          info.metrics = {
            eventsProcessed: metrics.totalEvents || 0,
            eventsEmitted: metrics.totalEvents || 0,
            activeModules: metrics.activeModules || 0
          };
        }).catch(() => {
          // Ignore metrics errors
        });
      }
    };

    // Update activity every 30 seconds
    setInterval(updateActivity, 30000);
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      if (this.isDestroyed) return;
      this.performCleanup();
    }, this.config.cleanupIntervalMs!);
  }

  /**
   * Perform cleanup of inactive instances
   */
  private performCleanup(): void {
    const now = Date.now();
    const inactivityThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [instanceId, info] of this.instanceInfo.entries()) {
      // Skip active instances
      if (info.status === 'active' || info.status === 'creating') {
        continue;
      }

      // Check if instance has been inactive too long
      const inactiveTime = now - info.lastActivity.getTime();
      if (inactiveTime > inactivityThreshold) {
        SecureLogger.info('EventBus', 'Cleaning up inactive instance', {
          factoryId: this.config.factoryId,
          instanceId,
          inactiveTime,
          status: info.status
        });

        this.destroyInstance(instanceId).catch(error => {
          SecureLogger.error('EventBus', 'Error during cleanup', {
            instanceId,
            error: error.message
          });
        });
      }
    }
  }

  /**
   * Deep merge configuration objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Destroy factory and all instances
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Destroy all instances
    const destroyPromises = Array.from(this.instances.keys()).map(instanceId => 
      this.destroyInstance(instanceId)
    );

    await Promise.allSettled(destroyPromises);

    // Remove from global registry
    DistributedEventBusFactory.globalRegistry.delete(this.config.factoryId);

    SecureLogger.info('EventBus', 'Distributed EventBus factory destroyed', {
      factoryId: this.config.factoryId
    });
  }

  // Static factory management methods

  /**
   * Create microfrontend factory with preset configuration
   */
  static createMicrofrontendFactory(
    factoryId: string, 
    options: { crossInstanceCommunication: boolean; isolated: boolean }
  ): DistributedEventBusFactory {
    return new DistributedEventBusFactory({
      factoryId,
      crossInstanceCommunication: options.crossInstanceCommunication,
      isolated: options.isolated,
      maxInstances: 20, // Higher limit for microfrontends
      autoCleanup: true,
      defaultBusConfig: {
        persistenceEnabled: true,
        deduplicationEnabled: true,
        distributed: {
          enabled: true,
          leaderElection: {
            enabled: true,
            heartbeatIntervalMs: 3000,
            electionTimeoutMs: 8000
          },
          partitioning: {
            enabled: true,
            partitionCount: 2, // Smaller partition count for microfrontends
            orderingGuarantees: true
          },
          resilience: {
            partitionTolerance: true,
            conflictResolution: 'lastWriteWins', // Simpler conflict resolution
            circuitBreakerEnabled: true,
            maxRetries: 2
          }
        }
      }
    });
  }

  /**
   * Get or create global factory
   */
  static getOrCreateFactory(
    factoryId: string, 
    config?: FactoryConfig
  ): DistributedEventBusFactory {
    const existing = this.globalRegistry.get(factoryId);
    if (existing) {
      return existing;
    }

    return new DistributedEventBusFactory(config || {
      factoryId,
      crossInstanceCommunication: true,
      isolated: false
    });
  }

  /**
   * Get all factories
   */
  static getAllFactories(): Map<string, DistributedEventBusFactory> {
    return new Map(this.globalRegistry);
  }

  /**
   * Destroy all factories
   */
  static async destroyAllFactories(): Promise<void> {
    const destroyPromises = Array.from(this.globalRegistry.values()).map(factory =>
      factory.destroy()
    );

    await Promise.allSettled(destroyPromises);
  }
}

export default DistributedEventBusFactory;