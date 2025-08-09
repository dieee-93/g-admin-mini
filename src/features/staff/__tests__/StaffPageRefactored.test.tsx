// Staff Page Component Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@/components/ui/provider';
import { NavigationProvider } from '@/contexts/NavigationContext';
import StaffPageRefactored from '../StaffPageRefactored';

// Mock the navigation context
const mockSetQuickActions = vi.fn();
vi.mock('@/contexts/NavigationContext', () => ({
  useNavigation: () => ({
    setQuickActions: mockSetQuickActions
  }),
  NavigationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the section components
vi.mock('../components/sections/DirectorySection', () => ({
  DirectorySection: ({ viewState, onViewStateChange }: any) => (
    <div data-testid="directory-section">
      Directory Section - Active: {viewState.activeTab}
      <button onClick={() => onViewStateChange({ ...viewState, activeTab: 'performance' })}>
        Change Tab
      </button>
    </div>
  )
}));

vi.mock('../components/sections/PerformanceSection', () => ({
  PerformanceSection: ({ viewState }: any) => (
    <div data-testid="performance-section">
      Performance Section - Active: {viewState.activeTab}
    </div>
  )
}));

vi.mock('../components/sections/TrainingSection', () => ({
  TrainingSection: ({ viewState }: any) => (
    <div data-testid="training-section">
      Training Section - Active: {viewState.activeTab}
    </div>
  )
}));

vi.mock('../components/sections/ManagementSection', () => ({
  ManagementSection: ({ viewState }: any) => (
    <div data-testid="management-section">
      Management Section - Active: {viewState.activeTab}
    </div>
  )
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <Provider>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </Provider>
  </BrowserRouter>
);

describe('StaffPageRefactored', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the staff page with header and KPIs', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Check main title
    expect(screen.getByText('Gestión de Personal')).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText('Directorio, rendimiento, entrenamiento y administración HR')).toBeInTheDocument();
    
    // Check security badge
    expect(screen.getByText('Security Compliant')).toBeInTheDocument();
    
    // Check active employees badge
    expect(screen.getByText('22 Activos')).toBeInTheDocument();
  });

  it('should render KPI cards with correct data', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Check KPI values
    expect(screen.getByText('24')).toBeInTheDocument(); // Total employees
    expect(screen.getByText('8')).toBeInTheDocument(); // On shift
    expect(screen.getByText('87.5%')).toBeInTheDocument(); // Avg performance
    expect(screen.getByText('5')).toBeInTheDocument(); // Training due

    // Check KPI labels
    expect(screen.getByText('Total Empleados')).toBeInTheDocument();
    expect(screen.getByText('En Turno')).toBeInTheDocument();
    expect(screen.getByText('Rendimiento Prom.')).toBeInTheDocument();
    expect(screen.getByText('Entrenamientos Pendientes')).toBeInTheDocument();
  });

  it('should render all tab triggers with correct labels', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Check tab labels (visible on larger screens)
    expect(screen.getByText('Directorio')).toBeInTheDocument();
    expect(screen.getByText('Rendimiento')).toBeInTheDocument();
    expect(screen.getByText('Entrenamiento')).toBeInTheDocument();
    expect(screen.getByText('Administración')).toBeInTheDocument();
  });

  it('should show notification badges on tabs when there are pending items', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Check for notification badges
    const performanceBadge = screen.getByText('3'); // Pending reviews
    const trainingBadge = screen.getByText('5'); // Training due
    
    expect(performanceBadge).toBeInTheDocument();
    expect(trainingBadge).toBeInTheDocument();
  });

  it('should render directory section by default', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    expect(screen.getByTestId('directory-section')).toBeInTheDocument();
    expect(screen.getByText('Directory Section - Active: directory')).toBeInTheDocument();
  });

  it('should set appropriate quick actions on mount', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    expect(mockSetQuickActions).toHaveBeenCalled();
    
    // Get the last call to setQuickActions
    const lastCall = mockSetQuickActions.mock.calls[mockSetQuickActions.mock.calls.length - 1];
    const quickActions = lastCall[0];
    
    expect(quickActions).toBeDefined();
    expect(Array.isArray(quickActions)).toBe(true);
    expect(quickActions.length).toBeGreaterThan(0);
    
    // Check that base action exists
    const newEmployeeAction = quickActions.find((action: any) => action.id === 'new-employee');
    expect(newEmployeeAction).toBeDefined();
    expect(newEmployeeAction.label).toBe('Nuevo Empleado');
  });

  it('should update quick actions when tab changes', async () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Clear previous calls
    mockSetQuickActions.mockClear();

    // Click to change tab (this triggers the state change in our mock)
    const changeTabButton = screen.getByText('Change Tab');
    fireEvent.click(changeTabButton);

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockSetQuickActions).toHaveBeenCalled();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Check for proper ARIA labels
    const directoryTab = screen.getByRole('tab', { name: /directorio/i });
    expect(directoryTab).toBeInTheDocument();

    const performanceTab = screen.getByRole('tab', { name: /rendimiento/i });
    expect(performanceTab).toBeInTheDocument();
  });

  it('should be responsive with proper mobile classes', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Check for responsive grid classes
    const kpiGrid = screen.getByText('Total Empleados').closest('.css-1g7zxhd'); // SimpleGrid should have CSS classes
    expect(kpiGrid).toBeInTheDocument();
  });

  it('should handle state changes correctly', () => {
    render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    // Verify initial state
    expect(screen.getByText('Directory Section - Active: directory')).toBeInTheDocument();
    
    // The change tab button should be able to trigger state changes
    const changeTabButton = screen.getByText('Change Tab');
    expect(changeTabButton).toBeInTheDocument();
  });

  it('should cleanup quick actions on unmount', () => {
    const { unmount } = render(
      <TestWrapper>
        <StaffPageRefactored />
      </TestWrapper>
    );

    mockSetQuickActions.mockClear();

    unmount();

    // The cleanup function should call setQuickActions with empty array
    expect(mockSetQuickActions).toHaveBeenCalledWith([]);
  });
});