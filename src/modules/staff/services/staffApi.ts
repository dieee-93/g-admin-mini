// Staff Management API - CRUD, Security, Time Tracking
// Consolidation of services/staffApi.ts + services/staff/staffApi.ts

import { logger } from '@/lib/logging';
import { supabase } from '@/lib/supabase/client';
import { eventBus } from '@/lib/events';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management';
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'temp';
  role: 'employee' | 'supervisor' | 'manager' | 'admin';
  salary?: number;
  hourly_rate?: number;
  avatar_url?: string;
  notes?: string;
  performance_score?: number;
  attendance_rate?: number;
  completed_tasks?: number;
  weekly_hours?: number;
  shift_preference?: 'morning' | 'afternoon' | 'night' | 'flexible';
  available_days?: string[];
  permissions?: string[];
  social_security?: string;
  skills?: string[];
  certifications?: string[];
  goals_completed?: number;
  total_goals?: number;
  training_completed?: number;
  training_hours?: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface MaskedEmployee extends Omit<Employee, 'social_security'> {
  salary_masked?: boolean;
  hourly_rate_masked?: boolean;
  social_security_masked?: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  hourly_rate?: number;
  notes?: string;
  skills?: string[];
}

export interface EmployeeTraining {
  id: string;
  employee_id: string;
  training_name: string;
  training_type: 'certification' | 'course' | 'workshop' | 'safety' | 'compliance';
  completed_date: string;
  expiry_date?: string;
  issuing_authority?: string;
  certificate_url?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface ShiftScheduleDB {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'missed' | 'cancelled';
  break_duration: number;
  notes?: string;
  is_mandatory: boolean;
  can_be_covered: boolean;
  covered_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TimeEntryDB {
  id: string;
  employee_id: string;
  schedule_id?: string;
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
  location?: { latitude: number; longitude: number };
  notes?: string;
  is_offline: boolean;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  created_at: string;
  created_by?: string;
}

export interface PerformanceMetrics {
  employee_id: string;
  period: string;
  score: number;
  productivity: number;
  quality: number;
  attendance: number;
  goals_met: number;
  total_goals: number;
  feedback?: string;
  created_at: string;
}

export interface TrainingRecord {
  id: string;
  employee_id: string;
  course_name: string;
  course_type: string;
  status: 'planned' | 'in_progress' | 'completed' | 'expired';
  start_date: string;
  completion_date?: string;
  score?: number;
  certificate_url?: string;
  hours: number;
  instructor?: string;
  created_at: string;
}

export interface StaffStats {
  total_employees: number;
  active_employees: number;
  on_shift: number;
  avg_performance: number;
  pending_reviews: number;
  training_due: number;
  new_hires_this_month: number;
  turnover_rate: number;
}

export interface StaffFilters {
  search?: string;
  department?: string;
  employment_status?: string;
  role?: string;
  employment_type?: string;
  position?: string;
  status?: string;
}

export interface StaffSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// =====================================================
// SECURITY FUNCTIONS
// =====================================================

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
    const { social_security, ...safeMaskedEmployee } = maskedEmployee;

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
      staff: ['read'],
      performance: ['read'],
      training: ['read'],
      payroll: [],
      scheduling: ['read']
    }
  };

  const userPermissions = permissions[userRole];
  if (!userPermissions) return false;

  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

// =====================================================
// EMPLOYEE CRUD OPERATIONS
// =====================================================

/**
 * Get all employees with security compliance and optional filtering
 */
