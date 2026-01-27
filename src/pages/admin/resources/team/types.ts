// Staff Management Module - Types Definition
// Security compliant types for teamMember data management

export interface TeamMember {
  id: string;
  employee_id: string; // Human-readable ID (EMP001, etc.)
  
  // Basic Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  
  // Employment Details
  position: string;
  department: string;
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'full_time_formal' | 'part_time_formal' | 'informal' | 'contractor' | 'family_helper';
  
  // Security & Access
  role: 'admin' | 'manager' | 'supervisor' | 'teamMember';
  permissions: string[];
  last_login?: string;
  
  // Performance Data
  performance_score?: number;
  goals_completed?: number;
  total_goals?: number;
  
  // Training Data
  certifications?: string[];
  training_completed?: number;
  training_hours?: number;
  
  // Scheduling Data
  availability?: EmployeeAvailability;

  // Location Data (Multi-Location Support)
  home_location_id?: string; // Primary location where teamMember works
  can_work_multiple_locations: boolean; // Can be scheduled at any location

  // Sensitive Data (masked in UI)
  salary?: number; // Only visible to HR/Admin
  hourly_rate?: number; // Only visible to HR/Admin
  social_security?: string; // Masked in UI

  // Argentine Context - Informal Employment Support
  daily_cash_rate?: number; // For informal workers
  track_payments?: boolean; // If false, only tracks presence not payments
  tax_id?: string; // CUIT for contractors

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EmployeeAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface PerformanceMetrics {
  employee_id: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  score: number; // 1-100
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
  course_type: 'safety' | 'skills' | 'compliance' | 'leadership';
  status: 'in_progress' | 'completed' | 'expired' | 'failed';
  start_date: string;
  completion_date?: string;
  expiry_date?: string;
  score?: number;
  certificate_url?: string;
  hours: number;
  instructor?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  category: 'performance' | 'skills' | 'attendance' | 'sales' | 'quality';
  target_value: number;
  current_value: number;
  unit: string;
  due_date: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  updated_at: string;
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

// Security-related types
export interface UserRole {
  role: 'admin' | 'hr' | 'manager' | 'supervisor' | 'teamMember';
  permissions: Permission[];
}

export interface Permission {
  resource: 'staff' | 'performance' | 'training' | 'payroll' | 'scheduling';
  actions: ('read' | 'write' | 'delete' | 'manage')[];
}

// Filter and search types
export interface StaffFilters {
  department?: string;
  position?: string;
  employment_status?: TeamMember['employment_status'];
  employment_type?: TeamMember['employment_type'];
  role?: TeamMember['role'];
  location_id?: string; // Filter by home location
  search?: string;
}

export interface StaffSortOptions {
  field: 'name' | 'hire_date' | 'performance_score' | 'last_login';
  direction: 'asc' | 'desc';
}

// Time tracking types
export interface TimeEntry {
  id: string;
  employee_id: string;
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  is_offline: boolean;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface TimeSheet {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  clock_in?: TimeEntry;
  clock_out?: TimeEntry;
  breaks: TimeEntry[];
  total_hours: number;
  overtime_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
  is_offline: boolean;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface TimeTrackingStats {
  today_total_hours: number;
  week_total_hours: number;
  active_employees: number;
  on_break: number;
  overtime_this_week: number;
  pending_approvals: number;
}

// UI State types
export interface StaffViewState {
  activeTab: 'directory' | 'performance' | 'training' | 'management' | 'timetracking';
  selectedEmployee?: TeamMember;
  filters: StaffFilters;
  sortBy: StaffSortOptions;
  viewMode: 'grid' | 'list';
}

// Data masking utility type
export type MaskedEmployee = Omit<TeamMember, 'salary' | 'hourly_rate' | 'social_security'> & {
  salary_masked?: boolean;
  hourly_rate_masked?: boolean;
  social_security_masked?: string; // "***-**-1234"
};

// Legacy compatibility types
export interface EmployeePosition {
  id: string;
  name: string;
  department: Department;
  level: 'junior' | 'senior' | 'supervisor' | 'manager';
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
}

export type EmployeeStatus = TeamMember['employment_status'];

export interface EmployeePermission {
  id: string;
  module: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  granted_by: string;
  granted_at: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hire_date: string;
  employment_type: TeamMember['employment_type'];
  role: TeamMember['role'];
  hourly_rate?: number;
  permissions: string[];
  salary?: number;
  notes?: string;
  skills?: string[];
  home_location_id?: string; // Primary work location
  can_work_multiple_locations?: boolean; // Multi-location capability
}

// Labor Cost Analysis Types
export interface DepartmentCostAnalysis {
  department: string;
  avg_hourly_cost: number;
  total_hours: number;
  total_cost: number;
  efficiency_score: number;
  employee_count: number;
}

// Performance Dashboard Types
export interface TopPerformer {
  id: string;
  name: string;
  avatar_url?: string;
  position: string;
  department: string;
  performance_score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceAlert {
  id: string;
  type: 'low_performance' | 'absence' | 'training_due' | 'review_due';
  severity: 'low' | 'medium' | 'high';
  message: string;
  employee_id?: string;
  employee_name?: string;
}