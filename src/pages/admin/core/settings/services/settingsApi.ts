// Settings API - Business configuration database functions
// Connected to Supabase (2025-11-01)
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

import type {
  BusinessSettings,
  SystemSettings
} from '../types';

// ============================================
// TYPES
// ============================================

// Integration config type
type IntegrationConfig = Record<string, string | number | boolean | null>;

// User Role interface
export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  priority: number;
  created_at?: string;
  updated_at?: string;
}

// Integration interface
export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  type: 'payment' | 'messaging' | 'analytics' | 'delivery' | 'pos' | 'fiscal';
  config?: IntegrationConfig;
  last_sync?: string;
  last_error?: string;
  error_count?: number;
}

// User Preferences interface
export interface UserPreferences {
  id: string;
  user_id: string;
  preferences: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// BUSINESS PROFILE FUNCTIONS
// ============================================

/**
 * Get business profile
 * @returns Promise<BusinessSettings | null>
 */
export async function getBusinessProfile(): Promise<BusinessSettings | null> {
  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - return null
        logger.warn('App', 'No business profile found');
        return null;
      }
      throw error;
    }

    logger.info('App', 'Business profile retrieved successfully');
    return data as BusinessSettings;
  } catch (error) {
    logger.error('App', 'Failed to get business profile', error);
    throw error;
  }
}

/**
 * Update business profile
 * @param profile - Business settings to update
 * @param updatedBy - User ID performing the update
 * @returns Promise<BusinessSettings>
 */
export async function updateBusinessProfile(
  profile: Partial<BusinessSettings>,
  updatedBy: string
): Promise<BusinessSettings> {
  try {
    // Check if profile exists
    const existing = await getBusinessProfile();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('business_profiles')
        .update({
          ...profile,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      logger.info('App', 'Business profile updated successfully', { profileId: data.id });
      return data as BusinessSettings;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({
          ...profile,
          created_by: updatedBy,
          updated_by: updatedBy
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('App', 'Business profile created successfully', { profileId: data.id });
      return data as BusinessSettings;
    }
  } catch (error) {
    logger.error('App', 'Failed to update business profile', error);
    throw error;
  }
}

// ============================================
// SYSTEM SETTINGS FUNCTIONS
// ============================================

/**
 * Get system settings
 * @returns Promise<SystemSettings | null>
 */
export async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('App', 'No system settings found');
        return null;
      }
      throw error;
    }

    logger.info('App', 'System settings retrieved successfully');
    return data as SystemSettings;
  } catch (error) {
    logger.error('App', 'Failed to get system settings', error);
    throw error;
  }
}

/**
 * Update system settings
 * @param settings - System settings to update
 * @param updatedBy - User ID performing the update
 * @returns Promise<SystemSettings>
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>,
  updatedBy: string
): Promise<SystemSettings> {
  try {
    const existing = await getSystemSettings();

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          ...settings,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      logger.info('App', 'System settings updated successfully');
      return data as SystemSettings;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('system_settings')
        .insert({
          ...settings,
          updated_by: updatedBy
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('App', 'System settings created successfully');
      return data as SystemSettings;
    }
  } catch (error) {
    logger.error('App', 'Failed to update system settings', error);
    throw error;
  }
}

// ============================================
// USER ROLES FUNCTIONS
// ============================================

/**
 * Get all user roles
 * @returns Promise<UserRole[]>
 */
export async function getUserRoles(): Promise<UserRole[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;

    logger.info('App', 'User roles retrieved successfully', { count: data.length });
    return data.map(role => ({
      ...role,
      permissions: role.permissions as string[]
    })) as UserRole[];
  } catch (error) {
    logger.error('App', 'Failed to get user roles', error);
    throw error;
  }
}

/**
 * Get a specific role by ID
 * @param roleId - Role ID
 * @returns Promise<UserRole | null>
 */
export async function getUserRole(roleId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      permissions: data.permissions as string[]
    } as UserRole;
  } catch (error) {
    logger.error('App', 'Failed to get user role', error);
    throw error;
  }
}

/**
 * Create a new user role
 * @param role - Role data
 * @param createdBy - User ID creating the role
 * @returns Promise<UserRole>
 */
export async function createUserRole(
  role: Omit<UserRole, 'id' | 'created_at' | 'updated_at'>,
  createdBy: string
): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        ...role,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'User role created successfully', { roleName: data.name });
    return {
      ...data,
      permissions: data.permissions as string[]
    } as UserRole;
  } catch (error) {
    logger.error('App', 'Failed to create user role', error);
    throw error;
  }
}

/**
 * Update a user role
 * @param roleId - Role ID
 * @param updates - Role updates
 * @returns Promise<UserRole>
 */
export async function updateUserRole(
  roleId: string,
  updates: Partial<Omit<UserRole, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId)
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'User role updated successfully', { roleId });
    return {
      ...data,
      permissions: data.permissions as string[]
    } as UserRole;
  } catch (error) {
    logger.error('App', 'Failed to update user role', error);
    throw error;
  }
}

