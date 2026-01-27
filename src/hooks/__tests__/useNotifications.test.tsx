/**
 * NOTIFICATION SETTINGS - UNIT TESTS
 * 
 * Tests para TanStack Query hooks de notification_rules
 * Cobertura: Queries, Mutations, Optimistic Updates, Error Handling
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useNotificationRules,
  useNotificationRulesByCategory,
  useEnabledNotificationRules,
  useNotificationRule,
  useNotificationRuleByKey,
  useCreateNotificationRule,
  useUpdateNotificationRule,
  useToggleNotificationRule,
  useDeleteNotificationRule,
  useBulkToggleNotificationRules,
} from '../useNotifications';
import * as notificationsApi from '@/pages/admin/core/settings/services/notificationsApi';
import type { NotificationRule, NotificationCategory } from '@/pages/admin/core/settings/services/notificationsApi';

// ============================================
// MOCKS
// ============================================

// Mock API service
vi.mock('@/services/notificationsApi', () => ({
  fetchNotificationRules: vi.fn(),
  fetchNotificationRulesByCategory: vi.fn(),
  fetchEnabledNotificationRules: vi.fn(),
  fetchNotificationRuleById: vi.fn(),
  fetchNotificationRuleByKey: vi.fn(),
  createNotificationRule: vi.fn(),
  updateNotificationRule: vi.fn(),
  toggleNotificationRule: vi.fn(),
  deleteNotificationRule: vi.fn(),
  bulkToggleNotificationRules: vi.fn(),
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

const mockNotificationRule: NotificationRule = {
  id: 'rule-1',
  rule_key: 'low_stock_alert',
  category: 'inventory',
  name: 'Alerta de Stock Bajo',
  description: 'Notifica cuando un material llega al mínimo',
  is_enabled: true,
  severity: 'warning',
  conditions: { threshold: 'stock_min' },
  notification_channels: {
    email: true,
    push: true,
    sms: false,
    in_app: true,
  },
  recipient_roles: ['manager', 'admin'],
  recipient_users: null,
  created_by: 'user-1',
  created_at: '2025-12-22T00:00:00Z',
  updated_at: '2025-12-22T00:00:00Z',
};

const mockNotificationRules: NotificationRule[] = [
  mockNotificationRule,
  {
    ...mockNotificationRule,
    id: 'rule-2',
    rule_key: 'employee_absence',
    category: 'staff',
    name: 'Ausencia de Empleado',
    is_enabled: false,
  },
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
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Keep cache forever in tests
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

describe('useNotificationRules', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch all notification rules', async () => {
    vi.mocked(notificationsApi.fetchNotificationRules).mockResolvedValue(mockNotificationRules);

    const { result } = renderHook(() => useNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNotificationRules);
    expect(notificationsApi.fetchNotificationRules).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch rules');
    vi.mocked(notificationsApi.fetchNotificationRules).mockRejectedValue(error);

    const { result } = renderHook(() => useNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should use cached data on subsequent calls', async () => {
    vi.mocked(notificationsApi.fetchNotificationRules).mockResolvedValue(mockNotificationRules);

    const { result: result1 } = renderHook(() => useNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    // Second hook should use cache
    const { result: result2 } = renderHook(() => useNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result2.current.data).toEqual(mockNotificationRules);
    expect(notificationsApi.fetchNotificationRules).toHaveBeenCalledTimes(1); // Only called once
  });
});

describe('useNotificationRulesByCategory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch rules by category', async () => {
    const category: NotificationCategory = 'inventory';
    const filteredRules = mockNotificationRules.filter(r => r.category === category);
    vi.mocked(notificationsApi.fetchNotificationRulesByCategory).mockResolvedValue(filteredRules);

    const { result } = renderHook(() => useNotificationRulesByCategory(category), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(filteredRules);
    expect(notificationsApi.fetchNotificationRulesByCategory).toHaveBeenCalledWith(category);
  });
});

describe('useEnabledNotificationRules', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch only enabled rules', async () => {
    const enabledRules = mockNotificationRules.filter(r => r.is_enabled);
    vi.mocked(notificationsApi.fetchEnabledNotificationRules).mockResolvedValue(enabledRules);

    const { result } = renderHook(() => useEnabledNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(enabledRules);
    expect(result.current.data?.every(r => r.is_enabled)).toBe(true);
  });
});

describe('useNotificationRule', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch single rule by id', async () => {
    vi.mocked(notificationsApi.fetchNotificationRuleById).mockResolvedValue(mockNotificationRule);

    const { result } = renderHook(() => useNotificationRule('rule-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNotificationRule);
  });

  it('should skip query when id is undefined', () => {
    const { result } = renderHook(() => useNotificationRule(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(notificationsApi.fetchNotificationRuleById).not.toHaveBeenCalled();
  });
});

describe('useNotificationRuleByKey', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch rule by key', async () => {
    vi.mocked(notificationsApi.fetchNotificationRuleByKey).mockResolvedValue(mockNotificationRule);

    const { result } = renderHook(() => useNotificationRuleByKey('low_stock_alert'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNotificationRule);
    expect(notificationsApi.fetchNotificationRuleByKey).toHaveBeenCalledWith('low_stock_alert');
  });

  it('should skip query when key is undefined', () => {
    const { result } = renderHook(() => useNotificationRuleByKey(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(notificationsApi.fetchNotificationRuleByKey).not.toHaveBeenCalled();
  });
});

// ============================================
// TESTS: MUTATION HOOKS
// ============================================

describe('useCreateNotificationRule', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should create new notification rule', async () => {
    const newRule = { ...mockNotificationRule, id: 'rule-new' };
    vi.mocked(notificationsApi.createNotificationRule).mockResolvedValue(newRule);

    const { result } = renderHook(() => useCreateNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    const createInput = {
      rule_key: 'new_rule',
      category: 'inventory' as NotificationCategory,
      name: 'Nueva Regla',
      description: 'Descripción',
      severity: 'info' as const,
      is_enabled: true,
      conditions: {},
      notification_channels: { email: true, push: false, sms: false, in_app: true },
      recipient_roles: ['admin'],
      recipient_users: null,
    };

    result.current.mutate(createInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newRule);
    expect(notificationsApi.createNotificationRule).toHaveBeenCalledWith(createInput);
  });

  it('should handle create error', async () => {
    const error = new Error('Create failed');
    vi.mocked(notificationsApi.createNotificationRule).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    const createInput = {
      rule_key: 'new_rule',
      category: 'inventory' as NotificationCategory,
      name: 'Nueva Regla',
      description: 'Descripción',
      severity: 'info' as const,
      is_enabled: true,
      conditions: {},
      notification_channels: { email: true, push: false, sms: false, in_app: true },
      recipient_roles: ['admin'],
      recipient_users: null,
    };

    result.current.mutate(createInput);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should invalidate queries after successful create', async () => {
    const newRule = { ...mockNotificationRule, id: 'rule-new' };
    vi.mocked(notificationsApi.createNotificationRule).mockResolvedValue(newRule);

    // Spy on invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    const createInput = {
      rule_key: 'new_rule',
      category: 'inventory' as NotificationCategory,
      name: 'Nueva Regla',
      description: 'Descripción',
      severity: 'info' as const,
      is_enabled: true,
      conditions: {},
      notification_channels: { email: true, push: false, sms: false, in_app: true },
      recipient_roles: ['admin'],
      recipient_users: null,
    };

    result.current.mutate(createInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify invalidateQueries was called
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['notifications', 'rules'] });
  });
});

describe('useUpdateNotificationRule', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should update existing rule with optimistic update', async () => {
    const updatedRule = { ...mockNotificationRule, name: 'Nombre Actualizado' };
    vi.mocked(notificationsApi.updateNotificationRule).mockResolvedValue(updatedRule);

    // Pre-populate cache
    queryClient.setQueryData(['notifications', 'rules'], mockNotificationRules);

    const { result } = renderHook(() => useUpdateNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    const updateInput = {
      name: 'Nombre Actualizado',
    };

    result.current.mutate({ id: 'rule-1', data: updateInput });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedRule);
    expect(notificationsApi.updateNotificationRule).toHaveBeenCalledWith('rule-1', updateInput);
  });

  it('should rollback on error', async () => {
    const error = new Error('Update failed');
    vi.mocked(notificationsApi.updateNotificationRule).mockRejectedValue(error);

    // Pre-populate cache
    queryClient.setQueryData(['notifications', 'rules'], mockNotificationRules);

    const { result } = renderHook(() => useUpdateNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    const updateInput = {
      name: 'Nombre Actualizado',
    };

    result.current.mutate({ id: 'rule-1', data: updateInput });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Cache should be rolled back
    const cachedData = queryClient.getQueryData(['notifications', 'rules']);
    expect(cachedData).toEqual(mockNotificationRules);
  });
});

describe('useToggleNotificationRule', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should toggle rule enabled state', async () => {
    const toggledRule = { ...mockNotificationRule, is_enabled: false };
    vi.mocked(notificationsApi.toggleNotificationRule).mockResolvedValue(toggledRule);

    // Pre-populate cache
    queryClient.setQueryData(['notifications', 'rules'], mockNotificationRules);

    const { result } = renderHook(() => useToggleNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'rule-1', enabled: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(toggledRule);
    expect(notificationsApi.toggleNotificationRule).toHaveBeenCalledWith('rule-1', false);
  });

  it('should use optimistic update', async () => {
    vi.mocked(notificationsApi.toggleNotificationRule).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ ...mockNotificationRule, is_enabled: false }), 100))
    );

    // Pre-populate cache
    queryClient.setQueryData(['notifications', 'rules'], mockNotificationRules);

    const { result } = renderHook(() => useToggleNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'rule-1', enabled: false });

    // Check optimistic update applied immediately
    await waitFor(() => {
      const cachedData = queryClient.getQueryData<NotificationRule[]>(['notifications', 'rules']);
      const updatedRule = cachedData?.find(r => r.id === 'rule-1');
      expect(updatedRule?.is_enabled).toBe(false);
    });
  });
});

describe('useDeleteNotificationRule', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should delete notification rule', async () => {
    vi.mocked(notificationsApi.deleteNotificationRule).mockResolvedValue(undefined);

    // Pre-populate cache
    queryClient.setQueryData(['notifications', 'rules'], mockNotificationRules);

    const { result } = renderHook(() => useDeleteNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('rule-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(notificationsApi.deleteNotificationRule).toHaveBeenCalledWith('rule-1');
  });

  it('should use optimistic delete', async () => {
    vi.mocked(notificationsApi.deleteNotificationRule).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    // Pre-populate cache
    queryClient.setQueryData(['notifications', 'rules'], mockNotificationRules);

    const { result } = renderHook(() => useDeleteNotificationRule(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('rule-1');

    // Check optimistic delete applied
    await waitFor(() => {
      const cachedData = queryClient.getQueryData<NotificationRule[]>(['notifications', 'rules']);
      expect(cachedData?.find(r => r.id === 'rule-1')).toBeUndefined();
    });
  });
});

describe('useBulkToggleNotificationRules', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should bulk toggle rules by category', async () => {
    const updatedRules = mockNotificationRules.map(r => ({ ...r, is_enabled: false }));
    vi.mocked(notificationsApi.bulkToggleNotificationRules).mockResolvedValue(updatedRules);

    const { result } = renderHook(() => useBulkToggleNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ category: 'inventory', enabled: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(notificationsApi.bulkToggleNotificationRules).toHaveBeenCalledWith('inventory', false);
  });

  it('should handle bulk toggle error', async () => {
    const error = new Error('Bulk toggle failed');
    vi.mocked(notificationsApi.bulkToggleNotificationRules).mockRejectedValue(error);

    const { result } = renderHook(() => useBulkToggleNotificationRules(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ category: 'inventory', enabled: false });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
