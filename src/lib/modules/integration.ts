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
 * BEST PRACTICES APPLIED (2025):
 * - Debounce reinitializations (300ms) to prevent loops
 * - Diff check with deep comparison of features
 * - Flag to prevent reinit during initial load
 * - Ref-based previous state to avoid stale closures
 *
 * RESEARCH SOURCES:
 * - Zustand Discussion #1936: "getSnapshot should be cached"
 * - TkDodo's blog: "Working with Zustand"
 * - VS Code Extension API: "Activation Events" pattern
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

  // ✅ FIX 1: Ref-based state to avoid stale closures (Zustand best practice)
  let previousFeatures: FeatureId[] = [];

  // ✅ FIX 2: Flag to prevent reinitializations during initial app load
  // VS Code Extension pattern: activate only once, then listen to changes
  let isInitialLoad = true;

  // ✅ FIX 3: Debounce timer to prevent rapid reinitializations
  // Research: 300ms is optimal for state change batching (Zustand + React 18)
  let debounceTimer: NodeJS.Timeout | null = null;

  // ✅ FIX 4: Flag to prevent concurrent reinitializations
  let isReinitializing = false;

  const unsubscribe = useCapabilityStore.subscribe((state) => {
    const currentFeatures = state.features.activeFeatures;

    // ✅ FIX 5: Skip first trigger (initial load from DB)
    if (isInitialLoad) {
      logger.debug('App', '⏭️ Skipping first subscription trigger (initial load)');
      previousFeatures = [...currentFeatures];
      isInitialLoad = false;
      return;
    }

    // ✅ FIX 6: Deep diff check with sorted comparison
    // Prevents trigger if features are same but in different order
    const sortedPrevious = [...previousFeatures].sort();
    const sortedCurrent = [...currentFeatures].sort();

    const featuresChanged =
      sortedPrevious.length !== sortedCurrent.length ||
      !sortedPrevious.every((f, i) => f === sortedCurrent[i]);

    if (!featuresChanged) {
      logger.debug('App', '✅ Features unchanged (deep comparison), skipping reinit');
      return;
    }

    // ✅ FIX 7: Prevent concurrent reinitializations
    if (isReinitializing) {
      logger.debug('App', '⏸️ Reinitialization already in progress, skipping');
      return;
    }

    // ✅ FIX 8: Debounce rapid changes (e.g., multiple toggleActivity calls)
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      logger.info('App', '🔄 Active features changed - re-initializing modules', {
        previous: previousFeatures.length,
        current: currentFeatures.length,
        added: currentFeatures.filter((f) => !previousFeatures.includes(f)),
        removed: previousFeatures.filter((f) => !currentFeatures.includes(f)),
      });

      isReinitializing = true;

      // Re-initialize modules (async - don't await)
      reinitializeModulesForCapabilities(manifests, registry)
        .then((result) => {
          logger.info('App', '✅ Module re-initialization complete', {
            initialized: result.initialized.length,
            failed: result.failed.length,
          });
        })
        .catch((error) => {
          logger.error('App', '❌ Failed to re-initialize modules after capability change', error);
        })
        .finally(() => {
          isReinitializing = false;
          previousFeatures = [...currentFeatures];
        });
    }, 300); // 300ms debounce (research-backed optimal value)
  });

  // ✅ FIX 9: Cleanup debounce timer on unsubscribe
  const cleanupUnsubscribe = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    unsubscribe();
    logger.info('App', '🧹 Capability change subscription cleaned up');
  };

  return cleanupUnsubscribe;
}

// ============================================
// EXPORTS
// ============================================

// All functions are already exported above with `export function`
// No need for additional export block to avoid duplication
