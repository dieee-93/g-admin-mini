# Offline-First Sync System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement event-driven offline sync system to eliminate polling-induced re-renders and follow production-proven patterns

**Architecture:** Custom Command Queue with IndexedDB persistence, client-generated UUIDv7, event-driven sync triggers, exponential backoff retry logic, optimistic locking for conflict detection

**Tech Stack:** TypeScript, IndexedDB, uuid v9 (already installed), Supabase, TanStack Query, Vitest, Playwright

---

## Phase 1: Core Infrastructure

### Task 1: TypeScript Types & Interfaces

**Files:**
- Create: `src/lib/offline/types.ts`

**Step 1: Write type definitions**

Create complete TypeScript interfaces for the offline queue system.

```typescript
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
```

**Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No type errors, types compile successfully

**Step 3: Commit**

```bash
git add src/lib/offline/types.ts
git commit -m "feat(offline): add TypeScript types for offline queue system

- Define OfflineCommand interface with IndexedDB schema
- Add SyncResult for operation outcomes
- Add QueueEventData for event-driven architecture
- Based on Next.js + Supabase PWA pattern (Jan 2026)"
```

---

### Task 2: IndexedDB Manager

**Files:**
- Create: `src/lib/offline/OfflineDB.ts`
- Test: `src/lib/offline/__tests__/OfflineDB.test.ts`

**Step 1: Write failing test for DB initialization**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OfflineDB } from '../OfflineDB';

