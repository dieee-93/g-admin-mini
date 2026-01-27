// =============================================================================
// STAFF ROLES API - CRUD and Costing Operations
// =============================================================================
// Manages job roles (JobRole) for labor costing.
// NOT to be confused with system roles (ADMIN, SUPERVISOR, etc.)
//
// See: docs/product/COSTING_ARCHITECTURE.md (Section 5)
// =============================================================================

import { supabase } from '@/lib/supabase/client';
import type {
  JobRole,
  TeamRoleOption,
  TeamRoleFormData,
  TeamRoleFilters,
  LaborCostingConfig,
} from '../types/jobRole';
import { DEFAULT_LABOR_COSTING_CONFIG } from '../types/jobRole';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate loaded hourly cost from rate and factor
 */
function calculateLoadedHourlyCost(
  hourlyRate: number | null | undefined,
  loadedFactor: number | null | undefined
): number {
  const rate = hourlyRate ?? 0;
  const factor = loadedFactor ?? 1.0;
  return rate * factor;
}

/**
 * Map database row to JobRole domain type
 */
function mapToTeamRole(row: Record<string, unknown>): JobRole {
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
    loaded_hourly_cost: calculateLoadedHourlyCost(
      row.default_hourly_rate as number | null,
      row.loaded_factor as number | null
    ),
  };
}

/**
 * Map database row to TeamRoleOption (lightweight)
 */
function mapToTeamRoleOption(row: Record<string, unknown>): TeamRoleOption {
  return {
    id: row.id as string,
    name: row.name as string,
    department: row.department as string | null,
    default_hourly_rate: row.default_hourly_rate as number | null,
    loaded_factor: (row.loaded_factor as number | null) ?? 1.0,
    loaded_hourly_cost: calculateLoadedHourlyCost(
      row.default_hourly_rate as number | null,
      row.loaded_factor as number | null
    ),
  };
}

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

/**
 * Get all team roles for the organization
 */
export async function getTeamRoles(
  filters?: TeamRoleFilters
): Promise<JobRole[]> {
  let query = supabase
    .from('job_roles')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  // Apply filters
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  
  if (filters?.department) {
    query = query.eq('department', filters.department);
  }
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching team roles:', error);
    throw new Error(`Failed to fetch team roles: ${error.message}`);
  }

  return (data as Record<string, unknown>[] ?? []).map(mapToTeamRole);
}

/**
 * Get active team roles for allocation selectors
 * Returns lightweight objects optimized for dropdowns
 */
export async function getTeamRolesForAllocation(): Promise<TeamRoleOption[]> {
  const { data, error } = await supabase
    .from('job_roles')
    .select('id, name, department, default_hourly_rate, loaded_factor')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching team roles for allocation:', error);
    throw new Error(`Failed to fetch team roles: ${error.message}`);
  }

  return (data as Record<string, unknown>[] ?? []).map(mapToTeamRoleOption);
}

/**
 * Get a single team role by ID
 */
export async function getTeamRole(id: string): Promise<JobRole | null> {
  const { data, error } = await supabase
    .from('job_roles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching team role:', error);
    throw new Error(`Failed to fetch team role: ${error.message}`);
  }

  return mapToTeamRole(data as Record<string, unknown>);
}

/**
 * Create a new team role
 */
export async function createTeamRole(
  formData: TeamRoleFormData,
  organizationId: string
): Promise<JobRole> {
  const insertData = {
    organization_id: organizationId,
    name: formData.name,
    department: formData.department || null,
    description: formData.description || null,
    default_hourly_rate: formData.default_hourly_rate || null,
    loaded_factor: formData.loaded_factor ?? 1.0,
    is_active: formData.is_active ?? true,
    sort_order: formData.sort_order ?? 0,
  };

  const { data, error } = await supabase
    .from('job_roles')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating team role:', error);
    throw new Error(`Failed to create team role: ${error.message}`);
  }

  return mapToTeamRole(data as Record<string, unknown>);
}

/**
 * Update an existing team role
 */
