/**
 * MODULE REGISTRY INTEGRATION
 *
 * Bridge between CapabilityStore and ModuleRegistry.
 * Provides helper functions for App.tsx to initialize modules
 * based on user's active capabilities and features.
 *
 * FEATURES:
 * - Automatic feature resolution from CapabilityStore
 * - Module initialization based on active features
 * - Performance tracking
 * - Error handling and logging
 *
 * USAGE IN APP.TSX:
 * ```typescript
 * import { initializeModulesForCapabilities } from '@/lib/modules/integration';
 *
 * useEffect(() => {
 *   const init = async () => {
 *     await initializeModulesForCapabilities(ALL_MODULE_MANIFESTS);
 *   };
 *   init();
 * }, []);
 * ```
 *
 * @version 1.0.0
 * @see docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md
 */

import { logger } from '@/lib/logging';
import { ModuleRegistry } from './ModuleRegistry';
import { initializeModules } from './bootstrap';
import type { ModuleManifest, ModuleInitResult } from './types';
import type { FeatureId } from '@/config/types';

// ============================================
// CAPABILITY STORE INTEGRATION
// ============================================

/**
 * Initialize modules based on active features
 *
 * @param activeFeatures - Active feature IDs from FeatureFlagContext
 * @param manifests - Array of all available module manifests
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Promise with initialization result
 */
export async function initializeModulesForCapabilities(
  activeFeatures: FeatureId[],
  manifests: ModuleManifest[],
  registry?: ModuleRegistry
): Promise<ModuleInitResult> {
  const startTime = performance.now();

  logger.info('App', '🔗 Initializing modules', {
    activeFeaturesCount: activeFeatures.length,
  });

  try {
    const moduleRegistry = registry || ModuleRegistry.getInstance();

    console.log('🚀 [initializeModulesForCapabilities] About to initialize modules:', {
      manifestsCount: manifests.length,
      activeFeaturesCount: activeFeatures.length,
      registrySize: moduleRegistry.getAll().length
    });

    const result = await initializeModules(activeFeatures, moduleRegistry, manifests);

    const duration = performance.now() - startTime;

    console.log('✅ [initializeModulesForCapabilities] COMPLETE:', {
      initialized: result.initialized,
      failed: result.failed,
      skipped: result.skipped,
      duration: `${duration.toFixed(2)}ms`,
      finalRegistrySize: moduleRegistry.getAll().length
    });
    logger.info('App', '✅ Module initialization from capabilities complete', {
      initialized: result.initialized.length,
      failed: result.failed.length,
      skipped: result.skipped.length,
      totalDuration: `${duration.toFixed(2)}ms`,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    logger.error('App', '❌ Module initialization from capabilities failed', error);

    return {
      initialized: [],
      failed: [
        {
          moduleId: 'system',
          error: error instanceof Error ? error : new Error(String(error)),
        },
      ],
      skipped: manifests.map((m) => m.id),
      duration,
    };
  }
}

/**
 * Re-initialize modules when capabilities change
 *
 * @param activeFeatures - Active feature IDs from FeatureFlagContext
 * @param manifests - Array of all available module manifests
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Promise with initialization result
 */
export async function reinitializeModulesForCapabilities(
  activeFeatures: FeatureId[],
  manifests: ModuleManifest[],
  registry?: ModuleRegistry
): Promise<ModuleInitResult> {
  logger.info('App', '🔄 Re-initializing modules', {
    activeFeaturesCount: activeFeatures.length,
  });

  const moduleRegistry = registry || ModuleRegistry.getInstance();
  moduleRegistry.clear();

  return initializeModulesForCapabilities(activeFeatures, manifests, moduleRegistry);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get module registry statistics
 *
 * Useful for debugging and monitoring.
 *
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Registry stats object
 *
 * @example
 * const stats = getModuleRegistryStats();
 * console.log(`Registered modules: ${stats.totalModules}`);
 * console.log(`Registered hooks: ${stats.totalHooks}`);
 */
export function getModuleRegistryStats(registry?: ModuleRegistry) {
  const moduleRegistry = registry || ModuleRegistry.getInstance();
  return moduleRegistry.getStats();
}

/**
 * Check if a module is registered
 *
 * @param moduleId - Module identifier
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns True if module is registered
 */
export function isModuleRegistered(moduleId: string, registry?: ModuleRegistry): boolean {
  const moduleRegistry = registry || ModuleRegistry.getInstance();
  return moduleRegistry.has(moduleId);
}

/**
 * Get all registered module IDs
 *
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Array of module IDs
 */
export function getRegisteredModuleIds(registry?: ModuleRegistry): string[] {
  const moduleRegistry = registry || ModuleRegistry.getInstance();
  return moduleRegistry.getAll().map((m) => m.manifest.id);
}

