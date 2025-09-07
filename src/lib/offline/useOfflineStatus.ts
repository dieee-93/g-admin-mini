// useOfflineStatus.ts - React Hook for Offline Status Management
// Provides comprehensive offline status, sync monitoring, and queue management

import { useState, useEffect, useCallback, useRef } from 'react';
import offlineSync, { type SyncStatus } from './OfflineSync';
import localStorage from './LocalStorage';

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
  queueOperation: (operation: unknown) => Promise<string>;
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
          console.error('[OfflineStatus] Error in online callback:', error);
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
          console.error('[OfflineStatus] Error in offline callback:', error);
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
      setNetworkInfo({
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      });
    }
  }, []);

  // Update storage information
  const updateStorageInfo = useCallback(async () => {
    try {
      const stats = await localStorage.getStorageStats();
      let totalItems = 0;
      
      Object.values(stats).forEach((storeStat: unknown) => {
        if (typeof storeStat === 'object' && storeStat.count) {
          totalItems += storeStat.count;
        }
      });

      // Estimate storage usage (simplified)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        setStorageInfo({
          used,
          available,
          percentage,
          itemCount: totalItems
        });
      } else {
        setStorageInfo(prev => ({
          ...prev,
          itemCount: totalItems
        }));
      }
    } catch (error) {
      console.error('[OfflineStatus] Error updating storage info:', error);
    }
  }, []);

  // Update sync status
  const updateSyncStatus = useCallback(() => {
    const status = offlineSync.getSyncStatus();
    setSyncStatus(status);
  }, []);

  // Queue operation wrapper
  const queueOperation = useCallback(async (operation: unknown): Promise<string> => {
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
          console.error('[OfflineStatus] Error in sync complete callback:', error);
        }
      });
    };

    offlineSync.on('syncCompleted', handleSyncComplete);
    offlineSync.on('networkOnline', updateConnectionStatus);
    offlineSync.on('networkOffline', updateConnectionStatus);

    // Periodic updates
    const statusInterval = setInterval(() => {
      updateSyncStatus();
      updateStorageInfo();
    }, 2000);

    const networkInterval = setInterval(updateNetworkInfo, 10000);

    // Initial updates
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

      clearInterval(statusInterval);
      clearInterval(networkInterval);
      
      // Clear callbacks
      eventCallbacks.current = {
        online: [],
        offline: [],
        syncComplete: []
      };
    };
  }, [updateConnectionStatus, updateNetworkInfo, updateSyncStatus, updateStorageInfo]);

  return {
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
  };
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
export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(offlineSync.getSyncStatus());
    };

    const interval = setInterval(updateStatus, 1000);
    updateStatus();

    offlineSync.on('syncStarted', updateStatus);
    offlineSync.on('syncCompleted', updateStatus);
    offlineSync.on('syncFailed', updateStatus);

    return () => {
      clearInterval(interval);
      offlineSync.off('syncStarted', updateStatus);
      offlineSync.off('syncCompleted', updateStatus);
      offlineSync.off('syncFailed', updateStatus);
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
      console.error('[OfflineStorage] Error updating stats:', error);
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
      console.error('[OfflineStorage] Error clearing storage:', error);
    }
  }, [updateStats]);

  const exportData = useCallback(async () => {
    try {
      return await localStorage.exportData();
    } catch (error) {
      console.error('[OfflineStorage] Error exporting data:', error);
      return {};
    }
  }, []);

  const importData = useCallback(async (data: Record<string, any[]>) => {
    try {
      await localStorage.importData(data);
      await updateStats();
    } catch (error) {
      console.error('[OfflineStorage] Error importing data:', error);
    }
  }, [updateStats]);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
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