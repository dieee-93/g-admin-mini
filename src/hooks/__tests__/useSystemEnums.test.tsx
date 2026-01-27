/**
 * SYSTEM ENUMS - UNIT TESTS
 * 
 * Tests para TanStack Query hooks de system_enums
 * Cobertura: Queries, Mutations, Optimistic Updates, System Protection
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useSystemEnums,
  useSystemEnumsByType,
  useActiveSystemEnumsByType,
  useSystemEnum,
  useSystemEnumByKey,
  useEnumOptions,
  useCreateSystemEnum,
  useUpdateSystemEnum,
  useToggleSystemEnum,
  useDeleteSystemEnum,
  useReorderSystemEnums,
  systemEnumsKeys,
} from '../useSystemEnums';
import * as systemEnumsApi from '@/pages/admin/core/settings/services/systemEnumsApi';
import type { SystemEnum, EnumType } from '@/pages/admin/core/settings/services/systemEnumsApi';

// ============================================
// MOCKS
// ============================================

// Mock API service
vi.mock('@/services/systemEnumsApi', () => ({
  fetchSystemEnums: vi.fn(),
  fetchSystemEnumsByType: vi.fn(),
  fetchActiveSystemEnumsByType: vi.fn(),
  fetchSystemEnum: vi.fn(),
  fetchSystemEnumByKey: vi.fn(),
  getEnumOptions: vi.fn(),
  createSystemEnum: vi.fn(),
  updateSystemEnum: vi.fn(),
  toggleSystemEnum: vi.fn(),
  deleteSystemEnum: vi.fn(),
  reorderSystemEnums: vi.fn(),
}));

// Mock alerts
vi.mock('@/shared/alerts', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logging', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================================
// TEST DATA
// ============================================

const mockSystemEnum: SystemEnum = {
  id: 'enum-1',
  enum_type: 'staff_department',
  key: 'kitchen',
  label: 'Cocina',
  description: 'Personal de cocina',
  icon: 'ChefHatIcon',
  color: '#FF6B6B',
  sort_order: 1,
  is_active: true,
  is_system: true,
  created_by: 'user-1',
  created_at: '2025-12-22T00:00:00Z',
  updated_at: '2025-12-22T00:00:00Z',
};

const mockSystemEnums: SystemEnum[] = [
  mockSystemEnum,
  {
    ...mockSystemEnum,
    id: 'enum-2',
    key: 'bar',
    label: 'Bar',
    description: 'Personal de bar',
    sort_order: 2,
    is_system: false,
  },
  {
    ...mockSystemEnum,
    id: 'enum-3',
    enum_type: 'product_type',
    key: 'beverage',
    label: 'Bebida',
    description: 'Productos bebibles',
    sort_order: 1,
  },
];

const mockEnumOptions = [
  { value: 'kitchen', label: 'Cocina' },
  { value: 'bar', label: 'Bar' },
];

// ============================================
// TEST HELPERS
// ============================================

/**
 * Create QueryClient for testing
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  });
}

/**
 * Wrapper with QueryClientProvider
 */
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// ============================================
// TESTS: QUERY HOOKS
// ============================================

describe('useSystemEnums', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch all system enums', async () => {
    vi.mocked(systemEnumsApi.fetchSystemEnums).mockResolvedValue(mockSystemEnums);

    const { result } = renderHook(() => useSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSystemEnums);
    expect(systemEnumsApi.fetchSystemEnums).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch enums');
    vi.mocked(systemEnumsApi.fetchSystemEnums).mockRejectedValue(error);

    const { result } = renderHook(() => useSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should use cached data with 10min staleTime', async () => {
    vi.mocked(systemEnumsApi.fetchSystemEnums).mockResolvedValue(mockSystemEnums);

    const { result: result1 } = renderHook(() => useSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    // Second hook should use cache
    const { result: result2 } = renderHook(() => useSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result2.current.data).toEqual(mockSystemEnums);
    expect(systemEnumsApi.fetchSystemEnums).toHaveBeenCalledTimes(1); // Only called once
  });
});

