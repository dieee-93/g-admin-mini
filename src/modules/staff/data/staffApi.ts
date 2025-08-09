// Staff Management API - Database functions with security compliance
import type { 
  Employee, 
  MaskedEmployee, 
  PerformanceMetrics, 
  TrainingRecord, 
  StaffStats,
  StaffFilters,
  StaffSortOptions,
  EmployeeFormData
} from '../types';

// Mock data store - in production this would connect to Supabase/database
let mockEmployees: Employee[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'Ana',
    last_name: 'García',
    email: 'ana.garcia@restaurant.com',
    phone: '+1234567890',
    avatar_url: undefined,
    position: 'Gerente General',
    department: 'Administración',
    hire_date: '2023-01-15',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'manager',
    permissions: ['staff:manage', 'performance:read', 'training:write'],
    last_login: '2024-01-08T14:30:00Z',
    performance_score: 95,
    goals_completed: 8,
    total_goals: 10,
    certifications: ['Food Safety', 'Leadership'],
    training_completed: 12,
    training_hours: 48,
    salary: 75000,
    hourly_rate: undefined,
    social_security: '123-45-1234',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: '2024-01-08T14:30:00Z'
  },
  {
    id: '2',
    employee_id: 'EMP002',
    first_name: 'Carlos',
    last_name: 'Rodriguez',
    email: 'carlos.rodriguez@restaurant.com',
    phone: '+1234567891',
    position: 'Chef Principal',
    department: 'Cocina',
    hire_date: '2023-03-01',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'supervisor',
    permissions: ['staff:read', 'performance:read', 'training:read'],
    last_login: '2024-01-08T12:15:00Z',
    performance_score: 88,
    goals_completed: 7,
    total_goals: 9,
    certifications: ['Food Safety', 'Kitchen Management'],
    training_completed: 8,
    training_hours: 32,
    salary: undefined,
    hourly_rate: 28.50,
    social_security: '123-45-5678',
    created_at: '2023-03-01T09:00:00Z',
    updated_at: '2024-01-08T12:15:00Z'
  }
];

/**
 * Security utility - masks sensitive employee data based on user role
 * @param employee - Full employee object
 * @param currentUserRole - Current user's role for access control
 * @returns Masked employee object with appropriate data visibility
 */
export function maskEmployeeData(employee: Employee, currentUserRole: string): MaskedEmployee {
  const canViewSensitiveData = ['admin', 'hr'].includes(currentUserRole);
  
  const maskedEmployee: MaskedEmployee = {
    ...employee,
    salary_masked: !canViewSensitiveData,
    hourly_rate_masked: !canViewSensitiveData,
  };
  
  if (!canViewSensitiveData) {
    // Remove sensitive properties
    const { salary, hourly_rate, social_security, ...safeMaskedEmployee } = maskedEmployee;
    
    // Add masked version
    const finalMaskedEmployee = {
      ...safeMaskedEmployee,
      social_security_masked: social_security 
        ? `***-**-${social_security.slice(-4)}`
        : undefined
    };
    
    return finalMaskedEmployee;
  }
  
  return maskedEmployee;
}

/**
 * Get all employees with security compliance
 * @param filters - Filter criteria
 * @param sortBy - Sort options  
 * @param currentUserRole - Current user role for data masking
 * @returns Promise<MaskedEmployee[]>
 */
export async function getEmployees(
  filters: StaffFilters = {}, 
  sortBy: StaffSortOptions = { field: 'name', direction: 'asc' },
  currentUserRole = 'employee'
): Promise<MaskedEmployee[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = !filters.search || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.position.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.department.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.employment_status || employee.employment_status === filters.employment_status;
    const matchesDepartment = !filters.department || employee.department === filters.department;
    const matchesRole = !filters.role || employee.role === filters.role;
    const matchesType = !filters.employment_type || employee.employment_type === filters.employment_type;

    return matchesSearch && matchesStatus && matchesDepartment && matchesRole && matchesType;
  });

  // Sort results
  filteredEmployees.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy.field) {
      case 'name':
        aValue = `${a.first_name} ${a.last_name}`;
        bValue = `${b.first_name} ${b.last_name}`;
        break;
      case 'hire_date':
        aValue = new Date(a.hire_date);
        bValue = new Date(b.hire_date);
        break;
      case 'performance_score':
        aValue = a.performance_score || 0;
        bValue = b.performance_score || 0;
        break;
      case 'last_login':
        aValue = new Date(a.last_login || 0);
        bValue = new Date(b.last_login || 0);
        break;
      default:
        aValue = a[sortBy.field as keyof Employee];
        bValue = b[sortBy.field as keyof Employee];
    }

    if (aValue < bValue) return sortBy.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortBy.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply security masking
  return filteredEmployees.map(employee => maskEmployeeData(employee, currentUserRole));
}

