// EventStore.ts - Enterprise Event Persistence with Event Sourcing
// IndexedDB-based event store with efficient querying and replay capabilities

import type {
  NamespacedEvent,
  EventPattern,
  DeduplicationMetadata,
  EventBusConfig,
  EventStore as IEventStore
} from './types';

// Event storage metadata for enhanced queries
interface StoredEvent extends NamespacedEvent {
  stored: Date;                      // When event was stored
  processed: boolean;                // Has been processed by handlers
  synced: boolean;                   // Has been synced to server
  retryCount: number;                // Number of retry attempts
  lastError?: string;                // Last processing error
}

// Query options for event retrieval
interface QueryOptions {
  pattern?: EventPattern;
  fromTimestamp?: string;
  toTimestamp?: string;
  limit?: number;
  offset?: number;
  processed?: boolean;
  synced?: boolean;
  source?: string;
  priority?: string[];
}

// Event statistics
interface EventStoreStats {
  totalEvents: number;
  unprocessedEvents: number;
  unsyncedEvents: number;
  storageSize: number;
  oldestEvent?: Date;
  newestEvent?: Date;
  eventsByPattern: Record<string, number>;
}

export class EventStoreIndexedDB implements IEventStore {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly DB_VERSION = 1;
  
  // Store names
  private readonly EVENTS_STORE = 'events';
  private readonly SNAPSHOTS_STORE = 'snapshots';
  private readonly METADATA_STORE = 'metadata';
  
