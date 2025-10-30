// ============================================
// USE SUPPLIERS HOOK - Data fetching & mutations
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { suppliersService } from '../services/suppliersService';
import type { Supplier, SupplierFormData } from '../types/supplierTypes';
import { logger } from '@/lib/logging';
import { useErrorHandler } from '@/lib/error-handling';

/**
 * Hook for suppliers data management
 *
 * Handles:
 * - Data fetching
 * - CRUD operations
 * - Loading states
 * - Error handling
 */
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await suppliersService.getAllSuppliers();
      setSuppliers(data);

      logger.debug('useSuppliers', `Fetched ${data.length} suppliers`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar proveedores';
      setError(errorMessage);
      handleError(err as Error);
      logger.error('useSuppliers', 'Error fetching suppliers', err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Initial load
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Create new supplier
   */
  const createSupplier = useCallback(async (data: SupplierFormData): Promise<Supplier> => {
    try {
      const newSupplier = await suppliersService.createSupplier(data);

      // Optimistic update
      setSuppliers(prev => [...prev, newSupplier]);

      logger.info('useSuppliers', 'Supplier created successfully');
      return newSupplier;
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  /**
   * Update existing supplier
   */
  const updateSupplier = useCallback(async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
    try {
      const updatedSupplier = await suppliersService.updateSupplier(id, data);

      // Optimistic update
      setSuppliers(prev =>
        prev.map(s => s.id === id ? updatedSupplier : s)
      );

      logger.info('useSuppliers', 'Supplier updated successfully');
      return updatedSupplier;
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  /**
   * Toggle supplier active status
   */
  const toggleActive = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    try {
      const updatedSupplier = await suppliersService.toggleActive(id, isActive);

      // Optimistic update
      setSuppliers(prev =>
        prev.map(s => s.id === id ? updatedSupplier : s)
      );

      logger.info('useSuppliers', `Supplier ${isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  /**
   * Delete supplier
   */
  const deleteSupplier = useCallback(async (id: string): Promise<void> => {
    try {
      await suppliersService.deleteSupplier(id);

      // Optimistic update
      setSuppliers(prev => prev.filter(s => s.id !== id));

      logger.info('useSuppliers', 'Supplier deleted successfully');
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  /**
   * Refresh data (re-fetch from server)
   */
  const refreshData = useCallback(async () => {
    await fetchSuppliers();
  }, [fetchSuppliers]);

  // ============================================
  // RETURN
  // ============================================

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    toggleActive,
    deleteSupplier,
    refreshData
  };
}
