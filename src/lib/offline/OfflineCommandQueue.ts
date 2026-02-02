import { OfflineDB } from './OfflineDB';
import { logger } from '@/lib/logging';
import type { OfflineCommand, QueueStats, OfflineQueueConfig, QueueEvent, QueueEventData } from './types';

/**
 * Offline Command Queue Processor
 * Based on Workbox Background Sync + Exponential Backoff patterns
 */
export class OfflineCommandQueue {
  private db: OfflineDB;
  private config: OfflineQueueConfig;
  private isSyncing: boolean = false;
  private eventListeners: Map<QueueEvent, Function[]> = new Map();

  constructor(config?: Partial<OfflineQueueConfig>) {
    this.db = new OfflineDB();

    this.config = {
      maxRetries: 3,
      initialRetryDelay: 1000,
      maxRetryDelay: 32000,
      priorityOrder: ['customers', 'materials', 'products', 'sales', 'sale_items'],
      ...config
    };
  }

  async init(): Promise<void> {
    await this.db.init();
    this.setupEventListeners();
    logger.info('OfflineQueue', 'Command queue initialized');
  }

  private setupEventListeners(): void {
    // Online event
    window.addEventListener('online', () => {
      logger.info('OfflineQueue', 'Network online detected, triggering sync');
      this.replayCommands();
    });

    // Offline event
    window.addEventListener('offline', () => {
      logger.warn('OfflineQueue', 'Network offline detected, pausing sync');
      this.isSyncing = false;
    });

    // Visibilitychange
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        logger.info('OfflineQueue', 'Page visible and online, checking queue');
        this.replayCommands();
      }
    });
  }

  async enqueue(command: Omit<OfflineCommand, 'id' | 'status' | 'retryCount' | 'timestamp' | 'priority'>): Promise<number> {
    try {
      const priority = this.config.priorityOrder.indexOf(command.entityType);
      const finalPriority = priority === -1 ? 999 : priority;

      const fullCommand: Omit<OfflineCommand, 'id'> = {
        ...command,
        status: 'pending',
        retryCount: 0,
        timestamp: new Date().toISOString(),
        priority: finalPriority
      };

      const id = await this.db.addCommand(fullCommand);

      if (id === -1) {
        logger.warn('OfflineQueue', 'Duplicate operation detected, skipping');
        return -1;
      }

      logger.info('OfflineQueue', 'Command enqueued', {
        id,
        entityType: command.entityType,
        operation: command.operation
      });

      this.emit('commandEnqueued', { id, command: fullCommand });

      // Trigger sync if online (with small delay for batching)
      if (navigator.onLine && !this.isSyncing) {
        setTimeout(() => this.replayCommands(), 100);
      }

      return id;
    } catch (error) {
      logger.error('OfflineQueue', 'Failed to enqueue command', error);
      throw error;
    }
  }

  async getStats(): Promise<QueueStats> {
    return await this.db.getQueueStats();
  }

  // Event emitter
  on(event: QueueEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: QueueEvent, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: QueueEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('OfflineQueue', `Error in event listener for ${event}`, error);
        }
      });
    }
  }

  async replayCommands(): Promise<void> {
    // Don't replay if offline or already syncing
    if (!navigator.onLine || this.isSyncing) {
      logger.debug('OfflineQueue', 'Skip replay - offline or already syncing');
      return;
    }

    this.isSyncing = true;
    this.emit('syncStarted', { count: 0 });

    try {
      const pendingCommands = await this.db.getPendingCommands();

      if (pendingCommands.length === 0) {
        logger.debug('OfflineQueue', 'No pending commands to sync');
        this.isSyncing = false;
        return;
      }

      logger.info('OfflineQueue', `Starting sync of ${pendingCommands.length} commands`);

      let successCount = 0;
      let failureCount = 0;

      // Process commands sequentially
      for (const command of pendingCommands) {
        // Check if we should retry based on nextRetryAt
        if (command.nextRetryAt && Date.now() < command.nextRetryAt) {
          logger.debug('OfflineQueue', `Skipping command ${command.id} - backoff not expired`);
          continue;
        }

        // Check max retries
        if (command.retryCount >= this.config.maxRetries) {
          logger.warn('OfflineQueue', `Command ${command.id} exceeded max retries`, {
            retryCount: command.retryCount,
            maxRetries: this.config.maxRetries
          });

          await this.db.updateCommand(command.id!, {
            status: 'failed',
            lastError: {
              type: 'unknown',
              message: 'Max retries exceeded',
              timestamp: Date.now()
            }
          });

          this.emit('commandFailed', {
            command,
            error: 'Max retries exceeded'
          });

          failureCount++;
          continue;
        }

        // Update status to syncing
        await this.db.updateCommand(command.id!, { status: 'syncing' });

        // Sync the command
        const result = await this.syncCommand(command);

        if (result.success) {
          // Delete command from queue
          await this.db.deleteCommand(command.id!);
          this.emit('commandSynced', { command, result });
          successCount++;
          logger.info('OfflineQueue', `Command ${command.id} synced successfully`);
        } else {
          // Handle failure with exponential backoff
          const newRetryCount = command.retryCount + 1;
          const backoffDelay = Math.min(
            this.config.initialRetryDelay * Math.pow(2, command.retryCount),
            this.config.maxRetryDelay
          );

          await this.db.updateCommand(command.id!, {
            status: 'pending',
            retryCount: newRetryCount,
            nextRetryAt: Date.now() + backoffDelay,
            lastError: {
              type: result.errorType || 'unknown',
              message: result.error || 'Unknown error',
              timestamp: Date.now()
            }
          });

          this.emit('commandFailed', { command, error: result.error });
          failureCount++;

          logger.warn('OfflineQueue', `Command ${command.id} failed, will retry in ${backoffDelay}ms`, {
            retryCount: newRetryCount,
            errorType: result.errorType
          });
        }
      }

      logger.info('OfflineQueue', `Sync completed: ${successCount} success, ${failureCount} failures`);
      this.emit('syncCompleted', { successCount, failureCount });
    } catch (error) {
      logger.error('OfflineQueue', 'Error during replay', error);
      this.emit('syncFailed', { error: String(error) });
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncCommand(command: OfflineCommand): Promise<any> {
    // Stub implementation - will be replaced in Task 5
    // For now, just simulate success
    logger.debug('OfflineQueue', `Syncing command ${command.id}`, {
      operation: command.operation,
      entityType: command.entityType
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      success: true,
      command
    };
  }
}
