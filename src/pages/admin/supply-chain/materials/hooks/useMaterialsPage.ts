import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext'; // 🆕 MULTI-LOCATION
import { useMaterials } from '@/store/materialsStore';
import { inventoryApi } from '../services/inventoryApi';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import { ABCAnalysisEngine } from '../services/abcAnalysisEngine';
import { TrendsService } from '../services/trendsService'; // ✅ Phase 3: Historical trends
// ✅ SISTEMAS INTEGRATION
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { MaterialItem, ItemFormData } from '../types';
// Enhanced functionality imports
// NOTE: Removed unused imports (useDataFetcher, useDataSearch, useModuleAnalytics, AnalyticsEngine, handleAsyncOperation, CRUDHandlers)
import eventBus from '@/lib/events';

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
  handleAddMaterial: (materialData: ItemFormData) => Promise<void>;

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
  // Trends (✅ Phase 3: Calculated from TrendsService)
  valueGrowth: number;
  stockTurnover: number;
  avgTurnoverRate: number;
  fastMovingItems: string[];
  slowMovingItems: string[];
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
  analytics: Record<string, unknown>;
  analyticsLoading: boolean;
  formatMetric: (value: string | number, format: string) => string;
  createMaterial: (data: ItemFormData) => Promise<MaterialItem>;
  updateMaterial: (id: string, data: Partial<ItemFormData>) => Promise<MaterialItem>;
  deleteMaterial: (id: string, name: string) => Promise<void>;
  adjustStock: (id: string, adjustment: number, reason?: string) => Promise<MaterialItem>;
  alerts: Array<{ id: string; type: string; message: string }>;
  refresh: () => Promise<void>;
  inventory: Record<string, unknown>;

  // ✅ Phase 3: Historical trends
  systemTrends: Record<string, unknown>;
  trendsLoading: boolean;
  loadSystemTrends: () => Promise<void>;
}

