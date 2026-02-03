// useOfflineStatus.ts - React Hook for Offline Status Management
// Provides comprehensive offline status, sync monitoring, and queue management
// ✅ EVENT-DRIVEN: No polling intervals - updates only on actual events

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import offlineSync, { type SyncStatus, type SyncOperation } from './OfflineSync';
import localStorage from './LocalStorage';
import { getOfflineQueue } from './queueInstance';

import { logger } from '@/lib/logging';
// Hook return types
interface OfflineStatusHook {
  // Connection status
  isOnline: boolean;
  isConnecting: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  lastOnline: Date | null;

  // Sync status
  isSyncing: boolean;
  syncProgress: number;
  queueSize: number;

  // Operations
  queueOperation: (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'clientOperationId' | 'retry'>) => Promise<string>;
  forceSync: () => Promise<void>;
  clearQueue: () => void;

  // Storage
  cacheData: (key: string, data: any, ttl?: number) => Promise<void>;
  getCachedData: (key: string) => Promise<any>;

  // Monitoring
  networkInfo: NetworkInfo | null;
  storageInfo: StorageInfo;

  // Events
  onOnline: (callback: () => void) => void;
  onOffline: (callback: () => void) => void;
  onSyncComplete: (callback: (result: unknown) => void) => void;
}

interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface StorageInfo {
  used: number;
  available: number;
  percentage: number;
  itemCount: number;
}

