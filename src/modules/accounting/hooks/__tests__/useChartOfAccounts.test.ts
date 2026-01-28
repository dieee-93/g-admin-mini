/**
 * Unit Tests for useChartOfAccounts Hook
 * Tests data loading, error handling, and refetch functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChartOfAccounts } from '../useChartOfAccounts';
import * as chartOfAccountsService from '../../services/chartOfAccountsService';
import type { ChartOfAccountsRow } from '../../types';

// Mock the services
vi.mock('../../services/chartOfAccountsService', () => ({
  fetchChartOfAccounts: vi.fn(),
}));

vi.mock('@/lib/logging', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('useChartOfAccounts', () => {
  const mockAccounts: ChartOfAccountsRow[] = [
    {
      id: '1',
      code: '1.1',
      name: 'Assets',
      account_type: 'ASSET',
      is_group: true,
      is_active: true,
      normal_balance: 'DEBIT',
      allow_transactions: false,
      currency: 'ARS',
      parent_id: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      code: '1.1.01',
      name: 'Current Assets',
      account_type: 'ASSET',
      is_group: true,
      is_active: true,
      normal_balance: 'DEBIT',
      allow_transactions: false,
      currency: 'ARS',
      parent_id: '1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load accounts on mount', async () => {
    vi.mocked(chartOfAccountsService.fetchChartOfAccounts).mockResolvedValue(mockAccounts);

    const { result } = renderHook(() => useChartOfAccounts());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accounts).toEqual(mockAccounts);
    expect(result.current.error).toBe(null);
    expect(chartOfAccountsService.fetchChartOfAccounts).toHaveBeenCalledOnce();
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Failed to fetch accounts');
    vi.mocked(chartOfAccountsService.fetchChartOfAccounts).mockRejectedValue(mockError);

    const { result } = renderHook(() => useChartOfAccounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accounts).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch accounts');
  });

  it('should refetch accounts when refetch is called', async () => {
    const newAccount: ChartOfAccountsRow = {
      id: '3',
      code: '2.1',
      name: 'Liabilities',
      account_type: 'LIABILITY',
      is_group: true,
      is_active: true,
      normal_balance: 'CREDIT',
      allow_transactions: false,
      currency: 'ARS',
      parent_id: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    
    vi.mocked(chartOfAccountsService.fetchChartOfAccounts)
      .mockResolvedValueOnce(mockAccounts)
      .mockResolvedValueOnce([...mockAccounts, newAccount]);

    const { result } = renderHook(() => useChartOfAccounts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(2);

    // Refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.accounts).toHaveLength(3);
    });

    expect(chartOfAccountsService.fetchChartOfAccounts).toHaveBeenCalledTimes(2);
  });

  it('should clear error on successful refetch', async () => {
    const mockError = new Error('Initial error');
    vi.mocked(chartOfAccountsService.fetchChartOfAccounts)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(mockAccounts);

    const { result } = renderHook(() => useChartOfAccounts());

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });

    // Refetch successfully
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBe(null);
      expect(result.current.accounts).toEqual(mockAccounts);
    });
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(chartOfAccountsService.fetchChartOfAccounts).mockRejectedValue('String error');

    const { result } = renderHook(() => useChartOfAccounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
  });

  it('should set loading state correctly during refetch', async () => {
    vi.mocked(chartOfAccountsService.fetchChartOfAccounts).mockResolvedValue(mockAccounts);

    const { result } = renderHook(() => useChartOfAccounts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Start refetch
    const refetchPromise = result.current.refetch();
    
    // Should be loading during refetch
    expect(result.current.isLoading).toBe(true);

    await refetchPromise;

    // Should not be loading after refetch
    expect(result.current.isLoading).toBe(false);
  });
});
