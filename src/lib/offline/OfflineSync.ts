// OfflineSync.ts - Intelligent Data Synchronization for G-Admin Mini
// Handles conflict resolution, data merging, and optimistic updates

import { EventBus } from '@/lib/events';

// IndexedDB utilities for persistent queue storage
class OfflineSyncDB {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'G_ADMIN_OFFLINE_SYNC';
  private readonly DB_VERSION = 1;
  private readonly QUEUE_STORE = 'sync_queue';
  private readonly CONFLICTS_STORE = 'sync_conflicts';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create queue store
        if (!db.objectStoreNames.contains(this.QUEUE_STORE)) {
          const queueStore = db.createObjectStore(this.QUEUE_STORE, { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('priority', 'priority');
          queueStore.createIndex('entity', 'entity');
        }
        
        // Create conflicts store
        if (!db.objectStoreNames.contains(this.CONFLICTS_STORE)) {
          const conflictsStore = db.createObjectStore(this.CONFLICTS_STORE, { keyPath: 'id' });
          conflictsStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async saveQueue(operations: SyncOperation[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(this.QUEUE_STORE);
    
    // Clear existing queue
    await store.clear();
    
    // Add all operations
    for (const operation of operations) {
      await store.add(operation);
    }
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadQueue(): Promise<SyncOperation[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(this.QUEUE_STORE, 'readonly');
    const store = tx.objectStore(this.QUEUE_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOperation(operationId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(this.QUEUE_STORE);
    await store.delete(operationId);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveConflicts(conflicts: SyncConflict[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(this.CONFLICTS_STORE, 'readwrite');
    const store = tx.objectStore(this.CONFLICTS_STORE);
    
    for (const conflict of conflicts) {
      await store.put(conflict);
    }
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadConflicts(): Promise<SyncConflict[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(this.CONFLICTS_STORE, 'readonly');
    const store = tx.objectStore(this.CONFLICTS_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async cleanupOldOperations(maxAgeDays: number = 7): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    const tx = this.db.transaction([this.QUEUE_STORE, this.CONFLICTS_STORE], 'readwrite');
    
    // Clean queue operations
    const queueStore = tx.objectStore(this.QUEUE_STORE);
    const queueIndex = queueStore.index('timestamp');
    const queueRequest = queueIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));
    
    queueRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      }
    };
    
    // Clean conflicts
    const conflictsStore = tx.objectStore(this.CONFLICTS_STORE);
    const conflictsIndex = conflictsStore.index('timestamp');
    const conflictsRequest = conflictsIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));
    
    conflictsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      }
    };
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(deletedCount);
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Sync Configuration
interface SyncConfig {
  batchSize: number;
  syncInterval: number; // milliseconds
  maxRetries: number;
  conflictResolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  priorityOrder: string[];
  enableOptimisticUpdates: boolean;
}

// Sync Operation Types
interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string; // 'orders', 'inventory', 'staff', etc.
  data: any;
  timestamp: number;
  clientId: string;
  clientOperationId: string; // For idempotency on server
  retry: number;
  priority: number;
  dependencies?: string[];
  conflictsWith?: string[];
}

interface SyncResult {
  success: boolean;
  operation: SyncOperation;
  serverResponse?: any;
  conflicts?: SyncConflict[];
  error?: string;
}

interface SyncConflict {
  id: string;
  operation: SyncOperation;
  serverData: any;
  clientData: any;
  conflictType: 'data_conflict' | 'version_conflict' | 'dependency_conflict';
  resolution?: 'resolved' | 'pending' | 'manual_required';
  resolvedData?: any;
  timestamp?: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSync: number;
  syncProgress: number; // 0-100
  errors: string[];
  conflicts: SyncConflict[];
}

class OfflineSync {
  private config: SyncConfig;
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInProgress: Map<string, boolean> = new Map();
  private clientId: string;
  private syncInterval: number | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private db: OfflineSyncDB;
  private persistedConflicts: SyncConflict[] = [];
  private isInitialized: boolean = false;
  
  // Anti-flapping protection
  private reconnectStableTimer: number | null = null;
  private lastConnectAttempt: number = 0;
  private connectionFlaps: number = 0;
  private readonly RECONNECT_STABLE_MS = 5000; // Wait 5s for stable connection
  private readonly MAX_FLAPS_THRESHOLD = 3; // Max connection changes before pausing
  private readonly FLAP_RESET_MS = 30000; // Reset flap counter after 30s
  
  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      batchSize: 10,
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      conflictResolution: 'merge',
      priorityOrder: ['orders', 'payments', 'inventory', 'staff', 'customers'],
      enableOptimisticUpdates: true,
      ...config
    };
    
    this.clientId = this.generateClientId();
    this.db = new OfflineSyncDB();
    this.initialize();
  }

  // Initialize the sync system with persistent storage
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Initialize IndexedDB
      await this.db.init();
      
      // Restore queue from IndexedDB
      const savedQueue = await this.db.loadQueue();
      if (savedQueue.length > 0) {
        // Sort by priority
        this.syncQueue = savedQueue.sort((a, b) => a.priority - b.priority);
        console.log(`[OfflineSync] Restored ${this.syncQueue.length} operations from persistent storage`);
      }
      
      // Restore conflicts
      this.persistedConflicts = await this.db.loadConflicts();
      if (this.persistedConflicts.length > 0) {
        console.log(`[OfflineSync] Restored ${this.persistedConflicts.length} conflicts from storage`);
      }
      
      // Cleanup old operations (>7 days)
      const cleanedCount = await this.db.cleanupOldOperations(7);
      if (cleanedCount > 0) {
        console.log(`[OfflineSync] Cleaned up ${cleanedCount} old operations`);
      }
      
      this.isInitialized = true;
      
      // Initialize event listeners and start sync interval
      this.initializeEventListeners();
      this.startSyncInterval();
      
      // Emit initialization complete
      this.emitEvent('initialized', { 
        queueSize: this.syncQueue.length, 
        conflictsSize: this.persistedConflicts.length 
      });
      
    } catch (error) {
      console.error('[OfflineSync] Failed to initialize persistent storage:', error);
      // Fall back to memory-only mode
      this.isInitialized = true;
      this.initializeEventListeners();
      this.startSyncInterval();
    }
  }

