import { useState, useMemo, useCallback } from 'react';
import { useMaterialsFilters } from '../../../hooks/useMaterialsFilters';
import { useMaterialsComputed } from '../../../hooks/useMaterialsComputed';
import { useMaterialsStore } from '@/store/materialsStore';
import type { ItemType } from '../../../types';

export function useInventoryState() {
  // Store - split subscriptions
  const { filters, setFilters } = useMaterialsFilters();
  const { getFilteredItems } = useMaterialsComputed();
  const selectedItems = useMaterialsStore((s) => s.selectedItems);
  const selectItem = useMaterialsStore((s) => s.selectItem);
  const deselectItem = useMaterialsStore((s) => s.deselectItem);
  const selectAll = useMaterialsStore((s) => s.selectAll);
  const deselectAll = useMaterialsStore((s) => s.deselectAll);

  // Local UI state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ✅ PERFORMANCE FIX: Memoize filtered materials to prevent creating new array reference on every render
  // Only recompute when filters actually change, not on every render
  const filteredMaterials = useMemo(() => {
    return getFilteredItems();
  }, [getFilteredItems]); // getFilteredItems already depends on filters internally

  // ✅ OPTIMIZATION: Memoize sorted materials to avoid re-sorting on every render
  const materials = useMemo(() => {
    if (!filteredMaterials || filteredMaterials.length === 0) return [];

    // Clone array to avoid mutating original
    const sorted = [...filteredMaterials];

    // Sort based on current criteria
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case 'unit_cost':
          comparison = (a.unit_cost || 0) - (b.unit_cost || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMaterials, sortBy, sortOrder]);

  // Advanced filters state (for drawer)
  const [advancedFilters, setAdvancedFilters] = useState({
    selectedTypes: [] as ItemType[],
    priceRange: [0, 10000] as [number, number],
    selectedSuppliers: [] as string[],
    showOutOfStock: false,
    showLowStock: false,
    showCritical: false,
    selectedABCClasses: [] as string[]
  });

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.stockStatus !== 'all') count++;
    if (advancedFilters.selectedTypes.length > 0) count++;
    if (advancedFilters.priceRange[0] > 0 || advancedFilters.priceRange[1] < 10000) count++;
    if (advancedFilters.selectedSuppliers.length > 0) count++;
    if (advancedFilters.showOutOfStock || advancedFilters.showLowStock || advancedFilters.showCritical) count++;
    if (advancedFilters.selectedABCClasses.length > 0) count++;
    return count;
  }, [filters, advancedFilters]);

  // Handlers - Wrapped in useCallback to prevent recreating on every render
  const handleSearch = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  const handleTypeChange = useCallback((type: 'all' | ItemType) => {
    setFilters({ type });
  }, [setFilters]);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters({ category });
  }, [setFilters]);

  const handleStockStatusChange = useCallback((stockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out') => {
    setFilters({ stockStatus });
  }, [setFilters]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
      setFilters({ sortBy: field as string, sortOrder: newSortOrder });
    } else {
      setSortBy(field);
      setSortOrder('asc');
      setFilters({ sortBy: field as string, sortOrder: 'asc' });
    }
  }, [sortBy, sortOrder, setFilters]);

  const handleApplyAdvancedFilters = useCallback(() => {
    // Apply advanced filters to store
    if (advancedFilters.selectedTypes.length > 0) {
      setFilters({ type: advancedFilters.selectedTypes[0] }); // TODO: Support multiple types
    }
    // TODO: Apply other advanced filters
    setIsFiltersDrawerOpen(false);
  }, [advancedFilters.selectedTypes, setFilters]);

  const handleClearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      selectedTypes: [],
      priceRange: [0, 10000],
      selectedSuppliers: [],
      showOutOfStock: false,
      showLowStock: false,
      showCritical: false,
      selectedABCClasses: []
    });
  }, []);

  return {
    // Data
    materials,
    selectedItems,

    // View state
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    handleSort,

    // Search & Filters
    searchValue: filters.search,
    handleSearch,
    selectedType: filters.type,
    handleTypeChange,
    selectedCategory: filters.category,
    handleCategoryChange,
    selectedStockStatus: filters.stockStatus,
    handleStockStatusChange,

    // Advanced filters
    isFiltersDrawerOpen,
    setIsFiltersDrawerOpen,
    advancedFilters,
    setAdvancedFilters,
    activeFiltersCount,
    handleApplyAdvancedFilters,
    handleClearAdvancedFilters,

    // Selection
    selectItem,
    deselectItem,
    selectAll,
    deselectAll
  };
}
