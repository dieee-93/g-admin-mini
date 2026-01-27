// =============================================================================
// LABOR COST CALCULATION SERVICE
// =============================================================================
// Calculates labor costs for product staff allocations with:
// - Loaded factor hierarchy (allocation → role → employment_type → org → system)
// - Hourly rate hierarchy (allocation → employee → role → fallback)
// - Decimal.js precision for financial calculations
//
// See: docs/product/COSTING_ARCHITECTURE.md (Section 5.6, 5.7, 5.9)
// =============================================================================

import Decimal from 'decimal.js';
import { supabase } from '@/lib/supabase/client';
import type {
  StaffAllocation,
  LaborCostResult,
  LaborCostBreakdownItem,
  LaborCostingConfig,
  StaffRole,
} from '../types/staffRole';
import { DEFAULT_LABOR_COSTING_CONFIG } from '../types/staffRole';

// =============================================================================
// CONSTANTS
// =============================================================================

/** System default loaded factor if nothing else is configured */
const SYSTEM_DEFAULT_LOADED_FACTOR = 1.325;

/** Default decimal precision for calculations */
const DEFAULT_PRECISION = 4;

// Configure Decimal.js globally
Decimal.config({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// =============================================================================
// MAIN CALCULATION FUNCTION
// =============================================================================

/**
 * Calculate labor cost for a set of staff allocations
 * 
 * This is the main entry point for labor cost calculation.
 * It resolves hourly rates and loaded factors according to the hierarchy
 * defined in COSTING_ARCHITECTURE.md.
 * 
 * @param allocations - Array of staff allocations to calculate
 * @param config - Optional labor costing config (will fetch if not provided)
 * @returns Labor cost result with total and breakdown
 * 
 * @example
 * ```typescript
 * const result = await calculateLaborCost([
 *   { role_id: 'uuid-cocinero', duration_minutes: 10, count: 1 },
 *   { role_id: 'uuid-ayudante', duration_minutes: 5, count: 2 },
 * ]);
 * console.log(`Total labor cost: $${result.total_cost}`);
 * ```
 */
export async function calculateLaborCost(
  allocations: StaffAllocation[],
  config?: LaborCostingConfig
): Promise<LaborCostResult> {
  // Get config if not provided
  const costingConfig = config ?? await fetchLaborCostingConfig();
  const precision = costingConfig.calculation_precision ?? DEFAULT_PRECISION;

  // Configure Decimal.js precision
  Decimal.config({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

  // Accumulate results
  let totalCost = new Decimal(0);
  let totalHours = new Decimal(0);
  const breakdown: LaborCostBreakdownItem[] = [];

  // Process each allocation
  for (const allocation of allocations) {
    const item = await calculateAllocationCost(allocation, costingConfig);
    
    totalCost = totalCost.plus(item.cost);
    totalHours = totalHours.plus(item.hours);
    breakdown.push(item);
  }

  // Round final cost if configured
  const finalCost = costingConfig.round_to_cents
    ? totalCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : totalCost.toDecimalPlaces(precision);

  return {
    total_cost: finalCost.toNumber(),
    total_hours: totalHours.toDecimalPlaces(precision).toNumber(),
    breakdown,
  };
}

/**
 * Calculate cost for a single allocation
 */
async function calculateAllocationCost(
  allocation: StaffAllocation,
  config: LaborCostingConfig
): Promise<LaborCostBreakdownItem> {
  // Fetch role data
  const role = await fetchStaffRole(allocation.role_id);
  
  // Fetch employee data if specified
  const employee = allocation.employee_id
    ? await fetchEmployee(allocation.employee_id)
    : null;

  // Resolve hourly rate using hierarchy
  const hourlyRate = resolveHourlyRate(allocation, role, employee);

  // Resolve loaded factor using hierarchy
  const loadedFactor = resolveLoadedFactor(allocation, role, employee, config);

  // Calculate loaded hourly cost
  const loadedHourlyCost = new Decimal(hourlyRate).times(loadedFactor);

  // Calculate hours: (duration_minutes / 60) * count
  const hours = new Decimal(allocation.duration_minutes)
    .dividedBy(60)
    .times(allocation.count || 1);

  // Calculate cost: hours * loaded_hourly_cost
  const cost = hours.times(loadedHourlyCost);

  return {
    allocation_id: allocation.id,
    role_id: allocation.role_id,
    role_name: role?.name ?? 'Unknown Role',
    employee_id: allocation.employee_id ?? undefined,
    employee_name: employee
      ? `${employee.first_name} ${employee.last_name}`
      : undefined,
    count: allocation.count || 1,
    duration_minutes: allocation.duration_minutes,
    hourly_rate: hourlyRate,
    loaded_factor: loadedFactor,
    loaded_hourly_cost: loadedHourlyCost.toNumber(),
    hours: hours.toNumber(),
    cost: cost.toNumber(),
  };
}

// =============================================================================
// RATE RESOLUTION (Hierarchy)
// =============================================================================

/**
 * Resolve hourly rate using the hierarchy:
 * 1. StaffAllocation.hourly_rate (override)
 * 2. Employee.hourly_rate (if employee_id provided)
 * 3. StaffRole.default_hourly_rate
 * 4. Fallback: 0 (with warning)
 */
function resolveHourlyRate(
  allocation: StaffAllocation,
  role: StaffRole | null,
  employee: EmployeeData | null
): number {
  // 1. Override in allocation
  if (allocation.hourly_rate != null && allocation.hourly_rate > 0) {
    return allocation.hourly_rate;
  }

  // 2. Employee's hourly rate
  if (employee?.hourly_rate != null && employee.hourly_rate > 0) {
    return employee.hourly_rate;
  }

  // 3. Role's default hourly rate
  if (role?.default_hourly_rate != null && role.default_hourly_rate > 0) {
    return role.default_hourly_rate;
  }

  // 4. Fallback with warning
  console.warn(
    `[LaborCost] No hourly rate found for allocation. ` +
    `Role: ${role?.name ?? allocation.role_id}. Using 0.`
  );
  return 0;
}

/**
 * Resolve loaded factor using the hierarchy:
 * 1. StaffAllocation.loaded_factor_override
 * 2. StaffRole.loaded_factor
 * 3. LaborCostingConfig.factors_by_employment_type[employee.employment_type]
 * 4. LaborCostingConfig.default_loaded_factor
 * 5. System default: 1.325
 */
function resolveLoadedFactor(
  allocation: StaffAllocation,
  role: StaffRole | null,
  employee: EmployeeData | null,
  config: LaborCostingConfig
): number {
  // 1. Override in allocation
  if (allocation.loaded_factor_override != null) {
    return allocation.loaded_factor_override;
  }

  // 2. Role's loaded factor (if not default 1.0)
  if (role?.loaded_factor != null && role.loaded_factor !== 1.0) {
    return role.loaded_factor;
  }

  // 3. Factor by employment type
  if (employee?.employment_type && config.factors_by_employment_type) {
    const typeFactors = config.factors_by_employment_type as Record<string, number | undefined>;
    const factor = typeFactors[employee.employment_type];
    if (factor != null) {
      return factor;
    }
  }

  // 4. Organization default
  if (config.default_loaded_factor != null) {
    return config.default_loaded_factor;
  }

  // 5. System default
  return SYSTEM_DEFAULT_LOADED_FACTOR;
}

// =============================================================================
// DATA FETCHING
// =============================================================================

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate: number | null;
  employment_type: string | null;
  staff_role_id: string | null;
}

/**
 * Fetch staff role by ID
 */
async function fetchStaffRole(roleId: string): Promise<StaffRole | null> {
  const { data, error } = await supabase
    .from('staff_roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error || !data) {
    console.warn(`[LaborCost] Could not fetch role ${roleId}`);
    return null;
  }

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    organization_id: row.organization_id as string,
    name: row.name as string,
    department: row.department as string | null,
    description: row.description as string | null,
    default_hourly_rate: row.default_hourly_rate as number | null,
    loaded_factor: (row.loaded_factor as number | null) ?? 1.0,
    is_active: (row.is_active as boolean | null) ?? true,
    sort_order: (row.sort_order as number | null) ?? 0,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/**
 * Fetch employee by ID
 */
async function fetchEmployee(employeeId: string): Promise<EmployeeData | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, first_name, last_name, hourly_rate, employment_type, staff_role_id')
    .eq('id', employeeId)
    .single();

  if (error || !data) {
    console.warn(`[LaborCost] Could not fetch employee ${employeeId}`);
    return null;
  }

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    hourly_rate: row.hourly_rate as number | null,
    employment_type: row.employment_type as string | null,
    staff_role_id: row.staff_role_id as string | null,
  };
}

/**
 * Fetch labor costing config from staff_policies
 */
async function fetchLaborCostingConfig(): Promise<LaborCostingConfig> {
  const { data, error } = await supabase
    .from('staff_policies')
    .select('labor_costing_config')
    .limit(1)
    .single();

  if (error || !data) {
    console.warn('[LaborCost] Could not fetch config, using defaults');
    return { ...DEFAULT_LABOR_COSTING_CONFIG };
  }

  const row = data as Record<string, unknown>;
  if (!row.labor_costing_config) {
    return { ...DEFAULT_LABOR_COSTING_CONFIG };
  }

  return {
    ...DEFAULT_LABOR_COSTING_CONFIG,
    ...(row.labor_costing_config as Partial<LaborCostingConfig>),
  };
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Prefetch all roles needed for a set of allocations
 * Useful for optimizing when calculating many products
 */
export async function prefetchRolesForAllocations(
  allocations: StaffAllocation[]
): Promise<Map<string, StaffRole>> {
  const roleIds = [...new Set(allocations.map(a => a.role_id))];
  
  if (roleIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('staff_roles')
    .select('*')
    .in('id', roleIds);

  if (error || !data) {
    console.warn('[LaborCost] Could not prefetch roles');
    return new Map();
  }

  const map = new Map<string, StaffRole>();
  for (const row of data as Record<string, unknown>[]) {
    const role: StaffRole = {
      id: row.id as string,
      organization_id: row.organization_id as string,
      name: row.name as string,
      department: row.department as string | null,
      description: row.description as string | null,
      default_hourly_rate: row.default_hourly_rate as number | null,
      loaded_factor: (row.loaded_factor as number | null) ?? 1.0,
      is_active: (row.is_active as boolean | null) ?? true,
      sort_order: (row.sort_order as number | null) ?? 0,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
    map.set(role.id, role);
  }

  return map;
}

/**
 * Calculate labor cost with pre-fetched roles (optimized version)
 */
export async function calculateLaborCostOptimized(
  allocations: StaffAllocation[],
  rolesMap: Map<string, StaffRole>,
  config?: LaborCostingConfig
): Promise<LaborCostResult> {
  const costingConfig = config ?? await fetchLaborCostingConfig();
  const precision = costingConfig.calculation_precision ?? DEFAULT_PRECISION;

  Decimal.config({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

  let totalCost = new Decimal(0);
  let totalHours = new Decimal(0);
  const breakdown: LaborCostBreakdownItem[] = [];

  for (const allocation of allocations) {
    const role = rolesMap.get(allocation.role_id) ?? null;
    
    // Still need to fetch employee if specified
    const employee = allocation.employee_id
      ? await fetchEmployee(allocation.employee_id)
      : null;

    const hourlyRate = resolveHourlyRate(allocation, role, employee);
    const loadedFactor = resolveLoadedFactor(allocation, role, employee, costingConfig);
    const loadedHourlyCost = new Decimal(hourlyRate).times(loadedFactor);
    const hours = new Decimal(allocation.duration_minutes)
      .dividedBy(60)
      .times(allocation.count || 1);
    const cost = hours.times(loadedHourlyCost);

    totalCost = totalCost.plus(cost);
    totalHours = totalHours.plus(hours);

    breakdown.push({
      allocation_id: allocation.id,
      role_id: allocation.role_id,
      role_name: role?.name ?? 'Unknown Role',
      employee_id: allocation.employee_id ?? undefined,
      employee_name: employee
        ? `${employee.first_name} ${employee.last_name}`
        : undefined,
      count: allocation.count || 1,
      duration_minutes: allocation.duration_minutes,
      hourly_rate: hourlyRate,
      loaded_factor: loadedFactor,
      loaded_hourly_cost: loadedHourlyCost.toNumber(),
      hours: hours.toNumber(),
      cost: cost.toNumber(),
    });
  }

  const finalCost = costingConfig.round_to_cents
    ? totalCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : totalCost.toDecimalPlaces(precision);

  return {
    total_cost: finalCost.toNumber(),
    total_hours: totalHours.toDecimalPlaces(precision).toNumber(),
    breakdown,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate loaded hourly cost from rate and factor
 * Simple utility for UI display
 */
export function calculateLoadedHourlyCost(
  hourlyRate: number | null | undefined,
  loadedFactor: number | null | undefined
): number {
  const rate = hourlyRate ?? 0;
  const factor = loadedFactor ?? 1.0;
  return new Decimal(rate).times(factor).toNumber();
}

/**
 * Estimate labor cost without fetching data
 * Useful for quick UI calculations when data is already available
 */
export function estimateLaborCost(
  allocations: Array<{
    duration_minutes: number;
    count: number;
    loaded_hourly_cost: number;
  }>
): number {
  return allocations.reduce((sum, alloc) => {
    const hours = (alloc.duration_minutes / 60) * (alloc.count || 1);
    return sum + hours * alloc.loaded_hourly_cost;
  }, 0);
}
