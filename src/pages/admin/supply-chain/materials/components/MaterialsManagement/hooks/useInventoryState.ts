import { useState, useMemo, useCallback } from 'react';
import { useMaterialsFilters } from '../../../hooks/useMaterialsFilters';
import { useMaterialsStore } from '@/modules/materials/store';
import type { ItemType } from '../../../types';

export function useInventoryState() {
  // Store - split subscriptions
  const { filters, setFilters } = useMaterialsFilters();
  
  // Selection state from store
  const selectedItems = useMaterialsStore((s) => s.selectedMaterialIds);
  const selectItem = useMaterialsStore((s) => s.selectMaterial);
  const deselectItem = useMaterialsStore((s) => s.deselectMaterial);
  const selectAll = useMaterialsStore((s) => s.selectAllMaterials);
  const deselectAll = useMaterialsStore((s) => s.clearSelection);

  // Local UI state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  
  // Sorting state (managed locally for UI, but could be synced to store)
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    setFilters({ searchTerm: value });
  }, [setFilters]);

  const handleTypeChange = useCallback((type: 'all' | ItemType) => {
    setFilters({ type: type === 'all' ? null : type });
  }, [setFilters]);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters({ category: category === 'all' ? null : category });
  }, [setFilters]);

  const handleStockStatusChange = useCallback((stockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out') => {
    setFilters({ stockStatus });
  }, [setFilters]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
      // Sync with store if needed, but local state is fine for now
      setFilters({ sortBy: field as any, sortOrder: newSortOrder });
    } else {
      setSortBy(field);
      setSortOrder('asc');
      setFilters({ sortBy: field as any, sortOrder: 'asc' });
    }
  }, [sortBy, sortOrder, setFilters]);

  const handleApplyAdvancedFilters = useCallback(() => {
    // Apply advanced filters to store
    // This maps the drawer state to the store filters
    if (advancedFilters.selectedTypes.length > 0) {
      // Assuming store only supports single type for now
      setFilters({ type: advancedFilters.selectedTypes[0] }); 
    }
    
    // Map stock checkboxes to single status
    if (advancedFilters.showOutOfStock) setFilters({ stockStatus: 'out' });
    else if (advancedFilters.showCritical) setFilters({ stockStatus: 'critical' });
    else if (advancedFilters.showLowStock) setFilters({ stockStatus: 'low' });
    
    setIsFiltersDrawerOpen(false);
  }, [advancedFilters, setFilters]);

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
    // Also reset main filters
    setFilters({ 
      type: null, 
      category: null, 
      stockStatus: 'all',
      searchTerm: ''
    });
  }, [setFilters]);

  return {
    // Data - REMOVED: Should be passed from parent
    // materials: [], // Component should use props.items
    selectedItems,

    // View state
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    handleSort,

    // Search & Filters
    searchValue: filters.searchTerm,
    handleSearch,
    selectedType: filters.type || 'all',
    handleTypeChange,
    selectedCategory: filters.category || 'all',
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