  private config: EventBusConfig;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: EventBusConfig) {
    this.config = config;
    this.dbName = config.persistenceStoreName;
  }

  async init(): Promise<void> {
    console.log(`[EventStore] Starting init... (dbName: ${this.dbName})`);
    // If already initialized, return immediately
    if (this.isInitialized && this.db) {
      console.log('[EventStore] Already initialized, returning');
      return;
    }
    
    // If initialization is in progress, return the existing promise
    if (this.initPromise) {
      console.log('[EventStore] Init already in progress, awaiting...');
      return this.initPromise;
    }
    
    // Start initialization
    console.log('[EventStore] Starting new initialization...');
    this.initPromise = new Promise((resolve, reject) => {
      console.log(`[EventStore] Opening IndexedDB: ${this.dbName} v${this.DB_VERSION}`);
      const request = indexedDB.open(this.dbName, this.DB_VERSION);
      
      request.onerror = () => {
        console.error('[EventStore] Failed to open database:', request.error);
        this.initPromise = null; // Reset promise on error
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log('[EventStore] IndexedDB open success event');
        this.db = request.result;
        this.isInitialized = true;
        this.initPromise = null; // Clear promise on success
        console.log('[EventStore] Database opened successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        console.log('[EventStore] Database upgrade needed');
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
        console.log('[EventStore] Stores created during upgrade');
      };
    });
    
    return this.initPromise;
  }

  private createStores(db: IDBDatabase): void {
    // Events store - main event log
    if (!db.objectStoreNames || !db.objectStoreNames.contains(this.EVENTS_STORE)) {
      const eventsStore = db.createObjectStore(this.EVENTS_STORE, { keyPath: 'id' });
      
      // Indexes for efficient querying
      eventsStore.createIndex('timestamp', 'timestamp');
      eventsStore.createIndex('pattern', 'pattern');
      eventsStore.createIndex('source', 'source');
      eventsStore.createIndex('priority', 'metadata.priority');
      eventsStore.createIndex('processed', 'processed');
      eventsStore.createIndex('synced', 'synced');
      eventsStore.createIndex('stored', 'stored');
      eventsStore.createIndex('correlationId', 'correlationId');
      
      // Compound indexes for complex queries
      eventsStore.createIndex('pattern_timestamp', ['pattern', 'timestamp']);
      eventsStore.createIndex('source_timestamp', ['source', 'timestamp']);
      eventsStore.createIndex('processed_synced', ['processed', 'synced']);
    }
    
    // Snapshots store - for optimized replay
    if (!db.objectStoreNames.contains(this.SNAPSHOTS_STORE)) {
      const snapshotsStore = db.createObjectStore(this.SNAPSHOTS_STORE, { keyPath: 'id' });
      snapshotsStore.createIndex('pattern', 'pattern');
      snapshotsStore.createIndex('timestamp', 'timestamp');
    }
    
    // Metadata store - for system information
    if (!db.objectStoreNames.contains(this.METADATA_STORE)) {
      const metadataStore = db.createObjectStore(this.METADATA_STORE, { keyPath: 'key' });
    }
  }

  // Append event to store (Event Sourcing pattern)
  async append(event: NamespacedEvent): Promise<void> {
    console.log(`[EventStore] Starting append for event ${event.id}...`);
    if (!this.isInitialized) await this.init();
    if (!this.db) throw new Error('EventStore not initialized');
    
    const storedEvent: StoredEvent = {
      ...event,
      stored: new Date(),
      processed: false,
      synced: false,
      retryCount: 0
    };
    
    console.log(`[EventStore] Creating transaction for event ${event.id}...`);
    const tx = this.db.transaction(this.EVENTS_STORE, 'readwrite');
    const store = tx.objectStore(this.EVENTS_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(storedEvent);
      
      request.onsuccess = () => {
        console.log(`[EventStore] Event appended: ${event.pattern} (${event.id})`);
        resolve();
      };
      
      request.onerror = () => {
        console.error(`[EventStore] Failed to append event ${event.id}:`, request.error);
        reject(request.error);
      };
    });

    console.log(`[EventStore] Starting size limit enforcement for event ${event.id}...`);
    // Enforce maxEventHistorySize limit after successful append
    await this.enforceSizeLimit();
    console.log(`[EventStore] Completed append and cleanup for event ${event.id}`);
  }

  private async enforceSizeLimit(): Promise<void> {
    if (!this.db || !this.config.maxEventHistorySize) return;
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.EVENTS_STORE, 'readwrite');
      const store = tx.objectStore(this.EVENTS_STORE);
      
      // First, count total events
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        const totalEvents = countRequest.result;
        const eventsToDelete = totalEvents - this.config.maxEventHistorySize;
        
        if (eventsToDelete <= 0) {
          resolve();
          return;
        }

        console.log(`[EventStore] Enforcing size limit: deleting ${eventsToDelete} oldest events`);
        
        // Use cursor to efficiently delete oldest events by timestamp
        const index = store.index('timestamp');
        const cursorRequest = index.openCursor();
        let deletedCount = 0;
        
        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          
          if (cursor && deletedCount < eventsToDelete) {
            // Delete current event
            const deleteRequest = store.delete(cursor.primaryKey);
            
            deleteRequest.onsuccess = () => {
              deletedCount++;
              
              // Continue to next event if we haven't deleted enough
              if (deletedCount < eventsToDelete) {
                cursor.continue();
              } else {
                console.log(`[EventStore] Successfully deleted ${deletedCount} oldest events`);
                resolve();
              }
            };
            
            deleteRequest.onerror = () => {
              console.error('[EventStore] Failed to delete event:', deleteRequest.error);
              reject(deleteRequest.error);
            };
          } else {
            // No more events to delete or target reached
            resolve();
          }
        };
        
        cursorRequest.onerror = () => {
          console.error('[EventStore] Failed to open cursor for cleanup:', cursorRequest.error);
          reject(cursorRequest.error);
        };
      };
      
      countRequest.onerror = () => {
        console.error('[EventStore] Failed to count events:', countRequest.error);
        reject(countRequest.error);
      };
      
      // Handle transaction errors
      tx.onerror = () => {
        console.error('[EventStore] Transaction failed during size enforcement:', tx.error);
        reject(tx.error);
      };
      
      tx.onabort = () => {
        console.error('[EventStore] Transaction aborted during size enforcement');
        reject(new Error('Transaction aborted'));
      };
    });
  }

  // Get events with advanced querying
  async getEvents(
    pattern?: EventPattern,
    fromTimestamp?: string,
    toTimestamp?: string,
    limit: number = 1000
  ): Promise<NamespacedEvent[]> {
    if (!this.isInitialized) await this.init();
    if (!this.db) return [];
    
    const tx = this.db.transaction(this.EVENTS_STORE, 'readonly');
    const store = tx.objectStore(this.EVENTS_STORE);
    
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (pattern && fromTimestamp && toTimestamp) {
        // Use compound index for pattern + timestamp range
        const index = store.index('pattern_timestamp');
        const range = IDBKeyRange.bound(
          [pattern, fromTimestamp],
          [pattern, toTimestamp]
        );
        request = index.getAll(range, limit);
      } else if (pattern) {
        // Use pattern index
        const index = store.index('pattern');
        request = index.getAll(pattern, limit);
      } else if (fromTimestamp || toTimestamp) {
        // Use timestamp index
        const index = store.index('timestamp');
        let range: IDBKeyRange;
        
        if (fromTimestamp && toTimestamp) {
          range = IDBKeyRange.bound(fromTimestamp, toTimestamp);
        } else if (fromTimestamp) {
          range = IDBKeyRange.lowerBound(fromTimestamp);
        } else {
          range = IDBKeyRange.upperBound(toTimestamp!);
        }
        
        request = index.getAll(range, limit);
      } else {
        // Get all events (limited)
        request = store.getAll(undefined, limit);
      }
      
      request.onsuccess = () => {
        const events = (request.result as StoredEvent[]).map(this.toNamespacedEvent);
        resolve(events);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Advanced query with full options
  async query(options: QueryOptions): Promise<NamespacedEvent[]> {
    if (!this.isInitialized) await this.init();
    if (!this.db) return [];
    
    const tx = this.db.transaction(this.EVENTS_STORE, 'readonly');
    const store = tx.objectStore(this.EVENTS_STORE);
    
    return new Promise((resolve, reject) => {
      const results: NamespacedEvent[] = [];
      let request: IDBRequest;
      
      // Choose most efficient index based on query
      if (options.pattern) {
        const index = store.index('pattern_timestamp');
        request = index.openCursor();
      } else if (options.source) {
        const index = store.index('source_timestamp');  
        request = index.openCursor();
      } else if (options.processed !== undefined || options.synced !== undefined) {
        const index = store.index('processed_synced');
        request = index.openCursor();
      } else {
        const index = store.index('timestamp');
        request = index.openCursor();
      }
      
      let count = 0;
      const offset = options.offset || 0;
      const limit = options.limit || 1000;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (!cursor) {
          resolve(results);
          return;
        }
        
        const storedEvent = cursor.value as StoredEvent;
        
        // Apply filters
        if (this.matchesFilters(storedEvent, options)) {
          if (count >= offset) {
            results.push(this.toNamespacedEvent(storedEvent));
            
            if (results.length >= limit) {
              resolve(results);
              return;
            }
          }
          count++;
        }
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Mark event as processed
  async markAsProcessed(eventId: string): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction(this.EVENTS_STORE, 'readwrite');
    const store = tx.objectStore(this.EVENTS_STORE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(eventId);
      
      getRequest.onsuccess = () => {
        const event = getRequest.result as StoredEvent;
        if (event) {
          event.processed = true;
          
          const putRequest = store.put(event);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Event not found, consider as processed
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Mark event as synced to server
  async markAsSynced(eventId: string): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction(this.EVENTS_STORE, 'readwrite');
    const store = tx.objectStore(this.EVENTS_STORE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(eventId);
      
      getRequest.onsuccess = () => {
        const event = getRequest.result as StoredEvent;
        if (event) {
          event.synced = true;
          
          const putRequest = store.put(event);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Find duplicate events
  async findDuplicates(metadata: DeduplicationMetadata): Promise<NamespacedEvent[]> {
    // This would integrate with DeduplicationManager
    // For now, return empty array as deduplication is handled separately
    return [];
  }

  // Cleanup old events
  async cleanup(beforeTimestamp: string): Promise<number> {
    if (!this.db) return 0;
    
    const tx = this.db.transaction(this.EVENTS_STORE, 'readwrite');
    const store = tx.objectStore(this.EVENTS_STORE);
    const index = store.index('timestamp');
    
    let deletedCount = 0;
    
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(beforeTimestamp);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (!cursor) {
          console.log(`[EventStore] Cleaned up ${deletedCount} events`);
          resolve(deletedCount);
          return;
        }
        
        const storedEvent = cursor.value as StoredEvent;
        
        // Only delete processed and synced events
        if (storedEvent.processed && storedEvent.synced) {
          cursor.delete();
          deletedCount++;
        }
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage size and statistics
  async getSize(): Promise<number> {
    if (!this.db) return 0;
    
    return new Promise((resolve) => {
      // Estimate storage size (IndexedDB doesn't provide exact size)
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
          resolve(estimate.usage || 0);
        }).catch(() => resolve(0));
      } else {
        resolve(0);
      }
    });
  }

  // Get detailed statistics
  async getStats(): Promise<EventStoreStats> {
    if (!this.db) {
      return {
        totalEvents: 0,
        unprocessedEvents: 0,
        unsyncedEvents: 0,
        storageSize: 0,
        eventsByPattern: {}
      };
    }
    
    const tx = this.db.transaction(this.EVENTS_STORE, 'readonly');
    const store = tx.objectStore(this.EVENTS_STORE);
    
    return new Promise((resolve, reject) => {
      const stats: EventStoreStats = {
        totalEvents: 0,
        unprocessedEvents: 0,
        unsyncedEvents: 0,
        storageSize: 0,
        eventsByPattern: {}
      };
      
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (!cursor) {
          // Finalize stats
          this.getSize().then(size => {
            stats.storageSize = size;
            resolve(stats);
          });
          return;
        }
        
        const storedEvent = cursor.value as StoredEvent;
        stats.totalEvents++;
        
        if (!storedEvent.processed) stats.unprocessedEvents++;
        if (!storedEvent.synced) stats.unsyncedEvents++;
        
        // Track events by pattern
        const pattern = storedEvent.pattern;
        stats.eventsByPattern[pattern] = (stats.eventsByPattern[pattern] || 0) + 1;
        
        // Track oldest/newest
        const eventDate = new Date(storedEvent.timestamp);
        if (!stats.oldestEvent || eventDate < stats.oldestEvent) {
          stats.oldestEvent = eventDate;
        }
        if (!stats.newestEvent || eventDate > stats.newestEvent) {
          stats.newestEvent = eventDate;
        }
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Create snapshot for optimized replay
  async createSnapshot(pattern: EventPattern, data: any): Promise<void> {
    if (!this.db) return;
    
    const snapshot = {
      id: `${pattern}_${Date.now()}`,
      pattern,
      data,
      timestamp: new Date().toISOString(),
      created: new Date()
    };
    
    const tx = this.db.transaction(this.SNAPSHOTS_STORE, 'readwrite');
    const store = tx.objectStore(this.SNAPSHOTS_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put(snapshot);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Replay events from snapshot + subsequent events
  async replayFromSnapshot(pattern: EventPattern, fromTimestamp?: string): Promise<NamespacedEvent[]> {
    // Get latest snapshot
    const snapshot = await this.getLatestSnapshot(pattern);
    const startTimestamp = snapshot?.timestamp || fromTimestamp;
    
    // Get events since snapshot
    return this.getEvents(pattern, startTimestamp);
  }

  // Get latest snapshot for pattern
  private async getLatestSnapshot(pattern: EventPattern): Promise<any> {
    if (!this.db) return null;
    
    const tx = this.db.transaction(this.SNAPSHOTS_STORE, 'readonly');
    const store = tx.objectStore(this.SNAPSHOTS_STORE);
    const index = store.index('pattern');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(pattern);
      
      request.onsuccess = () => {
        const snapshots = request.result;
        if (snapshots.length === 0) {
          resolve(null);
        } else {
          // Return most recent snapshot
          const latest = snapshots.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          resolve(latest);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Helper: Check if event matches query filters
  private matchesFilters(event: StoredEvent, options: QueryOptions): boolean {
    if (options.pattern && event.pattern !== options.pattern) return false;
    if (options.source && event.source !== options.source) return false;
    if (options.processed !== undefined && event.processed !== options.processed) return false;
    if (options.synced !== undefined && event.synced !== options.synced) return false;
    
    if (options.fromTimestamp && event.timestamp < options.fromTimestamp) return false;
    if (options.toTimestamp && event.timestamp > options.toTimestamp) return false;
    
    if (options.priority && options.priority.length > 0) {
      const eventPriority = event.metadata?.priority?.toString();
      if (!eventPriority || !options.priority.includes(eventPriority)) return false;
    }
    
    return true;
  }

  // Helper: Convert StoredEvent to NamespacedEvent
  private toNamespacedEvent(storedEvent: StoredEvent): NamespacedEvent {
    const { stored, processed, synced, retryCount, lastError, ...event } = storedEvent;
    return event;
  }

  // Initialize method (alias for init for test compatibility)
  async initialize(): Promise<void> {
    return this.init();
  }

  // Close method (alias for destroy for test compatibility)
  async close(): Promise<void> {
    return this.destroy();
  }

  // Destroy and cleanup
  async destroy(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }
}