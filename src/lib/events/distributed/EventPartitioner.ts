// EventPartitioner.ts - Event partitioning with ordering guarantees
// Ensures ordered delivery within partitions for distributed event processing

import { NamespacedEvent } from '../types';
import { SecureLogger } from '../utils/SecureLogger';

export interface EventPartitionerConfig {
  partitionCount: number;               // Number of partitions (default: 4)
  orderingGuarantees: boolean;          // Ensure ordered delivery within partition
  partitionStrategy: 'hash' | 'round-robin' | 'consistent-hash' | 'custom';
  maxQueueSize: number;                 // Max events per partition queue
  maxWaitTime: number;                  // Max time to wait for in-order delivery (ms)
  batchProcessing: boolean;             // Enable batch processing
  batchSize: number;                    // Events per batch
  batchTimeout: number;                 // Max time to wait for batch completion (ms)
}

export interface PartitionedEvent extends NamespacedEvent {
  partitionKey: string;                 // Key used for partitioning
  partition: number;                    // Assigned partition number
  sequenceNumber: number;               // Sequence number within partition
  batchId?: string;                     // Batch identifier for batch processing
}

export interface PartitionMetrics {
  partition: number;
  eventsProcessed: number;
  eventsQueued: number;
  averageLatency: number;
  sequenceGaps: number;                 // Number of out-of-order events
  lastSequenceNumber: number;
}

export type PartitionEventHandler = (event: PartitionedEvent) => Promise<void>;

export class EventPartitioner {
  private config: EventPartitionerConfig;
  private partitionQueues: Map<number, PartitionedEvent[]> = new Map();
  private sequenceNumbers: Map<number, number> = new Map();
  private nextExpectedSequence: Map<number, number> = new Map();
  private partitionHandlers: Map<number, PartitionEventHandler> = new Map();
  private processingTimers: Map<number, number> = new Map();
  private batchTimers: Map<number, number> = new Map();
  private partitionMetrics: Map<number, PartitionMetrics> = new Map();
  private isDestroyed = false;

  // Consistent hashing ring for improved partition distribution
  private consistentHashRing: Array<{ hash: number; partition: number }> = [];
  private readonly VIRTUAL_NODES = 100; // Virtual nodes per partition

  constructor(config: EventPartitionerConfig) {
    this.config = {
      partitionCount: 4,
      orderingGuarantees: true,
      partitionStrategy: 'consistent-hash',
      maxQueueSize: 1000,
      maxWaitTime: 5000,
      batchProcessing: false,
      batchSize: 10,
      batchTimeout: 1000,
      ...config
    };

    this.initializePartitions();
    this.initializeConsistentHashRing();

    SecureLogger.info('EventBus', 'Event partitioner initialized', {
      partitionCount: this.config.partitionCount,
      orderingGuarantees: this.config.orderingGuarantees,
      partitionStrategy: this.config.partitionStrategy
    });
  }

