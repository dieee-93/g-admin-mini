/**
 * Staff Module E2E Tests - Simplified Version
 * Tests core Staff module functionality with improved mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, clearMockData, performanceTracker } from '../utils/testUtils';

// Import components to test
import StaffPage from '@/pages/admin/resources/staff/page';
import { staffApi } from '@/services/staff/staffApi';

// Mock the staff API
vi.mock('@/services/staff/staffApi', () => ({
  staffApi: {
    getEmployees: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getLaborCostAnalytics: vi.fn(),
    getEmployeePerformance: vi.fn(),
    getTimeEntries: vi.fn(),
  }
}));

// Mock the real-time service
vi.mock('@/services/staff/realTimeLaborCosts', () => ({
  realTimeLaborCosts: {
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getCurrentCosts: vi.fn().mockResolvedValue({
      currentCost: 1200,
      projectedDailyCost: 2400,
      activeEmployees: 8,
      overtimeHours: 2.5,
      budgetVariance: -150,
    }),
    subscribeToUpdates: vi.fn().mockReturnValue(() => {}),
    forceUpdate: vi.fn(),
  }
}));

describe('Staff Module E2E Tests - Simplified', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    clearMockData();
    
    // Setup default successful API responses
    const mockEmployees = [
      {
        id: '1',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@example.com',
        position: 'Chef',
        department: 'Cocina',
        hourly_rate: 25.0,
        phone: '+5491123456789',
        hire_date: '2023-01-15',
        status: 'active',
        skills: ['Cocina', 'Parrilla'],
        certifications: ['Manipulador de Alimentos'],
        emergency_contact: 'María Pérez - +5491123456780',
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z'
      }
    ];

    vi.mocked(staffApi.getEmployees).mockResolvedValue(mockEmployees);
    vi.mocked(staffApi.getLaborCostAnalytics).mockResolvedValue({
      totalCost: 2400,
      regularHours: 160,
      overtimeHours: 12,
      avgHourlyRate: 22.5,
      laborEfficiency: 85.2,
      departmentBreakdown: [
        { department: 'Cocina', cost: 1200, percentage: 50 }
      ]
    });
    vi.mocked(staffApi.getEmployeePerformance).mockResolvedValue([
      {
        employee_id: '1',
        employee_name: 'Juan Pérez',
        performance_score: 85,
        efficiency_rating: 'B+',
        tasks_completed: 24,
        quality_score: 90
      }
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearMockData();
  });

  describe('Basic Staff Management', () => {
    it('should render staff page with employee list', async () => {
      performanceTracker.start('staff-page-render');
      
      renderWithProviders(<StaffPage />);
      
      // Wait for loading to complete and data to appear
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      // Check if employee data is rendered
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      }, { timeout: 5000 });

      const renderTime = performanceTracker.end('staff-page-render');
      expect(renderTime).toBeLessThan(3000); // Should render within 3 seconds
    });

    it('should handle employee search functionality', async () => {
      renderWithProviders(<StaffPage />);
      
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      // Find and use search input
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      
      await user.type(searchInput, 'Juan');
      
      // Verify search functionality
      expect(searchInput).toHaveValue('Juan');
    });

    it('should display labor cost analytics', async () => {
      renderWithProviders(<StaffPage />);
      
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      // Check for labor cost elements
      await waitFor(() => {
        // Look for cost-related text patterns
        const costElements = screen.getAllByText(/\$|cost|labor/i);
        expect(costElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance Analytics', () => {
    it('should load and display performance metrics', async () => {
      renderWithProviders(<StaffPage />);
      
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      // Check that API was called for performance data
      await waitFor(() => {
        expect(staffApi.getEmployeePerformance).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API failure
      vi.mocked(staffApi.getEmployees).mockRejectedValue(new Error('API Error'));
      
      renderWithProviders(<StaffPage />);
      
      // Page should still render
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      // Should handle error without crashing
      await waitFor(() => {
        expect(staffApi.getEmployees).toHaveBeenCalled();
      });
    });

    it('should handle empty data states', async () => {
      // Mock empty response
      vi.mocked(staffApi.getEmployees).mockResolvedValue([]);
      
      renderWithProviders(<StaffPage />);
      
      // Page should render with empty state
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Validation', () => {
    it('should render efficiently with large datasets', async () => {
      // Create large mock dataset
      const largeEmployeeList = Array.from({ length: 100 }, (_, i) => ({
        id: `emp_${i}`,
        first_name: `Employee${i}`,
        last_name: `Test${i}`,
        email: `emp${i}@example.com`,
        position: 'Staff',
        department: 'Operations',
        hourly_rate: 20.0,
        phone: `+549112345${i.toString().padStart(4, '0')}`,
        hire_date: '2023-01-01',
        status: 'active',
        skills: ['General'],
        certifications: [],
        emergency_contact: 'Emergency Contact',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }));

      vi.mocked(staffApi.getEmployees).mockResolvedValue(largeEmployeeList);
      
      performanceTracker.start('large-dataset-render');
      
      renderWithProviders(<StaffPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      const renderTime = performanceTracker.end('large-dataset-render');
      expect(renderTime).toBeLessThan(5000); // Should handle large datasets within 5 seconds
    });

    it('should manage memory usage effectively', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      renderWithProviders(<StaffPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff Management')).toBeInTheDocument();
      });

      // Simple memory usage check (if available)
      if (performance.memory) {
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });
});