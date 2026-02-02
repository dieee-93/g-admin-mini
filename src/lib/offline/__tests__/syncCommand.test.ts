import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineCommandQueue } from '../OfflineCommandQueue';
import { supabase } from '@/lib/supabase/client';
import type { OfflineCommand } from '../types';

describe('syncCommand', () => {
  let queue: OfflineCommandQueue;

  beforeEach(async () => {
    queue = new OfflineCommandQueue();
    await queue.init();

    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(async () => {
    // Close and cleanup
    if (queue && (queue as any).db && (queue as any).db.db) {
      (queue as any).db.db.close();
    }

    const deleteRequest = indexedDB.deleteDatabase('g_admin_offline');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
    });
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  describe('CREATE operations', () => {
    it('should successfully sync CREATE command', async () => {
      const command: OfflineCommand = {
        id: 1,
        entityType: 'materials',
        entityId: 'test-uuid',
        operation: 'CREATE',
        data: { id: 'test-uuid', name: 'Test Material', quantity: 100 },
        timestamp: new Date().toISOString(),
        priority: 1,
        status: 'pending',
        retryCount: 0
      };

      // Mock successful insert
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: command.data,
        error: null
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: mockInsert,
        select: mockSelect
      } as any);

      const result = await (queue as any).syncCommand(command);

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(command.data);
    });

    it('should handle foreign key violations', async () => {
      const command: OfflineCommand = {
        id: 2,
        entityType: 'sale_items',
        entityId: 'test-uuid',
        operation: 'CREATE',
        data: { id: 'test-uuid', sale_id: 'non-existent' },
        timestamp: new Date().toISOString(),
        priority: 1,
        status: 'pending',
        retryCount: 0
      };

      // Mock foreign key error
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: '23503',
          message: 'foreign key violation'
        }
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: mockInsert,
        select: mockSelect
      } as any);

      const result = await (queue as any).syncCommand(command);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('foreign_key');
    });

    it('should handle validation errors', async () => {
      const command: OfflineCommand = {
        id: 3,
        entityType: 'materials',
        entityId: 'test-uuid',
        operation: 'CREATE',
        data: { id: 'test-uuid' }, // Missing required fields
        timestamp: new Date().toISOString(),
        priority: 1,
        status: 'pending',
        retryCount: 0
      };

      // Mock validation error
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: '23502',
          message: 'null value in column'
        }
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: mockInsert,
        select: mockSelect
      } as any);

      const result = await (queue as any).syncCommand(command);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('validation');
    });
  });

  describe('UPDATE operations', () => {
    it('should successfully sync UPDATE command', async () => {
      const command: OfflineCommand = {
        id: 4,
        entityType: 'materials',
        entityId: 'test-uuid',
        operation: 'UPDATE',
        data: { id: 'test-uuid', name: 'Updated Material' },
        timestamp: new Date().toISOString(),
        priority: 1,
        status: 'pending',
        retryCount: 0
      };

      // Mock successful update
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [command.data],
        error: null
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect
      } as any);

      const result = await (queue as any).syncCommand(command);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(command.data);
      expect(mockEq).toHaveBeenCalledWith('id', command.entityId);
    });
  });

  describe('DELETE operations', () => {
    it('should successfully sync DELETE command', async () => {
      const command: OfflineCommand = {
        id: 5,
        entityType: 'materials',
        entityId: 'test-uuid',
        operation: 'DELETE',
        data: { id: 'test-uuid' },
        timestamp: new Date().toISOString(),
        priority: 1,
        status: 'pending',
        retryCount: 0
      };

      // Mock successful delete
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null
      });

      vi.spyOn(supabase, 'from').mockReturnValue({
        delete: mockDelete,
        eq: mockEq
      } as any);

      const result = await (queue as any).syncCommand(command);

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', command.entityId);
    });
  });

  describe('Network errors', () => {
    it('should handle network errors gracefully', async () => {
      const command: OfflineCommand = {
        id: 6,
        entityType: 'materials',
        entityId: 'test-uuid',
        operation: 'CREATE',
        data: { id: 'test-uuid', name: 'Test' },
        timestamp: new Date().toISOString(),
        priority: 1,
        status: 'pending',
        retryCount: 0
      };

      // Simulate network error
      vi.spyOn(supabase, 'from').mockImplementation(() => {
        throw new Error('Network request failed');
      });

      const result = await (queue as any).syncCommand(command);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('network');
      expect(result.error).toContain('Network');
    });
  });
});
