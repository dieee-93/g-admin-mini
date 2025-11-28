import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useShallow } from 'zustand/react/shallow';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext'; // 🆕 MULTI-LOCATION
import { useAuth } from '@/contexts/AuthContext';
import { useMaterialsStore } from '@/store/materialsStore';
import { useMaterialsData } from './useMaterialsData';
import { useMaterialsActions } from './useMaterialsActions';
import { useMaterialsComputed } from './useMaterialsComputed';
import { inventoryApi } from '@/pages/admin/supply-chain/materials/services/inventoryApi';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import { ABCAnalysisEngine } from '@/pages/admin/supply-chain/materials/services/abcAnalysisEngine';
import { TrendsService } from '@/pages/admin/supply-chain/materials/services/trendsService'; // ✅ Phase 3: Historical trends
// ✅ SISTEMAS INTEGRATION
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { MaterialItem, ItemFormData } from '@/pages/admin/supply-chain/materials/types';
// Enhanced functionality imports
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
  alerts: Array<{ type: string; title: string; description: string; items: MaterialItem[] }>;
  refresh: () => Promise<void>;
  inventory: Record<string, unknown>;

  // ✅ Phase 3: Historical trends
  systemTrends: Record<string, unknown>;
  trendsLoading: boolean;
  loadSystemTrends: () => Promise<void>;
}

