/**
 * Unit Tests for LaborCostDashboard Component
 * Tests labor cost visualization, calculations, and interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LaborCostDashboard } from '../LaborCostDashboard';

// Mock the labor cost API functions
const mockLaborCostApi = {
  calculateLaborCosts: vi.fn(),
  getLaborCostSummary: vi.fn(),
  getCostPerHourAnalysis: vi.fn(),
};

vi.mock('@/services/staff/staffApi', () => mockLaborCostApi);

// Mock Chakra UI components that might cause issues
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    Tabs: {
      Root: ({ children, ...props }: any) => <div data-testid="tabs-root" {...props}>{children}</div>,
      List: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
      Trigger: ({ children, value, ...props }: any) => (
        <button data-testid={`tab-${value}`} data-value={value} {...props}>{children}</button>
      ),
      Content: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
    }
  };
});

describe('LaborCostDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock responses
    mockLaborCostApi.calculateLaborCosts.mockResolvedValue([
      {
        employee_id: '1',
        employee_name: 'Juan Pérez',
        department: 'Cocina',
        regular_hours: 40,
        overtime_hours: 5,
        regular_cost: 1000,
        overtime_cost: 187.5,
        total_cost: 1187.5
      },
      {
        employee_id: '2',
        employee_name: 'María García',
        department: 'Servicio',
        regular_hours: 35,
        overtime_hours: 0,
        regular_cost: 630,
        overtime_cost: 0,
        total_cost: 630
      }
    ]);

    mockLaborCostApi.getLaborCostSummary.mockResolvedValue({
      total_cost: 5000,
      regular_cost: 4200,
      overtime_cost: 800,
      total_hours: 200,
      overtime_hours: 15,
      avg_hourly_rate: 22.5,
      variance_from_budget: -200,
      variance_percentage: -3.8
    });

    mockLaborCostApi.getCostPerHourAnalysis.mockResolvedValue([
      {
        department: 'Cocina',
        avg_cost_per_hour: 25.5,
        total_hours: 120,
        employee_count: 3
      },
      {
        department: 'Servicio',
        avg_cost_per_hour: 18.0,
        total_hours: 80,
        employee_count: 2
      }
    ]);
  });

  it('should render without crashing', () => {
    render(<LaborCostDashboard />);
    
    expect(screen.getByText('Panel de Costos Laborales')).toBeInTheDocument();
  });

  it('should display all tab options', () => {
    render(<LaborCostDashboard />);

    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-employees')).toBeInTheDocument();
    expect(screen.getByTestId('tab-departments')).toBeInTheDocument();
    expect(screen.getByTestId('tab-analysis')).toBeInTheDocument();
  });

  it('should load and display labor cost data on mount', async () => {
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalled();
      expect(mockLaborCostApi.getLaborCostSummary).toHaveBeenCalled();
      expect(mockLaborCostApi.getCostPerHourAnalysis).toHaveBeenCalled();
    });
  });

  it('should display loading state while fetching data', async () => {
    // Make API calls take time
    mockLaborCostApi.calculateLaborCosts.mockImplementation(() => new Promise(() => {}));

    render(<LaborCostDashboard />);

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('should display error state when API fails', async () => {
    mockLaborCostApi.calculateLaborCosts.mockRejectedValue(new Error('API Error'));

    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
    });
  });

  it('should display overview summary data', async () => {
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(screen.getByText('$5,000')).toBeInTheDocument(); // total_cost
      expect(screen.getByText('200h')).toBeInTheDocument(); // total_hours
      expect(screen.getByText('$22.50')).toBeInTheDocument(); // avg_hourly_rate
      expect(screen.getByText('-3.8%')).toBeInTheDocument(); // variance_percentage
    });
  });

  it('should switch between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<LaborCostDashboard />);

    // Initially overview tab should be active
    expect(screen.getByTestId('tab-content-overview')).toBeInTheDocument();

    // Click employees tab
    await user.click(screen.getByTestId('tab-employees'));

    expect(screen.getByTestId('tab-content-employees')).toBeInTheDocument();
  });

  it('should display employee cost data in employees tab', async () => {
    const user = userEvent.setup();
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId('tab-employees'));

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('$1,187.50')).toBeInTheDocument();
      expect(screen.getByText('$630.00')).toBeInTheDocument();
    });
  });

  it('should display department analysis in departments tab', async () => {
    const user = userEvent.setup();
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(mockLaborCostApi.getCostPerHourAnalysis).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId('tab-departments'));

    await waitFor(() => {
      expect(screen.getByText('Cocina')).toBeInTheDocument();
      expect(screen.getByText('Servicio')).toBeInTheDocument();
      expect(screen.getByText('$25.50')).toBeInTheDocument();
      expect(screen.getByText('$18.00')).toBeInTheDocument();
    });
  });

  it('should handle date range changes', async () => {
    const user = userEvent.setup();
    render(<LaborCostDashboard />);

    // Find date range selector
    const startDateInput = screen.getByLabelText(/fecha inicio/i);
    const endDateInput = screen.getByLabelText(/fecha fin/i);

    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-01-01');
    
    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-01-07');

    await waitFor(() => {
      expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-07',
        undefined
      );
    });
  });

  it('should handle department filter changes', async () => {
    const user = userEvent.setup();
    render(<LaborCostDashboard />);

    const departmentSelect = screen.getByRole('combobox', { name: /departamento/i });
    await user.selectOptions(departmentSelect, 'Cocina');

    await waitFor(() => {
      expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'Cocina'
      );
    });
  });

  it('should calculate overtime costs correctly', async () => {
    render(<LaborCostDashboard />);

    await waitFor(() => {
      // Regular cost: $4,200, Overtime cost: $800
      const regularPercentage = (4200 / 5000) * 100; // 84%
      const overtimePercentage = (800 / 5000) * 100; // 16%
      
      expect(screen.getByText('84%')).toBeInTheDocument();
      expect(screen.getByText('16%')).toBeInTheDocument();
    });
  });

  it('should display variance indicators correctly', async () => {
    render(<LaborCostDashboard />);

    await waitFor(() => {
      // Variance is -3.8% (under budget), should show green indicator
      const varianceElement = screen.getByText('-3.8%');
      expect(varianceElement).toHaveClass('text-green-600'); // or similar positive indicator
    });
  });

  it('should handle empty data gracefully', async () => {
    mockLaborCostApi.calculateLaborCosts.mockResolvedValue([]);
    mockLaborCostApi.getLaborCostSummary.mockResolvedValue({
      total_cost: 0,
      regular_cost: 0,
      overtime_cost: 0,
      total_hours: 0,
      overtime_hours: 0,
      avg_hourly_rate: 0,
      variance_from_budget: 0,
      variance_percentage: 0
    });

    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sin datos para el período seleccionado')).toBeInTheDocument();
    });
  });

  it('should format currency values correctly', async () => {
    render(<LaborCostDashboard />);

    await waitFor(() => {
      // Should format as currency with commas and dollar sign
      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('$1,187.50')).toBeInTheDocument();
    });
  });

  it('should export data when export button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock CSV export
    const mockCreateObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalled();
    });

    const exportButton = screen.getByText('Exportar');
    await user.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should refresh data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByLabelText('Actualizar datos');
    await user.click(refreshButton);

    expect(mockLaborCostApi.calculateLaborCosts).toHaveBeenCalledTimes(2);
  });

  it('should maintain performance with large datasets', async () => {
    // Mock large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      employee_id: `emp_${i}`,
      employee_name: `Employee ${i}`,
      department: i % 2 === 0 ? 'Cocina' : 'Servicio',
      regular_hours: 40,
      overtime_hours: i % 3,
      regular_cost: 1000,
      overtime_cost: (i % 3) * 37.5,
      total_cost: 1000 + (i % 3) * 37.5
    }));

    mockLaborCostApi.calculateLaborCosts.mockResolvedValue(largeDataset);

    const startTime = performance.now();
    render(<LaborCostDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Panel de Costos Laborales')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 1 second even with large dataset
    expect(renderTime).toBeLessThan(1000);
  });
});