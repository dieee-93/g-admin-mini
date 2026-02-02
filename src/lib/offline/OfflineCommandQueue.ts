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

  // Stub for next step
  private async replayCommands(): Promise<void> {
    // Implementation in next task
  }
}
