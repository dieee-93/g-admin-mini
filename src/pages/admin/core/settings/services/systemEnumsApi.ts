/**
 * SYSTEM ENUMS API SERVICE
 * 
 * CRUD operations for system_enums table
 * Handles: staff_departments, product_types, asset_categories, 
 *          material_categories, loyalty_tiers
 * 
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export type EnumType = 
  | 'staff_department' 
  | 'product_type' 
  | 'asset_category' 
  | 'material_category' 
  | 'loyalty_tier';

export interface SystemEnum {
  id: string;
  enum_type: EnumType;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateSystemEnumInput {
  enum_type: EnumType;
  key: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateSystemEnumInput {
  label?: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all system enums
 */
export async function fetchSystemEnums(): Promise<SystemEnum[]> {
  const { data, error } = await supabase
    .from('system_enums')
    .select('*')
    .order('enum_type', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to fetch system enums', error);
    throw error;
  }

  return data as SystemEnum[];
}

/**
 * Fetch system enums by type
 */
export async function fetchSystemEnumsByType(enumType: EnumType): Promise<SystemEnum[]> {
  const { data, error } = await supabase
    .from('system_enums')
    .select('*')
    .eq('enum_type', enumType)
    .order('sort_order', { ascending: true });

  if (error) {
    logger.error('SystemEnumsApi', `Failed to fetch ${enumType} enums`, error);
    throw error;
  }

  return data as SystemEnum[];
}

/**
 * Fetch active system enums by type (for dropdowns)
 */
export async function fetchActiveSystemEnumsByType(enumType: EnumType): Promise<SystemEnum[]> {
  const { data, error } = await supabase
    .from('system_enums')
    .select('*')
    .eq('enum_type', enumType)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    logger.error('SystemEnumsApi', `Failed to fetch active ${enumType} enums`, error);
    throw error;
  }

  return data as SystemEnum[];
}

/**
 * Fetch single system enum by ID
 */
export async function fetchSystemEnum(id: string): Promise<SystemEnum> {
  const { data, error } = await supabase
    .from('system_enums')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to fetch system enum', { id, error });
    throw error;
  }

  return data as SystemEnum;
}

/**
 * Fetch single system enum by type and key
 */
export async function fetchSystemEnumByKey(
  enumType: EnumType,
  key: string
): Promise<SystemEnum> {
  const { data, error } = await supabase
    .from('system_enums')
    .select('*')
    .eq('enum_type', enumType)
    .eq('key', key)
    .single();

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to fetch system enum by key', { enumType, key, error });
    throw error;
  }

  return data as SystemEnum;
}

/**
 * Create new system enum
 */
export async function createSystemEnum(input: CreateSystemEnumInput): Promise<SystemEnum> {
  const { data, error } = await supabase
    .from('system_enums')
    .insert(input)
    .select()
    .single();

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to create system enum', error);
    throw error;
  }

  logger.info('SystemEnumsApi', 'System enum created', { 
    id: data.id, 
    type: data.enum_type, 
    key: data.key 
  });
  return data as SystemEnum;
}

/**
 * Update system enum
 */
export async function updateSystemEnum(
  id: string,
  updates: UpdateSystemEnumInput
): Promise<SystemEnum> {
  const { data, error } = await supabase
    .from('system_enums')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to update system enum', { id, error });
    throw error;
  }

  logger.info('SystemEnumsApi', 'System enum updated', { id: data.id });
  return data as SystemEnum;
}

/**
 * Toggle system enum active status
 */
export async function toggleSystemEnum(id: string, isActive: boolean): Promise<SystemEnum> {
  const { data, error } = await supabase
    .from('system_enums')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to toggle system enum', { id, error });
    throw error;
  }

  logger.info('SystemEnumsApi', 'System enum toggled', { id, isActive });
  return data as SystemEnum;
}

/**
 * Delete system enum (only non-system enums)
 */
export async function deleteSystemEnum(id: string): Promise<void> {
  // First check if it's a system enum
  const { data: enumData } = await supabase
    .from('system_enums')
    .select('is_system, label')
    .eq('id', id)
    .single();

  if (enumData?.is_system) {
    throw new Error('Cannot delete system enums. Deactivate them instead.');
  }

  const { error } = await supabase
    .from('system_enums')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to delete system enum', { id, error });
    throw error;
  }

  logger.info('SystemEnumsApi', 'System enum deleted', { id });
}

/**
 * Reorder system enums (update sort_order for multiple items)
 */
export async function reorderSystemEnums(
  enumType: EnumType,
  orderedIds: string[]
): Promise<void> {
  // Update sort_order for each item
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: (index + 1) * 10,
  }));

  const { error } = await supabase
    .from('system_enums')
    .upsert(updates, { onConflict: 'id' });

  if (error) {
    logger.error('SystemEnumsApi', 'Failed to reorder system enums', { enumType, error });
    throw error;
  }

  logger.info('SystemEnumsApi', 'System enums reordered', { enumType, count: orderedIds.length });
}

// ============================================
// HELPER FUNCTIONS - Convert enums to options
// ============================================

/**
 * Get enum options for dropdowns (active only)
 */
export async function getEnumOptions(
  enumType: EnumType
): Promise<Array<{ value: string; label: string }>> {
  const enums = await fetchActiveSystemEnumsByType(enumType);
  return enums.map(e => ({ value: e.key, label: e.label }));
}