export async function updateTeamRole(
  id: string,
  formData: Partial<TeamRoleFormData>
): Promise<JobRole> {
  const updateData: Record<string, unknown> = {};
  
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.department !== undefined) updateData.department = formData.department || null;
  if (formData.description !== undefined) updateData.description = formData.description || null;
  if (formData.default_hourly_rate !== undefined) updateData.default_hourly_rate = formData.default_hourly_rate;
  if (formData.loaded_factor !== undefined) updateData.loaded_factor = formData.loaded_factor;
  if (formData.is_active !== undefined) updateData.is_active = formData.is_active;
  if (formData.sort_order !== undefined) updateData.sort_order = formData.sort_order;

  const { data, error } = await supabase
    .from('job_roles')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team role:', error);
    throw new Error(`Failed to update team role: ${error.message}`);
  }

  return mapToTeamRole(data as Record<string, unknown>);
}

/**
 * Delete a team role
 * Note: This will fail if the role is referenced by product_team_allocations
 */
export async function deleteTeamRole(id: string): Promise<void> {
  const { error } = await supabase
    .from('job_roles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team role:', error);
    throw new Error(`Failed to delete team role: ${error.message}`);
  }
}

/**
 * Soft delete (deactivate) a team role
 */
export async function deactivateTeamRole(id: string): Promise<JobRole> {
  return updateTeamRole(id, { is_active: false });
}

// =============================================================================
// COSTING OPERATIONS
// =============================================================================

/**
 * Get the loaded hourly cost for a role
 * @param roleId - The role ID
 * @returns The loaded hourly cost (rate * factor), or 0 if not found
 */
export async function getRoleHourlyCost(roleId: string): Promise<number> {
  const { data, error } = await supabase
    .from('job_roles')
    .select('default_hourly_rate, loaded_factor')
    .eq('id', roleId)
    .single();

  if (error || !data) {
    console.warn(`Could not get hourly cost for role ${roleId}`);
    return 0;
  }

  const row = data as Record<string, unknown>;
  return calculateLoadedHourlyCost(
    row.default_hourly_rate as number | null,
    row.loaded_factor as number | null
  );
}

/**
 * Get labor costing config from team_policies
 */
export async function getLaborCostingConfig(): Promise<LaborCostingConfig> {
  const { data, error } = await supabase
    .from('team_policies')
    .select('labor_costing_config')
    .limit(1)
    .single();

  if (error || !data) {
    console.warn('Could not fetch labor costing config, using defaults');
    return { ...DEFAULT_LABOR_COSTING_CONFIG };
  }

  const row = data as Record<string, unknown>;
  if (!row.labor_costing_config) {
    return { ...DEFAULT_LABOR_COSTING_CONFIG };
  }

  // Merge with defaults to ensure all fields exist
  return {
    ...DEFAULT_LABOR_COSTING_CONFIG,
    ...(row.labor_costing_config as Partial<LaborCostingConfig>),
  };
}

/**
 * Update labor costing config in team_policies
 */
export async function updateLaborCostingConfig(
  config: Partial<LaborCostingConfig>
): Promise<LaborCostingConfig> {
  // First get current config
  const currentConfig = await getLaborCostingConfig();
  const newConfig = { ...currentConfig, ...config };

  const { error } = await supabase
    .from('team_policies')
    .update({ labor_costing_config: newConfig } as never)
    .not('id', 'is', null); // Update all rows (should be just one)

  if (error) {
    console.error('Error updating labor costing config:', error);
    throw new Error(`Failed to update labor costing config: ${error.message}`);
  }

  return newConfig;
}

/**
 * Get unique departments from job_roles
 */
export async function getTeamRoleDepartments(): Promise<string[]> {
  const { data, error } = await supabase
    .from('job_roles')
    .select('department')
    .not('department', 'is', null)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  // Get unique departments
  const departments = new Set<string>();
  (data as Record<string, unknown>[] ?? []).forEach(row => {
    if (row.department) {
      departments.add(row.department as string);
    }
  });

  return Array.from(departments).sort();
}

// =============================================================================
// BATCH OPERATIONS (for seeding/import)
// =============================================================================

/**
 * Create multiple team roles at once
 */
