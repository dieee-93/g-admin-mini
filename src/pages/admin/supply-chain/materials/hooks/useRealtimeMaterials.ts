/**
 * useRealtimeMaterials Hook
 *
 * Enables real-time synchronization of materials/inventory data
 * using Supabase Realtime subscriptions.
 *
 * Features:
 * - Optimistic updates (update local state immediately)
 * - Automatic reconnection on network failures
 * - Multi-user collaboration support
 * - Minimal re-renders via selective updates
 *
 * Usage:
 * ```tsx
 * function MaterialsPage() {
 *   const { items, loading } = useMaterials();
 *   useRealtimeMaterials(); // Enable real-time sync
 *
 *   return <MaterialsTable items={items} />;
 * }
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useMaterials } from '@/store/materialsStore';
import { MaterialsDataNormalizer } from '@/pages/admin/supply-chain/materials/services/materialsDataNormalizer';
import { logger } from '@/lib/logging';
import eventBus from '@/lib/events';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types';

interface UseRealtimeMaterialsOptions {
  /**
   * Filter by location_id for multi-location setups
   */
  locationId?: string;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Disable real-time sync (useful for testing)
   */
  disabled?: boolean;
}

export function useRealtimeMaterials(options: UseRealtimeMaterialsOptions = {}) {
  const { locationId, debug = false, disabled = false } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { items, addItem, updateItem, removeItem } = useMaterials();

  /**
   * Handle real-time database changes
   */
  const handleRealtimeChange = useCallback((payload: RealtimePostgresChangesPayload<MaterialItem>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (debug) {
      logger.debug('useRealtimeMaterials', `Received ${eventType} event`, payload);
    }

    try {
      switch (eventType) {
        case 'INSERT': {
          // New material added by another user
          const normalizedItem = MaterialsDataNormalizer.fromSupabase(newRecord);

          // Check if item already exists (prevent duplicates)
          const exists = items.some(item => item.id === normalizedItem.id);
          if (!exists) {
            addItem(normalizedItem);

            logger.info('useRealtimeMaterials', `📦 Material added: ${normalizedItem.name}`);

            // Emit event for cross-module awareness
            eventBus.emit('materials.material_created', {
              materialId: normalizedItem.id,
              materialName: normalizedItem.name,
              category: normalizedItem.category,
              initialStock: normalizedItem.stock,
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'UPDATE': {
          // Material updated by another user
          const normalizedItem = MaterialsDataNormalizer.fromSupabase(newRecord);
          updateItem(normalizedItem.id, normalizedItem);

          logger.info('useRealtimeMaterials', `✏️ Material updated: ${normalizedItem.name}`);

          // Check if stock changed
          const oldItem = items.find(item => item.id === normalizedItem.id);
          if (oldItem && oldItem.stock !== normalizedItem.stock) {
            eventBus.emit('materials.stock_updated', {
              itemId: normalizedItem.id,
              itemName: normalizedItem.name,
              previousStock: oldItem.stock,
              newStock: normalizedItem.stock,
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'DELETE': {
          // Material deleted by another user
          const deletedId = oldRecord.id;
          removeItem(deletedId);

          logger.info('useRealtimeMaterials', `🗑️ Material deleted: ${oldRecord.name || deletedId}`);
          break;
        }

        default:
          if (debug) {
            logger.debug('useRealtimeMaterials', `Unknown event type: ${eventType}`);
          }
      }
    } catch (error) {
      logger.error('useRealtimeMaterials', 'Error handling real-time change', error);
    }
  }, [items, addItem, updateItem, removeItem, debug]);

  useEffect(() => {
    // Don't subscribe if disabled
    if (disabled) {
      if (debug) logger.debug('useRealtimeMaterials', 'Real-time sync disabled');
      return;
    }

    // Create channel for materials table
    const channelName = locationId
      ? `materials-location-${locationId}`
      : 'materials-all';

    if (debug) {
      logger.debug('useRealtimeMaterials', `Subscribing to channel: ${channelName}`);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          ...(locationId ? { filter: `location_id=eq.${locationId}` } : {})
        },
        (payload: RealtimePostgresChangesPayload<MaterialItem>) => {
          handleRealtimeChange(payload);
        }
      )
      .subscribe((status) => {
        if (debug) {
          logger.debug('useRealtimeMaterials', `Subscription status: ${status}`);
        }

        if (status === 'SUBSCRIBED') {
          logger.info('useRealtimeMaterials', `✓ Real-time sync active (${channelName})`);
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('useRealtimeMaterials', 'Failed to subscribe to real-time updates');
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (debug) {
        logger.debug('useRealtimeMaterials', 'Unsubscribing from real-time updates');
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [locationId, debug, disabled, handleRealtimeChange]);

  return {
    isActive: channelRef.current !== null && !disabled
  };
}
