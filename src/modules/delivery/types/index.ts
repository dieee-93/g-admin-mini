/**
 * Delivery Fulfillment Types
 *
 * Adapted from legacy delivery system to integrate with Fulfillment Module
 * Phase 1 - Part 3: Delivery Sub-Module
 */

import type { QueueItem } from '../fulfillment/services/fulfillmentService';

// ============================================
// CORE TYPES (Compatible with FulfillmentQueue)
// ============================================

/**
 * Delivery-specific metadata stored in fulfillment_queue.metadata
 */
export interface DeliveryMetadata {
  // Customer & Location
  delivery_address: string;
  delivery_coordinates: Coordinates;
  delivery_instructions?: string;

  // Driver & Route
  driver_id?: string;
  driver_name?: string;
  zone_id?: string;
  zone_name?: string;

  // Route optimization
  route?: DeliveryRoute;
  distance_km?: number;
  estimated_arrival_time?: string;

  // Delivery specifics
  delivery_type: DeliveryType;

  // Tracking
  current_location?: Coordinates;
  last_location_update?: string;
}

/**
 * Extended DeliveryOrder that includes FulfillmentQueue data
 * Use this for UI components that need both fulfillment + delivery data
 */
export interface DeliveryOrder extends QueueItem {
  // Fulfillment base fields:
  // - id, order_id, customer_id, customer_name, status
  // - priority, scheduled_time, assigned_to, assigned_at
  // - location, notes, created_at, updated_at

  // Type enforcement
  type: 'delivery';

  // Delivery-specific (from metadata)
  delivery_address: string;
  delivery_coordinates: Coordinates;
  delivery_instructions?: string;
  driver_id?: string;
  driver_name?: string;
  zone_id?: string;
  zone_name?: string;
  route?: DeliveryRoute;
  distance_km?: number;
  delivery_type: DeliveryType;
  current_location?: Coordinates;

  // Additional delivery fields
  items?: DeliveryItem[];
  total?: number;
}

export interface DeliveryItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface DeliveryRoute {
  id: string;
  delivery_id: string;
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: Coordinates[];
  optimized_path?: Coordinates[];
  distance_km: number;
  estimated_duration_minutes: number;
  created_at: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// ============================================
// DELIVERY ZONES
// ============================================

export interface DeliveryZone {
  id: string;
  location_id?: string | null;  // NULL = zona global (todas las sucursales)
  name: string;
  description?: string;
  boundaries: Coordinates[];  // Polygon points
  color: string;
  delivery_fee: number;
  min_order_amount?: number;
  estimated_time_minutes: number;
  priority?: number;  // Para precedencia cuando múltiples zonas coinciden
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Zona de delivery pública (sin información sensible)
 * Para exponer a clientes sin autenticación
 */
export interface PublicDeliveryZone {
  id: string;
  name: string;
  boundaries: Coordinates[];
  delivery_fee: number;
  estimated_time_minutes: number;
  min_order_amount?: number;
  color: string;
}

export interface ZoneValidation {
  valid: boolean;
  zone_id?: string;
  zone_name?: string;
  location_id?: string;  // Sucursal de la zona encontrada
  delivery_fee?: number;
  estimated_time_minutes?: number;
  min_order_amount?: number;
  error_message?: string;
}

export interface ZoneValidation {
  valid: boolean;
  zone_id?: string;
  zone_name?: string;
  delivery_fee?: number;
  estimated_time_minutes?: number;
  error_message?: string;
}

// ============================================
// DRIVER MANAGEMENT
// ============================================

export interface DriverLocation {
  driver_id: string;
  coordinates: Coordinates;
  heading?: number;  // Direction in degrees
  speed_kmh?: number;
  accuracy_meters?: number;
  timestamp: string;
}

export interface DriverPerformance {
  driver_id: string;
  driver_name: string;
  avatar_url?: string;

  // Stats
  total_deliveries: number;
  completed_today: number;
  avg_delivery_time_minutes: number;
  on_time_rate: number;
  customer_rating?: number;

  // Status
  is_active: boolean;
  is_available: boolean;
  current_delivery_id?: string;
  last_location?: Coordinates;
  last_updated: string;
}

export interface DriverAssignment {
  id: string;
  queue_id: string;  // References fulfillment_queue.id
  driver_id: string;
  zone_id?: string;
  pickup_time?: string;
  delivery_time?: string;
  current_location?: Coordinates;
  status: DriverAssignmentStatus;
  created_at: string;
  updated_at?: string;
}

export interface DriverAvailability {
  driver: DriverPerformance;
  current_deliveries: number;
  is_on_shift: boolean;
  proximity_score: number;  // 0-100
  available: boolean;
}

// ============================================
// ENUMS
// ============================================

export enum DeliveryType {
  INSTANT = 'instant',      // 0-60 min
  SAME_DAY = 'same_day',    // Scheduled within 24h
  SCHEDULED = 'scheduled'   // Future scheduled
}

export enum DriverAssignmentStatus {
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered'
}

// ============================================
// ANALYTICS & METRICS
// ============================================

export interface DeliveryMetrics {
  active_deliveries: number;
  pending_assignments: number;
  avg_delivery_time_minutes: number;
  on_time_rate_percentage: number;
  eta_accuracy_percentage: number;
  total_deliveries_today: number;
  failed_deliveries_today: number;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface AssignDriverData {
  queue_id: string;  // fulfillment_queue.id
  driver_id: string;
  zone_id?: string;
  notes?: string;
}

export interface CreateDeliveryZoneData {
  location_id?: string | null;  // NULL = zona global
  name: string;
  description?: string;
  boundaries: Coordinates[];
  color: string;
  delivery_fee: number;
  min_order_amount?: number;
  estimated_time_minutes: number;
  priority?: number;
}

export interface UpdateDeliveryZoneData extends Partial<CreateDeliveryZoneData> {
  id: string;
}

// ============================================
// DELIVERY TRACKING
// ============================================

export interface DeliveryTracking {
  delivery_id: string;
  order_id: string;
  driver_name?: string;
  driver_phone?: string;
  current_location?: Coordinates;
  destination_address: string;
  estimated_arrival: string;
  status: string;
  public_tracking_url?: string;
}

// ============================================
// GPS INTEGRATION
// ============================================

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

// ============================================
// ROUTE OPTIMIZATION
// ============================================

export interface DriverSuggestion {
  driver: DriverPerformance;
  distance: number; // in km
  estimated_time: number; // in minutes
  score: number; // 0-100
}
