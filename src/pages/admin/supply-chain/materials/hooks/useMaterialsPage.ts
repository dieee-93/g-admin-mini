import { useState, useEffect, useCallback } from 'react';
import {
  CubeIcon,
  PlusIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMaterials } from '@/store/materialsStore';
import { inventoryApi } from '../services/inventoryApi';
import { MaterialsNormalizer } from '../services';
import { StockCalculation } from '../services/stockCalculation';
import { ABCAnalysisEngine } from '../services/abcAnalysisEngine';
import { useApp } from '@/hooks/useZustandStores';
import type { MaterialItem } from '../types';

export interface MaterialsPageState {
  showABCAnalysis: boolean;
  showProcurement: boolean;
  showSupplyChain: boolean;
  showPredictiveAnalytics: boolean;
  selectedCategory: string | null;
  viewMode: 'grid' | 'table' | 'cards';
}

export interface MaterialsPageActions {
  handleNewMaterial: () => void;
  handleABCAnalysis: () => void;
  handleProcurement: () => void;
  handleSupplyChain: () => void;
  handlePredictiveAnalytics: () => void;
  handleStockAlert: () => void;
  handleBulkActions: () => void;
  toggleABCAnalysis: () => void;
  toggleProcurement: () => void;
  toggleSupplyChain: () => void;
  setViewMode: (mode: 'grid' | 'table' | 'cards') => void;
  setSelectedCategory: (category: string | null) => void;
}

export interface MaterialsPageMetrics {
  totalItems: number;
  lowStockItems: number;
  criticalStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  supplierCount: number;
}

export interface UseMaterialsPageReturn {
  // State
  pageState: MaterialsPageState;

  // Data
  items: MaterialItem[];
  metrics: MaterialsPageMetrics;
  loading: boolean;
  error: string | null;

  // Actions
  actions: MaterialsPageActions;

  // Data operations
  loadInventoryData: () => Promise<void>;

  // Quick filters
  getFilteredItems: () => MaterialItem[];
  getLowStockItems: () => MaterialItem[];
  getCriticalStockItems: () => MaterialItem[];
  getOutOfStockItems: () => MaterialItem[];
}

