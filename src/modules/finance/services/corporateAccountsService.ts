/**
 * Corporate Accounts Service
 *
 * Service layer for managing B2B corporate accounts with credit terms.
 * Handles CRUD operations and integrates with customers module.
 *
 * @module finance/services/corporateAccountsService
 */

import { supabase } from '@/lib/supabase/client';
import Decimal from 'decimal.js';
import { logger } from '@/lib/logging';
import type {
  CorporateAccount,
  CorporateAccountWithComputed,
  CorporateAccountFormData,
} from '../types';

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Base query for corporate accounts with customer join
 */
const getBaseQuery = () => {
  return supabase
    .from('corporate_accounts')
    .select(`
      *,
      customer:customers (
        id,
        name,
        email,
        phone
      )
    `);
};

/**
 * Compute derived fields for corporate account
 */
const computeFields = (account: CorporateAccount): CorporateAccountWithComputed => {
  const creditLimit = new Decimal(account.credit_limit || 0);
  const currentBalance = new Decimal(account.current_balance || 0);
  const availableCredit = creditLimit.minus(currentBalance);
  const creditUtilization = creditLimit.isZero()
    ? 0
    : currentBalance.dividedBy(creditLimit).times(100).toNumber();

  return {
    ...account,
    available_credit: availableCredit.toFixed(2),
    credit_utilization: Math.round(creditUtilization * 100) / 100, // Round to 2 decimals
  };
};

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all corporate accounts
 */
export const getCorporateAccounts = async (): Promise<CorporateAccountWithComputed[]> => {
  try {
    logger.debug('Finance', 'Fetching all corporate accounts');

    const { data, error } = await getBaseQuery().order('created_at', { ascending: false });

    if (error) {
      logger.error('Finance', 'Failed to fetch corporate accounts', error);
      throw error;
    }

    const accounts = (data || []) as CorporateAccount[];
    return accounts.map(computeFields);
  } catch (error) {
    logger.error('Finance', 'Error in getCorporateAccounts', error);
    throw error;
  }
};

/**
 * Get corporate account by ID
 */
export const getCorporateAccountById = async (
  id: string
): Promise<CorporateAccountWithComputed | null> => {
  try {
    logger.debug('Finance', 'Fetching corporate account', { id });

    const { data, error } = await getBaseQuery().eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('Finance', 'Corporate account not found', { id });
        return null;
      }
      logger.error('Finance', 'Failed to fetch corporate account', error);
      throw error;
    }

    return computeFields(data as CorporateAccount);
  } catch (error) {
    logger.error('Finance', 'Error in getCorporateAccountById', error);
    throw error;
  }
};

/**
 * Get corporate account by customer ID
 */
export const getCorporateAccountByCustomerId = async (
  customerId: string
): Promise<CorporateAccountWithComputed | null> => {
  try {
    logger.debug('Finance', 'Fetching corporate account by customer ID', { customerId });

    const { data, error } = await getBaseQuery().eq('customer_id', customerId).single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.debug('Finance', 'No corporate account for customer', { customerId });
        return null;
      }
      logger.error('Finance', 'Failed to fetch corporate account by customer', error);
      throw error;
    }

    return computeFields(data as CorporateAccount);
  } catch (error) {
    logger.error('Finance', 'Error in getCorporateAccountByCustomerId', error);
    throw error;
  }
};

/**
 * Create a new corporate account
 */
export const createCorporateAccount = async (
  formData: CorporateAccountFormData
): Promise<CorporateAccountWithComputed> => {
  try {
    logger.info('Finance', 'Creating corporate account', { customer_id: formData.customer_id });

    // Validate credit limit
    const creditLimit = new Decimal(formData.credit_limit);
    if (creditLimit.isNegative()) {
      throw new Error('Credit limit cannot be negative');
    }

    // Check if customer already has a corporate account
    const existing = await getCorporateAccountByCustomerId(formData.customer_id);
    if (existing) {
      throw new Error('Customer already has a corporate account');
    }

    const accountData = {
      customer_id: formData.customer_id,
      credit_limit: creditLimit.toFixed(2),
      current_balance: '0.00',
      payment_terms: formData.payment_terms,
      is_active: formData.is_active ?? true,
    };

    const { data, error } = await supabase
      .from('corporate_accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) {
      logger.error('Finance', 'Failed to create corporate account', error);
      throw error;
    }

    logger.info('Finance', 'Corporate account created successfully', { id: data.id });

    return computeFields(data as CorporateAccount);
  } catch (error) {
    logger.error('Finance', 'Error in createCorporateAccount', error);
    throw error;
  }
};

