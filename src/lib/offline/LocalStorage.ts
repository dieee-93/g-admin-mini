// LocalStorage.ts - IndexedDB Management for G-Admin Mini
// Provides robust local storage with schema versioning and data migrations

// Database configuration
const DB_NAME = 'G-Admin-Mini';
const DB_VERSION = 3;
const STORES_CONFIG = {
  orders: { keyPath: 'id', indexes: ['customerId', 'timestamp', 'status'] },
  inventory: { keyPath: 'id', indexes: ['type', 'category', 'lastUpdated'] },
  staff: { keyPath: 'id', indexes: ['department', 'status', 'lastClockIn'] },
  customers: { keyPath: 'id', indexes: ['email', 'phoneNumber', 'registrationDate'] },
  schedules: { keyPath: 'id', indexes: ['employeeId', 'date', 'shift'] },
  sync_queue: { keyPath: 'id', indexes: ['entity', 'timestamp', 'priority'] },
  conflicts: { keyPath: 'id', indexes: ['operationId', 'timestamp', 'resolved'] },
  settings: { keyPath: 'key', indexes: [] as string[] },
  cache: { keyPath: 'url', indexes: ['timestamp', 'expires'] },
  analytics: { keyPath: 'id', indexes: ['type', 'timestamp', 'module'] }
};

// Data types for TypeScript
interface StoredData {
  id: string;
  data: any;
  timestamp: number;
  version: number;
  checksum?: string;
}

interface CacheEntry {
  url: string;
  data: any;
  timestamp: number;
  expires: number;
  headers?: Record<string, string>;
}

interface IndexSpec {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

interface StoreConfig {
  keyPath: string;
  indexes: string[];
  autoIncrement?: boolean;
}

class LocalStorageManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isInitialized: boolean = false;
  
  constructor() {
    this.initialize();
  }

