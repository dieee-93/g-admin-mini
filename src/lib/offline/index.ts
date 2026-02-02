/**
 * Offline-First Sync System
 *
 * Event-driven command queue with IndexedDB persistence and exponential backoff retry logic.
 * Based on Next.js + Supabase PWA patterns (Jan 2026).
 */

export { OfflineDB } from './OfflineDB';
export { OfflineCommandQueue } from './OfflineCommandQueue';
export { getOfflineQueue, resetOfflineQueue } from './queueInstance';
export { executeWithOfflineSupport } from './executeWithOfflineSupport';

export type {
  OfflineCommand,
  SyncResult,
  OfflineQueueConfig,
  QueueStats,
  QueueEvent,
  QueueEventData
} from './types';
