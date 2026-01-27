/**
 * Sales Module Types
 * Centralized type exports
 */

// POS (Point of Sale) types
export * from './pos';

// B2B types
export * from '../b2b/types';

// E-commerce types - use namespace to avoid conflicts
export type { OnlineProduct, OnlineCatalogFilters, OnlineOrdersFilters, OnlineOrder, Catalog, CatalogProduct, Cart, CartItem } from '../ecommerce/types';