export async function createTeamRolesBatch(
  roles: TeamRoleFormData[],
  organizationId: string
): Promise<JobRole[]> {
  const insertData = roles.map(role => ({
    organization_id: organizationId,
    name: role.name,
    department: role.department || null,
    description: role.description || null,
    default_hourly_rate: role.default_hourly_rate || null,
    loaded_factor: role.loaded_factor ?? 1.0,
    is_active: role.is_active ?? true,
    sort_order: role.sort_order ?? 0,
  }));

  const { data, error } = await supabase
    .from('job_roles')
    .insert(insertData as never)
    .select();

  if (error) {
    console.error('Error creating team roles batch:', error);
    throw new Error(`Failed to create team roles: ${error.message}`);
  }

  return (data as Record<string, unknown>[] ?? []).map(mapToTeamRole);
}

// =============================================================================
// DEFAULT ROLES (for seeding new organizations)
// =============================================================================

/**
 * Default team roles for a gastronomy business
 */
export const DEFAULT_GASTRONOMY_ROLES: TeamRoleFormData[] = [
  { name: 'Chef Principal', department: 'Cocina', default_hourly_rate: 25, loaded_factor: 1.35, sort_order: 1 },
  { name: 'Cocinero', department: 'Cocina', default_hourly_rate: 15, loaded_factor: 1.30, sort_order: 2 },
  { name: 'Ayudante de Cocina', department: 'Cocina', default_hourly_rate: 10, loaded_factor: 1.25, sort_order: 3 },
  { name: 'Mesero', department: 'Servicio', default_hourly_rate: 12, loaded_factor: 1.25, sort_order: 10 },
  { name: 'Cajero', department: 'Servicio', default_hourly_rate: 13, loaded_factor: 1.25, sort_order: 11 },
  { name: 'Repartidor', department: 'Delivery', default_hourly_rate: 11, loaded_factor: 1.20, sort_order: 12 },
  { name: 'Gerente de Turno', department: 'Gerencia', default_hourly_rate: 20, loaded_factor: 1.40, sort_order: 20 },
];

/**
 * Default team roles for a professional services business
 */
export const DEFAULT_SERVICES_ROLES: TeamRoleFormData[] = [
  { name: 'Consultor Senior', department: 'Consultoría', default_hourly_rate: 80, loaded_factor: 1.45, sort_order: 1 },
  { name: 'Consultor', department: 'Consultoría', default_hourly_rate: 50, loaded_factor: 1.40, sort_order: 2 },
  { name: 'Analista', department: 'Consultoría', default_hourly_rate: 30, loaded_factor: 1.35, sort_order: 3 },
  { name: 'Recepcionista', department: 'Administración', default_hourly_rate: 15, loaded_factor: 1.25, sort_order: 10 },
];

/**
 * Default team roles for a beauty/barbershop business
 */
export const DEFAULT_BEAUTY_ROLES: TeamRoleFormData[] = [
  { name: 'Estilista Senior', department: 'Estilismo', default_hourly_rate: 25, loaded_factor: 1.35, sort_order: 1 },
  { name: 'Estilista', department: 'Estilismo', default_hourly_rate: 18, loaded_factor: 1.30, sort_order: 2 },
  { name: 'Barbero', department: 'Barbería', default_hourly_rate: 20, loaded_factor: 1.30, sort_order: 3 },
  { name: 'Manicurista', department: 'Uñas', default_hourly_rate: 15, loaded_factor: 1.25, sort_order: 10 },
  { name: 'Recepcionista', department: 'Administración', default_hourly_rate: 12, loaded_factor: 1.25, sort_order: 20 },
];

/**
 * Seed default roles for a new organization
 */
export async function seedDefaultRoles(
  organizationId: string,
  businessType: 'gastronomy' | 'services' | 'beauty' = 'gastronomy'
): Promise<JobRole[]> {
  const roleTemplates = {
    gastronomy: DEFAULT_GASTRONOMY_ROLES,
    services: DEFAULT_SERVICES_ROLES,
    beauty: DEFAULT_BEAUTY_ROLES,
  };

  return createTeamRolesBatch(roleTemplates[businessType], organizationId);
}
