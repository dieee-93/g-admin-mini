import type { Database } from '@/lib/supabase/database.types';

/**
 * Command pattern for offline operations
 * Based on Next.js + Supabase PWA (Jan 2026)
 */
export interface OfflineCommand {
  id?: number;                          // Auto-increment IndexedDB
  entityType: keyof Database['public']['Tables'];
  entityId: string;                     // UUIDv7 of the record
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;                            // Data to sync

  // Metadata
  timestamp: string;                    // ISO string
  priority: number;                     // 0 = highest

  // Sync state
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: {
    type: 'network' | 'foreign_key' | 'validation' | 'conflict' | 'unknown';
    message: string;
    timestamp: number;
  };
  nextRetryAt?: number;                 // Timestamp for exponential backoff
}

export interface SyncResult {
  success: boolean;
  command: OfflineCommand;
  serverData?: any;
  conflict?: {
    serverVersion: any;
    localVersion: any;
    resolution: 'server_wins' | 'user_decide';
  };
  error?: string;
  errorType?: 'network' | 'foreign_key' | 'validation' | 'conflict' | 'unknown';
}

export interface OfflineQueueConfig {
  maxRetries: number;
  initialRetryDelay: number;            // ms
  maxRetryDelay: number;                // ms
  priorityOrder: string[];              // Entity order
}

export interface QueueStats {
  total: number;
  pending: number;
  syncing: number;
  failed: number;
}

export type QueueEvent =
  | 'commandEnqueued'
  | 'syncStarted'
  | 'syncCompleted'
  | 'syncFailed'
  | 'commandSynced'
  | 'commandFailed';

export interface QueueEventData {
  commandEnqueued: { id: number; command: Omit<OfflineCommand, 'id'> };
  syncStarted: { count: number };
  syncCompleted: { successCount: number; failureCount: number };
  syncFailed: { error: string };
  commandSynced: { command: OfflineCommand; result: SyncResult };
  commandFailed: { command: OfflineCommand; error: string };
}
