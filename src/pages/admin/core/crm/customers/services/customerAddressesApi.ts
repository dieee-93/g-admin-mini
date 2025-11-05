/**
 * CUSTOMER ADDRESSES API SERVICE
 * Handles CRUD operations for customer delivery addresses
 * Integrated with Delivery module for geocoding
 *
 * TODO: SECURITY REVIEW REQUIRED (Priority: HIGH)
 * ================================================
 *
 * 1. ROW LEVEL SECURITY (RLS) VALIDATION
 *    - ⚠️ Verify RLS policies are active on customer_addresses table
 *    - ⚠️ Ensure users can ONLY access addresses of their OWN customer_id
 *    - ⚠️ Prevent staff from accessing addresses of customers not assigned to them
 *    - Action: Review and test Supabase RLS policies
 *
 * 2. DATA LEAKAGE PREVENTION
 *    - ⚠️ Addresses contain sensitive PII (home/work locations)
 *    - ⚠️ GPS coordinates can reveal exact residence locations
 *    - ⚠️ Delivery instructions may contain sensitive info (key codes, access patterns)
 *    - Action: Implement data masking for logs and analytics
 *
 * 3. ACCESS CONTROL
 *    - ⚠️ Validate user has permission before fetching addresses
 *    - ⚠️ Implement role-based access (customer vs staff vs admin)
 *    - ⚠️ Audit log all address access/modifications
 *    - Action: Add permission checks before Supabase queries
 *
 * 4. INPUT VALIDATION
 *    - ⚠️ Sanitize address input to prevent SQL injection
 *    - ⚠️ Validate lat/lng ranges (-90 to 90, -180 to 180)
 *    - ⚠️ Prevent malicious geocoding results
 *    - Action: Add Zod validation schemas
 *
 * 5. RATE LIMITING
 *    - ⚠️ Prevent address enumeration attacks
 *    - ⚠️ Limit geocoding API calls per user/session
 *    - Action: Implement rate limiting middleware
 *
 * 6. DATA ENCRYPTION
 *    - ⚠️ Consider encrypting sensitive fields (delivery_instructions)
 *    - ⚠️ Use HTTPS only for all API calls
 *    - Action: Review encryption requirements with security team
 *
 * 7. GDPR COMPLIANCE
 *    - ⚠️ Addresses are personal data under GDPR
 *    - ⚠️ Implement right to erasure (delete addresses on customer request)
 *    - ⚠️ Data retention policies (auto-delete old addresses?)
 *    - Action: Add GDPR compliance documentation
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
  CustomerAddress,
  CreateCustomerAddressData,
  UpdateCustomerAddressData,
} from '../types/customerAddress';

// ===== FETCH =====

export async function getCustomerAddresses(
  customerId: string
): Promise<CustomerAddress[]> {
  // TODO: SECURITY - Add permission check: verify current user can access this customer's data
  // TODO: SECURITY - Validate customerId format (UUID) to prevent injection
  // TODO: SECURITY - Add audit log: who accessed which customer's addresses

  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false })
      .order('last_used_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // TODO: SECURITY - Mask sensitive data in logs (coordinates, delivery_instructions)
    return data || [];
  } catch (error) {
    logger.error('customerAddressesApi', 'Error fetching addresses', error);
    throw error;
  }
}

export async function getCustomerDefaultAddress(
  customerId: string
): Promise<CustomerAddress | null> {
  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error fetching default address', error);
    return null;
  }
}

export async function getAddressById(
  addressId: string
): Promise<CustomerAddress | null> {
  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('id', addressId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error fetching address', error);
    return null;
  }
}

// ===== CREATE =====

export async function createCustomerAddress(
  addressData: CreateCustomerAddressData
): Promise<CustomerAddress> {
  try {
    // If this is set as default, unset other defaults first
    if (addressData.is_default) {
      await unsetOtherDefaults(addressData.customer_id);
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert([addressData])
      .select()
      .single();

    if (error) throw error;

    logger.info('customerAddressesApi', 'Address created', { id: data.id });
    return data;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error creating address', error);
    throw error;
  }
}

// ===== UPDATE =====

export async function updateCustomerAddress(
  addressData: UpdateCustomerAddressData
): Promise<CustomerAddress> {
  try {
    const { id, ...updateFields } = addressData;

    // If setting as default, unset other defaults
    if (updateFields.is_default) {
      const address = await getAddressById(id);
      if (address) {
        await unsetOtherDefaults(address.customer_id, id);
      }
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('customerAddressesApi', 'Address updated', { id });
    return data;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error updating address', error);
    throw error;
  }
}

// Update address usage tracking (called when used for delivery)
export async function incrementAddressUsage(
  addressId: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_address_usage', {
      address_id: addressId,
    });

    if (error) throw error;
  } catch (error) {
    logger.warn('customerAddressesApi', 'Error incrementing usage', error);
    // Non-critical, don't throw
  }
}

// ===== DELETE =====

export async function deleteCustomerAddress(
  addressId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;

    logger.info('customerAddressesApi', 'Address deleted', { id: addressId });
  } catch (error) {
    logger.error('customerAddressesApi', 'Error deleting address', error);
    throw error;
  }
}

// ===== GEOCODING =====

export async function updateAddressCoordinates(
  addressId: string,
  latitude: number,
  longitude: number,
  formattedAddress?: string
): Promise<CustomerAddress> {
  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update({
        latitude,
        longitude,
        formatted_address: formattedAddress,
      })
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;

    logger.info('customerAddressesApi', 'Address geocoded', { id: addressId });
    return data;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error updating coordinates', error);
    throw error;
  }
}

// ===== HELPERS =====

async function unsetOtherDefaults(
  customerId: string,
  excludeId?: string
): Promise<void> {
  try {
    let query = supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId)
      .eq('is_default', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { error } = await query;
    if (error) throw error;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error unsetting defaults', error);
    throw error;
  }
}

// ===== BATCH OPERATIONS =====

export async function getAddressesByIds(
  addressIds: string[]
): Promise<CustomerAddress[]> {
  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .in('id', addressIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('customerAddressesApi', 'Error fetching addresses by IDs', error);
    return [];
  }
}

// Get addresses within radius (requires earthdistance extension)
export async function getAddressesNearby(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<CustomerAddress[]> {
  try {
    const { data, error } = await supabase.rpc('get_addresses_nearby', {
      search_lat: latitude,
      search_lng: longitude,
      radius_km: radiusKm,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.warn('customerAddressesApi', 'Nearby search not available', error);
    return [];
  }
}
