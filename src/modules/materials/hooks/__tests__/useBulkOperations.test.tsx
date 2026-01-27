/**
 * useBulkOperations Hooks - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// MOCKS
const mockUser = { id: 'user-123', email: 'test@example.com' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/modules/materials/services', () => ({
  BulkOperationsService: {
    deleteItems: vi.fn(),
    adjustStock: vi.fn(),  
    toggleActive: vi.fn(),
  },
}));

import { useBulkDeleteMaterials, useBulkAdjustStock, useBulkToggleActive } from '../useBulkOperations';
import { BulkOperationsService } from '@/modules/materials/services';
import { notify } from '@/lib/notifications';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useBulkDeleteMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete multiple materials successfully', async () => {
    const result = {
      success: ['id-1', 'id-2', 'id-3'],
      failed: [],
      totalSucceeded: 3,
      totalFailed: 0,
    };

    vi.mocked(BulkOperationsService.deleteItems).mockResolvedValue(result);

    const { result: hookResult } = renderHook(() => useBulkDeleteMaterials(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate(['id-1', 'id-2', 'id-3']);

    await waitFor(() => {
      expect(hookResult.current.isSuccess).toBe(true);
    });

    expect(BulkOperationsService.deleteItems).toHaveBeenCalledWith(
      ['id-1', 'id-2', 'id-3'],
      false
    );
    expect(notify.success).toHaveBeenCalled();
  });

  it('should handle partial failures', async () => {
    const result = {
      success: ['id-1', 'id-2'],
      failed: [{ itemId: 'id-3', error: 'Used in recipes' }],
      totalSucceeded: 2,
      totalFailed: 1,
    };

    vi.mocked(BulkOperationsService.deleteItems).mockResolvedValue(result);

    const { result: hookResult } = renderHook(() => useBulkDeleteMaterials(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate(['id-1', 'id-2', 'id-3']);

    await waitFor(() => {
      expect(hookResult.current.isSuccess).toBe(true);
    });

    expect(notify.success).toHaveBeenCalled();
    expect(notify.warning).toHaveBeenCalled();
  });
});

describe('useBulkAdjustStock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should adjust stocks for multiple materials', async () => {
    const adjustments = [
      { materialId: 'id-1', newStock: 100 },
      { materialId: 'id-2', newStock: 200 },
    ];

    const result = {
      success: ['id-1', 'id-2'],
      failed: [],
      totalSucceeded: 2,
      totalFailed: 0,
    };

    vi.mocked(BulkOperationsService.adjustStock).mockResolvedValue(result);

    const { result: hookResult } = renderHook(() => useBulkAdjustStock(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate(adjustments);

    await waitFor(() => {
      expect(hookResult.current.isSuccess).toBe(true);
    });

    expect(BulkOperationsService.adjustStock).toHaveBeenCalledWith(adjustments);
    expect(notify.success).toHaveBeenCalled();
  });
});

describe('useBulkToggleActive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle active status for multiple materials', async () => {
    const result = {
      success: ['id-1', 'id-2'],
      failed: [],
      totalSucceeded: 2,
      totalFailed: 0,
    };

    vi.mocked(BulkOperationsService.toggleActive).mockResolvedValue(result);

    const { result: hookResult } = renderHook(() => useBulkToggleActive(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate({ itemIds: ['id-1', 'id-2'], isActive: false });

    await waitFor(() => {
      expect(hookResult.current.isSuccess).toBe(true);
    });

    expect(BulkOperationsService.toggleActive).toHaveBeenCalledWith(
      ['id-1', 'id-2'],
      false
    );
    expect(notify.success).toHaveBeenCalled();
  });
});
