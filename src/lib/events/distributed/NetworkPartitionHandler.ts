// NetworkPartitionHandler.ts - Network partition detection and recovery
// Handles network splits and automatic healing for distributed EventBus

import { SecureLogger } from '../utils/SecureLogger';

export interface NetworkPartitionConfig {
  instanceId: string;
  busId: string;
  maxRetries: number;                   // Maximum retry attempts for failed operations
  partitionDetectionIntervalMs: number; // How often to check for partitions
  healingCheckIntervalMs: number;       // How often to check if partition has healed
  minimumConnectedInstances: number;    // Minimum instances needed to avoid partition
  partitionTimeoutMs: number;          // Time to wait before declaring partition
  circuitBreakerEnabled: boolean;      // Enable circuit breaker for failed operations
  fallbackMode: 'readonly' | 'writethrough' | 'offline';
}

export interface PartitionState {
  isPartitioned: boolean;
  partitionStartTime?: number;
  lastSuccessfulContact: number;
  connectedInstances: Set<string>;
  isolatedInstances: Set<string>;
  partitionReason: string;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

export type PartitionEventCallback = () => void;
export type HealingEventCallback = () => void;
export type OperationCallback<T> = () => Promise<T>;

export class NetworkPartitionHandler {
  private config: NetworkPartitionConfig;
  private partitionState: PartitionState;
  private circuitBreaker: CircuitBreakerState;
  private partitionCallbacks: PartitionEventCallback[] = [];
  private healingCallbacks: HealingEventCallback[] = [];
  
  // Monitoring intervals
  private partitionDetectionTimer?: number;
  private healingCheckTimer?: number;
  private heartbeatTimer?: number;
  
  // Network health tracking
  private lastHeartbeats = new Map<string, number>();
  private connectionAttempts = new Map<string, number>();
  private isDestroyed = false;

  constructor(config: NetworkPartitionConfig) {
    this.config = {
      maxRetries: 3,
      partitionDetectionIntervalMs: 5000,
      healingCheckIntervalMs: 10000,
      minimumConnectedInstances: 1,
      partitionTimeoutMs: 15000,
      circuitBreakerEnabled: true,
      fallbackMode: 'readonly',
      ...config
    };

    // Initialize states
    this.partitionState = {
      isPartitioned: false,
      lastSuccessfulContact: Date.now(),
      connectedInstances: new Set(),
      isolatedInstances: new Set(),
      partitionReason: 'none'
    };

    this.circuitBreaker = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextRetryTime: 0
    };

    this.startMonitoring();

    SecureLogger.info('EventBus', 'Network partition handler initialized', {
      instanceId: this.config.instanceId,
      fallbackMode: this.config.fallbackMode,
      minimumConnectedInstances: this.config.minimumConnectedInstances
    });
  }

