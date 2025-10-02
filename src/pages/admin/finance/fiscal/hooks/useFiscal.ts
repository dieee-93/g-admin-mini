import { useState, useEffect, useMemo } from 'react';
import { fiscalApi } from '../services/fiscalApi';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { type FiscalStats } from '../types';

import { logger } from '@/lib/logging';
interface UseFiscalReturn {
  fiscalStats: FiscalStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useFiscal(): UseFiscalReturn {
  const [fiscalStats, setFiscalStats] = useState<FiscalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiscalStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await fiscalApi.getFiscalStats();
      setFiscalStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas fiscales');
      logger.error('API', 'Error fetching fiscal stats:', err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchFiscalStats();
  };

  useEffect(() => {
    fetchFiscalStats();
  }, []);

  return {
    fiscalStats,
    isLoading,
    error,
    refreshStats
  };
}