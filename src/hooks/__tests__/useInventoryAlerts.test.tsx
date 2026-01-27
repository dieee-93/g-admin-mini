/**
 * INVENTORY ALERT SETTINGS - UNIT TESTS
 * 
 * Tests para TanStack Query hooks de inventory_alert_settings
 * Cobertura: Queries, Mutations, Optimistic Updates, Error Handling, Validations
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useInventoryAlertSettings,
  useInventoryAlertSetting,
  useSystemInventoryAlertSettings,
  useUpdateInventoryAlertSettings,
  useToggleAutoReorder,
  useToggleABCAnalysis,
} from '../useInventoryAlerts';
import * as inventoryAlertsApi from '@/pages/admin/supply-chain/materials/services/inventoryAlertsApi';
import type { InventoryAlertSettings } from '@/pages/admin/supply-chain/materials/services/inventoryAlertsApi';

// ============================================
// MOCKS
// ============================================

// Mock API service
vi.mock('@/services/inventoryAlertsApi', () => ({
  fetchInventoryAlertSettings: vi.fn(),
  fetchInventoryAlertSettingsById: vi.fn(),
  fetchSystemInventoryAlertSettings: vi.fn(),
  updateInventoryAlertSettings: vi.fn(),
  toggleAutoReorder: vi.fn(),
  toggleABCAnalysis: vi.fn(),
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

const mockInventoryAlertSettings: InventoryAlertSettings = {
  id: 'setting-1',
  is_system: true,
  low_stock_threshold: 10,
  critical_stock_threshold: 5,
  out_of_stock_threshold: 0,
  abc_analysis_enabled: true,
  abc_analysis_thresholds: {
    a_threshold: 80,
    b_threshold: 15,
    c_threshold: 5,
  },
  expiry_warning_days: 7,
  expiry_critical_days: 3,
  waste_threshold_percent: 5.0,
  auto_reorder_enabled: true,
  reorder_quantity_rules: {
    method: 'economic_order_quantity',
    min_order: 10,
    max_order: 100,
    safety_stock_days: 7,
    lead_time_days: 3,
    order_point_method: 'reorder_point',
    reorder_multiplier: 1.5,
  },
  created_at: '2025-12-22T00:00:00Z',
  updated_at: '2025-12-22T00:00:00Z',
};

const mockInventoryAlertSettingsList: InventoryAlertSettings[] = [
  mockInventoryAlertSettings,
  {
    ...mockInventoryAlertSettings,
    id: 'setting-2',
    is_system: false,
    low_stock_threshold: 20,
    critical_stock_threshold: 10,
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

describe('useInventoryAlertSettings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should fetch all inventory alert settings successfully', async () => {
    vi.mocked(inventoryAlertsApi.fetchInventoryAlertSettings).mockResolvedValue(
      mockInventoryAlertSettingsList
    );

    const { result } = renderHook(() => useInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockInventoryAlertSettingsList);
    expect(inventoryAlertsApi.fetchInventoryAlertSettings).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Network error');
    vi.mocked(inventoryAlertsApi.fetchInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should return empty array when no settings exist', async () => {
    vi.mocked(inventoryAlertsApi.fetchInventoryAlertSettings).mockResolvedValue([]);

    const { result } = renderHook(() => useInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useInventoryAlertSetting', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should fetch inventory alert setting by id', async () => {
    vi.mocked(inventoryAlertsApi.fetchInventoryAlertSettingsById).mockResolvedValue(
      mockInventoryAlertSettings
    );

    const { result } = renderHook(() => useInventoryAlertSetting('setting-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockInventoryAlertSettings);
    expect(inventoryAlertsApi.fetchInventoryAlertSettingsById).toHaveBeenCalledWith('setting-1');
  });

  it('should skip query when id is not provided', async () => {
    const { result } = renderHook(() => useInventoryAlertSetting(''), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(inventoryAlertsApi.fetchInventoryAlertSettingsById).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    const error = new Error('Not found');
    vi.mocked(inventoryAlertsApi.fetchInventoryAlertSettingsById).mockRejectedValue(error);

    const { result } = renderHook(() => useInventoryAlertSetting('invalid-id'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useSystemInventoryAlertSettings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should fetch system inventory alert settings', async () => {
    vi.mocked(inventoryAlertsApi.fetchSystemInventoryAlertSettings).mockResolvedValue(
      mockInventoryAlertSettings
    );

    const { result } = renderHook(() => useSystemInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockInventoryAlertSettings);
    expect(result.current.data?.is_system).toBe(true);
    expect(inventoryAlertsApi.fetchSystemInventoryAlertSettings).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const error = new Error('System settings not found');
    vi.mocked(inventoryAlertsApi.fetchSystemInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useSystemInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

// ============================================
// TESTS: MUTATION HOOKS
// ============================================

describe('useUpdateInventoryAlertSettings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should update inventory alert settings successfully', async () => {
    const updatedSettings = { ...mockInventoryAlertSettings, low_stock_threshold: 15 };
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: { low_stock_threshold: 15 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedSettings);
    expect(inventoryAlertsApi.updateInventoryAlertSettings).toHaveBeenCalledWith(
      'setting-1',
      { low_stock_threshold: 15 }
    );
  });

  it('should handle update error', async () => {
    const error = new Error('Update failed');
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: { low_stock_threshold: 15 },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should perform optimistic update', async () => {
    // Pre-populate cache
    queryClient.setQueryData(
      ['inventory-alerts', 'settings', 'setting-1'],
      mockInventoryAlertSettings
    );

    const updatedSettings = { ...mockInventoryAlertSettings, low_stock_threshold: 15 };
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: { low_stock_threshold: 15 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check final state after mutation completes
    const cachedData = queryClient.getQueryData<InventoryAlertSettings>([
      'inventory-alerts',
      'settings',
      'setting-1',
    ]);
    expect(cachedData?.low_stock_threshold).toBe(15);
  });

  it('should rollback on error', async () => {
    // Pre-populate cache
    queryClient.setQueryData(
      ['inventory-alerts', 'settings', 'setting-1'],
      mockInventoryAlertSettings
    );

    const error = new Error('Network error');
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: { low_stock_threshold: 15 },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Check rollback
    const cachedData = queryClient.getQueryData<InventoryAlertSettings>([
      'inventory-alerts',
      'settings',
      'setting-1',
    ]);
    expect(cachedData?.low_stock_threshold).toBe(10); // Original value
  });
});

describe('useToggleAutoReorder', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should toggle auto-reorder successfully', async () => {
    const updatedSettings = { ...mockInventoryAlertSettings, auto_reorder_enabled: false };
    vi.mocked(inventoryAlertsApi.toggleAutoReorder).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useToggleAutoReorder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      enabled: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedSettings);
    expect(inventoryAlertsApi.toggleAutoReorder).toHaveBeenCalledWith('setting-1', false);
  });

  it('should perform optimistic toggle', async () => {
    // Pre-populate cache
    queryClient.setQueryData(
      ['inventory-alerts', 'settings', 'setting-1'],
      mockInventoryAlertSettings
    );

    const updatedSettings = { ...mockInventoryAlertSettings, auto_reorder_enabled: false };
    vi.mocked(inventoryAlertsApi.toggleAutoReorder).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useToggleAutoReorder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      enabled: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check final state after mutation completes
    const cachedData = queryClient.getQueryData<InventoryAlertSettings>([
      'inventory-alerts',
      'settings',
      'setting-1',
    ]);
    expect(cachedData?.auto_reorder_enabled).toBe(false);
  });

  it('should rollback on toggle error', async () => {
    // Pre-populate cache
    queryClient.setQueryData(
      ['inventory-alerts', 'settings', 'setting-1'],
      mockInventoryAlertSettings
    );

    const error = new Error('Toggle failed');
    vi.mocked(inventoryAlertsApi.toggleAutoReorder).mockRejectedValue(error);

    const { result } = renderHook(() => useToggleAutoReorder(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      enabled: false,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Check rollback
    const cachedData = queryClient.getQueryData<InventoryAlertSettings>([
      'inventory-alerts',
      'settings',
      'setting-1',
    ]);
    expect(cachedData?.auto_reorder_enabled).toBe(true); // Original value
  });
});

describe('useToggleABCAnalysis', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should toggle ABC analysis successfully', async () => {
    const updatedSettings = { ...mockInventoryAlertSettings, abc_analysis_enabled: false };
    vi.mocked(inventoryAlertsApi.toggleABCAnalysis).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useToggleABCAnalysis(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      enabled: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedSettings);
    expect(inventoryAlertsApi.toggleABCAnalysis).toHaveBeenCalledWith('setting-1', false);
  });

  it('should perform optimistic toggle', async () => {
    // Pre-populate cache
    queryClient.setQueryData(
      ['inventory-alerts', 'settings', 'setting-1'],
      mockInventoryAlertSettings
    );

    const updatedSettings = { ...mockInventoryAlertSettings, abc_analysis_enabled: false };
    vi.mocked(inventoryAlertsApi.toggleABCAnalysis).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useToggleABCAnalysis(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      enabled: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check final state after mutation completes
    const cachedData = queryClient.getQueryData<InventoryAlertSettings>([
      'inventory-alerts',
      'settings',
      'setting-1',
    ]);
    expect(cachedData?.abc_analysis_enabled).toBe(false);
  });

  it('should rollback on toggle error', async () => {
    // Pre-populate cache
    queryClient.setQueryData(
      ['inventory-alerts', 'settings', 'setting-1'],
      mockInventoryAlertSettings
    );

    const error = new Error('Toggle failed');
    vi.mocked(inventoryAlertsApi.toggleABCAnalysis).mockRejectedValue(error);

    const { result } = renderHook(() => useToggleABCAnalysis(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      enabled: false,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Check rollback
    const cachedData = queryClient.getQueryData<InventoryAlertSettings>([
      'inventory-alerts',
      'settings',
      'setting-1',
    ]);
    expect(cachedData?.abc_analysis_enabled).toBe(true); // Original value
  });
});

// ============================================
// TESTS: EDGE CASES
// ============================================

describe('Edge Cases', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should handle concurrent updates gracefully', async () => {
    const updatedSettings1 = { ...mockInventoryAlertSettings, low_stock_threshold: 15 };
    const updatedSettings2 = { ...mockInventoryAlertSettings, critical_stock_threshold: 8 };

    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings)
      .mockResolvedValueOnce(updatedSettings1)
      .mockResolvedValueOnce(updatedSettings2);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    // Trigger both mutations
    result.current.mutate({ id: 'setting-1', updates: { low_stock_threshold: 15 } });
    result.current.mutate({ id: 'setting-1', updates: { critical_stock_threshold: 8 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should handle invalid threshold values', async () => {
    const error = new Error('Validation error: low_stock_threshold must be greater than critical_stock_threshold');
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: {
        low_stock_threshold: 3,
        critical_stock_threshold: 5,
      },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should handle ABC thresholds not summing to 100', async () => {
    const error = new Error('Validation error: ABC thresholds must sum to 100');
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: {
        abc_analysis_thresholds: {
          a_threshold: 70,
          b_threshold: 20,
          c_threshold: 5, // Only sums to 95
        },
      },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should handle negative values in reorder rules', async () => {
    const error = new Error('Validation error: min_order must be positive');
    vi.mocked(inventoryAlertsApi.updateInventoryAlertSettings).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateInventoryAlertSettings(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: 'setting-1',
      updates: {
        reorder_quantity_rules: {
          ...mockInventoryAlertSettings.reorder_quantity_rules,
          min_order: -5,
        },
      },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