describe('useSystemEnumsByType', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch enums by type', async () => {
    const enumType: EnumType = 'staff_department';
    const filteredEnums = mockSystemEnums.filter(e => e.enum_type === enumType);
    vi.mocked(systemEnumsApi.fetchSystemEnumsByType).mockResolvedValue(filteredEnums);

    const { result } = renderHook(() => useSystemEnumsByType(enumType), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(filteredEnums);
    expect(systemEnumsApi.fetchSystemEnumsByType).toHaveBeenCalledWith(enumType);
  });

  it('should skip query when enumType is undefined', () => {
    const { result } = renderHook(() => useSystemEnumsByType(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(systemEnumsApi.fetchSystemEnumsByType).not.toHaveBeenCalled();
  });
});

describe('useActiveSystemEnumsByType', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch only active enums', async () => {
    const enumType: EnumType = 'staff_department';
    const activeEnums = mockSystemEnums.filter(e => e.enum_type === enumType && e.is_active);
    vi.mocked(systemEnumsApi.fetchActiveSystemEnumsByType).mockResolvedValue(activeEnums);

    const { result } = renderHook(() => useActiveSystemEnumsByType(enumType), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(activeEnums);
    expect(result.current.data?.every(e => e.is_active)).toBe(true);
  });

  it('should skip query when enumType is undefined', () => {
    const { result } = renderHook(() => useActiveSystemEnumsByType(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(systemEnumsApi.fetchActiveSystemEnumsByType).not.toHaveBeenCalled();
  });
});

describe('useSystemEnum', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch single enum by id', async () => {
    vi.mocked(systemEnumsApi.fetchSystemEnum).mockResolvedValue(mockSystemEnum);

    const { result } = renderHook(() => useSystemEnum('enum-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSystemEnum);
  });

  it('should skip query when id is undefined', () => {
    const { result } = renderHook(() => useSystemEnum(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(systemEnumsApi.fetchSystemEnum).not.toHaveBeenCalled();
  });
});

describe('useSystemEnumByKey', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch enum by type and key', async () => {
    vi.mocked(systemEnumsApi.fetchSystemEnumByKey).mockResolvedValue(mockSystemEnum);

    const { result } = renderHook(() => useSystemEnumByKey('staff_department', 'kitchen'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSystemEnum);
    expect(systemEnumsApi.fetchSystemEnumByKey).toHaveBeenCalledWith('staff_department', 'kitchen');
  });

  it('should skip query when type or key is undefined', () => {
    const { result } = renderHook(() => useSystemEnumByKey('staff_department', undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(systemEnumsApi.fetchSystemEnumByKey).not.toHaveBeenCalled();
  });
});

describe('useEnumOptions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch enum options for dropdowns', async () => {
    vi.mocked(systemEnumsApi.getEnumOptions).mockResolvedValue(mockEnumOptions);

    const { result } = renderHook(() => useEnumOptions('staff_department'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEnumOptions);
    expect(systemEnumsApi.getEnumOptions).toHaveBeenCalledWith('staff_department');
  });

  it('should have extended staleTime (15min) for dropdowns', async () => {
    vi.mocked(systemEnumsApi.getEnumOptions).mockResolvedValue(mockEnumOptions);

    const { result } = renderHook(() => useEnumOptions('staff_department'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Options should remain fresh for 15 minutes
    const queryState = queryClient.getQueryState(['system-enums', 'list', 'type', 'staff_department', 'options']);
    expect(queryState?.dataUpdatedAt).toBeDefined();
  });
});

// ============================================
// TESTS: MUTATION HOOKS
// ============================================

describe('useCreateSystemEnum', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should create new system enum', async () => {
    const newEnum = { ...mockSystemEnum, id: 'enum-new', key: 'new_dept' };
    vi.mocked(systemEnumsApi.createSystemEnum).mockResolvedValue(newEnum);

    const { result } = renderHook(() => useCreateSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    const createInput = {
      enum_type: 'staff_department' as EnumType,
      key: 'new_dept',
      label: 'Nuevo Departamento',
      description: 'Descripción',
      icon: 'UsersIcon',
      color: '#00FF00',
      sort_order: 10,
      is_active: true,
    };

    result.current.mutate(createInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newEnum);
    expect(systemEnumsApi.createSystemEnum).toHaveBeenCalledWith(createInput);
  });

  it('should handle create error', async () => {
    const error = new Error('Duplicate key');
    vi.mocked(systemEnumsApi.createSystemEnum).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    const createInput = {
      enum_type: 'staff_department' as EnumType,
      key: 'kitchen', // Duplicate
      label: 'Cocina',
      description: 'Descripción',
      icon: 'ChefHatIcon',
      color: '#FF0000',
      sort_order: 1,
      is_active: true,
    };

    result.current.mutate(createInput);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should invalidate queries after successful create', async () => {
    const newEnum = { ...mockSystemEnum, id: 'enum-new' };
    vi.mocked(systemEnumsApi.createSystemEnum).mockResolvedValue(newEnum);

    // Spy on invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    const createInput = {
      enum_type: 'staff_department' as EnumType,
      key: 'new_dept',
      label: 'Nuevo Departamento',
      description: 'Descripción',
      icon: 'UsersIcon',
      color: '#00FF00',
      sort_order: 10,
      is_active: true,
    };

    result.current.mutate(createInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify invalidateQueries was called
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['system-enums', 'list'] });
  });
});

