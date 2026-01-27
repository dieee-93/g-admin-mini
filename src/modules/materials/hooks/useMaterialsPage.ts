/**
 * useMaterialsPage Hook
 * 
 * Page-level facade hook for Materials page.
 * Combines TanStack Query hooks, UI state, and computed metrics.
 * 
 * @module materials/hooks
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useNavigationActions } from '@/contexts/NavigationContext';
import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  useAdjustStock,
  useBulkDeleteMaterials,
  useBulkAdjustStock,
  useBulkToggleActive,
  useABCAnalysis,
} from '@/modules/materials/hooks';
import { StockCalculation } from '@/modules/materials/services/stockCalculation';
import { TrendsService } from '@/modules/materials/services';
import { logger } from '@/lib/logging';
import type { MaterialItem, ItemFormData } from '@/modules/materials/types';
import type { ABCAnalysisConfig } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = 'grid' | 'table' | 'cards';
export type ActiveTab = 'inventory' | 'analytics' | 'procurement' | 'transfers';
export type StockStatus = 'low' | 'critical' | 'healthy';

export interface MaterialsFilters {
  stockStatus?: StockStatus;
  category?: string;
  supplier?: string;
  abcClass?: 'A' | 'B' | 'C';
  searchQuery?: string;
}

export interface MaterialsPageState {
  activeTab: ActiveTab;
  viewMode: ViewMode;
  filters: MaterialsFilters;
  bulkMode: boolean;
  selectedItems: string[];
  selectedCategory: string | null;
}

export interface MaterialsPageMetrics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  outOfStockItems: number;
  supplierCount: number;
  lastUpdate: Date;
  classAValue: number;
  classBValue: number;
  classCValue: number;
  valueGrowth: number;
  stockTurnover: number;
  avgTurnoverRate: number;
  fastMovingItems: string[];
  slowMovingItems: string[];
}

export interface UseMaterialsPageParams {
  openModal: (mode: 'add' | 'edit' | 'view', item?: MaterialItem) => void;
}

export interface UseMaterialsPageReturn {
  materials: MaterialItem[];
  filteredMaterials: MaterialItem[];
  loading: boolean;
  error: Error | null;
  
  pageState: MaterialsPageState;
  setActiveTab: (tab: ActiveTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: MaterialsFilters) => void;
  toggleBulkMode: () => void;
  setSelectedItems: (items: string[]) => void;
  
  metrics: MaterialsPageMetrics;
  
  createMaterial: (data: ItemFormData) => Promise<void>;
  updateMaterial: (id: string, data: Partial<MaterialItem>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  adjustStock: (id: string, newStock: number, oldStock?: number) => Promise<void>;
  
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkAdjustStock: (adjustments: Array<{ itemId: string; adjustment: number; reason: string }>) => Promise<void>;
  bulkToggleActive: (ids: string[], isActive: boolean) => Promise<void>;
  
  abcAnalysis: ReturnType<typeof useABCAnalysis>['data'];
  abcAnalysisLoading: boolean;
  
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMaterialsPage({ openModal }: UseMaterialsPageParams): UseMaterialsPageReturn {
  const { user } = useAuth();
  const { selectedLocation, isMultiLocationMode } = useLocation();
  const { setQuickActions } = useNavigationActions();
  
  const locationId = isMultiLocationMode && selectedLocation?.id ? selectedLocation.id : undefined;
  
  // ============================================================================
  // SERVER STATE (TanStack Query)
  // ============================================================================
  
  const {
    data: materials = [],
    isLoading,
    error,
    refetch,
  } = useMaterials();
  
  const abcAnalysisQuery = useABCAnalysis({
    materials,
    config: { primaryCriteria: 'revenue' },
    enabled: materials.length > 0,
  });
  
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();
  const adjustStockMutation = useAdjustStock();
  const bulkDeleteMutation = useBulkDeleteMaterials();
  const bulkAdjustStockMutation = useBulkAdjustStock();
  const bulkToggleActiveMutation = useBulkToggleActive();
  
  // ============================================================================
  // UI STATE
  // ============================================================================
  
  const [pageState, setPageState] = useState<MaterialsPageState>({
    activeTab: 'inventory',
    viewMode: 'table',
    filters: {},
    bulkMode: false,
    selectedItems: [],
    selectedCategory: null,
  });
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const filteredMaterials = useMemo(() => {
    let filtered = [...materials];
    const { stockStatus, category, supplier, abcClass, searchQuery } = pageState.filters;
    
    if (stockStatus === 'low') {
      filtered = StockCalculation.getLowStockItems(filtered);
    } else if (stockStatus === 'critical') {
      filtered = StockCalculation.getCriticalStockItems(filtered);
    }
    
    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }
    
    if (pageState.selectedCategory) {
      filtered = filtered.filter(m => m.category === pageState.selectedCategory);
    }
    
    if (supplier) {
      filtered = filtered.filter(m => m.supplier_id === supplier);
    }
    
    if (abcClass && abcAnalysisQuery.data) {
      const classItems = abcAnalysisQuery.data[`class${abcClass}`];
      const classIds = new Set(classItems.map(item => item.id));
      filtered = filtered.filter(m => classIds.has(m.id));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [materials, pageState.filters, pageState.selectedCategory, abcAnalysisQuery.data]);
  
  const metrics = useMemo<MaterialsPageMetrics>(() => {
    const totalValue = materials.reduce((sum, m) => sum + (m.stock * m.unit_cost), 0);
    const lowStock = StockCalculation.getLowStockItems(materials).length;
    const criticalStock = StockCalculation.getCriticalStockItems(materials).length;
    const outOfStock = StockCalculation.getOutOfStockItems(materials).length;
    
    const abcData = abcAnalysisQuery.data;
    const classAValue = abcData?.classA.reduce((sum, item) => sum + (item.stock * item.unit_cost), 0) || 0;
    const classBValue = abcData?.classB.reduce((sum, item) => sum + (item.stock * item.unit_cost), 0) || 0;
    const classCValue = abcData?.classC.reduce((sum, item) => sum + (item.stock * item.unit_cost), 0) || 0;
    
    return {
      totalItems: materials.length,
      totalValue,
      lowStockItems: lowStock,
      criticalStockItems: criticalStock,
      outOfStockItems: outOfStock,
      supplierCount: new Set(materials.map(m => m.supplier_id).filter(Boolean)).size,
      lastUpdate: new Date(),
      classAValue,
      classBValue,
      classCValue,
      valueGrowth: 0,
      stockTurnover: 0,
      avgTurnoverRate: 0,
      fastMovingItems: [],
      slowMovingItems: [],
    };
  }, [materials, abcAnalysisQuery.data]);
  
  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  const setActiveTab = useCallback((tab: ActiveTab) => {
    setPageState(prev => ({ ...prev, activeTab: tab }));
  }, []);
  
  const setViewMode = useCallback((mode: ViewMode) => {
    setPageState(prev => ({ ...prev, viewMode: mode }));
  }, []);
  
  const setFilters = useCallback((filters: MaterialsFilters) => {
    setPageState(prev => ({ ...prev, filters }));
  }, []);
  
  const toggleBulkMode = useCallback(() => {
    setPageState(prev => ({ ...prev, bulkMode: !prev.bulkMode, selectedItems: [] }));
  }, []);
  
  const setSelectedItems = useCallback((items: string[]) => {
    setPageState(prev => ({ ...prev, selectedItems: items }));
  }, []);
  
  const createMaterial = useCallback(async (data: ItemFormData) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);
  
  const updateMaterial = useCallback(async (id: string, data: Partial<MaterialItem>) => {
    await updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);
  
  const deleteMaterial = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);
  
  const adjustStock = useCallback(async (id: string, newStock: number, oldStock?: number) => {
    await adjustStockMutation.mutateAsync({ materialId: id, newStock, oldStock });
  }, [adjustStockMutation]);
  
  const bulkDelete = useCallback(async (ids: string[]) => {
    await bulkDeleteMutation.mutateAsync(ids);
    setPageState(prev => ({ ...prev, bulkMode: false, selectedItems: [] }));
  }, [bulkDeleteMutation]);
  
  const bulkAdjustStock = useCallback(async (
    adjustments: Array<{ itemId: string; adjustment: number; reason: string }>
  ) => {
    await bulkAdjustStockMutation.mutateAsync(adjustments);
    setPageState(prev => ({ ...prev, bulkMode: false, selectedItems: [] }));
  }, [bulkAdjustStockMutation]);
  
  const bulkToggleActive = useCallback(async (ids: string[], isActive: boolean) => {
    await bulkToggleActiveMutation.mutateAsync({ itemIds: ids, isActive });
    setPageState(prev => ({ ...prev, bulkMode: false, selectedItems: [] }));
  }, [bulkToggleActiveMutation]);
  
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  // ============================================================================
  // QUICK ACTIONS
  // ============================================================================
  
  useEffect(() => {
    if (typeof setQuickActions === 'function') {
      setQuickActions([]);
    }
  }, [setQuickActions]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    materials,
    filteredMaterials,
    loading: isLoading,
    error: error as Error | null,
    
    pageState,
    setActiveTab,
    setViewMode,
    setFilters,
    toggleBulkMode,
    setSelectedItems,
    
    metrics,
    
    createMaterial,
    updateMaterial,
    deleteMaterial,
    adjustStock,
    
    bulkDelete,
    bulkAdjustStock,
    bulkToggleActive,
    
    abcAnalysis: abcAnalysisQuery.data,
    abcAnalysisLoading: abcAnalysisQuery.isLoading,
    
    refresh,
  };
}