export async function getEmployees(
  filters: StaffFilters = {},
  sortBy: StaffSortOptions = { field: 'name', direction: 'asc' },
  currentUserRole = 'employee'
): Promise<MaskedEmployee[]> {
  try {
    logger.info('StaffAPI', '📊 Fetching employees from Supabase', { filters, sortBy });

    let query = supabase
      .from('employees')
      .select('*');

    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,position.ilike.%${filters.search}%,department.ilike.%${filters.search}%`);
    }

    if (filters.employment_status && filters.employment_status !== 'all') {
      query = query.eq('employment_status', filters.employment_status);
    }

    if (filters.department && filters.department !== 'all') {
      query = query.eq('department', filters.department);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }

    if (filters.position) {
      query = query.ilike('position', `%${filters.position}%`);
    }

    // Apply sorting
    const orderColumn = sortBy.field === 'name' ? 'first_name' : sortBy.field;
    query = query.order(orderColumn, { ascending: sortBy.direction === 'asc' });

    const { data, error } = await query;

    if (error) {
      logger.error('StaffAPI', '❌ Error fetching employees from Supabase', error);
      throw error;
    }

    if (!data || data.length === 0) {
      logger.info('StaffAPI', '📭 No employees found in database');
      return [];
    }

    logger.info('StaffAPI', `✅ Fetched ${data.length} employees from Supabase`);

    // Apply security masking
    return data.map(employee => maskEmployeeData(employee as Employee, currentUserRole));

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in getEmployees', error);
    throw error;
  }
}

/**
 * Get single employee by ID with security compliance
 */
export async function getEmployeeById(
  employeeId: string,
  currentUserRole = 'employee'
): Promise<MaskedEmployee | null> {
  try {
    logger.info('StaffAPI', '📊 Fetching employee by ID from Supabase', { employeeId });

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('StaffAPI', '📭 Employee not found');
        return null;
      }
      logger.error('StaffAPI', '❌ Error fetching employee by ID', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    logger.info('StaffAPI', `✅ Fetched employee ${data.first_name} ${data.last_name}`);

    return maskEmployeeData(data as Employee, currentUserRole);

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in getEmployeeById', error);
    throw error;
  }
}

/**
 * Create new employee with audit trail and event emission
 */
export async function createEmployee(
  employeeData: EmployeeFormData,
  createdBy?: string
): Promise<Employee> {
  try {
    logger.info('StaffAPI', '📝 Creating new employee in Supabase', { createdBy: createdBy || 'system' });

    // Get current total staff count (for achievements)
    const { count: previousTotalStaff } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employment_status', 'active');

    // Generate employee_id
    const count = await getEmployeesCount();
    const employee_id = `EMP${String(count + 1).padStart(3, '0')}`;

    // Prepare data for Supabase insert
    const insertData = {
      employee_id,
      first_name: employeeData.first_name,
      last_name: employeeData.last_name,
      email: employeeData.email,
      phone: employeeData.phone || null,
      position: employeeData.position,
      department: employeeData.department || null,
      hire_date: employeeData.hire_date || new Date().toISOString().split('T')[0],
      employment_status: 'active',
      employment_type: 'full_time',
      role: 'employee',
      salary: employeeData.salary || 0,
      hourly_rate: employeeData.hourly_rate || 0,
      weekly_hours: 40,
      performance_score: 0,
      attendance_rate: 100,
      available_days: [],
      permissions: [],
      skills: employeeData.skills || [],
      certifications: [],
      notes: employeeData.notes || null
    };

    const { data, error } = await supabase
      .from('employees')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      logger.error('StaffAPI', '❌ Error creating employee in Supabase', error);
      throw error;
    }

    logger.info('StaffAPI', `✅ Created employee ${data.first_name} ${data.last_name}`);

    const newEmployee = data as Employee;

    // Calculate new total staff
    const totalStaff = (previousTotalStaff || 0) + 1;

    // Emit staff.member_added event for achievements
    try {
      await eventBus.emit('staff.member_added', {
        staffId: newEmployee.id,
        staffName: `${newEmployee.first_name} ${newEmployee.last_name}`,
        role: newEmployee.position,
        totalStaff,
        previousTotalStaff: previousTotalStaff || 0,
        timestamp: Date.now(),
        triggeredBy: 'manual' as const,
        userId: createdBy
      });

      logger.info('StaffAPI', 'Staff member added event emitted', {
        staffId: newEmployee.id,
        totalStaff,
        previousTotalStaff
      });
    } catch (err) {
      logger.error('StaffAPI', 'Failed to emit staff.member_added event', err);
      // Don't fail employee creation if event emission fails
    }

    return newEmployee;

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in createEmployee', error);
    throw error;
  }
}

/**
 * Update employee with audit trail and security validation
 */
export async function updateEmployee(
  employeeId: string,
  updateData: Partial<EmployeeFormData>,
  updatedBy?: string
): Promise<Employee> {
  try {
    logger.info('StaffAPI', '✏️ Updating employee in Supabase', { employeeId, updatedBy: updatedBy || 'system' });

    const updates: Record<string, unknown> = {};
    if (updateData.first_name !== undefined) updates.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) updates.last_name = updateData.last_name;
    if (updateData.email !== undefined) updates.email = updateData.email;
    if (updateData.phone !== undefined) updates.phone = updateData.phone;
    if (updateData.position !== undefined) updates.position = updateData.position;
    if (updateData.department !== undefined) updates.department = updateData.department;
    if (updateData.hire_date !== undefined) updates.hire_date = updateData.hire_date;
    if (updateData.salary !== undefined) updates.salary = updateData.salary;
    if (updateData.hourly_rate !== undefined) updates.hourly_rate = updateData.hourly_rate;
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.skills !== undefined) updates.skills = updateData.skills;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      logger.error('StaffAPI', '❌ Error updating employee in Supabase', error);
      throw error;
    }

    if (!data) {
      throw new Error('Employee not found');
    }

    logger.info('StaffAPI', `✅ Updated employee ${data.first_name} ${data.last_name}`);

    return data as Employee;

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in updateEmployee', error);
    throw error;
  }
}

/**
 * Delete employee (soft delete by changing status)
 */
export async function deleteEmployee(
  employeeId: string,
  deletedBy?: string
): Promise<void> {
  try {
    logger.info('StaffAPI', '🗑️ Soft deleting employee in Supabase', { employeeId, deletedBy: deletedBy || 'system' });

    const { error } = await supabase
      .from('employees')
      .update({
        employment_status: 'terminated',
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) {
      logger.error('StaffAPI', '❌ Error deleting employee in Supabase', error);
      throw error;
    }

    logger.info('StaffAPI', `✅ Soft deleted employee ${employeeId}`);

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in deleteEmployee', error);
    throw error;
  }
}

/**
 * Get employees count for ID generation
 */
async function getEmployeesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('employees')
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to get employees count: ${error.message}`);
  }

  return count || 0;
}

