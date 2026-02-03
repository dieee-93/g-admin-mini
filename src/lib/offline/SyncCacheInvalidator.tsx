/**
 * Sync Cache Invalidator Component
 *
 * Listens to Service Worker sync completion events and invalidates
 * TanStack Query cache to ensure UI shows fresh data.
 *
 * Must be placed inside QueryClientProvider to access queryClient.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';

export function SyncCacheInvalidator() {
  const queryClient = useQueryClient();

  useEffect(() => {
    /**
     * Handle sync completion from Service Worker
     *
     * This event is dispatched by BackgroundSync.ts when the Service Worker
     * posts a message that sync has completed.
     */
    const handleSyncCompleted = ((event: CustomEvent) => {
      const { successCount, failureCount } = event.detail;

      logger.info('SyncCacheInvalidator', 'Service Worker sync completed', {
        successCount,
        failureCount
      });

      if (successCount > 0) {
        // Invalidate all queries to refetch fresh data
        // This ensures UI reflects server state after background sync
        queryClient.invalidateQueries();

        logger.info('SyncCacheInvalidator', 'All queries invalidated after sync');

        // Optionally, show a toast notification
        // (Can be implemented later based on design system)
      }

      if (failureCount > 0) {
        logger.warn('SyncCacheInvalidator', 'Some operations failed to sync', {
          failureCount
        });

        // Could show error notification here
      }

    }) as EventListener;

    // Listen to the custom event dispatched by BackgroundSync
    window.addEventListener('offline-sync-completed', handleSyncCompleted);

    logger.debug('SyncCacheInvalidator', 'Mounted - listening for sync completion');

    return () => {
      window.removeEventListener('offline-sync-completed', handleSyncCompleted);
      logger.debug('SyncCacheInvalidator', 'Unmounted - removed listener');
    };
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}
