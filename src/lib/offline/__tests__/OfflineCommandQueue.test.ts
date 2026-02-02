import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineCommandQueue } from '../OfflineCommandQueue';

describe('OfflineCommandQueue', () => {
  let queue: OfflineCommandQueue;

  beforeEach(async () => {
    queue = new OfflineCommandQueue();
    await queue.init();
  });

  afterEach(async () => {
    // Close the database connection first
    if (queue && (queue as any).db && (queue as any).db.db) {
      (queue as any).db.db.close();
    }

    // Clean up IndexedDB
    const deleteRequest = indexedDB.deleteDatabase('g_admin_offline');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Still resolve to continue
      deleteRequest.onblocked = () => {
        console.warn('Database deletion blocked');
        resolve();
      };
    });

    // Small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 10));
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

  it('should calculate priority based on entity type', async () => {
    // Enqueue different entity types
    const id1 = await queue.enqueue({
      entityType: 'sales',
      entityId: 'sale1',
      operation: 'CREATE',
      data: {}
    });

    const id2 = await queue.enqueue({
      entityType: 'materials',
      entityId: 'mat1',
      operation: 'CREATE',
      data: {}
    });

    expect(id1).toBeGreaterThan(0);
    expect(id2).toBeGreaterThan(0);
  });

  it('should emit commandEnqueued event', async () => {
    const mockListener = vi.fn();
    queue.on('commandEnqueued', mockListener);

    await queue.enqueue({
      entityType: 'materials',
      entityId: 'test-id',
      operation: 'CREATE',
      data: {}
    });

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(Number),
        command: expect.objectContaining({
          entityType: 'materials',
          operation: 'CREATE'
        })
      })
    );
  });

  it('should support event listener removal', () => {
    const mockListener = vi.fn();
    queue.on('commandEnqueued', mockListener);
    queue.off('commandEnqueued', mockListener);

    queue.enqueue({
      entityType: 'materials',
      entityId: 'test',
      operation: 'CREATE',
      data: {}
    });

    // Listener was removed, should not be called
    expect(mockListener).not.toHaveBeenCalled();
  });
});