  /**
   * Route event to appropriate partition
   */
  async routeEvent(event: NamespacedEvent): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('Event partitioner has been destroyed');
    }

    try {
      // Determine partition key
      const partitionKey = this.getPartitionKey(event);
      
      // Assign partition
      const partition = this.assignPartition(partitionKey);
      
      // Get sequence number for this partition
      const sequenceNumber = this.getNextSequenceNumber(partition);
      
      // Create partitioned event
      const partitionedEvent: PartitionedEvent = {
        ...event,
        partitionKey,
        partition,
        sequenceNumber
      };

      // Add to appropriate queue
      await this.addToPartitionQueue(partitionedEvent);

      SecureLogger.debug('EventBus', 'Event routed to partition', {
        eventId: event.id,
        partition,
        sequenceNumber,
        partitionKey
      });
    } catch (error) {
      SecureLogger.error('EventBus', 'Failed to route event to partition', {
        eventId: event.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Register handler for a specific partition
   */
  registerPartitionHandler(partition: number, handler: PartitionEventHandler): void {
    if (partition < 0 || partition >= this.config.partitionCount) {
      throw new Error(`Invalid partition number: ${partition}`);
    }

    this.partitionHandlers.set(partition, handler);

    SecureLogger.debug('EventBus', 'Partition handler registered', { partition });
  }

  /**
   * Register handler for all partitions
   */
  registerGlobalHandler(handler: PartitionEventHandler): void {
    for (let i = 0; i < this.config.partitionCount; i++) {
      this.registerPartitionHandler(i, handler);
    }

    SecureLogger.debug('EventBus', 'Global partition handler registered');
  }

  /**
   * Get partition metrics
   */
  getPartitionMetrics(): PartitionMetrics[] {
    return Array.from(this.partitionMetrics.values());
  }

  /**
   * Get overall metrics
   */
  getOverallMetrics(): {
    totalEventsProcessed: number;
    totalEventsQueued: number;
    averageLatency: number;
    partitionBalance: number; // How balanced are the partitions (0-1, 1 = perfectly balanced)
  } {
    const metrics = this.getPartitionMetrics();
    
    const totalProcessed = metrics.reduce((sum, m) => sum + m.eventsProcessed, 0);
    const totalQueued = metrics.reduce((sum, m) => sum + m.eventsQueued, 0);
    const avgLatency = metrics.reduce((sum, m) => sum + m.averageLatency, 0) / metrics.length;
    
    // Calculate partition balance (standard deviation)
    const avgProcessed = totalProcessed / metrics.length;
    const variance = metrics.reduce((sum, m) => sum + Math.pow(m.eventsProcessed - avgProcessed, 2), 0) / metrics.length;
    const balance = avgProcessed > 0 ? Math.max(0, 1 - (Math.sqrt(variance) / avgProcessed)) : 1;

    return {
      totalEventsProcessed: totalProcessed,
      totalEventsQueued: totalQueued,
      averageLatency: avgLatency,
      partitionBalance: balance
    };
  }

  /**
   * Initialize partitions
   */
  private initializePartitions(): void {
    for (let i = 0; i < this.config.partitionCount; i++) {
      this.partitionQueues.set(i, []);
      this.sequenceNumbers.set(i, 0);
      this.nextExpectedSequence.set(i, 1);
      this.partitionMetrics.set(i, {
        partition: i,
        eventsProcessed: 0,
        eventsQueued: 0,
        averageLatency: 0,
        sequenceGaps: 0,
        lastSequenceNumber: 0
      });
    }
  }

  /**
   * Initialize consistent hash ring for better distribution
   */
  private initializeConsistentHashRing(): void {
    if (this.config.partitionStrategy !== 'consistent-hash') {
      return;
    }

    this.consistentHashRing = [];

    for (let partition = 0; partition < this.config.partitionCount; partition++) {
      for (let vnode = 0; vnode < this.VIRTUAL_NODES; vnode++) {
        const hash = this.hashFunction(`partition-${partition}-vnode-${vnode}`);
        this.consistentHashRing.push({ hash, partition });
      }
    }

    // Sort by hash value
    this.consistentHashRing.sort((a, b) => a.hash - b.hash);
  }

  /**
   * Get partition key for event
   */
  private getPartitionKey(event: NamespacedEvent): string {
    // Try multiple strategies to find a good partition key
    
    // 1. Use aggregateId if available (best for ordering)
    if ('aggregateId' in event && event.aggregateId) {
      return String(event.aggregateId);
    }
    
    // 2. Use userId for user-specific events
    if (event.userId) {
      return `user-${event.userId}`;
    }
    
    // 3. Use correlationId for correlated events
    if (event.correlationId) {
      return `correlation-${event.correlationId}`;
    }
    
    // 4. Use event source (module)
    if (event.source) {
      return `source-${event.source}`;
    }
    
    // 5. Use event pattern prefix
    const patternParts = event.pattern.split('.');
    if (patternParts.length > 1) {
      return `pattern-${patternParts[0]}`;
    }
    
    // 6. Fallback to event pattern
    return event.pattern;
  }

  /**
   * Assign partition based on partition key
   */
  private assignPartition(partitionKey: string): number {
    switch (this.config.partitionStrategy) {
      case 'hash':
        return this.hashPartition(partitionKey);
        
      case 'round-robin':
        return this.roundRobinPartition();
        
      case 'consistent-hash':
        return this.consistentHashPartition(partitionKey);
        
      case 'custom':
        return this.customPartition(partitionKey);
        
      default:
        return this.hashPartition(partitionKey);
    }
  }

  /**
   * Simple hash-based partitioning
   */
  private hashPartition(key: string): number {
    const hash = this.hashFunction(key);
    return Math.abs(hash) % this.config.partitionCount;
  }

  /**
   * Round-robin partitioning (not recommended for ordering guarantees)
   */
  private roundRobinPartition(): number {
    const partition = this.sequenceNumbers.size % this.config.partitionCount;
    return partition;
  }

  /**
   * Consistent hash partitioning for better distribution
   */
  private consistentHashPartition(key: string): number {
    if (this.consistentHashRing.length === 0) {
      return this.hashPartition(key);
    }

    const hash = this.hashFunction(key);
    
    // Find the first ring entry with hash >= our hash
    for (const entry of this.consistentHashRing) {
      if (entry.hash >= hash) {
        return entry.partition;
      }
    }
    
    // If no entry found, wrap around to the first entry
    return this.consistentHashRing[0].partition;
  }

  /**
   * Custom partitioning (placeholder for business logic)
   */
  private customPartition(key: string): number {
    // Implement custom business logic here
    // For now, fall back to hash partitioning
    return this.hashPartition(key);
  }

  /**
   * Simple hash function (djb2)
   */
  private hashFunction(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash;
  }

  /**
   * Get next sequence number for partition
   */
  private getNextSequenceNumber(partition: number): number {
    const current = this.sequenceNumbers.get(partition) || 0;
    const next = current + 1;
    this.sequenceNumbers.set(partition, next);
    return next;
  }

  /**
   * Add event to partition queue
   */
  private async addToPartitionQueue(event: PartitionedEvent): Promise<void> {
    const partition = event.partition;
    const queue = this.partitionQueues.get(partition)!;
    
    // Check queue size limit
    if (queue.length >= this.config.maxQueueSize) {
      throw new Error(`Partition ${partition} queue is full (${this.config.maxQueueSize} events)`);
    }

    // Add to queue
    queue.push(event);
    
    // Update metrics
    const metrics = this.partitionMetrics.get(partition)!;
    metrics.eventsQueued++;
    
    // Process queue
    if (this.config.orderingGuarantees) {
      await this.processPartitionQueueOrdered(partition);
    } else {
      await this.processPartitionQueueUnordered(partition);
    }
  }

  /**
   * Process partition queue with ordering guarantees
   */
  private async processPartitionQueueOrdered(partition: number): Promise<void> {
    const queue = this.partitionQueues.get(partition)!;
    const nextExpected = this.nextExpectedSequence.get(partition)!;
    const handler = this.partitionHandlers.get(partition);
    
    if (!handler) {
      return; // No handler registered yet
    }

    // Sort queue by sequence number
    queue.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    // Process events in order
    while (queue.length > 0 && queue[0].sequenceNumber === nextExpected) {
      const event = queue.shift()!;
      
      try {
        const startTime = Date.now();
        await handler(event);
        const endTime = Date.now();
        
        // Update metrics
        this.updatePartitionMetrics(partition, endTime - startTime, event.sequenceNumber);
        
        // Move to next expected sequence
        this.nextExpectedSequence.set(partition, nextExpected + 1);
      } catch (error) {
        SecureLogger.error('EventBus', 'Error processing partitioned event', {
          eventId: event.id,
          partition,
          sequenceNumber: event.sequenceNumber,
          error: error.message
        });
        
        // Re-queue the event for retry (or implement dead letter queue)
        queue.unshift(event);
        break;
      }
    }

    // Handle out-of-order events
    if (queue.length > 0 && this.config.maxWaitTime > 0) {
      this.scheduleOrderingTimeout(partition);
    }
  }

  /**
   * Process partition queue without ordering guarantees
   */
  private async processPartitionQueueUnordered(partition: number): Promise<void> {
    const queue = this.partitionQueues.get(partition)!;
    const handler = this.partitionHandlers.get(partition);
    
    if (!handler) {
      return; // No handler registered yet
    }

    // Process all events in queue
    while (queue.length > 0) {
      const event = queue.shift()!;
      
      try {
        const startTime = Date.now();
        await handler(event);
        const endTime = Date.now();
        
        // Update metrics
        this.updatePartitionMetrics(partition, endTime - startTime, event.sequenceNumber);
      } catch (error) {
        SecureLogger.error('EventBus', 'Error processing partitioned event', {
          eventId: event.id,
          partition,
          sequenceNumber: event.sequenceNumber,
          error: error.message
        });
      }
    }
  }

  /**
   * Schedule timeout for out-of-order events
   */
  private scheduleOrderingTimeout(partition: number): void {
    // Clear existing timer
    const existingTimer = this.processingTimers.get(partition);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new timer
    const timer = window.setTimeout(() => {
      this.handleOrderingTimeout(partition);
    }, this.config.maxWaitTime);

    this.processingTimers.set(partition, timer);
  }

  /**
   * Handle ordering timeout - process out-of-order events
   */
  private handleOrderingTimeout(partition: number): void {
    const queue = this.partitionQueues.get(partition)!;
    const metrics = this.partitionMetrics.get(partition)!;

    if (queue.length === 0) {
      return;
    }

    SecureLogger.warn('EventBus', 'Processing out-of-order events due to timeout', {
      partition,
      queueSize: queue.length,
      nextExpected: this.nextExpectedSequence.get(partition)
    });

    // Process all events regardless of order
    const handler = this.partitionHandlers.get(partition);
    if (handler) {
      queue.forEach(async (event) => {
        try {
          const startTime = Date.now();
          await handler(event);
          const endTime = Date.now();
          
          // Mark as sequence gap
          metrics.sequenceGaps++;
          
          this.updatePartitionMetrics(partition, endTime - startTime, event.sequenceNumber);
        } catch (error) {
          SecureLogger.error('EventBus', 'Error processing out-of-order event', {
            eventId: event.id,
            partition,
            error: error.message
          });
        }
      });

      // Clear queue and update next expected sequence
      const lastEvent = queue[queue.length - 1];
      if (lastEvent) {
        this.nextExpectedSequence.set(partition, lastEvent.sequenceNumber + 1);
      }
      
      queue.length = 0; // Clear queue
    }
  }

  /**
   * Update partition metrics
   */
  private updatePartitionMetrics(partition: number, latency: number, sequenceNumber: number): void {
    const metrics = this.partitionMetrics.get(partition)!;
    
    metrics.eventsProcessed++;
    metrics.eventsQueued = Math.max(0, metrics.eventsQueued - 1);
    metrics.lastSequenceNumber = sequenceNumber;
    
    // Update average latency using exponential moving average
    if (metrics.averageLatency === 0) {
      metrics.averageLatency = latency;
    } else {
      metrics.averageLatency = (metrics.averageLatency * 0.9) + (latency * 0.1);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear all timers
    for (const timer of this.processingTimers.values()) {
      clearTimeout(timer);
    }
    
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }

    // Clear all maps
    this.partitionQueues.clear();
    this.sequenceNumbers.clear();
    this.nextExpectedSequence.clear();
    this.partitionHandlers.clear();
    this.processingTimers.clear();
    this.batchTimers.clear();
    this.partitionMetrics.clear();
    this.consistentHashRing = [];

    SecureLogger.info('EventBus', 'Event partitioner destroyed');
  }
}

export default EventPartitioner;