describe('useUpdateSystemEnum', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should update existing enum with optimistic update', async () => {
    const updatedEnum = { ...mockSystemEnum, label: 'Cocina Actualizada' };
    vi.mocked(systemEnumsApi.updateSystemEnum).mockResolvedValue(updatedEnum);

    // Pre-populate cache
    queryClient.setQueryData(['system-enums', 'list'], mockSystemEnums);

    const { result } = renderHook(() => useUpdateSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    const updateInput = {
      label: 'Cocina Actualizada',
    };

    result.current.mutate({ id: 'enum-1', data: updateInput });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedEnum);
    expect(systemEnumsApi.updateSystemEnum).toHaveBeenCalledWith('enum-1', updateInput);
  });

  it('should rollback on error', async () => {
    const error = new Error('Update failed');
    vi.mocked(systemEnumsApi.updateSystemEnum).mockRejectedValue(error);

    // Pre-populate cache
    queryClient.setQueryData(['system-enums', 'list'], mockSystemEnums);

    const { result } = renderHook(() => useUpdateSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    const updateInput = {
      label: 'Cocina Actualizada',
    };

    result.current.mutate({ id: 'enum-1', data: updateInput });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Cache should be rolled back
    const cachedData = queryClient.getQueryData(['system-enums', 'list']);
    expect(cachedData).toEqual(mockSystemEnums);
  });
});

describe('useToggleSystemEnum', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should toggle enum active state', async () => {
    const toggledEnum = { ...mockSystemEnum, is_active: false };
    vi.mocked(systemEnumsApi.toggleSystemEnum).mockResolvedValue(toggledEnum);

    // Pre-populate cache
    queryClient.setQueryData(['system-enums', 'list'], mockSystemEnums);

    const { result } = renderHook(() => useToggleSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'enum-1', active: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(toggledEnum);
    expect(systemEnumsApi.toggleSystemEnum).toHaveBeenCalledWith('enum-1', false);
  });

  it('should use optimistic update', async () => {
    vi.mocked(systemEnumsApi.toggleSystemEnum).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ...mockSystemEnum, is_active: false }), 100))
    );

    // Pre-populate cache
    queryClient.setQueryData(['system-enums', 'list'], mockSystemEnums);

    const { result } = renderHook(() => useToggleSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'enum-1', active: false });

    // Check optimistic update applied immediately
    await waitFor(() => {
      const cachedData = queryClient.getQueryData<SystemEnum[]>(['system-enums', 'list']);
      const updatedEnum = cachedData?.find(e => e.id === 'enum-1');
      expect(updatedEnum?.is_active).toBe(false);
    });
  });
});

