/**
 * Offline-First Sync System
 *
 * Event-driven command queue with IndexedDB persistence and exponential backoff retry logic.
 * Based on Next.js + Supabase PWA patterns (Jan 2026).
 *
 * Phase 4: Progressive Enhancement with Service Worker + Background Sync API
 */

// Core offline system components
export { OfflineDB } from './OfflineDB';
export { OfflineCommandQueue } from './OfflineCommandQueue';
export { getOfflineQueue, resetOfflineQueue } from './queueInstance';
export { executeWithOfflineSupport } from './executeWithOfflineSupport';
export { OfflineMonitorProvider } from './OfflineMonitor';
export { SyncCacheInvalidator } from './SyncCacheInvalidator';
export { default as offlineSync } from './OfflineSync';

// ✅ Phase 4: Service Worker + Background Sync
export {
  ServiceWorkerManager,
  getServiceWorkerManager,
  registerServiceWorker,
  isServiceWorkerSupported,
  isBackgroundSyncSupported
} from './ServiceWorkerRegistration';

export {
  BackgroundSyncManager,
  getBackgroundSyncManager,
  registerBackgroundSync,
  checkBackgroundSyncSupport,
  setupAutoBackgroundSync,
  setupSyncCompletionListener
} from './BackgroundSync';

export type {
  OfflineCommand,
  SyncResult,
  OfflineQueueConfig,
  QueueStats,
  QueueEvent,
  QueueEventData
} from './types';

export type {
  ServiceWorkerState,
  ServiceWorkerStatus
} from './ServiceWorkerRegistration';

/**
 * Offline System Initialization Options
 */
interface InitializeOfflineOptions {
  /**
   * Enable Service Worker for background sync
   * @default true in production, false in development
   */
  enableServiceWorker?: boolean;

  /**
   * Enable Background Sync API for guaranteed sync
   * @default true
   */
  enableBackgroundSync?: boolean;

  /**
   * Service Worker script URL
   * @default '/service-worker.js'
   */
  serviceWorkerURL?: string;

  /**
   * @deprecated No longer used - sync is event-driven
   */
  syncInterval?: number;

  /**
   * Maximum retry attempts for failed operations
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Initialize Offline-First System
 *
 * Sets up:
 * - OfflineCommandQueue (always)
 * - Service Worker (optional, for background sync)
 * - Background Sync API (optional, requires SW)
 * - Event listeners for sync completion
 *
 * @example
 * ```ts
 * await initializeOffline({
 *   enableServiceWorker: true,
 *   enableBackgroundSync: true
 * });
 * ```
 */
export async function initializeOffline(options: InitializeOfflineOptions = {}) {
  const {
    enableServiceWorker = import.meta.env.PROD, // Only in production by default
    enableBackgroundSync = true,
    serviceWorkerURL = '/service-worker.js',
    maxRetries = 3
  } = options;

  const result = {
    serviceWorker: null as ServiceWorkerRegistration | null,
    backgroundSyncSupported: false,
    queueInitialized: false
  };

  try {
    // 1. Initialize OfflineCommandQueue
    const queue = await getOfflineQueue();
    result.queueInitialized = true;

    // 2. Register Service Worker (if enabled)
    if (enableServiceWorker) {
      const { registerServiceWorker, isServiceWorkerSupported } = await import('./ServiceWorkerRegistration');

      if (isServiceWorkerSupported()) {
        result.serviceWorker = await registerServiceWorker(serviceWorkerURL);

        if (result.serviceWorker) {
          console.info('[Offline] Service Worker registered successfully');
        }
      } else {
        console.warn('[Offline] Service Worker not supported - using event-driven sync only');
      }
    }

    // 3. Setup Background Sync API (if enabled and supported)
    if (enableBackgroundSync) {
      const {
        setupAutoBackgroundSync,
        setupSyncCompletionListener,
        checkBackgroundSyncSupport
      } = await import('./BackgroundSync');

      result.backgroundSyncSupported = checkBackgroundSyncSupport();

      if (result.backgroundSyncSupported) {
        // Auto-register background sync when operations are queued
        await setupAutoBackgroundSync();

        // Listen to sync completion messages from Service Worker
        setupSyncCompletionListener();

        console.info('[Offline] Background Sync API enabled');
      } else {
        console.info('[Offline] Background Sync API not supported - using event-driven fallback');
      }
    }

    console.info('[Offline] Offline system initialized', result);

    return result;

  } catch (error) {
    console.error('[Offline] Failed to initialize offline system:', error);
    return result;
  }
}
