/**
 * CUSTOMER API SERVICE - With Permission Integration
 *
 * Service layer for all customer CRUD operations with built-in permission checks.
 *
 * @module CustomerAPI
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { Customer, CreateCustomerData, UpdateCustomerData, CustomerWithStats } from '../types/customer';
import type { AuthUser } from '@/contexts/AuthContext';

/**
 * Permission check helper - verifies module access
 */
function requireModuleAccess(user: AuthUser | null | undefined, moduleName: string) {
  if (!user) {
    throw new Error(`Authentication required to access ${moduleName}`);
  }
  // Additional checks can be added here based on user role
  logger.debug('CustomerAPI', `User ${user.email} accessing ${moduleName}`);
}

/**
 * Permission check helper - verifies specific action permission
 */
function requirePermission(user: AuthUser, moduleName: string, action: 'create' | 'read' | 'update' | 'delete' | 'export') {
  if (!user) {
    throw new Error(`Authentication required for ${action} on ${moduleName}`);
  }

  // Role-based permission check
  const role = user.role || 'OPERADOR';

  // Basic role hierarchy check
  const canPerform = (action: string, role: string): boolean => {
    // ADMINISTRADOR can do everything
    if (role === 'ADMINISTRADOR') return true;

    // SUPERVISOR can do create, read, update, export
    if (role === 'SUPERVISOR' && ['create', 'read', 'update', 'export'].includes(action)) return true;

    // OPERADOR can do create and read
    if (role === 'OPERADOR' && ['create', 'read'].includes(action)) return true;

    return false;
  };

  if (!canPerform(action, role)) {
    throw new Error(`Insufficient permissions: ${role} cannot ${action} ${moduleName}`);
  }

  logger.debug('CustomerAPI', `Permission granted: ${action} on ${moduleName} for ${user.email}`);
}

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Get all customers (with optional filtering)
 *
 * @param user - Authenticated user (optional for read)
 * @param filters - Optional filters (status, search, etc.)
 * @returns Array of customers
 */
export async function getCustomers(user?: AuthUser | null, filters?: {
  status?: 'active' | 'inactive';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    if (user) {
      requireModuleAccess(user, 'customers');
    }

    let query = supabase.from('customers').select('*');

    // Apply filters
    if (filters?.status) {
      query = query.eq('is_active', filters.status === 'active');
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,mobile.ilike.%${filters.search}%,dni.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      logger.error('CustomerAPI', 'Error fetching customers', error);
      throw error;
    }

    logger.info('CustomerAPI', `Fetched ${data?.length || 0} customers`);
    return data as Customer[];
  } catch (error) {
    logger.error('CustomerAPI', 'getCustomers failed', error);
    throw error;
  }
}

/**
 * Get a single customer by ID
 *
 * @param customerId - Customer UUID
 * @param user - Authenticated user (optional for read)
 * @returns Customer object
 */
export async function getCustomer(customerId: string, user?: AuthUser | null) {
  try {
    if (user) {
      requireModuleAccess(user, 'customers');
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) {
      logger.error('CustomerAPI', `Error fetching customer ${customerId}`, error);
      throw error;
    }

    logger.info('CustomerAPI', `Fetched customer: ${customerId}`);
    return data as Customer;
  } catch (error) {
    logger.error('CustomerAPI', 'getCustomer failed', error);
    throw error;
  }
}

/**
 * Get customer with aggregated stats (total spent, purchases, etc.)
 *
 * @param customerId - Customer UUID
 * @param user - Authenticated user (optional for read)
 * @returns Customer with stats
 */
export async function getCustomerWithStats(customerId: string, user?: AuthUser | null) {
  try {
    if (user) {
      requireModuleAccess(user, 'customers');
    }

    // Get customer data
    const customer = await getCustomer(customerId, user);

    // Get sales stats
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('total, created_at')
      .eq('customer_id', customerId);

    if (salesError) {
      logger.warn('CustomerAPI', `Error fetching sales for customer ${customerId}`, salesError);
    }

    // Calculate stats
    const stats = {
      total_purchases: salesData?.length || 0,
      total_spent: salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0,
      average_purchase: salesData?.length ? (salesData.reduce((sum, sale) => sum + (sale.total || 0), 0) / salesData.length) : 0,
      last_purchase_date: salesData?.[0]?.created_at || undefined,
      first_purchase_date: salesData?.[salesData.length - 1]?.created_at || undefined,
      purchase_count: salesData?.length || 0,
      days_as_customer: customer.created_at ? Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      purchases_last_30_days: salesData?.filter(sale => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(sale.created_at) >= thirtyDaysAgo;
      }).length || 0,
      spending_last_30_days: salesData?.filter(sale => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(sale.created_at) >= thirtyDaysAgo;
      }).reduce((sum, sale) => sum + (sale.total || 0), 0) || 0,
    };

    return {
      ...customer,
      stats
    } as CustomerWithStats;
  } catch (error) {
    logger.error('CustomerAPI', 'getCustomerWithStats failed', error);
    throw error;
  }
}

