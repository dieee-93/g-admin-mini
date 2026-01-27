/**
 * useUpdateMaterial Hook - Unit Tests
 * 
 * Tests TanStack Query mutation with optimistic updates and rollback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ============================================================================
// MOCKS (MUST be before imports)
// ============================================================================

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
    updateItem: vi.fn(),
  },
}));

// ============================================================================
// NOW SAFE TO IMPORT
// ============================================================================

import { useUpdateMaterial } from '../useUpdateMaterial';
import { inventoryApi } from '@/modules/materials/services';
import { notify } from '@/lib/notifications';

// ============================================================================
// TYPES
// ============================================================================

interface MaterialItem {
  id: string;
  name: string;
  type: string;
  unit: string;
  stock: number;
  min_stock?: number;
  unit_cost: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TEST HELPERS
// ============================================================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================================================
// TESTS
// ============================================================================

describe('useUpdateMaterial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update material successfully', async () => {
    // ARRANGE
    const materialId = 'material-123';
    const updates = { name: 'Updated Name', unit_cost: 200 };
    const updatedMaterial: MaterialItem = {
      id: materialId,
      name: 'Updated Name',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      min_stock: 10,
      unit_cost: 200,
      category: 'Harinas',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(inventoryApi.updateItem).mockResolvedValue(updatedMaterial);

    // ACT
    const { result } = renderHook(() => useUpdateMaterial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: materialId, data: updates });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT
    expect(result.current.data).toEqual(updatedMaterial);
    expect(inventoryApi.updateItem).toHaveBeenCalledWith(materialId, updates, mockUser);
    expect(notify.success).toHaveBeenCalledWith({
      title: 'Material actualizado',
      description: expect.stringContaining('Updated Name'),
    });
  });

  it('should handle update errors', async () => {
    // ARRANGE
    const materialId = 'material-123';
    const updates = { name: 'Invalid Name' };
    const error = new Error('Duplicate name');

    vi.mocked(inventoryApi.updateItem).mockRejectedValue(error);

    // ACT
    const { result } = renderHook(() => useUpdateMaterial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: materialId, data: updates });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // ASSERT
    expect(result.current.error).toEqual(error);
    expect(notify.error).toHaveBeenCalledWith({
      title: 'Error al actualizar material',
      description: error.message,
    });
  });

  it('should perform optimistic update', async () => {
    // ARRANGE
    const materialId = 'material-123';
    const originalMaterial: MaterialItem = {
      id: materialId,
      name: 'Original Name',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      min_stock: 10,
      unit_cost: 150,
      category: 'Harinas',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    const updates = { name: 'Updated Name', unit_cost: 200 };
    const updatedMaterial: MaterialItem = { ...originalMaterial, ...updates };

    // Delay the API response to allow us to check optimistic state
    vi.mocked(inventoryApi.updateItem).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(updatedMaterial), 100))
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    // Pre-populate cache with original material
    queryClient.setQueryData(['materials', 'detail', materialId], originalMaterial);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // ACT
    const { result } = renderHook(() => useUpdateMaterial(), { wrapper });

    result.current.mutate({ id: materialId, data: updates });

    // ASSERT: Optimistic update applied immediately (before API resolves)
    await waitFor(() => {
      const cachedData = queryClient.getQueryData<MaterialItem>(['materials', 'detail', materialId]);
      expect(cachedData?.name).toBe('Updated Name');
      expect(cachedData?.unit_cost).toBe(200);
    });

    // Wait for mutation to complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should rollback optimistic update on error', async () => {
    // ARRANGE
    const materialId = 'material-123';
    const originalMaterial: MaterialItem = {
      id: materialId,
      name: 'Original Name',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      min_stock: 10,
      unit_cost: 150,
      category: 'Harinas',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    const updates = { name: 'Invalid Update' };
    const error = new Error('Update failed');

    vi.mocked(inventoryApi.updateItem).mockRejectedValue(error);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    // Pre-populate cache
    queryClient.setQueryData(['materials', 'detail', materialId], originalMaterial);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // ACT
    const { result } = renderHook(() => useUpdateMaterial(), { wrapper });

    result.current.mutate({ id: materialId, data: updates });

    // Wait for error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // ASSERT: Rollback to original data
    const cachedData = queryClient.getQueryData<MaterialItem>(['materials', 'detail', materialId]);
    expect(cachedData).toEqual(originalMaterial);
    expect(cachedData?.name).toBe('Original Name'); // Not 'Invalid Update'
  });

  it('should invalidate queries after success', async () => {
    // ARRANGE
    const materialId = 'material-123';
    const updates = { unit_cost: 250 };
    const updatedMaterial: MaterialItem = {
      id: materialId,
      name: 'Test Material',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      unit_cost: 250,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(inventoryApi.updateItem).mockResolvedValue(updatedMaterial);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // ACT
    const { result } = renderHook(() => useUpdateMaterial(), { wrapper });

    result.current.mutate({ id: materialId, data: updates });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT: Both detail and list queries invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: expect.arrayContaining(['materials', 'detail', materialId]),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: expect.arrayContaining(['materials']),
    });
  });
});
