import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeWithOfflineSupport } from '../executeWithOfflineSupport';
import * as queueInstanceModule from '../queueInstance';

// Mock the queue singleton
vi.mock('../queueInstance', () => ({
  getOfflineQueue: vi.fn()
}));

describe('executeWithOfflineSupport', () => {
  let mockQueue: any;

  beforeEach(() => {
    // Create mock queue for each test
    mockQueue = {
      enqueue: vi.fn().mockResolvedValue(1),
      init: vi.fn().mockResolvedValue(undefined)
    };

    // Mock getOfflineQueue to return our mock
    vi.mocked(queueInstanceModule.getOfflineQueue).mockResolvedValue(mockQueue);

    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  describe('Online behavior', () => {
    it('should execute operation directly when online', async () => {
      const mockOperation = vi.fn().mockResolvedValue({ id: 'test-id', name: 'Test' });

      const result = await executeWithOfflineSupport({
        entityType: 'materials',
        operation: 'CREATE',
        execute: mockOperation,
        data: { name: 'Test' }
      });

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'test-id', name: 'Test' });
      expect(mockQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should pass through errors when online operation fails', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        executeWithOfflineSupport({
          entityType: 'materials',
          operation: 'CREATE',
          execute: mockOperation,
          data: { name: 'Test' }
        })
      ).rejects.toThrow('Network error');

      expect(mockQueue.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('Offline behavior', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
    });

    it('should enqueue CREATE operation when offline', async () => {
      const mockOperation = vi.fn();

      const result = await executeWithOfflineSupport({
        entityType: 'materials',
        operation: 'CREATE',
        execute: mockOperation,
        data: { name: 'Test Material' }
      });

      expect(mockOperation).not.toHaveBeenCalled();
      expect(mockQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'materials',
          operation: 'CREATE',
          data: expect.objectContaining({
            id: expect.any(String), // UUIDv7 generated
            name: 'Test Material'
          })
        })
      );

      // Should return optimistic response with generated ID
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Material');
    });

    it('should enqueue UPDATE operation when offline with provided ID', async () => {
      const mockOperation = vi.fn();

      const result = await executeWithOfflineSupport({
        entityType: 'materials',
        entityId: 'existing-id',
        operation: 'UPDATE',
        execute: mockOperation,
        data: { id: 'existing-id', name: 'Updated Material' }
      });

      expect(mockOperation).not.toHaveBeenCalled();
      expect(mockQueue.enqueue).toHaveBeenCalledWith({
        entityType: 'materials',
        entityId: 'existing-id',
        operation: 'UPDATE',
        data: { id: 'existing-id', name: 'Updated Material' }
      });

      expect(result).toEqual({ id: 'existing-id', name: 'Updated Material' });
    });

    it('should enqueue DELETE operation when offline', async () => {
      const mockOperation = vi.fn();

      const result = await executeWithOfflineSupport({
        entityType: 'materials',
        entityId: 'delete-id',
        operation: 'DELETE',
        execute: mockOperation,
        data: { id: 'delete-id' }
      });

      expect(mockOperation).not.toHaveBeenCalled();
      expect(mockQueue.enqueue).toHaveBeenCalledWith({
        entityType: 'materials',
        entityId: 'delete-id',
        operation: 'DELETE',
        data: { id: 'delete-id' }
      });

      expect(result).toEqual({ id: 'delete-id' });
    });

    it('should throw error if entityId is missing for UPDATE operation', async () => {
      const mockOperation = vi.fn();

      await expect(
        executeWithOfflineSupport({
          entityType: 'materials',
          operation: 'UPDATE',
          execute: mockOperation,
          data: { name: 'Test' }
        })
      ).rejects.toThrow('entityId is required for UPDATE operations');
    });

    it('should throw error if entityId is missing for DELETE operation', async () => {
      const mockOperation = vi.fn();

      await expect(
        executeWithOfflineSupport({
          entityType: 'materials',
          operation: 'DELETE',
          execute: mockOperation,
          data: {}
        })
      ).rejects.toThrow('entityId is required for DELETE operations');
    });
  });

  describe('UUIDv7 generation', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
    });

    it('should generate UUIDv7 for CREATE operations', async () => {
      const mockOperation = vi.fn();

      const result = await executeWithOfflineSupport({
        entityType: 'materials',
        operation: 'CREATE',
        execute: mockOperation,
        data: { name: 'Test' }
      });

      // UUIDv7 format: 8-4-4-4-12 characters
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // UUIDv7 should start with timestamp (version 7)
      const version = parseInt(result.id.charAt(14), 16);
      expect(version).toBe(7);
    });

    it('should use provided ID if already exists in data', async () => {
      const mockOperation = vi.fn();

      const result = await executeWithOfflineSupport({
        entityType: 'materials',
        operation: 'CREATE',
        execute: mockOperation,
        data: { id: 'custom-id', name: 'Test' }
      });

      expect(result.id).toBe('custom-id');
    });
  });
});