// Custom hook for offline status management
export const useOfflineStatus = (): OfflineStatusHook => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline');
  const [lastOnline, setLastOnline] = useState<Date | null>(navigator.onLine ? new Date() : null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    available: 0,
    percentage: 0,
    itemCount: 0
  });

  const eventCallbacks = useRef<{
    online: (() => void)[];
    offline: (() => void)[];
    syncComplete: ((result: unknown) => void)[];
  }>({
    online: [],
    offline: [],
    syncComplete: []
  });

  // Update connection status
  const updateConnectionStatus = useCallback(async () => {
    const online = navigator.onLine;
    setIsOnline(online);

    if (online) {
      setLastOnline(new Date());
      setIsConnecting(false);

      // Test connection quality
      try {
        const start = Date.now();
        await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        const responseTime = Date.now() - start;

        if (responseTime < 200) {
          setConnectionQuality('excellent');
        } else if (responseTime < 1000) {
          setConnectionQuality('good');
        } else {
          setConnectionQuality('poor');
        }
      } catch {
        setConnectionQuality('poor');
      }

      // Trigger online callbacks
      eventCallbacks.current.online.forEach(callback => {
        try {
          callback();
        } catch (error) {
          logger.error('OfflineSync', '[OfflineStatus] Error in online callback:', error);
        }
      });
    } else {
      setConnectionQuality('offline');
      setIsConnecting(false);

      // Trigger offline callbacks
      eventCallbacks.current.offline.forEach(callback => {
        try {
          callback();
        } catch (error) {
          logger.error('OfflineSync', '[OfflineStatus] Error in offline callback:', error);
        }
      });
    }
  }, []);

  // Update network information
  const updateNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const newInfo = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };

      // Only update if values actually changed
      setNetworkInfo(prev => {
        if (!prev) return newInfo;
        if (prev.type !== newInfo.type ||
          prev.effectiveType !== newInfo.effectiveType ||
          prev.downlink !== newInfo.downlink ||
          prev.rtt !== newInfo.rtt ||
          prev.saveData !== newInfo.saveData) {
          return newInfo;
        }
        return prev;
      });
    }
  }, []);

  // Update storage information
  const updateStorageInfo = useCallback(async () => {
    try {
      const stats = await localStorage.getStorageStats();
      let totalItems = 0;

      Object.values(stats).forEach((storeStat: unknown) => {
        if (storeStat && typeof storeStat === 'object' && 'count' in storeStat && typeof (storeStat as { count: number }).count === 'number') {
          totalItems += (storeStat as { count: number }).count;
        }
      });

      // Estimate storage usage (simplified)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        const newInfo = {
          used,
          available,
          percentage,
          itemCount: totalItems
        };

        // Only update if values actually changed (with tolerance for percentage)
        setStorageInfo(prev => {
          if (prev.used !== newInfo.used ||
            prev.available !== newInfo.available ||
            Math.abs(prev.percentage - newInfo.percentage) > 0.01 ||
            prev.itemCount !== newInfo.itemCount) {
            return newInfo;
          }
          return prev;
        });
      } else {
        setStorageInfo(prev => {
          if (prev.itemCount !== totalItems) {
            return { ...prev, itemCount: totalItems };
          }
          return prev;
        });
      }
    } catch (error) {
      logger.error('OfflineSync', '[OfflineStatus] Error updating storage info:', error);
    }
  }, []);

  // Update sync status
  const updateSyncStatus = useCallback(() => {
    const status = offlineSync.getSyncStatus();
    setSyncStatus(status);
  }, []);

  // Queue operation wrapper
  const queueOperation = useCallback(async (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'clientOperationId' | 'retry'>): Promise<string> => {
    return await offlineSync.queueOperation(operation);
  }, []);

  // Force sync wrapper
  const forceSync = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    try {
      await offlineSync.forceSync(); // Fixed typo: was forcSync
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Clear queue wrapper
  const clearQueue = useCallback((): void => {
    offlineSync.clearQueue();
  }, []);

  // Cache data wrapper
  const cacheData = useCallback(async (key: string, data: any, ttl = 3600000): Promise<void> => {
    await localStorage.setCache(key, data, ttl);
  }, []);

  // Get cached data wrapper
  const getCachedData = useCallback(async (key: string): Promise<any> => {
    return await localStorage.getCache(key);
  }, []);

  // Event subscription methods
  const onOnline = useCallback((callback: () => void): void => {
    eventCallbacks.current.online.push(callback);
  }, []);

  const onOffline = useCallback((callback: () => void): void => {
    eventCallbacks.current.offline.push(callback);
  }, []);

  const onSyncComplete = useCallback((callback: (result: unknown) => void): void => {
    eventCallbacks.current.syncComplete.push(callback);
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Network event listeners
    const handleOnline = () => {
      updateConnectionStatus();
    };

    const handleOffline = () => {
      updateConnectionStatus();
    };

    const handleConnectionChange = () => {
      updateNetworkInfo();
      updateConnectionStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection API listener
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Sync event listeners
    const handleSyncComplete = (result: unknown) => {
      eventCallbacks.current.syncComplete.forEach(callback => {
        try {
          callback(result);
        } catch (error) {
          logger.error('OfflineSync', '[OfflineStatus] Error in sync complete callback:', error);
        }
      });
    };

    offlineSync.on('syncCompleted', handleSyncComplete);
    offlineSync.on('networkOnline', updateConnectionStatus);
    offlineSync.on('networkOffline', updateConnectionStatus);

    // ✅ EVENT-DRIVEN: Subscribe to OfflineCommandQueue events instead of polling
    let queueUnsubscribers: (() => void)[] = [];
    getOfflineQueue().then(queue => {
      // Update sync status when commands are enqueued
      const handleCommandEnqueued = () => {
        updateSyncStatus();
        updateStorageInfo();
      };

      // Update sync status when sync starts
      const handleSyncStarted = () => {
        updateSyncStatus();
      };

      // Update sync status when sync completes
      const handleSyncCompleted = () => {
        updateSyncStatus();
        updateStorageInfo();
      };

      // Update sync status when sync fails
      const handleSyncFailed = () => {
        updateSyncStatus();
      };

      queue.on('commandEnqueued', handleCommandEnqueued);
      queue.on('syncStarted', handleSyncStarted);
      queue.on('syncCompleted', handleSyncCompleted);
      queue.on('syncFailed', handleSyncFailed);

      queueUnsubscribers = [
        () => queue.off('commandEnqueued', handleCommandEnqueued),
        () => queue.off('syncStarted', handleSyncStarted),
        () => queue.off('syncCompleted', handleSyncCompleted),
        () => queue.off('syncFailed', handleSyncFailed)
      ];
    }).catch(error => {
      logger.error('OfflineSync', '[OfflineStatus] Error subscribing to queue events:', error);
    });

    // Initial updates (only run once on mount)
    updateConnectionStatus();
    updateNetworkInfo();
    updateSyncStatus();
    updateStorageInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }

      offlineSync.off('syncCompleted', handleSyncComplete);
      offlineSync.off('networkOnline', updateConnectionStatus);
      offlineSync.off('networkOffline', updateConnectionStatus);

      // ✅ Unsubscribe from queue events
      queueUnsubscribers.forEach(unsub => unsub());

      // Clear callbacks
      eventCallbacks.current = {
        online: [],
        offline: [],
        syncComplete: []
      };
    };
  }, [updateConnectionStatus, updateNetworkInfo, updateSyncStatus, updateStorageInfo]);

  return useMemo(() => ({
    // Connection status
    isOnline,
    isConnecting,
    connectionQuality,
    lastOnline,

    // Sync status
    isSyncing: syncStatus?.isSyncing || false,
    syncProgress: syncStatus?.syncProgress || 0,
    queueSize: syncStatus?.queueSize || 0,

    // Operations
    queueOperation,
    forceSync,
    clearQueue,

    // Storage
    cacheData,
    getCachedData,

    // Monitoring
    networkInfo,
    storageInfo,

    // Events
    onOnline,
    onOffline,
    onSyncComplete
  }), [
    isOnline,
    isConnecting,
    connectionQuality,
    lastOnline,
    syncStatus,
    queueOperation,
    forceSync,
    clearQueue,
    cacheData,
    getCachedData,
    networkInfo,
    storageInfo,
    onOnline,
    onOffline,
    onSyncComplete
  ]);
};

