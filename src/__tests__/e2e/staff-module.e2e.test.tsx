/**
 * End-to-End Tests for Staff Module
 * Complete workflow validation from user perspective
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// Test utilities
import { renderWithProviders, mockSupabaseData, clearMockData } from '../utils/testUtils';
import { mockStaffData, mockScheduleData, mockTimeEntryData } from '../mocks/staffMockData';

// Components to test
import StaffPage from '@/pages/admin/resources/team/page';
import SchedulingPage from '@/pages/admin/resources/scheduling/page'; 
// Services
import { realTimeLaborCosts } from '../../../../services/staff/realTimeLaborCosts';
import { laborCostNotifications } from '../../../../services/staff/laborCostNotifications';

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/admin/staff', search: '' }),
    useParams: () => ({}),
  };
});

// Mock navigation context
vi.mock('../../../contexts/NavigationContext', () => ({
  useNavigation: () => ({
    currentModule: 'staff',
    setQuickActions: vi.fn(),
    quickActions: [],
  })
}));

describe('Staff Module E2E Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(async () => {
    // Initialize services
    await realTimeLaborCosts.startMonitoring();
    laborCostNotifications.initialize();
  });

  afterAll(() => {
    // Cleanup services
    realTimeLaborCosts.stopMonitoring();
    laborCostNotifications.destroy();
  });

  beforeEach(() => {
    user = userEvent.setup();
    
    // Setup mock data
    mockSupabaseData('employees', mockStaffData);
    mockSupabaseData('schedules', mockScheduleData);
    mockSupabaseData('time_entries', mockTimeEntryData);
    
    // Clear navigation mock
    mockNavigate.mockClear();
  });

  afterEach(() => {
    clearMockData();
    vi.clearAllMocks();
  });

  describe('Complete Employee Management Workflow', () => {
    it('should complete full CRUD workflow for employee management', async () => {
      renderWithProviders(<StaffPage />);

      // Step 1: Load staff directory and verify initial state
      await waitFor(() => {
        expect(screen.getByText('Directorio de Personal')).toBeInTheDocument();
      });

      // Verify employees are loaded
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('María García')).toBeInTheDocument();
      });

      // Step 2: Create new employee
      const addButton = screen.getByText('Agregar Empleado');
      await user.click(addButton);

      // Verify modal opens
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill employee form
      const nameInput = screen.getByLabelText(/nombre completo/i);
      const emailInput = screen.getByLabelText(/email/i);
      const departmentSelect = screen.getByLabelText(/departamento/i);
      const positionInput = screen.getByLabelText(/posición/i);
      const hourlyRateInput = screen.getByLabelText(/tarifa por hora/i);

      await user.type(nameInput, 'Carlos Rodríguez');
      await user.type(emailInput, 'carlos@restaurant.com');
      await user.selectOptions(departmentSelect, 'Cocina');
      await user.type(positionInput, 'Sous Chef');
      await user.type(hourlyRateInput, '22.50');

      // Submit form
      const submitButton = screen.getByText('Guardar Empleado');
      await user.click(submitButton);

      // Verify employee was created
      await waitFor(() => {
        expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
        expect(screen.getByText('Sous Chef')).toBeInTheDocument();
      });

      // Step 3: Edit employee
      const editButtons = screen.getAllByLabelText('Editar empleado');
      await user.click(editButtons[0]);

      // Update hourly rate
      const editHourlyRate = screen.getByDisplayValue('25.00');
      await user.clear(editHourlyRate);
      await user.type(editHourlyRate, '27.50');

      const updateButton = screen.getByText('Guardar Cambios');
      await user.click(updateButton);

      // Verify update
      await waitFor(() => {
        expect(screen.getByText('$27.50/hr')).toBeInTheDocument();
      });

      // Step 4: Search and filter
      const searchInput = screen.getByPlaceholderText(/buscar empleados/i);
      await user.type(searchInput, 'Carlos');

      await waitFor(() => {
        expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);

      // Filter by department
      const departmentFilter = screen.getByRole('combobox', { name: /departamento/i });
      await user.selectOptions(departmentFilter, 'Cocina');

      await waitFor(() => {
        expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
        expect(screen.queryByText('María García')).not.toBeInTheDocument(); // Service department
      });

      console.log('✅ Employee CRUD workflow completed successfully');
    });

    it('should handle performance analytics workflow', async () => {
      renderWithProviders(<StaffPage />);

      // Navigate to performance tab
      const performanceTab = screen.getByText('Rendimiento');
      await user.click(performanceTab);

      // Wait for performance data to load
      await waitFor(() => {
        expect(screen.getByText('Análisis de Rendimiento')).toBeInTheDocument();
      });

      // Check overview metrics
      expect(screen.getByText('Empleados Evaluados')).toBeInTheDocument();
      expect(screen.getByText('Puntuación Promedio')).toBeInTheDocument();

      // Switch to departments tab
      const departmentsTab = screen.getByTestId('tab-departments');
      await user.click(departmentsTab);

      // Verify department performance data
      await waitFor(() => {
        expect(screen.getByText('Rendimiento por Departamento')).toBeInTheDocument();
      });

      // Switch to trends tab
      const trendsTab = screen.getByTestId('tab-trends');
      await user.click(trendsTab);

      // Verify trends data
      await waitFor(() => {
        expect(screen.getByText('Tendencias de Rendimiento')).toBeInTheDocument();
      });

      console.log('✅ Performance analytics workflow completed successfully');
    });

    it('should manage labor cost calculations', async () => {
      renderWithProviders(<StaffPage />);

      // Navigate to management tab
      const managementTab = screen.getByText('Gestión');
      await user.click(managementTab);

      // Click on labor costs tab
      const laborCostsTab = screen.getByTestId('tab-labor-costs');
      await user.click(laborCostsTab);

      // Wait for labor cost dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Panel de Costos Laborales')).toBeInTheDocument();
      });

      // Verify cost overview
      expect(screen.getByText(/costo total/i)).toBeInTheDocument();
      expect(screen.getByText(/horas totales/i)).toBeInTheDocument();

      // Switch to employees tab in labor costs
      const employeesTab = screen.getByTestId('tab-employees');
      await user.click(employeesTab);

      // Verify employee cost breakdown
      await waitFor(() => {
        expect(screen.getByText('Costos por Empleado')).toBeInTheDocument();
      });

      // Test date range filter
      const startDateInput = screen.getByLabelText(/fecha inicio/i);
      const endDateInput = screen.getByLabelText(/fecha fin/i);

      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-01');
      
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-07');

      // Verify data updates
      await waitFor(() => {
        expect(screen.getByText('Semana del 1 al 7 de enero')).toBeInTheDocument();
      });

      console.log('✅ Labor cost management workflow completed successfully');
    });
  });

  describe('Real-time Integration Workflow', () => {
    it('should integrate real-time costs with scheduling', async () => {
      renderWithProviders(<SchedulingPage />);

      // Wait for scheduling page to load
      await waitFor(() => {
        expect(screen.getByText('Staff Scheduling')).toBeInTheDocument();
      });

      // Navigate to real-time tab
      const realTimeTab = screen.getByText('Real-Time');
      await user.click(realTimeTab);

      // Verify real-time monitoring starts
      await waitFor(() => {
        expect(screen.getByText('Costos Laborales en Tiempo Real')).toBeInTheDocument();
        expect(screen.getByText('Monitoreando')).toBeInTheDocument();
      });

      // Check live metrics
      expect(screen.getByText('Costo Actual')).toBeInTheDocument();
      expect(screen.getByText('Proyectado')).toBeInTheDocument();
      expect(screen.getByText('Activos')).toBeInTheDocument();
      expect(screen.getByText('En Overtime')).toBeInTheDocument();

      // Test manual refresh
      const refreshButton = screen.getByText('Actualizar');
      await user.click(refreshButton);

      // Verify refresh indicator
      await waitFor(() => {
        expect(screen.getByText('Actualizando...')).toBeInTheDocument();
      });

      // Switch to employees tab
      const employeesTab = screen.getByText('Empleados');
      await user.click(employeesTab);

      // Verify real-time employee data
      await waitFor(() => {
        expect(screen.getByText('Estado de Empleados')).toBeInTheDocument();
      });

      // Test pause/resume monitoring
      const pauseButton = screen.getByText('Pausar');
      await user.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByText('Pausado')).toBeInTheDocument();
      });

      const startButton = screen.getByText('Iniciar');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Monitoreando')).toBeInTheDocument();
      });

      console.log('✅ Real-time integration workflow completed successfully');
    });

    it('should handle overtime alerts and notifications', async () => {
      // Simulate real-time data update with overtime
      act(() => {
        realTimeLaborCosts.forceUpdate();
      });

      renderWithProviders(<SchedulingPage />);

      // Navigate to real-time tab
      const realTimeTab = await screen.findByText('Real-Time');
      await user.click(realTimeTab);

      // Check for overtime alert
      await waitFor(() => {
        expect(screen.getByText(/overtime/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Navigate to alerts tab
      const alertsTab = screen.getByText('Alertas');
      await user.click(alertsTab);

      // Verify overtime alert is displayed
      await waitFor(() => {
        expect(screen.getByText('Alertas Activas')).toBeInTheDocument();
      });

      console.log('✅ Overtime alerts workflow completed successfully');
    });
  });

  describe('Cross-Module Integration', () => {
    it('should integrate staff data with scheduling seamlessly', async () => {
      // Start with staff page
      const { rerender } = renderWithProviders(<StaffPage />);

      // Verify staff data loads
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Switch to scheduling page
      rerender(renderWithProviders(<SchedulingPage />)[0]);

      // Verify staff data is available in scheduling
      await waitFor(() => {
        expect(screen.getByText('Staff Scheduling')).toBeInTheDocument();
      });

      // Navigate to costs tab in scheduling
      const costsTab = screen.getByText('Labor Costs');
      await user.click(costsTab);

      // Verify staff cost data is integrated
      await waitFor(() => {
        expect(screen.getByText(/nómina total/i)).toBeInTheDocument();
      });

      console.log('✅ Cross-module integration completed successfully');
    });

    it('should maintain data consistency across components', async () => {
      renderWithProviders(<StaffPage />);

      // Load initial data in directory
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Switch to performance tab
      const performanceTab = screen.getByText('Rendimiento');
      await user.click(performanceTab);

      // Verify same employee data is available
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Switch to management tab
      const managementTab = screen.getByText('Gestión');
      await user.click(managementTab);

      // Navigate to labor costs
      const laborCostsTab = screen.getByTestId('tab-labor-costs');
      await user.click(laborCostsTab);

      // Verify employee cost data consistency
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      console.log('✅ Data consistency validation completed successfully');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API failures gracefully', async () => {
      // Mock API failure
      vi.mocked(mockSupabaseData).mockImplementation(() => {
        throw new Error('Network error');
      });

      renderWithProviders(<StaffPage />);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Verify retry functionality
      const retryButton = screen.getByText('Reintentar');
      expect(retryButton).toBeInTheDocument();

      // Test retry
      await user.click(retryButton);

      console.log('✅ Error handling validation completed successfully');
    });

    it('should handle empty data states', async () => {
      // Mock empty data
      mockSupabaseData('employees', []);

      renderWithProviders(<StaffPage />);

      // Verify empty state
      await waitFor(() => {
        expect(screen.getByText(/no hay empleados/i)).toBeInTheDocument();
      });

      // Verify add employee option is available
      expect(screen.getByText('Agregar Empleado')).toBeInTheDocument();

      console.log('✅ Empty state handling completed successfully');
    });

    it('should handle concurrent operations without conflicts', async () => {
      renderWithProviders(<StaffPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Start multiple operations simultaneously
      const editButtons = screen.getAllByLabelText('Editar empleado');
      
      // Click multiple edit buttons quickly
      await user.click(editButtons[0]);
      await user.click(editButtons[1]);

      // Only one modal should be open
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);

      console.log('✅ Concurrent operations handling completed successfully');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeStaffData = Array.from({ length: 500 }, (_, i) => ({
        id: `emp_${i}`,
        name: `Employee ${i}`,
        email: `emp${i}@company.com`,
        department: i % 3 === 0 ? 'Cocina' : i % 2 === 0 ? 'Servicio' : 'Administración',
        position: 'Worker',
        hourly_rate: 20 + (i % 10),
        status: 'active'
      }));

      mockSupabaseData('employees', largeStaffData);

      const startTime = performance.now();
      renderWithProviders(<StaffPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Employee 0')).toBeInTheDocument();
      }, { timeout: 10000 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(5000); // 5 seconds max

      // Test search performance with large dataset
      const searchInput = screen.getByPlaceholderText(/buscar empleados/i);
      const searchStart = performance.now();
      
      await user.type(searchInput, 'Employee 50');
      
      await waitFor(() => {
        expect(screen.getByText('Employee 50')).toBeInTheDocument();
      });

      const searchEnd = performance.now();
      const searchTime = searchEnd - searchStart;

      // Search should be fast even with large dataset
      expect(searchTime).toBeLessThan(1000); // 1 second max

      console.log('✅ Large dataset performance validation completed successfully');
    });

    it('should manage memory usage effectively', async () => {
      const { unmount } = renderWithProviders(<StaffPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Measure initial memory
      const performanceWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } };
      const initialMemory = performanceWithMemory.memory?.usedJSHeapSize || 0;

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const performanceTab = screen.getByText('Rendimiento');
        await user.click(performanceTab);
        
        const directoryTab = screen.getByText('Directorio');
        await user.click(directoryTab);
      }

      // Unmount component
      unmount();

      // Check memory didn't grow excessively
      const finalMemory = performanceWithMemory.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);

      console.log('✅ Memory management validation completed successfully');
    });
  });

  describe('User Experience Validation', () => {
    it('should provide smooth navigation between modules', async () => {
      renderWithProviders(<StaffPage />);

      // Test tab switching speed
      const tabs = ['Directorio', 'Rendimiento', 'Gestión'];
      
      for (const tabName of tabs) {
        const startTime = performance.now();
        
        const tab = screen.getByText(tabName);
        await user.click(tab);
        
        await waitFor(() => {
          expect(tab).toHaveAttribute('data-selected', 'true');
        });
        
        const endTime = performance.now();
        const switchTime = endTime - startTime;
        
        // Tab switching should be immediate
        expect(switchTime).toBeLessThan(500); // 0.5 seconds max
      }

      console.log('✅ Navigation performance validation completed successfully');
    });

    it('should maintain responsive design patterns', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      renderWithProviders(<StaffPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Verify mobile-friendly layout
      const mobileElements = screen.getAllByText('Empleados');
      expect(mobileElements.length).toBeGreaterThan(0);

      console.log('✅ Responsive design validation completed successfully');
    });
  });
});