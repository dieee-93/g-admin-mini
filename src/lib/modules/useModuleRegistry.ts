/**
 * USE MODULE REGISTRY HOOK
 *
 * React hook for accessing the Module Registry in components.
 * Provides memoized access to registry instance and common operations.
 *
 * FEATURES:
 * - Memoized registry instance
 * - Convenience methods for hook operations
 * - Type-safe hook handlers
 * - Performance-optimized
 *
 * USAGE:
 * ```tsx
 * import { useModuleRegistry } from '@/lib/modules';
 *
 * function MyComponent() {
 *   const { registry, addAction, doAction, hasHook, getStats } = useModuleRegistry();
 *
 *   // Register a hook
 *   React.useEffect(() => {
 *     addAction('my.hook', (data) => <MyWidget {...data} />, 'my-module');
 *   }, [addAction]);
 *
 *   // Execute a hook
 *   const results = doAction('my.hook', { someData: 'value' });
 *
 *   // Check if hook exists
 *   const exists = hasHook('my.hook');
 *
 *   // Get registry stats
 *   const stats = getStats();
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @version 1.0.0
 * @see docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md
 */

import { useMemo, useCallback } from 'react';
import { ModuleRegistry } from './ModuleRegistry';
import type { HookHandler } from './types';

// ============================================
// HOOK RETURN TYPE
// ============================================

interface UseModuleRegistryReturn {
  /** Registry singleton instance */
  registry: ModuleRegistry;

  /** Register a hook handler */
  addAction: <T = any, R = any>(
    hookName: string,
    handler: HookHandler<T, R>,
    moduleId?: string,
    priority?: number
  ) => void;

  /** Execute all handlers for a hook */
  doAction: <T = any, R = any>(hookName: string, data?: T) => R[];

  /** Check if a hook has handlers */
  hasHook: (hookName: string) => boolean;

  /** Get registry statistics */
  getStats: () => {
    totalModules: number;
    totalHooks: number;
    modules: string[];
    hooks: Array<{ name: string; handlerCount: number }>;
  };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook for accessing Module Registry
 *
 * @returns Registry instance and helper methods
 */
export const useModuleRegistry = (): UseModuleRegistryReturn => {
  // Memoize registry instance (singleton, so this is stable)
  const registry = useMemo(() => ModuleRegistry.getInstance(), []);

  // Memoize helper methods
  const addAction = useCallback(
    <T = any, R = any>(
      hookName: string,
      handler: HookHandler<T, R>,
      moduleId?: string,
      priority?: number
    ) => {
      registry.addAction(hookName, handler, moduleId, priority);
    },
    [registry]
  );

  const doAction = useCallback(
    <T = any, R = any>(hookName: string, data?: T): R[] => {
      return registry.doAction(hookName, data);
    },
    [registry]
  );

  const hasHook = useCallback(
    (hookName: string): boolean => {
      return registry.hasHook(hookName);
    },
    [registry]
  );

  const getStats = useCallback(() => {
    return registry.getStats();
  }, [registry]);

  return {
    registry,
    addAction,
    doAction,
    hasHook,
    getStats,
  };
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default useModuleRegistry;
