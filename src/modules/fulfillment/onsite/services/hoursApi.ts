/**
 * Operating Hours API Service
 * Handles Supabase queries for operating hours configuration
 * 
 * @module fulfillment-onsite
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

/**
 * Hours configuration for a single day
 */
export interface DayHours {
  open: string;   // Format: "HH:mm" (e.g., "09:00")
  close: string;  // Format: "HH:mm" (e.g., "22:00")
  closed?: boolean; // If true, location is closed this day
}

/**
 * Weekly hours configuration
 * Keys: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
 */
export type Hours = Record<string, DayHours>;

/**
 * Operating hours row from database
 */
export interface OperatingHoursRow {
  id: string;
  location_id: string;
  type: 'operating' | 'pickup' | 'delivery';
  hours: Hours;
  created_at: string;
  updated_at: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch operating hours for a specific location and type
 */
export async function fetchOperatingHours(
  locationId: string,
  type: 'operating' | 'pickup' | 'delivery' = 'operating'
): Promise<Hours | null> {
  try {
    const { data, error } = await supabase
      .from('operating_hours')
      .select('hours')
      .eq('location_id', locationId)
      .eq('type', type)
      .maybeSingle();

    if (error) throw error;

    logger.info('HoursApi', `Fetched ${type} hours for location ${locationId}`);
    return data?.hours || null;

  } catch (error) {
    logger.error('HoursApi', `Failed to fetch ${type} hours:`, error);
    throw error;
  }
}

/**
 * Update or create operating hours for a location
 */
export async function upsertOperatingHours(
  locationId: string,
  type: 'operating' | 'pickup' | 'delivery',
  hours: Hours
): Promise<OperatingHoursRow> {
  try {
    const { data, error } = await supabase
      .from('operating_hours')
      .upsert(
        {
          location_id: locationId,
          type,
          hours,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'location_id,type' }
      )
      .select()
      .single();

    if (error) throw error;

    logger.info('HoursApi', `Updated ${type} hours for location ${locationId}`);
    return data;

  } catch (error) {
    logger.error('HoursApi', `Failed to update ${type} hours:`, error);
    throw error;
  }
}

/**
 * Delete operating hours for a location and type
 */
export async function deleteOperatingHours(
  locationId: string,
  type: 'operating' | 'pickup' | 'delivery'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('operating_hours')
      .delete()
      .eq('location_id', locationId)
      .eq('type', type);

    if (error) throw error;

    logger.info('HoursApi', `Deleted ${type} hours for location ${locationId}`);

  } catch (error) {
    logger.error('HoursApi', `Failed to delete ${type} hours:`, error);
    throw error;
  }
}

/**
 * Fetch all operating hours types for a location
 */
export async function fetchAllHoursForLocation(
  locationId: string
): Promise<OperatingHoursRow[]> {
  try {
    const { data, error } = await supabase
      .from('operating_hours')
      .select('*')
      .eq('location_id', locationId)
      .order('type');

    if (error) throw error;

    logger.info('HoursApi', `Fetched all hours for location ${locationId}`);
    return data || [];

  } catch (error) {
    logger.error('HoursApi', 'Failed to fetch all hours:', error);
    throw error;
  }
}
