// DeduplicationManager.ts - Enterprise Event Deduplication System
// Prevents duplicate events with content hashing, semantic keys, and temporal windows

import type {
  NamespacedEvent,
  DeduplicationMetadata,
  EventBusConfig
} from './types';

// Fast crypto-js alternative using Web Crypto API
class CryptoUtils {
  static async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// IndexedDB store for deduplication metadata
class DeduplicationStore {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'G_ADMIN_EVENTBUS_V2_DEDUPLICATION';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'deduplication_metadata';

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'contentHash' });
          
          // Indexes for efficient querying
          store.createIndex('operationId', 'operationId', { unique: true });
          store.createIndex('semanticKey', 'semanticKey');
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('clientId', 'clientId');
        }
      };
    });
  }

  async store(metadata: DeduplicationMetadata): Promise<void> {
    if (!this.db) throw new Error('DeduplicationStore not initialized');
    
    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...metadata,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async findByContentHash(contentHash: string): Promise<DeduplicationMetadata | null> {
    if (!this.db) return null;
    
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(contentHash);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async findByOperationId(operationId: string): Promise<DeduplicationMetadata | null> {
    if (!this.db) return null;
    
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const index = store.index('operationId');
    
    return new Promise((resolve, reject) => {
      const request = index.get(operationId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async findBySemanticKey(semanticKey: string, withinMs: number): Promise<DeduplicationMetadata[]> {
    if (!this.db) return [];
    
    const cutoffTime = Date.now() - withinMs;
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const index = store.index('semanticKey');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(semanticKey);
      
      request.onsuccess = () => {
        const results = (request.result || []).filter(
          item => item.timestamp > cutoffTime
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(olderThanMs: number): Promise<number> {
    if (!this.db) return 0;
    
    const cutoffTime = Date.now() - olderThanMs;
    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const index = store.index('timestamp');
    
    let deletedCount = 0;
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// Main deduplication manager
export class DeduplicationManager {
  private store: DeduplicationStore;
  private config: EventBusConfig;
  private clientId: string;
  private cleanupTimer: number | null = null;

  constructor(config: EventBusConfig) {
    this.config = config;
    this.store = new DeduplicationStore();
    this.clientId = this.generateClientId();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.config.deduplicationEnabled) return;
    
    try {
      await this.store.init();
      this.startCleanupTimer();
      console.log('[DeduplicationManager] Initialized successfully');
    } catch (error) {
      console.error('[DeduplicationManager] Failed to initialize:', error);
    }
  }

  private generateClientId(): string {
    // Generate persistent client ID
    const stored = localStorage.getItem('g-admin-client-id');
    if (stored) return stored;
    
    const clientId = `client_${Date.now()}_${crypto.randomUUID?.() || CryptoUtils.generateId()}`;
    localStorage.setItem('g-admin-client-id', clientId);
    return clientId;
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = window.setInterval(async () => {
      try {
        const cleaned = await this.store.cleanup(24 * 60 * 60 * 1000); // 24 hours
        if (cleaned > 0) {
          console.log(`[DeduplicationManager] Cleaned up ${cleaned} old entries`);
        }
      } catch (error) {
        console.error('[DeduplicationManager] Cleanup error:', error);
      }
    }, this.config.cleanupIntervalMs);
  }

  // Generate deduplication metadata for an event
  async generateMetadata(event: NamespacedEvent): Promise<DeduplicationMetadata> {
    const normalizedPayload = this.normalizePayload(event.payload);
    const contentHash = await CryptoUtils.sha256(JSON.stringify({
      pattern: event.pattern,
      payload: normalizedPayload,
      source: event.source
    }));
    
    const operationId = CryptoUtils.generateId();
    const semanticKey = this.generateSemanticKey(event);
    
    return {
      contentHash,
      operationId,
      clientId: this.clientId,
      semanticKey,
      attempts: 0,
      windowMs: this.config.defaultDeduplicationWindow
    };
  }

  // Check if event is a duplicate using multiple strategies
  async isDuplicate(
    event: NamespacedEvent,
    metadata: DeduplicationMetadata
  ): Promise<{ isDupe: boolean; reason?: string; existing?: DeduplicationMetadata }> {
    if (!this.config.deduplicationEnabled) {
      return { isDupe: false };
    }

    try {
      // Strategy 1: Content-based deduplication (exact payload match)
      const existingByContent = await this.store.findByContentHash(metadata.contentHash);
      if (existingByContent) {
        return {
          isDupe: true,
          reason: 'content_hash',
          existing: existingByContent
        };
      }

      // Strategy 2: Operation-based deduplication (same operation ID)
      const existingByOperation = await this.store.findByOperationId(metadata.operationId);
      if (existingByOperation) {
        return {
          isDupe: true,
          reason: 'operation_id',
          existing: existingByOperation
        };
      }

      // Strategy 3: Semantic deduplication (same entity + action within time window)
      const semanticDuplicates = await this.store.findBySemanticKey(
        metadata.semanticKey,
        metadata.windowMs
      );
      
      if (semanticDuplicates.length > 0) {
        // Check if any semantic duplicate is from same client
        const sameClientDupe = semanticDuplicates.find(d => d.clientId === metadata.clientId);
        if (sameClientDupe) {
          return {
            isDupe: true,
            reason: 'semantic_same_client',
            existing: sameClientDupe
          };
        }
        
        // For cross-client semantic duplication, be more conservative
        // Only consider duplicate if very recent (< 30 seconds)
        const recentDuplicates = semanticDuplicates.filter(
          d => (Date.now() - (d.timestamp || 0)) < 30000
        );
        
        if (recentDuplicates.length > 0) {
          return {
            isDupe: true,
            reason: 'semantic_cross_client',
            existing: recentDuplicates[0]
          };
        }
      }

      return { isDupe: false };
      
    } catch (error) {
      console.error('[DeduplicationManager] Error checking duplicates:', error);
      // On error, allow event to proceed (fail open)
      return { isDupe: false };
    }
  }

  // Store deduplication metadata
  async storeMetadata(metadata: DeduplicationMetadata): Promise<void> {
    if (!this.config.deduplicationEnabled) return;
    
    try {
      await this.store.store(metadata);
    } catch (error) {
      console.error('[DeduplicationManager] Error storing metadata:', error);
    }
  }

  // Update attempt count for retry scenarios
  async incrementAttempts(metadata: DeduplicationMetadata): Promise<void> {
    metadata.attempts++;
    await this.storeMetadata(metadata);
  }

  // Normalize payload for consistent hashing
  private normalizePayload(payload: any): any {
    if (payload === null || payload === undefined) return payload;
    
    if (typeof payload !== 'object') return payload;
    
    // Remove timestamp fields that might vary between identical operations
    const normalized = { ...payload };
    delete normalized.timestamp;
    delete normalized.createdAt;
    delete normalized.updatedAt;
    delete normalized.lastModified;
    
    // Sort object keys for consistent hashing
    const sortedKeys = Object.keys(normalized).sort();
    const sorted: any = {};
    
    for (const key of sortedKeys) {
      sorted[key] = this.normalizePayload(normalized[key]);
    }
    
    return sorted;
  }

  // Generate semantic key for business-logic deduplication
  private generateSemanticKey(event: NamespacedEvent): string {
    const { pattern, payload } = event;
    
    // Extract entity information from pattern
    const [namespace, action] = pattern.split('.').slice(-2);
    
    // Try to extract entity ID from payload
    let entityId = 'unknown';
    if (payload && typeof payload === 'object') {
      entityId = payload.id || payload.entityId || payload.orderId || 
                payload.customerId || payload.materialId || payload.staffId ||
                'no-id';
    }
    
    return `${namespace}:${entityId}:${action}`;
  }

  // Get deduplication statistics
  async getStats(): Promise<{
    totalEntries: number;
    oldestEntry?: Date;
    newestEntry?: Date;
    clientId: string;
  }> {
    // This would require additional IndexedDB queries
    // For now, return basic info
    return {
      totalEntries: 0, // TODO: Implement count query
      clientId: this.clientId
    };
  }

  // Force cleanup of old entries
  async forceCleanup(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    return await this.store.cleanup(olderThanMs);
  }

  // Destroy manager and cleanup resources
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // Get current client ID
  getClientId(): string {
    return this.clientId;
  }

  // Test utilities
  async testDuplicateDetection(event: NamespacedEvent): Promise<{
    metadata: DeduplicationMetadata;
    duplicateCheck: { isDupe: boolean; reason?: string };
  }> {
    const metadata = await this.generateMetadata(event);
    const duplicateCheck = await this.isDuplicate(event, metadata);
    
    return {
      metadata,
      duplicateCheck
    };
  }
}