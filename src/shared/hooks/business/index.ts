/**
 * Business Logic Hooks - Reutilizable patterns
 * Extracted from customers, materials, products, sales modules
 */

export { useFormManager } from './useFormManager';
export { useDataFetcher, useDataSearch } from './useDataFetcher';
export { useModuleAnalytics } from './useModuleAnalytics';

// Type exports for better TypeScript support
export type {
  // Re-export useful types for consumers
} from './useFormManager';