  // Initialize the database
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.db = await this.openDatabase();
      this.isInitialized = true;
      console.log('[LocalStorage] Database initialized successfully');
    } catch (error) {
      console.error('[LocalStorage] Failed to initialize database:', error);
      throw error;
    }
  }

  // Open IndexedDB database
  private openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('[LocalStorage] Database opening failed:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log('[LocalStorage] Database opened successfully');
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        console.log(`[LocalStorage] Database upgrade needed: ${event.oldVersion} -> ${event.newVersion}`);
        this.handleDatabaseUpgrade(event);
      };
    });
    
    return this.dbPromise;
  }

  // Handle database schema upgrades
  private handleDatabaseUpgrade(event: IDBVersionChangeEvent): void {
    const db = (event.target as IDBOpenDBRequest).result;
    const transaction = (event.target as IDBOpenDBRequest).transaction!;
    
    console.log(`[LocalStorage] Upgrading database from version ${event.oldVersion} to ${event.newVersion}`);
    
    // Create or update object stores
    Object.entries(STORES_CONFIG).forEach(([storeName, config]) => {
      this.createOrUpdateStore(db, storeName, config);
    });
    
    // Run migration scripts
    this.runMigrations(db, transaction, event.oldVersion, event.newVersion || DB_VERSION);
  }

  // Create or update object store
  private createOrUpdateStore(db: IDBDatabase, storeName: string, config: StoreConfig): void {
    let store: IDBObjectStore;
    
    if (db.objectStoreNames.contains(storeName)) {
      // Store exists, might need to update indexes
      console.log(`[LocalStorage] Updating store: ${storeName}`);
      // Note: In real implementation, you'd need to handle index updates during upgrade
      return;
    } else {
      // Create new store
      console.log(`[LocalStorage] Creating store: ${storeName}`);
      store = db.createObjectStore(storeName, {
        keyPath: config.keyPath,
        autoIncrement: config.autoIncrement || false
      });
    }
    
    // Create indexes
    config.indexes.forEach(indexName => {
      if (!store.indexNames.contains(indexName)) {
        console.log(`[LocalStorage] Creating index: ${indexName} on ${storeName}`);
        store.createIndex(indexName, indexName, { unique: false });
      }
    });
  }

  // Run database migrations
  private runMigrations(db: IDBDatabase, transaction: IDBTransaction, oldVersion: number, newVersion: number): void {
    console.log(`[LocalStorage] Running migrations: ${oldVersion} -> ${newVersion}`);
    
    // Version-specific migrations
    if (oldVersion < 2) {
      this.migrateToVersion2(db, transaction);
    }
    
    if (oldVersion < 3) {
      this.migrateToVersion3(db, transaction);
    }
  }

  // Migration to version 2
  private migrateToVersion2(db: IDBDatabase, transaction: IDBTransaction): void {
    console.log('[LocalStorage] Migrating to version 2: Adding analytics store');
    
    if (!db.objectStoreNames.contains('analytics')) {
      const store = db.createObjectStore('analytics', { keyPath: 'id' });
      store.createIndex('type', 'type');
      store.createIndex('timestamp', 'timestamp');
      store.createIndex('module', 'module');
    }
  }

  // Migration to version 3
  private migrateToVersion3(db: IDBDatabase, transaction: IDBTransaction): void {
    console.log('[LocalStorage] Migrating to version 3: Adding cache optimization');
    
    // Add new indexes to existing stores
    if (db.objectStoreNames.contains('cache')) {
      const store = transaction.objectStore('cache');
      if (!store.indexNames.contains('expires')) {
        store.createIndex('expires', 'expires');
      }
    }
  }

  // Ensure database is ready
  private async ensureReady(): Promise<IDBDatabase> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.db!;
  }

  // Generic store operation wrapper
  private async performStoreOperation<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.ensureReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Store data with metadata
  public async set(storeName: string, key: string, data: any): Promise<void> {
    const storedData: StoredData = {
      id: key,
      data,
      timestamp: Date.now(),
      version: 1,
      checksum: this.calculateChecksum(data)
    };
    
    await this.performStoreOperation(storeName, 'readwrite', store => store.put(storedData));
    console.log(`[LocalStorage] Stored data in ${storeName}: ${key}`);
  }

  // Retrieve data
  public async get(storeName: string, key: string): Promise<any | null> {
    try {
      const result = await this.performStoreOperation(storeName, 'readonly', store => store.get(key));
      
      if (result) {
        // Verify checksum if available
        if (result.checksum && result.checksum !== this.calculateChecksum(result.data)) {
          console.warn(`[LocalStorage] Checksum mismatch for ${storeName}:${key}`);
        }
        
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error(`[LocalStorage] Error getting ${storeName}:${key}:`, error);
      return null;
    }
  }

  // Get all data from store
  public async getAll(storeName: string): Promise<any[]> {
    try {
      const results = await this.performStoreOperation(storeName, 'readonly', store => store.getAll());
      return results.map(result => result.data || result);
    } catch (error) {
      console.error(`[LocalStorage] Error getting all from ${storeName}:`, error);
      return [];
    }
  }

  // Delete data
  public async delete(storeName: string, key: string): Promise<void> {
    await this.performStoreOperation(storeName, 'readwrite', store => store.delete(key));
    console.log(`[LocalStorage] Deleted from ${storeName}: ${key}`);
  }

  // Clear entire store
  public async clear(storeName: string): Promise<void> {
    await this.performStoreOperation(storeName, 'readwrite', store => store.clear());
    console.log(`[LocalStorage] Cleared store: ${storeName}`);
  }

  // Count items in store
  public async count(storeName: string): Promise<number> {
    return this.performStoreOperation(storeName, 'readonly', store => store.count());
  }

  // Query data with index
  public async query(
    storeName: string, 
    indexName: string, 
    value: any, 
    limit?: number
  ): Promise<any[]> {
    const db = await this.ensureReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value, limit);
      
      request.onsuccess = () => {
        const results = request.result.map(result => result.data || result);
        resolve(results);
      };
      
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Range query
  public async queryRange(
    storeName: string,
    indexName: string,
    lowerBound: any,
    upperBound: any,
    limit?: number
  ): Promise<any[]> {
    const db = await this.ensureReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const range = IDBKeyRange.bound(lowerBound, upperBound);
      const request = index.getAll(range, limit);
      
      request.onsuccess = () => {
        const results = request.result.map(result => result.data || result);
        resolve(results);
      };
      
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Bulk operations
  public async bulkSet(storeName: string, items: Array<{key: string, data: any}>): Promise<void> {
    const db = await this.ensureReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      const total = items.length;
      
      items.forEach(item => {
        const storedData: StoredData = {
          id: item.key,
          data: item.data,
          timestamp: Date.now(),
          version: 1,
          checksum: this.calculateChecksum(item.data)
        };
        
        const request = store.put(storedData);
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Cache management
  public async setCache(url: string, data: any, ttl: number = 3600000): Promise<void> {
    const cacheEntry: CacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    };
    
    await this.performStoreOperation('cache', 'readwrite', store => store.put(cacheEntry));
  }

  public async getCache(url: string): Promise<any | null> {
    const entry = await this.performStoreOperation('cache', 'readonly', store => store.get(url));
    
    if (entry && entry.expires > Date.now()) {
      return entry.data;
    } else if (entry) {
      // Expired, delete it
      await this.delete('cache', url);
    }
    
    return null;
  }

  // Clean expired cache entries
  public async cleanExpiredCache(): Promise<void> {
    const db = await this.ensureReady();
    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expires');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => {
        console.log('[LocalStorage] Expired cache entries cleaned');
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Storage statistics
  public async getStorageStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const storeName of Object.keys(STORES_CONFIG)) {
      try {
        const count = await this.count(storeName);
        stats[storeName] = { count };
      } catch (error) {
        stats[storeName] = { count: 0, error: error.message };
      }
    }
    
    // Add database info
    stats._meta = {
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      isInitialized: this.isInitialized
    };
    
    return stats;
  }

  // Data export/import for backup
  public async exportData(): Promise<Record<string, any[]>> {
    const exportData: Record<string, any[]> = {};
    
    for (const storeName of Object.keys(STORES_CONFIG)) {
      try {
        exportData[storeName] = await this.getAll(storeName);
      } catch (error) {
        console.error(`[LocalStorage] Error exporting ${storeName}:`, error);
        exportData[storeName] = [];
      }
    }
    
    return exportData;
  }

  public async importData(data: Record<string, any[]>): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (this.isValidStoreName(storeName)) {
        try {
          // Clear existing data
          await this.clear(storeName);
          
          // Import new data
          const itemsToImport = items.map((item, index) => ({
            key: item.id || `imported_${index}`,
            data: item
          }));
          
          await this.bulkSet(storeName, itemsToImport);
          console.log(`[LocalStorage] Imported ${items.length} items to ${storeName}`);
        } catch (error) {
          console.error(`[LocalStorage] Error importing ${storeName}:`, error);
        }
      }
    }
  }

  // Type guard for store names
  private isValidStoreName(name: string): name is keyof typeof STORES_CONFIG {
    return name in STORES_CONFIG;
  }

  // Calculate simple checksum for data integrity
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  // Database maintenance
  public async maintenance(): Promise<void> {
    console.log('[LocalStorage] Starting database maintenance');
    
    try {
      // Clean expired cache
      await this.cleanExpiredCache();
      
      // Clean old sync queue items (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      await this.cleanOldSyncQueue(weekAgo);
      
      // Clean old analytics data (older than 30 days)
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await this.cleanOldAnalytics(monthAgo);
      
      console.log('[LocalStorage] Database maintenance completed');
    } catch (error) {
      console.error('[LocalStorage] Maintenance failed:', error);
    }
  }

  // Clean old sync queue items
  private async cleanOldSyncQueue(cutoffTime: number): Promise<void> {
    const db = await this.ensureReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => {
        console.log(`[LocalStorage] Cleaned ${deleted} old sync queue items`);
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Clean old analytics data
  private async cleanOldAnalytics(cutoffTime: number): Promise<void> {
    const db = await this.ensureReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => {
        console.log(`[LocalStorage] Cleaned ${deleted} old analytics entries`);
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Close database connection
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('[LocalStorage] Database connection closed');
    }
  }

  /**
   * Alias for get method for consistency with standard localStorage API
   */
  public async getItem(storeName: string, key: string): Promise<any | null> {
    return this.get(storeName, key);
  }

  /**
   * Alias for set method for consistency with standard localStorage API
   */
  public async setItem(storeName: string, key: string, data: any): Promise<void> {
    return this.set(storeName, key, data);
  }
}

// Create singleton instance
const localStorage = new LocalStorageManager();

// Run maintenance periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    localStorage.maintenance().catch(error => {
      console.error('[LocalStorage] Periodic maintenance failed:', error);
    });
  }, 24 * 60 * 60 * 1000); // Daily maintenance
}

export default localStorage;
export { LocalStorageManager, type StoredData, type CacheEntry };