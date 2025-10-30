import { useState, useMemo } from 'react';
import { useMaterials } from '@/store/materialsStore';
import type { ItemType } from '../../../types';

export function useInventoryState() {
  // Store
  const {
    getFilteredItems,
    filters,
    setFilters,
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll
  } = useMaterials();

  // Local UI state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get filtered materials
  const materials = getFilteredItems();

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

  // Handlers
  const handleSearch = (value: string) => {
    setFilters({ search: value });
  };

  const handleTypeChange = (type: 'all' | ItemType) => {
    setFilters({ type });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ category });
  };

  const handleStockStatusChange = (stockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out') => {
    setFilters({ stockStatus });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setFilters({ sortBy: field as any, sortOrder });
  };

  const handleApplyAdvancedFilters = () => {
    // Apply advanced filters to store
    if (advancedFilters.selectedTypes.length > 0) {
      setFilters({ type: advancedFilters.selectedTypes[0] }); // TODO: Support multiple types
    }
    // TODO: Apply other advanced filters
    setIsFiltersDrawerOpen(false);
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({
      selectedTypes: [],
      priceRange: [0, 10000],
      selectedSuppliers: [],
      showOutOfStock: false,
      showLowStock: false,
      showCritical: false,
      selectedABCClasses: []
    });
  };

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
