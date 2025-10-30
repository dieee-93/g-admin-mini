import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { FloorStats } from '../../components/FloorStats';

/**
 * FloorStats Component Tests - Simplified Version
 * Validates statistics calculation and Supabase queries without timeout issues
 */

// Use vi.hoisted() to define mocks that can be referenced in vi.mock()
const mocks = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
  mockSupabaseRpc: vi.fn(),
  mockNotifyError: vi.fn()
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: mocks.mockSupabaseFrom,
    rpc: mocks.mockSupabaseRpc
  }
}));

// Mock DecimalUtils
vi.mock('@/business-logic/shared/decimalUtils', () => ({
  DecimalUtils: {
    add: (a: string, b: string) => ({
      toString: () => (parseFloat(a) + parseFloat(b)).toString(),
      toNumber: () => parseFloat(a) + parseFloat(b),
      toFixed: (decimals: number) => (parseFloat(a) + parseFloat(b)).toFixed(decimals)
    }),
    divide: (a: string, b: string) => ({
      toString: () => (parseFloat(a) / parseFloat(b)).toString(),
      toNumber: () => parseFloat(a) / parseFloat(b),
      toFixed: (decimals: number) => (parseFloat(a) / parseFloat(b)).toFixed(decimals)
    }),
    multiply: (a: string, b: string) => ({
      toString: () => (parseFloat(a) * parseFloat(b)).toString(),
      toNumber: () => parseFloat(a) * parseFloat(b),
      toFixed: (decimals: number) => (parseFloat(a) * parseFloat(b)).toFixed(decimals)
    }),
    formatCurrency: (n: number) => `$${n.toFixed(2)}`,
    fromValue: (n: number) => ({
      toFixed: (decimals: number) => n.toFixed(decimals)
    })
  }
}));

// Mock notify
vi.mock('@/lib/notifications', () => ({
  notify: {
    error: mocks.mockNotifyError,
    success: vi.fn()
  }
}));

// Mock logger
vi.mock('@/lib/logging', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

describe('FloorStats - Simplified Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with data successfully', async () => {
    // Arrange
    const mockData = [
      { status: 'available', daily_revenue: 0, turn_count: 0 },
      { status: 'occupied', daily_revenue: 100, turn_count: 2 },
      { status: 'occupied', daily_revenue: 150, turn_count: 3 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
      }))
    });

    mocks.mockSupabaseRpc.mockResolvedValue({
      data: { estimated_wait_minutes: 15, confidence_level: 'medium' },
      error: null
    });

    // Act
    const { container } = render(<FloorStats />);

    // Assert - Wait for data to load
    await waitFor(() => {
      // Component should have rendered stats
      expect(container.textContent).toContain('Available Tables');
    }, { timeout: 3000 });
  });

  it('should handle empty data', async () => {
    // Arrange
    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    });

    mocks.mockSupabaseRpc.mockResolvedValue({
      data: { estimated_wait_minutes: 0, confidence_level: 'low' },
      error: null
    });

    // Act
    render(<FloorStats />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/0\/0/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show wait time alert when > 30 minutes', async () => {
    // Arrange
    const mockData = [
      { status: 'occupied', daily_revenue: 100, turn_count: 1 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
      }))
    });

    mocks.mockSupabaseRpc.mockResolvedValue({
      data: { estimated_wait_minutes: 45, confidence_level: 'high' },
      error: null
    });

    // Act
    render(<FloorStats />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/High Wait Times/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle Supabase errors gracefully', async () => {
    // Arrange
    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: new Error('Connection failed') }))
      }))
    });

    // Act
    render(<FloorStats />);

    // Assert
    await waitFor(() => {
      expect(mocks.mockNotifyError).toHaveBeenCalledWith({ title: 'Error loading stats' });
    }, { timeout: 3000 });
  });

  it('should call Supabase from and rpc methods', async () => {
    // Arrange
    const mockData = [
      { status: 'available', daily_revenue: 0, turn_count: 0 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
      }))
    });

    mocks.mockSupabaseRpc.mockResolvedValue({
      data: { estimated_wait_minutes: 10, confidence_level: 'medium' },
      error: null
    });

    // Act
    render(<FloorStats />);

    // Assert
    await waitFor(() => {
      expect(mocks.mockSupabaseFrom).toHaveBeenCalledWith('tables');
      expect(mocks.mockSupabaseRpc).toHaveBeenCalledWith('pos_estimate_next_table_available');
    }, { timeout: 3000 });
  });
});
