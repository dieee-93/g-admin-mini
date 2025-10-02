import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMaterials } from '@/store/materialsStore';
import { inventoryApi } from '../services/inventoryApi';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import { ABCAnalysisEngine } from '../services/abcAnalysisEngine';
// ✅ SISTEMAS INTEGRATION
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { MaterialItem } from '../types';
// Enhanced functionality imports
import { useDataFetcher, useDataSearch, useModuleAnalytics } from '@/shared/hooks/business';
import { AnalyticsEngine } from '@/shared/services/AnalyticsEngine';
import { handleAsyncOperation, CRUDHandlers } from '@/shared/utils/errorHandling';

import { logger } from '@/lib/logging';
export interface MaterialsPageState {
  activeTab: 'inventory' | 'analytics' | 'procurement';
  selectedFilters: FilterState;
  viewMode: 'grid' | 'table' | 'cards';
  bulkMode: boolean;
  selectedItems: string[];
  showABCAnalysis: boolean;
  showProcurement: boolean;
  showSupplyChain: boolean;
  showPredictiveAnalytics: boolean;
  selectedCategory: string | null;
}

export interface FilterState {
  stockStatus?: 'low' | 'critical' | 'healthy';
  category?: string;
  supplier?: string;
  abcClass?: 'A' | 'B' | 'C';
}

export interface MaterialsPageActions {
  // Metric interactions
  handleMetricClick: (metricType: string) => void;

  // Stock operations
  handleStockUpdate: (itemId: string, newStock: number) => Promise<void>;

  // Material management
  handleOpenAddModal: () => void;
  handleAddMaterial: (materialData: any) => Promise<void>;

  // Bulk operations
  handleBulkOperations: () => void;
  handleBulkAction: (action: string, itemIds: string[]) => Promise<void>;

  // Reports and sync
  handleGenerateReport: () => Promise<void>;
  handleSyncInventory: () => Promise<void>;

  // Alert handling
  handleAlertAction: (alertId: string, action: string) => Promise<void>;

  // Legacy actions (for backward compatibility)
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
  totalValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  outOfStockItems: number;
  supplierCount: number;
  lastUpdate: Date;
  // ABC Analysis
  classAValue: number;
  classBValue: number;
  classCValue: number;
  // Trends
  valueGrowth: number;
  stockTurnover: number;
}

export interface UseMaterialsPageReturn {
  // State
  pageState: MaterialsPageState;
  metrics: MaterialsPageMetrics;
  loading: boolean;
  error: string | null;

  // Tab management
  activeTab: MaterialsPageState['activeTab'];
  setActiveTab: (tab: MaterialsPageState['activeTab']) => void;

  // Actions
  actions: MaterialsPageActions;

  // Performance awareness
  shouldReduceAnimations: boolean;
  isOnline: boolean;

  // Data operations (legacy)
  items: MaterialItem[];
  loadInventoryData: () => Promise<void>;
  getFilteredItems: () => MaterialItem[];
  getLowStockItems: () => MaterialItem[];
  getCriticalStockItems: () => MaterialItem[];
  getOutOfStockItems: () => MaterialItem[];

  // Enhanced functionality (from useMaterialsEnhanced)
  materials: MaterialItem[];
  search: (query: string) => void;
  searchResults: MaterialItem[];
  searchLoading: boolean;
  searchQuery: string;
  clearSearch: () => void;
  analytics: any;
  analyticsLoading: boolean;
  formatMetric: (value: any, format: string) => string;
  createMaterial: (data: any) => Promise<any>;
  updateMaterial: (id: string, data: any) => Promise<any>;
  deleteMaterial: (id: string, name: string) => Promise<any>;
  adjustStock: (id: string, adjustment: number, reason?: string) => Promise<any>;
  alerts: any[];
  refresh: () => Promise<void>;
  inventory: any;
}

