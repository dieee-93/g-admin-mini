/**
 * ECOMMERCE SUB-MODULE ENTRY POINT
 * 
 * ⚡ PERFORMANCE: Lazy-loadable exports
 * Import this file only when ecommerce features are needed
 * 
 * Usage:
 * ```tsx
 * // ✅ GOOD - Load only when needed
 * const { ProductCatalog } = await import('@/modules/sales/ecommerce');
 * 
 * // ❌ BAD - Loads all ecommerce code immediately
 * import { ProductCatalog } from '@/modules/sales/manifest';
 * ```
 */

export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
