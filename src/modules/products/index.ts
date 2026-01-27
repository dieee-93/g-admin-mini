/**
 * Products Module - Clean Architecture
 * Following TanStack Query + Zustand pattern
 */

// TanStack Query Hooks (Server State)
export {
  useProducts,
  useProduct,
  useProductsWithRecipes,
  useProductsByType,
  useProductCost,
  useProductAvailability,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductPublish,
  productsKeys,
} from './hooks/useProducts';

// Service Products Hooks
export {
  useServiceProducts,
  useServiceProductsCount,
  serviceProductsKeys,
} from './hooks/useServiceProducts';

// UI Store (Client State)
export {
  useProductsStore,
  useActiveTab,
  useViewMode,
  useProductFilters,
  useSelectedProductId,
  useProductsActions,
  type ViewMode,
  type ActiveTab,
  type ProductFilters,
} from './store/productsStore';

// Facade Hook (Combined)
export { useProductsPage, type UseProductsPageReturn } from './hooks/useProductsPage';

// Product Catalog Settings Hooks
export {
  useProductCatalogSettings,
  useProductCatalogSetting,
  useSystemProductCatalogSettings,
  useUpdateProductCatalogSettings,
  useToggleCheckStock,
  useToggleAllowBackorders,
  useToggleAutoDisableOnZeroStock,
  productCatalogKeys,
} from './hooks/useProductCatalog';
