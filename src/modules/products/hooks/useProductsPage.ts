/**
 * Products Page Facade Hook
 * Combines TanStack Query (server state) + Zustand (UI state)
 * 
 * Pattern: Following Cash Module facade pattern
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductPublish } from '@/modules/products/hooks/useProducts';
import { useProductsStore, useProductFilters } from '@/modules/products/store/productsStore';
import type { ProductWithIntelligence } from '@/pages/admin/supply-chain/products/types';

// ============================================
// FACADE HOOK
// ============================================

export function useProductsPage() {
  // Server State (TanStack Query)
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useProducts();

  // UI State (Zustand) with useShallow for object selector
  const {
    activeTab,
    viewMode,
    selectedProductId,
    setActiveTab,
    setViewMode,
    selectProduct,
    setFilters,
    clearFilters,
  } = useProductsStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      viewMode: state.viewMode,
      selectedProductId: state.selectedProductId,
      setActiveTab: state.setActiveTab,
      setViewMode: state.setViewMode,
      selectProduct: state.selectProduct,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
    }))
  );

  const filters = useProductFilters();

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const togglePublishMutation = useToggleProductPublish();

  // Filtered Products (client-side filtering)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.hasRecipe !== undefined) {
      result = result.filter(p => 
        filters.hasRecipe 
          ? (p.components_count && p.components_count > 0) 
          : (!p.components_count || p.components_count === 0)
      );
    }

    if (filters.isPublished !== undefined) {
      result = result.filter(p => p.is_published === filters.isPublished);
    }

    if (filters.isDigital !== undefined) {
      result = result.filter(p => p.type === 'DIGITAL');
    }

    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, filters]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      totalProducts: products.length,
      productsWithRecipes: products.filter(p => p.components_count && p.components_count > 0).length,
      serviceProducts: products.filter(p => p.type === 'SERVICE').length,
      digitalProducts: products.filter(p => p.type === 'DIGITAL').length,
      elaboratedProducts: products.filter(p => p.type === 'ELABORATED').length,
      publishedProducts: products.filter(p => p.is_published).length,
      lastUpdate: new Date(),
    };
  }, [products]);

  // Selected Product (derived from server state)
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  return {
    // Server State
    products,
    filteredProducts,
    selectedProduct,
    metrics,
    isLoading,
    error: error ? String(error) : null,
    refresh: refetch,

    // UI State
    activeTab,
    viewMode,
    selectedProductId,
    filters,

    // Actions - UI
    setActiveTab,
    setViewMode,
    selectProduct,
    setFilters,
    clearFilters,

    // Actions - Mutations
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    togglePublish: togglePublishMutation.mutateAsync,

    // Mutation States
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isTogglingPublish: togglePublishMutation.isPending,
  };
}

// ============================================
// TYPED RETURN
// ============================================

export type UseProductsPageReturn = ReturnType<typeof useProductsPage>;
