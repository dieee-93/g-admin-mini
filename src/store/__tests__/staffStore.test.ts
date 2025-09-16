/**
 * Unit Tests for Staff Store (Zustand)
 * Tests state management, actions, and computed properties
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStaffStore } from '../staffStore';
import type { Employee, Schedule, TimeEntry } from '../staffStore';

// Mock the staff API
const mockStaffApi = {
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
  getSchedules: vi.fn(),
  createSchedule: vi.fn(),
  getTimeEntries: vi.fn(),
  createTimeEntry: vi.fn(),
};

vi.mock('../../services/staff/staffApi', () => mockStaffApi);

describe('Staff Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useStaffStore.setState({
        staff: [],
        schedules: [],
        timeEntries: [],
        loading: false,
        error: null,
      });
    });
    
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useStaffStore());

      expect(result.current.staff).toEqual([]);
      expect(result.current.schedules).toEqual([]);
      expect(result.current.timeEntries).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should provide all required actions', () => {
      const { result } = renderHook(() => useStaffStore());

      expect(typeof result.current.loadStaff).toBe('function');
      expect(typeof result.current.addEmployee).toBe('function');
      expect(typeof result.current.updateEmployee).toBe('function');
      expect(typeof result.current.deleteEmployee).toBe('function');
      expect(typeof result.current.loadSchedules).toBe('function');
      expect(typeof result.current.addSchedule).toBe('function');
      expect(typeof result.current.loadTimeEntries).toBe('function');
      expect(typeof result.current.addTimeEntry).toBe('function');
      expect(typeof result.current.getStaffStats).toBe('function');
    });
  });

  describe('Staff Management', () => {
    const mockEmployee: Employee = {
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
    };

    it('should load staff successfully', async () => {
      mockStaffApi.getEmployees.mockResolvedValueOnce([mockEmployee]);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.loadStaff();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.staff).toEqual([mockEmployee]);
      expect(mockStaffApi.getEmployees).toHaveBeenCalledOnce();
    });

    it('should handle loading state during staff fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockStaffApi.getEmployees.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useStaffStore());

      act(() => {
        result.current.loadStaff();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      await act(async () => {
        resolvePromise([mockEmployee]);
        await promise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.staff).toEqual([mockEmployee]);
    });

    it('should handle errors during staff fetch', async () => {
      const errorMessage = 'Failed to load staff';
      mockStaffApi.getEmployees.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.loadStaff();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.staff).toEqual([]);
    });

    it('should add employee successfully', async () => {
      const newEmployeeData = {
        name: 'María García',
        email: 'maria@example.com',
        department: 'Servicio',
        position: 'Mesera',
        hourly_rate: 18.0,
        hire_date: '2024-01-01',
        skills: ['Servicio al cliente']
      };

      const createdEmployee = { id: '2', ...newEmployeeData };
      mockStaffApi.createEmployee.mockResolvedValueOnce(createdEmployee);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.addEmployee(newEmployeeData);
      });

      expect(result.current.staff).toContainEqual(createdEmployee);
      expect(mockStaffApi.createEmployee).toHaveBeenCalledWith(newEmployeeData);
    });

    it('should update employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, hourly_rate: 30.0 };
      mockStaffApi.updateEmployee.mockResolvedValueOnce(updatedEmployee);

      const { result } = renderHook(() => useStaffStore());

      // Set initial state with employee
      act(() => {
        result.current.setState({ staff: [mockEmployee] });
      });

      await act(async () => {
        await result.current.updateEmployee('1', { hourly_rate: 30.0 });
      });

      expect(result.current.staff[0]).toEqual(updatedEmployee);
      expect(mockStaffApi.updateEmployee).toHaveBeenCalledWith('1', { hourly_rate: 30.0 });
    });

    it('should delete employee successfully', async () => {
      mockStaffApi.deleteEmployee.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useStaffStore());

      // Set initial state with employee
      act(() => {
        result.current.setState({ staff: [mockEmployee] });
      });

      await act(async () => {
        await result.current.deleteEmployee('1');
      });

      expect(result.current.staff).toEqual([]);
      expect(mockStaffApi.deleteEmployee).toHaveBeenCalledWith('1');
    });

    it('should handle optimistic updates correctly', async () => {
      const newEmployeeData = { name: 'Test Employee' };
      
      // Make API call take time
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockStaffApi.createEmployee.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useStaffStore());

      act(() => {
        result.current.addEmployee(newEmployeeData);
      });

      // Should show loading state
      expect(result.current.loading).toBe(true);

      const createdEmployee = { id: '123', ...newEmployeeData };
      await act(async () => {
        resolvePromise(createdEmployee);
        await promise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.staff).toContainEqual(createdEmployee);
    });
  });

  describe('Schedule Management', () => {
    const mockSchedule: Schedule = {
      id: '1',
      employee_id: '1',
      start_time: '2024-01-08T09:00:00Z',
      end_time: '2024-01-08T17:00:00Z',
      break_minutes: 60,
      status: 'scheduled',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('should load schedules successfully', async () => {
      mockStaffApi.getSchedules.mockResolvedValueOnce([mockSchedule]);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.loadSchedules('2024-01-08', '2024-01-08');
      });

      expect(result.current.schedules).toEqual([mockSchedule]);
      expect(mockStaffApi.getSchedules).toHaveBeenCalledWith('2024-01-08', '2024-01-08');
    });

    it('should add schedule successfully', async () => {
      const newScheduleData = {
        employee_id: '1',
        start_time: '2024-01-08T09:00:00Z',
        end_time: '2024-01-08T17:00:00Z',
        break_minutes: 60
      };

      const createdSchedule = { id: '2', ...newScheduleData };
      mockStaffApi.createSchedule.mockResolvedValueOnce(createdSchedule);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.addSchedule(newScheduleData);
      });

      expect(result.current.schedules).toContainEqual(createdSchedule);
      expect(mockStaffApi.createSchedule).toHaveBeenCalledWith(newScheduleData);
    });
  });

  describe('Time Entry Management', () => {
    const mockTimeEntry: TimeEntry = {
      id: '1',
      employee_id: '1',
      clock_in: '2024-01-08T09:00:00Z',
      clock_out: '2024-01-08T17:00:00Z',
      break_minutes: 60,
      total_hours: 7.0,
      created_at: '2024-01-08T09:00:00Z',
      updated_at: '2024-01-08T17:00:00Z'
    };

    it('should load time entries successfully', async () => {
      mockStaffApi.getTimeEntries.mockResolvedValueOnce([mockTimeEntry]);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.loadTimeEntries('2024-01-08', '2024-01-08');
      });

      expect(result.current.timeEntries).toEqual([mockTimeEntry]);
      expect(mockStaffApi.getTimeEntries).toHaveBeenCalledWith('2024-01-08', '2024-01-08');
    });

    it('should add time entry successfully', async () => {
      const newTimeEntryData = {
        employee_id: '1',
        clock_in: '2024-01-08T09:00:00Z',
        clock_out: '2024-01-08T17:00:00Z',
        break_minutes: 60,
        total_hours: 7.0
      };

      const createdTimeEntry = { id: '2', ...newTimeEntryData };
      mockStaffApi.createTimeEntry.mockResolvedValueOnce(createdTimeEntry);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.addTimeEntry(newTimeEntryData);
      });

      expect(result.current.timeEntries).toContainEqual(createdTimeEntry);
      expect(mockStaffApi.createTimeEntry).toHaveBeenCalledWith(newTimeEntryData);
    });
  });

  describe('Staff Statistics', () => {
    it('should calculate correct stats for empty staff', () => {
      const { result } = renderHook(() => useStaffStore());

      const stats = result.current.getStaffStats();

      expect(stats).toEqual({
        totalEmployees: 0,
        activeEmployees: 0,
        onDuty: 0,
        avgRating: 0
      });
    });

    it('should calculate correct stats for staff with data', () => {
      const mockStaff: Employee[] = [
        {
          id: '1',
          name: 'Employee 1',
          status: 'active',
          department: 'Cocina',
          performance_rating: 4.5
        } as Employee,
        {
          id: '2',
          name: 'Employee 2',
          status: 'active',
          department: 'Servicio',
          performance_rating: 3.8
        } as Employee,
        {
          id: '3',
          name: 'Employee 3',
          status: 'inactive',
          department: 'Cocina',
          performance_rating: 4.2
        } as Employee
      ];

      const { result } = renderHook(() => useStaffStore());

      act(() => {
        result.current.setState({ staff: mockStaff });
      });

      const stats = result.current.getStaffStats();

      expect(stats.totalEmployees).toBe(3);
      expect(stats.activeEmployees).toBe(2);
      expect(stats.avgRating).toBe(4.17); // (4.5 + 3.8 + 4.2) / 3 = 4.17 (rounded)
    });

    it('should calculate on-duty count based on current time entries', () => {
      const now = new Date();
      const mockTimeEntries: TimeEntry[] = [
        {
          id: '1',
          employee_id: '1',
          clock_in: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          clock_out: null, // Still clocked in
          total_hours: 0,
          created_at: '',
          updated_at: ''
        } as TimeEntry,
        {
          id: '2',
          employee_id: '2',
          clock_in: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          clock_out: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago (clocked out)
          total_hours: 0.5,
          created_at: '',
          updated_at: ''
        } as TimeEntry
      ];

      const { result } = renderHook(() => useStaffStore());

      act(() => {
        result.current.setState({ 
          timeEntries: mockTimeEntries,
          staff: [{ id: '1' }, { id: '2' }] as Employee[]
        });
      });

      const stats = result.current.getStaffStats();

      expect(stats.onDuty).toBe(1); // Only employee 1 is still clocked in
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockStaffApi.getEmployees.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useStaffStore());

      await act(async () => {
        await result.current.loadStaff();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
      expect(result.current.staff).toEqual([]);
    });

    it('should clear previous errors on successful operations', async () => {
      const { result } = renderHook(() => useStaffStore());

      // Set an error
      act(() => {
        result.current.setState({ error: 'Previous error' });
      });

      expect(result.current.error).toBe('Previous error');

      // Successful operation should clear error
      mockStaffApi.getEmployees.mockResolvedValueOnce([]);

      await act(async () => {
        await result.current.loadStaff();
      });

      expect(result.current.error).toBe(null);
    });
  });
});