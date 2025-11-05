/**
 * Mobile Service - Main orchestrator for mobile operations
 *
 * This service re-exports GPS tracking and route optimization from Fulfillment/delivery
 * and adds mobile-specific functionality (route planning, mobile inventory).
 *
 * REUSES: 76% of code from Fulfillment/delivery module (GPS, optimization)
 * NEW: Route planning for multiple stops, mobile inventory tracking
 */

// ============================================
// RE-EXPORT Existing Services (from Fulfillment/delivery)
// ============================================

export { gpsTrackingService } from '@/modules/fulfillment/delivery/services/gpsTrackingService';
export { routeOptimizationService } from '@/modules/fulfillment/delivery/services/routeOptimizationService';
export { useDriverLocation } from '@/modules/fulfillment/delivery/hooks/useDriverLocation';

export type { GPSLocation } from '@/modules/fulfillment/delivery/services/gpsTrackingService';
export type { DriverSuggestion } from '@/modules/fulfillment/delivery/types';

// ============================================
// NEW: Mobile-specific Services
// ============================================

export { routePlanningService } from './routePlanningService';
export { mobileInventoryService } from './mobileInventoryService';

// ============================================
// Convenience Functions (aggregates existing services)
// ============================================

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { MobileRoute, DriverLocation } from '../types';

const MODULE_ID = 'mobile.service';

/**
 * Get all active mobile routes for today
 */
export async function getTodaysActiveRoutes(): Promise<{
  data: MobileRoute[];
  error: Error | null;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mobile_routes')
      .select('*')
      .eq('route_date', today)
      .in('status', ['planned', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to get active routes');
    logger.error(MODULE_ID, 'Error getting active routes', error);
    return { data: [], error };
  }
}

/**
 * Get driver's current route
 */
export async function getDriverCurrentRoute(driverId: string): Promise<{
  data: MobileRoute | null;
  error: Error | null;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mobile_routes')
      .select('*')
      .eq('driver_id', driverId)
      .eq('route_date', today)
      .eq('status', 'in_progress')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows"

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to get driver route');
    logger.error(MODULE_ID, 'Error getting driver route', error);
    return { data: null, error };
  }
}

/**
 * Get all drivers currently on routes
 */
export async function getActiveDriversWithLocations(): Promise<{
  data: Array<{ driver_id: string; route: MobileRoute; location: DriverLocation | null }>;
  error: Error | null;
}> {
  try {
    // Get active routes
    const { data: routes, error: routesError } = await getTodaysActiveRoutes();
    if (routesError) throw routesError;

    // Get latest locations for all drivers
    const driverIds = routes.map((r) => r.driver_id).filter(Boolean) as string[];

    const { data: locations, error: locationsError } = await supabase
      .from('driver_locations')
      .select('*')
      .in('driver_id', driverIds)
      .order('timestamp', { ascending: false });

    if (locationsError) throw locationsError;

    // Group locations by driver (take most recent)
    const locationsByDriver = new Map<string, DriverLocation>();
    locations?.forEach((loc) => {
      if (!locationsByDriver.has(loc.driver_id)) {
        locationsByDriver.set(loc.driver_id, loc);
      }
    });

    // Combine routes with locations
    const result = routes
      .filter((route) => route.driver_id)
      .map((route) => ({
        driver_id: route.driver_id!,
        route,
        location: locationsByDriver.get(route.driver_id!) || null
      }));

    return { data: result, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to get active drivers');
    logger.error(MODULE_ID, 'Error getting active drivers', error);
    return { data: [], error };
  }
}
