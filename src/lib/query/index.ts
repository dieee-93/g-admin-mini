/**
 * Query utilities - Request deduplication and helpers
 *
 * @module Query
 */

export {
  deduplicator,
  generateRequestKey,
  logDeduplicationStats,
  enableDebugMode
} from './requestDeduplication';

export type { DeduplicationStats } from './requestDeduplication';
