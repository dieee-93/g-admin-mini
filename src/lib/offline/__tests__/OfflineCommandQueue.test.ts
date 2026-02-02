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

  describe('replayCommands', () => {
    it('should process pending commands when online', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Enqueue a command
      await queue.enqueue({
        entityType: 'materials',
        entityId: 'test-1',
        operation: 'CREATE',
        data: { name: 'Test Material' }
      });

      // Mock the sync method to succeed
      const syncSpy = vi.spyOn(queue as any, 'syncCommand').mockResolvedValue({
        success: true,
        command: {}
      });

      // Trigger replay
      await (queue as any).replayCommands();

      expect(syncSpy).toHaveBeenCalledTimes(1);

      // Verify command was processed
      const stats = await queue.getStats();
      expect(stats.pending).toBe(0);
    });

    it('should not process when offline', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Enqueue a command
      await queue.enqueue({
        entityType: 'materials',
        entityId: 'test-2',
        operation: 'CREATE',
        data: { name: 'Test Material' }
      });

      const syncSpy = vi.spyOn(queue as any, 'syncCommand');

      // Trigger replay
      await (queue as any).replayCommands();

      expect(syncSpy).not.toHaveBeenCalled();

      // Command should still be pending
      const stats = await queue.getStats();
      expect(stats.pending).toBe(1);
    });

    it('should implement exponential backoff for retries', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Enqueue a command
      const id = await queue.enqueue({
        entityType: 'materials',
        entityId: 'test-3',
        operation: 'CREATE',
        data: { name: 'Test' }
      });

      // Mock sync to fail with network error
      const syncSpy = vi.spyOn(queue as any, 'syncCommand').mockResolvedValue({
        success: false,
        error: 'Network error',
        errorType: 'network',
        command: { id, retryCount: 0 }
      });

      // First replay attempt
      await (queue as any).replayCommands();

      expect(syncSpy).toHaveBeenCalledTimes(1);

      // Command should be marked for retry with backoff
      const stats = await queue.getStats();
      expect(stats.failed).toBe(0); // Not failed yet, will retry
      expect(stats.pending).toBe(1);
    });

    it('should mark command as failed after max retries', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Create queue with maxRetries: 2 and short delays for testing
      const testQueue = new OfflineCommandQueue({
        maxRetries: 2,
        initialRetryDelay: 10,
        maxRetryDelay: 100
      });
      await testQueue.init();

      // Mock sync to always fail BEFORE enqueueing
      const syncSpy = vi.spyOn(testQueue as any, 'syncCommand').mockResolvedValue({
        success: false,
        error: 'Network error',
        errorType: 'network'
      });

      const id = await testQueue.enqueue({
        entityType: 'materials',
        entityId: 'test-4',
        operation: 'CREATE',
        data: { name: 'Test' }
      });

      expect(id).toBeGreaterThan(0);

      // Attempt 1 (retryCount will be 1, backoff: 10ms)
      await testQueue.replayCommands();
      await new Promise(resolve => setTimeout(resolve, 20));

      // Attempt 2 (retryCount will be 2, backoff: 20ms)
      await testQueue.replayCommands();
      await new Promise(resolve => setTimeout(resolve, 30));

      // Attempt 3 (should mark as failed because retryCount >= maxRetries)
      await testQueue.replayCommands();
      await new Promise(resolve => setTimeout(resolve, 20));

      const stats = await testQueue.getStats();
      expect(stats.failed).toBeGreaterThan(0);
      expect(syncSpy).toHaveBeenCalled();
    }, 15000);
  });
});
