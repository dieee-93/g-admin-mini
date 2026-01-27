/**
 * useDeleteMaterial Hook - Unit Tests
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
    error: vi.fn(),
  },
}));

vi.mock('@/modules/materials/services', () => ({
  inventoryApi: {
    deleteItem: vi.fn(),
  },
}));

import { useDeleteMaterial } from '../useDeleteMaterial';
import { inventoryApi } from '@/modules/materials/services';
import { notify } from '@/lib/notifications';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useDeleteMaterial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete material successfully', async () => {
    const materialId = 'material-123';
    vi.mocked(inventoryApi.deleteItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteMaterial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(materialId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(inventoryApi.deleteItem).toHaveBeenCalledWith(materialId, mockUser);
    expect(notify.success).toHaveBeenCalled();
  });

  it('should handle deletion errors', async () => {
    const materialId = 'material-123';
    const error = new Error('Material is used in recipes');
    vi.mocked(inventoryApi.deleteItem).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteMaterial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(materialId);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(notify.error).toHaveBeenCalledWith({
      title: 'Error al eliminar material',
      description: error.message,
    });
  });

  it('should remove from cache and invalidate queries', async () => {
    const materialId = 'material-123';
    vi.mocked(inventoryApi.deleteItem).mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const removeSpy = vi.spyOn(queryClient, 'removeQueries');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteMaterial(), { wrapper });

    result.current.mutate(materialId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(removeSpy).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalled();
  });
});