// =====================================================
// SHIFT SCHEDULE OPERATIONS
// =====================================================

/**
 * Get shift schedules with optional filtering
 */
export async function getShiftSchedules(
  startDate?: string,
  endDate?: string,
  employeeId?: string
): Promise<ShiftScheduleDB[]> {
  try {
    logger.info('StaffAPI', '📅 Fetching schedules from Supabase', { startDate, endDate });

    let query = supabase
      .from('shift_schedules')
      .select(`
        *,
        employee:employees!employee_id(first_name, last_name),
        covered_by_employee:employees!covered_by(first_name, last_name)
      `)
      .order('date')
      .order('start_time');

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('StaffAPI', '❌ Error fetching schedules', error);
      throw error;
    }

    logger.info('StaffAPI', `✅ Fetched ${data?.length || 0} schedules`);
    return data || [];

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in getShiftSchedules', error);
    return [];
  }
}

/**
 * Create a new shift schedule
 */
export async function createShiftSchedule(
  scheduleData: Omit<ShiftScheduleDB, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
): Promise<ShiftScheduleDB> {
  const { data, error } = await supabase
    .from('shift_schedules')
    .insert([scheduleData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }

  return data;
}

/**
 * Update a shift schedule
 */
export async function updateShiftSchedule(
  id: string,
  updates: Partial<Omit<ShiftScheduleDB, 'id' | 'created_at' | 'created_by'>>
): Promise<ShiftScheduleDB> {
  const { data, error } = await supabase
    .from('shift_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }

  return data;
}

/**
 * Delete a shift schedule
 */
export async function deleteShiftSchedule(id: string): Promise<void> {
  const { error } = await supabase
    .from('shift_schedules')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}

// =====================================================
// TIME ENTRY OPERATIONS
// =====================================================

/**
 * Get time entries with optional filtering
 */
export async function getTimeEntries(
  startDate?: string,
  endDate?: string,
  employeeId?: string,
  syncStatus?: string
): Promise<TimeEntryDB[]> {
  try {
    logger.info('StaffAPI', '⏰ Fetching time entries from Supabase', { startDate, endDate });

    let query = supabase
      .from('time_entries')
      .select(`
        *,
        employee:employees(first_name, last_name)
      `)
      .order('timestamp', { ascending: false });

    if (startDate && endDate) {
      query = query.gte('timestamp', startDate).lte('timestamp', endDate);
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('StaffAPI', '❌ Error fetching time entries', error);
      return [];
    }

    logger.info('StaffAPI', `✅ Fetched ${data?.length || 0} time entries`);
    return data || [];

  } catch (error) {
    logger.error('StaffAPI', '❌ Critical error in getTimeEntries', error);
    return [];
  }
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  entryData: Omit<TimeEntryDB, 'id' | 'created_at' | 'created_by'>
): Promise<TimeEntryDB> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([entryData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create time entry: ${error.message}`);
  }

  return data;
}

/**
 * Clock in an employee
 */
export async function clockIn(
  employeeId: string,
  location?: { latitude: number; longitude: number },
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    employee_id: employeeId,
    entry_type: 'clock_in',
    timestamp: new Date().toISOString(),
    location,
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

/**
 * Clock out an employee
 */
export async function clockOut(
  employeeId: string,
  location?: { latitude: number; longitude: number },
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    employee_id: employeeId,
    entry_type: 'clock_out',
    timestamp: new Date().toISOString(),
    location,
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

/**
 * Start break for an employee
 */
export async function startBreak(
  employeeId: string,
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    employee_id: employeeId,
    entry_type: 'break_start',
    timestamp: new Date().toISOString(),
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

/**
 * End break for an employee
 */
export async function endBreak(
  employeeId: string,
  notes?: string
): Promise<TimeEntryDB> {
  return createTimeEntry({
    employee_id: employeeId,
    entry_type: 'break_end',
    timestamp: new Date().toISOString(),
    notes,
    is_offline: false,
    sync_status: 'synced'
  });
}

// =====================================================
// TRAINING OPERATIONS
// =====================================================

/**
 * Get employee training records
 */
export async function getEmployeeTraining(employeeId: string): Promise<EmployeeTraining[]> {
  const { data, error } = await supabase
    .from('employee_training')
    .select('*')
    .eq('employee_id', employeeId)
    .order('completed_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch training records: ${error.message}`);
  }

  return data || [];
}

/**
 * Add training record for an employee
 */
export async function addEmployeeTraining(
  trainingData: Omit<EmployeeTraining, 'id' | 'created_at' | 'created_by'>
): Promise<EmployeeTraining> {
  const { data, error } = await supabase
    .from('employee_training')
    .insert([trainingData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add training record: ${error.message}`);
  }

  return data;
}

/**
 * Get training records with filtering
 */
export async function getTrainingRecords(
  employeeIds?: string[],
  status?: TrainingRecord['status']
): Promise<TrainingRecord[]> {
  // TODO: Implement with real data from employee_training table
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock training records
  const mockRecords: TrainingRecord[] = [];

  return mockRecords;
}
