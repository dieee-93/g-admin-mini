/**
 * Products Page Hook - Main Orchestrator
 * Following Materials module pattern (Gold Standard)
 *
 * Responsibilities:
 * - Coordinate products data loading
 * - Manage UI state (modals, filters, tabs)
 * - Handle CRUD operations
 * - Calculate metrics
 * - Integration with EventBus
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProductsStore } from '@/modules/products';
import { productsService } from '@/pages/admin/supply-chain/products/services/productApi';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { PlusIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { ProductWithConfig, ProductCategory } from '../types';
import eventBus from '@/lib/events';
import { logger } from '@/lib/logging';

// ===== TYPES =====

export interface ProductsPageState {
  activeTab: 'products' | 'analytics' | 'cost-analysis';
  selectedFilters: FilterState;
  viewMode: 'grid' | 'table' | 'cards';
  selectedCategory: ProductCategory | null;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  selectedProduct: ProductWithConfig | null;
  isDetailViewOpen: boolean;
}

export interface FilterState {
  category?: ProductCategory;
  hasRecipe?: boolean;
  requiresBooking?: boolean;
  isDigital?: boolean;
  search?: string;
}

export interface ProductsPageMetrics {
  totalProducts: number;
  totalCategories: number;
  productsWithRecipes: number;
  serviceProducts: number;
  digitalProducts: number;
  lastUpdate: Date;
}

export interface ProductsPageActions {
  // Modal management
  handleNewProduct: () => void;
  handleEditProduct: (product: ProductWithConfig) => void;
  handleViewDetails: (product: ProductWithConfig) => void;
  handleCloseForm: () => void;
  handleCloseDetails: () => void;

  // CRUD operations
  handleDeleteProduct: (productId: string) => Promise<void>;
  handleTogglePublish: (productId: string) => Promise<void>;

  // Analytics
  handleMenuEngineering: () => void;
  handleCostAnalysis: () => void;

  // Filters
  handleCategoryFilter: (category: ProductCategory | null) => void;
  handleSearch: (query: string) => void;
  handleFilterChange: (filters: Partial<FilterState>) => void;
  handleClearFilters: () => void;
}

export interface UseProductsPageReturn {
  // State
  pageState: ProductsPageState;
  metrics: ProductsPageMetrics;
  loading: boolean;
  error: string | null;

  // Tab management
  activeTab: ProductsPageState['activeTab'];
  setActiveTab: (tab: ProductsPageState['activeTab']) => void;

  // Actions
  actions: ProductsPageActions;

  // Performance
  shouldReduceAnimations: boolean;
  isOnline: boolean;

  // Data
  products: ProductWithConfig[];
  filteredProducts: ProductWithConfig[];
  refresh: () => Promise<void>;
}

// ===== HOOK =====

export function useProductsPage(): UseProductsPageReturn {
  const { navigate, setQuickActions, updateModuleBadge } = useNavigationActions();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { user } = useAuth();

  // Get state from Zustand store
  const { products, isLoading, error } = useProductsStore();

  // Local UI state
  const [pageState, setPageState] = useState<ProductsPageState>({
    activeTab: 'products',
    selectedFilters: {},
    viewMode: 'cards',
    selectedCategory: null,
    isFormOpen: false,
    formMode: 'create',
    selectedProduct: null,
    isDetailViewOpen: false,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  // ===== METRICS CALCULATION =====
  const metrics: ProductsPageMetrics = useMemo(() => {
    const productsWithConfig = products as unknown as ProductWithConfig[];

    return {
      totalProducts: productsWithConfig.length,
      totalCategories: new Set(productsWithConfig.map(p => p.category)).size,
      productsWithRecipes: productsWithConfig.filter(p => p.config?.has_components).length,
      serviceProducts: productsWithConfig.filter(p =>
        ['BEAUTY_SERVICE', 'REPAIR_SERVICE', 'PROFESSIONAL_SERVICE'].includes(p.category)
      ).length,
      digitalProducts: productsWithConfig.filter(p => p.config?.is_digital).length,
      lastUpdate: new Date(),
    };
  }, [products]);

  // ===== FILTERED PRODUCTS =====
  const filteredProducts = useMemo(() => {
    const productsWithConfig = products as unknown as ProductWithConfig[];
    let result = [...productsWithConfig];

    const { category, hasRecipe, requiresBooking, isDigital, search } = pageState.selectedFilters;

    // Filter by category
    if (category) {
      result = result.filter(p => p.category === category);
    }

    // Filter by has recipe
    if (hasRecipe !== undefined) {
      result = result.filter(p => p.config?.has_components === hasRecipe);
    }

    // Filter by requires booking
    if (requiresBooking !== undefined) {
      result = result.filter(p => p.config?.requires_booking === requiresBooking);
    }

    // Filter by is digital
    if (isDigital !== undefined) {
      result = result.filter(p => p.config?.is_digital === isDigital);
    }

    // Filter by search
    if (search && search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, pageState.selectedFilters]);

  // ===== LOAD PRODUCTS =====
  const loadProducts = useCallback(async () => {
    try {
      setLocalError(null);
      await productsService.loadProducts();
    } catch (error) {
      logger.error('ProductsPage', 'Error loading products:', error);
      setLocalError('Error al cargar productos');
      handleError(error as Error, { operation: 'loadProducts' });
    }
  }, [handleError]);

  // ===== ACTIONS =====
  const actions: ProductsPageActions = {
    // Modal management - UPDATED: Navigate to new ProductFormPage
    handleNewProduct: useCallback(() => {
      logger.info('ProductsPage', 'Navigating to new product form (v3.0)');
      navigate('products', '/new');
    }, [navigate]),

    handleEditProduct: useCallback((product: ProductWithConfig) => {
      setPageState(prev => ({
        ...prev,
        isFormOpen: true,
        formMode: 'edit',
        selectedProduct: product,
      }));
      logger.info('ProductsPage', 'Opening edit product form', { productId: product.id });
    }, []),

    handleViewDetails: useCallback((product: ProductWithConfig) => {
      setPageState(prev => ({
        ...prev,
        isDetailViewOpen: true,
        selectedProduct: product,
      }));
      logger.info('ProductsPage', 'Opening product details', { productId: product.id });
    }, []),

    handleCloseForm: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        isFormOpen: false,
        selectedProduct: null,
      }));
    }, []),

    handleCloseDetails: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        isDetailViewOpen: false,
        selectedProduct: null,
      }));
    }, []),

    // CRUD operations
    handleDeleteProduct: useCallback(async (productId: string) => {
      try {
        const confirmed = window.confirm('¿Estás seguro de eliminar este producto?');
        if (!confirmed) return;

        // TODO: Implement delete via service
        logger.info('ProductsPage', 'Deleting product', { productId });

        // Emit event
        eventBus.emit('products.product_deleted', {
          productId,
          timestamp: new Date().toISOString(),
        });

        await loadProducts();
      } catch (error) {
        handleError(error as Error, { operation: 'deleteProduct', productId });
      }
    }, [loadProducts, handleError]),

    handleTogglePublish: useCallback(async (productId: string) => {
      try {
        if (!user) {
          logger.error('App', 'Cannot toggle publish: User not authenticated');
          return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const newPublishState = !product.is_published;
        
        // Update store immediately (optimistic)
        useProductsStore.getState().togglePublished(productId);

        logger.info('App', `Product ${newPublishState ? 'published' : 'unpublished'}`, {
          productId,
          productName: product.name
        });

        // Persist to database via service
        await productsService.updateProduct({
          id: productId,
          is_published: newPublishState
        }, user);

      } catch (error) {
        logger.error('App', 'Error toggling publish status:', error);
        handleError(error as Error, { operation: 'togglePublish' });
        // Revert on error by reloading from database
        await loadProducts();
      }
    }, [products, user, handleError, loadProducts]),

    // Analytics
    handleMenuEngineering: useCallback(() => {
      setPageState(prev => ({ ...prev, activeTab: 'analytics' }));
      logger.info('ProductsPage', 'Opening menu engineering');
    }, []),

    handleCostAnalysis: useCallback(() => {
      setPageState(prev => ({ ...prev, activeTab: 'cost-analysis' }));
      logger.info('ProductsPage', 'Opening cost analysis');
    }, []),

    // Filters
    handleCategoryFilter: useCallback((category: ProductCategory | null) => {
      setPageState(prev => ({
        ...prev,
        selectedFilters: { ...prev.selectedFilters, category: category || undefined },
      }));
    }, []),

    handleSearch: useCallback((query: string) => {
      setPageState(prev => ({
        ...prev,
        selectedFilters: { ...prev.selectedFilters, search: query || undefined },
      }));
    }, []),

    handleFilterChange: useCallback((filters: Partial<FilterState>) => {
      setPageState(prev => ({
        ...prev,
        selectedFilters: { ...prev.selectedFilters, ...filters },
      }));
    }, []),

    handleClearFilters: useCallback(() => {
      setPageState(prev => ({
        ...prev,
        selectedFilters: {},
        selectedCategory: null,
      }));
    }, []),
  };

  // ===== SETUP QUICK ACTIONS =====
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-product',
        label: 'Nuevo Producto',
        icon: PlusIcon,
        action: actions.handleNewProduct,
        color: 'purple' as const,
      },
      {
        id: 'menu-engineering',
        label: 'Menu Engineering',
        icon: ChartBarIcon,
        action: actions.handleMenuEngineering,
        color: 'blue' as const,
      },
      {
        id: 'cost-analysis',
        label: 'Análisis de Costos',
        icon: CogIcon,
        action: actions.handleCostAnalysis,
        color: 'green' as const,
      },
    ];

    setQuickActions(quickActions);

    return () => setQuickActions([]);
  }, [setQuickActions, actions.handleNewProduct, actions.handleMenuEngineering, actions.handleCostAnalysis]);

  // ===== UPDATE MODULE BADGE =====
  useEffect(() => {
    if (updateModuleBadge) {
      updateModuleBadge('products', metrics.totalProducts);
    }
  }, [metrics.totalProducts, updateModuleBadge]);

  // ===== LOAD DATA ON MOUNT =====
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ===== TAB MANAGEMENT =====
  const setActiveTab = useCallback((tab: ProductsPageState['activeTab']) => {
    setPageState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  return {
    // State
    pageState,
    metrics,
    loading: isLoading,
    error: error || localError,

    // Tab management
    activeTab: pageState.activeTab,
    setActiveTab,

    // Actions
    actions,

    // Performance
    shouldReduceAnimations: false, // TODO: Implement performance monitoring
    isOnline,

    // Data
    products: products as unknown as ProductWithConfig[],
    filteredProducts,
    refresh: loadProducts,
  };
}