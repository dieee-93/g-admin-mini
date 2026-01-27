/**
 * useMaterials Hook - Unit Tests
 * 
 * Tests the TanStack Query wrapper for fetching materials list.
 * 
 * CRITICAL: Zustand store mocks MUST be defined before any imports
 * to prevent persist middleware from hanging tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ============================================================================
// MOCKS (MUST be before imports)
// ============================================================================

// ✅ Mock useMaterialsStore to prevent Zustand persist middleware initialization
vi.mock('@/modules/materials/store', () => ({
  useMaterialsStore: (selector: any) => {
    const mockStore = {
      filters: {
        searchTerm: '',
        category: null,
        type: null,
        supplier: null,
        lowStockOnly: false,
        activeOnly: true,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      },
    };
    
    return typeof selector === 'function' ? selector(mockStore) : mockStore;
  },
}));

// ✅ Mock materialsApi to control test data
vi.mock('@/pages/admin/supply-chain/materials/services/materialsApi', () => ({
  fetchItems: vi.fn(),
}));

// ============================================================================
// NOW SAFE TO IMPORT (mocks are hoisted by Vitest)
// ============================================================================

import { useMaterials } from '../useMaterials';
import * as materialsApi from '@/pages/admin/supply-chain/materials/services/materialsApi';

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
  supplier_id?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TEST HELPERS
// ============================================================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
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

describe('useMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching materials list', () => {
    it('should fetch materials successfully', async () => {
      // ARRANGE: Mock data
      const mockMaterials: MaterialItem[] = [
        {
          id: '1',
          name: 'Harina 000',
          type: 'measurable',
          unit: 'kg',
          stock: 50,
          min_stock: 10,
          unit_cost: 150,
          category: 'Harinas',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Azúcar',
          type: 'measurable',
          unit: 'kg',
          stock: 30,
          min_stock: 5,
          unit_cost: 80,
          category: 'Azúcares',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.mocked(materialsApi.fetchItems).mockResolvedValue(mockMaterials);

      // ACT: Render hook
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      // ASSERT: Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ASSERT: Data loaded successfully
      // Note: useMaterials sorts by name ascending, so order may differ from mock
      expect(result.current.data).toHaveLength(mockMaterials.length);
      expect(result.current.data).toContainEqual(mockMaterials[0]);
      expect(result.current.data).toContainEqual(mockMaterials[1]);
      expect(result.current.error).toBeNull();
      expect(materialsApi.fetchItems).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      // ARRANGE: Mock error
      const mockError = new Error('Network error');
      vi.mocked(materialsApi.fetchItems).mockRejectedValue(mockError);

      // ACT: Render hook
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ASSERT: Error state
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle empty materials list', async () => {
      // ARRANGE: Mock empty array
      vi.mocked(materialsApi.fetchItems).mockResolvedValue([]);

      // ACT: Render hook
      const { result } = renderHook(() => useMaterials(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ASSERT: Empty array
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });
});