/**
 * Get single employee by ID with security compliance
 * @param employeeId - Employee ID to fetch
 * @param currentUserRole - Current user role for data masking
 * @returns Promise<MaskedEmployee | null>
 */
export async function getEmployeeById(
  employeeId: string, 
  currentUserRole = 'employee'
): Promise<MaskedEmployee | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const employee = mockEmployees.find(emp => emp.id === employeeId || emp.employee_id === employeeId);
  if (!employee) return null;
  
  return maskEmployeeData(employee, currentUserRole);
}

/**
 * Create new employee with audit trail
 * @param employeeData - New employee data
 * @param createdBy - User ID creating the employee
 * @returns Promise<Employee>
 */
export async function createEmployee(
  employeeData: EmployeeFormData,
  createdBy: string
): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newEmployee: Employee = {
    id: Date.now().toString(),
    employee_id: `EMP${String(mockEmployees.length + 1).padStart(3, '0')}`,
    ...employeeData,
    employment_status: 'active',
    performance_score: undefined,
    goals_completed: undefined,
    total_goals: undefined,
    certifications: [],
    training_completed: 0,
    training_hours: 0,
    availability: undefined,
    salary: employeeData.hourly_rate ? undefined : undefined, // Set based on employment type
    last_login: undefined,
    social_security: undefined, // To be set separately with proper security
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockEmployees.push(newEmployee);
  
  // In production, this would create an audit log entry
  console.log(`Employee ${newEmployee.employee_id} created by ${createdBy}`);
  
  return newEmployee;
}

/**
 * Update employee with audit trail and security validation
 * @param employeeId - Employee ID to update
 * @param updateData - Data to update
 * @param updatedBy - User ID performing the update
 * @returns Promise<Employee>
 */
export async function updateEmployee(
  employeeId: string,
  updateData: Partial<EmployeeFormData>,
  updatedBy: string
): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const employeeIndex = mockEmployees.findIndex(emp => emp.id === employeeId);
  if (employeeIndex === -1) {
    throw new Error('Employee not found');
  }
  
  const existingEmployee = mockEmployees[employeeIndex];
  const updatedEmployee: Employee = {
    ...existingEmployee,
    ...updateData,
    updated_at: new Date().toISOString()
  };
  
  mockEmployees[employeeIndex] = updatedEmployee;
  
  // In production, this would create an audit log entry
  console.log(`Employee ${updatedEmployee.employee_id} updated by ${updatedBy}`);
  
  return updatedEmployee;
}

/**
 * Get staff statistics with security compliance
 * @param _currentUserRole - Current user role for data access (reserved for future use)
 * @returns Promise<StaffStats>
 */
export async function getStaffStats(_currentUserRole = 'employee'): Promise<StaffStats> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const employees = mockEmployees;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats: StaffStats = {
    total_employees: employees.length,
    active_employees: employees.filter(emp => emp.employment_status === 'active').length,
    on_shift: Math.floor(employees.length * 0.3), // Mock calculation
    avg_performance: employees.reduce((sum, emp) => sum + (emp.performance_score || 0), 0) / employees.length,
    pending_reviews: 3, // Mock value
    training_due: 5, // Mock value
    new_hires_this_month: employees.filter(emp => new Date(emp.hire_date) >= startOfMonth).length,
    turnover_rate: 8.3 // Mock value
  };
  
  return stats;
}

/**
 * Get performance metrics for employees
 * @param employeeIds - Optional array of employee IDs to filter
 * @returns Promise<PerformanceMetrics[]>
 */
export async function getPerformanceMetrics(employeeIds?: string[]): Promise<PerformanceMetrics[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock performance metrics
  const mockMetrics: PerformanceMetrics[] = [
    {
      employee_id: 'EMP001',
      period: 'monthly',
      score: 95,
      productivity: 98,
      quality: 92,
      attendance: 100,
      goals_met: 8,
      total_goals: 10,
      feedback: 'Excelente liderazgo y gestión del equipo.',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      employee_id: 'EMP002',
      period: 'monthly',
      score: 88,
      productivity: 90,
      quality: 95,
      attendance: 96,
      goals_met: 7,
      total_goals: 9,
      feedback: 'Consistente en calidad de cocina.',
      created_at: '2024-01-01T00:00:00Z'
    }
  ];
  
  return employeeIds 
    ? mockMetrics.filter(metric => employeeIds.includes(metric.employee_id))
    : mockMetrics;
}

/**
 * Get training records with filtering
 * @param employeeIds - Optional array of employee IDs to filter
 * @param status - Optional status filter
 * @returns Promise<TrainingRecord[]>
 */
