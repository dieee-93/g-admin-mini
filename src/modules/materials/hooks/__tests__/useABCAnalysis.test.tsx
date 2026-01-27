/**
 * useABCAnalysis Hook - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// MOCKS
vi.mock('@/modules/materials/services', () => ({
  ABCAnalysisEngine: {
    analyzeInventory: vi.fn(),
  },
}));

import { useABCAnalysis } from '../useABCAnalysis';
import { ABCAnalysisEngine } from '@/modules/materials/services';

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

describe('useABCAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform ABC analysis successfully', async () => {
    const mockMaterials: MaterialItem[] = [
      { id: '1', name: 'Material A', type: 'measurable', unit: 'kg', stock: 100, unit_cost: 500, created_at: '', updated_at: '' },
      { id: '2', name: 'Material B', type: 'measurable', unit: 'kg', stock: 50, unit_cost: 100, created_at: '', updated_at: '' },
      { id: '3', name: 'Material C', type: 'measurable', unit: 'kg', stock: 200, unit_cost: 10, created_at: '', updated_at: '' },
    ];

    const mockAnalysis = {
      classA: [{ materialId: '1', name: 'Material A', class: 'A', value: 50000 }],
      classB: [{ materialId: '2', name: 'Material B', class: 'B', value: 5000 }],
      classC: [{ materialId: '3', name: 'Material C', class: 'C', value: 2000 }],
      totalValue: 57000,
      config: { primaryCriteria: 'revenue', classAThreshold: 80, classBThreshold: 15 },
    };

    vi.mocked(ABCAnalysisEngine.analyzeInventory).mockResolvedValue(mockAnalysis);

    const { result } = renderHook(
      () => useABCAnalysis({ materials: mockMaterials }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAnalysis);
    expect(ABCAnalysisEngine.analyzeInventory).toHaveBeenCalledWith(
      mockMaterials,
      undefined
    );
  });

  it('should not run if materials array is empty', () => {
    const { result } = renderHook(
      () => useABCAnalysis({ materials: [], enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(ABCAnalysisEngine.analyzeInventory).not.toHaveBeenCalled();
  });

  it('should use custom config', async () => {
    const mockMaterials: MaterialItem[] = [
      { id: '1', name: 'Test', type: 'measurable', unit: 'kg', stock: 100, unit_cost: 100, created_at: '', updated_at: '' },
    ];

    const customConfig = {
      primaryCriteria: 'cost' as const,
      classAThreshold: 70,
      classBThreshold: 20,
    };

    const mockAnalysis = {
      classA: [],
      classB: [],
      classC: [{ materialId: '1', name: 'Test', class: 'C', value: 10000 }],
      totalValue: 10000,
      config: customConfig,
    };

    vi.mocked(ABCAnalysisEngine.analyzeInventory).mockResolvedValue(mockAnalysis);

    const { result } = renderHook(
      () => useABCAnalysis({ materials: mockMaterials, config: customConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(ABCAnalysisEngine.analyzeInventory).toHaveBeenCalledWith(
      mockMaterials,
      customConfig
    );
  });
});