export const useMaterialsPage = (): UseMaterialsPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();

  // ✅ SISTEMAS INTEGRATION
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();

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

  // ✅ PAGE STATE
  const [pageState, setPageState] = useState<MaterialsPageState>({
    activeTab: 'inventory',
    selectedFilters: {},
    viewMode: 'table',
    bulkMode: false,
    selectedItems: [],
    showABCAnalysis: false,
    showProcurement: false,
    showSupplyChain: false,
    showPredictiveAnalytics: false,
    selectedCategory: null
  });

  const [localError, setLocalError] = useState<string | null>(null);

  // ✅ CALCULATE METRICS USING BUSINESS LOGIC SERVICES
  const metrics: MaterialsPageMetrics = {
    totalItems: items.length,
    totalValue: DecimalUtils.toNumber(items.reduce((sum, item) =>
      DecimalUtils.add(sum, StockCalculation.getTotalValue(item), 'financial'),
      DecimalUtils.fromValue(0, 'financial')
    )),
    lowStockItems: StockCalculation.getLowStockItems(items).length,
    criticalStockItems: StockCalculation.getCriticalStockItems(items).length,
    outOfStockItems: StockCalculation.getOutOfStockItems(items).length,
    supplierCount: new Set(items.map(item => item.supplier_id).filter(Boolean)).size,
    lastUpdate: new Date(),
    // ABC Analysis
    classAValue: 0, // TODO: Calculate from ABCAnalysisEngine
    classBValue: 0,
    classCValue: 0,
    // Trends
    valueGrowth: 5.2, // TODO: Calculate from historical data
    stockTurnover: 12.5
  };

  // Setup quick actions in navigation
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-material',
        label: 'Nuevo Material',
        icon: PlusIcon,
        action: () => openModal('add'),
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
  }, [setQuickActions, openModal]);

  // Update navigation badge with critical items count
  useEffect(() => {
    if (updateModuleBadge) {
      const criticalCount = metrics.criticalStockItems;
      updateModuleBadge('materials', criticalCount > 0 ? criticalCount : items.length);
    }
  }, [items.length, metrics.criticalStockItems, updateModuleBadge]);

  // ✅ TAB MANAGEMENT
  const setActiveTab = useCallback((tab: MaterialsPageState['activeTab']) => {
    setPageState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // ✅ LOAD INVENTORY DATA (Simplified for mock data)
  const loadInventoryData = useCallback(async () => {
    try {
      setLocalError(null); // Clear any previous errors
      setItems([]);

      // Direct call to API (will use mock data)
      const apiItems = await inventoryApi.getItems();

      // For now, use items directly from mock service (they're already in the correct format)
      setItems(apiItems);

      if (refreshStats) {
        refreshStats();
      }
    } catch (error) {
      logger.error('MaterialsStore', 'Error loading inventory data:', error);
      setLocalError('Error al cargar datos de inventario');
      handleError(error as Error, { operation: 'loadInventory' });
    }
  }, [setItems, refreshStats, handleError]);

  // ✅ BUSINESS ACTIONS
  const actions = {
    // Metric interactions
    handleMetricClick: useCallback((metricType: string) => {
      switch (metricType) {
        case 'lowStock':
          setPageState(prev => ({
            ...prev,
            activeTab: 'inventory',
            selectedFilters: { stockStatus: 'low' }
          }));
          break;
        case 'critical':
          setPageState(prev => ({
            ...prev,
            activeTab: 'inventory',
            selectedFilters: { stockStatus: 'critical' }
          }));
          break;
        case 'abc':
          setPageState(prev => ({ ...prev, activeTab: 'analytics' }));
          break;
      }
    }, []),

    // Stock operations
    handleStockUpdate: useCallback(async (itemId: string, newStock: number) => {
      try {
        await inventoryApi.updateStock(itemId, newStock);
        // Refresh data after successful update
        await loadInventoryData();
      } catch (error) {
        handleError(error as Error, { operation: 'updateStock', itemId });
      }
    }, [loadInventoryData, handleError]),

    // Material management
    handleOpenAddModal: useCallback(() => {
      openModal('add');
    }, [openModal]),

    handleAddMaterial: useCallback(async (materialData: any) => {
      try {
        await inventoryApi.createMaterial(materialData);
        await loadInventoryData();
      } catch (error) {
        handleError(error as Error, { operation: 'addMaterial' });
      }
    }, [loadInventoryData, handleError]),

    // Bulk operations
    handleBulkOperations: useCallback(() => {
      setPageState(prev => ({ ...prev, bulkMode: !prev.bulkMode }));
    }, []),

    handleBulkAction: useCallback(async (action: string, itemIds: string[]) => {
      try {
        await inventoryApi.bulkAction(action, itemIds);
        await loadInventoryData();
        setPageState(prev => ({
          ...prev,
          bulkMode: false,
          selectedItems: []
        }));
      } catch (error) {
        handleError(error as Error, { operation: 'bulkAction', action });
      }
    }, [loadInventoryData, handleError]),

    // Reports and sync
    handleGenerateReport: useCallback(async () => {
      try {
        await inventoryApi.generateReport();
      } catch (error) {
        handleError(error as Error, { operation: 'generateReport' });
      }
    }, [handleError]),

    handleSyncInventory: useCallback(async () => {
      try {
        await loadInventoryData();
      } catch (error) {
        handleError(error as Error, { operation: 'syncInventory' });
      }
    }, [loadInventoryData, handleError]),

    // Alert handling
    handleAlertAction: useCallback(async (alertId: string, action: string) => {
      try {
        // Handle smart alert actions
        // TODO: Implement smart alert actions
      } catch (error) {
        handleError(error as Error, { operation: 'alertAction', alertId });
      }
    }, [handleError]),

    // Legacy actions (for backward compatibility)
    handleNewMaterial: useCallback(() => {
      openModal('add');
    }, [openModal]),

    handleABCAnalysis: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        showABCAnalysis: !prev.showABCAnalysis,
        showProcurement: false,
        showSupplyChain: false,
        showPredictiveAnalytics: false
      }));
    }, []),

    handleProcurement: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        showProcurement: !prev.showProcurement,
        showABCAnalysis: false,
        showSupplyChain: false,
        showPredictiveAnalytics: false
      }));
    }, []),

    handleSupplyChain: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        showSupplyChain: !prev.showSupplyChain,
        showABCAnalysis: false,
        showProcurement: false,
        showPredictiveAnalytics: false
      }));
    }, []),

    handlePredictiveAnalytics: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        showPredictiveAnalytics: !prev.showPredictiveAnalytics,
        showABCAnalysis: false,
        showProcurement: false,
        showSupplyChain: false
      }));
    }, []),

    handleStockAlert: useCallback(() => {
      // Filter to show only items with stock alerts
      const alertItems = StockCalculation.getCriticalStockItems(items);
      // TODO: Open modal or filter view for critical items
    }, [items]),

    handleBulkActions: useCallback(() => {
      setPageState(prev => ({ ...prev, bulkMode: !prev.bulkMode }));
    }, []),

    // State setters
    setViewMode: useCallback((mode: 'grid' | 'table' | 'cards') => {
      setPageState(prev => ({ ...prev, viewMode: mode }));
    }, []),

    setSelectedCategory: useCallback((category: string | null) => {
      setPageState(prev => ({ ...prev, selectedCategory: category }));
    }, [])
  };


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

  const getLocalFilteredItems = useCallback(() => {
    let filteredItems = items;

    // Filter by selected category
    if (pageState.selectedCategory) {
      filteredItems = filteredItems.filter(item =>
        item.category === pageState.selectedCategory
      );
    }

    return filteredItems;
  }, [items, pageState.selectedCategory]);

  // ✅ ENHANCED FUNCTIONALITY (from useMaterialsEnhanced)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.supplier?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Analytics functionality
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>({});

  const formatMetric = useCallback((value: any, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('es-ES').format(value);
      default:
        return String(value);
    }
  }, []);

  // Enhanced CRUD operations
  const createMaterial = useCallback(async (materialData: any) => {
    try {
      const result = await inventoryApi.createMaterial(materialData);
      await loadInventoryData();
      return result;
    } catch (error) {
      handleError(error as Error, { operation: 'createMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError]);

  const updateMaterial = useCallback(async (id: string, materialData: any) => {
    try {
      const result = await inventoryApi.updateMaterial(id, materialData);
      await loadInventoryData();
      return result;
    } catch (error) {
      handleError(error as Error, { operation: 'updateMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError]);

  const deleteMaterial = useCallback(async (id: string, materialName: string) => {
    try {
      const confirmed = window.confirm(`¿Estás seguro de eliminar el material "${materialName}"?`);
      if (!confirmed) return;

      await inventoryApi.deleteMaterial(id);
      await loadInventoryData();
    } catch (error) {
      handleError(error as Error, { operation: 'deleteMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError]);

  const adjustStock = useCallback(async (id: string, adjustment: number, reason?: string) => {
    try {
      const result = await inventoryApi.adjustStock(id, adjustment, reason);
      await loadInventoryData();
      return result;
    } catch (error) {
      handleError(error as Error, { operation: 'adjustStock' });
      throw error;
    }
  }, [loadInventoryData, handleError]);

  // Enhanced alerts
  const alerts = useMemo(() => {
    const alertList = [];

    // Critical stock alerts
    const criticalItems = getCriticalStockItems();
    if (criticalItems.length > 0) {
      alertList.push({
        type: 'critical',
        title: `${criticalItems.length} materiales con stock crítico`,
        description: 'Requieren reposición inmediata',
        items: criticalItems
      });
    }

    // Low stock warnings
    const lowStockItems = getLowStockItems();
    if (lowStockItems.length > 0) {
      alertList.push({
        type: 'warning',
        title: `${lowStockItems.length} materiales con stock bajo`,
        description: 'Considera reponer pronto',
        items: lowStockItems
      });
    }

    // High value items tracking
    const highValueItems = items.filter(item =>
      (item.stock || 0) * (item.unit_cost || 0) > 10000
    );
    if (highValueItems.length > 0) {
      alertList.push({
        type: 'info',
        title: `${highValueItems.length} materiales de alto valor`,
        description: 'Monitorear de cerca',
        items: highValueItems
      });
    }

    return alertList;
  }, [items, getCriticalStockItems, getLowStockItems]);

  const refresh = useCallback(async () => {
    await loadInventoryData();
  }, [loadInventoryData]);

  // ✅ INITIALIZATION - Load data when component mounts
  useEffect(() => {
    // Always load data regardless of capabilities for development
    loadInventoryData();
  }, [loadInventoryData]);

  return {
    // State
    pageState,
    metrics,
    loading,
    error: error || localError,

    // Tab management
    activeTab: pageState.activeTab,
    setActiveTab,

    // Actions
    actions,

    // Performance awareness
    shouldReduceAnimations,
    isOnline,

    // Data operations (legacy)
    items,
    loadInventoryData,
    getFilteredItems,
    getLowStockItems,
    getCriticalStockItems,
    getOutOfStockItems,

    // Enhanced functionality (from useMaterialsEnhanced)
    materials: items, // Alias for compatibility
    search,
    searchResults,
    searchLoading,
    searchQuery,
    clearSearch,
    analytics: analyticsData,
    analyticsLoading,
    formatMetric,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    adjustStock,
    alerts,
    refresh,
    inventory: {
      getFilteredItems,
      loading,
      error
    }
  };
};