describe('OfflineDB', () => {
  let db: OfflineDB;

  beforeEach(() => {
    db = new OfflineDB();
  });

  afterEach(async () => {
    // Clean up IndexedDB
    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name === 'g_admin_offline') {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
  });

  it('should initialize IndexedDB with correct schema', async () => {
    await db.init();

    // Verify database exists
    const databases = await indexedDB.databases();
    const ourDb = databases.find(d => d.name === 'g_admin_offline');
    expect(ourDb).toBeDefined();
    expect(ourDb?.version).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test OfflineDB.test.ts`
Expected: FAIL with "Cannot find module '../OfflineDB'"

**Step 3: Implement OfflineDB class (part 1: initialization)**

```typescript
import type { OfflineCommand } from './types';
import { logger } from '@/lib/logging';

/**
 * IndexedDB manager for offline queue
 * Based on Next.js + Supabase PWA (Jan 2026)
 */
export class OfflineDB {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'g_admin_offline';
  private readonly DB_VERSION = 1;
  private readonly QUEUE_STORE = 'sync_queue';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        logger.info('OfflineDB', 'IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.QUEUE_STORE)) {
          const store = db.createObjectStore(this.QUEUE_STORE, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Separate indexes (not compound) for flexibility
          store.createIndex('by-status', 'status', { unique: false });
          store.createIndex('by-entityType', 'entityType', { unique: false });
          store.createIndex('by-timestamp', 'timestamp', { unique: false });
          store.createIndex('by-entityId', 'entityId', { unique: false });

          // Unique compound index for deduplication
          store.createIndex('by-operation-key',
            ['entityType', 'entityId', 'operation'],
            { unique: true }
          );

          logger.info('OfflineDB', 'Object store created with indices');
        }
      };
    });
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test OfflineDB.test.ts`
Expected: PASS

**Step 5: Add tests for addCommand with deduplication**

```typescript
it('should add command to queue', async () => {
  await db.init();

  const command: Omit<OfflineCommand, 'id'> = {
    entityType: 'materials',
    entityId: '01934f2a-8c76-7890-abcd-123456789abc',
    operation: 'CREATE',
    data: { id: '01934f2a-...', name: 'Test Material' },
    timestamp: new Date().toISOString(),
    priority: 1,
    status: 'pending',
    retryCount: 0
  };

  const id = await db.addCommand(command);
  expect(id).toBeGreaterThan(0);
});

it('should prevent duplicate operations', async () => {
  await db.init();

  const command: Omit<OfflineCommand, 'id'> = {
    entityType: 'materials',
    entityId: '01934f2a-test',
    operation: 'CREATE',
    data: { id: '01934f2a-test', name: 'Duplicate Test' },
    timestamp: new Date().toISOString(),
    priority: 1,
    status: 'pending',
    retryCount: 0
  };

  const id1 = await db.addCommand(command);
  const id2 = await db.addCommand(command); // Same command

  expect(id1).toBeGreaterThan(0);
  expect(id2).toBe(-1); // Indicates duplicate
});
```

**Step 6: Run tests to verify they fail**

Run: `npm test OfflineDB.test.ts`
Expected: FAIL with "db.addCommand is not a function"

**Step 7: Implement addCommand method**

Add to OfflineDB class:

```typescript
async addCommand(command: Omit<OfflineCommand, 'id'>): Promise<number> {
  if (!this.db) throw new Error('DB not initialized');

  try {
    const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(this.QUEUE_STORE);

    return await new Promise((resolve, reject) => {
      const request = store.add(command);

      request.onsuccess = () => {
        logger.info('OfflineDB', 'Command added to queue', {
          id: request.result,
          entityType: command.entityType,
          operation: command.operation
        });
        resolve(request.result as number);
      };

      request.onerror = () => {
        // ConstraintError means duplicate (unique index violation)
        if (request.error?.name === 'ConstraintError') {
          logger.warn('OfflineDB', 'Duplicate operation ignored', {
            entityType: command.entityType,
            entityId: command.entityId
          });
          resolve(-1); // Indicate duplicate
        } else {
          reject(request.error);
        }
      };
    });
  } catch (error) {
    logger.error('OfflineDB', 'Failed to add command', error);
    throw error;
  }
}
```

**Step 8: Run tests to verify they pass**

Run: `npm test OfflineDB.test.ts`
Expected: All tests PASS

**Step 9: Add remaining methods (getPendingCommands, updateCommand, deleteCommand)**

Add tests first:

```typescript
it('should get pending commands ordered by priority then timestamp', async () => {
  await db.init();

  // Add commands with different priorities
  await db.addCommand({
    entityType: 'sales',
    entityId: 'id1',
    operation: 'CREATE',
    data: {},
    timestamp: '2026-01-29T10:00:00.000Z',
    priority: 3,
    status: 'pending',
    retryCount: 0
  });

  await db.addCommand({
    entityType: 'materials',
    entityId: 'id2',
    operation: 'CREATE',
    data: {},
    timestamp: '2026-01-29T10:01:00.000Z',
    priority: 1,
    status: 'pending',
    retryCount: 0
  });

  const commands = await db.getPendingCommands();

  expect(commands).toHaveLength(2);
  expect(commands[0].priority).toBe(1); // Materials first (lower priority number)
  expect(commands[1].priority).toBe(3); // Sales second
});

it('should update command status', async () => {
  await db.init();

  const id = await db.addCommand({
    entityType: 'materials',
    entityId: 'id1',
    operation: 'CREATE',
    data: {},
    timestamp: new Date().toISOString(),
    priority: 1,
    status: 'pending',
    retryCount: 0
  });

  await db.updateCommand(id, { status: 'syncing' });

  const commands = await db.getPendingCommands();
  expect(commands).toHaveLength(0); // No longer pending
});

it('should delete command', async () => {
  await db.init();

  const id = await db.addCommand({
    entityType: 'materials',
    entityId: 'id1',
    operation: 'CREATE',
    data: {},
    timestamp: new Date().toISOString(),
    priority: 1,
    status: 'pending',
    retryCount: 0
  });

  await db.deleteCommand(id);

  const commands = await db.getPendingCommands();
  expect(commands).toHaveLength(0);
});
```

**Step 10: Run tests to verify they fail**

Run: `npm test OfflineDB.test.ts`
Expected: FAIL - methods not implemented

**Step 11: Implement remaining methods**

Add to OfflineDB class:

```typescript
async getPendingCommands(): Promise<OfflineCommand[]> {
  if (!this.db) throw new Error('DB not initialized');

  try {
    const tx = this.db.transaction(this.QUEUE_STORE, 'readonly');
    const store = tx.objectStore(this.QUEUE_STORE);
    const index = store.index('by-status');

    return await new Promise((resolve, reject) => {
      const request = index.getAll('pending');

      request.onsuccess = () => {
        const commands = request.result as OfflineCommand[];

        // Sort in memory: priority first, then timestamp
        commands.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        logger.info('OfflineDB', `Retrieved ${commands.length} pending commands`);
        resolve(commands);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('OfflineDB', 'Failed to get pending commands', error);
    throw error;
  }
}

async updateCommand(id: number, updates: Partial<OfflineCommand>): Promise<void> {
  if (!this.db) throw new Error('DB not initialized');

  try {
    const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(this.QUEUE_STORE);

    return await new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const command = getRequest.result;

        if (!command) {
          reject(new Error(`Command ${id} not found`));
          return;
        }

        const updated = { ...command, ...updates };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => {
          logger.debug('OfflineDB', 'Command updated', { id, updates });
          resolve();
        };
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    logger.error('OfflineDB', 'Failed to update command', error);
    throw error;
  }
}

async deleteCommand(id: number): Promise<void> {
  if (!this.db) throw new Error('DB not initialized');

  try {
    const tx = this.db.transaction(this.QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(this.QUEUE_STORE);

    return await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        logger.debug('OfflineDB', 'Command deleted', { id });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('OfflineDB', 'Failed to delete command', error);
    throw error;
  }
}

async getQueueStats(): Promise<QueueStats> {
  if (!this.db) throw new Error('DB not initialized');

  try {
    const tx = this.db.transaction(this.QUEUE_STORE, 'readonly');
    const store = tx.objectStore(this.QUEUE_STORE);

    return await new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const commands = request.result as OfflineCommand[];
        const stats = {
          total: commands.length,
          pending: commands.filter(c => c.status === 'pending').length,
          syncing: commands.filter(c => c.status === 'syncing').length,
          failed: commands.filter(c => c.status === 'failed').length
        };

        logger.debug('OfflineDB', 'Queue stats', stats);
        resolve(stats);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('OfflineDB', 'Failed to get queue stats', error);
    throw error;
  }
}
```

**Step 12: Run all tests to verify they pass**

Run: `npm test OfflineDB.test.ts`
Expected: All tests PASS

**Step 13: Commit**

```bash
git add src/lib/offline/OfflineDB.ts src/lib/offline/__tests__/OfflineDB.test.ts
git commit -m "feat(offline): implement IndexedDB manager for offline queue

- Create OfflineDB class with IndexedDB persistence
- Implement deduplication via unique compound index
- Add methods: init, addCommand, getPendingCommands, updateCommand, deleteCommand
- Sort commands by priority + timestamp in memory
- Add comprehensive unit tests
- Pattern based on Next.js + Supabase PWA (Jan 2026)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Command Queue Processor

**Files:**
- Create: `src/lib/offline/OfflineCommandQueue.ts`
- Test: `src/lib/offline/__tests__/OfflineCommandQueue.test.ts`

**Step 1: Write tests for queue initialization and enqueue**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineCommandQueue } from '../OfflineCommandQueue';

describe('OfflineCommandQueue', () => {
  let queue: OfflineCommandQueue;

  beforeEach(async () => {
    queue = new OfflineCommandQueue();
    await queue.init();
  });

  afterEach(async () => {
    // Cleanup IndexedDB
    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name === 'g_admin_offline') {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
  });

  it('should initialize successfully', async () => {
    const stats = await queue.getStats();
    expect(stats.total).toBe(0);
  });

  it('should enqueue command with UUIDv7 and priority', async () => {
    const id = await queue.enqueue({
      entityType: 'materials',
      entityId: '01934f2a-test',
      operation: 'CREATE',
      data: { id: '01934f2a-test', name: 'Test' }
    });

    expect(id).toBeGreaterThan(0);

    const stats = await queue.getStats();
    expect(stats.pending).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test OfflineCommandQueue.test.ts`
Expected: FAIL - module not found

**Step 3: Implement OfflineCommandQueue (part 1: initialization and enqueue)**

```typescript
import { OfflineDB } from './OfflineDB';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { OfflineCommand, SyncResult, OfflineQueueConfig } from './types';

/**
 * Offline Command Queue Processor
 * Based on Workbox Background Sync + Exponential Backoff patterns
 */
export class OfflineCommandQueue {
  private db: OfflineDB;
  private config: OfflineQueueConfig;
  private isSyncing: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config?: Partial<OfflineQueueConfig>) {
    this.db = new OfflineDB();

    this.config = {
      maxRetries: 3,
      initialRetryDelay: 1000,
      maxRetryDelay: 32000,
      priorityOrder: ['customers', 'materials', 'products', 'sales', 'sale_items'],
      ...config
    };
  }

  async init(): Promise<void> {
    await this.db.init();
    this.setupEventListeners();
    logger.info('OfflineQueue', 'Command queue initialized');
  }

  private setupEventListeners(): void {
    // Online event
    window.addEventListener('online', () => {
      logger.info('OfflineQueue', 'Network online detected, triggering sync');
      this.replayCommands();
    });

    // Offline event
    window.addEventListener('offline', () => {
      logger.warn('OfflineQueue', 'Network offline detected, pausing sync');
      this.isSyncing = false;
    });

    // Visibilitychange
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        logger.info('OfflineQueue', 'Page visible and online, checking queue');
        this.replayCommands();
      }
    });
  }

  async enqueue(command: Omit<OfflineCommand, 'id' | 'status' | 'retryCount' | 'timestamp' | 'priority'>): Promise<number> {
    try {
      const priority = this.config.priorityOrder.indexOf(command.entityType);
      const finalPriority = priority === -1 ? 999 : priority;

      const fullCommand: Omit<OfflineCommand, 'id'> = {
        ...command,
        status: 'pending',
        retryCount: 0,
        timestamp: new Date().toISOString(),
        priority: finalPriority
      };

      const id = await this.db.addCommand(fullCommand);

      if (id === -1) {
        logger.warn('OfflineQueue', 'Duplicate operation detected, skipping');
        return -1;
      }

      logger.info('OfflineQueue', 'Command enqueued', {
        id,
        entityType: command.entityType,
        operation: command.operation
      });

      this.emit('commandEnqueued', { id, command: fullCommand });

      // Trigger sync if online (with small delay for batching)
      if (navigator.onLine && !this.isSyncing) {
        setTimeout(() => this.replayCommands(), 100);
      }

      return id;
    } catch (error) {
      logger.error('OfflineQueue', 'Failed to enqueue command', error);
      throw error;
    }
  }

  async getStats() {
    return await this.db.getQueueStats();
  }

  // Event emitter
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('OfflineQueue', `Error in event listener for ${event}`, error);
        }
      });
    }
  }

  // Stub for next step
  private async replayCommands(): Promise<void> {
    // Implementation in next step
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test OfflineCommandQueue.test.ts`
Expected: Tests PASS

**Step 5: Commit**

```bash
git add src/lib/offline/OfflineCommandQueue.ts src/lib/offline/__tests__/OfflineCommandQueue.test.ts
git commit -m "feat(offline): add queue processor initialization and enqueue

- Create OfflineCommandQueue class
- Implement event-driven sync triggers (online/offline/visibilitychange)
- Add enqueue method with priority calculation
- Add event emitter for queue events
- Add unit tests for initialization and enqueue

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**[Continue with remaining tasks in next message due to length...]**

The plan continues with:
- Task 4: Implement replayCommands with exponential backoff
- Task 5: Implement sync methods (CREATE/UPDATE/DELETE)
- Task 6: Integration helper (executeWithOfflineSupport)
- Phase 2: Service Integration
- Phase 3: UI Refactor
- Phase 4: Testing

**Total estimated tasks:** 15-20 bite-sized tasks
**Estimated time:** 3-4 days following TDD approach

Would you like me to continue writing the complete implementation plan, or is this level of detail sufficient for the first phase?