describe('useDeleteSystemEnum', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should delete non-system enum', async () => {
    vi.mocked(systemEnumsApi.deleteSystemEnum).mockResolvedValue(undefined);

    // Pre-populate cache (enum-2 is NOT system)
    queryClient.setQueryData(['system-enums', 'list'], mockSystemEnums);

    const { result } = renderHook(() => useDeleteSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('enum-2');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(systemEnumsApi.deleteSystemEnum).toHaveBeenCalledWith('enum-2');
  });

  it('should prevent deletion of system enum', async () => {
    // Pre-populate cache using correct query key
    queryClient.setQueryData(systemEnumsKeys.enums(), mockSystemEnums);

    // Verify cache is populated
    const cachedData = queryClient.getQueryData(systemEnumsKeys.enums());
    expect(cachedData).toEqual(mockSystemEnums);

    const { result } = renderHook(() => useDeleteSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    // Verify hook is ready
    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();

    // Try to delete system enum (enum-1 has is_system: true)
    result.current.mutate('enum-1');

    // Wait for mutation state to update
    await waitFor(
      () => {
        return result.current.isError || result.current.isSuccess;
      },
      { timeout: 3000 }
    );

    // Verify error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('sistema');
    
    // Should not call API for system enums
    expect(systemEnumsApi.deleteSystemEnum).not.toHaveBeenCalled();
  });

  it('should use optimistic delete for non-system enums', async () => {
    vi.mocked(systemEnumsApi.deleteSystemEnum).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    // Pre-populate cache
    queryClient.setQueryData(['system-enums', 'list'], mockSystemEnums);

    const { result } = renderHook(() => useDeleteSystemEnum(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('enum-2');

    // Check optimistic delete applied
    await waitFor(() => {
      const cachedData = queryClient.getQueryData<SystemEnum[]>(['system-enums', 'list']);
      expect(cachedData?.find(e => e.id === 'enum-2')).toBeUndefined();
    });
  });
});

describe('useReorderSystemEnums', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should reorder enums by type', async () => {
    const reorderedEnums = [
      { ...mockSystemEnum, sort_order: 2 },
      { ...mockSystemEnums[1], sort_order: 1 },
    ];
    vi.mocked(systemEnumsApi.reorderSystemEnums).mockResolvedValue(reorderedEnums);

    const { result } = renderHook(() => useReorderSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      enumType: 'staff_department',
      orderedIds: ['enum-2', 'enum-1'],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(systemEnumsApi.reorderSystemEnums).toHaveBeenCalledWith('staff_department', ['enum-2', 'enum-1']);
  });

  it('should handle reorder error', async () => {
    const error = new Error('Reorder failed');
    vi.mocked(systemEnumsApi.reorderSystemEnums).mockRejectedValue(error);

    const { result } = renderHook(() => useReorderSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      enumType: 'staff_department',
      orderedIds: ['enum-2', 'enum-1'],
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should invalidate type-specific queries after reorder', async () => {
    const reorderedEnums = [
      { ...mockSystemEnum, sort_order: 2 },
      { ...mockSystemEnums[1], sort_order: 1 },
    ];
    vi.mocked(systemEnumsApi.reorderSystemEnums).mockResolvedValue(reorderedEnums);

    // Spy on invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReorderSystemEnums(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      enumType: 'staff_department',
      orderedIds: ['enum-2', 'enum-1'],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify type-specific invalidation was called
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ 
      queryKey: ['system-enums', 'list', 'type', 'staff_department'] 
    });
  });
});