/**
 * Create a new customer
 *
 * @param data - Customer creation data
 * @param user - Authenticated user (required)
 * @returns Created customer
 */
export async function createCustomer(data: CreateCustomerData, user: AuthUser) {
  try {
    requirePermission(user, 'customers', 'create');

    // Check for duplicate email
    if (data.email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existing) {
        throw new Error(`Customer with email ${data.email} already exists`);
      }
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name: data.name,
        phone: data.phone,
        mobile: data.mobile,
        email: data.email,
        dni: data.dni,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) {
      logger.error('CustomerAPI', 'Error creating customer', error);
      throw error;
    }

    logger.info('CustomerAPI', `Created customer: ${customer.id}`, { name: data.name });
    return customer as Customer;
  } catch (error) {
    logger.error('CustomerAPI', 'createCustomer failed', error);
    throw error;
  }
}

/**
 * Update an existing customer
 *
 * @param id - Customer UUID
 * @param data - Customer update data
 * @param user - Authenticated user (required)
 * @returns Updated customer
 */
export async function updateCustomer(id: string, data: UpdateCustomerData, user: AuthUser) {
  try {
    requirePermission(user, 'customers', 'update');

    // Check for duplicate email (if changing email)
    if (data.email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .neq('id', id)
        .single();

      if (existing) {
        throw new Error(`Another customer with email ${data.email} already exists`);
      }
    }

    const updateData: Partial<Customer> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.dni !== undefined) updateData.dni = data.dni;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('CustomerAPI', `Error updating customer ${id}`, error);
      throw error;
    }

    logger.info('CustomerAPI', `Updated customer: ${id}`);
    return customer as Customer;
  } catch (error) {
    logger.error('CustomerAPI', 'updateCustomer failed', error);
    throw error;
  }
}

/**
 * Delete a customer (soft delete by setting is_active = false)
 *
 * @param id - Customer UUID
 * @param user - Authenticated user (required)
 * @returns Success status
 */
export async function deleteCustomer(id: string, user: AuthUser) {
  try {
    requirePermission(user, 'customers', 'delete');

    // Check if customer has active orders
    const { data: activeSales, error: salesError } = await supabase
      .from('sales')
      .select('id')
      .eq('customer_id', id)
      .limit(1);

    if (salesError) {
      logger.error('CustomerAPI', `Error checking sales for customer ${id}`, salesError);
    }

    if (activeSales && activeSales.length > 0) {
      throw new Error('Cannot delete customer with existing orders. Consider deactivating instead.');
    }

    // Soft delete
    const { error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      logger.error('CustomerAPI', `Error deleting customer ${id}`, error);
      throw error;
    }

    logger.info('CustomerAPI', `Deleted (deactivated) customer: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('CustomerAPI', 'deleteCustomer failed', error);
    throw error;
  }
}

/**
 * Export customers to CSV format
 *
 * @param user - Authenticated user (required)
 * @param filters - Optional filters
 * @returns CSV string
 */
export async function exportCustomersToCSV(user: AuthUser, filters?: {
  status?: 'active' | 'inactive';
  search?: string;
}) {
  try {
    requirePermission(user, 'customers', 'export');

    const customers = await getCustomers(user, filters);

    // Generate CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Mobile', 'DNI', 'Notes', 'Created At', 'Status'];
    const rows = customers.map(c => [
      c.id,
      c.name || '',
      c.email || '',
      c.phone || '',
      c.mobile || '',
      c.dni || '',
      c.notes || '',
      c.created_at || '',
      c.is_active ? 'Active' : 'Inactive'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    logger.info('CustomerAPI', `Exported ${customers.length} customers to CSV`);
    return csv;
  } catch (error) {
    logger.error('CustomerAPI', 'exportCustomersToCSV failed', error);
    throw error;
  }
}

// ==========================================
// HELPER EXPORTS
// ==========================================

export const CustomerAPI = {
  getCustomers,
  getCustomer,
  getCustomerWithStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomersToCSV,
};

export default CustomerAPI;