export const useMaterialsPage = (): UseMaterialsPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();
  const { handleError } = useApp();

  // Materials store state
  const {
    getFilteredItems,
    loading,
    error,
    openModal,
    setItems,
    refreshStats
  } = useMaterials();

  const items = getFilteredItems();

  // Page-specific state
  const [pageState, setPageState] = useState<MaterialsPageState>({
    showABCAnalysis: false,
    showProcurement: false,
    showSupplyChain: false,
    showPredictiveAnalytics: false,
    selectedCategory: null,
    viewMode: 'table'
  });

  // Calculate metrics using business logic services
  const metrics: MaterialsPageMetrics = {
    totalItems: items.length,
    lowStockItems: StockCalculation.getLowStockItems(items).length,
    criticalStockItems: StockCalculation.getCriticalStockItems(items).length,
    outOfStockItems: StockCalculation.getOutOfStockItems(items).length,
    totalValue: items.reduce((sum, item) => sum + StockCalculation.getTotalValue(item), 0),
    supplierCount: new Set(items.map(item => item.supplier_id).filter(Boolean)).size
  };

  // Setup quick actions in navigation
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-material',
        label: 'Nuevo Material',
        icon: PlusIcon,
        action: () => handleNewMaterial(),
        color: 'purple'
      },
      {
        id: 'abc-analysis',
        label: 'Análisis ABC',
        icon: ChartBarIcon,
        action: () => handleABCAnalysis(),
        color: 'blue'
      },
      {
        id: 'procurement',
        label: 'Compras',
        icon: ClipboardDocumentListIcon,
        action: () => handleProcurement(),
        color: 'green'
      },
      {
        id: 'supply-chain',
        label: 'Cadena Supply',
        icon: BuildingStorefrontIcon,
        action: () => handleSupplyChain(),
        color: 'orange'
      },
      {
        id: 'stock-alerts',
        label: 'Alertas Stock',
        icon: ExclamationTriangleIcon,
        action: () => handleStockAlert(),
        color: 'red'
      }
    ];

    setQuickActions(quickActions);

    return () => setQuickActions([]);
  }, [setQuickActions]);

  // Update navigation badge with critical items count
  useEffect(() => {
    if (updateModuleBadge) {
      const criticalCount = metrics.criticalStockItems;
      updateModuleBadge('materials', criticalCount > 0 ? criticalCount : items.length);
    }
  }, [items.length, metrics.criticalStockItems, updateModuleBadge]);

  // Load inventory data
  const loadInventoryData = useCallback(async () => {
    try {
      setItems([]);
      const apiItems = await inventoryApi.getItems();

      // Use centralized normalizer service
      const normalizedItems = MaterialsNormalizer.normalizeApiItems(apiItems);

      setItems(normalizedItems);
      if (refreshStats) refreshStats();
    } catch (error) {
      console.error('Error loading inventory data:', error);
      handleError(error as Error, { operation: 'loadInventory' });
    }
  }, [setItems, refreshStats, handleError]);

  // Action handlers
  const handleNewMaterial = useCallback(() => {
    openModal('add');
  }, [openModal]);

  const handleABCAnalysis = useCallback(() => {
    setPageState(prev => ({
      ...prev,
      showABCAnalysis: !prev.showABCAnalysis,
      showProcurement: false,
      showSupplyChain: false,
      showPredictiveAnalytics: false
    }));
  }, []);

  const handleProcurement = useCallback(() => {
    setPageState(prev => ({
      ...prev,
      showProcurement: !prev.showProcurement,
      showABCAnalysis: false,
      showSupplyChain: false,
      showPredictiveAnalytics: false
    }));
  }, []);

  const handleSupplyChain = useCallback(() => {
    setPageState(prev => ({
      ...prev,
      showSupplyChain: !prev.showSupplyChain,
      showABCAnalysis: false,
      showProcurement: false,
      showPredictiveAnalytics: false
    }));
  }, []);

  const handlePredictiveAnalytics = useCallback(() => {
    setPageState(prev => ({
      ...prev,
      showPredictiveAnalytics: !prev.showPredictiveAnalytics,
      showABCAnalysis: false,
      showProcurement: false,
      showSupplyChain: false
    }));
  }, []);

  const handleStockAlert = useCallback(() => {
    // Filter to show only items with stock alerts
    const alertItems = StockCalculation.getCriticalStockItems(items);
    console.log('Stock alert items:', alertItems);
    // Could open a modal or filter the view
  }, [items]);

  const handleBulkActions = useCallback(() => {
    // Open bulk actions modal or enable bulk selection mode
    console.log('Bulk actions activated');
  }, []);

  // Toggle handlers
  const toggleABCAnalysis = useCallback(() => {
    setPageState(prev => ({ ...prev, showABCAnalysis: !prev.showABCAnalysis }));
  }, []);

  const toggleProcurement = useCallback(() => {
    setPageState(prev => ({ ...prev, showProcurement: !prev.showProcurement }));
  }, []);

  const toggleSupplyChain = useCallback(() => {
    setPageState(prev => ({ ...prev, showSupplyChain: !prev.showSupplyChain }));
  }, []);

  // State setters
  const setViewMode = useCallback((mode: 'grid' | 'table' | 'cards') => {
    setPageState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setPageState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  // Quick filters using business logic
  const getLowStockItems = useCallback(() => {
    return StockCalculation.getLowStockItems(items);
  }, [items]);

  const getCriticalStockItems = useCallback(() => {
    return StockCalculation.getCriticalStockItems(items);
  }, [items]);

  const getOutOfStockItems = useCallback(() => {
    return StockCalculation.getOutOfStockItems(items);
  }, [items]);

  const getFilteredItems = useCallback(() => {
    let filteredItems = items;

    // Filter by selected category
    if (pageState.selectedCategory) {
      filteredItems = filteredItems.filter(item =>
        item.category === pageState.selectedCategory
      );
    }

    return filteredItems;
  }, [items, pageState.selectedCategory]);

  // Initialize data loading
  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  // Actions object
  const actions: MaterialsPageActions = {
    handleNewMaterial,
    handleABCAnalysis,
    handleProcurement,
    handleSupplyChain,
    handlePredictiveAnalytics,
    handleStockAlert,
    handleBulkActions,
    toggleABCAnalysis,
    toggleProcurement,
    toggleSupplyChain,
    setViewMode,
    setSelectedCategory
  };

  return {
    pageState,
    items,
    metrics,
    loading,
    error,
    actions,
    loadInventoryData,
    getFilteredItems,
    getLowStockItems,
    getCriticalStockItems,
    getOutOfStockItems
  };
};