/**
 * G-Admin Mini - Service Worker
 *
 * Handles background synchronization when the app is closed.
 * Listens to Background Sync API events and syncs queued operations.
 *
 * Browser support:
 * - Chrome 49+, Edge 79+, Samsung Internet 5+
 * - Firefox: Service Worker yes, Background Sync no (graceful degradation)
 * - Safari: Limited support (graceful degradation)
 */

const CACHE_VERSION = 'g-admin-v1';
const OFFLINE_DB_NAME = 'g_admin_offline';
const SYNC_TAG = 'offline-sync-queue';

// Logger for Service Worker context
const log = {
  info: (message, ...args) => console.log(`[SW] ${message}`, ...args),
  error: (message, ...args) => console.error(`[SW] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[SW] ${message}`, ...args)
};

/**
 * IndexedDB helper - Access offline queue from Service Worker
 */
class OfflineDBHelper {
  constructor() {
    this.dbName = OFFLINE_DB_NAME;
    this.dbVersion = 1;
    this.storeName = 'sync_queue';
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });

          store.createIndex('by-status', 'status', { unique: false });
          store.createIndex('by-entityType', 'entityType', { unique: false });
          store.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async getPendingCommands() {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        const commands = request.result || [];

        // Sort by priority and timestamp
        commands.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        resolve(commands);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async updateCommand(id, updates) {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const command = getRequest.result;

        if (!command) {
          reject(new Error(`Command ${id} not found`));
          return;
        }

        const updated = { ...command, ...updates };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteCommand(id) {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Sync operations - Execute queued commands
 */
async function syncCommand(command) {
  log.info('Syncing command:', command.entityType, command.operation);

  // Get Supabase URL and anon key from environment
  // Note: In production, these should be available via self.registration or postMessage
  const SUPABASE_URL = 'https://your-project.supabase.co'; // Will be injected
  const SUPABASE_ANON_KEY = 'your-anon-key'; // Will be injected

  try {
    let response;
    const url = `${SUPABASE_URL}/rest/v1/${command.entityType}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    switch (command.operation) {
      case 'CREATE':
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(command.data)
        });
        break;

      case 'UPDATE':
        response = await fetch(`${url}?id=eq.${command.entityId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(command.data)
        });
        break;

      case 'DELETE':
        response = await fetch(`${url}?id=eq.${command.entityId}`, {
          method: 'DELETE',
          headers
        });
        break;

      default:
        throw new Error(`Unknown operation: ${command.operation}`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sync failed');
    }

    const data = await response.json();

    return {
      success: true,
      data,
      command
    };

  } catch (error) {
    log.error('Sync error:', error);

    return {
      success: false,
      error: error.message,
      errorType: error.code === '23503' ? 'foreign_key' : 'network',
      command
    };
  }
}

/**
 * Process sync queue - Called by Background Sync API
 */
async function processQueue() {
  log.info('Processing sync queue...');

  const db = new OfflineDBHelper();
  const pendingCommands = await db.getPendingCommands();

  if (pendingCommands.length === 0) {
    log.info('No pending commands to sync');
    return { successCount: 0, failureCount: 0 };
  }

  log.info(`Found ${pendingCommands.length} pending commands`);

  let successCount = 0;
  let failureCount = 0;

  for (const command of pendingCommands) {
    try {
      // Update status to syncing
      await db.updateCommand(command.id, { status: 'syncing' });

      // Execute sync
      const result = await syncCommand(command);

      if (result.success) {
        // Success - delete command
        await db.deleteCommand(command.id);
        successCount++;
        log.info(`Synced command ${command.id} successfully`);
      } else {
        // Failure - update retry count
        const retryCount = (command.retryCount || 0) + 1;
        const maxRetries = 3;

        if (retryCount >= maxRetries) {
          // Max retries reached
          await db.updateCommand(command.id, {
            status: 'failed',
            retryCount,
            lastError: {
              type: result.errorType,
              message: result.error,
              timestamp: Date.now()
            }
          });
          log.error(`Command ${command.id} failed after ${maxRetries} retries`);
        } else {
          // Calculate exponential backoff
          const backoffMs = Math.min(32000, Math.pow(2, retryCount) * 1000);
          const nextRetryAt = Date.now() + backoffMs;

          await db.updateCommand(command.id, {
            status: 'pending',
            retryCount,
            nextRetryAt,
            lastError: {
              type: result.errorType,
              message: result.error,
              timestamp: Date.now()
            }
          });
          log.warn(`Command ${command.id} failed, retry ${retryCount}/${maxRetries}`);
        }

        failureCount++;
      }

    } catch (error) {
      log.error(`Error processing command ${command.id}:`, error);
      failureCount++;
    }
  }

  log.info(`Sync completed: ${successCount} success, ${failureCount} failed`);

  return { successCount, failureCount };
}

/**
 * Notify all clients about sync completion
 */
async function notifyClients(syncResult) {
  const clients = await self.clients.matchAll({ type: 'window' });

  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETED',
      payload: syncResult
    });
  });

  log.info('Notified all clients about sync completion');
}

// ============================================================================
// Service Worker Event Listeners
// ============================================================================

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
  log.info('Service Worker installing...');

  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  log.info('Service Worker activated');

  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

/**
 * Sync event - Handle Background Sync API
 * This is the KEY event for background synchronization
 */
self.addEventListener('sync', (event) => {
  log.info('Sync event received:', event.tag);

  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      processQueue()
        .then(result => notifyClients(result))
        .catch(error => {
          log.error('Sync failed:', error);
          throw error; // Re-throw to trigger retry
        })
    );
  }
});

/**
 * Message event - Handle messages from app
 */
self.addEventListener('message', (event) => {
  log.info('Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'MANUAL_SYNC') {
    // Manual sync trigger
    event.waitUntil(
      processQueue()
        .then(result => {
          event.ports[0].postMessage({ success: true, result });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        })
    );
  }
});

log.info('Service Worker script loaded');
