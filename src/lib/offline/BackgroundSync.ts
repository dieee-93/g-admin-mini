/**
 * Background Sync API Wrapper
 *
 * Integrates with OfflineCommandQueue to register background sync
 * when operations are queued offline.
 *
 * When operations are queued:
 * 1. Register background sync with browser
 * 2. Browser will wake up Service Worker when online
 * 3. Service Worker executes sync
 * 4. Service Worker posts message back to app
 *
 * Browser support:
 * - Chrome 49+, Edge 79+, Samsung Internet 5+
 * - Firefox, Safari: Graceful fallback to event-driven sync
 */

import { logger } from '@/lib/logging';
import { isBackgroundSyncSupported } from './ServiceWorkerRegistration';

const SYNC_TAG = 'offline-sync-queue';

/**
 * Background Sync Manager
 */
export class BackgroundSyncManager {
  private isRegistered: boolean = false;

  /**
   * Check if Background Sync API is available
   */
  public isSupported(): boolean {
    return isBackgroundSyncSupported();
  }

  /**
   * Register background sync
   *
   * This tells the browser: "When you have a stable connection,
   * wake up the Service Worker and trigger a sync event"
   */
  public async register(): Promise<boolean> {
    if (!this.isSupported()) {
      logger.debug('BackgroundSync', 'Background Sync API not supported - using fallback');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Register sync with tag
      await registration.sync.register(SYNC_TAG);

      this.isRegistered = true;
      logger.info('BackgroundSync', 'Background sync registered', { tag: SYNC_TAG });

      return true;

    } catch (error) {
      logger.error('BackgroundSync', 'Failed to register background sync', error);

      // Check if error is due to permissions
      if ((error as Error).name === 'NotAllowedError') {
        logger.warn('BackgroundSync', 'Background sync permission denied');
      }

      return false;
    }
  }

  /**
   * Get list of registered sync tags
   */
  public async getTags(): Promise<string[]> {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.sync.getTags();
    } catch (error) {
      logger.error('BackgroundSync', 'Failed to get sync tags', error);
      return [];
    }
  }

  /**
   * Check if sync is currently registered
   */
  public async isCurrentlyRegistered(): Promise<boolean> {
    const tags = await this.getTags();
    return tags.includes(SYNC_TAG);
  }

  /**
   * Request manual sync via Service Worker
   * (For testing or forcing sync)
   */
  public async requestManualSync(): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Background Sync not supported' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!registration.active) {
        return { success: false, error: 'No active Service Worker' };
      }

      return await new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };

        registration.active.postMessage(
          { type: 'MANUAL_SYNC' },
          [messageChannel.port2]
        );

        // Timeout after 30 seconds
        setTimeout(() => {
          resolve({ success: false, error: 'Manual sync timeout' });
        }, 30000);
      });

    } catch (error) {
      logger.error('BackgroundSync', 'Manual sync failed', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// Singleton instance
let bgSyncManager: BackgroundSyncManager | null = null;

/**
 * Get Background Sync Manager singleton
 */
export function getBackgroundSyncManager(): BackgroundSyncManager {
  if (!bgSyncManager) {
    bgSyncManager = new BackgroundSyncManager();
  }
  return bgSyncManager;
}

/**
 * Convenience function to register background sync
 */
export async function registerBackgroundSync(): Promise<boolean> {
  const manager = getBackgroundSyncManager();
  return await manager.register();
}

/**
 * Check if background sync is supported
 */
export function checkBackgroundSyncSupport(): boolean {
  const manager = getBackgroundSyncManager();
  return manager.isSupported();
}

/**
 * Setup automatic background sync registration
 * Integrates with OfflineCommandQueue events
 */
export async function setupAutoBackgroundSync(): Promise<void> {
  const manager = getBackgroundSyncManager();

  if (!manager.isSupported()) {
    logger.info('BackgroundSync', 'Auto background sync not available - using event-driven fallback');
    return;
  }

  try {
    // Import dynamically to avoid circular dependency
    const { getOfflineQueue } = await import('./queueInstance');
    const queue = await getOfflineQueue();

    // Register background sync whenever a command is enqueued
    queue.on('commandEnqueued', async () => {
      logger.debug('BackgroundSync', 'Command enqueued - registering background sync');
      await manager.register();
    });

    // Also register on sync failed (for retry)
    queue.on('syncFailed', async () => {
      logger.debug('BackgroundSync', 'Sync failed - registering background sync for retry');
      await manager.register();
    });

    logger.info('BackgroundSync', 'Auto background sync setup complete');

  } catch (error) {
    logger.error('BackgroundSync', 'Failed to setup auto background sync', error);
  }
}

/**
 * Listen to Service Worker sync completion messages
 * and trigger cache invalidation
 */
export function setupSyncCompletionListener(): void {
  window.addEventListener('sw-sync-completed', ((event: CustomEvent) => {
    const { successCount, failureCount } = event.detail;

    logger.info('BackgroundSync', 'Sync completed in background', {
      successCount,
      failureCount
    });

    // Emit global event for app to handle (e.g., invalidate TanStack Query cache)
    window.dispatchEvent(new CustomEvent('offline-sync-completed', {
      detail: { successCount, failureCount }
    }));

  }) as EventListener);

  logger.debug('BackgroundSync', 'Sync completion listener setup');
}
