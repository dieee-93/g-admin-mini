/**
 * Hook para manejar el Chart of Accounts (Plan de Cuentas)
 * Extrae la lógica de data fetching del componente ChartOfAccountsTree
 */

import { useState, useEffect } from 'react';
import { fetchChartOfAccounts } from '../services';
import { logger } from '@/lib/logging';
import type { ChartOfAccountsRow } from '../types';

interface UseChartOfAccountsReturn {
  accounts: ChartOfAccountsRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y gestionar el Chart of Accounts
 * 
 * @returns {UseChartOfAccountsReturn} Estado del chart of accounts
 * 
 * @example
 * ```tsx
 * const { accounts, isLoading, error, refetch } = useChartOfAccounts();
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage />;
 * 
 * return <AccountsList accounts={accounts} onRefresh={refetch} />;
 * ```
 */
export function useChartOfAccounts(): UseChartOfAccountsReturn {
  const [accounts, setAccounts] = useState<ChartOfAccountsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchChartOfAccounts();
      setAccounts(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('CashModule', 'Error loading chart of accounts', { error: err });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return {
    accounts,
    isLoading,
    error,
    refetch: loadAccounts,
  };
}
