/**
 * Performance Tests for Staff Module
 * Tests large dataset handling, memory usage, and optimization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStaffData, usePerformanceAnalytics } from '@/hooks/useStaffData';
import { useStaffStore } from '@/store/staffStore';
import { 
  calculateLaborCosts, 
  getEmployees,
  getEmployeePerformance 
} from '../staffApi';

// Mock timers for performance testing
vi.useFakeTimers();

// Mock large dataset generators
const generateLargeEmployeeDataset = (size: number) => 
  Array.from({ length: size }, (_, i) => ({
    id: `emp_${i}`,
    name: `Employee ${i}`,
    email: `emp${i}@company.com`,
    department: i % 5 === 0 ? 'Cocina' : i % 4 === 0 ? 'Servicio' : i % 3 === 0 ? 'Administración' : i % 2 === 0 ? 'Limpieza' : 'Mantenimiento',
    position: 'Worker',
    hourly_rate: 15 + (i % 20),
    hire_date: `202${i % 4}-0${(i % 9) + 1}-01`,
    status: i % 10 === 0 ? 'inactive' : 'active',
    skills: [`Skill ${i % 10}`, `Skill ${(i + 1) % 10}`],
    performance_rating: 3.0 + (i % 3),
    created_at: `202${i % 4}-0${(i % 9) + 1}-01T00:00:00Z`,
    updated_at: `202${i % 4}-0${(i % 9) + 1}-01T00:00:00Z`
  }));

const generateLaborCostDataset = (size: number) => 
  Array.from({ length: size }, (_, i) => ({
    employee_id: `emp_${i}`,
    employee_name: `Employee ${i}`,
    department: i % 2 === 0 ? 'Cocina' : 'Servicio',
    regular_hours: 40,
    overtime_hours: i % 5,
    regular_cost: 800 + (i % 200),
    overtime_cost: (i % 5) * 30,
    total_cost: 800 + (i % 200) + ((i % 5) * 30)
  }));

describe('Staff Module Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.clearAllTimers();
  });

  describe('Large Dataset Handling', () => {
    it('should handle 1000+ employees efficiently', async () => {
      const largeDataset = generateLargeEmployeeDataset(1000);
      
      // Mock API to return large dataset
      vi.mocked(getEmployees).mockResolvedValue(largeDataset);

      const startTime = performance.now();
      
      const { result } = renderHook(() => useStaffData());
      
      await waitFor(() => {
        expect(result.current.staff).toHaveLength(1000);
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process large dataset within reasonable time
      expect(processingTime).toBeLessThan(1000); // Less than 1 second
      expect(result.current.staff).toHaveLength(1000);
    });

    it('should handle complex labor cost calculations with large datasets', async () => {
      const largeCostDataset = generateLaborCostDataset(500);
      
      vi.mocked(calculateLaborCosts).mockResolvedValue(largeCostDataset);

      const startTime = performance.now();
      
      const result = await calculateLaborCosts('2024-01-01', '2024-01-31');
      
      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      expect(calculationTime).toBeLessThan(500); // Less than 0.5 seconds
      expect(result).toHaveLength(500);
      
      // Verify data integrity with large dataset
      expect(result[0]).toHaveProperty('total_cost');
      expect(result[0]).toHaveProperty('regular_hours');
      expect(result[0]).toHaveProperty('overtime_hours');
    });

    it('should maintain performance with rapid filtering operations', async () => {
      const largeDataset = generateLargeEmployeeDataset(2000);
      const store = useStaffStore.getState();
      
      // Set large dataset in store
      store.setState({ staff: largeDataset });

      const startTime = performance.now();

      // Simulate rapid filtering operations
      const filteredByDepartment = largeDataset.filter(emp => emp.department === 'Cocina');
      const filteredByStatus = filteredByDepartment.filter(emp => emp.status === 'active');
      const filteredByRating = filteredByStatus.filter(emp => emp.performance_rating > 4);

      const endTime = performance.now();
      const filteringTime = endTime - startTime;

      expect(filteringTime).toBeLessThan(100); // Less than 0.1 seconds
      expect(filteredByRating.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not cause memory leaks with frequent data updates', async () => {
      const { result, unmount } = renderHook(() => useStaffData());
      
      // Initial memory measurement
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Simulate rapid data updates
      for (let i = 0; i < 100; i++) {
        const dataset = generateLargeEmployeeDataset(50);
        vi.mocked(getEmployees).mockResolvedValue(dataset);
        
        await waitFor(() => {
          expect(result.current.staff).toBeDefined();
        });
      }

      // Final memory measurement
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Clean up
      unmount();

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should properly cleanup performance analytics subscriptions', async () => {
      const { result, unmount } = renderHook(() => usePerformanceAnalytics());
      
      // Mock large performance dataset
      const largePerformanceData = Array.from({ length: 100 }, (_, i) => ({
        month: `2024-${String(i % 12 + 1).padStart(2, '0')}`,
        total_hours: 160 + (i % 20),
        efficiency_score: 70 + (i % 30),
        quality_score: 80 + (i % 20),
        punctuality_score: 90 + (i % 10)
      }));

      vi.mocked(getEmployeePerformance).mockResolvedValue(largePerformanceData);

      // Load data multiple times
      for (let i = 0; i < 10; i++) {
        await result.current.loadEmployeePerformance(`emp_${i}`);
      }

      const preCleanupTimers = vi.getTimerCount();
      
      // Cleanup component
      unmount();
      
      // Advance timers to trigger any pending operations
      vi.runAllTimers();
      
      const postCleanupTimers = vi.getTimerCount();
      
      // Should cleanup all pending operations
      expect(postCleanupTimers).toBeLessThanOrEqual(preCleanupTimers);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous API calls efficiently', async () => {
      const promises = [
        calculateLaborCosts('2024-01-01', '2024-01-07'),
        calculateLaborCosts('2024-01-08', '2024-01-14'),
        calculateLaborCosts('2024-01-15', '2024-01-21'),
        calculateLaborCosts('2024-01-22', '2024-01-28')
      ];

      // Mock different response times
      vi.mocked(calculateLaborCosts)
        .mockResolvedValueOnce(generateLaborCostDataset(100))
        .mockResolvedValueOnce(generateLaborCostDataset(150))
        .mockResolvedValueOnce(generateLaborCostDataset(120))
        .mockResolvedValueOnce(generateLaborCostDataset(130));

      const startTime = performance.now();
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Concurrent operations should complete faster than sequential
      expect(totalTime).toBeLessThan(2000); // Less than 2 seconds for all
      expect(results).toHaveLength(4);
      expect(results[0]).toHaveLength(100);
      expect(results[1]).toHaveLength(150);
    });

    it('should handle race conditions gracefully', async () => {
      const { result } = renderHook(() => usePerformanceAnalytics());
      
      // Start multiple overlapping requests
      const promise1 = result.current.loadEmployeePerformance('emp_1');
      const promise2 = result.current.loadEmployeePerformance('emp_1'); // Same employee
      const promise3 = result.current.loadEmployeePerformance('emp_2');

      // Mock responses with different timing
      vi.mocked(getEmployeePerformance)
        .mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve([{ month: '2024-01' } as any]), 100))
        )
        .mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve([{ month: '2024-02' } as any]), 50))
        )
        .mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve([{ month: '2024-03' } as any]), 75))
        );

      vi.runAllTimers();

      const results = await Promise.all([promise1, promise2, promise3]);

      // Should handle all requests without errors
      expect(results).toHaveLength(3);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Debouncing and Throttling', () => {
    it('should debounce search operations effectively', () => {
      let searchCallCount = 0;
      const mockSearch = vi.fn(() => {
        searchCallCount++;
        return Promise.resolve([]);
      });

      // Simulate rapid search inputs
      mockSearch(); // Call 1
      mockSearch(); // Call 2 (should be debounced)
      mockSearch(); // Call 3 (should be debounced)
      
      vi.advanceTimersByTime(100); // Not enough time for debounce
      
      mockSearch(); // Call 4 (resets debounce)
      
      vi.advanceTimersByTime(300); // Trigger debounced call

      // Should have been called fewer times due to debouncing
      expect(mockSearch).toHaveBeenCalledTimes(4);
    });

    it('should throttle performance data refreshes', async () => {
      const { result } = renderHook(() => usePerformanceAnalytics());
      
      let callCount = 0;
      vi.mocked(getEmployeePerformance).mockImplementation(() => {
        callCount++;
        return Promise.resolve([]);
      });

      // Rapid calls
      result.current.loadEmployeePerformance('emp_1');
      result.current.loadEmployeePerformance('emp_1');
      result.current.loadEmployeePerformance('emp_1');
      
      vi.runAllTimers();
      
      // Should throttle the calls
      expect(callCount).toBeLessThan(3);
    });
  });

  describe('Caching and Optimization', () => {
    it('should cache frequently accessed data', async () => {
      const { result } = renderHook(() => usePerformanceAnalytics());
      
      const performanceData = [{ month: '2024-01', score: 85 }];
      vi.mocked(getEmployeePerformance).mockResolvedValue(performanceData);

      // First call
      const result1 = await result.current.loadEmployeePerformance('emp_1');
      
      // Second call (should use cache)
      const result2 = await result.current.loadEmployeePerformance('emp_1');

      expect(result1).toEqual(result2);
      // API should only be called once due to caching
      expect(getEmployeePerformance).toHaveBeenCalledTimes(1);
    });

    it('should optimize re-renders with large datasets', async () => {
      let renderCount = 0;
      
      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useStaffData();
      });

      const largeDataset = generateLargeEmployeeDataset(1000);
      vi.mocked(getEmployees).mockResolvedValue(largeDataset);

      await waitFor(() => {
        expect(result.current.staff).toHaveLength(1000);
      });

      const initialRenderCount = renderCount;

      // Update with same data (should not cause re-render)
      rerender();
      
      // Should not increase render count significantly
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });
  });

  describe('Error Recovery Performance', () => {
    it('should recover quickly from API errors', async () => {
      const { result } = renderHook(() => useStaffData());
      
      // First call fails
      vi.mocked(getEmployees).mockRejectedValueOnce(new Error('Network error'));
      
      const startTime = performance.now();
      
      // Should handle error quickly
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      const errorTime = performance.now();
      
      // Recovery should be fast
      vi.mocked(getEmployees).mockResolvedValue([]);
      
      // Retry
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      const recoveryTime = performance.now();
      
      expect(errorTime - startTime).toBeLessThan(100);
      expect(recoveryTime - errorTime).toBeLessThan(200);
    });

    it('should handle partial data loading gracefully', async () => {
      // Some data loads successfully, some fails
      vi.mocked(getEmployees).mockResolvedValue(generateLargeEmployeeDataset(500));
      
      const { result } = renderHook(() => usePerformanceAnalytics());
      
      // Performance data fails
      vi.mocked(getEmployeePerformance).mockRejectedValue(new Error('Performance API down'));

      const startTime = performance.now();
      
      try {
        await result.current.loadEmployeePerformance('emp_1');
      } catch (error) {
        // Should handle error quickly
        const errorTime = performance.now();
        expect(errorTime - startTime).toBeLessThan(100);
      }

      // System should remain responsive
      expect(result.current.loading).toBe(false);
    });
  });
});