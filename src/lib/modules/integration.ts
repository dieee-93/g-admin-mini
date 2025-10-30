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
import { useCapabilityStore } from '@/store/capabilityStore';
import { ModuleRegistry } from './ModuleRegistry';
import { initializeModules } from './bootstrap';
import type { ModuleManifest, ModuleInitResult } from './types';
import type { FeatureId } from '@/config/types';

// ============================================
// CAPABILITY STORE INTEGRATION
// ============================================

/**
 * Initialize modules based on active capabilities
 *
 * Reads activeFeatures from CapabilityStore and initializes
 * modules that have their required features active.
 *
 * This is the main entry point for App.tsx to bootstrap
 * the module system.
 *
 * @param manifests - Array of all available module manifests
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Promise with initialization result
 *
 * @example
 * // In App.tsx
 * import { initializeModulesForCapabilities } from '@/lib/modules/integration';
 * import { ALL_MODULE_MANIFESTS } from '@/modules';
 *
 * useEffect(() => {
 *   const init = async () => {
 *     const result = await initializeModulesForCapabilities(ALL_MODULE_MANIFESTS);
 *
 *     if (result.failed.length > 0) {
 *       console.error('Some modules failed:', result.failed);
 *     }
 *   };
 *
 *   init();
 * }, []);
 */
export async function initializeModulesForCapabilities(
  manifests: ModuleManifest[],
  registry?: ModuleRegistry
): Promise<ModuleInitResult> {
  const startTime = performance.now();

  logger.info('App', '🔗 Initializing modules from CapabilityStore');

  try {
    // 1. Get active features from CapabilityStore
    const activeFeatures = getActiveFeaturesFromStore();

    logger.debug('App', 'Active features from store', {
      count: activeFeatures.length,
      features: activeFeatures,
    });

    // 2. Get or create registry instance
    const moduleRegistry = registry || ModuleRegistry.getInstance();

    // 3. Initialize modules
    const result = await initializeModules(activeFeatures, moduleRegistry, manifests);

    const duration = performance.now() - startTime;

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
 * Useful for dynamic capability updates (e.g., user upgrades,
 * feature flags changed, milestone completed).
 *
 * Clears existing registry and re-initializes with new features.
 *
 * @param manifests - Array of all available module manifests
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Promise with initialization result
 *
 * @example
 * // After completing a milestone that unlocks new features
 * const result = await reinitializeModulesForCapabilities(ALL_MODULE_MANIFESTS);
 */
export async function reinitializeModulesForCapabilities(
  manifests: ModuleManifest[],
  registry?: ModuleRegistry
): Promise<ModuleInitResult> {
  logger.info('App', '🔄 Re-initializing modules for capability changes');

  const moduleRegistry = registry || ModuleRegistry.getInstance();

  // Clear existing modules
  moduleRegistry.clear();

  // Re-initialize
  return initializeModulesForCapabilities(manifests, moduleRegistry);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get active features from CapabilityStore
 *
 * Reads the current state of activeFeatures from Zustand store.
 *
 * @returns Array of active FeatureIds
 */
export function getActiveFeaturesFromStore(): FeatureId[] {
  const state = useCapabilityStore.getState();
  return state.features.activeFeatures;
}

/**
 * Get blocked features from CapabilityStore
 *
 * Reads blocked features (features awaiting milestone completion).
 *
 * @returns Array of blocked FeatureIds
 */
export function getBlockedFeaturesFromStore(): FeatureId[] {
  const state = useCapabilityStore.getState();
  return state.features.blockedFeatures;
}

/**
 * Get pending milestones from CapabilityStore
 *
 * @returns Array of pending milestone IDs
 */
export function getPendingMilestonesFromStore(): string[] {
  const state = useCapabilityStore.getState();
  return state.features.pendingMilestones;
}

/**
 * Check if a specific feature is active
 *
 * @param featureId - Feature to check
 * @returns True if feature is active
 */
export function isFeatureActive(featureId: FeatureId): boolean {
  const state = useCapabilityStore.getState();
  return state.hasFeature(featureId);
}

/**
 * Check if all features are active
 *
 * @param featureIds - Array of features to check
 * @returns True if all features are active
 */
export function areAllFeaturesActive(featureIds: FeatureId[]): boolean {
  const state = useCapabilityStore.getState();
  return state.hasAllFeatures(featureIds);
}

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

// ============================================
// SUBSCRIPTION HELPERS
// ============================================

/**
 * Subscribe to capability changes and auto-reinitialize modules
 *
 * Sets up a Zustand subscription that re-initializes modules
 * whenever activeFeatures change.
 *
 * Returns an unsubscribe function.
 *
 * @param manifests - Array of all available module manifests
 * @param registry - Optional ModuleRegistry instance (defaults to singleton)
 * @returns Unsubscribe function
 *
 * @example
 * // In App.tsx
 * useEffect(() => {
 *   const unsubscribe = subscribeToCapabilityChanges(ALL_MODULE_MANIFESTS);
 *   return () => unsubscribe();
 * }, []);
 */
export function subscribeToCapabilityChanges(
  manifests: ModuleManifest[],
  registry?: ModuleRegistry
): () => void {
  logger.info('App', '📡 Subscribing to capability changes for module auto-reload');

  let previousFeatures: FeatureId[] = [];

  const unsubscribe = useCapabilityStore.subscribe((state) => {
    const currentFeatures = state.features.activeFeatures;

    // Check if features actually changed
    const featuresChanged =
      previousFeatures.length !== currentFeatures.length ||
      !previousFeatures.every((f) => currentFeatures.includes(f));

    if (featuresChanged) {
      logger.info('App', '🔄 Active features changed - re-initializing modules', {
        previous: previousFeatures.length,
        current: currentFeatures.length,
      });

      // Re-initialize modules (async - don't await)
      reinitializeModulesForCapabilities(manifests, registry).catch((error) => {
        logger.error('App', 'Failed to re-initialize modules after capability change', error);
      });

      previousFeatures = [...currentFeatures];
    }
  });

  return unsubscribe;
}

// ============================================
// EXPORTS
// ============================================

// All functions are already exported above with `export function`
// No need for additional export block to avoid duplication
