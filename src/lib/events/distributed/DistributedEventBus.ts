// DistributedEventBus.ts - Multi-instance coordination layer
// Extends EventBus with distributed capabilities for microfrontends

import { EventBus } from '../EventBus';
import { 
  EventBusConfig, 
  NamespacedEvent, 
  EventPattern, 
  ModuleId,
  IEventBus
} from '../types';
import { BrowserLeaderElection } from './BrowserLeaderElection';
import { CrossInstanceCoordinator } from './CrossInstanceCoordinator';
import { DistributedEventStore } from './DistributedEventStore';
import { EventPartitioner } from './EventPartitioner';
import { NetworkPartitionHandler } from './NetworkPartitionHandler';
import { SecureLogger } from '../utils/SecureLogger';

export interface DistributedConfig extends EventBusConfig {
  // Distributed-specific configuration
  distributed: {
    enabled: boolean;
    busId: string;                    // Unique identifier for this bus instance
    instanceId: string;               // Unique identifier for this browser instance
    leaderElection: {
      enabled: boolean;
      heartbeatIntervalMs: number;    // Leader heartbeat frequency (default: 2000)
      electionTimeoutMs: number;      // Election timeout (default: 5000)
    };
    crossInstance: {
      enabled: boolean;
      broadcastChannelName: string;   // BroadcastChannel name
      maxMessageSize: number;         // Max message size in bytes (default: 64KB)
      compressionEnabled: boolean;    // Enable message compression
    };
    partitioning: {
      enabled: boolean;
      partitionCount: number;         // Number of event partitions (default: 4)
      orderingGuarantees: boolean;    // Ensure ordered delivery within partition
    };
    resilience: {
      partitionTolerance: boolean;    // Continue operating during network partitions
      conflictResolution: 'lastWriteWins' | 'vectorClock' | 'custom';
      circuitBreakerEnabled: boolean;
      maxRetries: number;
    };
  };
}

export interface DistributedEventMetadata {
  instanceId: string;
  busId: string;
  partition?: string;
  sequenceNumber?: number;
  vectorClock?: Map<string, number>;
  isFromRemoteInstance: boolean;
  propagationPath: string[];        // Track event propagation for debugging
}

export class DistributedEventBus extends EventBus implements IEventBus {
  private distributedConfig: DistributedConfig['distributed'];
  private leaderElection?: BrowserLeaderElection;
  private crossInstanceCoordinator?: CrossInstanceCoordinator;
  private distributedStore?: DistributedEventStore;
  private eventPartitioner?: EventPartitioner;
  private partitionHandler?: NetworkPartitionHandler;
  private isDistributedEnabled: boolean;
  private connectedInstances = new Set<string>();

  constructor(config: DistributedConfig) {
    super(config);
    
    this.distributedConfig = config.distributed;
    this.isDistributedEnabled = this.distributedConfig.enabled;

    if (this.isDistributedEnabled) {
      this.initializeDistributedLayer();
    }

    SecureLogger.info('EventBus', 'DistributedEventBus initialized', {
      distributed: this.isDistributedEnabled,
      busId: this.distributedConfig.busId,
      instanceId: this.distributedConfig.instanceId
    });
  }

