/**
 * useAdjustStock Hook - Unit Tests (with Optimistic Updates)
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
  notify: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/modules/materials/services', () => ({
  inventoryApi: { updateStock: vi.fn() },
}));

import { useAdjustStock } from '../useAdjustStock';
import { inventoryApi } from '@/modules/materials/services';
import { notify } from '@/lib/notifications';

interface MaterialItem {
  id: string;
  name: string;
  type: string;
  unit: string;
  stock: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAdjustStock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should adjust stock successfully', async () => {
    const updatedMaterial: MaterialItem = {
      id: 'material-123',
      name: 'Harina 000',
      type: 'measurable',
      unit: 'kg',
      stock: 100,
      unit_cost: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(inventoryApi.updateStock).mockResolvedValue(updatedMaterial);

    const { result } = renderHook(() => useAdjustStock(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      materialId: 'material-123',
      newStock: 100,
      oldStock: 50,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(inventoryApi.updateStock).toHaveBeenCalledWith(
      'material-123',
      100,
      mockUser,
      50
    );
    expect(notify.success).toHaveBeenCalled();
  });

  it('should perform optimistic update', async () => {
    const materialId = 'material-123';
    const originalMaterial: MaterialItem = {
      id: materialId,
      name: 'Test Material',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      unit_cost: 100,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    const updatedMaterial: MaterialItem = { ...originalMaterial, stock: 100 };

    vi.mocked(inventoryApi.updateStock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(updatedMaterial), 100))
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData(['materials', 'detail', materialId], originalMaterial);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAdjustStock(), { wrapper });

    result.current.mutate({ materialId, newStock: 100, oldStock: 50 });

    await waitFor(() => {
      const cachedData = queryClient.getQueryData<MaterialItem>(['materials', 'detail', materialId]);
      expect(cachedData?.stock).toBe(100);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should rollback on error', async () => {
    const materialId = 'material-123';
    const originalMaterial: MaterialItem = {
      id: materialId,
      name: 'Test Material',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      unit_cost: 100,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    const error = new Error('Stock adjustment failed');
    vi.mocked(inventoryApi.updateStock).mockRejectedValue(error);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData(['materials', 'detail', materialId], originalMaterial);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAdjustStock(), { wrapper });

    result.current.mutate({ materialId, newStock: 100 });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const cachedData = queryClient.getQueryData<MaterialItem>(['materials', 'detail', materialId]);
    expect(cachedData?.stock).toBe(50); // Rolled back to original
    expect(notify.error).toHaveBeenCalled();
  });
});