/**
 * Update an existing corporate account
 */
export const updateCorporateAccount = async (
  id: string,
  updates: Partial<CorporateAccountFormData>
): Promise<CorporateAccountWithComputed> => {
  try {
    logger.info('Finance', 'Updating corporate account', { id });

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Validate and set credit limit if provided
    if (updates.credit_limit !== undefined) {
      const creditLimit = new Decimal(updates.credit_limit);
      if (creditLimit.isNegative()) {
        throw new Error('Credit limit cannot be negative');
      }
      updateData.credit_limit = creditLimit.toFixed(2);
    }

    // Set payment terms if provided
    if (updates.payment_terms !== undefined) {
      updateData.payment_terms = updates.payment_terms;
    }

    // Set active status if provided
    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }

    const { data, error } = await supabase
      .from('corporate_accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Finance', 'Failed to update corporate account', error);
      throw error;
    }

    logger.info('Finance', 'Corporate account updated successfully', { id });

    return computeFields(data as CorporateAccount);
  } catch (error) {
    logger.error('Finance', 'Error in updateCorporateAccount', error);
    throw error;
  }
};

/**
 * Delete a corporate account (soft delete by marking inactive)
 */
export const deleteCorporateAccount = async (id: string): Promise<void> => {
  try {
    logger.info('Finance', 'Deleting corporate account (soft delete)', { id });

    const { error } = await supabase
      .from('corporate_accounts')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Finance', 'Failed to delete corporate account', error);
      throw error;
    }

    logger.info('Finance', 'Corporate account deleted successfully', { id });
  } catch (error) {
    logger.error('Finance', 'Error in deleteCorporateAccount', error);
    throw error;
  }
};

/**
 * Permanently delete a corporate account (hard delete)
 * WARNING: This is irreversible
 */
export const permanentlyDeleteCorporateAccount = async (id: string): Promise<void> => {
  try {
    logger.warn('Finance', 'Permanently deleting corporate account', { id });

    const { error } = await supabase.from('corporate_accounts').delete().eq('id', id);

    if (error) {
      logger.error('Finance', 'Failed to permanently delete corporate account', error);
      throw error;
    }

    logger.info('Finance', 'Corporate account permanently deleted', { id });
  } catch (error) {
    logger.error('Finance', 'Error in permanentlyDeleteCorporateAccount', error);
    throw error;
  }
};

/**
 * Activate a corporate account
 */
export const activateCorporateAccount = async (id: string): Promise<void> => {
  try {
    logger.info('Finance', 'Activating corporate account', { id });

    const { error } = await supabase
      .from('corporate_accounts')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Finance', 'Failed to activate corporate account', error);
      throw error;
    }

    logger.info('Finance', 'Corporate account activated successfully', { id });
  } catch (error) {
    logger.error('Finance', 'Error in activateCorporateAccount', error);
    throw error;
  }
};

/**
 * Get active corporate accounts only
 */
export const getActiveCorporateAccounts = async (): Promise<CorporateAccountWithComputed[]> => {
  try {
    logger.debug('Finance', 'Fetching active corporate accounts');

    const { data, error } = await getBaseQuery()
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Finance', 'Failed to fetch active corporate accounts', error);
      throw error;
    }

    const accounts = (data || []) as CorporateAccount[];
    return accounts.map(computeFields);
  } catch (error) {
    logger.error('Finance', 'Error in getActiveCorporateAccounts', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  getCorporateAccounts,
  getCorporateAccountById,
  getCorporateAccountByCustomerId,
  createCorporateAccount,
  updateCorporateAccount,
  deleteCorporateAccount,
  permanentlyDeleteCorporateAccount,
  activateCorporateAccount,
  getActiveCorporateAccounts,
};
