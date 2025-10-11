// DistributedEventStore.ts - Distributed event persistence with conflict resolution
// Implements partition-tolerant event storage using IndexedDB

import { NamespacedEvent } from '../types';
import { SecureLogger } from '../utils/SecureLogger';

export interface DistributedStoreConfig {
  busId: string;
  instanceId: string;
  dbName?: string;
  conflictResolution: 'lastWriteWins' | 'vectorClock' | 'custom';
  replicationFactor?: number;           // Number of replicas to maintain
  readQuorum?: number;                  // Minimum replicas for read operations
  writeQuorum?: number;                 // Minimum replicas for write operations
  maxStorageSize?: number;              // Maximum storage size in bytes
  compactionIntervalMs?: number;        // How often to compact old events
}

export interface StoredEvent extends NamespacedEvent {
  // Distributed storage metadata
  storageId: string;                    // Unique storage identifier
  vectorClock: Map<string, number>;     // Vector clock for ordering
  instanceOrigin: string;               // Instance that first stored this event
  replicationLevel: number;             // How many instances have this event
  lastModified: number;                 // When this record was last modified
  tombstone?: boolean;                  // Soft delete marker
}

export interface VectorClock {
  [instanceId: string]: number;
}

export interface ConflictResolutionResult {
  winningEvent: StoredEvent;
  conflictResolved: boolean;
  strategy: string;
}

export class DistributedEventStore {
  private config: DistributedStoreConfig;
  private db: IDBDatabase | null = null;
  private vectorClock: Map<string, number> = new Map();
  private isInitialized = false;
  private compactionTimer?: number;

  constructor(config: DistributedStoreConfig) {
    this.config = {
      dbName: `distributed-eventstore-${config.busId}`,
      replicationFactor: 2,
      readQuorum: 1,
      writeQuorum: 1,
      maxStorageSize: 100 * 1024 * 1024, // 100MB
      compactionIntervalMs: 60 * 60 * 1000, // 1 hour
      ...config
    };

    // Initialize vector clock
    this.vectorClock.set(this.config.instanceId, 0);

    this.initialize();
  }

