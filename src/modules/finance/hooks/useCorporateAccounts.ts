/**
 * useCorporateAccounts Hook
 *
 * React hook for managing corporate accounts state and operations.
 * Provides CRUD operations and real-time updates.
 *
 * @module finance/hooks/useCorporateAccounts
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logging';
import type { CorporateAccountWithComputed, CorporateAccountFormData } from '../types';
import * as corporateAccountsService from '../services/corporateAccountsService';

export interface UseCorporateAccountsReturn {
  accounts: CorporateAccountWithComputed[];
  loading: boolean;
  error: string | null;
  refreshAccounts: () => Promise<void>;
  createAccount: (formData: CorporateAccountFormData) => Promise<CorporateAccountWithComputed>;
  updateAccount: (
    id: string,
    updates: Partial<CorporateAccountFormData>
  ) => Promise<CorporateAccountWithComputed>;
  deleteAccount: (id: string) => Promise<void>;
  activateAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => CorporateAccountWithComputed | undefined;
  getAccountByCustomerId: (customerId: string) => Promise<CorporateAccountWithComputed | null>;
}

/**
 * Hook for managing corporate accounts
 *
 * @param options - Hook options
 * @param options.autoLoad - Auto-load accounts on mount (default: true)
 * @param options.activeOnly - Load only active accounts (default: false)
 * @returns Corporate accounts state and operations
 */
export const useCorporateAccounts = (
  options: {
    autoLoad?: boolean;
    activeOnly?: boolean;
  } = {}
): UseCorporateAccountsReturn => {
  const { autoLoad = true, activeOnly = false } = options;

  const [accounts, setAccounts] = useState<CorporateAccountWithComputed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load accounts from database
   */
  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Finance', 'Loading corporate accounts', { activeOnly });

      const data = activeOnly
        ? await corporateAccountsService.getActiveCorporateAccounts()
        : await corporateAccountsService.getCorporateAccounts();

      setAccounts(data);
      logger.debug('Finance', 'Loaded corporate accounts', { count: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load corporate accounts';
      logger.error('Finance', 'Error loading corporate accounts', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  /**
   * Create a new corporate account
   */
  const createAccount = useCallback(
    async (formData: CorporateAccountFormData): Promise<CorporateAccountWithComputed> => {
      setError(null);

      try {
        logger.info('Finance', 'Creating corporate account');

        const newAccount = await corporateAccountsService.createCorporateAccount(formData);

        // Add to local state
        setAccounts((prev) => [newAccount, ...prev]);

        logger.info('Finance', 'Corporate account created', { id: newAccount.id });
        return newAccount;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create corporate account';
        logger.error('Finance', 'Error creating corporate account', err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Update an existing corporate account
   */
  const updateAccount = useCallback(
    async (
      id: string,
      updates: Partial<CorporateAccountFormData>
    ): Promise<CorporateAccountWithComputed> => {
      setError(null);

      try {
        logger.info('Finance', 'Updating corporate account', { id });

        const updatedAccount = await corporateAccountsService.updateCorporateAccount(id, updates);

        // Update in local state
        setAccounts((prev) =>
          prev.map((account) => (account.id === id ? updatedAccount : account))
        );

        logger.info('Finance', 'Corporate account updated', { id });
        return updatedAccount;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update corporate account';
        logger.error('Finance', 'Error updating corporate account', err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Delete (deactivate) a corporate account
   */
  const deleteAccount = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      logger.info('Finance', 'Deleting corporate account', { id });

      await corporateAccountsService.deleteCorporateAccount(id);

      // Update in local state (mark as inactive)
      setAccounts((prev) =>
        prev.map((account) => (account.id === id ? { ...account, is_active: false } : account))
      );

      logger.info('Finance', 'Corporate account deleted', { id });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete corporate account';
      logger.error('Finance', 'Error deleting corporate account', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Activate a corporate account
   */
  const activateAccount = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      logger.info('Finance', 'Activating corporate account', { id });

      await corporateAccountsService.activateCorporateAccount(id);

      // Update in local state
      setAccounts((prev) =>
        prev.map((account) => (account.id === id ? { ...account, is_active: true } : account))
      );

      logger.info('Finance', 'Corporate account activated', { id });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to activate corporate account';
      logger.error('Finance', 'Error activating corporate account', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get account by ID from local state
   */
  const getAccountById = useCallback(
    (id: string): CorporateAccountWithComputed | undefined => {
      return accounts.find((account) => account.id === id);
    },
    [accounts]
  );

  /**
   * Get account by customer ID (fetches from database)
   */
  const getAccountByCustomerId = useCallback(
    async (customerId: string): Promise<CorporateAccountWithComputed | null> => {
      setError(null);

      try {
        logger.debug('Finance', 'Fetching account by customer ID', { customerId });

        const account = await corporateAccountsService.getCorporateAccountByCustomerId(customerId);
        return account;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch corporate account';
        logger.error('Finance', 'Error fetching account by customer ID', err);
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // Auto-load accounts on mount
  useEffect(() => {
    if (autoLoad) {
      refreshAccounts();
    }
  }, [autoLoad, refreshAccounts]);

  return {
    accounts,
    loading,
    error,
    refreshAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    activateAccount,
    getAccountById,
    getAccountByCustomerId,
  };
};
