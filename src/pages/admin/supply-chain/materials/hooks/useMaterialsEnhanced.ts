/**
 * Enhanced Materials Hook using generic patterns
 * Migrated to use useDataFetcher, useDataSearch, and AnalyticsEngine
 */
import { useDataFetcher, useDataSearch, useModuleAnalytics } from '@/shared/hooks/business';
import { AnalyticsEngine } from '@/shared/services/AnalyticsEngine';
import { handleAsyncOperation, CRUDHandlers } from '@/shared/utils/errorHandling';
import { useInventory } from '../components/logic/useInventory';
import { useMemo } from 'react';

interface Material {
  id: string;
  name: string;
  type: 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';
  category: string;
  unit: string;
  stock: number;
  unit_cost: number;
  total_value: number;
  min_stock: number;
  max_stock: number;
  supplier?: string;
  last_activity?: string;
  created_at: string;
  updated_at?: string;
}

interface MaterialsAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalStockItems: number;
  supplierCount: number;
  averageValue: number;
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  activityRate: number;
}

export function useMaterialsEnhanced() {
  const inventoryHook = useInventory();

  // Generic data fetching for materials
  const {
    data: materials,
    loading,
    error,
    refresh: refreshMaterials
  } = useDataFetcher<Material>({
    fetchFn: async () => {
      // Convert inventory items to Material interface
      const items = inventoryHook.items || [];
      return items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED',
        category: item.category || 'Sin categoría',
        unit: item.unit,
        stock: item.stock || 0,
        unit_cost: item.unit_cost || 0,
        total_value: (item.stock || 0) * (item.unit_cost || 0),
        min_stock: item.min_stock || 10,
        max_stock: item.max_stock || 100,
        supplier: item.supplier,
        last_activity: item.updated_at || item.created_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    },
    module: 'materials',
    dependencies: [inventoryHook.items]
  });

  // Generic search functionality
  const materialSearch = useDataSearch<Material>({
    searchFn: async (query: string) => {
      return materials.filter(material =>
        material.name.toLowerCase().includes(query.toLowerCase()) ||
        material.category.toLowerCase().includes(query.toLowerCase()) ||
        material.supplier?.toLowerCase().includes(query.toLowerCase())
      );
    }
  });

  // Analytics using generic engine
  const analytics = useModuleAnalytics<MaterialsAnalytics>({
    module: 'materials',
    timeRange: '30d'
  });

  // Memoized analytics calculation
  const materialsMetrics = useMemo(async () => {
    if (!materials.length) return null;

    const analyticsResult = await AnalyticsEngine.generateAnalytics(materials, {
      module: 'materials',
      timeRange: '30d',
      includeForecasting: true,
      includeTrends: true
    });

    // Materials-specific metrics
    const lowStockCount = materials.filter(m => m.stock <= m.min_stock).length;
    const criticalStockCount = materials.filter(m => m.stock <= (m.min_stock * 0.5)).length;
    const supplierCount = new Set(materials.map(m => m.supplier).filter(Boolean)).size;

    const categoryBreakdown = materials.reduce((acc, material) => {
      acc[material.category] = (acc[material.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = materials.reduce((acc, material) => {
      acc[material.type] = (acc[material.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const customMetrics: MaterialsAnalytics = {
      totalItems: analyticsResult.metrics.total_count as number,
      totalValue: analyticsResult.metrics.total_value as number || 0,
      averageValue: analyticsResult.metrics.average_value as number || 0,
      activityRate: analyticsResult.metrics.activity_rate as number || 0,
      lowStockItems: lowStockCount,
      criticalStockItems: criticalStockCount,
      supplierCount,
      categoryBreakdown,
      typeBreakdown
    };

    await analytics.loadAnalytics(materials, [
      { key: 'total_count', label: 'Total Items', format: 'number' },
      { key: 'total_value', label: 'Total Value', format: 'currency' },
      { key: 'low_stock', label: 'Low Stock Items', format: 'number', colorPalette: 'red' },
      { key: 'suppliers', label: 'Active Suppliers', format: 'number' }
    ]);

    return customMetrics;
  }, [materials, analytics]);

  // CRUD operations using standardized handlers
  const createMaterial = async (materialData: Partial<Material>) => {
    return await CRUDHandlers.create(
      () => inventoryHook.addItem(materialData),
      'Material',
      refreshMaterials
    );
  };

  const updateMaterial = async (id: string, materialData: Partial<Material>) => {
    return await CRUDHandlers.update(
      () => inventoryHook.updateItem(id, materialData),
      'Material',
      refreshMaterials
    );
  };

  const deleteMaterial = async (id: string, materialName: string) => {
    return await CRUDHandlers.delete(
      () => inventoryHook.removeItem(id),
      'Material',
      `¿Estás seguro de eliminar el material "${materialName}"?`,
      refreshMaterials
    );
  };

  // Stock management operations
  const adjustStock = async (id: string, adjustment: number, reason?: string) => {
    return await handleAsyncOperation(
      () => inventoryHook.adjustStock(id, adjustment, reason),
      {
        module: 'materials',
        operation: 'ajustar stock'
      }
    );
  };

  // Inventory alerts using analytics
  const getInventoryAlerts = () => {
    if (!materials.length) return [];

    const alerts = [];

    // Critical stock alerts
    const criticalItems = materials.filter(m => m.stock <= (m.min_stock * 0.5));
    if (criticalItems.length > 0) {
      alerts.push({
        type: 'critical',
        title: `${criticalItems.length} materiales con stock crítico`,
        description: 'Requieren reposición inmediata',
        items: criticalItems
      });
    }

    // Low stock warnings
    const lowStockItems = materials.filter(m =>
      m.stock <= m.min_stock && m.stock > (m.min_stock * 0.5)
    );
    if (lowStockItems.length > 0) {
      alerts.push({
        type: 'warning',
        title: `${lowStockItems.length} materiales con stock bajo`,
        description: 'Considera reponer pronto',
        items: lowStockItems
      });
    }

    // High value items tracking
    const highValueItems = materials.filter(m => m.total_value > 10000);
    if (highValueItems.length > 0) {
      alerts.push({
        type: 'info',
        title: `${highValueItems.length} materiales de alto valor`,
        description: 'Monitorear de cerca',
        items: highValueItems
      });
    }

    return alerts;
  };

  return {
    // Data
    materials,
    loading,
    error,

    // Search
    search: materialSearch.search,
    searchResults: materialSearch.searchResults,
    searchLoading: materialSearch.loading,
    searchQuery: materialSearch.query,
    clearSearch: materialSearch.clearSearch,

    // Analytics
    metrics: materialsMetrics,
    analytics: analytics.metrics,
    analyticsLoading: analytics.loading,
    formatMetric: analytics.formatMetric,

    // CRUD operations
    createMaterial,
    updateMaterial,
    deleteMaterial,

    // Stock management
    adjustStock,

    // Alerts and insights
    alerts: getInventoryAlerts(),

    // Utility functions
    refresh: refreshMaterials,

    // Original inventory hook for backward compatibility
    inventory: inventoryHook
  };
}