export const useMaterialsPage = (): UseMaterialsPageReturn => {
  const { user } = useAuth();
  const { setQuickActions, updateModuleBadge } = useNavigationActions();

  // ✅ SISTEMAS INTEGRATION
  const { handleError } = useErrorHandler();

  const { selectedLocation, isMultiLocationMode } = useLocation(); // 🆕 MULTI-LOCATION

  // ✅ SPLIT HOOKS PATTERN - Selective subscriptions (GAP 8 FIX)
  const items = useMaterialsStore(useShallow(s => s.items));
  const loading = useMaterialsStore(s => s.loading);
  const error = useMaterialsStore(s => s.error);
  // Actions are ALWAYS stable from Zustand
  const setItems = useMaterialsStore(s => s.setItems);
  const refreshStats = useMaterialsStore(s => s.refreshStats);
  const getFilteredItems = useMaterialsStore(s => s.getFilteredItems);
  const getLowStockItems = useMaterialsStore(s => s.getLowStockItems);
  const getCriticalStockItems = useMaterialsStore(s => s.getCriticalStockItems);


  const openModal = useMaterialsStore(s => s.openModal);
  const closeModal = useMaterialsStore(s => s.closeModal);
  const isModalOpen = useMaterialsStore(s => s.isModalOpen);

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

  // ✅ Phase 3: Historical trends state
  const [systemTrends, setSystemTrends] = useState<Record<string, unknown> | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);

  // 🛠️ PERFORMANCE: Cache ABC Analysis results to avoid expensive recalculations
  const [abcAnalysisCache, setAbcAnalysisCache] = useState<{
    itemsKey: string;
    result: ReturnType<typeof ABCAnalysisEngine.analyzeInventory>;
  } | null>(null);

  // 🛠️ PERFORMANCE: Memoize ABC Analysis with caching
  const abcAnalysis = useMemo(() => {
    const itemsKey = JSON.stringify(items.map(i => ({ id: i.id, totalValue: i.stock * (i.unit_cost || 0) })));

    // Return cached result if items haven't changed
    if (abcAnalysisCache && abcAnalysisCache.itemsKey === itemsKey) {
      return abcAnalysisCache.result;
    }

    // Run expensive analysis only when items change
    const result = ABCAnalysisEngine.analyzeInventory(items);
    setAbcAnalysisCache({ itemsKey, result });
    return result;
  }, [items, abcAnalysisCache]);

  // ✅ METRICS CALCULATION
  const metrics = useMemo(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.stock * item.unit_cost), 0);
    const lowStock = StockCalculation.getLowStockItems(items).length;
    const criticalStock = StockCalculation.getCriticalStockItems(items).length;
    const outOfStock = StockCalculation.getOutOfStockItems(items).length;

    // Calculate ABC values
    const classAValue = abcAnalysis.classA.reduce((sum, item) => sum + (item.value || 0), 0);
    const classBValue = abcAnalysis.classB.reduce((sum, item) => sum + (item.value || 0), 0);
    const classCValue = abcAnalysis.classC.reduce((sum, item) => sum + (item.value || 0), 0);

    return {
      totalItems: items.length,
      totalValue,
      lowStockItems: lowStock,
      criticalStockItems: criticalStock,
      outOfStockItems: outOfStock,
      supplierCount: new Set(items.map(i => i.supplier_id).filter(Boolean)).size,
      lastUpdate: new Date(),
      classAValue,
      classBValue,
      classCValue,
      valueGrowth: (systemTrends?.valueGrowth as number) || 0,
      stockTurnover: (systemTrends?.stockTurnover as number) || 0,
      avgTurnoverRate: (systemTrends?.avgTurnoverRate as number) || 0,
      fastMovingItems: (systemTrends?.fastMovingItems as string[]) || [],
      slowMovingItems: (systemTrends?.slowMovingItems as string[]) || []
    };
  }, [items, abcAnalysis, systemTrends]);

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
      // Use store actions directly - they're stable
      const { setItems: setItemsStore, refreshStats: refreshStatsStore } = useMaterialsStore.getState();

      setItemsStore([]);

      // 🆕 MULTI-LOCATION: Pass location_id to API if in multi-location mode
      const locationId = isMultiLocationMode && selectedLocation?.id
        ? selectedLocation.id
        : undefined;

      const apiItems = await inventoryApi.getItems(locationId, user);

      // For now, use items directly from API (they're already in the correct format)
      setItemsStore(apiItems);
      refreshStatsStore();

      // ✅ OPTIMIZED: Load trends using materialized view
      loadSystemTrends();
    } catch (error) {
      logger.error('MaterialsStore', 'Error loading inventory data:', error);
      const { setError } = useMaterialsStore.getState();
      setError('Error al cargar datos de inventario');
      handleError(error as Error, { operation: 'loadInventory' });
    }
  }, [handleError, isMultiLocationMode, selectedLocation?.id, loadSystemTrends, user]);

  // ✅ BUSINESS ACTIONS
  const actions = useMemo(() => ({
    // Metric interactions
    handleMetricClick: (metricType: string) => {
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
    },

    // Stock operations
    handleStockUpdate: async (itemId: string, newStock: number) => {
      try {
        if (!user) throw new Error('Usuario no autenticado');

        const { items: currentItems, setItems: setItemsStore, refreshStats: refreshStatsStore } = useMaterialsStore.getState();
        const item = currentItems.find(i => i.id === itemId);

        const oldStock = item?.stock || 0;

        await inventoryApi.updateStock(itemId, newStock, user, oldStock);

        // Update item directly in store (optimistic update)
        const updatedItems = currentItems.map(item =>
          item.id === itemId ? { ...item, stock: newStock, lastUpdated: new Date() } : item
        );
        setItemsStore(updatedItems);

        // Refresh stats
        refreshStatsStore();

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
            item.min_stock || 0
          );

          if (stockStatus === 'critical' || stockStatus === 'low') {
            eventBus.emit('materials.low_stock_alert', {
              itemId,
              itemName: item.name,
              currentStock: newStock,
              minStock: item.min_stock || 0,
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
    },

    // Material management
    handleOpenAddModal: () => {
      openModal('add');
    },

    handleAddMaterial: async (materialData: ItemFormData) => {
      try {
        if (!user) throw new Error('Usuario no autenticado');
        const newMaterial = await inventoryApi.createMaterial(materialData, user);
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
    },

    // Bulk operations
    handleBulkOperations: () => {
      setPageState(prev => ({ ...prev, bulkMode: !prev.bulkMode }));
    },

    handleBulkAction: async (action: string, itemIds: string[]) => {
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
    },

    // Reports and sync
    handleGenerateReport: async () => {
      try {
        await inventoryApi.generateReport();
      } catch (error) {
        handleError(error as Error, { operation: 'generateReport' });
      }
    },

    handleSyncInventory: async () => {
      try {
        await loadInventoryData();
      } catch (error) {
        handleError(error as Error, { operation: 'syncInventory' });
      }
    },

    // Alert handling
    handleAlertAction: async (alertId: string, action: string) => {
      try {
        // Handle smart alert actions
        // TODO: Implement smart alert actions
      } catch (error) {
        handleError(error as Error, { operation: 'alertAction', alertId });
      }
    },

    // Legacy actions (for backward compatibility)
    handleNewMaterial: () => {
      openModal('add');
    },

    handleABCAnalysis: () => {
      setPageState(prev => ({
        ...prev,
        showABCAnalysis: !prev.showABCAnalysis,
        showProcurement: false,
        showSupplyChain: false,
        showPredictiveAnalytics: false
      }));
    },

    toggleABCAnalysis: () => {
      setPageState(prev => ({
        ...prev,
        showABCAnalysis: !prev.showABCAnalysis,
        showProcurement: false,
        showSupplyChain: false,
        showPredictiveAnalytics: false
      }));
    },

    handleProcurement: () => {
      setPageState(prev => ({
        ...prev,
        showProcurement: !prev.showProcurement,
        showABCAnalysis: false,
        showSupplyChain: false,
        showPredictiveAnalytics: false
      }));
    },

    toggleProcurement: () => {
      setPageState(prev => ({
        ...prev,
        showProcurement: !prev.showProcurement,
        showABCAnalysis: false,
        showSupplyChain: false,
        showPredictiveAnalytics: false
      }));
    },

    handleSupplyChain: () => {
      setPageState(prev => ({
        ...prev,
        showSupplyChain: !prev.showSupplyChain,
        showABCAnalysis: false,
        showProcurement: false,
        showPredictiveAnalytics: false
      }));
    },

    toggleSupplyChain: () => {
      setPageState(prev => ({
        ...prev,
        showSupplyChain: !prev.showSupplyChain,
        showABCAnalysis: false,
        showProcurement: false,
        showPredictiveAnalytics: false
      }));
    },

    handlePredictiveAnalytics: () => {
      setPageState(prev => ({
        ...prev,
        showPredictiveAnalytics: !prev.showPredictiveAnalytics,
        showABCAnalysis: false,
        showProcurement: false,
        showSupplyChain: false
      }));
    },

    handleStockAlert: () => {
      // Filter to show only items with stock alerts
    },

    handleBulkActions: () => {
      setPageState(prev => ({ ...prev, bulkMode: !prev.bulkMode }));
    },

    // State setters
    setViewMode: (mode: 'grid' | 'table' | 'cards') => {
      setPageState(prev => ({ ...prev, viewMode: mode }));
    },

    setSelectedCategory: (category: string | null) => {
      setPageState(prev => ({ ...prev, selectedCategory: category }));
    }
  }), [loadInventoryData, handleError, user]);

  // Quick actions handlers for the menu
  const handleNewMaterial = useCallback(() => actions.handleNewMaterial(), [actions]);
  const handleABCAnalysisClick = useCallback(() => actions.handleABCAnalysis(), [actions]);
  const handleProcurementClick = useCallback(() => actions.handleProcurement(), [actions]);
  const handleSupplyChainClick = useCallback(() => actions.handleSupplyChain(), [actions]);
  const handleStockAlertClick = useCallback(() => actions.handleStockAlert(), [actions]);

  // 🛠️ PERFORMANCE: Memoize quick actions array to prevent recreation
  const quickActions = useMemo(() => [
    {
      id: 'new-material',
      label: 'Nuevo Material',
      icon: PlusIcon,
      action: handleNewMaterial,
      color: 'purple'
    },
    {
      id: 'abc-analysis',
      label: 'Análisis ABC',
      icon: ChartBarIcon,
      action: handleABCAnalysisClick,
      color: 'blue'
    },
    {
      id: 'procurement',
      label: 'Compras',
      icon: ClipboardDocumentListIcon,
      action: handleProcurementClick,
      color: 'green'
    },
    {
      id: 'supply-chain',
      label: 'Cadena Supply',
      icon: BuildingStorefrontIcon,
      action: handleSupplyChainClick,
      color: 'orange'
    },
    {
      id: 'stock-alerts',
      label: 'Alertas Stock',
      icon: ExclamationTriangleIcon,
      action: handleStockAlertClick,
      color: 'red'
    }
  ], [handleNewMaterial, handleABCAnalysisClick, handleProcurementClick, handleSupplyChainClick, handleStockAlertClick]);

  // Setup quick actions in navigation
  useEffect(() => {
    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions, quickActions]);

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

  // Quick filters using business logic
  const getLowStockItemsFn = useCallback(() => {
    const { items: currentItems } = useMaterialsStore.getState();
    return StockCalculation.getLowStockItems(currentItems);
  }, []);

  const getCriticalStockItemsFn = useCallback(() => {
    const { items: currentItems } = useMaterialsStore.getState();
    return StockCalculation.getCriticalStockItems(currentItems);
  }, []);

  const getOutOfStockItems = useCallback(() => {
    const { items: currentItems } = useMaterialsStore.getState();
    return StockCalculation.getOutOfStockItems(currentItems);
  }, []);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
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
      if (!user) throw new Error('Usuario no autenticado');
      const result = await inventoryApi.createMaterial(materialData, user);
      await loadInventoryData();
      return result;
    } catch (error) {
      handleError(error as Error, { operation: 'createMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError, user]);

  const updateMaterial = useCallback(async (id: string, materialData: Partial<ItemFormData>) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      // inventoryApi.updateItem expects Partial<InventoryItem>
      const result = await inventoryApi.updateItem(id, materialData as any, user);
      await loadInventoryData();
      return result as MaterialItem;
    } catch (error) {
      handleError(error as Error, { operation: 'updateMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError, user]);

  const deleteMaterial = useCallback(async (id: string, materialName: string) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      const confirmed = window.confirm(`¿Estás seguro de eliminar el material "${materialName}"?`);
      if (!confirmed) return;

      await inventoryApi.deleteItem(id, user);
      await loadInventoryData();
    } catch (error) {
      handleError(error as Error, { operation: 'deleteMaterial' });
      throw error;
    }
  }, [loadInventoryData, handleError, user]);

  const adjustStock = useCallback(async (id: string, adjustment: number, reason?: string) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      // Get current item to calculate new stock
      const { items: currentItems } = useMaterialsStore.getState();
      const item = currentItems.find(i => i.id === id);
      if (!item) throw new Error('Material no encontrado');

      const newStock = (item.stock || 0) + adjustment;

      const result = await inventoryApi.updateStock(id, newStock, user, item.stock);
      await loadInventoryData();
      return result;
    } catch (error) {
      handleError(error as Error, { operation: 'adjustStock' });
      throw error;
    }
  }, [loadInventoryData, handleError, user]);

  // Enhanced alerts
  const alerts = useMemo(() => {
    const alertList: Array<{ type: string; title: string; description: string; items: MaterialItem[] }> = [];

    // Critical stock alerts
    const criticalItems = StockCalculation.getCriticalStockItems(items);
    if (criticalItems.length > 0) {
      alertList.push({
        type: 'critical',
        title: `${criticalItems.length} materiales con stock crítico`,
        description: 'Requieren reposición inmediata',
        items: criticalItems
      });
    }

    // Low stock warnings
    const lowStockItems = StockCalculation.getLowStockItems(items);
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
  }, [items]);

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
    error,

    // Tab management
    activeTab: pageState.activeTab,
    setActiveTab,

    // Actions
    actions,


    // Data operations (legacy - kept for compatibility)
    items,
    loadInventoryData,
    getFilteredItems, // From store
    getLowStockItems: getLowStockItemsFn, // ✅ Renamed to avoid confusion
    getCriticalStockItems: getCriticalStockItemsFn, // ✅ Renamed to avoid confusion
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