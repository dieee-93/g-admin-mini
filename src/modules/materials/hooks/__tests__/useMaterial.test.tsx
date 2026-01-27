/**
 * useMaterial Hook - Unit Tests (Detail Query)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// MOCKS
vi.mock('@/pages/admin/supply-chain/materials/services/materialsApi', () => ({
  getItem: vi.fn(),
}));

import { useMaterial } from '../useMaterial';
import * as materialsApi from '@/pages/admin/supply-chain/materials/services/materialsApi';

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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMaterial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch material by ID successfully', async () => {
    const mockMaterial: MaterialItem = {
      id: 'material-123',
      name: 'Harina 000',
      type: 'measurable',
      unit: 'kg',
      stock: 50,
      unit_cost: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(materialsApi.getItem).mockResolvedValue(mockMaterial);

    const { result } = renderHook(() => useMaterial('material-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMaterial);
    expect(materialsApi.getItem).toHaveBeenCalledWith('material-123');
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Material not found');
    vi.mocked(materialsApi.getItem).mockRejectedValue(error);

    const { result } = renderHook(() => useMaterial('material-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should not fetch if ID is empty', () => {
    const { result } = renderHook(() => useMaterial(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(materialsApi.getItem).not.toHaveBeenCalled();
  });
});
