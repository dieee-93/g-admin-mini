/**
 * Capability Test Utilities
 *
 * Shared utilities and helpers for capability system tests
 * @version 1.0.0
 */

import type { BusinessCapabilityId, InfrastructureId, FeatureId } from '@/config/types';
import { BUSINESS_CAPABILITIES_REGISTRY, INFRASTRUCTURE_REGISTRY } from '@/config/BusinessModelRegistry';
import { FEATURE_REGISTRY, getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import { CORE_MODULES } from '@/lib/modules/constants';

// ============================================
// CONSTANTS & FIXTURES
// ============================================

/**
 * All capability IDs in the system
 */
export const ALL_CAPABILITY_IDS: BusinessCapabilityId[] = Object.keys(
  BUSINESS_CAPABILITIES_REGISTRY
) as BusinessCapabilityId[];

/**
 * All infrastructure IDs in the system
 */
export const ALL_INFRASTRUCTURE_IDS: InfrastructureId[] = Object.keys(
  INFRASTRUCTURE_REGISTRY
) as InfrastructureId[];

/**
 * All feature IDs defined in the system
 */
export const ALL_FEATURE_IDS: FeatureId[] = Object.keys(FEATURE_REGISTRY) as FeatureId[];

/**
 * Real-world business scenarios for testing
 */
export const BUSINESS_SCENARIOS = [
  {
    name: 'Restaurant Full Service',
    capabilities: ['physical_products', 'onsite_service', 'pickup_orders', 'delivery_shipping'] as BusinessCapabilityId[],
    infrastructure: ['single_location'] as InfrastructureId[],
    expectedModules: ['production', 'materials', 'sales', 'operations', 'products']
  },
  {
    name: 'Spa with Memberships',
    capabilities: ['professional_services', 'membership_subscriptions', 'onsite_service'] as BusinessCapabilityId[],
    infrastructure: ['single_location'] as InfrastructureId[],
    expectedModules: ['scheduling', 'customers', 'staff', 'sales']
  },
  {
    name: 'E-commerce Pure Play',
    capabilities: ['physical_products', 'async_operations', 'delivery_shipping', 'digital_products'] as BusinessCapabilityId[],
    infrastructure: ['single_location'] as InfrastructureId[],
    expectedModules: ['sales', 'materials', 'products', 'operations']
  },
  {
    name: 'B2B Distributor',
    capabilities: ['physical_products', 'corporate_sales', 'delivery_shipping'] as BusinessCapabilityId[],
    infrastructure: ['multi_location'] as InfrastructureId[],
    expectedModules: ['sales', 'materials', 'suppliers', 'products', 'operations']
  },
  {
    name: 'Food Truck',
    capabilities: ['physical_products', 'mobile_operations'] as BusinessCapabilityId[],
    infrastructure: ['mobile_business'] as InfrastructureId[],
    expectedModules: ['production', 'materials', 'products', 'sales']
  },
  {
    name: 'Multi-location Chain',
    capabilities: ['physical_products', 'onsite_service', 'pickup_orders'] as BusinessCapabilityId[],
    infrastructure: ['multi_location'] as InfrastructureId[],
    expectedModules: ['production', 'materials', 'sales', 'operations', 'products']
  }
] as const;

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Analyzes which features are shared across multiple capabilities
 * Returns a map of feature -> capabilities that activate it
 */
export function analyzeFeatureSharing(): Record<string, { count: number; activatedBy: string[] }> {
  const featureMap: Record<string, string[]> = {};

  // Collect from capabilities
  Object.entries(BUSINESS_CAPABILITIES_REGISTRY).forEach(([capId, capability]) => {
    capability.activatesFeatures.forEach(featureId => {
      if (!featureMap[featureId]) {
        featureMap[featureId] = [];
      }
      featureMap[featureId].push(`capability:${capId}`);
    });
  });

  // Collect from infrastructure
  Object.entries(INFRASTRUCTURE_REGISTRY).forEach(([infraId, infra]) => {
    infra.activatesFeatures.forEach(featureId => {
      if (!featureMap[featureId]) {
        featureMap[featureId] = [];
      }
      featureMap[featureId].push(`infrastructure:${infraId}`);
    });
  });

  // Convert to result format
  const result: Record<string, { count: number; activatedBy: string[] }> = {};
  Object.entries(featureMap).forEach(([featureId, activators]) => {
    result[featureId] = {
      count: activators.length,
      activatedBy: activators
    };
  });

  return result;
}

/**
 * Finds pairs of capabilities with identical feature sets
 */
export function findCapabilitiesWithIdenticalFeatures(): Array<{
  capability1: string;
  capability2: string;
  sharedFeatures: string[];
}> {
  const duplicatePairs: Array<{
    capability1: string;
    capability2: string;
    sharedFeatures: string[];
  }> = [];

  const capabilityIds = ALL_CAPABILITY_IDS;

  for (let i = 0; i < capabilityIds.length; i++) {
    for (let j = i + 1; j < capabilityIds.length; j++) {
      const cap1 = BUSINESS_CAPABILITIES_REGISTRY[capabilityIds[i]];
      const cap2 = BUSINESS_CAPABILITIES_REGISTRY[capabilityIds[j]];

      const features1 = new Set(cap1.activatesFeatures);
      const features2 = new Set(cap2.activatesFeatures);

      // Check if sets are identical
      if (
        features1.size === features2.size &&
        [...features1].every(f => features2.has(f))
      ) {
        duplicatePairs.push({
          capability1: capabilityIds[i],
          capability2: capabilityIds[j],
          sharedFeatures: cap1.activatesFeatures
        });
      }
    }
  }

  return duplicatePairs;
}

/**
 * Collects all features that can be activated by any capability/infrastructure
 */
export function collectAllActivatableFeatures(): FeatureId[] {
  const allFeatures = new Set<FeatureId>();

  // From capabilities
  Object.values(BUSINESS_CAPABILITIES_REGISTRY).forEach(capability => {
    capability.activatesFeatures.forEach(f => allFeatures.add(f));
  });

  // From infrastructure
  Object.values(INFRASTRUCTURE_REGISTRY).forEach(infra => {
    infra.activatesFeatures.forEach(f => allFeatures.add(f));
  });

  return Array.from(allFeatures);
}

/**
 * Gets expected modules for a given capability based on its features
 */
export function getExpectedModulesForCapability(capabilityId: BusinessCapabilityId): string[] {
  const capability = BUSINESS_CAPABILITIES_REGISTRY[capabilityId];
  const modules = getModulesForActiveFeatures(capability.activatesFeatures);

  // Always include CORE modules
  const coreModulesArray = Array.from(CORE_MODULES);
  return [...new Set([...coreModulesArray, ...modules])];
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates that all feature references in capabilities exist in FEATURE_REGISTRY
 */
export function validateFeatureReferences(): Array<{
  source: string;
  invalidFeature: string;
}> {
  const invalidReferences: Array<{
    source: string;
    invalidFeature: string;
  }> = [];

  // Check capabilities
  Object.entries(BUSINESS_CAPABILITIES_REGISTRY).forEach(([capId, capability]) => {
    capability.activatesFeatures.forEach(featureId => {
      if (!FEATURE_REGISTRY[featureId]) {
        invalidReferences.push({
          source: `capability:${capId}`,
          invalidFeature: featureId
        });
      }
    });
  });

  // Check infrastructure
  Object.entries(INFRASTRUCTURE_REGISTRY).forEach(([infraId, infra]) => {
    infra.activatesFeatures.forEach(featureId => {
      if (!FEATURE_REGISTRY[featureId]) {
        invalidReferences.push({
          source: `infrastructure:${infraId}`,
          invalidFeature: featureId
        });
      }
    });
  });

  return invalidReferences;
}

/**
 * Finds features that are defined but never activated
 */
export function findOrphanedFeatures(): FeatureId[] {
  const allDefinedFeatures = ALL_FEATURE_IDS;
  const allActivatedFeatures = collectAllActivatableFeatures();

  return allDefinedFeatures.filter(
    feature => !allActivatedFeatures.includes(feature)
  );
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

export interface BenchmarkResult {
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  measurements: number[];
}

/**
 * Benchmarks an operation multiple times and returns statistics
 */
export function benchmarkOperation(
  operation: () => void,
  iterations: number = 100
): BenchmarkResult {
  const measurements: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    operation();
    measurements.push(performance.now() - start);
  }

  measurements.sort((a, b) => a - b);

  const sum = measurements.reduce((a, b) => a + b, 0);
  const avg = sum / measurements.length;
  const min = measurements[0];
  const max = measurements[measurements.length - 1];

  const p50 = measurements[Math.floor(measurements.length * 0.5)];
  const p95 = measurements[Math.floor(measurements.length * 0.95)];
  const p99 = measurements[Math.floor(measurements.length * 0.99)];

  return {
    avg,
    min,
    max,
    p50,
    p95,
    p99,
    measurements
  };
}

/**
 * Calculates average of an array of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Performs warmup runs before benchmarking
 */
export function warmupOperation(operation: () => void, runs: number = 3): void {
  for (let i = 0; i < runs; i++) {
    operation();
  }
}

/**
 * Checks for memory leaks by comparing heap size before/after operations
 * Note: Only works in Chrome/Chromium with --expose-gc flag
 */
export function checkMemoryLeak(
  operation: () => void,
  iterations: number = 20
): { initialMemory: number; finalMemory: number; growth: number } | null {
  // @ts-ignore - performance.memory is Chrome-specific
  if (!performance.memory) {
    return null;
  }

  // @ts-ignore
  const initialMemory = performance.memory.usedJSHeapSize;

  for (let i = 0; i < iterations; i++) {
    operation();
  }

  // @ts-ignore
  const finalMemory = performance.memory.usedJSHeapSize;
  const growth = finalMemory - initialMemory;

  return { initialMemory, finalMemory, growth };
}

// ============================================
// TEST HELPERS
// ============================================

/**
 * Helper to get active modules from store (avoids import issues in tests)
 */
export function getActiveModulesFromStore(store: any): string[] {
  return store.getState().getActiveModules();
}

/**
 * Creates a test profile initialization payload
 */
export function createTestProfile(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[] = ['single_location']
) {
  return {
    businessName: 'Test Business',
    businessType: 'test' as any,
    email: 'test@example.com',
    phone: '555-0100',
    country: 'Argentina',
    currency: 'ARS',
    selectedCapabilities: capabilities,
    selectedInfrastructure: infrastructure
  };
}
