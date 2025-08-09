// Staff Management API Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getStaffStats,
  maskEmployeeData,
  hasPermission,
  staff_update_performance_metrics,
  staff_calculate_productivity
} from '../data/staffApi';
import type { Employee, EmployeeFormData, StaffFilters } from '../types';

describe('Staff API', () => {
  describe('getEmployees', () => {
    it('should return masked employees for non-admin users', async () => {
      const employees = await getEmployees({}, { field: 'name', direction: 'asc' }, 'employee');
      
      expect(employees).toBeDefined();
      expect(employees.length).toBeGreaterThan(0);
      
      // Check that sensitive data is masked
      const employee = employees[0];
      expect(employee.salary_masked).toBe(true);
      expect(employee.hourly_rate_masked).toBe(true);
      expect(employee.salary).toBeUndefined();
      expect(employee.hourly_rate).toBeUndefined();
    });

    it('should return unmasked employees for admin users', async () => {
      const employees = await getEmployees({}, { field: 'name', direction: 'asc' }, 'admin');
      
      expect(employees).toBeDefined();
      expect(employees.length).toBeGreaterThan(0);
      
      // Check that sensitive data is available for admin
      const employee = employees[0];
      expect(employee.salary_masked).toBe(false);
      expect(employee.hourly_rate_masked).toBe(false);
    });

    it('should filter employees by search term', async () => {
      const filters: StaffFilters = {
        search: 'Ana'
      };
      
      const employees = await getEmployees(filters, { field: 'name', direction: 'asc' }, 'admin');
      
      expect(employees).toBeDefined();
      expect(employees.length).toBeGreaterThan(0);
      expect(employees.some(emp => emp.first_name.includes('Ana'))).toBe(true);
    });

    it('should filter employees by department', async () => {
      const filters: StaffFilters = {
        department: 'Cocina'
      };
      
      const employees = await getEmployees(filters, { field: 'name', direction: 'asc' }, 'admin');
      
      expect(employees).toBeDefined();
      employees.forEach(emp => {
        expect(emp.department).toBe('Cocina');
      });
    });

    it('should filter employees by employment status', async () => {
      const filters: StaffFilters = {
        employment_status: 'active'
      };
      
      const employees = await getEmployees(filters, { field: 'name', direction: 'asc' }, 'admin');
      
      expect(employees).toBeDefined();
      employees.forEach(emp => {
        expect(emp.employment_status).toBe('active');
      });
    });

    it('should sort employees by name', async () => {
      const employeesAsc = await getEmployees({}, { field: 'name', direction: 'asc' }, 'admin');
      const employeesDesc = await getEmployees({}, { field: 'name', direction: 'desc' }, 'admin');
      
      expect(employeesAsc).toBeDefined();
      expect(employeesDesc).toBeDefined();
      
      // Check that sorting is working
      if (employeesAsc.length > 1) {
        const firstNameAsc = `${employeesAsc[0].first_name} ${employeesAsc[0].last_name}`;
        const lastNameAsc = `${employeesAsc[employeesAsc.length - 1].first_name} ${employeesAsc[employeesAsc.length - 1].last_name}`;
        expect(firstNameAsc.localeCompare(lastNameAsc)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee by ID with data masking', async () => {
      const employee = await getEmployeeById('1', 'employee');
      
      expect(employee).toBeDefined();
      expect(employee?.id).toBe('1');
      expect(employee?.salary_masked).toBe(true);
      expect(employee?.salary).toBeUndefined();
    });

    it('should return employee by employee_id', async () => {
      const employee = await getEmployeeById('EMP001', 'admin');
      
      expect(employee).toBeDefined();
      expect(employee?.employee_id).toBe('EMP001');
    });

    it('should return null for non-existent employee', async () => {
      const employee = await getEmployeeById('non-existent', 'admin');
      
      expect(employee).toBeNull();
    });
  });

  describe('createEmployee', () => {
    it('should create new employee with proper ID generation', async () => {
      const employeeData: EmployeeFormData = {
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test@restaurant.com',
        position: 'Cocinero',
        department: 'Cocina',
        hire_date: '2024-01-15',
        employment_type: 'full_time',
        role: 'employee',
        permissions: ['staff:read']
      };

      const newEmployee = await createEmployee(employeeData, 'HR001');
      
      expect(newEmployee).toBeDefined();
      expect(newEmployee.first_name).toBe('Test');
      expect(newEmployee.last_name).toBe('Employee');
      expect(newEmployee.email).toBe('test@restaurant.com');
      expect(newEmployee.employment_status).toBe('active');
      expect(newEmployee.employee_id).toMatch(/^EMP\d{3}$/);
      expect(newEmployee.created_at).toBeDefined();
      expect(newEmployee.updated_at).toBeDefined();
    });
  });

  describe('updateEmployee', () => {
    it('should update employee data', async () => {
      const updateData: Partial<EmployeeFormData> = {
        position: 'Chef Senior',
        role: 'supervisor'
      };

      const updatedEmployee = await updateEmployee('1', updateData, 'HR001');
      
      expect(updatedEmployee).toBeDefined();
      expect(updatedEmployee.position).toBe('Chef Senior');
      expect(updatedEmployee.role).toBe('supervisor');
      expect(new Date(updatedEmployee.updated_at)).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent employee', async () => {
      const updateData: Partial<EmployeeFormData> = {
        position: 'New Position'
      };

      await expect(updateEmployee('non-existent', updateData, 'HR001'))
        .rejects.toThrow('Employee not found');
    });
  });

  describe('getStaffStats', () => {
    it('should return staff statistics', async () => {
      const stats = await getStaffStats('admin');
      
      expect(stats).toBeDefined();
      expect(stats.total_employees).toBeGreaterThan(0);
      expect(stats.active_employees).toBeGreaterThanOrEqual(0);
      expect(stats.avg_performance).toBeGreaterThanOrEqual(0);
      expect(stats.avg_performance).toBeLessThanOrEqual(100);
      expect(stats.on_shift).toBeGreaterThanOrEqual(0);
      expect(stats.pending_reviews).toBeGreaterThanOrEqual(0);
      expect(stats.training_due).toBeGreaterThanOrEqual(0);
      expect(stats.new_hires_this_month).toBeGreaterThanOrEqual(0);
      expect(stats.turnover_rate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('maskEmployeeData', () => {
    const mockEmployee: Employee = {
      id: '1',
      employee_id: 'EMP001',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@restaurant.com',
      position: 'Manager',
      department: 'Admin',
      hire_date: '2023-01-01',
      employment_status: 'active',
      employment_type: 'full_time',
      role: 'manager',
      permissions: ['staff:read'],
      salary: 50000,
      hourly_rate: 25.00,
      social_security: '123-45-6789',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    it('should mask sensitive data for non-admin users', () => {
      const masked = maskEmployeeData(mockEmployee, 'employee');
      
      expect(masked.salary).toBeUndefined();
      expect(masked.hourly_rate).toBeUndefined();
      expect(masked.social_security).toBeUndefined();
      expect(masked.salary_masked).toBe(true);
      expect(masked.hourly_rate_masked).toBe(true);
      expect(masked.social_security_masked).toBe('***-**-6789');
    });

    it('should not mask sensitive data for admin users', () => {
      const masked = maskEmployeeData(mockEmployee, 'admin');
      
      expect(masked.salary).toBe(50000);
      expect(masked.hourly_rate).toBe(25.00);
      expect(masked.social_security).toBe('123-45-6789');
      expect(masked.salary_masked).toBe(false);
      expect(masked.hourly_rate_masked).toBe(false);
    });

    it('should not mask sensitive data for HR users', () => {
      const masked = maskEmployeeData(mockEmployee, 'hr');
      
      expect(masked.salary).toBe(50000);
      expect(masked.hourly_rate).toBe(25.00);
      expect(masked.social_security).toBe('123-45-6789');
      expect(masked.salary_masked).toBe(false);
      expect(masked.hourly_rate_masked).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should grant all permissions to admin', () => {
      expect(hasPermission('admin', 'staff', 'read')).toBe(true);
      expect(hasPermission('admin', 'staff', 'write')).toBe(true);
      expect(hasPermission('admin', 'staff', 'delete')).toBe(true);
      expect(hasPermission('admin', 'staff', 'manage')).toBe(true);
      expect(hasPermission('admin', 'payroll', 'read')).toBe(true);
    });

    it('should grant appropriate permissions to manager', () => {
      expect(hasPermission('manager', 'staff', 'read')).toBe(true);
      expect(hasPermission('manager', 'staff', 'write')).toBe(true);
      expect(hasPermission('manager', 'staff', 'delete')).toBe(false);
      expect(hasPermission('manager', 'payroll', 'read')).toBe(true);
      expect(hasPermission('manager', 'payroll', 'write')).toBe(false);
    });

    it('should grant limited permissions to employee', () => {
      expect(hasPermission('employee', 'staff', 'read')).toBe(true);
      expect(hasPermission('employee', 'staff', 'write')).toBe(false);
      expect(hasPermission('employee', 'payroll', 'read')).toBe(false);
      expect(hasPermission('employee', 'performance', 'read')).toBe(true);
    });

    it('should deny permissions for unknown role', () => {
      expect(hasPermission('unknown', 'staff', 'read')).toBe(false);
    });
  });

  describe('staff_update_performance_metrics', () => {
    it('should update performance metrics', async () => {
      const metrics = await staff_update_performance_metrics('EMP001', {
        score: 90,
        productivity: 95,
        quality: 88,
        feedback: 'Great improvement'
      }, 'MANAGER001');
      
      expect(metrics).toBeDefined();
      expect(metrics.employee_id).toBe('EMP001');
      expect(metrics.score).toBe(90);
      expect(metrics.productivity).toBe(95);
      expect(metrics.quality).toBe(88);
      expect(metrics.feedback).toBe('Great improvement');
      expect(metrics.created_at).toBeDefined();
    });
  });

  describe('staff_calculate_productivity', () => {
    it('should calculate productivity score', async () => {
      const productivity = await staff_calculate_productivity('EMP001');
      
      expect(productivity).toBeGreaterThanOrEqual(0);
      expect(productivity).toBeLessThanOrEqual(100);
      expect(typeof productivity).toBe('number');
    });

    it('should return 0 for non-existent employee', async () => {
      const productivity = await staff_calculate_productivity('NONEXISTENT');
      
      expect(productivity).toBe(0);
    });
  });
});