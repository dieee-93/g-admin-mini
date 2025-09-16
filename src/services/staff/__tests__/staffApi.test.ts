/**
 * Unit Tests for Staff API
 * Tests all CRUD operations, performance analytics, and labor cost calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Employee, Schedule, TimeEntry } from '../../../store/staffStore';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getSchedules,
  createSchedule,
  getTimeEntries,
  createTimeEntry,
  getEmployeePerformance,
  getDepartmentPerformance,
  getPerformanceTrends,
  getTopPerformers,
  calculateLaborCosts,
  getLaborCostSummary,
  getCostPerHourAnalysis
} from '../staffApi';

// Mock supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    then: vi.fn((callback) => callback({ data: [], error: null }))
  })),
  rpc: vi.fn().mockResolvedValue({ data: [], error: null })
};

vi.mock('../../../lib/supabase/client', () => ({ supabase: mockSupabase }));

describe('Staff API - CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Employee Management', () => {
    it('should fetch employees successfully', async () => {
      const mockEmployees: Employee[] = [
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
        }
      ];

      mockSupabase.from().then.mockImplementationOnce((callback) => 
        callback({ data: mockEmployees, error: null })
      );

      const result = await getEmployees();

      expect(mockSupabase.from).toHaveBeenCalledWith('employees');
      expect(result).toEqual(mockEmployees);
    });

    it('should handle errors when fetching employees', async () => {
      const mockError = { message: 'Database error' };
      
      mockSupabase.from().then.mockImplementationOnce((callback) => 
        callback({ data: null, error: mockError })
      );

      await expect(getEmployees()).rejects.toThrow('Database error');
    });

    it('should create employee successfully', async () => {
      const newEmployee = {
        name: 'María García',
        email: 'maria@example.com',
        department: 'Servicio',
        position: 'Mesera',
        hourly_rate: 18.0,
        hire_date: '2024-01-01',
        skills: ['Servicio al cliente']
      };

      const createdEmployee = { id: '2', ...newEmployee };

      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: createdEmployee, 
        error: null 
      });

      const result = await createEmployee(newEmployee);

      expect(mockSupabase.from).toHaveBeenCalledWith('employees');
      expect(result).toEqual(createdEmployee);
    });

    it('should update employee successfully', async () => {
      const employeeId = '1';
      const updates = { hourly_rate: 26.0, position: 'Jefe de Cocina' };

      const updatedEmployee = { 
        id: employeeId, 
        name: 'Juan Pérez',
        ...updates 
      };

      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: updatedEmployee, 
        error: null 
      });

      const result = await updateEmployee(employeeId, updates);

      expect(mockSupabase.from().update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', employeeId);
      expect(result).toEqual(updatedEmployee);
    });

    it('should delete employee successfully', async () => {
      const employeeId = '1';

      mockSupabase.from().then.mockImplementationOnce((callback) => 
        callback({ data: null, error: null })
      );

      const result = await deleteEmployee(employeeId);

      expect(mockSupabase.from().delete).toHaveBeenCalled();
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', employeeId);
      expect(result).toBeNull();
    });
  });

  describe('Schedule Management', () => {
    it('should fetch schedules for date range', async () => {
      const mockSchedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          start_time: '2024-01-08T09:00:00Z',
          end_time: '2024-01-08T17:00:00Z',
          break_minutes: 60,
          status: 'scheduled',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockSupabase.from().then.mockImplementationOnce((callback) => 
        callback({ data: mockSchedules, error: null })
      );

      const result = await getSchedules('2024-01-08', '2024-01-08');

      expect(mockSupabase.from).toHaveBeenCalledWith('schedules');
      expect(result).toEqual(mockSchedules);
    });

    it('should create schedule successfully', async () => {
      const newSchedule = {
        employee_id: '1',
        start_time: '2024-01-08T09:00:00Z',
        end_time: '2024-01-08T17:00:00Z',
        break_minutes: 60
      };

      const createdSchedule = { id: '1', ...newSchedule };

      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: createdSchedule, 
        error: null 
      });

      const result = await createSchedule(newSchedule);

      expect(result).toEqual(createdSchedule);
    });
  });

  describe('Time Entry Management', () => {
    it('should fetch time entries for date range', async () => {
      const mockTimeEntries: TimeEntry[] = [
        {
          id: '1',
          employee_id: '1',
          clock_in: '2024-01-08T09:00:00Z',
          clock_out: '2024-01-08T17:00:00Z',
          break_minutes: 60,
          total_hours: 7.0,
          created_at: '2024-01-08T09:00:00Z',
          updated_at: '2024-01-08T17:00:00Z'
        }
      ];

      mockSupabase.from().then.mockImplementationOnce((callback) => 
        callback({ data: mockTimeEntries, error: null })
      );

      const result = await getTimeEntries('2024-01-08', '2024-01-08');

      expect(result).toEqual(mockTimeEntries);
    });

    it('should create time entry successfully', async () => {
      const newTimeEntry = {
        employee_id: '1',
        clock_in: '2024-01-08T09:00:00Z',
        clock_out: '2024-01-08T17:00:00Z',
        break_minutes: 60,
        total_hours: 7.0
      };

      const createdTimeEntry = { id: '1', ...newTimeEntry };

      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: createdTimeEntry, 
        error: null 
      });

      const result = await createTimeEntry(newTimeEntry);

      expect(result).toEqual(createdTimeEntry);
    });
  });
});

describe('Staff API - Performance Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get employee performance data', async () => {
    const mockPerformanceData = [
      {
        month: '2024-01',
        total_hours: 160,
        efficiency_score: 85,
        quality_score: 90,
        punctuality_score: 95
      }
    ];

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: mockPerformanceData, 
      error: null 
    });

    const result = await getEmployeePerformance('1', 6);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_employee_performance', {
      employee_id: '1',
      months_back: 6
    });
    expect(result).toEqual(mockPerformanceData);
  });

  it('should get department performance data', async () => {
    const mockDepartmentData = [
      {
        department: 'Cocina',
        avg_efficiency: 87,
        avg_quality: 92,
        total_employees: 5
      }
    ];

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: mockDepartmentData, 
      error: null 
    });

    const result = await getDepartmentPerformance();

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_department_performance');
    expect(result).toEqual(mockDepartmentData);
  });

  it('should get performance trends', async () => {
    const mockTrendsData = [
      {
        month: '2024-01',
        avg_efficiency: 85,
        avg_quality: 90,
        employee_count: 12
      }
    ];

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: mockTrendsData, 
      error: null 
    });

    const result = await getPerformanceTrends(12);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_performance_trends', {
      months_back: 12
    });
    expect(result).toEqual(mockTrendsData);
  });

  it('should get top performers', async () => {
    const mockTopPerformers = [
      {
        employee_id: '1',
        employee_name: 'Juan Pérez',
        overall_score: 92,
        department: 'Cocina'
      }
    ];

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: mockTopPerformers, 
      error: null 
    });

    const result = await getTopPerformers(5);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_top_performers', {
      limit_count: 5
    });
    expect(result).toEqual(mockTopPerformers);
  });
});

describe('Staff API - Labor Cost Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate labor costs for date range', async () => {
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

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: mockLaborCosts, 
      error: null 
    });

    const result = await calculateLaborCosts('2024-01-01', '2024-01-07');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_labor_costs', {
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      department_filter: null
    });
    expect(result).toEqual(mockLaborCosts);
  });

  it('should calculate labor costs with department filter', async () => {
    await calculateLaborCosts('2024-01-01', '2024-01-07', 'Cocina');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_labor_costs', {
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      department_filter: 'Cocina'
    });
  });

  it('should get labor cost summary', async () => {
    const mockSummary = {
      total_cost: 5000,
      regular_cost: 4200,
      overtime_cost: 800,
      total_hours: 200,
      overtime_hours: 15,
      avg_hourly_rate: 22.5,
      variance_from_budget: -200,
      variance_percentage: -3.8
    };

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: [mockSummary], 
      error: null 
    });

    const result = await getLaborCostSummary('2024-01-01', '2024-01-07');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_labor_cost_summary', {
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      department_filter: null
    });
    expect(result).toEqual(mockSummary);
  });

  it('should get cost per hour analysis', async () => {
    const mockAnalysis = [
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
    ];

    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: mockAnalysis, 
      error: null 
    });

    const result = await getCostPerHourAnalysis('2024-01-01', '2024-01-07');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_cost_per_hour_analysis', {
      start_date: '2024-01-01',
      end_date: '2024-01-07'
    });
    expect(result).toEqual(mockAnalysis);
  });

  it('should handle errors in labor cost calculations', async () => {
    const mockError = { message: 'Failed to calculate costs' };
    
    mockSupabase.rpc.mockResolvedValueOnce({ 
      data: null, 
      error: mockError 
    });

    await expect(calculateLaborCosts('2024-01-01', '2024-01-07'))
      .rejects.toThrow('Failed to calculate costs');
  });
});