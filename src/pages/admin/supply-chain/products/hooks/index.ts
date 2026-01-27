// Products Hooks - Main Exports
// Provides clean imports for all product management hooks

export { useProductForm } from './useProductForm';
export type { Product } from './useProductForm';

export * from './useMenuEngineering';
export * from './useCostAnalysis';
export * from './useProductComponents';

// ⚠️ DEPRECATED: useProductsPage moved to @/modules/products
// Old hook kept for reference: useProductsPage.legacy.ts
// Use: import { useProductsPage } from '@/modules/products'; instead

// Export new product form hooks (v3.0)
export {
  useAvailableProductTypes,
  useIsProductTypeAvailable,
  useRequiredCapabilitiesForType
} from './useAvailableProductTypes';