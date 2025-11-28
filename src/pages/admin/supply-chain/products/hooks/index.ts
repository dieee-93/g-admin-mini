// Products Hooks - Main Exports
// Provides clean imports for all product management hooks

export { useProductForm } from './useProductForm';
export type { Product } from './useProductForm';

export * from './useMenuEngineering';
export * from './useCostAnalysis';
export * from './useProductComponents';
export * from './useProductsPage';

// Export new product form hooks (v3.0)
export {
  useAvailableProductTypes,
  useIsProductTypeAvailable,
  useRequiredCapabilitiesForType
} from './useAvailableProductTypes';