export async function getTrainingRecords(
  employeeIds?: string[], 
  status?: TrainingRecord['status']
): Promise<TrainingRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock training records - this would come from database
  const mockRecords: TrainingRecord[] = [
    {
      id: '1',
      employee_id: 'EMP001',
      course_name: 'Liderazgo y Gestión de Equipos',
      course_type: 'leadership',
      status: 'completed',
      start_date: '2023-11-01',
      completion_date: '2023-11-15',
      score: 95,
      certificate_url: '/certificates/emp001-leadership.pdf',
      hours: 16,
      instructor: 'Dr. María González',
      created_at: '2023-11-01T09:00:00Z'
    },
    {
      id: '2',
      employee_id: 'EMP002',
      course_name: 'Gestión de Cocina Profesional',
      course_type: 'skills',
      status: 'completed',
      start_date: '2023-09-15',
      completion_date: '2023-10-15',
      score: 88,
      hours: 24,
      instructor: 'Chef Andrea López',
      created_at: '2023-09-15T09:00:00Z'
    }
  ];
  
  let filtered = mockRecords;
  
  if (employeeIds) {
    filtered = filtered.filter(record => employeeIds.includes(record.employee_id));
  }
  
  if (status) {
    filtered = filtered.filter(record => record.status === status);
  }
  
  return filtered;
}

/**
 * Security function to check if user has permission for action
 * @param userRole - User's role
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns boolean
 */
export function hasPermission(
  userRole: string, 
  resource: string, 
  action: 'read' | 'write' | 'delete' | 'manage'
): boolean {
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      staff: ['read', 'write', 'delete', 'manage'],
      performance: ['read', 'write', 'delete', 'manage'],
      training: ['read', 'write', 'delete', 'manage'],
      payroll: ['read', 'write', 'delete', 'manage'],
      scheduling: ['read', 'write', 'delete', 'manage']
    },
    hr: {
      staff: ['read', 'write', 'delete', 'manage'],
      performance: ['read', 'write', 'manage'],
      training: ['read', 'write', 'manage'],
      payroll: ['read', 'write'],
      scheduling: ['read']
    },
    manager: {
      staff: ['read', 'write'],
      performance: ['read', 'write', 'manage'],
      training: ['read', 'write'],
      payroll: ['read'],
      scheduling: ['read', 'write', 'manage']
    },
    supervisor: {
      staff: ['read'],
      performance: ['read', 'write'],
      training: ['read'],
      payroll: [],
      scheduling: ['read']
    },
    employee: {
      staff: ['read'], // Only own profile
      performance: ['read'], // Only own data
      training: ['read'], // Only own data
      payroll: [],
      scheduling: ['read'] // Only own schedule
    }
  };
  
  const userPermissions = permissions[userRole];
  if (!userPermissions) return false;
  
  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(action);
}

/**
 * Database function to get employee profile (simulated)
 * In production, this would be a Supabase function: staff_get_employee_profile()
 */
export const staff_get_employee_profile = getEmployeeById;

/**
 * Database function to update performance metrics (simulated)
 * In production, this would be a Supabase function: staff_update_performance_metrics()
 */
export async function staff_update_performance_metrics(
  employeeId: string,
  metrics: Partial<PerformanceMetrics>,
  updatedBy: string
): Promise<PerformanceMetrics> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Mock update - in production this would update the database
  const updatedMetrics: PerformanceMetrics = {
    employee_id: employeeId,
    period: 'monthly',
    score: 85,
    productivity: 88,
    quality: 90,
    attendance: 95,
    goals_met: 6,
    total_goals: 8,
    feedback: 'Updated performance metrics',
    created_at: new Date().toISOString(),
    ...metrics
  };
  
  console.log(`Performance metrics updated for ${employeeId} by ${updatedBy}`);
  return updatedMetrics;
}

/**
 * Database function to get training records (simulated)
 * In production, this would be a Supabase function: staff_get_training_records()
 */
export const staff_get_training_records = getTrainingRecords;

/**
 * Database function to calculate productivity (simulated)
 * In production, this would be a Supabase function: staff_calculate_productivity()
 */
export async function staff_calculate_productivity(employeeId: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock productivity calculation
  const employee = mockEmployees.find(emp => emp.employee_id === employeeId);
  if (!employee) return 0;
  
  // Simulate productivity calculation based on various factors
  const baseProductivity = employee.performance_score || 75;
  const attendanceBonus = Math.random() * 10; // Mock attendance factor
  const goalBonus = ((employee.goals_completed || 0) / (employee.total_goals || 1)) * 15;
  
  return Math.min(100, baseProductivity + attendanceBonus + goalBonus);
}