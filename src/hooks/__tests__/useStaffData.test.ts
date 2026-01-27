/**
 * Unit Tests for useStaffData Hook
 * Tests data loading, performance analytics, and hook behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useStaffData, useStaffDataRange, useStaffWithLoader, usePerformanceAnalytics } from '../useStaffData';
import { useTeamStore } from '../../../store/staffStore';

// Mock the staff store
const mockStaffStore = {
  staff: [],
  schedules: [],
  timeEntries: [],
  loading: false,
  error: null,
  loadStaff: vi.fn(),
  loadSchedules: vi.fn(),
  loadTimeEntries: vi.fn(),
  getStaffStats: vi.fn(() => ({
    totalEmployees: 0,
    activeEmployees: 0,
    onDuty: 0,
    avgRating: 0
  }))
};

vi.mocked(useTeamStore).mockReturnValue(mockStaffStore);

// Mock the staff API
vi.mock('../../../services/staff/staffApi', () => ({
  getEmployeePerformance: vi.fn().mockResolvedValue([]),
  getDepartmentPerformance: vi.fn().mockResolvedValue([]),
  getPerformanceTrends: vi.fn().mockResolvedValue([]),
  getTopPerformers: vi.fn().mockResolvedValue([])
}));

describe('useStaffData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStaffStore.staff = [];
    mockStaffStore.loading = false;
    mockStaffStore.error = null;
  });

  it('should load staff data on mount when staff is empty', async () => {
    renderHook(() => useStaffData());

    await waitFor(() => {
      expect(mockStaffStore.loadStaff).toHaveBeenCalledOnce();
    });
  });

  it('should not load staff data when already loaded', () => {
    mockStaffStore.staff = [{ id: '1', name: 'Test Employee' }] as any;

    renderHook(() => useStaffData());

    expect(mockStaffStore.loadStaff).not.toHaveBeenCalled();
  });

  it('should not load staff data when loading is in progress', () => {
    mockStaffStore.loading = true;

    renderHook(() => useStaffData());

    expect(mockStaffStore.loadStaff).not.toHaveBeenCalled();
  });

  it('should not load staff data when there is an error', () => {
    mockStaffStore.error = 'Some error';

    renderHook(() => useStaffData());

    expect(mockStaffStore.loadStaff).not.toHaveBeenCalled();
  });

  it('should load schedules and time entries for current week', async () => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
    
    const expectedStartDate = startOfWeek.toISOString().split('T')[0];
    const expectedEndDate = endOfWeek.toISOString().split('T')[0];

    renderHook(() => useStaffData());

    await waitFor(() => {
      expect(mockStaffStore.loadSchedules).toHaveBeenCalledWith(expectedStartDate, expectedEndDate);
      expect(mockStaffStore.loadTimeEntries).toHaveBeenCalledWith(expectedStartDate, expectedEndDate);
    });
  });

  it('should return correct isEmpty flag', () => {
    const { result } = renderHook(() => useStaffData());

    expect(result.current.isEmpty).toBe(true);

    mockStaffStore.staff = [{ id: '1' }] as any;
    const { result: result2 } = renderHook(() => useStaffData());
    
    expect(result2.current.isEmpty).toBe(false);
  });

  it('should return all required properties', () => {
    const { result } = renderHook(() => useStaffData());

    expect(result.current).toHaveProperty('staff');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isEmpty');
  });
});

describe('useStaffDataRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load data for specified date range', async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-07';

    renderHook(() => useStaffDataRange(startDate, endDate));

    await waitFor(() => {
      expect(mockStaffStore.loadSchedules).toHaveBeenCalledWith(startDate, endDate);
      expect(mockStaffStore.loadTimeEntries).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  it('should not load data when dates are not provided', () => {
    renderHook(() => useStaffDataRange());

    expect(mockStaffStore.loadSchedules).not.toHaveBeenCalled();
    expect(mockStaffStore.loadTimeEntries).not.toHaveBeenCalled();
  });

  it('should reload data when dates change', async () => {
    const { rerender } = renderHook(
      ({ startDate, endDate }) => useStaffDataRange(startDate, endDate),
      { initialProps: { startDate: '2024-01-01', endDate: '2024-01-07' } }
    );

    await waitFor(() => {
      expect(mockStaffStore.loadSchedules).toHaveBeenCalledWith('2024-01-01', '2024-01-07');
    });

    vi.clearAllMocks();

    rerender({ startDate: '2024-01-08', endDate: '2024-01-14' });

    await waitFor(() => {
      expect(mockStaffStore.loadSchedules).toHaveBeenCalledWith('2024-01-08', '2024-01-14');
    });
  });

  it('should return schedules, timeEntries and loading state', () => {
    const { result } = renderHook(() => useStaffDataRange('2024-01-01', '2024-01-07'));

    expect(result.current).toHaveProperty('schedules');
    expect(result.current).toHaveProperty('timeEntries');
    expect(result.current).toHaveProperty('loading');
  });
});

describe('useStaffWithLoader', () => {
  it('should return enhanced store with auto-loading', () => {
    const { result } = renderHook(() => useStaffWithLoader());

    expect(result.current).toHaveProperty('staff');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('isReady');
    expect(result.current).toHaveProperty('loadStaff');
    expect(result.current).toHaveProperty('loadSchedules');
    expect(result.current).toHaveProperty('loadTimeEntries');
  });

  it('should calculate isReady correctly when staff is loaded', () => {
    mockStaffStore.staff = [{ id: '1' }] as any;
    mockStaffStore.loading = false;
    mockStaffStore.error = null;

    const { result } = renderHook(() => useStaffWithLoader());

    expect(result.current.isReady).toBe(true);
  });

  it('should calculate isReady correctly when no staff but no loading/error', () => {
    mockStaffStore.staff = [];
    mockStaffStore.loading = false;
    mockStaffStore.error = null;

    const { result } = renderHook(() => useStaffWithLoader());

    expect(result.current.isReady).toBe(true);
  });

  it('should calculate isReady correctly when loading', () => {
    mockStaffStore.staff = [];
    mockStaffStore.loading = true;
    mockStaffStore.error = null;

    const { result } = renderHook(() => useStaffWithLoader());

    expect(result.current.isReady).toBe(false);
  });

  it('should calculate isReady correctly when error', () => {
    mockStaffStore.staff = [];
    mockStaffStore.loading = false;
    mockStaffStore.error = 'Some error';

    const { result } = renderHook(() => useStaffWithLoader());

    expect(result.current.isReady).toBe(false);
  });
});

describe('usePerformanceAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide all analytics functions', () => {
    const { result } = renderHook(() => usePerformanceAnalytics());

    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('loadEmployeePerformance');
    expect(result.current).toHaveProperty('loadDepartmentPerformance');
    expect(result.current).toHaveProperty('loadPerformanceTrends');
    expect(result.current).toHaveProperty('loadTopPerformers');

    expect(typeof result.current.loadEmployeePerformance).toBe('function');
    expect(typeof result.current.loadDepartmentPerformance).toBe('function');
    expect(typeof result.current.loadPerformanceTrends).toBe('function');
    expect(typeof result.current.loadTopPerformers).toBe('function');
  });

  it('should handle loading state correctly', async () => {
    const { result } = renderHook(() => usePerformanceAnalytics());

    expect(result.current.loading).toBe(false);

    // Start loading
    let promise: Promise<any>;
    act(() => {
      promise = result.current.loadEmployeePerformance('1');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle errors correctly', async () => {
    const { getEmployeePerformance } = await import('../../../services/staff/staffApi');
    vi.mocked(getEmployeePerformance).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => usePerformanceAnalytics());

    await act(async () => {
      await result.current.loadEmployeePerformance('1');
    });

    expect(result.current.error).toBe('API Error');
  });

  it('should clear error on successful load', async () => {
    const { result } = renderHook(() => usePerformanceAnalytics());

    // First cause an error
    const { getEmployeePerformance } = await import('../../../services/staff/staffApi');
    vi.mocked(getEmployeePerformance).mockRejectedValueOnce(new Error('API Error'));
    
    await act(async () => {
      await result.current.loadEmployeePerformance('1');
    });
    expect(result.current.error).toBe('API Error');

    // Then succeed
    vi.mocked(getEmployeePerformance).mockResolvedValueOnce([]);
    
    await act(async () => {
      await result.current.loadEmployeePerformance('1');
    });
    expect(result.current.error).toBe(null);
  });

  it('should return data from analytics functions', async () => {
    const mockData = [{ month: '2024-01', score: 85 }];
    const { getEmployeePerformance } = await import('../../../services/staff/staffApi');
    vi.mocked(getEmployeePerformance).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => usePerformanceAnalytics());

    let data: any;
    await act(async () => {
      data = await result.current.loadEmployeePerformance('1', 6);
    });

    expect(data).toEqual(mockData);
    expect(getEmployeePerformance).toHaveBeenCalledWith('1', 6);
  });
});