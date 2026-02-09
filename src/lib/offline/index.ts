/**
 * Offline-First Sync System
 *
 * Event-driven command queue with IndexedDB persistence and exponential backoff retry logic.
 * Based on Next.js + Supabase PWA patterns (Jan 2026).
 */

// Core offline system components
export { OfflineDB } from './OfflineDB';
export { OfflineCommandQueue } from './OfflineCommandQueue';
export { getOfflineQueue, resetOfflineQueue } from './queueInstance';
export { executeWithOfflineSupport } from './executeWithOfflineSupport';
export { OfflineMonitorProvider } from './OfflineMonitor';
export { default as offlineSync } from './OfflineSync';

export type {
  OfflineCommand,
  SyncResult,
  OfflineQueueConfig,
  QueueStats,
  QueueEvent,
  QueueEventData
} from './types';

// Simple initialization function for backward compatibility
interface InitializeOfflineOptions {
  enableServiceWorker?: boolean;
  enableSync?: boolean;
  syncInterval?: number;
  maxRetries?: number;
}

export async function initializeOffline(options: InitializeOfflineOptions = {}) {
  const {
    enableServiceWorker = false,
    enableSync = true,
    syncInterval = 30000,
    maxRetries = 3
  } = options;

  let serviceWorker = null;
  const syncInitialized = enableSync;
  const storageInitialized = true;

  // Service Worker registration (only in production)
  if (enableServiceWorker && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      serviceWorker = registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  return {
    serviceWorker,
    syncInitialized,
    storageInitialized
  };
}
