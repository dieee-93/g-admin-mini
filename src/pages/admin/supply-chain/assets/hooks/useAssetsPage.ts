/**
 * USE ASSETS PAGE HOOK
 * Main hook for Assets page - follows Materials pattern
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useAssetsStore } from '@/store/assetsStore';
import { assetsApi } from '../services/assetsApi';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import EventBus from '@/lib/events';
import { logger } from '@/lib/logging';
import type { Asset, CreateAssetDTO, UpdateAssetDTO, AssetFilters } from '../types';
import {
  CubeIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export interface AssetsPageActions {
  handleCreate: () => void;
  handleEdit: (asset: Asset) => void;
  handleView: (asset: Asset) => void;
  handleDelete: (id: string) => Promise<void>;
  handleSubmit: (data: Asset | Partial<Asset>) => Promise<void>;
  handleStatusChange: (id: string, status: Asset['status']) => Promise<void>;
  handleFiltersChange: (filters: AssetFilters) => void;
  handleClearFilters: () => void;
  handleFormClose: () => void;
  handleDetailClose: () => void;
}

export interface UseAssetsPageReturn {
  // Data
  assets: Asset[];
  filteredAssets: Asset[];
  metrics: typeof store.stats;
  loading: boolean;
  error: string | null;

  // Modal state
  isFormOpen: boolean;
  isDetailOpen: boolean;
  selectedAsset: Asset | null;

  // Actions
  actions: AssetsPageActions;

  // Performance
  shouldReduceAnimations: boolean;
  isOnline: boolean;

  // Filters
  filters: AssetFilters;

  // Data operations
  loadAssets: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAssetsPage(): UseAssetsPageReturn {
  const { setQuickActions, updateModuleBadge } = useNavigationActions();

  // System integrations
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();

  // Store - Extract specific values to avoid object reference issues
  const items = useAssetsStore((state) => state.items);
  const filters = useAssetsStore((state) => state.filters);
  const stats = useAssetsStore((state) => state.stats);
  const loading = useAssetsStore((state) => state.loading);
  const error = useAssetsStore((state) => state.error);
  const setLoading = useAssetsStore((state) => state.setLoading);
  const setError = useAssetsStore((state) => state.setError);
  const setItems = useAssetsStore((state) => state.setItems);
  const addItem = useAssetsStore((state) => state.addItem);
  const updateItem = useAssetsStore((state) => state.updateItem);
  const deleteItem = useAssetsStore((state) => state.deleteItem);
  const setFilters = useAssetsStore((state) => state.setFilters);
  const resetFilters = useAssetsStore((state) => state.resetFilters);
  const getFilteredItems = useAssetsStore((state) => state.getFilteredItems);

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Filtered assets - Call store function directly (it already uses get())
  const filteredAssets = useMemo(() => getFilteredItems(), [items, filters]);

  // Actions - Define BEFORE useEffect hooks that use them
  const handleCreate = useCallback(() => {
    setSelectedAsset(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const asset = items.find((a) => a.id === id);
      if (!asset) return;

      const confirmed = window.confirm(
        `¿Estás seguro de eliminar el asset "${asset.name}"?`
      );
      if (!confirmed) return;

      try {
        await assetsApi.delete(id);
        deleteItem(id);

        // Emit event
        EventBus.emit('assets.deleted', {
          assetId: id,
          assetName: asset.name,
          timestamp: new Date().toISOString(),
        });

        logger.info('AssetsPage', 'Asset deleted', { assetId: id });
      } catch (error) {
        handleError(error as Error, { operation: 'deleteAsset', assetId: id });
      }
    },
    [items, deleteItem, handleError]
  );

  const handleSubmit = useCallback(
    async (data: Asset | Partial<Asset>) => {
      try {
        if (selectedAsset) {
          // Update existing
          const updated = await assetsApi.update({ ...data, id: selectedAsset.id } as UpdateAssetDTO);
          updateItem(selectedAsset.id, updated);

          EventBus.emit('assets.updated', {
            assetId: selectedAsset.id,
            assetName: updated.name,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Create new
          const created = await assetsApi.create(data as CreateAssetDTO);
          addItem(created);

          EventBus.emit('assets.created', {
            assetId: created.id,
            assetName: created.name,
            category: created.category,
            timestamp: new Date().toISOString(),
          });
        }

        setIsFormOpen(false);
        setSelectedAsset(null);
      } catch (error) {
        handleError(error as Error, { operation: 'submitAsset' });
        throw error;
      }
    },
    [selectedAsset, updateItem, addItem, handleError]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: Asset['status']) => {
      try {
        const updated = await assetsApi.updateStatus(id, status);
        updateItem(id, updated);

        EventBus.emit('assets.status_updated', {
          assetId: id,
          oldStatus: items.find((a) => a.id === id)?.status,
          newStatus: status,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error as Error, { operation: 'updateStatus', assetId: id });
      }
    },
    [items, updateItem, handleError]
  );

  const handleFiltersChange = useCallback(
    (newFilters: AssetFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedAsset(null);
  }, []);

  const handleDetailClose = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedAsset(null);
  }, []);

  // Load assets data
  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const assets = await assetsApi.getAll();
      setItems(assets);

      logger.info('AssetsPage', 'Assets loaded successfully', { count: assets.length });
    } catch (error) {
      logger.error('AssetsPage', 'Error loading assets', error);
      setError('Error loading assets');
      handleError(error as Error, { operation: 'loadAssets' });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setItems, handleError]);

  const refresh = useCallback(async () => {
    await loadAssets();
  }, [loadAssets]);

  // Setup quick actions
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-asset',
        label: 'Nuevo Asset',
        icon: PlusIcon,
        action: () => handleCreate(),
        color: 'teal',
      },
      {
        id: 'maintenance',
        label: 'Mantenimiento',
        icon: WrenchScrewdriverIcon,
        action: () => {
          // Show maintenance due
          setFilters({ status: ['maintenance'] });
        },
        color: 'yellow',
      },
      {
        id: 'view-all',
        label: 'Ver Todos',
        icon: CubeIcon,
        action: () => resetFilters(),
        color: 'blue',
      },
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions, setFilters, resetFilters, handleCreate]);

  // Update navigation badge
  useEffect(() => {
    if (updateModuleBadge) {
      const maintenanceCount = stats.maintenance_due_soon;
      updateModuleBadge('assets', maintenanceCount > 0 ? maintenanceCount : items.length);
    }
  }, [items.length, stats.maintenance_due_soon, updateModuleBadge]);

  // Load data on mount
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return {
    // Data
    assets: items,
    filteredAssets,
    metrics: stats,
    loading,
    error,

    // Modal state
    isFormOpen,
    isDetailOpen,
    selectedAsset,

    // Actions
    actions: {
      handleCreate,
      handleEdit,
      handleView,
      handleDelete,
      handleSubmit,
      handleStatusChange,
      handleFiltersChange,
      handleClearFilters,
      handleFormClose,
      handleDetailClose,
    },

    // Performance
    shouldReduceAnimations,
    isOnline,

    // Filters
    filters,

    // Operations
    loadAssets,
    refresh,
  };
}
