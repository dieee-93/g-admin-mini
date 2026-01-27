/**
 * MATERIALS MODULE - MAIN INDEX
 * 
 * Central export point for the materials module.
 * Provides clean import paths for consumers.
 * 
 * @example
 * ```typescript
 * // From another module or page
 * import { ABCAnalysisEngine, inventoryApi } from '@/modules/materials';
 * import { useMaterialsStore, useMaterials } from '@/modules/materials';
 * import type { MaterialItem, ABCAnalysisResult } from '@/modules/materials';
 * ```
 */

// Services
export * from './services';

// Store
export * from './store';

// Hooks
export * from './hooks';

// Types
export * from './types';

// Widgets
export * from './widgets';

// Alerts
export * from './alerts/adapter';

// Manifest
export { materialsManifest } from './manifest';
export type { MaterialsAPI } from './manifest';
