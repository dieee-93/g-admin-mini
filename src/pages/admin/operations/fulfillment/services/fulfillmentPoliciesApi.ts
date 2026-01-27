/**
 * Fulfillment Policies API Service
 * 
 * Version: 1.0.0
 * Purpose: Supabase API layer for fulfillment_policies CRUD operations
 * Route: /admin/settings/fulfillment/policies
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ================================================
// TYPES
// ================================================

export interface DeliveryZone {
  id: string;
  name: string;
  radius_km: number;
  fee: number;
  min_order: number;
  estimated_time: number;
}

export interface CustomDeliveryHours {
  [day: string]: {
    start: string;
    end: string;
  };
}

export interface FulfillmentPolicies {
  id: string;
  
  // Delivery Configuration
  delivery_enabled: boolean;
  delivery_zones: DeliveryZone[];
  default_delivery_fee: number;
  free_delivery_threshold: number;
  
  // Pickup Configuration
  pickup_enabled: boolean;
  pickup_discount_percent: number;
  pickup_ready_time_minutes: number;
  
  // Order Minimums
  min_order_delivery: number;
  min_order_pickup: number;
  
  // Order Processing
  order_confirmation_required: boolean;
  auto_accept_orders: boolean;
  order_acceptance_timeout_minutes: number;
  
  // Fulfillment Times
  estimated_prep_time_minutes: number;
  estimated_delivery_time_minutes: number;
  max_advance_order_days: number;
  
  // Driver Management
  auto_assign_drivers: boolean;
  driver_assignment_radius_km: number;
  max_concurrent_deliveries_per_driver: number;
  
  // Packaging & Handling
  packaging_fee: number;
  utensils_default: boolean;
  special_instructions_max_length: number;
  
  // Returns & Refunds
  cancellation_allowed: boolean;
  cancellation_deadline_minutes: number;
  refund_policy_enabled: boolean;
  refund_processing_days: number;
  
  // Tips & Service Charges
  tips_enabled: boolean;
  suggested_tip_percentages: number[];
  service_charge_enabled: boolean;
  service_charge_percent: number;
  
  // Contact & Tracking
  customer_contact_required: boolean;
  order_tracking_enabled: boolean;
  delivery_notifications_enabled: boolean;
  
  // Operating Hours Override
  custom_delivery_hours: CustomDeliveryHours;
  
  // Metadata
  is_system: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type FulfillmentPoliciesUpdate = Partial<Omit<FulfillmentPolicies, 'id' | 'is_system' | 'created_by' | 'created_at' | 'updated_at'>>;

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Fetch all fulfillment policies
 */
export async function fetchFulfillmentPolicies(): Promise<FulfillmentPolicies[]> {
  const { data, error } = await supabase
    .from('fulfillment_policies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('FulfillmentPoliciesApi', 'Failed to fetch fulfillment policies', error);
    throw error;
  }

  return data as FulfillmentPolicies[];
}

/**
 * Fetch fulfillment policies by ID
 */
export async function fetchFulfillmentPoliciesById(id: string): Promise<FulfillmentPolicies> {
  const { data, error } = await supabase
    .from('fulfillment_policies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('FulfillmentPoliciesApi', `Failed to fetch fulfillment policies ${id}`, error);
    throw error;
  }

  return data as FulfillmentPolicies;
}

/**
 * Fetch system fulfillment policies (default configuration)
 */
export async function fetchSystemFulfillmentPolicies(): Promise<FulfillmentPolicies> {
  const { data, error } = await supabase
    .from('fulfillment_policies')
    .select('*')
    .eq('is_system', true)
    .single();

  if (error) {
    logger.error('FulfillmentPoliciesApi', 'Failed to fetch system fulfillment policies', error);
    throw error;
  }

  return data as FulfillmentPolicies;
}

/**
 * Update fulfillment policies
 */
export async function updateFulfillmentPolicies(
  id: string,
  updates: FulfillmentPoliciesUpdate
): Promise<FulfillmentPolicies> {
  const { data, error } = await supabase
    .from('fulfillment_policies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('FulfillmentPoliciesApi', `Failed to update fulfillment policies ${id}`, error);
    throw error;
  }

  logger.info('FulfillmentPoliciesApi', `Updated fulfillment policies ${id}`);
  return data as FulfillmentPolicies;
}

/**
 * Toggle delivery enabled
 */
export async function toggleDelivery(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { delivery_enabled: enabled });
}

/**
 * Toggle pickup enabled
 */
export async function togglePickup(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { pickup_enabled: enabled });
}

/**
 * Toggle auto-accept orders
 */
export async function toggleAutoAcceptOrders(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { auto_accept_orders: enabled });
}

/**
 * Toggle auto-assign drivers
 */
export async function toggleAutoAssignDrivers(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { auto_assign_drivers: enabled });
}

/**
 * Toggle tips enabled
 */
export async function toggleTips(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { tips_enabled: enabled });
}

/**
 * Toggle service charge
 */
export async function toggleServiceCharge(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { service_charge_enabled: enabled });
}

/**
 * Toggle order tracking
 */
export async function toggleOrderTracking(id: string, enabled: boolean): Promise<FulfillmentPolicies> {
  return updateFulfillmentPolicies(id, { order_tracking_enabled: enabled });
}
