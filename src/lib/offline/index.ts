// index.ts - Offline Library Exports for G-Admin Mini
// Central export point for all offline functionality

// Core offline services
export { default as offlineSync, OfflineSync } from './OfflineSync';
export type { SyncOperation, SyncStatus, SyncConflict } from './OfflineSync';

export { default as localStorage, LocalStorageManager } from './LocalStorage';
export type { StoredData, CacheEntry } from './LocalStorage';

export { default as conflictResolution, ConflictResolutionEngine } from './ConflictResolution';
export type { 
  DataConflict, 
  ResolutionResult, 
  ResolutionStrategy,
  ConflictType,
  ConflictSeverity,
  FieldType
} from './ConflictResolution';

// Monitoring components
export {
  ConnectionStatus,
  SyncProgress,
  OfflineAlert,
  QueueMonitor,
  OfflineStatusBar,
  OfflineMonitorProvider,
  default as OfflineMonitor
} from './OfflineMonitor';

// React hooks
export {
  useOfflineStatus,
  useOnlineStatus,
  useSyncStatus,
  useOfflineStorage,
  default as useOffline
} from './useOfflineStatus';

// Service Worker (for registration)
// Note: ServiceWorker.ts is not imported here as it runs in SW context
// Instead we provide utilities for SW registration and communication

// Force sync utility
export const forceSync = async (): Promise<void> => {
  try {
    await offlineSync.syncPendingOperations();
    logger.info('OfflineSync', '[Offline] Force sync completed');
  } catch (error) {
    logger.error('OfflineSync', '[Offline] Force sync failed:', error);
    throw error;
  }
};

// Service Worker Registration Utility
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      logger.info('OfflineSync', '[Offline] Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      logger.info('OfflineSync', '[Offline] Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          logger.info('OfflineSync', '[Offline] New Service Worker installing...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('OfflineSync', '[Offline] New Service Worker installed, ready to update');
              // Notify user about update availability
              window.dispatchEvent(new CustomEvent('sw-update-available', {
                detail: { registration }
              }));
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      logger.error('OfflineSync', '[Offline] Service Worker registration failed:', error);
      return null;
    }
  }
  
  logger.warn('OfflineSync', '[Offline] Service Workers not supported in this browser');
  return null;
};

// Service Worker Communication
export const sendMessageToSW = async (message: unknown): Promise<any> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (_event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };
      
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Service Worker communication timeout'));
      }, 10000);
    });
  }
  
  throw new Error('Service Worker not available');
};

// PWA Installation
export const installPWA = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const deferredPrompt = (window as any).deferredPrompt;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      deferredPrompt.userChoice.then((choiceResult: unknown) => {
        logger.info('OfflineSync', '[PWA] User choice:', choiceResult.outcome);
        (window as any).deferredPrompt = null;
        resolve(choiceResult.outcome === 'accepted');
      });
    } else {
      logger.info('OfflineSync', '[PWA] Install prompt not available');
      resolve(false);
    }
  });
};

// Check PWA Installation Status
export const isPWAInstalled = (): boolean => {
  // Check if running in standalone mode (PWA installed)
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

// Offline Initialization
export const initializeOffline = async (config?: {
  enableServiceWorker?: boolean;
  enableSync?: boolean;
  syncInterval?: number;
  maxRetries?: number;
}): Promise<{
  serviceWorker: ServiceWorkerRegistration | null;
  syncInitialized: boolean;
  storageInitialized: boolean;
}> => {
  logger.info('OfflineSync', '[Offline] Initializing offline capabilities...');
  
  const {
    enableServiceWorker = true,
    enableSync = true,
    syncInterval = 30000,
    maxRetries = 3
  } = config || {};
  
  let serviceWorker: ServiceWorkerRegistration | null = null;
  let syncInitialized = false;
  let storageInitialized = false;
  
  try {
    // Initialize Service Worker
    if (enableServiceWorker) {
      serviceWorker = await registerServiceWorker();
    }
    
    // Initialize Sync (already initialized in import)
    if (enableSync) {
      // Configure sync if needed
      syncInitialized = true;
    }
    
    // Test storage using existing 'settings' store
    try {
      await localStorage.set('settings', 'init_test', { initialized: true });
      await localStorage.delete('settings', 'init_test');
      storageInitialized = true;
    } catch (error) {
      logger.error('OfflineSync', '[Offline] Storage initialization failed:', error);
    }
    
    logger.info('OfflineSync', '[Offline] Initialization complete:', {
      serviceWorker: !!serviceWorker,
      syncInitialized,
      storageInitialized
    });
    
    return {
      serviceWorker,
      syncInitialized,
      storageInitialized
    };
    
  } catch (error) {
    logger.error('OfflineSync', '[Offline] Initialization failed:', error);
    
    return {
      serviceWorker: null,
      syncInitialized: false,
      storageInitialized: false
    };
  }
};

// Utility functions
export const getOfflineCapabilities = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
    networkInfo: 'connection' in navigator,
    storageEstimate: 'storage' in navigator && 'estimate' in navigator.storage
  };
};

export const getStorageSummary = async () => {
  try {
    const stats = await localStorage.getStorageStats();
    const capabilities = getOfflineCapabilities();
    
    let storageEstimate = null;
    if (capabilities.storageEstimate) {
      storageEstimate = await navigator.storage.estimate();
    }
    
    return {
      stats,
      capabilities,
      storageEstimate,
      isPWA: isPWAInstalled(),
      isOnline: navigator.onLine
    };
  } catch (error) {
    logger.error('OfflineSync', '[Offline] Error getting storage summary:', error);
    return null;
  }
};

// Error handling
export class OfflineError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

// Constants
export const OFFLINE_CONSTANTS = {
  CACHE_NAME: 'g-admin-mini-v3.0',
  SYNC_TAG: 'g-admin-background-sync',
  DEFAULT_TTL: 3600000, // 1 hour
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  SYNC_INTERVAL: 30000, // 30 seconds
  MAX_RETRIES: 3
} as const;

import offlineSync from './OfflineSync';
import localStorage from './LocalStorage';
import conflictResolution from './ConflictResolution';
import OfflineMonitor from './OfflineMonitor';
import { logger } from '@/lib/logging';
import {
  useOfflineStatus,
  useOnlineStatus,
  useSyncStatus,
  useOfflineStorage
} from './useOfflineStatus';

export default {
  // Services
  offlineSync,
  localStorage,
  conflictResolution,
  
  // Components
  OfflineMonitor,
  
  // Hooks
  useOfflineStatus,
  useOnlineStatus,
  useSyncStatus,
  useOfflineStorage,
  
  // Utilities
  initializeOffline,
  registerServiceWorker,
  sendMessageToSW,
  installPWA,
  isPWAInstalled,
  getOfflineCapabilities,
  getStorageSummary,
  
  // Constants
  OFFLINE_CONSTANTS,
  
  // Errors
  OfflineError
};