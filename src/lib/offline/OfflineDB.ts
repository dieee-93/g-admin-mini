import type { OfflineCommand, QueueStats } from './types';
import { logger } from '@/lib/logging';

/**
 * IndexedDB manager for offline queue
 * Based on Next.js + Supabase PWA (Jan 2026)
 */
export class OfflineDB {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'g_admin_offline';
  private readonly DB_VERSION = 1;
  private readonly QUEUE_STORE = 'sync_queue';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        logger.error('OfflineDB', 'Failed to open IndexedDB', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.QUEUE_STORE)) {
          const store = db.createObjectStore(this.QUEUE_STORE, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Separate indexes (not compound) for flexibility
          store.createIndex('by-status', 'status', { unique: false });
          store.createIndex('by-entityType', 'entityType', { unique: false });
          store.createIndex('by-timestamp', 'timestamp', { unique: false });
          store.createIndex('by-entityId', 'entityId', { unique: false });

          // Unique compound index for deduplication
          store.createIndex('by-operation-key',
            ['entityType', 'entityId', 'operation'],
            { unique: true }
          );

          logger.info('OfflineDB', 'Object store created with indices');
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('OfflineDB', 'IndexedDB initialized successfully');
        resolve();
      };
    });
  }

  async addCommand(command: Omit<OfflineCommand, 'id'>): Promise<number> {
    if (!this.db) throw new Error('DB not initialized');

    const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(this.QUEUE_STORE);
    const request = store.add(command);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        logger.info('OfflineDB', 'Command added to queue', {
          id: request.result,
          entityType: command.entityType,
          operation: command.operation
        });
        resolve(request.result as number);
      };

      request.onerror = () => {
        // ConstraintError means duplicate (unique index violation)
        if (request.error?.name === 'ConstraintError') {
          logger.warn('OfflineDB', 'Duplicate operation ignored', {
            entityType: command.entityType,
            entityId: command.entityId
          });
          resolve(-1); // Indicate duplicate
        } else {
          logger.error('OfflineDB', 'Failed to add command', request.error);
          reject(request.error);
        }
      };
    });
  }

  async getPendingCommands(): Promise<OfflineCommand[]> {
    if (!this.db) throw new Error('DB not initialized');

    try {
      const tx = this.db.transaction(this.QUEUE_STORE, 'readonly');
      const store = tx.objectStore(this.QUEUE_STORE);
      const index = store.index('by-status');

      return await new Promise((resolve, reject) => {
        const request = index.getAll('pending');

        request.onsuccess = () => {
          const commands = request.result as OfflineCommand[];

          // Sort in memory: priority first, then timestamp
          commands.sort((a, b) => {
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });

          logger.info('OfflineDB', `Retrieved ${commands.length} pending commands`);
          resolve(commands);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error('OfflineDB', 'Failed to get pending commands', error);
      throw error;
    }
  }

  async updateCommand(id: number, updates: Partial<OfflineCommand>): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');

    try {
      const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(this.QUEUE_STORE);

      return await new Promise((resolve, reject) => {
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const command = getRequest.result;

          if (!command) {
            reject(new Error(`Command ${id} not found`));
            return;
          }

          const updated = { ...command, ...updates };
          const putRequest = store.put(updated);

          putRequest.onsuccess = () => {
            logger.debug('OfflineDB', 'Command updated', { id, updates });
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      logger.error('OfflineDB', 'Failed to update command', error);
      throw error;
    }
  }

  async deleteCommand(id: number): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');

    try {
      const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(this.QUEUE_STORE);

      return await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          logger.debug('OfflineDB', 'Command deleted', { id });
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error('OfflineDB', 'Failed to delete command', error);
      throw error;
    }
  }

  async getQueueStats(): Promise<QueueStats> {
    if (!this.db) throw new Error('DB not initialized');

    try {
      const tx = this.db.transaction(this.QUEUE_STORE, 'readonly');
      const store = tx.objectStore(this.QUEUE_STORE);

      return await new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const commands = request.result as OfflineCommand[];
          const stats = {
            total: commands.length,
            pending: commands.filter(c => c.status === 'pending').length,
            syncing: commands.filter(c => c.status === 'syncing').length,
            failed: commands.filter(c => c.status === 'failed').length
          };

          logger.debug('OfflineDB', 'Queue stats', stats);
          resolve(stats);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error('OfflineDB', 'Failed to get queue stats', error);
      throw error;
    }
  }
}