  /**
   * Initialize the distributed coordination layer
   */
  private async initializeDistributedLayer(): Promise<void> {
    try {
      // Initialize leader election
      if (this.distributedConfig.leaderElection.enabled) {
        this.leaderElection = new BrowserLeaderElection({
          channelName: `leader-${this.distributedConfig.busId}`,
          instanceId: this.distributedConfig.instanceId,
          heartbeatInterval: this.distributedConfig.leaderElection.heartbeatIntervalMs,
          electionTimeout: this.distributedConfig.leaderElection.electionTimeoutMs
        });

        this.leaderElection.onLeadershipChange((isLeader) => {
          SecureLogger.info('EventBus', 'Leadership changed', { 
            isLeader,
            instanceId: this.distributedConfig.instanceId
          });
        });
      }

      // Initialize cross-instance coordination
      if (this.distributedConfig.crossInstance.enabled) {
        this.crossInstanceCoordinator = new CrossInstanceCoordinator({
          channelName: this.distributedConfig.crossInstance.broadcastChannelName,
          instanceId: this.distributedConfig.instanceId,
          busId: this.distributedConfig.busId,
          maxMessageSize: this.distributedConfig.crossInstance.maxMessageSize,
          compressionEnabled: this.distributedConfig.crossInstance.compressionEnabled
        });

        this.crossInstanceCoordinator.onRemoteEvent(
          (_event) => this.handleRemoteEvent(event)
        );
      }

      // Initialize distributed storage
      this.distributedStore = new DistributedEventStore({
        busId: this.distributedConfig.busId,
        instanceId: this.distributedConfig.instanceId,
        conflictResolution: this.distributedConfig.resilience.conflictResolution
      });

      // Initialize event partitioning
      if (this.distributedConfig.partitioning.enabled) {
        this.eventPartitioner = new EventPartitioner({
          partitionCount: this.distributedConfig.partitioning.partitionCount,
          orderingGuarantees: this.distributedConfig.partitioning.orderingGuarantees
        });
      }

      // Initialize network partition handling
      if (this.distributedConfig.resilience.partitionTolerance) {
        this.partitionHandler = new NetworkPartitionHandler({
          instanceId: this.distributedConfig.instanceId,
          busId: this.distributedConfig.busId,
          maxRetries: this.distributedConfig.resilience.maxRetries
        });

        this.partitionHandler.onPartitionHeal(() => {
          this.syncAfterPartitionHeal();
        });
      }

      SecureLogger.info('EventBus', 'Distributed layer initialized successfully');
    } catch (error) {
      SecureLogger.error('EventBus', 'Failed to initialize distributed layer', { error });
      // Gracefully degrade to local-only mode
      this.isDistributedEnabled = false;
    }
  }

  /**
   * Override emit to include distributed propagation
   */
  async emit<TPayload = any>(
    pattern: EventPattern,
    payload: TPayload,
    options?: any
  ): Promise<void> {
    const enhancedOptions = {
      ...options,
      distributed: {
        instanceId: this.distributedConfig.instanceId,
        busId: this.distributedConfig.busId,
        isFromRemoteInstance: false,
        propagationPath: [this.distributedConfig.instanceId]
      }
    };

    // Local emission first (existing EventBus logic)
    await super.emit(pattern, payload, enhancedOptions);

    // Distributed propagation if enabled and event should be propagated
    if (this.isDistributedEnabled && this.shouldPropagateEvent(pattern, options)) {
      await this.propagateToOtherInstances(pattern, payload, enhancedOptions);
    }
  }

  /**
   * Propagate event to other instances
   */
  private async propagateToOtherInstances<TPayload = any>(
    pattern: EventPattern,
    payload: TPayload,
    options: any
  ): Promise<void> {
    try {
      // Only leader propagates global events to avoid duplication
      if (pattern.startsWith('global.') && this.leaderElection) {
        const isLeader = await this.leaderElection.isLeader();
        if (!isLeader) {
          SecureLogger.debug('EventBus', 'Skipping global event propagation - not leader', {
            pattern,
            instanceId: this.distributedConfig.instanceId
          });
          return;
        }
      }

      // Create distributed event
      const distributedEvent = this.createDistributedEvent(pattern, payload, options);

      // Apply partitioning if enabled
      if (this.eventPartitioner) {
        await this.eventPartitioner.routeEvent(distributedEvent);
      } else if (this.crossInstanceCoordinator) {
        // Direct cross-instance delivery
        await this.crossInstanceCoordinator.propagateEvent(distributedEvent);
      }

      SecureLogger.debug('EventBus', 'Event propagated to other instances', {
        pattern,
        instanceId: this.distributedConfig.instanceId
      });
    } catch (error) {
      SecureLogger.error('EventBus', 'Failed to propagate event to other instances', {
        pattern,
        error: error.message
      });

      // Circuit breaker pattern - fail gracefully
      if (this.distributedConfig.resilience.circuitBreakerEnabled) {
        await this.handlePropagationFailure(pattern, error);
      }
    }
  }

