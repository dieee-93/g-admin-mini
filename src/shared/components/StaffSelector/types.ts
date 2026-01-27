/**
 * STAFF SELECTOR TYPES
 * 
 * Types for the reusable StaffSelector component.
 * Designed to be injected into forms across multiple modules.
 * 
 * @see StaffAllocation in src/pages/admin/resources/team/types/staffRole.ts
 * @pattern Cross-Module via ModuleRegistry.getExports()
 */

/**
 * Staff assignment for the selector component.
 * 
 * This is a simplified version of StaffAllocation that focuses on
 * the assignment UI without tying to a specific product_id.
 * 
 * The parent component can map this to StaffAllocation when needed.
 */
export interface StaffAssignment {
  /** Temporary UI id (for list management) */
  id: string;
  
  // Assignment (role required, employee optional)
  role_id: string;
  role_name?: string;
  
  employee_id?: string | null;
  employee_name?: string;
  
  // Time requirements
  duration_minutes: number;
  count: number;  // Number of people needed (default: 1)
  
  // Costing (calculated by staff module API)
  hourly_rate?: number;
  loaded_factor?: number;
  loaded_hourly_cost?: number;
  total_cost?: number;
}

/**
 * Props for the StaffSelector component
 */
export interface StaffSelectorProps {
  /** Current assignments */
  value: StaffAssignment[];
  
  /** Callback when assignments change */
  onChange: (assignments: StaffAssignment[]) => void;
  
  // ============================================
  // UI OPTIONS
  // ============================================
  
  /** Display variant */
  variant?: 'compact' | 'standard';
  
  /** Placeholder text for role selector */
  placeholder?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Read-only mode */
  readOnly?: boolean;
  
  // ============================================
  // FEATURE FLAGS
  // ============================================
  
  /** Show labor cost badge and total (default: true) */
  showCost?: boolean;
  
  /** Show employee selector (default: true) */
  showEmployeeSelector?: boolean;
  
  /** Show duration input (default: true) */
  showDuration?: boolean;
  
  /** Show count (number of people) input (default: true) */
  showCount?: boolean;
  
  /** Default duration in minutes for new assignments */
  defaultDuration?: number;
  
  // ============================================
  // CONSTRAINTS
  // ============================================
  
  /** Maximum number of assignments allowed */
  maxAssignments?: number;
  
  /** Filter roles by department */
  filterByDepartment?: string;
  
  // ============================================
  // CALLBACKS
  // ============================================
  
  /** Callback when total cost changes */
  onCostChange?: (totalCost: number) => void;
}

/**
 * Internal state for quick-add form
 */
export interface QuickAddState {
  roleId: string;
  employeeId: string;
  duration: number;
  count: number;
}

/**
 * Role option from staff module API
 */
export interface StaffRoleOption {
  id: string;
  name: string;
  department?: string | null;
  default_hourly_rate?: number | null;
  loaded_factor: number;
  loaded_hourly_cost: number;
  is_active?: boolean;
}

/**
 * Employee option from staff module API
 */
export interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
  hourly_rate?: number;
  staff_role_id?: string;
  is_active?: boolean;
}