  /**
   * Execute operation with partition tolerance
   */
  async executeWithPartitionTolerance<T>(
    operation: OperationCallback<T>,
    fallbackValue?: T
  ): Promise<T> {
    if (this.isDestroyed) {
      throw new Error('Partition handler has been destroyed');
    }

    // Check circuit breaker
    if (this.config.circuitBreakerEnabled && !this.isCircuitBreakerClosed()) {
      if (this.circuitBreaker.state === 'OPEN') {
        if (Date.now() < this.circuitBreaker.nextRetryTime) {
          if (fallbackValue !== undefined) {
            return fallbackValue;
          }
          throw new Error('Circuit breaker is OPEN - operation not allowed');
        } else {
          // Move to HALF_OPEN state
          this.circuitBreaker.state = 'HALF_OPEN';
        }
      }
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Success - reset circuit breaker
        this.onOperationSuccess();
        this.updateLastSuccessfulContact();
        
        return result;
      } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
        lastError = error as Error;
        
        SecureLogger.warn('EventBus', 'Operation failed - will retry', {
          attempt,
          maxRetries: this.config.maxRetries,
          error: err.message
        });

        // Check if this looks like a network partition
        if (this.isNetworkPartitionError(error as Error)) {
          this.handlePotentialPartition(error as Error);
        }

        // Exponential backoff
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.sleep(delay);
        }
      }
    }

    // All attempts failed
    this.onOperationFailure(lastError!);
    
    // Return fallback value if available
    if (fallbackValue !== undefined) {
      SecureLogger.warn('EventBus', 'All retries failed - returning fallback value', {
        error: lastError?.message
      });
      return fallbackValue;
    }

    throw new Error(`Operation failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Report instance heartbeat
   */
  reportInstanceHeartbeat(instanceId: string): void {
    const now = Date.now();
    this.lastHeartbeats.set(instanceId, now);
    this.partitionState.connectedInstances.add(instanceId);
    this.partitionState.isolatedInstances.delete(instanceId);

    // Check if partition has healed
    if (this.partitionState.isPartitioned) {
      this.checkPartitionHealing();
    }
  }

  /**
   * Register callback for partition events
   */
  onPartition(callback: PartitionEventCallback): () => void {
    this.partitionCallbacks.push(callback);
    return () => {
      const index = this.partitionCallbacks.indexOf(callback);
      if (index > -1) {
        this.partitionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register callback for healing events
   */
  onPartitionHeal(callback: HealingEventCallback): () => void {
    this.healingCallbacks.push(callback);
    return () => {
      const index = this.healingCallbacks.indexOf(callback);
      if (index > -1) {
        this.healingCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current partition status
   */
  getPartitionStatus(): 'healthy' | 'partitioned' | 'healing' {
    if (!this.partitionState.isPartitioned) {
      return 'healthy';
    }

    // Check if we're in healing phase
    const connectedCount = this.partitionState.connectedInstances.size;
    if (connectedCount >= this.config.minimumConnectedInstances) {
      return 'healing';
    }

    return 'partitioned';
  }

  /**
   * Get partition metrics
   */
  getPartitionMetrics(): {
    isPartitioned: boolean;
    partitionDuration: number;
    connectedInstances: number;
    isolatedInstances: number;
    circuitBreakerState: string;
    lastSuccessfulContact: number;
  } {
    return {
      isPartitioned: this.partitionState.isPartitioned,
      partitionDuration: this.partitionState.partitionStartTime
        ? Date.now() - this.partitionState.partitionStartTime
        : 0,
      connectedInstances: this.partitionState.connectedInstances.size,
      isolatedInstances: this.partitionState.isolatedInstances.size,
      circuitBreakerState: this.circuitBreaker.state,
      lastSuccessfulContact: this.partitionState.lastSuccessfulContact
    };
  }

  /**
   * Force partition healing check
   */
  async checkPartitionHealing(): Promise<void> {
    if (!this.partitionState.isPartitioned) {
      return;
    }

    const connectedCount = this.partitionState.connectedInstances.size;
    const now = Date.now();

    // Check if we have enough connected instances
    if (connectedCount >= this.config.minimumConnectedInstances) {
      // Verify connections are stable
      let stableConnections = 0;
      
      for (const [instanceId, lastSeen] of this.lastHeartbeats.entries()) {
        if (now - lastSeen < this.config.partitionTimeoutMs) {
          stableConnections++;
        }
      }

      if (stableConnections >= this.config.minimumConnectedInstances) {
        this.declarePartitionHealed();
      }
    }
  }

  /**
   * Start monitoring for network partitions
   */
  private startMonitoring(): void {
    // Partition detection
    this.partitionDetectionTimer = window.setInterval(() => {
      if (this.isDestroyed) return;
      this.detectNetworkPartition();
    }, this.config.partitionDetectionIntervalMs);

    // Healing check
    this.healingCheckTimer = window.setInterval(() => {
      if (this.isDestroyed) return;
      this.checkPartitionHealing();
    }, this.config.healingCheckIntervalMs);

    // Cleanup old heartbeats
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isDestroyed) return;
      this.cleanupOldHeartbeats();
    }, 30000); // Every 30 seconds
  }

  /**
   * Detect network partition based on missing heartbeats
   */
  private detectNetworkPartition(): void {
    const now = Date.now();
    const timeoutThreshold = now - this.config.partitionTimeoutMs;

    let connectedCount = 0;
    const isolatedInstances = new Set<string>();

    // Check each known instance
    for (const [instanceId, lastSeen] of this.lastHeartbeats.entries()) {
      if (lastSeen > timeoutThreshold) {
        connectedCount++;
        this.partitionState.connectedInstances.add(instanceId);
      } else {
        isolatedInstances.add(instanceId);
        this.partitionState.connectedInstances.delete(instanceId);
      }
    }

    // Update isolated instances
    this.partitionState.isolatedInstances = isolatedInstances;

    // Check if we're in a partition
    const wasPartitioned = this.partitionState.isPartitioned;
    const shouldBePartitioned = connectedCount < this.config.minimumConnectedInstances;

    if (!wasPartitioned && shouldBePartitioned) {
      this.declarePartition('insufficient_connected_instances');
    }
  }

  /**
   * Handle potential partition based on operation error
   */
  private handlePotentialPartition(error: Error): void {
    const errorMessage = err.message.toLowerCase();
    
    // Common network partition indicators
    const partitionIndicators = [
      'network error',
      'connection failed',
      'timeout',
      'unreachable',
      'connection refused',
      'dns lookup failed'
    ];

    const isNetworkIssue = partitionIndicators.some(indicator => 
      errorMessage.includes(indicator)
    );

    if (isNetworkIssue && !this.partitionState.isPartitioned) {
      this.declarePartition(err.message);
    }
  }

  /**
   * Check if error indicates network partition
   */
  private isNetworkPartitionError(error: Error): boolean {
    const errorMessage = err.message.toLowerCase();
    
    return [
      'network',
      'connection',
      'timeout',
      'unreachable',
      'refused',
      'dns',
      'broadcast',
      'channel'
    ].some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Declare network partition
   */
  private declarePartition(reason: string): void {
    if (this.partitionState.isPartitioned) {
      return;
    }

    this.partitionState.isPartitioned = true;
    this.partitionState.partitionStartTime = Date.now();
    this.partitionState.partitionReason = reason;

    SecureLogger.security('Network partition detected', {
      instanceId: this.config.instanceId,
      reason,
      connectedInstances: Array.from(this.partitionState.connectedInstances),
      isolatedInstances: Array.from(this.partitionState.isolatedInstances),
      fallbackMode: this.config.fallbackMode
    });

    // Notify callbacks
    this.partitionCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
        SecureLogger.error('EventBus', 'Error in partition callback', { error });
      }
    });
  }

  /**
   * Declare partition healed
   */
  private declarePartitionHealed(): void {
    if (!this.partitionState.isPartitioned) {
      return;
    }

    const partitionDuration = this.partitionState.partitionStartTime
      ? Date.now() - this.partitionState.partitionStartTime
      : 0;

    this.partitionState.isPartitioned = false;
    this.partitionState.partitionStartTime = undefined;
    this.partitionState.partitionReason = 'none';

    // Reset circuit breaker
    this.circuitBreaker = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextRetryTime: 0
    };

    SecureLogger.info('EventBus', 'Network partition healed', {
      instanceId: this.config.instanceId,
      partitionDuration,
      connectedInstances: Array.from(this.partitionState.connectedInstances)
    });

    // Notify healing callbacks
    this.healingCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
        SecureLogger.error('EventBus', 'Error in healing callback', { error });
      }
    });
  }

  /**
   * Handle successful operation
   */
  private onOperationSuccess(): void {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      // Successful operation in HALF_OPEN state - close circuit breaker
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.failureCount = 0;
    }
  }

  /**
   * Handle failed operation
   */
  private onOperationFailure(error: Error): void {
    if (!this.config.circuitBreakerEnabled) {
      return;
    }

    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    // Check if we should open the circuit breaker
    if (this.circuitBreaker.failureCount >= this.config.maxRetries) {
      this.circuitBreaker.state = 'OPEN';
      
      // Calculate next retry time with exponential backoff
      const backoffMs = Math.min(
        1000 * Math.pow(2, this.circuitBreaker.failureCount - this.config.maxRetries),
        30000 // Max 30 seconds
      );
      
      this.circuitBreaker.nextRetryTime = Date.now() + backoffMs;

      SecureLogger.warn('EventBus', 'Circuit breaker opened due to repeated failures', {
        failureCount: this.circuitBreaker.failureCount,
        nextRetryTime: new Date(this.circuitBreaker.nextRetryTime).toISOString(),
        error: err.message
      });
    }
  }

  /**
   * Check if circuit breaker is closed
   */
  private isCircuitBreakerClosed(): boolean {
    return this.circuitBreaker.state === 'CLOSED';
  }

  /**
   * Update last successful contact time
   */
  private updateLastSuccessfulContact(): void {
    this.partitionState.lastSuccessfulContact = Date.now();
  }

  /**
   * Clean up old heartbeat records
   */
  private cleanupOldHeartbeats(): void {
    const now = Date.now();
    const cleanupThreshold = now - (this.config.partitionTimeoutMs * 2);

    for (const [instanceId, lastSeen] of this.lastHeartbeats.entries()) {
      if (lastSeen < cleanupThreshold) {
        this.lastHeartbeats.delete(instanceId);
        this.partitionState.connectedInstances.delete(instanceId);
        this.partitionState.isolatedInstances.delete(instanceId);
        this.connectionAttempts.delete(instanceId);
        
        SecureLogger.debug('EventBus', 'Cleaned up old heartbeat record', {
          instanceId,
          lastSeen: new Date(lastSeen).toISOString()
        });
      }
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear timers
    if (this.partitionDetectionTimer) {
      clearInterval(this.partitionDetectionTimer);
    }
    
    if (this.healingCheckTimer) {
      clearInterval(this.healingCheckTimer);
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    // Clear callbacks and data
    this.partitionCallbacks = [];
    this.healingCallbacks = [];
    this.lastHeartbeats.clear();
    this.connectionAttempts.clear();
    this.partitionState.connectedInstances.clear();
    this.partitionState.isolatedInstances.clear();

    SecureLogger.info('EventBus', 'Network partition handler destroyed', {
      instanceId: this.config.instanceId
    });
  }
}

export default NetworkPartitionHandler;