  /**
   * Handle events received from other instances
   */
  private async handleRemoteEvent(event: NamespacedEvent & DistributedEventMetadata): Promise<void> {
    try {
      // Prevent infinite loops
      if (event.propagationPath.includes(this.distributedConfig.instanceId)) {
        SecureLogger.debug('EventBus', 'Ignoring event - already processed by this instance', {
          eventId: event.id,
          pattern: event.pattern
        });
        return;
      }

      // Add this instance to propagation path
      event.propagationPath.push(this.distributedConfig.instanceId);

      // Store in distributed store for durability
      if (this.distributedStore) {
        await this.distributedStore.storeRemoteEvent(event);
      }

      // Process locally (without further distribution)
      const localOptions = {
        ...event.metadata,
        distributed: {
          ...event,
          isFromRemoteInstance: true
        }
      };

      await super.emit(event.pattern, event.payload, localOptions);

      SecureLogger.debug('EventBus', 'Remote event processed successfully', {
        eventId: event.id,
        pattern: event.pattern,
        fromInstance: event.instanceId
      });
    } catch (error) {
      SecureLogger.error('EventBus', 'Failed to handle remote event', {
        eventId: event.id,
        pattern: event.pattern,
        error: error.message
      });
    }
  }

  /**
   * Create distributed event with metadata
   */
  private createDistributedEvent<TPayload = any>(
    pattern: EventPattern,
    payload: TPayload,
    options: any
  ): NamespacedEvent<TPayload> & DistributedEventMetadata {
    const baseEvent = {
      id: `${this.distributedConfig.instanceId}-${Date.now()}-${Math.random().toString(36)}`,
      pattern,
      payload,
      timestamp: new Date().toISOString(),
      source: this.distributedConfig.instanceId,
      version: '2.1.0',
      correlationId: options?.correlationId,
      userId: options?.userId,
      metadata: options?.metadata || {}
    };

    return {
      ...baseEvent,
      instanceId: this.distributedConfig.instanceId,
      busId: this.distributedConfig.busId,
      isFromRemoteInstance: false,
      propagationPath: options?.distributed?.propagationPath || [this.distributedConfig.instanceId]
    };
  }

  /**
   * Determine if event should be propagated to other instances
   */
  private shouldPropagateEvent(pattern: EventPattern, options?: any): boolean {
    // Don't propagate events that are already from remote instances
    if (options?.distributed?.isFromRemoteInstance) {
      return false;
    }

    // Don't propagate local-only events
    if (pattern.includes('.local.')) {
      return false;
    }

    // Don't propagate if explicitly disabled
    if (options?.distributed === false) {
      return false;
    }

    return true;
  }

  /**
   * Sync events after network partition heals
   */
  private async syncAfterPartitionHeal(): Promise<void> {
    try {
      SecureLogger.info('EventBus', 'Starting post-partition sync');

      if (this.distributedStore) {
        const missedEvents = await this.distributedStore.getMissedEventsDuringPartition();
        
        for (const event of missedEvents) {
          await this.handleRemoteEvent(event);
        }

        SecureLogger.info('EventBus', 'Post-partition sync completed', {
          syncedEvents: missedEvents.length
        });
      }
    } catch (error) {
      SecureLogger.error('EventBus', 'Failed to sync after partition heal', { error });
    }
  }

  /**
   * Handle propagation failures with circuit breaker pattern
   */
  private async handlePropagationFailure(pattern: EventPattern, error: Error): Promise<void> {
    SecureLogger.security('Event propagation failure detected', {
      pattern,
      error: error.message,
      instanceId: this.distributedConfig.instanceId
    });

    // Could implement circuit breaker logic here
    // For now, just log and continue
  }

  /**
   * Get distributed metrics
   */
  async getDistributedMetrics(): Promise<{
    instanceId: string;
    busId: string;
    isLeader: boolean;
    connectedInstances: number;
    eventsPropagate: number;
    eventsReceived: number;
    partitionStatus: 'healthy' | 'partitioned' | 'healing';
  }> {
    const baseMetrics = await super.getMetrics();
    
    return {
      ...baseMetrics,
      instanceId: this.distributedConfig.instanceId,
      busId: this.distributedConfig.busId,
      isLeader: this.leaderElection ? await this.leaderElection.isLeader() : false,
      connectedInstances: this.crossInstanceCoordinator ? 
        await this.crossInstanceCoordinator.getConnectedInstanceCount() : 0,
      eventsPropagate: this.crossInstanceCoordinator ? 
        this.crossInstanceCoordinator.getPropagatedEventCount() : 0,
      eventsReceived: this.crossInstanceCoordinator ? 
        this.crossInstanceCoordinator.getReceivedEventCount() : 0,
      partitionStatus: this.partitionHandler ? 
        this.partitionHandler.getPartitionStatus() : 'healthy'
    };
  }

