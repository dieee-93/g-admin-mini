/**
 * G-Admin Module Registry System - Main Export
 * WordPress hooks + VS Code extensions inspired module system
 * @version 1.0.0
 */

// Core module registry
export { ModuleRegistry, getModuleRegistry } from './ModuleRegistry';

// Hook system components
export { HookPoint } from './HookPoint';

// Bootstrap and integration
export * from './bootstrap';
export * from './integration';

// Type definitions
export type {
  ModuleManifest,
  ModuleInstance,
  HookHandler,
  RegisteredHook,
  HookContext,
  HookPointProps,
  IModuleRegistry,
  ModuleInitResult,
  TopologicalSortResult,
  ModuleValidationError,
  ModuleValidationResult
} from './types';

/**
 * Quick start example:
 *
 * ```tsx
 * // 1. Create a module manifest (src/modules/sales/manifest.tsx)
 * import type { ModuleManifest } from '@/lib/modules/types';
 *
 * export const salesManifest: ModuleManifest = {
 *   id: 'sales',
 *   name: 'Sales Module',
 *   version: '1.0.0',
 *   depends: ['inventory'],
 *   requiredFeatures: ['sales_order_management'],
 *   hooks: {
 *     provide: ['dashboard.widgets', 'calendar.events'],
 *     consume: ['inventory.stock_updated']
 *   },
 *   setup: (registry) => {
 *     registry.addAction('dashboard.widgets', () => (
 *       <SalesWidget />
 *     ), 'sales', 100);
 *   }
 * };
 *
 * // 2. Register in src/modules/index.ts
 * export const ALL_MODULE_MANIFESTS = [salesManifest, ...];
 *
 * // 3. Use HookPoint in pages
 * import { HookPoint } from '@/lib/modules';
 *
 * <HookPoint
 *   name="dashboard.widgets"
 *   data={{ userId: 123 }}
 *   fallback={<EmptyState />}
 *   direction="column"
 *   gap={4}
 * />
 * ```
 */