  // Initialize event listeners for network and app events
  private initializeEventListeners(): void {
    // Network status listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    }
    
    // App lifecycle events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // Generate unique client ID
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start automatic sync interval
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncPendingOperations();
      }
    }, this.config.syncInterval);
  }

  // Add operation to sync queue
  public async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'clientOperationId' | 'retry'>): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const syncOperation: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      clientId: this.clientId,
      clientOperationId: this.generateOperationId(), // Unique ID for idempotency
      retry: 0
    };
    
    // Insert operation in priority order
    this.insertOperationByPriority(syncOperation);
    
    // Persist queue to IndexedDB
    try {
      await this.persistQueue();
    } catch (error) {
      console.warn('[OfflineSync] Failed to persist queue to IndexedDB:', error);
    }
    
    console.log(`[OfflineSync] Queued operation: ${syncOperation.type} ${syncOperation.entity}`);
    
    // Emit event
    this.emitEvent('operationQueued', { operation: syncOperation });
    
    // Try immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      setTimeout(() => this.syncPendingOperations(), 100);
    }
    
    return syncOperation.id;
  }

  // Persist current queue to IndexedDB
  private async persistQueue(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await this.db.saveQueue(this.syncQueue);
    } catch (error) {
      console.error('[OfflineSync] Failed to persist queue:', error);
    }
  }

  // Insert operation maintaining priority order
  private insertOperationByPriority(operation: SyncOperation): void {
    const priority = this.config.priorityOrder.indexOf(operation.entity);
    operation.priority = priority === -1 ? 999 : priority;
    
    // Find correct position to insert
    let insertIndex = this.syncQueue.length;
    for (let i = 0; i < this.syncQueue.length; i++) {
      if (this.syncQueue[i].priority > operation.priority) {
        insertIndex = i;
        break;
      }
    }
    
    this.syncQueue.splice(insertIndex, 0, operation);
  }

  // Generate unique operation ID
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sync pending operations
  public async syncPendingOperations(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    console.log(`[OfflineSync] Starting sync of ${this.syncQueue.length} operations`);
    this.isSyncing = true;
    
    this.emitEvent('syncStarted', { queueSize: this.syncQueue.length });
    
    try {
      // Process operations in batches
      while (this.syncQueue.length > 0 && this.isOnline) {
        const batch = this.syncQueue.splice(0, this.config.batchSize);
        await this.processBatch(batch);
      }
      
      console.log('[OfflineSync] Sync completed successfully');
      this.emitEvent('syncCompleted', { success: true });
      
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
      this.emitEvent('syncFailed', { error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  // Process a batch of operations
  private async processBatch(batch: SyncOperation[]): Promise<void> {
    const results: SyncResult[] = [];
    const completedOperations: string[] = [];
    
    for (const operation of batch) {
      try {
        const result = await this.syncOperation(operation);
        results.push(result);
        
        if (result.success) {
          // Mark as completed - will be removed from persistent storage
          completedOperations.push(operation.id);
        } else if (operation.retry < this.config.maxRetries) {
          // Re-queue for retry
          operation.retry++;
          this.insertOperationByPriority(operation);
        } else {
          // Max retries reached, remove from queue
          completedOperations.push(operation.id);
          console.error(`[OfflineSync] Operation ${operation.id} failed after ${this.config.maxRetries} retries`);
        }
        
      } catch (error) {
        console.error(`[OfflineSync] Error processing operation ${operation.id}:`, error);
        results.push({
          success: false,
          operation,
          error: error.message
        });
        
        // Re-queue for retry if not max retries
        if (operation.retry < this.config.maxRetries) {
          operation.retry++;
          this.insertOperationByPriority(operation);
        } else {
          // Max retries reached, remove from queue
          completedOperations.push(operation.id);
        }
      }
    }
    
    // Remove completed operations from IndexedDB
    for (const operationId of completedOperations) {
      try {
        await this.db.removeOperation(operationId);
      } catch (error) {
        console.warn(`[OfflineSync] Failed to remove completed operation ${operationId} from IndexedDB:`, error);
      }
    }
    
    // Process results and conflicts
    const conflicts = results.filter(r => r.conflicts && r.conflicts.length > 0)
                            .flatMap(r => r.conflicts!);
    
    if (conflicts.length > 0) {
      await this.handleConflicts(conflicts);
    }
    
    // Persist updated queue
    if (this.syncQueue.length > 0) {
      await this.persistQueue();
    }
    
    this.emitEvent('batchProcessed', { results, conflicts });
  }

  // Sync individual operation
  private async syncOperation(operation: SyncOperation): Promise<SyncResult> {
    console.log(`[OfflineSync] Syncing operation: ${operation.type} ${operation.entity} (${operation.id})`);
    
    try {
      const endpoint = this.getEndpointForEntity(operation.entity);
      const response = await this.makeRequest(endpoint, operation);
      
      if (response.ok) {
        const serverData = await response.json();
        
        // Check for conflicts
        const conflicts = await this.detectConflicts(operation, serverData);
        
        // Emit sync success event
        await EventBus.emit('system.data_synced', {
          type: 'offline_sync_operation_completed',
          operationId: operation.id,
          operationType: operation.type,
          entity: operation.entity,
          success: true,
          hasConflicts: conflicts.length > 0
        }, 'OfflineSync');
        
        return {
          success: true,
          operation,
          serverResponse: serverData,
          conflicts: conflicts.length > 0 ? conflicts : undefined
        };
      } else {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      return {
        success: false,
        operation,
        error: error.message
      };
    }
  }

  // Make HTTP request for operation
  private async makeRequest(endpoint: string, operation: SyncOperation): Promise<Response> {
    const { type, data } = operation;
    
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-Client-ID': this.clientId,
        'X-Operation-ID': operation.id,
        'X-Timestamp': operation.timestamp.toString()
      }
    };
    
    switch (type) {
      case 'CREATE':
        requestConfig.method = 'POST';
        requestConfig.body = JSON.stringify(data);
        break;
      case 'UPDATE':
        requestConfig.method = 'PUT';
        requestConfig.body = JSON.stringify(data);
        endpoint += `/${data.id}`;
        break;
      case 'DELETE':
        requestConfig.method = 'DELETE';
        endpoint += `/${data.id}`;
        break;
    }
    
    return fetch(endpoint, requestConfig);
  }

  // Get API endpoint for entity
  private getEndpointForEntity(entity: string): string {
    const baseUrl = '/api';
    const entityEndpoints: Record<string, string> = {
      'orders': `${baseUrl}/sales/orders`,
      'payments': `${baseUrl}/sales/payments`,
      'inventory': `${baseUrl}/materials/inventory`,
      'staff': `${baseUrl}/staff/employees`,
      'customers': `${baseUrl}/customers`,
      'schedules': `${baseUrl}/scheduling`
    };
    
    return entityEndpoints[entity] || `${baseUrl}/${entity}`;
  }

  // Detect conflicts between local and server data
  private async detectConflicts(operation: SyncOperation, serverData: any): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = [];
    
    // Version-based conflict detection
    if (serverData.version && operation.data.version) {
      if (serverData.version !== operation.data.version) {
        conflicts.push({
          id: `conflict_${operation.id}`,
          operation,
          serverData,
          clientData: operation.data,
          conflictType: 'version_conflict'
        });
      }
    }
    
    // Timestamp-based conflict detection
    if (serverData.lastModified && operation.data.lastModified) {
      const serverTime = new Date(serverData.lastModified).getTime();
      const clientTime = new Date(operation.data.lastModified).getTime();
      
      if (serverTime > clientTime + 1000) { // 1 second tolerance
        conflicts.push({
          id: `conflict_${operation.id}_timestamp`,
          operation,
          serverData,
          clientData: operation.data,
          conflictType: 'data_conflict'
        });
      }
    }
    
    return conflicts;
  }

  // Handle sync conflicts
  private async handleConflicts(conflicts: SyncConflict[]): Promise<void> {
    console.log(`[OfflineSync] Handling ${conflicts.length} conflicts`);
    
    const unresolvedConflicts: SyncConflict[] = [];
    
    for (const conflict of conflicts) {
      try {
        const resolved = await this.resolveConflict(conflict);
        if (resolved) {
          console.log(`[OfflineSync] Conflict resolved: ${conflict.id}`);
        } else {
          // Add timestamp for persistence
          if (!conflict.timestamp) {
            conflict.timestamp = Date.now();
          }
          unresolvedConflicts.push(conflict);
        }
      } catch (error) {
        console.error(`[OfflineSync] Failed to resolve conflict ${conflict.id}:`, error);
        if (!conflict.timestamp) {
          conflict.timestamp = Date.now();
        }
        unresolvedConflicts.push(conflict);
      }
    }
    
    // Update persisted conflicts list
    this.persistedConflicts.push(...unresolvedConflicts);
    
    // Persist conflicts to IndexedDB
    if (unresolvedConflicts.length > 0) {
      try {
        await this.db.saveConflicts(this.persistedConflicts);
      } catch (error) {
        console.error('[OfflineSync] Failed to persist conflicts:', error);
      }
    }
    
    this.emitEvent('conflictsHandled', { 
      conflicts, 
      resolved: conflicts.length - unresolvedConflicts.length,
      unresolved: unresolvedConflicts.length
    });
  }

  // Resolve individual conflict
  private async resolveConflict(conflict: SyncConflict): Promise<boolean> {
    const { conflictType, serverData, clientData } = conflict;
    
    switch (this.config.conflictResolution) {
      case 'server_wins':
        conflict.resolvedData = serverData;
        conflict.resolution = 'resolved';
        return true;
        
      case 'client_wins':
        conflict.resolvedData = clientData;
        conflict.resolution = 'resolved';
        return true;
        
      case 'merge':
        conflict.resolvedData = this.mergeData(serverData, clientData);
        conflict.resolution = 'resolved';
        return true;
        
      case 'manual':
        conflict.resolution = 'manual_required';
        this.emitEvent('manualConflictResolution', { conflict });
        return false;
        
      default:
        return false;
    }
  }

  // Merge server and client data intelligently
  private mergeData(serverData: any, clientData: any): any {
    const merged = { ...serverData };
    
    // Merge non-conflicting fields
    for (const [key, value] of Object.entries(clientData)) {
      if (!(key in serverData)) {
        merged[key] = value;
      } else if (this.shouldUseClientValue(key, serverData[key], value)) {
        merged[key] = value;
      }
    }
    
    // Update metadata
    merged.lastModified = new Date().toISOString();
    merged.mergedFrom = [serverData.id || 'server', clientData.id || 'client'];
    
    return merged;
  }

  // Determine if client value should be used in merge
  private shouldUseClientValue(key: string, serverValue: any, clientValue: any): boolean {
    // Use client value for certain fields
    const clientPreferredFields = ['notes', 'customFields', 'localData'];
    if (clientPreferredFields.includes(key)) {
      return true;
    }
    
    // Use most recent timestamp for dated fields
    if (key.includes('Time') || key.includes('Date')) {
      return new Date(clientValue) > new Date(serverValue);
    }
    
    // Use higher numeric values for cumulative fields
    if (typeof serverValue === 'number' && typeof clientValue === 'number') {
      const cumulativeFields = ['quantity', 'amount', 'count'];
      if (cumulativeFields.some(field => key.toLowerCase().includes(field))) {
        return clientValue > serverValue;
      }
    }
    
    return false;
  }

  // Handle network online event with anti-flapping protection
  private handleOnline(): void {
    const now = Date.now();
    this.isOnline = true;
    
    // Track connection flaps
    if (now - this.lastConnectAttempt < this.FLAP_RESET_MS) {
      this.connectionFlaps++;
    } else {
      this.connectionFlaps = 1; // Reset if enough time passed
    }
    this.lastConnectAttempt = now;
    
    // Clear any existing stable timer
    if (this.reconnectStableTimer) {
      clearTimeout(this.reconnectStableTimer);
    }
    
    console.log(`[OfflineSync] Network online detected (flaps: ${this.connectionFlaps})`);
    this.emitEvent('networkOnline', { flaps: this.connectionFlaps });
    
    // If too many flaps, wait longer for stability
    const waitTime = this.connectionFlaps > this.MAX_FLAPS_THRESHOLD 
      ? this.RECONNECT_STABLE_MS * 2 
      : this.RECONNECT_STABLE_MS;
    
    // Schedule sync only after connection is stable
    this.reconnectStableTimer = window.setTimeout(() => {
      if (this.isOnline && navigator.onLine) {
        console.log('[OfflineSync] Connection stable, starting sync');
        this.syncPendingOperations();
      }
    }, waitTime);
  }

  // Handle network offline event
  private handleOffline(): void {
    console.log('[OfflineSync] Network went offline');
    this.isOnline = false;
    this.isSyncing = false;
    
    // Cancel any pending stable sync
    if (this.reconnectStableTimer) {
      clearTimeout(this.reconnectStableTimer);
      this.reconnectStableTimer = null;
    }
    
    this.emitEvent('networkOffline', { flaps: this.connectionFlaps });
  }

  // Handle service worker messages
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    switch (data.type) {
      case 'NETWORK_STATUS':
        this.isOnline = data.payload.online;
        if (this.isOnline) {
          this.handleOnline();
        } else {
          this.handleOffline();
        }
        break;
      case 'SYNC_COMPLETE':
        console.log(`[OfflineSync] Service Worker synced ${data.payload.syncedCount} items`);
        break;
    }
  }

  // Handle page visibility change
  private handleVisibilityChange(): void {
    if (!document.hidden && this.isOnline && this.syncQueue.length > 0) {
      // Page became visible, sync if needed
      setTimeout(() => this.syncPendingOperations(), 500);
    }
  }

  // Get current sync status
  public getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueSize: this.syncQueue.length,
      lastSync: this.getLastSyncTime(),
      syncProgress: this.calculateSyncProgress(),
      errors: this.getRecentErrors(),
      conflicts: this.getUnresolvedConflicts()
    };
  }

  // Get last sync time
  private getLastSyncTime(): number {
    const lastSync = localStorage.getItem('g-admin-last-sync');
    return lastSync ? parseInt(lastSync, 10) : 0;
  }

  // Calculate sync progress
  private calculateSyncProgress(): number {
    if (!this.isSyncing || this.syncQueue.length === 0) {
      return 100;
    }
    
    const totalOperations = this.getTotalOperationsCount();
    const remaining = this.syncQueue.length;
    
    return Math.round(((totalOperations - remaining) / totalOperations) * 100);
  }

  // Get total operations count
  private getTotalOperationsCount(): number {
    const stored = sessionStorage.getItem('g-admin-total-operations');
    return stored ? parseInt(stored, 10) : this.syncQueue.length;
  }

  // Get recent errors
  private getRecentErrors(): string[] {
    // This would be implemented with proper error storage
    return [];
  }

  // Get unresolved conflicts
  private getUnresolvedConflicts(): SyncConflict[] {
    return this.persistedConflicts.filter(conflict => 
      conflict.resolution === 'pending' || conflict.resolution === 'manual_required'
    );
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[OfflineSync] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Force sync now
  public async forceSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[OfflineSync] Sync already in progress');
      return;
    }
    
    await this.syncPendingOperations();
  }

  // Clear sync queue
  public async clearQueue(): Promise<void> {
    this.syncQueue = [];
    
    // Clear IndexedDB as well
    if (this.isInitialized) {
      try {
        await this.db.saveQueue([]);
        console.log('[OfflineSync] Sync queue cleared from memory and IndexedDB');
      } catch (error) {
        console.error('[OfflineSync] Failed to clear IndexedDB queue:', error);
        console.log('[OfflineSync] Sync queue cleared from memory only');
      }
    } else {
      console.log('[OfflineSync] Sync queue cleared from memory');
    }
  }

  // Destroy instance
  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    this.eventListeners.clear();
  }

  /**
   * Get the current queue size
   */
  public getQueueSize(): number {
    return this.syncQueue.length;
  }
}

// Create singleton instance
const offlineSync = new OfflineSync({
  batchSize: 10,
  syncInterval: 30000,
  maxRetries: 3,
  conflictResolution: 'merge',
  enableOptimisticUpdates: true
});

export default offlineSync;
export { OfflineSync, type SyncOperation, type SyncStatus, type SyncConflict };