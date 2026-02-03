/**
 * Integration tests for offline sync system
 *
 * Tests the complete flow:
 * 1. Operation performed offline → queued
 * 2. Network comes online → sync triggered
 * 3. Queue processes commands → Supabase operations
 * 4. Success/error handling
 *
 * Based on Phase 2 testing strategy from design doc
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineCommandQueue } from '../OfflineCommandQueue';
import { OfflineDB } from '../OfflineDB';
import type { OfflineCommand, SyncResult } from '../types';
import { supabase } from '@/lib/supabase/client';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('Offline Sync Integration Tests', () => {
  let queue: OfflineCommandQueue;
  let db: OfflineDB;

  beforeEach(async () => {
    // Initialize fresh queue and DB for each test
    db = new OfflineDB();
    await db.init();

    queue = new OfflineCommandQueue();
    await queue.init();

    // Clear any existing commands
    const pending = await db.getPendingCommands();
    for (const cmd of pending) {
      if (cmd.id) {
        await db.deleteCommand(cmd.id);
      }
    }
  });

  afterEach(async () => {
    // Cleanup IndexedDB
    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      for (const database of databases) {
        if (database.name === 'g_admin_offline') {
          indexedDB.deleteDatabase(database.name);
        }
      }
    }

    vi.clearAllMocks();
  });

  describe('CREATE operations offline → online sync', () => {
    it('should queue CREATE material when offline and sync when online', async () => {
      // 1. Enqueue CREATE operation
      const materialData = {
        id: '01934f2a-test-material',
        name: 'Cemento Portland',
        type: 'measurable',
        unit_cost: 150.0,
        stock: 0
      };

      const commandId = await queue.enqueue({
        entityType: 'materials',
        entityId: materialData.id,
        operation: 'CREATE',
        data: materialData
      });

      expect(commandId).toBeGreaterThan(0);

      // 2. Verify command is in queue
      const stats = await queue.getStats();
      expect(stats.pending).toBe(1);

      // 3. Mock successful Supabase insert
      const mockInsert = vi.fn().mockResolvedValue({
        data: materialData,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: materialData,
          error: null
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: mockSelect
        })
      } as any);

      // 4. Trigger sync (simulate online event)
      // Note: This would normally be triggered by window.addEventListener('online')
      // For testing, we call replayCommands directly
      const syncResults = await (queue as any).replayCommands();

      // 5. Verify sync completed successfully
      expect(mockInsert).toHaveBeenCalled();

      const statsAfter = await queue.getStats();
      expect(statsAfter.pending).toBe(0);
      expect(statsAfter.total).toBe(0); // Command deleted after successful sync
    });

    it('should generate UUIDv7 for CREATE operations without ID', async () => {
      const materialData = {
        name: 'Test Material',
        type: 'countable',
        unit_cost: 100
      };

      const commandId = await queue.enqueue({
        entityType: 'materials',
        entityId: '', // Will be generated
        operation: 'CREATE',
        data: materialData
      });

      expect(commandId).toBeGreaterThan(0);

      // Verify UUIDv7 was generated
      const pending = await db.getPendingCommands();
      const command = pending.find(c => c.id === commandId);

      expect(command).toBeDefined();
      expect(command?.entityId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}/i); // UUIDv7 pattern
      expect(command?.data.id).toBe(command?.entityId);
    });
  });

  describe('UPDATE operations offline → online sync', () => {
    it('should queue UPDATE material and sync when online', async () => {
      const updateData = {
        id: 'existing-material-id',
        name: 'Updated Material Name',
        unit_cost: 200
      };

      const commandId = await queue.enqueue({
        entityType: 'materials',
        entityId: updateData.id,
        operation: 'UPDATE',
        data: updateData
      });

      expect(commandId).toBeGreaterThan(0);

      // Mock successful update
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updateData,
                error: null
              })
            })
          })
        })
      } as any);

      // Trigger sync
      await (queue as any).replayCommands();

      // Verify queue is empty
      const stats = await queue.getStats();
      expect(stats.pending).toBe(0);
    });
  });

  describe('DELETE operations offline → online sync', () => {
    it('should queue DELETE material and sync when online', async () => {
      const materialId = 'material-to-delete';

      const commandId = await queue.enqueue({
        entityType: 'materials',
        entityId: materialId,
        operation: 'DELETE',
        data: { id: materialId }
      });

      expect(commandId).toBeGreaterThan(0);

      // Mock successful delete
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      // Trigger sync
      await (queue as any).replayCommands();

      // Verify queue is empty
      const stats = await queue.getStats();
      expect(stats.pending).toBe(0);
    });
  });

  describe('Deduplication', () => {
    it('should prevent duplicate CREATE operations for same entity', async () => {
      const materialData = {
        id: 'duplicate-test-id',
        name: 'Test Material',
        type: 'measurable',
        unit_cost: 150
      };

      // First enqueue
      const id1 = await queue.enqueue({
        entityType: 'materials',
        entityId: materialData.id,
        operation: 'CREATE',
        data: materialData
      });

      // Second enqueue (duplicate)
      const id2 = await queue.enqueue({
        entityType: 'materials',
        entityId: materialData.id,
        operation: 'CREATE',
        data: materialData
      });

      expect(id1).toBeGreaterThan(0);
      expect(id2).toBe(-1); // -1 indicates duplicate

      // Verify only one command in queue
      const stats = await queue.getStats();
      expect(stats.pending).toBe(1);
    });

    it('should allow UPDATE after CREATE for same entity', async () => {
      const materialId = 'test-material-id';

      // CREATE
      const id1 = await queue.enqueue({
        entityType: 'materials',
        entityId: materialId,
        operation: 'CREATE',
        data: { id: materialId, name: 'Original' }
      });

      // UPDATE (different operation, should be allowed)
      const id2 = await queue.enqueue({
        entityType: 'materials',
        entityId: materialId,
        operation: 'UPDATE',
        data: { id: materialId, name: 'Updated' }
      });

      expect(id1).toBeGreaterThan(0);
      expect(id2).toBeGreaterThan(0);

      // Both commands should be in queue
      const stats = await queue.getStats();
      expect(stats.pending).toBe(2);
    });
  });

  describe('Priority ordering', () => {
    it('should process commands in priority order (customers > materials > sales)', async () => {
      // Enqueue in reverse priority order
      await queue.enqueue({
        entityType: 'sales',
        entityId: 'sale-1',
        operation: 'CREATE',
        data: { id: 'sale-1' }
      });

      await queue.enqueue({
        entityType: 'materials',
        entityId: 'material-1',
        operation: 'CREATE',
        data: { id: 'material-1' }
      });

      await queue.enqueue({
        entityType: 'customers',
        entityId: 'customer-1',
        operation: 'CREATE',
        data: { id: 'customer-1' }
      });

      // Get pending commands (should be sorted by priority)
      const pending = await db.getPendingCommands();

      expect(pending).toHaveLength(3);
      expect(pending[0].entityType).toBe('customers'); // Priority 0
      expect(pending[1].entityType).toBe('materials'); // Priority 1
      expect(pending[2].entityType).toBe('sales');     // Priority 3
    });
  });

  describe('Error handling and retry logic', () => {
    it('should retry on network error with exponential backoff', async () => {
      const materialData = {
        id: 'retry-test-id',
        name: 'Test Material'
      };

      const commandId = await queue.enqueue({
        entityType: 'materials',
        entityId: materialData.id,
        operation: 'CREATE',
        data: materialData
      });

      // Mock network error
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Network error'))
          })
        })
      } as any);

      // First sync attempt (should fail)
      await (queue as any).replayCommands();

      // Command should still be in queue with retry count
      const pending = await db.getPendingCommands();
      const command = pending.find(c => c.id === commandId);

      expect(command).toBeDefined();
      expect(command?.status).toBe('failed');
      expect(command?.retryCount).toBeGreaterThan(0);
      expect(command?.lastError?.type).toBe('network');
    });

    it('should mark command as failed after max retries', async () => {
      const commandId = await queue.enqueue({
        entityType: 'materials',
        entityId: 'max-retry-test',
        operation: 'CREATE',
        data: { id: 'max-retry-test', name: 'Test' }
      });

      // Mock persistent error
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Persistent error'))
          })
        })
      } as any);

      // Attempt sync multiple times (up to maxRetries)
      const maxRetries = 3;
      for (let i = 0; i <= maxRetries; i++) {
        await (queue as any).replayCommands();
      }

      // Command should be marked as permanently failed
      const pending = await db.getPendingCommands();
      const command = pending.find(c => c.id === commandId);

      expect(command?.status).toBe('failed');
      expect(command?.retryCount).toBeGreaterThanOrEqual(maxRetries);
    });
  });

  describe('Foreign key dependency handling', () => {
    it('should handle foreign key errors gracefully', async () => {
      // Enqueue sale_item that references non-existent product
      const commandId = await queue.enqueue({
        entityType: 'sale_items',
        entityId: 'item-1',
        operation: 'CREATE',
        data: {
          id: 'item-1',
          sale_id: 'sale-1',
          product_id: 'non-existent-product', // This will fail FK constraint
          quantity: 1,
          unit_price: 100
        }
      });

      // Mock foreign key error
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue({
              code: '23503', // PostgreSQL foreign key violation
              message: 'Foreign key violation'
            })
          })
        })
      } as any);

      // Trigger sync
      await (queue as any).replayCommands();

      // Command should be in failed state with FK error type
      const pending = await db.getPendingCommands();
      const command = pending.find(c => c.id === commandId);

      expect(command?.status).toBe('failed');
      expect(command?.lastError?.type).toBe('foreign_key');
    });
  });

  describe('Event emission', () => {
    it('should emit commandEnqueued event when operation is queued', async () => {
      const eventSpy = vi.fn();
      queue.on('commandEnqueued', eventSpy);

      await queue.enqueue({
        entityType: 'materials',
        entityId: 'test-id',
        operation: 'CREATE',
        data: { id: 'test-id', name: 'Test' }
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          command: expect.objectContaining({
            entityType: 'materials',
            operation: 'CREATE'
          })
        })
      );
    });

    it('should emit syncCompleted event after successful sync', async () => {
      const eventSpy = vi.fn();
      queue.on('syncCompleted', eventSpy);

      await queue.enqueue({
        entityType: 'materials',
        entityId: 'test-id',
        operation: 'CREATE',
        data: { id: 'test-id', name: 'Test' }
      });

      // Mock successful sync
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'test-id', name: 'Test' },
              error: null
            })
          })
        })
      } as any);

      await (queue as any).replayCommands();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          successCount: 1,
          failureCount: 0
        })
      );
    });
  });
});
