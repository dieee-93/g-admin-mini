// ============================================
// USE SUPPLIERS PAGE HOOK - Page orchestration
// ============================================

import { useState, useMemo, useCallback } from 'react';
import { useSuppliersStore } from '@/modules/suppliers/store';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/modules/suppliers/hooks';
import { suppliersService } from '../services/suppliersService';
import type {
  SupplierTab,
  SupplierFilters,
  SupplierSort,
  SupplierMetrics
} from '../types/supplierTypes';
import { logger } from '@/lib/logging';

/**
 * Default filters
 */
const DEFAULT_FILTERS: SupplierFilters = {
  searchText: '',
  isActive: null,
  minRating: null,
  hasContact: null
};

/**
 * Default sort
 */
const DEFAULT_SORT: SupplierSort = {
  field: 'name',
  direction: 'asc'
};

/**
 * Hook for suppliers page orchestration
 *
 * Handles:
 * - UI state (tabs, modals, filters)
 * - Data transformation (filtering, sorting)
 * - Metrics calculation
 * - Page-level actions
 */
export function useSuppliersPage() {
  // ============================================
  // DATA LAYER
  // ============================================

  // ✅ TanStack Query hooks
  const { data: suppliers = [], isLoading: loading, error, refetch: refreshData } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  // Wrapper functions for backward compatibility
  const createSupplier = useCallback(async (data: any) => {
    return await createMutation.mutateAsync(data);
  }, [createMutation]);

  const updateSupplier = useCallback(async (id: string, data: any) => {
    return await updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteSupplier = useCallback(async (id: string) => {
    return await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  // TODO: Implement toggleActive mutation
  const toggleActive = useCallback(async (id: string) => {
    logger.warn('useSuppliersPage', 'toggleActive not yet implemented in TanStack Query');
  }, []);

  // ============================================
  // UI STATE
  // ============================================

  // ✅ ENTERPRISE PATTERN: Modal state in store with atomic selectors
  const isModalOpen = useSuppliersStore((state) => state.isModalOpen);
  const modalMode = useSuppliersStore((state) => state.modalMode);
  const currentSupplier = useSuppliersStore((state) => state.currentSupplier);
  const openModal = useSuppliersStore((state) => state.openModal);
  const closeModal = useSuppliersStore((state) => state.closeModal);

  // Local UI state (not modal-related)
  const [activeTab, setActiveTab] = useState<SupplierTab>('list');
  const [filters, setFilters] = useState<SupplierFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SupplierSort>(DEFAULT_SORT);

  // ============================================
  // DATA TRANSFORMATION
  // ============================================

  /**
   * Apply filters and sort
   */
  const processedSuppliers = useMemo(() => {
    let result = suppliers;

    // Apply filters
    result = suppliersService.filterSuppliers(result, filters);

    // Apply sort
    result = suppliersService.sortSuppliers(result, sort);

    return result;
  }, [suppliers, filters, sort]);

  /**
   * Calculate metrics
   */
  const metrics: SupplierMetrics = useMemo(() => {
    return suppliersService.calculateMetrics(suppliers);
  }, [suppliers]);

  // ============================================
  // MODAL ACTIONS
  // ============================================

  const handleOpenCreate = useCallback(() => {
    logger.debug('useSuppliersPage', 'Opening create modal');
    openModal('add');
  }, [openModal]);

  const handleOpenEdit = useCallback((supplierId: string) => {
    logger.debug('useSuppliersPage', `Opening edit modal for supplier: ${supplierId}`);
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      openModal('edit', supplier);
    }
  }, [openModal, suppliers]);

  const handleCloseModal = useCallback(() => {
    logger.debug('useSuppliersPage', 'Closing modal');
    closeModal();
  }, [closeModal]);

  // ============================================
  // FILTER ACTIONS
  // ============================================

  const handleFilterChange = useCallback((newFilters: Partial<SupplierFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ============================================
  // SORT ACTIONS
  // ============================================

  const handleSortChange = useCallback((field: SupplierSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // ============================================
  // TAB ACTIONS
  // ============================================

  const handleTabChange = useCallback((tab: string) => {
    logger.debug('useSuppliersPage', `Changing tab to: ${tab}`);
    setActiveTab(tab as SupplierTab);
  }, []);

  // ============================================
  // SUPPLIER ACTIONS
  // ============================================

  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      await toggleActive(id, isActive);
    } catch (error) {
      logger.error('useSuppliersPage', 'Error toggling supplier status', error);
    }
  }, [toggleActive]);

  const handleDeleteSupplier = useCallback(async (id: string) => {
    try {
      await deleteSupplier(id);
      logger.info('useSuppliersPage', 'Supplier deleted successfully');
    } catch (error) {
      logger.error('useSuppliersPage', 'Error deleting supplier', error);
      throw error; // Re-throw to let UI handle it
    }
  }, [deleteSupplier]);

  // ============================================
  // RETURN
  // ============================================

  // ✅ PERFORMANCE FIX: Return raw object instead of wrapping in useMemo
  // All callbacks are already memoized with useCallback (stable references)
  // Primitive values and data objects only change when actual data changes
  // Previous pattern created new object on ANY of 37 dependency changes
  // This caused TabsContext thrashing (323 re-renders)
  return {
    // Data
    suppliers: processedSuppliers,
    allSuppliers: suppliers,
    metrics,
    loading,
    error,

    // UI State
    activeTab,
    isModalOpen,
    modalMode,
    currentSupplier,
    filters,
    sort,

    // Actions
    setActiveTab: handleTabChange,
    openCreateModal: handleOpenCreate,
    openEditModal: handleOpenEdit,
    closeModal: handleCloseModal,
    setFilters: handleFilterChange,
    resetFilters: handleResetFilters,
    setSort: handleSortChange,
    toggleActive: handleToggleActive,
    deleteSupplier: handleDeleteSupplier,

    // Mutations
    createSupplier,
    updateSupplier,
    refreshData
  };
}
