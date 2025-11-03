/**
 * Route Planning Service
 *
 * NEW functionality for Mobile module:
 * - Daily route creation with multiple stops
 * - Waypoint optimization (best visit order)
 * - Performance analytics
 *
 * Builds on top of routeOptimizationService from Fulfillment/delivery
 */

import { supabase } from '@/lib/supabase/client';
import { eventBus } from '@/lib/events/EventBus';
import { logger } from '@/lib/logging';
import type {
  MobileRoute,
  MobileRouteInput,
  Waypoint,
  RouteOptimizationRequest,
  OptimizedRoute,
  RoutePerformanceMetrics,
  RouteStatus
} from '../types';

const MODULE_ID = 'mobile.route_planning';

// ============================================
// Route CRUD Operations
// ============================================

/**
 * Create a new mobile route
 */
export async function createRoute(
  routeInput: MobileRouteInput
): Promise<{ data: MobileRoute | null; error: Error | null }> {
  try {
    logger.info(MODULE_ID, 'Creating mobile route', { route_name: routeInput.route_name });

    const { data, error } = await supabase
      .from('mobile_routes')
      .insert({
        route_name: routeInput.route_name,
        route_date: routeInput.route_date,
        driver_id: routeInput.driver_id,
        vehicle_id: routeInput.vehicle_id,
        start_location: routeInput.start_location,
        end_location: routeInput.end_location,
        waypoints: routeInput.waypoints || [],
        status: routeInput.status || 'planned'
      })
      .select()
      .single();

    if (error) throw error;

    eventBus.emit('mobile.route.created', { route_id: data.id, driver_id: data.driver_id });

    logger.info(MODULE_ID, 'Route created successfully', { route_id: data.id });
    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to create route');
    logger.error(MODULE_ID, 'Error creating route', error);
    return { data: null, error };
  }
}

/**
 * Update route status
 */