export const useMaterialsPage = (): UseMaterialsPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigationActions();

  // ✅ SISTEMAS INTEGRATION
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { selectedLocation, isMultiLocationMode } = useLocation(); // 🆕 MULTI-LOCATION

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

  // ✅ Phase 3: Historical trends state
  const [systemTrends, setSystemTrends] = useState<Record<string, unknown> | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);

  // ✅ CALCULATE METRICS USING BUSINESS LOGIC SERVICES
  const metrics: MaterialsPageMetrics = useMemo(() => {
    // Run ABC Analysis
    const abcAnalysis = ABCAnalysisEngine.analyzeInventory(items);

    // Calculate class values using correct structure (classA, classB, classC)
    const classAValue = abcAnalysis.classA?.reduce(
      (sum, material) => sum + (material.totalValue || 0),
      0
    ) || 0;

    const classBValue = abcAnalysis.classB?.reduce(
      (sum, material) => sum + (material.totalValue || 0),
      0
    ) || 0;

    const classCValue = abcAnalysis.classC?.reduce(
      (sum, material) => sum + (material.totalValue || 0),
      0
    ) || 0;

    return {
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
      // ✅ ABC Analysis (calculated from ABCAnalysisEngine)
      classAValue,
      classBValue,
      classCValue,
      // ✅ Phase 3: Trends (calculated from TrendsService)
      valueGrowth: systemTrends?.valueGrowth || 0,
      stockTurnover: systemTrends?.avgTurnoverRate || 0,
      avgTurnoverRate: systemTrends?.avgTurnoverRate || 0,
      fastMovingItems: systemTrends?.fastMovingItems || [],
      slowMovingItems: systemTrends?.slowMovingItems || []
    };
  }, [items, systemTrends]);

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

  // ✅ Phase 3: Load system trends
  const loadSystemTrends = useCallback(async () => {
    try {
      setTrendsLoading(true);
      const trends = await TrendsService.calculateSystemTrends();
      setSystemTrends(trends);
    } catch (error) {
      logger.error('MaterialsStore', 'Error loading system trends:', error);
      // Don't show error to user - trends are non-critical
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  // ✅ LOAD INVENTORY DATA (with multi-location support)
  const loadInventoryData = useCallback(async () => {
    try {
      setLocalError(null); // Clear any previous errors
      setItems([]);

      // 🆕 MULTI-LOCATION: Pass location_id to API if in multi-location mode
      const locationId = isMultiLocationMode && selectedLocation?.id
        ? selectedLocation.id
        : undefined;

      const apiItems = await inventoryApi.getItems(locationId);

      // For now, use items directly from API (they're already in the correct format)
      setItems(apiItems);

      if (refreshStats) {
        refreshStats();
      }

      // ✅ Phase 3: Load trends after materials are loaded
      loadSystemTrends();
    } catch (error) {
      logger.error('MaterialsStore', 'Error loading inventory data:', error);
      setLocalError('Error al cargar datos de inventario');
      handleError(error as Error, { operation: 'loadInventory' });
    }
  }, [setItems, refreshStats, handleError, isMultiLocationMode, selectedLocation?.id, loadSystemTrends]);

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

        // Find the item to get details
        const currentItems = getFilteredItems();
        const item = currentItems.find(i => i.id === itemId);

        // Update item directly in store (optimistic update)
        const updatedItems = currentItems.map(item =>
          item.id === itemId ? { ...item, stock: newStock, lastUpdated: new Date() } : item
        );
        setItems(updatedItems);

        // Refresh stats
        if (refreshStats) {
          refreshStats();
        }

        // ✅ EMIT EVENTBUS: Stock updated
        if (item) {
          eventBus.emit('materials.stock_updated', {
            itemId,
            itemName: item.name,
            previousStock: item.stock,
            newStock,
            timestamp: new Date().toISOString()
          });

          // Check if stock is now low or critical
          const stockStatus = StockCalculation.getStockStatus(
            newStock,
            item.minStock || 0,
            item.maxStock
          );

          if (stockStatus === 'critical' || stockStatus === 'low') {
            eventBus.emit('materials.low_stock_alert', {
              itemId,
              itemName: item.name,
              currentStock: newStock,
              minStock: item.minStock || 0,
              status: stockStatus,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        // On error, reload data to ensure consistency
        await loadInventoryData();
        handleError(error as Error, { operation: 'updateStock', itemId });
        throw error;
      }
    }, [getFilteredItems, setItems, refreshStats, loadInventoryData, handleError]),

    // Material management
    handleOpenAddModal: useCallback(() => {
      openModal('add');
    }, [openModal]),

    handleAddMaterial: useCallback(async (materialData: ItemFormData) => {
      try {
        const newMaterial = await inventoryApi.createMaterial(materialData);
        await loadInventoryData();

        // ✅ EMIT EVENTBUS: Material created
        eventBus.emit('materials.material_created', {
          materialId: newMaterial?.id || 'new',
          materialName: materialData.name,
          category: materialData.category,
          initialStock: materialData.stock || 0,
          timestamp: new Date().toISOString()
        });
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
    handleAlertAction: useCallback(async (alertId: string) => {
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
      // const alertItems = StockCalculation.getCriticalStockItems(items);
      // TODO: Open modal or filter view for critical items
    }, []),

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

  // ✅ ENHANCED FUNCTIONALITY (from useMaterialsEnhanced)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');

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
  // Search loading state (always false for sync filtering)
  const searchLoading = false;


  // Analytics functionality
  const analyticsLoading = false;
  const analyticsData: Record<string, unknown> = {};

  const formatMetric = useCallback((value: string | number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(Number(value));
      case 'number':
        return new Intl.NumberFormat('es-ES').format(Number(value));
      default:
        return String(value);
    }
  }, []);

  // Enhanced CRUD operations
  const createMaterial = useCallback(async (materialData: ItemFormData) => {
    try {
      const result = await inventoryApi.createMaterial(materialData);
      await loadInventoryData();
      return result;
    } catch (error) {
      handleError(error as Error, { operation: 'createMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError]);

  const updateMaterial = useCallback(async (id: string, materialData: Partial<ItemFormData>) => {
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
    },

    // ✅ Phase 3: Historical trends
    systemTrends,
    trendsLoading,
    loadSystemTrends
  };
};