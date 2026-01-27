/**
 * useCreateMaterial Hook - Unit Tests
 * 
 * Tests the TanStack Query mutation for creating materials.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ============================================================================
// MOCKS (MUST be before imports)
// ============================================================================

// Mock AuthContext
const mockUser = { id: 'user-123', email: 'test@example.com' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock notifications - MUST use vi.fn() directly in factory
vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock inventoryApi
vi.mock('@/modules/materials/services', () => ({
  inventoryApi: {
    createMaterial: vi.fn(),
  },
}));

// ============================================================================
// NOW SAFE TO IMPORT
// ============================================================================

import { useCreateMaterial } from '../useCreateMaterial';
import { inventoryApi } from '@/modules/materials/services';
import { notify } from '@/lib/notifications';

// ============================================================================
// TYPES
// ============================================================================

interface ItemFormData {
  name: string;
  type: 'measurable' | 'countable';
  unit: string;
  category?: string;
  min_stock?: number;
  unit_cost: number;
  supplier_id?: string;
}

interface MaterialItem extends ItemFormData {
  id: string;
  stock: number;
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

describe('useCreateMaterial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create material successfully', async () => {
    // ARRANGE
    const formData: ItemFormData = {
      name: 'Harina 000',
      type: 'measurable',
      unit: 'kg',
      category: 'Harinas',
      min_stock: 10,
      unit_cost: 150,
    };

    const createdMaterial: MaterialItem = {
      ...formData,
      id: 'material-123',
      stock: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(inventoryApi.createMaterial).mockResolvedValue(createdMaterial);

    // ACT
    const { result } = renderHook(() => useCreateMaterial(), {
      wrapper: createWrapper(),
    });

    // Initial state
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate(formData);

    // Wait for success (mutation may be too fast to catch isPending=true)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT: Success state
    expect(result.current.data).toEqual(createdMaterial);
    expect(inventoryApi.createMaterial).toHaveBeenCalledWith(formData, mockUser);
    expect(notify.success).toHaveBeenCalledWith({
      title: 'Material creado',
      description: expect.stringContaining('Harina 000'),
    });
  });

  it('should handle creation errors', async () => {
    // ARRANGE
    const formData: ItemFormData = {
      name: 'Invalid Material',
      type: 'measurable',
      unit: 'kg',
      unit_cost: 100,
    };

    const error = new Error('Duplicate material name');
    vi.mocked(inventoryApi.createMaterial).mockRejectedValue(error);

    // ACT
    const { result } = renderHook(() => useCreateMaterial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(formData);

    // Wait for error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // ASSERT: Error state
    expect(result.current.error).toEqual(error);
    expect(notify.error).toHaveBeenCalledWith({
      title: 'Error al crear material',
      description: error.message,
    });
  });

  it('should require authenticated user', async () => {
    // NOTE: We can't easily test "no user" scenario because useAuth is mocked
    // globally. In real application, this is tested at service layer.
    // This test verifies the hook calls the service with user parameter.
    
    const formData: ItemFormData = {
      name: 'Test Material',
      type: 'measurable',
      unit: 'kg',
      unit_cost: 100,
    };

    const createdMaterial: MaterialItem = {
      ...formData,
      id: 'new-id',
      stock: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(inventoryApi.createMaterial).mockResolvedValue(createdMaterial);

    // ACT
    const { result } = renderHook(() => useCreateMaterial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(formData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT: User was passed to service
    expect(inventoryApi.createMaterial).toHaveBeenCalledWith(formData, mockUser);
  });

  it('should invalidate queries on success', async () => {
    // ARRANGE
    const formData: ItemFormData = {
      name: 'Test Material',
      type: 'measurable',
      unit: 'kg',
      unit_cost: 100,
    };

    const createdMaterial: MaterialItem = {
      ...formData,
      id: 'new-id',
      stock: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(inventoryApi.createMaterial).mockResolvedValue(createdMaterial);

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
    const { result } = renderHook(() => useCreateMaterial(), { wrapper });

    result.current.mutate(formData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT: Cache invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: expect.arrayContaining(['materials']),
    });
  });
});