/**
 * Delete a user role
 * @param roleId - Role ID
 * @returns Promise<void>
 */
export async function deleteUserRole(roleId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;

    logger.info('App', 'User role deleted successfully', { roleId });
  } catch (error) {
    logger.error('App', 'Failed to delete user role', error);
    throw error;
  }
}

// ============================================
// USER PREFERENCES FUNCTIONS
// ============================================

/**
 * Get user preferences
 * @param userId - User ID
 * @returns Promise<UserPreferences | null>
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as UserPreferences;
  } catch (error) {
    logger.error('App', 'Failed to get user preferences', error);
    throw error;
  }
}

/**
 * Update user preferences
 * @param userId - User ID
 * @param preferences - Preferences to update
 * @returns Promise<UserPreferences>
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, unknown>
): Promise<UserPreferences> {
  try {
    const existing = await getUserPreferences(userId);

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          preferences: {
            ...existing.preferences,
            ...preferences
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      logger.info('App', 'User preferences updated successfully', { userId });
      return data as UserPreferences;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          preferences
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('App', 'User preferences created successfully', { userId });
      return data as UserPreferences;
    }
  } catch (error) {
    logger.error('App', 'Failed to update user preferences', error);
    throw error;
  }
}

// ============================================
// INTEGRATIONS FUNCTIONS
// ============================================

/**
 * Get all integrations
 * @returns Promise<Integration[]>
 */
export async function getIntegrations(): Promise<Integration[]> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('name');

    if (error) throw error;

    logger.info('App', 'Integrations retrieved successfully', { count: data.length });
    return data as Integration[];
  } catch (error) {
    logger.error('App', 'Failed to get integrations', error);
    throw error;
  }
}

/**
 * Get integrations by type
 * @param type - Integration type
 * @returns Promise<Integration[]>
 */
export async function getIntegrationsByType(
  type: Integration['type']
): Promise<Integration[]> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', type)
      .order('name');

    if (error) throw error;

    return data as Integration[];
  } catch (error) {
    logger.error('App', 'Failed to get integrations by type', error);
    throw error;
  }
}

/**
 * Get a specific integration by ID
 * @param integrationId - Integration ID
 * @returns Promise<Integration | null>
 */
export async function getIntegration(integrationId: string): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Integration;
  } catch (error) {
    logger.error('App', 'Failed to get integration', error);
    throw error;
  }
}

/**
 * Create a new integration
 * @param integration - Integration data
 * @param createdBy - User ID creating the integration
 * @returns Promise<Integration>
 */
export async function createIntegration(
  integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>,
  createdBy: string
): Promise<Integration> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .insert({
        ...integration,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'Integration created successfully', { name: data.name });
    return data as Integration;
  } catch (error) {
    logger.error('App', 'Failed to create integration', error);
    throw error;
  }
}

/**
 * Update integration configuration
 * @param integrationId - Integration ID
 * @param config - New configuration
 * @param updatedBy - User ID performing the update
 * @returns Promise<Integration>
 */
export async function updateIntegrationConfig(
  integrationId: string,
  config: IntegrationConfig
): Promise<Integration> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        config,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'Integration config updated successfully', { integrationId });
    return data as Integration;
  } catch (error) {
    logger.error('App', 'Failed to update integration config', error);
    throw error;
  }
}

/**
 * Update integration status
 * @param integrationId - Integration ID
 * @param status - New status
 * @returns Promise<Integration>
 */
export async function updateIntegrationStatus(
  integrationId: string,
  status: Integration['status']
): Promise<Integration> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'Integration status updated successfully', { integrationId, status });
    return data as Integration;
  } catch (error) {
    logger.error('App', 'Failed to update integration status', error);
    throw error;
  }
}

/**
 * Record integration sync
 * @param integrationId - Integration ID
 * @param success - Whether sync was successful
 * @param errorMessage - Error message if sync failed
 * @returns Promise<Integration>
 */
export async function recordIntegrationSync(
  integrationId: string,
  success: boolean,
  errorMessage?: string
): Promise<Integration> {
  try {
    const integration = await getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    const { data, error } = await supabase
      .from('integrations')
      .update({
        last_sync: new Date().toISOString(),
        status: success ? 'active' : 'error',
        last_error: success ? null : errorMessage,
        error_count: success ? 0 : (integration.error_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'Integration sync recorded', { integrationId, success });
    return data as Integration;
  } catch (error) {
    logger.error('App', 'Failed to record integration sync', error);
    throw error;
  }
}

/**
 * Delete an integration
 * @param integrationId - Integration ID
 * @returns Promise<void>
 */
export async function deleteIntegration(integrationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId);

    if (error) throw error;

    logger.info('App', 'Integration deleted successfully', { integrationId });
  } catch (error) {
    logger.error('App', 'Failed to delete integration', error);
    throw error;
  }
}