  /**
   * Initialize the distributed store
   */
  private async initialize(): Promise<void> {
    try {
      this.db = await this.openDatabase();
      this.startCompactionTimer();
      this.isInitialized = true;

      SecureLogger.info('EventBus', 'Distributed event store initialized', {
        busId: this.config.busId,
        instanceId: this.config.instanceId,
        dbName: this.config.dbName
      });
    } catch (error) {
      SecureLogger.error('EventBus', 'Failed to initialize distributed event store', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Open IndexedDB database
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName!, 1);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (_event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Events store
        if (!db.objectStoreNames || !db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', {
            keyPath: 'storageId'
          });

          // Indexes for efficient querying
          eventStore.createIndex('eventId', 'id', { unique: false });
          eventStore.createIndex('pattern', 'pattern', { unique: false });
          eventStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventStore.createIndex('instanceOrigin', 'instanceOrigin', { unique: false });
          eventStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Vector clocks store
        if (!db.objectStoreNames.contains('vectorClocks')) {
          db.createObjectStore('vectorClocks', {
            keyPath: 'instanceId'
          });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', {
            keyPath: 'key'
          });
        }
      };
    });
  }

  /**
   * Store event with distributed metadata
   */
  async storeEvent(event: NamespacedEvent): Promise<StoredEvent> {
    if (!this.isInitialized || !this.db) {
      throw new Error('Distributed store not initialized');
    }

    // Increment our vector clock
    const currentTime = this.incrementVectorClock();

    // Create stored event with distributed metadata
    const storedEvent: StoredEvent = {
      ...event,
      storageId: this.generateStorageId(event),
      vectorClock: new Map(this.vectorClock),
      instanceOrigin: this.config.instanceId,
      replicationLevel: 1,
      lastModified: currentTime
    };

    // Store in IndexedDB
    await this.writeToDatabase(storedEvent);

    SecureLogger.debug('EventBus', 'Event stored in distributed store', {
      eventId: event.id,
      storageId: storedEvent.storageId,
      vectorClock: Object.fromEntries(storedEvent.vectorClock)
    });

    return storedEvent;
  }

  /**
   * Store remote event (from another instance)
   */
  async storeRemoteEvent(event: NamespacedEvent & any): Promise<void> {
    if (!this.isInitialized || !this.db) {
      throw new Error('Distributed store not initialized');
    }

    // Update our vector clock with remote vector clock
    if (event.vectorClock) {
      this.mergeVectorClock(event.vectorClock);
    }

    const storageId = this.generateStorageId(event);
    
    // Check if we already have this event
    const existingEvent = await this.getEventByStorageId(storageId);
    
    if (existingEvent) {
      // Resolve conflict if needed
      const resolution = await this.resolveConflict(existingEvent, event);
      
      if (resolution.conflictResolved && resolution.winningEvent !== existingEvent) {
        await this.writeToDatabase(resolution.winningEvent);
        
        SecureLogger.info('EventBus', 'Conflict resolved in distributed store', {
          eventId: event.id,
          strategy: resolution.strategy
        });
      }
    } else {
      // Store new remote event
      const storedEvent: StoredEvent = {
        ...event,
        storageId,
        vectorClock: new Map(Object.entries(event.vectorClock || {})),
        instanceOrigin: event.instanceOrigin || event.instanceId,
        replicationLevel: (event.replicationLevel || 0) + 1,
        lastModified: Date.now()
      };

      await this.writeToDatabase(storedEvent);
    }
  }

  /**
   * Get events that were missed during network partition
   */
  async getMissedEventsDuringPartition(): Promise<StoredEvent[]> {
    if (!this.isInitialized || !this.db) {
      return [];
    }

    // Get the last known vector clock state
    const lastKnownState = await this.getLastKnownVectorClockState();
    
    if (!lastKnownState) {
      return [];
    }

    // Find events that happened after our last known state
    const transaction = this.db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const events: StoredEvent[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (_event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          const storedEvent = cursor.value as StoredEvent;
          
          // Check if this event happened after our last known state
          if (this.eventHappenedAfterState(storedEvent, lastKnownState)) {
            events.push(storedEvent);
          }
          
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get missed events: ${request.error}`));
      };
    });
  }

  /**
   * Resolve conflicts between two versions of the same event
   */
  private async resolveConflict(
    local: StoredEvent, 
    remote: NamespacedEvent & any
  ): Promise<ConflictResolutionResult> {
    switch (this.config.conflictResolution) {
      case 'lastWriteWins':
        return this.resolveLastWriteWins(local, remote);
        
      case 'vectorClock':
        return this.resolveWithVectorClock(local, remote);
        
      case 'custom':
        return this.resolveCustom(local, remote);
        
      default:
        return {
          winningEvent: local,
          conflictResolved: false,
          strategy: 'no-resolution'
        };
    }
  }

  /**
   * Last-write-wins conflict resolution
   */
  private resolveLastWriteWins(
    local: StoredEvent, 
    remote: NamespacedEvent & any
  ): ConflictResolutionResult {
    const localTime = new Date(local.timestamp).getTime();
    const remoteTime = new Date(remote.timestamp).getTime();

    if (remoteTime > localTime) {
      return {
        winningEvent: {
          ...remote,
          storageId: local.storageId,
          vectorClock: new Map(Object.entries(remote.vectorClock || {})),
          instanceOrigin: remote.instanceOrigin || remote.instanceId,
          replicationLevel: Math.max(local.replicationLevel, remote.replicationLevel || 0),
          lastModified: Date.now()
        },
        conflictResolved: true,
        strategy: 'last-write-wins'
      };
    }

    return {
      winningEvent: local,
      conflictResolved: false,
      strategy: 'last-write-wins'
    };
  }

  /**
   * Vector clock conflict resolution
   */
  private resolveWithVectorClock(
    local: StoredEvent, 
    remote: NamespacedEvent & any
  ): ConflictResolutionResult {
    const localVC = local.vectorClock;
    const remoteVC = new Map(Object.entries(remote.vectorClock || {}));

    // Check if remote happens-before local
    if (this.happensBefore(remoteVC, localVC)) {
      return {
        winningEvent: local,
        conflictResolved: false,
        strategy: 'vector-clock-local-wins'
      };
    }

    // Check if local happens-before remote
    if (this.happensBefore(localVC, remoteVC)) {
      return {
        winningEvent: {
          ...remote,
          storageId: local.storageId,
          vectorClock: remoteVC,
          instanceOrigin: remote.instanceOrigin || remote.instanceId,
          replicationLevel: Math.max(local.replicationLevel, remote.replicationLevel || 0),
          lastModified: Date.now()
        },
        conflictResolved: true,
        strategy: 'vector-clock-remote-wins'
      };
    }

    // Concurrent events - use deterministic tie-breaking
    const winner = local.id.localeCompare(remote.id) > 0 ? local : {
      ...remote,
      storageId: local.storageId,
      vectorClock: remoteVC,
      instanceOrigin: remote.instanceOrigin || remote.instanceId,
      replicationLevel: Math.max(local.replicationLevel, remote.replicationLevel || 0),
      lastModified: Date.now()
    };

    return {
      winningEvent: winner as StoredEvent,
      conflictResolved: winner !== local,
      strategy: 'vector-clock-deterministic'
    };
  }

  /**
   * Custom conflict resolution (placeholder for business logic)
   */
  private resolveCustom(
    local: StoredEvent, 
    remote: NamespacedEvent & any
  ): ConflictResolutionResult {
    // Implement custom business logic here
    // For now, fall back to last-write-wins
    return this.resolveLastWriteWins(local, remote);
  }

  /**
   * Check if vector clock A happens-before vector clock B
   */
  private happensBefore(clockA: Map<string, number>, clockB: Map<string, number>): boolean {
    let hasSmaller = false;
    
    // Get all instance IDs from both clocks
    const allInstances = new Set([...clockA.keys(), ...clockB.keys()]);
    
    for (const instanceId of allInstances) {
      const timeA = clockA.get(instanceId) || 0;
      const timeB = clockB.get(instanceId) || 0;
      
      if (timeA > timeB) {
        return false; // A cannot happen-before B
      }
      
      if (timeA < timeB) {
        hasSmaller = true;
      }
    }
    
    return hasSmaller;
  }

  /**
   * Get event by storage ID
   */
  private async getEventByStorageId(storageId: string): Promise<StoredEvent | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      const request = store.get(storageId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get event: ${request.error}`));
      };
    });
  }

  /**
   * Write event to database
   */
  private async writeToDatabase(event: StoredEvent): Promise<void> {
    if (!this.db) {
      throw new Error('Database not available');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      // Convert Map to plain object for storage
      const eventToStore = {
        ...event,
        vectorClock: Object.fromEntries(event.vectorClock)
      };
      
      const request = store.put(eventToStore);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to write event: ${request.error}`));
      };
    });
  }

  /**
   * Generate storage ID for event
   */
  private generateStorageId(event: NamespacedEvent): string {
    // Use event ID + source for uniqueness across instances
    return `${event.source}-${event.id}`;
  }

  /**
   * Increment local vector clock
   */
  private incrementVectorClock(): number {
    const currentTime = Date.now();
    const currentValue = this.vectorClock.get(this.config.instanceId) || 0;
    const newValue = Math.max(currentValue + 1, currentTime);
    
    this.vectorClock.set(this.config.instanceId, newValue);
    return newValue;
  }

  /**
   * Merge remote vector clock with local
   */
  private mergeVectorClock(remoteVectorClock: VectorClock | Map<string, number>): void {
    const remoteClock = remoteVectorClock instanceof Map 
      ? remoteVectorClock 
      : new Map(Object.entries(remoteVectorClock));

    for (const [instanceId, remoteTime] of remoteClock) {
      const localTime = this.vectorClock.get(instanceId) || 0;
      this.vectorClock.set(instanceId, Math.max(localTime, remoteTime));
    }

    // Always increment our own clock
    this.incrementVectorClock();
  }

  /**
   * Get last known vector clock state
   */
  private async getLastKnownVectorClockState(): Promise<Map<string, number> | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get('lastKnownVectorClock');

      request.onsuccess = () => {
        if (request.result) {
          resolve(new Map(Object.entries(request.result.value)));
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get last known state: ${request.error}`));
      };
    });
  }

  /**
   * Check if event happened after a given state
   */
  private eventHappenedAfterState(
    event: StoredEvent, 
    lastKnownState: Map<string, number>
  ): boolean {
    const eventOrigin = event.instanceOrigin;
    const eventTime = event.vectorClock.get(eventOrigin) || 0;
    const lastKnownTime = lastKnownState.get(eventOrigin) || 0;

    return eventTime > lastKnownTime;
  }

  /**
   * Start compaction timer
   */
  private startCompactionTimer(): void {
    this.compactionTimer = window.setInterval(() => {
      this.compactOldEvents().catch(error => {
        SecureLogger.error('EventBus', 'Error during event compaction', { error });
      });
    }, this.config.compactionIntervalMs);
  }

  /**
   * Compact old events to manage storage size
   */
  private async compactOldEvents(): Promise<void> {
    if (!this.db) return;

    try {
      // Get current storage size
      const currentSize = await this.getStorageSize();
      
      if (currentSize > this.config.maxStorageSize!) {
        // Remove oldest events
        const eventsToRemove = Math.ceil(currentSize * 0.1); // Remove 10%
        await this.removeOldestEvents(eventsToRemove);
        
        SecureLogger.info('EventBus', 'Event compaction completed', {
          removedEvents: eventsToRemove,
          previousSize: currentSize
        });
      }
    } catch (error) {
      SecureLogger.error('EventBus', 'Error during event compaction', { error });
    }
  }

  /**
   * Get current storage size
   */
  private async getStorageSize(): Promise<number> {
    // Estimate based on event count (simplified)
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      const request = store.count();

      request.onsuccess = () => {
        // Rough estimate: 1KB per event
        resolve(request.result * 1024);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get storage size: ${request.error}`));
      };
    });
  }

  /**
   * Remove oldest events
   */
  private async removeOldestEvents(count: number): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    const index = store.index('lastModified');

    let removed = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor();

      request.onsuccess = (_event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor && removed < count) {
          cursor.delete();
          removed++;
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to remove old events: ${request.error}`));
      };
    });
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.compactionTimer) {
      clearInterval(this.compactionTimer);
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.isInitialized = false;

    SecureLogger.info('EventBus', 'Distributed event store closed', {
      instanceId: this.config.instanceId
    });
  }
}

export default DistributedEventStore;