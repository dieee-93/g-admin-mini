/**
 * MODULE REGISTRY BOOTSTRAP
 *
 * Handles module initialization with dependency resolution, topological sorting,
 * and circular dependency detection. Activates modules based on active features
 * from the CapabilityStore.
 *
 * FEATURES:
 * - Topological sort with Kahn's algorithm
 * - Circular dependency detection
 * - Feature-based module filtering
 * - Parallel setup execution where possible
 * - Performance tracking
 * - Graceful error handling
 *
 * USAGE:
 * ```typescript
 * import { initializeModules } from '@/lib/modules/bootstrap';
 * import { ModuleRegistry } from '@/lib/modules';
 *
 * const registry = ModuleRegistry.getInstance();
 * const result = await initializeModules(activeFeatures, registry);
 * ```
 *
 * @version 1.0.0
 * @see docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md
 */

import { logger } from '@/lib/logging';
import type { FeatureId } from '@/config/types';
import type {
  ModuleManifest,
  ModuleInitResult,
  TopologicalSortResult,
  ModuleValidationError,
  ModuleValidationResult,
  IModuleRegistry,
} from './types';
import { SecureEventProcessor } from '@/lib/events/utils/SecureEventProcessor';

// ============================================
// TOPOLOGICAL SORT (Kahn's Algorithm)
// ============================================

/**
 * Performs topological sort on module manifests
 *
 * Orders modules so that dependencies are registered before dependent modules.
 * Detects circular dependencies during sorting.
 *
 * @param manifests - Array of module manifests to sort
 * @returns Sort result with ordered modules and detected cycles
 *
 * @example
 * const result = topologicalSort(manifests);
 * if (result.cycles.length > 0) {
 *   console.error('Circular dependencies:', result.cycles);
 * }
 */
export function topologicalSort(manifests: ModuleManifest[]): TopologicalSortResult {
  const startTime = performance.now();

  // Build adjacency list and in-degree map
  const graph = new Map<string, string[]>(); // moduleId -> dependencies
  const inDegree = new Map<string, number>(); // moduleId -> number of dependencies
  const moduleMap = new Map<string, ModuleManifest>();

  // Initialize data structures
  for (const manifest of manifests) {
    graph.set(manifest.id, manifest.depends);
    inDegree.set(manifest.id, manifest.depends.length);
    moduleMap.set(manifest.id, manifest);
  }

  // Find nodes with no dependencies (in-degree = 0)
  const queue: string[] = [];
  for (const [moduleId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(moduleId);
    }
  }

  // Kahn's algorithm
  const sorted: ModuleManifest[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const manifest = moduleMap.get(current);

    if (!manifest) continue;

    sorted.push(manifest);
    visited.add(current);

    // Process dependents (modules that depend on current)
    for (const [moduleId, dependencies] of graph.entries()) {
      if (dependencies.includes(current) && !visited.has(moduleId)) {
        // Decrease in-degree
        const currentDegree = inDegree.get(moduleId)!;
        inDegree.set(moduleId, currentDegree - 1);

        // If all dependencies resolved, add to queue
        if (inDegree.get(moduleId) === 0) {
          queue.push(moduleId);
        }
      }
    }
  }

  // Detect circular dependencies
  const cycles: string[][] = [];

  if (sorted.length < manifests.length) {
    // Find unvisited nodes (part of cycles)
    const unvisited = manifests.filter((m) => !visited.has(m.id));

    // Detect cycles using DFS
    const visiting = new Set<string>();
    const cycleDetected = new Set<string>();

    function detectCycle(moduleId: string, path: string[]): void {
      if (cycleDetected.has(moduleId)) return;

      if (visiting.has(moduleId)) {
        // Cycle found - extract cycle from path
        const cycleStart = path.indexOf(moduleId);
        const cycle = path.slice(cycleStart).concat(moduleId);
        cycles.push(cycle);
        cycleDetected.add(moduleId);
        return;
      }

      visiting.add(moduleId);
      path.push(moduleId);

      const dependencies = graph.get(moduleId) || [];
      for (const depId of dependencies) {
        if (graph.has(depId)) {
          detectCycle(depId, [...path]);
        }
      }

      visiting.delete(moduleId);
    }

    for (const module of unvisited) {
      if (!cycleDetected.has(module.id)) {
        detectCycle(module.id, []);
      }
    }

    logger.error('App', `Circular dependencies detected in ${unvisited.length} modules`, {
      unvisited: unvisited.map((m) => m.id),
      cycles,
    });
  }

  const duration = performance.now() - startTime;
  logger.performance('App', 'Topological sort', duration);

  return {
    sorted,
    cycles,
  };
}