  /**
   * Get distributed status
   */
  getDistributedStatus(): {
    isLeader: boolean;
    connectedInstances: number;
    partitionStatus: string;
  } {
    return {
      isLeader: this.leaderElection?.isLeader() ?? false,
      connectedInstances: this.connectedInstances.size,
      partitionStatus: this.partitionHandler?.getPartitionStatus() ?? 'unknown'
    };
  }

  /**
   * Register callback for network partition events
   */
  onNetworkPartition(callback: () => void): () => void {
    if (this.partitionHandler) {
      return this.partitionHandler.onPartition(callback);
    }
    return () => {};
  }

  /**
   * Register callback for partition healed events
   */
  onPartitionHealed(callback: () => void): () => void {
    if (this.partitionHandler) {
      return this.partitionHandler.onPartitionHeal(callback);
    }
    return () => {};
  }

  /**
   * Register callback for leadership changes
   */
  onLeadershipChange(callback: (isLeader: boolean) => void): () => void {
    if (this.leaderElection) {
      return this.leaderElection.onLeadershipChange(callback);
    }
    return () => {};
  }

  /**
   * Register callback for instance shutdown events
   */
  onInstanceShutdown(callback: (instanceId: string) => void): () => void {
    return () => {}; // Placeholder implementation
  }

  /**
   * Get distributed metrics
   */
  getDistributedMetrics(): {
    eventsPropagated: number;
    eventsReceived: number;
    connectedInstances: number;
    partitionStatus: string;
    leadershipDuration: number;
    averageLatency: number;
  } {
    const crossStats = this.crossInstanceCoordinator?.getStats() || {};
    
    return {
      eventsPropagated: crossStats.eventsPropagated || 0,
      eventsReceived: crossStats.eventsReceived || 0,
      connectedInstances: this.connectedInstances.size,
      partitionStatus: this.partitionHandler?.getPartitionStatus() || 'unknown',
      leadershipDuration: this.leaderElection?.getLeadershipMetrics()?.totalLeadershipDuration || 0,
      averageLatency: crossStats.averageLatency || 0
    };
  }

  /**
   * Get connected instances count
   */
  async getConnectedInstances(): Promise<string[]> {
    if (this.crossInstanceCoordinator) {
      const count = await this.crossInstanceCoordinator.getConnectedInstanceCount();
      return Array.from({ length: count }, (_, i) => `instance-${i}`);
    }
    return [];
  }

  /**
   * Override destroy to include distributed cleanup
   */
  async destroy(): Promise<void> {
    await this.gracefulShutdown();
  }

  /**
   * Graceful shutdown with distributed coordination
   */
  async gracefulShutdown(timeoutMs = 10000): Promise<void> {
    try {
      SecureLogger.info('EventBus', 'Starting distributed graceful shutdown');

      // Step down from leadership if leader
      if (this.leaderElection && await this.leaderElection.isLeader()) {
        await this.leaderElection.stepDown();
      }

      // Notify other instances of shutdown
      if (this.crossInstanceCoordinator) {
        await this.crossInstanceCoordinator.notifyShutdown();
      }

      // Shutdown distributed components
      const shutdownPromises = [
        this.leaderElection?.destroy(),
        this.crossInstanceCoordinator?.destroy(),
        this.distributedStore?.close(),
        this.eventPartitioner?.destroy(),
        this.partitionHandler?.destroy()
      ].filter(Boolean);

      await Promise.allSettled(shutdownPromises);

      // Call parent graceful shutdown
      await super.gracefulShutdown(timeoutMs);

      SecureLogger.info('EventBus', 'Distributed graceful shutdown completed');
    } catch (error) {
      SecureLogger.error('EventBus', 'Error during distributed graceful shutdown', { error });
      throw error;
    }
  }
}

export default DistributedEventBus;