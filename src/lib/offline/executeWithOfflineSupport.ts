import { v7 as uuidv7 } from 'uuid';
import { getOfflineQueue } from './queueInstance';
import { logger } from '@/lib/logging';
import type { Database } from '@/lib/supabase/database.types';

interface ExecuteWithOfflineSupportOptions<T = any> {
  entityType: keyof Database['public']['Tables'];
  entityId?: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  execute: () => Promise<T>;
  data: any;
}

/**
 * Execute an operation with offline support
 *
 * When online:
 * - Executes the operation immediately
 * - Returns the result
 *
 * When offline:
 * - Queues the operation for later sync
 * - Generates UUIDv7 for CREATE operations
 * - Returns optimistic response
 *
 * @example
 * ```ts
 * const result = await executeWithOfflineSupport({
 *   entityType: 'materials',
 *   operation: 'CREATE',
 *   execute: async () => {
 *     const { data } = await supabase.from('materials').insert(material).select().single();
 *     return data;
 *   },
 *   data: { name: 'New Material', quantity: 100 }
 * });
 * ```
 */
export async function executeWithOfflineSupport<T = any>(
  options: ExecuteWithOfflineSupportOptions<T>
): Promise<T> {
  const { entityType, entityId, operation, execute, data } = options;

  // Online: execute immediately
  if (navigator.onLine) {
    logger.debug('OfflineSupport', 'Executing online', { operation, entityType });
    return await execute();
  }

  // Offline: queue for later
  logger.info('OfflineSupport', 'Queuing for offline sync', { operation, entityType });

  // Validate required fields
  if ((operation === 'UPDATE' || operation === 'DELETE') && !entityId) {
    throw new Error(`entityId is required for ${operation} operations`);
  }

  // Generate UUIDv7 for CREATE operations if not provided
  let finalData = data;
  let finalEntityId = entityId;

  if (operation === 'CREATE') {
    if (!data.id) {
      const generatedId = uuidv7();
      finalData = { ...data, id: generatedId };
      finalEntityId = generatedId;
      logger.debug('OfflineSupport', 'Generated UUIDv7', { id: generatedId });
    } else {
      finalEntityId = data.id;
    }
  }

  // Enqueue the command
  const queue = await getOfflineQueue();
  await queue.enqueue({
    entityType,
    entityId: finalEntityId!,
    operation,
    data: finalData
  });

  // Return optimistic response
  const optimisticResponse = operation === 'DELETE'
    ? { id: finalEntityId }
    : finalData;

  logger.debug('OfflineSupport', 'Returning optimistic response', {
    operation,
    entityType,
    id: finalEntityId
  });

  return optimisticResponse as T;
}