// ============================================
// CIRCULAR DEPENDENCY DETECTION
// ============================================

/**
 * Detects circular dependencies in module manifests
 *
 * Uses depth-first search to find cycles in the dependency graph.
 *
 * @param manifests - Array of module manifests to check
 * @returns Array of detected cycles (each cycle is an array of module IDs)
 *
 * @example
 * const cycles = detectCircularDependencies(manifests);
 * if (cycles.length > 0) {
 *   cycles.forEach(cycle => {
 *     console.error('Cycle:', cycle.join(' -> '));
 *   });
 * }
 */
export function detectCircularDependencies(manifests: ModuleManifest[]): string[][] {
  const startTime = performance.now();
  const cycles: string[][] = [];

  // Build dependency graph
  const graph = new Map<string, string[]>();
  for (const manifest of manifests) {
    graph.set(manifest.id, manifest.depends);
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  /**
   * DFS to detect cycles
   */
  function dfs(moduleId: string, path: string[]): void {
    if (visited.has(moduleId)) return;

    if (visiting.has(moduleId)) {
      // Cycle detected
      const cycleStart = path.indexOf(moduleId);
      const cycle = path.slice(cycleStart).concat(moduleId);
      cycles.push(cycle);
      return;
    }

    visiting.add(moduleId);
    path.push(moduleId);

    const dependencies = graph.get(moduleId) || [];
    for (const depId of dependencies) {
      if (graph.has(depId)) {
        dfs(depId, [...path]);
      }
    }

    visiting.delete(moduleId);
    visited.add(moduleId);
  }

  // Start DFS from each node
  for (const manifest of manifests) {
    if (!visited.has(manifest.id)) {
      dfs(manifest.id, []);
    }
  }

  const duration = performance.now() - startTime;
  logger.performance('App', 'Circular dependency detection', duration);

  if (cycles.length > 0) {
    logger.warn('App', `Detected ${cycles.length} circular dependencies`, { cycles });
  }

  return cycles;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validates a batch of module manifests
 *
 * Checks for:
 * - Missing required fields
 * - Invalid dependency references
 * - Circular dependencies
 * - Missing features
 *
 * @param manifests - Array of module manifests to validate
 * @returns Validation result with errors and warnings
 */
export function validateModuleManifests(manifests: ModuleManifest[]): ModuleValidationResult {
  const startTime = performance.now();
  const errors: ModuleValidationError[] = [];
  const warnings: string[] = [];

  // 1. Validate individual manifests
  for (const manifest of manifests) {
    // Required fields
    if (!manifest.id || typeof manifest.id !== 'string') {
      errors.push({
        moduleId: manifest.id || 'unknown',
        type: 'invalid_manifest',
        message: 'Module ID is required and must be a string',
      });
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push({
        moduleId: manifest.id,
        type: 'invalid_manifest',
        message: 'Module name is required and must be a string',
      });
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push({
        moduleId: manifest.id,
        type: 'invalid_manifest',
        message: 'Module version is required and must be a string',
      });
    }

    if (!Array.isArray(manifest.depends)) {
      errors.push({
        moduleId: manifest.id,
        type: 'invalid_manifest',
        message: 'Module depends must be an array',
      });
    }

    // NEW ARCHITECTURE: activatedBy is optional (CORE modules don't have it)
    // No need to validate - undefined means CORE module, string means OPTIONAL module
  }

  // 2. Validate dependency references
  const moduleIds = new Set(manifests.map((m) => m.id));

  for (const manifest of manifests) {
    for (const depId of manifest.depends) {
      if (!moduleIds.has(depId)) {
        errors.push({
          moduleId: manifest.id,
          type: 'missing_dependency',
          message: `Missing dependency: ${depId}`,
          details: { dependency: depId },
        });
      }
    }
  }

  // 3. Detect circular dependencies
  const cycles = detectCircularDependencies(manifests);
  for (const cycle of cycles) {
    errors.push({
      moduleId: cycle[0],
      type: 'circular_dependency',
      message: `Circular dependency detected: ${cycle.join(' -> ')}`,
      details: { cycle },
    });
  }

  const duration = performance.now() - startTime;
  logger.performance('App', 'Module manifest validation', duration);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize modules based on active features
 *
 * Main bootstrap function that:
 * 1. Filters manifests by active features
 * 2. Validates manifests
 * 3. Sorts modules topologically
 * 4. Registers modules in dependency order
 * 5. Tracks performance and errors
 *
 * @param activeFeatures - Array of active FeatureIds from CapabilityStore
 * @param registry - ModuleRegistry instance
 * @returns Initialization result with success/failure details
 *
 * @example
 * const result = await initializeModules(
 *   ['sales_order_management', 'inventory_stock_tracking'],
 *   registry
 * );
 *
 * console.log(`Initialized: ${result.initialized.length}`);
 * console.log(`Failed: ${result.failed.length}`);
 * console.log(`Skipped: ${result.skipped.length}`);
 */
export async function initializeModules(
  activeFeatures: FeatureId[],
  registry: IModuleRegistry,
  manifests: ModuleManifest[] = []
): Promise<ModuleInitResult> {
  const startTime = performance.now();

  logger.info('App', '🚀 Starting module initialization', {
    totalManifests: manifests.length,
    activeFeatures: activeFeatures.length,
  });

  // ============================================
  // STEP 1: Filter by active features (NEW ARCHITECTURE)
  // ============================================

  console.log('📋 [STEP 1] Filtering modules by active features:', {
    totalManifests: manifests.length,
    activeFeaturesCount: activeFeatures.length,
    activeFeatures: activeFeatures.slice(0, 10), // Show first 10 to avoid spam
  });

  let filterIndex = 0;
  const filteredManifests = manifests.filter((manifest) => {
    filterIndex++;
    
    // NEW ARCHITECTURE:
    // - CORE modules: activatedBy === undefined → always include
    // - OPTIONAL modules: activatedBy === FeatureId → include if feature is active
    
    if (!manifest.activatedBy) {
      // CORE module - always loaded
      console.log(`✅ [STEP 1.${filterIndex}] ${manifest.id}: CORE module (always loaded)`);
      return true;
    }

    // OPTIONAL module - check if activation feature is active
    const isActive = activeFeatures.includes(manifest.activatedBy);
    
    console.log(`${isActive ? '✅' : '❌'} [STEP 1.${filterIndex}] ${manifest.id}: activatedBy="${manifest.activatedBy}" isActive=${isActive}`);

    if (!isActive) {
      logger.debug('App', `Module "${manifest.id}" skipped - activation feature not active`, {
        activatedBy: manifest.activatedBy,
        activeFeatures: activeFeatures,
      });
      return false;
    }

    return true;
  });

  console.log('✅ [STEP 1] Filtering complete:', {
    filteredCount: filteredManifests.length,
    filteredIds: filteredManifests.map(m => m.id),
  });
  logger.info('App', `Filtered to ${filteredManifests.length} modules with required features`);

  // ============================================
  // STEP 2: Validate manifests
  // ============================================

  console.log('🔍 [STEP 2] Validating manifests...');
  const validation = validateModuleManifests(filteredManifests);

  if (!validation.valid) {
    logger.error('App', 'Module manifest validation failed', {
      errors: validation.errors,
      warnings: validation.warnings,
    });

    // Return early if critical errors
    const criticalErrors = validation.errors.filter(
      (e) => e.type === 'circular_dependency' || e.type === 'invalid_manifest'
    );

    if (criticalErrors.length > 0) {
      return {
        initialized: [],
        failed: criticalErrors.map((e) => ({
          moduleId: e.moduleId,
          error: new Error(e.message),
        })),
        skipped: manifests
          .filter((m) => !filteredManifests.find((fm) => fm.id === m.id))
          .map((m) => m.id),
        duration: performance.now() - startTime,
      };
    }
  }

  // Log warnings
  if (validation.warnings.length > 0) {
    validation.warnings.forEach((warning) => {
      logger.warn('App', warning);
    });
  }

  // ============================================
  // STEP 3: Topological sort
  // ============================================

  console.log('🔀 [STEP 3] Starting topological sort...');
  const sortResult = topologicalSort(filteredManifests);
  console.log('✅ [STEP 3] Sort complete:', {
    sortedCount: sortResult.sorted.length,
    sortedIds: sortResult.sorted.map(m => m.id),
    cycles: sortResult.cycles,
  });

  if (sortResult.cycles.length > 0) {
    logger.error('App', 'Cannot initialize modules - circular dependencies detected', {
      cycles: sortResult.cycles,
    });

    return {
      initialized: [],
      failed: sortResult.cycles.flatMap((cycle) =>
        cycle.map((moduleId) => ({
          moduleId,
          error: new Error(`Circular dependency: ${cycle.join(' -> ')}`),
        }))
      ),
      skipped: manifests
        .filter((m) => !filteredManifests.find((fm) => fm.id === m.id))
        .map((m) => m.id),
      duration: performance.now() - startTime,
    };
  }

  // ============================================
  // STEP 4: Register modules in dependency order
  // ============================================

  console.log('🔄 [STEP 4] Starting module registration loop:', {
    modulesToRegister: sortResult.sorted.length,
    moduleIds: sortResult.sorted.map(m => m.id),
  });

  const initialized: string[] = [];
  const failed: Array<{ moduleId: string; error: Error }> = [];
  const skipped: string[] = manifests
    .filter((m) => !filteredManifests.find((fm) => fm.id === m.id))
    .map((m) => m.id);

  for (const manifest of sortResult.sorted) {
    try {
      // Check if dependencies are initialized
      const missingDeps = manifest.depends.filter((depId) => !initialized.includes(depId));

      if (missingDeps.length > 0) {
        logger.warn('App', `Module "${manifest.id}" has uninitialized dependencies`, {
          missing: missingDeps,
        });

        // Skip if critical dependencies missing
        skipped.push(manifest.id);
        continue;
      }

      // Register module
      console.log(`🎯 [STEP 4] Attempting to register: ${manifest.id}`);
      logger.debug('App', `Registering module: ${manifest.id} v${manifest.version}`);

      const moduleStartTime = performance.now();
      await registry.register(manifest);
      console.log(`✅ [STEP 4] Successfully registered: ${manifest.id}`);
      const moduleDuration = performance.now() - moduleStartTime;

      initialized.push(manifest.id);

      logger.debug('App', `✅ Module registered: ${manifest.id}`, {
        duration: `${moduleDuration.toFixed(2)}ms`,
        depends: manifest.depends,
      });
    } catch (error) {
      logger.error('App', `❌ Failed to register module: ${manifest.id}`, error);

      failed.push({
        moduleId: manifest.id,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Continue with other modules (graceful degradation)
    }
  }

  // ============================================
  // STEP 5: Summary
  // ============================================

  const duration = performance.now() - startTime;

  logger.info('App', '🎉 Module initialization complete', {
    initialized: initialized.length,
    failed: failed.length,
    skipped: skipped.length,
    duration: `${duration.toFixed(2)}ms`,
  });

  if (failed.length > 0) {
    logger.warn('App', 'Some modules failed to initialize', {
      failed: failed.map((f) => f.moduleId),
    });
  }

  // ============================================
  // STEP 6: Mark initialization phase complete
  // ============================================

  // Switch EventBus from INITIALIZATION to RUNTIME phase
  // This enables normal timeout enforcement (30s module events, 5s regular events)
  // During INITIALIZATION, system events have no timeout to allow for legitimate
  // 10+ second startup time with 30 modules × 100+ subscriptions
  SecureEventProcessor.markInitializationComplete();

  return {
    initialized,
    failed,
    skipped,
    duration,
  };
}
