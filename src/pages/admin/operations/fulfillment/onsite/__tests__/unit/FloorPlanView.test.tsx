import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { FloorPlanView } from '../../components/FloorPlanView';

/**
 * FloorPlanView Component Tests
 * Validates rendering of tables and real-time updates
 */

// Use vi.hoisted() to define mocks that can be referenced in vi.mock()
const mocks = vi.hoisted(() => {
  const mockSubscription = {
    unsubscribe: vi.fn()
  };

  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(() => mockSubscription)
  };

  return {
    mockSupabaseFrom: vi.fn(),
    mockSupabaseChannel: vi.fn(() => mockChannel),
    mockSubscription,
    mockChannel
  };
});

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: mocks.mockSupabaseFrom,
    channel: mocks.mockSupabaseChannel
  }
}));

// Mock DecimalUtils
vi.mock('@/business-logic/shared/decimalUtils', () => ({
  DecimalUtils: {
    formatCurrency: (n: number) => `$${n.toFixed(2)}`
  }
}));

// Mock notify
vi.mock('@/lib/notifications', () => ({
  notify: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock logger
vi.mock('@/lib/logging', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('FloorPlanView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    // Arrange
    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => new Promise(() => {})) // Never resolves
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    expect(screen.getByText(/Loading table data.../i)).toBeInTheDocument();
  });

  it('should render grid of tables', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'available',
        location: 'main',
        priority: 'normal',
        color_code: 'green',
        turn_count: 0,
        daily_revenue: 0,
        parties: []
      },
      {
        id: 'table-2',
        number: 2,
        capacity: 6,
        status: 'occupied',
        location: 'patio',
        priority: 'vip',
        color_code: 'yellow',
        turn_count: 2,
        daily_revenue: 150.50,
        parties: [{
          size: 4,
          customer_name: 'John Doe',
          seated_at: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
          estimated_duration: 90,
          total_spent: 75.25,
          status: 'seated'
        }]
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Table 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Table 2/i)).toBeInTheDocument();
    });
  });

  it('should display correct status badge colors', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'available',
        location: 'main',
        priority: 'normal',
        color_code: 'green',
        turn_count: 0,
        daily_revenue: 0,
        parties: []
      },
      {
        id: 'table-2',
        number: 2,
        capacity: 4,
        status: 'occupied',
        location: 'main',
        priority: 'normal',
        color_code: 'yellow',
        turn_count: 1,
        daily_revenue: 50,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/AVAILABLE/i)).toBeInTheDocument();
      expect(screen.getByText(/OCCUPIED/i)).toBeInTheDocument();
    });
  });

  it('should display VIP priority icon', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'occupied',
        location: 'main',
        priority: 'vip',
        color_code: 'yellow',
        turn_count: 1,
        daily_revenue: 100,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('👑')).toBeInTheDocument();
    });
  });

  it('should display current party information', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'occupied',
        location: 'main',
        priority: 'normal',
        color_code: 'yellow',
        turn_count: 1,
        daily_revenue: 75.25,
        parties: [{
          size: 4,
          customer_name: 'Jane Smith',
          seated_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
          estimated_duration: 60,
          total_spent: 75.25,
          status: 'seated'
        }]
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Party of 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      // $75.25 appears twice: once as total_spent and once as daily_revenue (expected behavior)
      const priceElements = screen.getAllByText(/\$75.25/i);
      expect(priceElements).toHaveLength(2);
    });
  });

  it('should format duration correctly', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'occupied',
        location: 'main',
        priority: 'normal',
        color_code: 'yellow',
        turn_count: 1,
        daily_revenue: 100,
        parties: [{
          size: 2,
          customer_name: 'Test Customer',
          seated_at: new Date(Date.now() - 90 * 60000).toISOString(), // 90 mins ago (1h 30m)
          estimated_duration: 60,
          total_spent: 50,
          status: 'seated'
        }]
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      // Should show 1h 30m format
      expect(screen.getByText(/1h 30m/i)).toBeInTheDocument();
    });
  });

  it('should subscribe to table changes on mount', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'available',
        location: 'main',
        priority: 'normal',
        color_code: 'green',
        turn_count: 0,
        daily_revenue: 0,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(mocks.mockSupabaseChannel).toHaveBeenCalledWith('tables-changes');
      expect(mocks.mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({ table: 'tables' }),
        expect.any(Function)
      );
      expect(mocks.mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on unmount', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'available',
        location: 'main',
        priority: 'normal',
        color_code: 'green',
        turn_count: 0,
        daily_revenue: 0,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    const { unmount } = render(<FloorPlanView />);

    await waitFor(() => {
      expect(screen.getByText(/Table 1/i)).toBeInTheDocument();
    });

    unmount();

    // Assert
    expect(mocks.mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should show "Seat Party" button for available tables', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'available',
        location: 'main',
        priority: 'normal',
        color_code: 'green',
        turn_count: 0,
        daily_revenue: 0,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Seat Party/i)).toBeInTheDocument();
    });
  });

  it('should show "Check Status" button for occupied tables with red code', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'occupied',
        location: 'main',
        priority: 'normal',
        color_code: 'red',
        turn_count: 1,
        daily_revenue: 100,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Check Status/i)).toBeInTheDocument();
    });
  });

  it('should display performance stats (turns and revenue)', async () => {
    // Arrange
    const mockTables = [
      {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'available',
        location: 'main',
        priority: 'normal',
        color_code: 'green',
        turn_count: 5,
        daily_revenue: 450.50,
        parties: []
      }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Turns: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Revenue: \$450.50/i)).toBeInTheDocument();
    });
  });
});
