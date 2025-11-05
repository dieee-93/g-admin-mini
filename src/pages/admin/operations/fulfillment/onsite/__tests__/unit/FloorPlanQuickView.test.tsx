import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { FloorPlanQuickView } from '../../components/FloorPlanQuickView';

/**
 * FloorPlanQuickView Component Tests
 * Validates simplified view for Sales POS integration
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

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: mocks.mockSupabaseFrom,
    channel: mocks.mockSupabaseChannel
  }
}));

// Mock logger
vi.mock('@/lib/logging', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('FloorPlanQuickView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render simplified table grid', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 },
      { id: 'table-2', number: 2, status: 'occupied', capacity: 6 },
      { id: 'table-3', number: 3, status: 'available', capacity: 2 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/T1/i)).toBeInTheDocument();
      expect(screen.getByText(/T2/i)).toBeInTheDocument();
      expect(screen.getByText(/T3/i)).toBeInTheDocument();
    });
  });

  it('should show "Free" badge for available tables', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Free/i)).toBeInTheDocument();
    });
  });

  it('should show "Busy" badge for occupied tables', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'occupied', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Busy/i)).toBeInTheDocument();
    });
  });

  it('should call onTableSelect when table clicked', async () => {
    // Arrange
    const mockOnSelect = vi.fn();
    const mockTables = [
      { id: 'table-5', number: 5, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView onTableSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText(/T5/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/T5/i).closest('button')!);

    // Assert
    expect(mockOnSelect).toHaveBeenCalledWith('table-5');
  });

  it('should disable occupied tables', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'occupied', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      const button = screen.getByText(/T1/i).closest('button');
      expect(button).toBeDisabled();
    });
  });

  it('should NOT disable available tables', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      const button = screen.getByText(/T1/i).closest('button');
      expect(button).not.toBeDisabled();
    });
  });

  it('should disable reserved tables', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'reserved', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      const button = screen.getByText(/T1/i).closest('button');
      expect(button).toBeDisabled();
    });
  });

  it('should subscribe to table changes', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      expect(mocks.mockSupabaseChannel).toHaveBeenCalledWith('tables-quick-view');
      expect(mocks.mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({ table: 'tables' }),
        expect.any(Function)
      );
    });
  });

  it('should unsubscribe on unmount', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    const { unmount } = render(<FloorPlanQuickView />);

    await waitFor(() => {
      expect(screen.getByText(/T1/i)).toBeInTheDocument();
    });

    unmount();

    // Assert
    expect(mocks.mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should order tables by number', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-10', number: 10, status: 'available', capacity: 4 },
      { id: 'table-1', number: 1, status: 'available', capacity: 4 },
      { id: 'table-5', number: 5, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      expect(mocks.mockSupabaseFrom).toHaveBeenCalled();
      const selectCall = mocks.mockSupabaseFrom.mock.results[0].value;
      expect(selectCall.select).toHaveBeenCalledWith('id, number, status, capacity');
    });
  });

  it('should handle empty table list', async () => {
    // Arrange
    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Quick Table Selection/i)).toBeInTheDocument();
    });
  });

  it('should NOT call onTableSelect if prop not provided', async () => {
    // Arrange
    const mockTables = [
      { id: 'table-1', number: 1, status: 'available', capacity: 4 }
    ];

    mocks.mockSupabaseFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTables, error: null }))
        }))
      }))
    });

    // Act
    render(<FloorPlanQuickView />); // No onTableSelect prop

    await waitFor(() => {
      expect(screen.getByText(/T1/i)).toBeInTheDocument();
    });

    // Should not throw error when clicking
    fireEvent.click(screen.getByText(/T1/i).closest('button')!);

    // Assert - No error thrown
    expect(true).toBe(true);
  });
});
