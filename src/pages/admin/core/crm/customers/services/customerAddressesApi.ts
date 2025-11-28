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
import type { AuthUser } from '@/contexts/AuthContext';

// ===== SECURITY HELPERS =====

/**
 * Validates UUID format to prevent injection attacks
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Permission check helper - verifies user can access customer addresses
 */
function requirePermission(user: AuthUser, action: 'read' | 'create' | 'update' | 'delete') {
  if (!user) {
    throw new Error(`Authentication required for ${action} on customer addresses`);
  }

  const role = user.role || 'OPERADOR';

  const canPerform = (action: string, role: string): boolean => {
    if (role === 'ADMINISTRADOR') return true;
    if (role === 'SUPERVISOR' && ['read', 'create', 'update'].includes(action)) return true;
    if (role === 'OPERADOR' && ['read'].includes(action)) return true;
    return false;
  };

  if (!canPerform(action, role)) {
    throw new Error(`Insufficient permissions: ${role} cannot ${action} customer addresses`);
  }
}

/**
 * Audit log for address access (GDPR compliance)
 */
async function auditAddressAccess(
  userId: string,
  customerId: string,
  action: string,
  addressId?: string
): Promise<void> {
  try {
    await supabase.from('customer_update_log').insert({
      customer_id: customerId,
      updated_by: userId,
      update_type: `address_${action}`,
      changes: addressId ? { address_id: addressId } : {},
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('customerAddressesApi', 'Failed to log audit trail', error);
    // Non-critical, don't throw
  }
}

/**
 * Masks sensitive data for logging
 */
function maskSensitiveData(address: Partial<CustomerAddress>): Record<string, unknown> {
  return {
    id: address.id,
    customer_id: address.customer_id,
    street: address.street?.substring(0, 10) + '***',
    coordinates_present: !!(address.latitude && address.longitude),
    has_instructions: !!address.delivery_instructions,
  };
}

// ===== FETCH =====

export async function getCustomerAddresses(
  customerId: string,
  user: AuthUser
): Promise<CustomerAddress[]> {
  // ✅ SECURITY: Permission check
  requirePermission(user, 'read');

  // ✅ SECURITY: Validate UUID format
  if (!isValidUUID(customerId)) {
    throw new Error('Invalid customer ID format');
  }

  try {
    // ✅ SECURITY: Audit log
    await auditAddressAccess(user.id, customerId, 'read');

    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false })
      .order('last_used_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // ✅ SECURITY: Masked logging
    logger.debug('customerAddressesApi', 'Addresses fetched', {
      count: data?.length || 0,
      customer_id: customerId,
      accessed_by: user.email,
    });

    return data || [];
  } catch (error) {
    logger.error('customerAddressesApi', 'Error fetching addresses', {
      customer_id: maskSensitiveData({ customer_id: customerId }),
      user: user.email,
      error,
    });
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
  addressData: CreateCustomerAddressData,
  user: AuthUser
): Promise<CustomerAddress> {
  // ✅ SECURITY: Permission check
  requirePermission(user, 'create');

  // ✅ SECURITY: Validate customer ID
  if (!isValidUUID(addressData.customer_id)) {
    throw new Error('Invalid customer ID format');
  }

  // ✅ SECURITY: Validate coordinates if provided
  if (addressData.latitude !== null && addressData.latitude !== undefined) {
    if (addressData.latitude < -90 || addressData.latitude > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }
  }
  if (addressData.longitude !== null && addressData.longitude !== undefined) {
    if (addressData.longitude < -180 || addressData.longitude > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }
  }

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

    // ✅ SECURITY: Audit log
    await auditAddressAccess(user.id, addressData.customer_id, 'create', data.id);

    logger.info('customerAddressesApi', 'Address created', {
      address: maskSensitiveData(data),
      created_by: user.email,
    });
    return data;
  } catch (error) {
    logger.error('customerAddressesApi', 'Error creating address', {
      customer_id: addressData.customer_id,
      user: user.email,
      error,
    });
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
  addressId: string,
  user: AuthUser
): Promise<void> {
  // ✅ SECURITY: Permission check
  requirePermission(user, 'delete');

  // ✅ SECURITY: Validate address ID
  if (!isValidUUID(addressId)) {
    throw new Error('Invalid address ID format');
  }

  try {
    // Get address first to log customer_id
    const address = await getAddressById(addressId);
    if (!address) {
      throw new Error('Address not found');
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;

    // ✅ SECURITY: Audit log
    await auditAddressAccess(user.id, address.customer_id, 'delete', addressId);

    logger.info('customerAddressesApi', 'Address deleted', {
      id: addressId,
      deleted_by: user.email,
    });
  } catch (error) {
    logger.error('customerAddressesApi', 'Error deleting address', {
      address_id: addressId,
      user: user.email,
      error,
    });
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