export async function updateRouteStatus(
  routeId: string,
  newStatus: RouteStatus,
  updates?: Partial<MobileRoute>
): Promise<{ error: Error | null }> {
  try {
    const { data: oldRoute, error: fetchError } = await supabase
      .from('mobile_routes')
      .select('status, driver_id')
      .eq('id', routeId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('mobile_routes')
      .update({
        status: newStatus,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', routeId);

    if (error) throw error;

    eventBus.emit('mobile.route.status_changed', {
      route_id: routeId,
      old_status: oldRoute.status,
      new_status: newStatus,
      driver_id: oldRoute.driver_id
    });

    logger.info(MODULE_ID, 'Route status updated', { route_id: routeId, new_status: newStatus });
    return { error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to update route status');
    logger.error(MODULE_ID, 'Error updating route status', error);
    return { error };
  }
}

/**
 * Mark waypoint as visited
 */
export async function markWaypointVisited(
  routeId: string,
  waypointIndex: number
): Promise<{ error: Error | null }> {
  try {
    // Fetch current route
    const { data: route, error: fetchError } = await supabase
      .from('mobile_routes')
      .select('waypoints')
      .eq('id', routeId)
      .single();

    if (fetchError) throw fetchError;

    // Update waypoint status
    const waypoints = route.waypoints || [];
    if (waypointIndex >= 0 && waypointIndex < waypoints.length) {
      waypoints[waypointIndex].status = 'visited';
      waypoints[waypointIndex].arrival_time = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('mobile_routes')
        .update({ waypoints })
        .eq('id', routeId);

      if (updateError) throw updateError;

      eventBus.emit('mobile.waypoint.visited', {
        route_id: routeId,
        waypoint_index: waypointIndex,
        order_id: waypoints[waypointIndex].order_id
      });

      logger.info(MODULE_ID, 'Waypoint marked as visited', { route_id: routeId, waypoint_index: waypointIndex });
    }

    return { error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to mark waypoint visited');
    logger.error(MODULE_ID, 'Error marking waypoint visited', error);
    return { error };
  }
}

// ============================================
// Route Optimization
// ============================================

/**
 * Optimize waypoint order using Nearest Neighbor algorithm
 *
 * This is a greedy algorithm that visits the nearest unvisited waypoint next.
 * Not optimal, but fast and good enough for most cases.
 */
export function optimizeWaypointOrder(request: RouteOptimizationRequest): OptimizedRoute {
  const { start_location, end_location, waypoints } = request;

  logger.info(MODULE_ID, 'Optimizing waypoint order', { waypoint_count: waypoints.length });

  // Nearest Neighbor algorithm
  const unvisited = [...waypoints];
  const optimizedOrder: Waypoint[] = [];
  let currentLocation = start_location;

  while (unvisited.length > 0) {
    // Find nearest waypoint
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        unvisited[i].location.lat,
        unvisited[i].location.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Add to optimized route
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimizedOrder.push({
      lat: nearest.location.lat,
      lng: nearest.location.lng,
      address: nearest.location.address || '',
      order_id: nearest.order_id,
      status: 'pending'
    });

    currentLocation = nearest.location;
  }

  // Calculate total distance and duration
  let totalDistance = calculateDistance(
    start_location.lat,
    start_location.lng,
    optimizedOrder[0].lat,
    optimizedOrder[0].lng
  );

  for (let i = 0; i < optimizedOrder.length - 1; i++) {
    totalDistance += calculateDistance(
      optimizedOrder[i].lat,
      optimizedOrder[i].lng,
      optimizedOrder[i + 1].lat,
      optimizedOrder[i + 1].lng
    );
  }

  if (end_location) {
    totalDistance += calculateDistance(
      optimizedOrder[optimizedOrder.length - 1].lat,
      optimizedOrder[optimizedOrder.length - 1].lng,
      end_location.lat,
      end_location.lng
    );
  }

  // Estimate duration (30 km/h average + 10min per stop)
  const travelTimeMinutes = (totalDistance / 30) * 60;
  const stopTimeMinutes = waypoints.reduce((acc, w) => acc + (w.service_time_minutes || 10), 0);
  const totalDuration = Math.ceil(travelTimeMinutes + stopTimeMinutes);

  // Estimate completion time
  const now = new Date();
  const estimatedCompletion = new Date(now.getTime() + totalDuration * 60000);

  logger.info(MODULE_ID, 'Route optimized', {
    total_distance: totalDistance,
    total_duration: totalDuration
  });

  return {
    total_distance_km: Math.round(totalDistance * 100) / 100,
    total_duration_minutes: totalDuration,
    optimized_waypoints: optimizedOrder,
    estimated_completion_time: estimatedCompletion.toISOString()
  };
}

// ============================================
// Performance Analytics
// ============================================

/**
 * Calculate route performance metrics
 */
export async function calculateRoutePerformance(
  routeId: string
): Promise<{ data: RoutePerformanceMetrics | null; error: Error | null }> {
  try {
    const { data: route, error } = await supabase
      .from('mobile_routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (error) throw error;

    const waypoints = route.waypoints || [];

    // Calculate planned vs actual
    const waypointsCompleted = waypoints.filter((w: Waypoint) => w.status === 'visited').length;
    const waypointsSkipped = waypoints.filter((w: Waypoint) => w.status === 'skipped').length;

    // Calculate actual distance from driver locations
    const { data: locations } = await supabase
      .from('driver_locations')
      .select('*')
      .eq('driver_id', route.driver_id)
      .gte('timestamp', route.created_at)
      .lte('timestamp', route.updated_at || new Date().toISOString())
      .order('timestamp', { ascending: true });

    let actualDistance = 0;
    if (locations && locations.length > 1) {
      for (let i = 0; i < locations.length - 1; i++) {
        actualDistance += calculateDistance(
          locations[i].lat,
          locations[i].lng,
          locations[i + 1].lat,
          locations[i + 1].lng
        );
      }
    }

    // Calculate duration
    const startTime = new Date(route.created_at).getTime();
    const endTime = route.updated_at
      ? new Date(route.updated_at).getTime()
      : new Date().getTime();
    const actualDuration = Math.ceil((endTime - startTime) / 60000); // minutes

    // Calculate planned distance (rough estimate)
    const plannedDistance = estimateRouteDistance(route);

    // Calculate average speed
    const averageSpeed = actualDuration > 0 ? (actualDistance / actualDuration) * 60 : 0;

    // Calculate efficiency score
    const completionRate = waypoints.length > 0 ? (waypointsCompleted / waypoints.length) * 100 : 0;
    const distanceEfficiency =
      plannedDistance > 0 ? Math.min((plannedDistance / actualDistance) * 100, 100) : 100;
    const efficiencyScore = Math.round((completionRate + distanceEfficiency) / 2);

    const metrics: RoutePerformanceMetrics = {
      route_id: routeId,
      planned_distance_km: plannedDistance,
      actual_distance_km: Math.round(actualDistance * 100) / 100,
      planned_duration_minutes: 0, // TODO: Store planned duration
      actual_duration_minutes: actualDuration,
      waypoints_completed: waypointsCompleted,
      waypoints_skipped: waypointsSkipped,
      average_speed_kmh: Math.round(averageSpeed * 100) / 100,
      efficiency_score: efficiencyScore
    };

    return { data: metrics, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to calculate performance');
    logger.error(MODULE_ID, 'Error calculating route performance', error);
    return { data: null, error };
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate total route distance
 */
function estimateRouteDistance(route: MobileRoute): number {
  const waypoints = route.waypoints || [];
  if (waypoints.length === 0) return 0;

  let distance = 0;

  // Start to first waypoint
  if (route.start_location) {
    distance += calculateDistance(
      route.start_location.lat,
      route.start_location.lng,
      waypoints[0].lat,
      waypoints[0].lng
    );
  }

  // Between waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    distance += calculateDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }

  // Last waypoint to end
  if (route.end_location) {
    distance += calculateDistance(
      waypoints[waypoints.length - 1].lat,
      waypoints[waypoints.length - 1].lng,
      route.end_location.lat,
      route.end_location.lng
    );
  }

  return Math.round(distance * 100) / 100;
}

export const routePlanningService = {
  createRoute,
  updateRouteStatus,
  markWaypointVisited,
  optimizeWaypointOrder,
  calculateRoutePerformance
};
