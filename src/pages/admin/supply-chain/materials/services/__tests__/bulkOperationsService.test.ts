/**
 * Unit Tests: BulkOperationsService
 *
 * Tests all bulk operations methods with mocked dependencies.
 * Coverage target: >90%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BulkOperationsService } from '../bulkOperationsService';
import { supabase } from '@/lib/supabase/client';
import eventBus from '@/lib/events';
import { logger } from '@/lib/logging';

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

vi.mock('@/lib/events', () => ({
  default: {
    emit: vi.fn()
  }
}));

vi.mock('@/lib/logging', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn() // CRITICAL: Service uses logger.debug()
  }
}));

// Mock validation module
vi.mock('@/lib/validation', () => ({
  secureApiCall: vi.fn((fn) => fn())
}));

// Mock stores to avoid setup issues
vi.mock('@/store/salesStore', () => ({
  useSalesStore: vi.fn()
}));
vi.mock('@/store/customersStore', () => ({
  useCustomersStore: vi.fn()
}));
vi.mock('@/store/staffStore', () => ({
  useStaffStore: vi.fn()
}));

describe('BulkOperationsService', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: user is authenticated
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    } as any);

    // Default mock for RPC: throw error if not configured in test
    vi.mocked(supabase.rpc).mockRejectedValue(
      new Error('Mock not configured - test should set up mockResolvedValueOnce')
    );

    // Default mock for from(): throw error if not configured in test
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockRejectedValue(new Error('Mock not configured')),
      eq: vi.fn().mockRejectedValue(new Error('Mock not configured')),
      in: vi.fn().mockRejectedValue(new Error('Mock not configured')),
      delete: vi.fn().mockRejectedValue(new Error('Mock not configured')),
      select: vi.fn().mockRejectedValue(new Error('Mock not configured'))
    } as any);
  });

  // ============================================
  // adjustStock Tests
  // ============================================
  describe('adjustStock', () => {
    it('should adjust stock for multiple items successfully', async () => {
      const adjustments = [
        { itemId: 'item-1', adjustment: 50, reason: 'Shipment received' },
        { itemId: 'item-2', adjustment: -10, reason: 'Damaged goods' }
      ];

      // Mock successful RPC calls - must return data with name for EventBus
      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({
          data: { success: true, new_stock: 150, previous_stock: 100, name: 'Item 1' },
          error: null
        } as any)
        .mockResolvedValueOnce({
          data: { success: true, new_stock: 90, previous_stock: 100, name: 'Item 2' },
          error: null
        } as any);

      const result = await BulkOperationsService.adjustStock(adjustments);

      // Assertions
      expect(result.totalSucceeded).toBe(2);
      expect(result.totalFailed).toBe(0);
      expect(result.success).toEqual(['item-1', 'item-2']);
      expect(result.failed).toEqual([]);

      // Verify RPC calls
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
      expect(supabase.rpc).toHaveBeenNthCalledWith(1, 'bulk_adjust_stock', {
        p_item_id: 'item-1',
        p_adjustment: 50,
        p_reason: 'Shipment received',
        p_user_id: 'user-123'
      });

      // Verify EventBus emissions
      expect(eventBus.emit).toHaveBeenCalledTimes(2);
      expect(eventBus.emit).toHaveBeenCalledWith('materials.stock_updated', expect.objectContaining({
        itemId: 'item-1',
        previousStock: 100,
        newStock: 150
      }));
    });

    it('should handle partial failures gracefully', async () => {
      const adjustments = [
        { itemId: 'item-1', adjustment: 10, reason: 'Test 1' },
        { itemId: 'item-2', adjustment: 20, reason: 'Test 2' },
        { itemId: 'item-3', adjustment: 30, reason: 'Test 3' }
      ];

      // Mock: 1st succeeds, 2nd fails, 3rd succeeds
      // Error must be an Error instance to get the message
      const error2 = new Error('Stock cannot be negative');
      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: { success: true, name: 'Item 1' }, error: null } as any)
        .mockResolvedValueOnce({ data: null, error: error2 } as any)
        .mockResolvedValueOnce({ data: { success: true, name: 'Item 3' }, error: null } as any);

      const result = await BulkOperationsService.adjustStock(adjustments);

      expect(result.totalSucceeded).toBe(2);
      expect(result.totalFailed).toBe(1);
      expect(result.success).toEqual(['item-1', 'item-3']);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].id).toBe('item-2');
      expect(result.failed[0].error).toContain('Stock cannot be negative');
    });

    it('should handle null user gracefully', async () => {
      // Service uses user?.id || null, doesn't reject on null user
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: "Cannot destructure property 'data' of '(intermediate value)' as it is undefined." }
      } as any);

      const adjustments = [{ itemId: 'item-1', adjustment: 10, reason: 'Test' }];

      const result = await BulkOperationsService.adjustStock(adjustments);

      // Should handle as failed operation, not throw
      expect(result.totalFailed).toBe(1);
      expect(result.failed[0].id).toBe('item-1');
    });

    it('should handle empty adjustments array', async () => {
      const result = await BulkOperationsService.adjustStock([]);

      expect(result.totalSucceeded).toBe(0);
      expect(result.totalFailed).toBe(0);
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('should log each operation', async () => {
      const adjustments = [{ itemId: 'item-1', adjustment: 10, reason: 'Test' }];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as any);

      await BulkOperationsService.adjustStock(adjustments);

      expect(logger.info).toHaveBeenCalledWith(
        'BulkOperationsService',
        expect.stringContaining('Bulk stock adjustment completed')
      );
    });
  });

  // ============================================
  // changeCategory Tests
  // ============================================
  describe('changeCategory', () => {
    it('should change category for multiple items', async () => {
      const itemIds = ['item-1', 'item-2', 'item-3'];
      const newCategory = 'Lácteos';

      // Service iterates one by one using .eq(), not .in()
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq
      } as any);

      const result = await BulkOperationsService.changeCategory(itemIds, newCategory);

      expect(result.totalSucceeded).toBe(3);
      expect(result.totalFailed).toBe(0);
      // Verify update was called with category and updated_at
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        category: 'Lácteos'
      }));
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(eventBus.emit).toHaveBeenCalledWith('materials.bulk_category_changed', expect.any(Object));
    });

    it('should throw error if newCategory is empty', async () => {
      await expect(
        BulkOperationsService.changeCategory(['item-1'], '')
      ).rejects.toThrow('Category cannot be empty');
    });

    it('should handle database errors gracefully', async () => {
      // Service doesn't reject on DB errors, it returns failed items
      // Error must be an Error instance to get the message
      const dbError = new Error('Database error');
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        error: dbError
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq
      } as any);

      const result = await BulkOperationsService.changeCategory(['item-1'], 'Test');

      // Should handle as failed operation, not throw
      expect(result.totalFailed).toBe(1);
      expect(result.failed[0].error).toContain('Database error');
    });
  });

  // ============================================
  // deleteItems Tests
  // ============================================
  describe('deleteItems', () => {
    it('should check dependencies before deletion', async () => {
      const itemIds = ['item-1', 'item-2'];

      // Service checks 2 tables per item: stock_entries and recipe_items
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn()
        // item-1 checks
        .mockResolvedValueOnce({ count: 5, error: null }) // stock_entries: 5
        .mockResolvedValueOnce({ count: 0, error: null }) // recipe_items: 0
        // item-2 checks
        .mockResolvedValueOnce({ count: 0, error: null }) // stock_entries: 0
        .mockResolvedValueOnce({ count: 0, error: null }); // recipe_items: 0

      // Mock delete for item-2
      const mockDelete = vi.fn().mockReturnThis();

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'items') {
          return {
            delete: mockDelete,
            eq: vi.fn().mockResolvedValue({ error: null })
          } as any;
        }
        return {
          select: mockSelect,
          eq: mockEq
        } as any;
      });

      const result = await BulkOperationsService.deleteItems(itemIds, false);

      expect(result.totalSucceeded).toBe(1); // item-2 succeeds
      expect(result.totalFailed).toBe(1); // item-1 fails
      expect(result.failed[0].id).toBe('item-1');
      expect(result.failed[0].error).toContain('has dependencies');
    });

    it('should force delete when requested', async () => {
      const itemIds = ['item-1'];

      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq
      } as any);

      const result = await BulkOperationsService.deleteItems(itemIds, true);

      expect(result.totalSucceeded).toBe(1);
      expect(mockDelete).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith('materials.bulk_deleted', expect.any(Object));
    });

    it('should handle empty itemIds array', async () => {
      const result = await BulkOperationsService.deleteItems([], false);

      expect(result.totalSucceeded).toBe(0);
      expect(result.totalFailed).toBe(0);
    });
  });

  // ============================================
  // toggleActive Tests
  // ============================================
  describe('toggleActive', () => {
    it('should activate multiple items', async () => {
      const itemIds = ['item-1', 'item-2'];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockIn = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        in: mockIn
      } as any);

      const result = await BulkOperationsService.toggleActive(itemIds, true);

      expect(result.totalSucceeded).toBe(2);
      // Service includes updated_at timestamp
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        is_active: true
      }));
      // Service emits 'materials.bulk_status_changed', not 'materials.bulk_activated'
      expect(eventBus.emit).toHaveBeenCalledWith('materials.bulk_status_changed', expect.any(Object));
    });

    it('should deactivate multiple items', async () => {
      const itemIds = ['item-1'];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockIn = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        in: mockIn
      } as any);

      const result = await BulkOperationsService.toggleActive(itemIds, false);

      expect(result.totalSucceeded).toBe(1);
      // Service includes updated_at timestamp
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        is_active: false
      }));
      // Service emits 'materials.bulk_status_changed', not 'materials.bulk_deactivated'
      expect(eventBus.emit).toHaveBeenCalledWith('materials.bulk_status_changed', expect.any(Object));
    });
  });

  // ============================================
  // exportToCSV Tests
  // ============================================
  describe('exportToCSV', () => {
    it('should generate valid CSV with all columns', async () => {
      const items = [
        {
          id: 'item-1',
          name: 'Test Item 1',
          category: 'Lácteos',
          type: 'COUNTABLE' as const,
          stock: 100,
          unit: 'unidad',
          unit_cost: 5.50,
          min_stock: 10,
          supplier_id: 'supplier-1',
          location_id: 'location-1',
          is_active: true
        },
        {
          id: 'item-2',
          name: 'Test Item 2',
          category: 'Carnes',
          type: 'MEASURABLE' as const,
          stock: 50.5,
          unit: 'kg',
          unit_cost: 12.75,
          min_stock: 5,
          supplier_id: 'supplier-2',
          location_id: 'location-1',
          is_active: false
        }
      ];

      const csv = await BulkOperationsService.exportToCSV(items as any);

      // Verify header
      expect(csv).toContain('ID,Nombre,Categoría,Tipo,Stock,Unidad,Costo Unitario');

      // Verify data rows with proper decimal formatting (toFixed(2))
      expect(csv).toContain('"Test Item 1"');
      expect(csv).toContain('"Lácteos"');
      expect(csv).toContain('"100.00"'); // toFixed(2) adds decimals
      expect(csv).toContain('"5.50"');

      expect(csv).toContain('"Test Item 2"');
      expect(csv).toContain('"Carnes"');
      expect(csv).toContain('"50.50"'); // toFixed(2) normalizes decimals
      expect(csv).toContain('"12.75"');

      // Verify line count (header + 2 items)
      const lines = csv.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3);
    });

    it('should handle empty items array', async () => {
      const csv = await BulkOperationsService.exportToCSV([]);

      // Should only have header
      const lines = csv.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(1);
      expect(csv).toContain('ID,Nombre,Categoría');
    });

    it('should escape special characters in CSV', async () => {
      const items = [
        {
          id: 'item-1',
          name: 'Item with "quotes" and, comma',
          category: 'Test',
          type: 'COUNTABLE' as const,
          stock: 10,
          unit: 'unidad',
          unit_cost: 1,
          is_active: true
        }
      ];

      const csv = await BulkOperationsService.exportToCSV(items as any);

      // Quotes should be escaped by doubling them (CSV standard)
      // "Item with "quotes"" becomes "Item with ""quotes"""
      expect(csv).toContain('Item with ""quotes"" and, comma');
    });

    it('should handle null/undefined values', async () => {
      const items = [
        {
          id: 'item-1',
          name: 'Test Item',
          category: undefined,
          type: 'COUNTABLE' as const,
          stock: 10,
          unit: 'unidad',
          unit_cost: 1,
          supplier_id: null,
          is_active: true
        }
      ];

      const csv = await BulkOperationsService.exportToCSV(items as any);

      // Should not crash, should have empty values
      expect(csv).toContain('""'); // Empty category
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('Error Handling', () => {
    it('should handle errors gracefully in secureApiCall', async () => {
      // Force an RPC error - must be Error instance
      const dbError = new Error('Database connection failed');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: dbError
      } as any);

      // Service handles errors gracefully, doesn't throw
      const result = await BulkOperationsService.adjustStock([
        { itemId: 'item-1', adjustment: 10, reason: 'Test' }
      ]);

      expect(result.totalFailed).toBe(1);
      expect(result.failed[0].error).toContain('Database connection failed');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should provide detailed error messages', async () => {
      // Error must be Error instance to get the message
      const stockError = new Error('Insufficient stock');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: stockError
      } as any);

      const result = await BulkOperationsService.adjustStock([
        { itemId: 'item-1', adjustment: -1000, reason: 'Test' }
      ]);

      expect(result.totalFailed).toBe(1);
      expect(result.failed[0].error).toContain('Insufficient stock');
    });
  });
});
