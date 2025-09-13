// Distributed EventBus - Clean API exports
// Complete distributed event system for microfrontend architectures

// Main distributed EventBus implementation
export { DistributedEventBus } from './DistributedEventBus';
export type { DistributedConfig, ConflictResolutionStrategy, PartitionStrategy } from './DistributedEventBus';

// Core distributed components
export { BrowserLeaderElection } from './BrowserLeaderElection';
export { CrossInstanceCoordinator } from './CrossInstanceCoordinator';
export { DistributedEventStore } from './DistributedEventStore';
export { EventPartitioner } from './EventPartitioner';
export { NetworkPartitionHandler } from './NetworkPartitionHandler';

// Factory for managing multiple instances
export { DistributedEventBusFactory } from './DistributedEventBusFactory';

// Type definitions for distributed features
export type {
  // Main distributed config
  DistributedConfig,
  DistributedEventBusConfig,
  
  // Leader election types
  LeaderElectionConfig,
  LeaderElectionMessage,
  LeadershipStatus,
  LeaderElectionCallback,
  
  // Cross-instance communication
  CrossInstanceConfig,
  CrossInstanceMessage,
  InstanceInfo,
  RemoteEventCallback,
  
  // Distributed storage
  DistributedStoreConfig,
  ConflictResolutionStrategy,
  ConflictResolutionResult,
  VectorClock,
  StoredEvent,
  
  // Event partitioning
  PartitionConfig,
  PartitionStrategy,
  PartitioningCallback,
  PartitionInfo,
  PartitionQueue,
  
  // Network partition handling
  NetworkPartitionConfig,
  PartitionState,
  CircuitBreakerState,
  PartitionEventCallback,
  HealingEventCallback,
  OperationCallback,
  
  // Factory types
  DistributedFactoryConfig,
  MicrofrontendFactoryOptions,
  FactoryInstanceInfo
} from './DistributedEventBus';

// Re-export specific interfaces for convenience
export type {
  LeaderElectionConfig,
  CrossInstanceConfig,
  DistributedStoreConfig,
  PartitionConfig,
  NetworkPartitionConfig
} from './DistributedEventBus';

// Constants for common configurations
export const DISTRIBUTED_CONSTANTS = {
  // Default channel names
  CHANNELS: {
    LEADER_ELECTION: 'eventbus-leader-election',
    CROSS_INSTANCE: 'eventbus-cross-instance',
    PARTITION_MONITORING: 'eventbus-partition-monitor'
  },
  
  // Default timeouts (ms)
  TIMEOUTS: {
    LEADER_ELECTION: 5000,
    CROSS_INSTANCE_ACK: 5000,
    PARTITION_DETECTION: 15000,
    HEARTBEAT_INTERVAL: 3000
  },
  
  // Default limits
  LIMITS: {
    MAX_MESSAGE_SIZE: 64 * 1024, // 64KB
    MAX_INSTANCES: 10,
    MAX_PARTITIONS: 16,
    MAX_RETRIES: 3
  },
  
  // Storage keys
  STORAGE_KEYS: {
    EVENTS: 'distributed-events',
    METADATA: 'distributed-metadata',
    VECTOR_CLOCKS: 'vector-clocks'
  }
} as const;

// Utility functions for distributed setup
export const createDistributedConfig = (overrides: Partial<DistributedConfig> = {}): DistributedConfig => ({
  instanceId: `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  busId: 'default-bus',
  distributed: {
    enabled: true,
    leaderElection: {
      enabled: true,
      channelName: DISTRIBUTED_CONSTANTS.CHANNELS.LEADER_ELECTION,
      electionTimeoutMs: DISTRIBUTED_CONSTANTS.TIMEOUTS.LEADER_ELECTION,
      heartbeatIntervalMs: DISTRIBUTED_CONSTANTS.TIMEOUTS.HEARTBEAT_INTERVAL,
      maxInstances: DISTRIBUTED_CONSTANTS.LIMITS.MAX_INSTANCES
    },
    crossInstance: {
      enabled: true,
      channelName: DISTRIBUTED_CONSTANTS.CHANNELS.CROSS_INSTANCE,
      maxMessageSize: DISTRIBUTED_CONSTANTS.LIMITS.MAX_MESSAGE_SIZE,
      compressionEnabled: true,
      acknowledgmentTimeout: DISTRIBUTED_CONSTANTS.TIMEOUTS.CROSS_INSTANCE_ACK,
      retryAttempts: DISTRIBUTED_CONSTANTS.LIMITS.MAX_RETRIES
    },
    storage: {
      enabled: true,
      storeName: DISTRIBUTED_CONSTANTS.STORAGE_KEYS.EVENTS,
      conflictResolution: 'vectorClock' as ConflictResolutionStrategy,
      maxStorageSize: 50 * 1024 * 1024, // 50MB
      compressionEnabled: true
    },
    partitioning: {
      enabled: true,
      strategy: 'consistentHash' as PartitionStrategy,
      partitionCount: 8,
      orderingGuarantee: 'partition',
      loadBalancing: true
    },
    networkPartition: {
      enabled: true,
      maxRetries: DISTRIBUTED_CONSTANTS.LIMITS.MAX_RETRIES,
      partitionDetectionIntervalMs: 5000,
      healingCheckIntervalMs: 10000,
      minimumConnectedInstances: 1,
      partitionTimeoutMs: DISTRIBUTED_CONSTANTS.TIMEOUTS.PARTITION_DETECTION,
      circuitBreakerEnabled: true,
      fallbackMode: 'readonly'
    }
  },
  ...overrides
});

// Preset configurations for common use cases
export const DISTRIBUTED_PRESETS = {
  // Microfrontend with isolated instances
  MICROFRONTEND_ISOLATED: (busId: string) => createDistributedConfig({
    busId,
    distributed: {
      enabled: true,
      crossInstance: {
        enabled: false // Isolated instances don't communicate
      }
    }
  }),
  
  // Microfrontend with cross-communication
  MICROFRONTEND_COORDINATED: (busId: string) => createDistributedConfig({
    busId,
    distributed: {
      enabled: true,
      crossInstance: {
        enabled: true,
        compressionEnabled: true
      },
      leaderElection: {
        enabled: true
      }
    }
  }),
  
  // High-availability configuration
  HIGH_AVAILABILITY: (busId: string) => createDistributedConfig({
    busId,
    distributed: {
      enabled: true,
      networkPartition: {
        enabled: true,
        circuitBreakerEnabled: true,
        fallbackMode: 'writethrough',
        minimumConnectedInstances: 2
      },
      storage: {
        enabled: true,
        conflictResolution: 'vectorClock'
      }
    }
  }),
  
  // Performance-optimized configuration
  PERFORMANCE_OPTIMIZED: (busId: string) => createDistributedConfig({
    busId,
    distributed: {
      enabled: true,
      crossInstance: {
        enabled: true,
        compressionEnabled: true,
        maxMessageSize: 32 * 1024 // Smaller messages
      },
      partitioning: {
        enabled: true,
        strategy: 'consistentHash',
        partitionCount: 16, // More partitions for better distribution
        loadBalancing: true
      }
    }
  })
} as const;

// Export everything as default for convenience
export default {
  DISTRIBUTED_CONSTANTS,
  DISTRIBUTED_PRESETS,
  createDistributedConfig
};