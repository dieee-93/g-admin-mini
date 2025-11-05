// ============================================
// USE SUPPLIER ANALYTICS HOOK
// ============================================
// Hook for fetching and managing supplier analytics data

import { useState, useEffect, useCallback } from 'react';
import { supplierAnalyticsService } from '../services/supplierAnalyticsService';
import { suppliersService } from '../services/suppliersService';
import { inventoryApi } from '@/pages/admin/supply-chain/materials/services/inventoryApi';
import { supplierOrdersApi } from '@/pages/admin/supply-chain/supplier-orders/services/supplierOrdersApi';
import type { SupplierAnalysisResult } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import { logger } from '@/lib/logging';

interface UseSupplierAnalyticsReturn {
  analytics: SupplierAnalysisResult | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

/**
 * Hook for supplier analytics data
 * Fetches suppliers, materials, and orders, then runs analysis
 */
export function useSupplierAnalytics(): UseSupplierAnalyticsReturn {
  const [analytics, setAnalytics] = useState<SupplierAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('useSupplierAnalytics', 'Fetching data for analytics');

      // Fetch all required data in parallel
      const [suppliers, materials, orders] = await Promise.all([
        suppliersService.getAllSuppliers(),
        inventoryApi.getItems(),
        supplierOrdersApi.getAllOrders()
      ]);

      logger.info('useSupplierAnalytics', 'Data fetched', {
        suppliersCount: suppliers.length,
        materialsCount: materials.length,
        ordersCount: orders.length
      });

      // Run analysis
      const result = await supplierAnalyticsService.runAnalysis(
        suppliers,
        materials,
        orders
      );

      setAnalytics(result);
      logger.info('useSupplierAnalytics', 'Analytics computed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar analytics';
      setError(errorMessage);
      logger.error('useSupplierAnalytics', 'Error fetching analytics', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
}