// Simplified hook for basic offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Hook for sync status only
// ✅ EVENT-DRIVEN: Updates only on sync events, no polling
export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(offlineSync.getSyncStatus());
    };

    // ✅ EVENT-DRIVEN: No interval, only event-based updates
    updateStatus(); // Initial load

    // Subscribe to OfflineCommandQueue events
    getOfflineQueue().then(queue => {
      queue.on('commandEnqueued', updateStatus);
      queue.on('syncStarted', updateStatus);
      queue.on('syncCompleted', updateStatus);
      queue.on('syncFailed', updateStatus);
    }).catch(error => {
      logger.error('OfflineSync', '[useSyncStatus] Error subscribing to queue events:', error);
    });

    // Also subscribe to offlineSync events (legacy support)
    offlineSync.on('syncStarted', updateStatus);
    offlineSync.on('syncCompleted', updateStatus);
    offlineSync.on('syncFailed', updateStatus);

    return () => {
      // ✅ No interval to clear
      offlineSync.off('syncStarted', updateStatus);
      offlineSync.off('syncCompleted', updateStatus);
      offlineSync.off('syncFailed', updateStatus);

      // Note: Queue unsubscribe handled by queue instance cleanup
    };
  }, []);

  return syncStatus;
};

// Hook for storage management
export const useOfflineStorage = () => {
  const [storageStats, setStorageStats] = useState<any>(null);

  const updateStats = useCallback(async () => {
    try {
      const stats = await localStorage.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      logger.error('OfflineSync', '[OfflineStorage] Error updating stats:', error);
    }
  }, []);

  const clearStorage = useCallback(async (storeName?: string) => {
    try {
      if (storeName) {
        await localStorage.clear(storeName);
      } else {
        // Clear all stores
        const stats = await localStorage.getStorageStats();
        const stores = Object.keys(stats).filter(key => key !== '_meta');
        await Promise.all(stores.map(store => localStorage.clear(store)));
      }
      await updateStats();
    } catch (error) {
      logger.error('OfflineSync', '[OfflineStorage] Error clearing storage:', error);
    }
  }, [updateStats]);

  const exportData = useCallback(async () => {
    try {
      return await localStorage.exportData();
    } catch (error) {
      logger.error('OfflineSync', '[OfflineStorage] Error exporting data:', error);
      return {};
    }
  }, []);

  const importData = useCallback(async (data: Record<string, any[]>) => {
    try {
      await localStorage.importData(data);
      await updateStats();
    } catch (error) {
      logger.error('OfflineSync', '[OfflineStorage] Error importing data:', error);
    }
  }, [updateStats]);

  useEffect(() => {
    // ✅ EVENT-DRIVEN: Update stats only when storage operations occur
    updateStats(); // Initial load

    // Subscribe to queue events that affect storage
    getOfflineQueue().then(queue => {
      queue.on('commandEnqueued', updateStats);
      queue.on('syncCompleted', updateStats);
    }).catch(error => {
      logger.error('OfflineSync', '[useOfflineStorage] Error subscribing to queue events:', error);
    });

    // ✅ No interval - storage stats update on actual operations only
    // Users can call updateStats() manually if needed
  }, [updateStats]);

  return {
    storageStats,
    clearStorage,
    exportData,
    importData,
    updateStats
  };
};

export default useOfflineStatus;