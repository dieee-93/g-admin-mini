/**
 * Integration Tests for Staff Module
 * Tests the complete flow from API to UI components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useStaffStore } from '../../../../../store/staffStore';
import { DirectorySection } from '../components/sections/DirectorySection';
import { PerformanceSection } from '../components/sections/PerformanceSection';
import { ManagementSection } from '../components/sections/ManagementSection';

// Mock the complete staff API
const mockStaffApi = {
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getSchedules: vi.fn(),
  createSchedule: vi.fn(),
  getTimeEntries: vi.fn(),
  createTimeEntry: vi.fn(),
  getEmployeePerformance: vi.fn(),
  getDepartmentPerformance: vi.fn(),
  getPerformanceTrends: vi.fn(),
  getTopPerformers: vi.fn(),
  calculateLaborCosts: vi.fn(),
  getLaborCostSummary: vi.fn(),
  getCostPerHourAnalysis: vi.fn(),
};

vi.mock('../../../../../services/staff/staffApi', () => mockStaffApi);

// Mock Chakra UI components that might have issues in tests
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    Modal: {
      Root: ({ children, open }: any) => open ? <div data-testid="modal">{children}</div> : null,
      Backdrop: ({ children }: any) => <div data-testid="modal-backdrop">{children}</div>,
      Content: ({ children }: any) => <div data-testid="modal-content">{children}</div>,
      Header: ({ children }: any) => <div data-testid="modal-header">{children}</div>,
      Body: ({ children }: any) => <div data-testid="modal-body">{children}</div>,
      Footer: ({ children }: any) => <div data-testid="modal-footer">{children}</div>,
      CloseTrigger: ({ children, ...props }: any) => <button data-testid="modal-close" {...props}>{children}</button>,
    },
    Tabs: {
      Root: ({ children, value, onValueChange }: any) => (
        <div data-testid="tabs-root" data-value={value} onChange={onValueChange}>
          {children}
        </div>
      ),
      List: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
      Trigger: ({ children, value, onClick }: any) => (
        <button 
          data-testid={`tab-${value}`} 
          data-value={value}
          onClick={() => onClick && onClick(value)}
        >
          {children}
        </button>
      ),
      Content: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
    }
  };
});

// Sample test data
const mockEmployees = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    department: 'Cocina',
    position: 'Chef',
    hourly_rate: 25.0,
    hire_date: '2023-01-01',
    status: 'active',
    skills: ['Cocina', 'Gestión'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
    department: 'Servicio',
    position: 'Mesera',
    hourly_rate: 18.0,
    hire_date: '2023-06-01',
    status: 'active',
    skills: ['Servicio al cliente'],
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z'
  }
];

const mockPerformanceData = [
  {
    month: '2024-01',
    total_hours: 160,
    efficiency_score: 85,
    quality_score: 90,
    punctuality_score: 95
  },
  {
    month: '2023-12',
    total_hours: 155,
    efficiency_score: 82,
    quality_score: 88,
    punctuality_score: 93
  }
];

const mockLaborCosts = [
  {
    employee_id: '1',
    employee_name: 'Juan Pérez',
    department: 'Cocina',
    regular_hours: 40,
    overtime_hours: 5,
    regular_cost: 1000,
    overtime_cost: 187.5,
    total_cost: 1187.5
  }
];

describe('Staff Module Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock responses
    mockStaffApi.getEmployees.mockResolvedValue(mockEmployees);
    mockStaffApi.getEmployeePerformance.mockResolvedValue(mockPerformanceData);
    mockStaffApi.getDepartmentPerformance.mockResolvedValue([]);
    mockStaffApi.getPerformanceTrends.mockResolvedValue([]);
    mockStaffApi.getTopPerformers.mockResolvedValue([]);
    mockStaffApi.calculateLaborCosts.mockResolvedValue(mockLaborCosts);
    mockStaffApi.getLaborCostSummary.mockResolvedValue({
      total_cost: 5000,
      regular_cost: 4200,
      overtime_cost: 800,
      total_hours: 200,
      overtime_hours: 15,
      avg_hourly_rate: 22.5,
      variance_from_budget: -200,
      variance_percentage: -3.8
    });
    mockStaffApi.getCostPerHourAnalysis.mockResolvedValue([]);
  });

  afterEach(() => {
    // Clean up store state
    const store = useStaffStore.getState();
    store.setState({
      staff: [],
      schedules: [],
      timeEntries: [],
      loading: false,
      error: null
    });
  });

  describe('Directory Section Integration', () => {
    it('should load and display employees from API', async () => {
      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      // Should show loading initially
      expect(screen.getByText('Cargando empleados...')).toBeInTheDocument();

      // Wait for API call and data to load
      await waitFor(() => {
        expect(mockStaffApi.getEmployees).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('María García')).toBeInTheDocument();
      });

      expect(screen.getByText('Chef')).toBeInTheDocument();
      expect(screen.getByText('Mesera')).toBeInTheDocument();
    });

    it('should handle employee creation workflow', async () => {
      const user = userEvent.setup();
      
      const newEmployee = {
        id: '3',
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        department: 'Cocina',
        position: 'Sous Chef',
        hourly_rate: 22.0,
        hire_date: '2024-01-01',
        status: 'active',
        skills: ['Cocina'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockStaffApi.createEmployee.mockResolvedValue(newEmployee);

      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Click add employee button
      const addButton = screen.getByText('Agregar Empleado');
      await user.click(addButton);

      // Modal should appear
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      // Fill form fields
      const nameInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/email/i);
      const departmentSelect = screen.getByLabelText(/departamento/i);
      const positionInput = screen.getByLabelText(/posición/i);
      const hourlyRateInput = screen.getByLabelText(/tarifa por hora/i);

      await user.type(nameInput, 'Carlos Rodríguez');
      await user.type(emailInput, 'carlos@example.com');
      await user.selectOptions(departmentSelect, 'Cocina');
      await user.type(positionInput, 'Sous Chef');
      await user.type(hourlyRateInput, '22.0');

      // Submit form
      const submitButton = screen.getByText('Guardar');
      await user.click(submitButton);

      // Should call API and update UI
      await waitFor(() => {
        expect(mockStaffApi.createEmployee).toHaveBeenCalledWith({
          name: 'Carlos Rodríguez',
          email: 'carlos@example.com',
          department: 'Cocina',
          position: 'Sous Chef',
          hourly_rate: 22.0,
          hire_date: expect.any(String),
          skills: []
        });
      });

      // New employee should appear in list
      await waitFor(() => {
        expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
      });
    });

    it('should handle employee update workflow', async () => {
      const user = userEvent.setup();
      
      const updatedEmployee = {
        ...mockEmployees[0],
        hourly_rate: 28.0,
        position: 'Jefe de Cocina'
      };

      mockStaffApi.updateEmployee.mockResolvedValue(updatedEmployee);

      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Click edit button for first employee
      const editButtons = screen.getAllByLabelText('Editar empleado');
      await user.click(editButtons[0]);

      // Modal should appear with pre-filled data
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();

      // Update hourly rate
      const hourlyRateInput = screen.getByDisplayValue('25');
      await user.clear(hourlyRateInput);
      await user.type(hourlyRateInput, '28');

      // Submit form
      const submitButton = screen.getByText('Guardar');
      await user.click(submitButton);

      // Should call API with updates
      await waitFor(() => {
        expect(mockStaffApi.updateEmployee).toHaveBeenCalledWith('1', {
          hourly_rate: 28.0
        });
      });
    });

    it('should handle employee deletion workflow', async () => {
      const user = userEvent.setup();
      
      mockStaffApi.deleteEmployee.mockResolvedValue(null);

      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Click delete button for first employee
      const deleteButtons = screen.getAllByLabelText('Eliminar empleado');
      await user.click(deleteButtons[0]);

      // Confirmation dialog should appear
      const confirmButton = screen.getByText('Confirmar eliminación');
      await user.click(confirmButton);

      // Should call API and remove from UI
      await waitFor(() => {
        expect(mockStaffApi.deleteEmployee).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });
    });

    it('should handle search and filtering', async () => {
      const user = userEvent.setup();

      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('María García')).toBeInTheDocument();
      });

      // Search for "Juan"
      const searchInput = screen.getByPlaceholderText(/buscar empleados/i);
      await user.type(searchInput, 'Juan');

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.queryByText('María García')).not.toBeInTheDocument();
      });

      // Clear search and filter by department
      await user.clear(searchInput);

      const departmentFilter = screen.getByRole('combobox', { name: /departamento/i });
      await user.selectOptions(departmentFilter, 'Servicio');

      await waitFor(() => {
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
        expect(screen.getByText('María García')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Section Integration', () => {
    it('should load and display performance analytics', async () => {
      render(<PerformanceSection viewState={{}} onViewStateChange={() => {}} />);

      // Should load analytics data
      await waitFor(() => {
        expect(mockStaffApi.getEmployeePerformance).toHaveBeenCalled();
        expect(mockStaffApi.getDepartmentPerformance).toHaveBeenCalled();
        expect(mockStaffApi.getPerformanceTrends).toHaveBeenCalled();
        expect(mockStaffApi.getTopPerformers).toHaveBeenCalled();
      });

      // Should display performance data
      expect(screen.getByText('Resumen de Rendimiento')).toBeInTheDocument();
    });

    it('should switch between performance tabs', async () => {
      const user = userEvent.setup();

      render(<PerformanceSection viewState={{}} onViewStateChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
      });

      // Click on departments tab
      await user.click(screen.getByTestId('tab-departments'));

      expect(screen.getByTestId('tab-content-departments')).toBeInTheDocument();
    });
  });

  describe('Management Section Integration', () => {
    it('should load labor cost data', async () => {
      render(
        <ManagementSection 
          viewState={{}} 
          onViewStateChange={() => {}} 
        />
      );

      // Click on labor costs tab
      const user = userEvent.setup();
      await user.click(screen.getByTestId('tab-labor-costs'));

      // Should load labor cost data
      await waitFor(() => {
        expect(mockStaffApi.calculateLaborCosts).toHaveBeenCalled();
        expect(mockStaffApi.getLaborCostSummary).toHaveBeenCalled();
        expect(mockStaffApi.getCostPerHourAnalysis).toHaveBeenCalled();
      });
    });

    it('should handle sensitive data visibility toggle', async () => {
      const user = userEvent.setup();

      render(
        <ManagementSection 
          viewState={{}} 
          onViewStateChange={() => {}} 
        />
      );

      // Initially sensitive data should be hidden
      expect(screen.getByText('$***,***')).toBeInTheDocument();

      // Toggle sensitive data visibility
      const toggleSwitch = screen.getByRole('switch');
      await user.click(toggleSwitch);

      // Sensitive data should now be visible
      expect(screen.getByText('$127,350')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      mockStaffApi.getEmployees.mockRejectedValue(new Error('Network error'));

      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar empleados/)).toBeInTheDocument();
      });

      // Should provide retry functionality
      const retryButton = screen.getByText('Reintentar');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle partial API failures', async () => {
      // Some APIs succeed, others fail
      mockStaffApi.getEmployees.mockResolvedValue(mockEmployees);
      mockStaffApi.getEmployeePerformance.mockRejectedValue(new Error('Performance API error'));

      render(<PerformanceSection viewState={{}} onViewStateChange={() => {}} />);

      // Should show error for failed API but continue with successful ones
      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos de rendimiento/)).toBeInTheDocument();
      });
    });

    it('should handle network timeouts', async () => {
      // Simulate timeout
      mockStaffApi.getEmployees.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText(/Request timeout/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should reflect store updates across components', async () => {
      const store = useStaffStore.getState();
      
      render(
        <div>
          <DirectorySection viewState={{}} onViewStateChange={() => {}} />
          <PerformanceSection viewState={{}} onViewStateChange={() => {}} />
        </div>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Simulate store update (e.g., from WebSocket)
      const newEmployee = {
        id: '3',
        name: 'Ana López',
        email: 'ana@example.com',
        department: 'Administración',
        position: 'Contadora',
        hourly_rate: 24.0,
        hire_date: '2024-01-01',
        status: 'active',
        skills: ['Contabilidad'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      // Update store directly (simulating real-time update)
      store.setState({
        staff: [...mockEmployees, newEmployee]
      });

      // Both components should reflect the update
      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance with large datasets', async () => {
      // Create large dataset
      const largeEmployeeSet = Array.from({ length: 500 }, (_, i) => ({
        id: `emp_${i}`,
        name: `Employee ${i}`,
        email: `emp${i}@example.com`,
        department: i % 2 === 0 ? 'Cocina' : 'Servicio',
        position: 'Worker',
        hourly_rate: 20.0,
        hire_date: '2023-01-01',
        status: 'active',
        skills: ['General'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }));

      mockStaffApi.getEmployees.mockResolvedValue(largeEmployeeSet);

      const startTime = performance.now();
      
      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Employee 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time even with large dataset
      expect(renderTime).toBeLessThan(2000); // 2 seconds max
    });

    it('should handle rapid state changes without memory leaks', async () => {
      const user = userEvent.setup();
      
      render(<DirectorySection viewState={{}} onViewStateChange={() => {}} />);

      // Rapid search changes
      const searchInput = screen.getByPlaceholderText(/buscar empleados/i);
      
      for (let i = 0; i < 10; i++) {
        await user.type(searchInput, `search${i}`);
        await user.clear(searchInput);
      }

      // Should not cause memory issues or performance degradation
      expect(screen.getByPlaceholderText(/buscar empleados/i)).toBeInTheDocument();
    });
  });
});