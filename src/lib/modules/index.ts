/**
 * G-Admin v3.0 Module System - Main Export
 * Module Federation and dynamic loading with dependency injection
 * Based on 2024 Webpack 5 Module Federation patterns
 */

// Core module system
export { ModuleRegistry, getModuleRegistry, resetModuleRegistry } from './ModuleRegistry';
export { ModuleLoader, getModuleLoader, resetModuleLoader } from './ModuleLoader';

// React hooks for module management
export {
  useModuleRegistry,
  useModuleLoader,
  useModule,
  useModulesByCapability,
  useModuleDependencies,
  useModuleHealth,
  useBatchModules,
  useModuleStatistics
} from './hooks/useModules';

// Type definitions
export type {
  ModuleInterface,
  ModuleMetadata,
  ModuleDependencies,
  ModuleComponents,
  ModuleHooks,
  ModuleServices,
  ModuleTypes,
  ModuleEvents,
  ModuleLifecycle,
  ModuleConfig,
  ModuleRegistryEntry,
  ModuleLoaderConfig,
  ModuleFederationConfig,
  ModuleLoadingState,
  ModuleResolutionResult,
  ModulePerformanceMetrics,
  ModuleHealthCheck,
  ModuleUpdateInfo
} from './types/ModuleTypes';

// Utility functions
export { createModuleDefinition, validateModuleInterface, createFederationConfig } from './utils/moduleUtils';

/**
 * Quick start example:
 *
 * ```tsx
 * import { getModuleRegistry, useModule } from '@/lib/modules';
 *
 * // Register a module
 * const registry = getModuleRegistry();
 * registry.register({
 *   metadata: {
 *     id: 'sales-module',
 *     name: 'Sales Module',
 *     version: '1.0.0'
 *   },
 *   dependencies: {
 *     requiredCapabilities: ['sells_products', 'pos_system']
 *   },
 *   components: {
 *     MainComponent: lazy(() => import('./SalesModule'))
 *   },
 *   federation: {
 *     name: 'salesModule',
 *     filename: 'remoteEntry.js',
 *     exposes: {
 *       './SalesModule': './src/modules/sales/index.tsx'
 *     },
 *     shared: {
 *       react: { singleton: true },
 *       '@chakra-ui/react': { singleton: true }
 *     }
 *   }
 * });
 *
 * // Use in component
 * const SalesPage = () => {
 *   const { module, instance, load, isLoading } = useModule('sales-module');
 *
 *   useEffect(() => {
 *     load();
 *   }, [load]);
 *
 *   if (isLoading) return <div>Loading sales module...</div>;
 *   if (!instance) return <div>Sales module not available</div>;
 *
 *   return <instance.MainComponent />;
 * };
 * ```
 */