/**
 * INVENTORY ALERTS API SERVICE
 * 
 * Supabase API layer for inventory_alert_settings CRUD operations
 * Handles business configuration for thresholds and auto-reorder logic
 * 
 * ARCHITECTURE NOTE:
 * This service manages BUSINESS LOGIC only (thresholds, EOQ, ABC).
 * For notification/alert delivery (recipients, channels), use notificationsApi.ts
 * 
 * @version 2.0.0
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface ABCAnalysisThresholds {
  a_threshold: number; // Percentage for A items (typically 80%)
  b_threshold: number; // Percentage for B items (typically 15%)
  c_threshold: number; // Percentage for C items (typically 5%)
}

export interface ReorderQuantityRules {
  method: 'economic_order_quantity' | 'fixed' | 'days_of_supply';
  min_order: number;
  max_order: number;
  safety_stock_days: number;
  lead_time_days: number;
  order_point_method: 'fixed' | 'dynamic';
  reorder_multiplier: number;
  fixed_quantity?: number; // For fixed method
}

export interface InventoryAlertSettings {
  id: string;
  
  // Threshold Configuration
  low_stock_threshold: number;
  critical_stock_threshold: number;
  out_of_stock_threshold: number;
  
  // ABC Analysis
  abc_analysis_thresholds: ABCAnalysisThresholds;
  abc_analysis_enabled: boolean;
  
  // Expiry Configuration
  expiry_warning_days: number;
  expiry_critical_days: number;
  
  // Waste Configuration
  waste_threshold_percent: number;
  
  // Auto-Reorder Configuration
  auto_reorder_enabled: boolean;
  reorder_quantity_rules: ReorderQuantityRules;
  
  // Metadata
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateInventoryAlertSettingsInput {
  low_stock_threshold?: number;
  critical_stock_threshold?: number;
  out_of_stock_threshold?: number;
  abc_analysis_thresholds?: ABCAnalysisThresholds;
  abc_analysis_enabled?: boolean;
  expiry_warning_days?: number;
  expiry_critical_days?: number;
  waste_threshold_percent?: number;
  auto_reorder_enabled?: boolean;
  reorder_quantity_rules?: ReorderQuantityRules;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all inventory alert settings
 */
export async function fetchInventoryAlertSettings(): Promise<InventoryAlertSettings[]> {
  const { data, error } = await supabase
    .from('inventory_alert_settings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('InventoryAlertsApi', 'Failed to fetch inventory alert settings', error);
    throw error;
  }

  return data as InventoryAlertSettings[];
}

/**
 * Fetch single inventory alert settings by ID
 */
export async function fetchInventoryAlertSettingsById(id: string): Promise<InventoryAlertSettings> {
  const { data, error } = await supabase
    .from('inventory_alert_settings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('InventoryAlertsApi', `Failed to fetch inventory alert settings ${id}`, error);
    throw error;
  }

  return data as InventoryAlertSettings;
}

/**
 * Fetch the system default inventory alert settings
 */
export async function fetchSystemInventoryAlertSettings(): Promise<InventoryAlertSettings> {
  const { data, error } = await supabase
    .from('inventory_alert_settings')
    .select('*')
    .eq('is_system', true)
    .single();

  if (error) {
    logger.error('InventoryAlertsApi', 'Failed to fetch system inventory alert settings', error);
    throw error;
  }

  return data as InventoryAlertSettings;
}

/**
 * Update inventory alert settings
 */
export async function updateInventoryAlertSettings(
  id: string,
  updates: UpdateInventoryAlertSettingsInput
): Promise<InventoryAlertSettings> {
  const { data, error } = await supabase
    .from('inventory_alert_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('InventoryAlertsApi', `Failed to update inventory alert settings ${id}`, error);
    throw error;
  }

  logger.info('InventoryAlertsApi', `Updated inventory alert settings ${id}`);
  return data as InventoryAlertSettings;
}

/**
 * Toggle auto-reorder enabled/disabled
 */
export async function toggleAutoReorder(
  id: string,
  enabled: boolean
): Promise<InventoryAlertSettings> {
  const { data, error } = await supabase
    .from('inventory_alert_settings')
    .update({ auto_reorder_enabled: enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('InventoryAlertsApi', `Failed to toggle auto-reorder for ${id}`, error);
    throw error;
  }

  logger.info('InventoryAlertsApi', `Toggled auto-reorder ${enabled ? 'ON' : 'OFF'} for ${id}`);
  return data as InventoryAlertSettings;
}

/**
 * Toggle ABC analysis enabled/disabled
 */
export async function toggleABCAnalysis(
  id: string,
  enabled: boolean
): Promise<InventoryAlertSettings> {
  const { data, error } = await supabase
    .from('inventory_alert_settings')
    .update({ abc_analysis_enabled: enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('InventoryAlertsApi', `Failed to toggle ABC analysis for ${id}`, error);
    throw error;
  }

  logger.info('InventoryAlertsApi', `Toggled ABC analysis ${enabled ? 'ON' : 'OFF'} for ${id}`);
  return data as InventoryAlertSettings;
}
