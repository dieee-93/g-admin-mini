/**
 * Mobile Module Types
 *
 * Type definitions for mobile operations including:
 * - GPS location tracking
 * - Route planning and optimization
 * - Mobile inventory constraints
 */

// ============================================
// Location Types
// ============================================

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  delivery_id?: string;
  lat: number;
  lng: number;
  heading?: number; // 0-359 degrees
  speed_kmh?: number;
  accuracy_meters?: number;
  timestamp: string;
  battery_level?: number; // 0-100
  is_online: boolean;
}

export interface DriverLocationUpdate {
  driver_id: string;
  delivery_id?: string;
  lat: number;
  lng: number;
  heading?: number;
  speed_kmh?: number;
  accuracy_meters?: number;
  battery_level?: number;
}

// ============================================
// Route Types
// ============================================

export type RouteStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Waypoint {
  lat: number;
  lng: number;
  address: string;
  order_id?: string;
  status: 'pending' | 'visited' | 'skipped';
  arrival_time?: string;
  notes?: string;
}

export interface MobileRoute {
  id: string;
  route_name: string;
  route_date: string; // ISO date string
  driver_id?: string;
  vehicle_id?: string;
  start_location?: Location;
  end_location?: Location;
  waypoints?: Waypoint[];
  status: RouteStatus;
  created_at: string;
  updated_at: string;
}

export interface MobileRouteInput {
  route_name: string;
  route_date: string;
  driver_id?: string;
  vehicle_id?: string;
  start_location?: Location;
  end_location?: Location;
  waypoints?: Waypoint[];
  status?: RouteStatus;
}

// ============================================
// Mobile Inventory Types
// ============================================

export interface MobileInventoryConstraint {
  id: string;
  vehicle_id: string;
  material_id: string;
  max_quantity: number;
  current_quantity: number;
  unit: string;
}

export interface MobileInventoryUpdate {
  vehicle_id: string;
  material_id: string;
  quantity_delta: number; // Positive = add, Negative = remove
}

// ============================================
// Route Optimization Types
// ============================================

export interface RouteOptimizationRequest {
  start_location: Location;
  end_location?: Location;
  waypoints: Array<{
    location: Location;
    order_id?: string;
    time_window?: {
      start: string;
      end: string;
    };
    service_time_minutes?: number;
  }>;
  vehicle_constraints?: {
    max_distance_km?: number;
    max_duration_hours?: number;
    capacity_constraints?: Array<{
      material_id: string;
      max_quantity: number;
    }>;
  };
}

export interface OptimizedRoute {
  total_distance_km: number;
  total_duration_minutes: number;
  optimized_waypoints: Waypoint[];
  estimated_completion_time: string;
}

// ============================================
// Real-time Tracking Types
// ============================================

export interface TrackingSession {
  id: string;
  driver_id: string;
  route_id?: string;
  started_at: string;
  ended_at?: string;
  total_distance_km?: number;
  is_active: boolean;
}

export interface LocationHistoryEntry {
  location: DriverLocation;
  distance_from_previous_km?: number;
  time_since_previous_seconds?: number;
}

// ============================================
// Performance Analytics Types
// ============================================

export interface RoutePerformanceMetrics {
  route_id: string;
  planned_distance_km: number;
  actual_distance_km: number;
  planned_duration_minutes: number;
  actual_duration_minutes: number;
  waypoints_completed: number;
  waypoints_skipped: number;
  average_speed_kmh: number;
  efficiency_score: number; // 0-100
}

export interface DriverPerformanceMetrics {
  driver_id: string;
  period_start: string;
  period_end: string;
  total_routes: number;
  completed_routes: number;
  total_distance_km: number;
  total_duration_hours: number;
  average_efficiency_score: number;
  on_time_delivery_rate: number; // 0-100
}

// ============================================
// UI Component Props Types
// ============================================

export interface MapViewProps {
  drivers: DriverLocation[];
  routes?: MobileRoute[];
  center?: Location;
  zoom?: number;
  onDriverClick?: (driver: DriverLocation) => void;
  onRouteClick?: (route: MobileRoute) => void;
}

export interface RouteBuilderProps {
  initialRoute?: MobileRoute;
  onSave: (route: MobileRouteInput) => void;
  onCancel: () => void;
}

export interface DriverTrackerProps {
  driverId: string;
  showHistory?: boolean;
  autoRefresh?: boolean;
  refreshIntervalSeconds?: number;
}

// ============================================
// Event Types (for EventBus)
// ============================================

export interface MobileLocationUpdateEvent {
  driver_id: string;
  location: DriverLocation;
  route_id?: string;
}

export interface MobileRouteStatusChangeEvent {
  route_id: string;
  old_status: RouteStatus;
  new_status: RouteStatus;
  driver_id?: string;
}

export interface MobileInventoryChangeEvent {
  vehicle_id: string;
  material_id: string;
  old_quantity: number;
  new_quantity: number;
  change_reason: 'sale' | 'restock' | 'adjustment' | 'spoilage';
}
