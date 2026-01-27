/**
 * Capability Performance Tests (Simplified for Pure Functions)
 *
 * Tests de performance para las funciones puras del sistema de capabilities:
 * - Activación de features (activateFeatures)
 * - Cálculo de módulos (getModulesForActiveFeatures)
 * - Benchmarks comparativos
 *
 * NOTE: Tests adaptados para arquitectura con funciones puras (no store)
 *
 * @version 2.0.0
 */

import { describe, it, expect } from 'vitest';
import { activateFeatures } from '@/lib/capabilities/featureActivationService';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import {
  ALL_CAPABILITY_IDS,
  ALL_INFRASTRUCTURE_IDS,
  benchmarkOperation,
  average
} from './helpers/capability-test-utils';

// ============================================
// 1. ACTIVACIÓN MASIVA
// ============================================

describe('Performance - Mass Activation', () => {
  describe('All Capabilities Activation', () => {
    it('should activate all 11 capabilities with reasonable performance', () => {
      const measurements: number[] = [];

      // Run 10 times to get stable average
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        const { activeFeatures } = activateFeatures(ALL_CAPABILITY_IDS, ['multi_location']);
        measurements.push(performance.now() - start);

        // Verify result is valid
        expect(activeFeatures.length).toBeGreaterThan(0);
      }

      const avgTime = average(measurements);
      const maxTime = Math.max(...measurements);

      console.log(`All capabilities activation - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);

      // Pure function should be very fast
      expect(avgTime).toBeLessThan(50); // Should be under 50ms average
      expect(maxTime).toBeLessThan(100); // Worst case under 100ms
    });

    it('should handle worst-case scenario efficiently', () => {
      // Worst case: ALL capabilities + ALL infrastructure
      const start = performance.now();

      const { activeFeatures } = activateFeatures(
        ALL_CAPABILITY_IDS,
        ALL_INFRASTRUCTURE_IDS
      );

      const elapsed = performance.now() - start;

      console.log(`Worst-case activation: ${elapsed.toFixed(2)}ms`);
      console.log(`Features activated: ${activeFeatures.length}`);

      expect(elapsed).toBeLessThan(100);
      expect(activeFeatures.length).toBeGreaterThan(50);
    });

    it('should calculate modules for maximum features efficiently', () => {
      // Activate all capabilities to get maximum features
      const { activeFeatures } = activateFeatures(ALL_CAPABILITY_IDS, ['multi_location']);

      const measurements: number[] = [];
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        const modules = getModulesForActiveFeatures(activeFeatures);
        measurements.push(performance.now() - start);

        // Verify result is valid
        expect(modules.length).toBeGreaterThan(0);
      }

      const avgTime = average(measurements);

      console.log(`Module calculation (${activeFeatures.length} features): ${avgTime.toFixed(3)}ms`);

      expect(avgTime).toBeLessThan(10); // Should be very fast
    });
  });

  describe('Incremental Activation Performance', () => {
    it('should maintain consistent performance across different capability counts', () => {
      const results: Array<{ count: number; time: number }> = [];

      // Test with 1, 3, 6, 11 capabilities
      const testSets = [
        ALL_CAPABILITY_IDS.slice(0, 1),
        ALL_CAPABILITY_IDS.slice(0, 3),
        ALL_CAPABILITY_IDS.slice(0, 6),
        ALL_CAPABILITY_IDS
      ];

      testSets.forEach(capabilities => {
        const measurements: number[] = [];

        for (let i = 0; i < 20; i++) {
          const start = performance.now();
          activateFeatures(capabilities, ['single_location']);
          measurements.push(performance.now() - start);
        }

        const avg = average(measurements);
        results.push({ count: capabilities.length, time: avg });
      });

      console.table(results.map(r => ({
        'Capabilities': r.count,
        'Avg Time (ms)': r.time.toFixed(2)
      })));

      // Performance should scale reasonably
      // 11 capabilities should not be more than 5x slower than 1
      const single = results[0].time;
      const all = results[results.length - 1].time;

      expect(all).toBeLessThan(single * 5);
    });
  });
});

// ============================================
// 2. OPERACIONES REPETITIVAS
// ============================================

describe('Performance - Repetitive Operations', () => {
  describe('Repeated Activation', () => {
    it('should handle 500 repeated activations without degradation', () => {
      const timings: number[] = [];

      // 500 repeated calls
      for (let i = 0; i < 500; i++) {
        const start = performance.now();
        activateFeatures(['physical_products', 'professional_services'], ['single_location']);
        timings.push(performance.now() - start);
      }

      // First 100 vs last 100
      const firstBatch = average(timings.slice(0, 100));
      const lastBatch = average(timings.slice(-100));

      console.log(`Repeated activations - First 100 avg: ${firstBatch.toFixed(2)}ms, Last 100 avg: ${lastBatch.toFixed(2)}ms`);

      // Performance should remain consistent (pure functions)
      expect(lastBatch).toBeLessThan(firstBatch * 1.5);
    });

    it('should handle many different capability combinations efficiently', () => {
      const combinations = [
        ['physical_products'],
        ['professional_services'],
        ['physical_products', 'onsite_service'],
        ['physical_products', 'professional_services', 'pickup_orders'],
        ALL_CAPABILITY_IDS.slice(0, 5),
        ALL_CAPABILITY_IDS
      ];

      const timings: number[] = [];

      // Test each combination 20 times
      combinations.forEach(caps => {
        for (let i = 0; i < 20; i++) {
          const start = performance.now();
          activateFeatures(caps, ['single_location']);
          timings.push(performance.now() - start);
        }
      });

      const avgTime = average(timings);

      console.log(`${timings.length} varied activations avg: ${avgTime.toFixed(2)}ms`);

      expect(avgTime).toBeLessThan(20);
    });
  });

  describe('Module Calculation Repeated', () => {
    it('should handle repeated module calculations without degradation', () => {
      const { activeFeatures } = activateFeatures(
        ['physical_products', 'professional_services', 'onsite_service'],
        ['single_location']
      );

      const timings: number[] = [];

      // 1000 repeated calculations
      for (let i = 0; i < 1000; i++) {
        const start = performance.now();
        getModulesForActiveFeatures(activeFeatures);
        timings.push(performance.now() - start);
      }

      const firstBatch = average(timings.slice(0, 200));
      const lastBatch = average(timings.slice(-200));

      console.log(`Module calculation - First 200 avg: ${firstBatch.toFixed(3)}ms, Last 200 avg: ${lastBatch.toFixed(3)}ms`);

      // Should remain consistent
      expect(lastBatch).toBeLessThan(firstBatch * 1.5);
    });
  });
});

// ============================================
// 3. BENCHMARKS COMPARATIVOS
// ============================================

describe('Performance - Benchmarks', () => {
  describe('Baseline Benchmarks', () => {
    it('BENCHMARK: single capability activation', () => {
      const results = benchmarkOperation(() => {
        activateFeatures(['physical_products'], ['single_location']);
      }, 200);

      console.table({
        'Single Capability Activation': {
          'Avg (ms)': results.avg.toFixed(3),
          'P50 (ms)': results.p50.toFixed(3),
          'P95 (ms)': results.p95.toFixed(3),
          'P99 (ms)': results.p99.toFixed(3),
          'Min (ms)': results.min.toFixed(3),
          'Max (ms)': results.max.toFixed(3)
        }
      });

      expect(results.p95).toBeLessThan(20);
      expect(results.avg).toBeLessThan(10);
    });

    it('BENCHMARK: multiple capabilities activation', () => {
      const results = benchmarkOperation(() => {
        activateFeatures(
          ['physical_products', 'professional_services', 'onsite_service'],
          ['single_location']
        );
      }, 200);

      console.table({
        'Three Capabilities Activation': {
          'Avg (ms)': results.avg.toFixed(3),
          'P95 (ms)': results.p95.toFixed(3),
          'P99 (ms)': results.p99.toFixed(3)
        }
      });

      expect(results.p95).toBeLessThan(30);
    });

    it('BENCHMARK: all capabilities activation', () => {
      const results = benchmarkOperation(() => {
        activateFeatures(ALL_CAPABILITY_IDS, ['multi_location']);
      }, 200);

      console.table({
        'All 11 Capabilities Activation': {
          'Avg (ms)': results.avg.toFixed(3),
          'P95 (ms)': results.p95.toFixed(3),
          'P99 (ms)': results.p99.toFixed(3)
        }
      });

      expect(results.p95).toBeLessThan(50);
      expect(results.avg).toBeLessThan(30);
    });

    it('BENCHMARK: module calculation for few features', () => {
      const { activeFeatures } = activateFeatures(
        ['physical_products'],
        ['single_location']
      );

      const results = benchmarkOperation(() => {
        getModulesForActiveFeatures(activeFeatures);
      }, 1000);

      console.table({
        'Module Calculation (Few Features)': {
          'Features': activeFeatures.length,
          'Avg (ms)': results.avg.toFixed(3),
          'P95 (ms)': results.p95.toFixed(3),
          'P99 (ms)': results.p99.toFixed(3)
        }
      });

      expect(results.p95).toBeLessThan(5);
      expect(results.avg).toBeLessThan(2);
    });

    it('BENCHMARK: module calculation for many features', () => {
      const { activeFeatures } = activateFeatures(
        ALL_CAPABILITY_IDS,
        ['multi_location']
      );

      const results = benchmarkOperation(() => {
        getModulesForActiveFeatures(activeFeatures);
      }, 1000);

      console.table({
        'Module Calculation (Many Features)': {
          'Features': activeFeatures.length,
          'Avg (ms)': results.avg.toFixed(3),
          'P95 (ms)': results.p95.toFixed(3),
          'P99 (ms)': results.p99.toFixed(3)
        }
      });

      expect(results.p95).toBeLessThan(10);
      expect(results.avg).toBeLessThan(5);
    });
  });

  describe('Comparative Benchmarks', () => {
    it('BENCHMARK: compare single vs all capability activation', () => {
      const singleResult = benchmarkOperation(() => {
        activateFeatures(['physical_products'], ['single_location']);
      }, 100);

      const allResult = benchmarkOperation(() => {
        activateFeatures(ALL_CAPABILITY_IDS, ['multi_location']);
      }, 100);

      const ratio = allResult.avg / singleResult.avg;

      console.table({
        'Single Capability': {
          'Avg (ms)': singleResult.avg.toFixed(3),
          'P95 (ms)': singleResult.p95.toFixed(3)
        },
        'All 11 Capabilities': {
          'Avg (ms)': allResult.avg.toFixed(3),
          'P95 (ms)': allResult.p95.toFixed(3)
        },
        'Performance Ratio': {
          'Avg (ms)': ratio.toFixed(2) + 'x',
          'P95 (ms)': (allResult.p95 / singleResult.p95).toFixed(2) + 'x'
        }
      });

      // All should not be more than 15x slower than single
      expect(ratio).toBeLessThan(15);
    });

    it('BENCHMARK: feature activation vs module calculation', () => {
      const { activeFeatures } = activateFeatures(
        ['physical_products', 'professional_services'],
        ['single_location']
      );

      const activationResult = benchmarkOperation(() => {
        activateFeatures(
          ['physical_products', 'professional_services'],
          ['single_location']
        );
      }, 200);

      const moduleCalcResult = benchmarkOperation(() => {
        getModulesForActiveFeatures(activeFeatures);
      }, 200);

      console.table({
        'Feature Activation': {
          'Avg (ms)': activationResult.avg.toFixed(3),
          'P95 (ms)': activationResult.p95.toFixed(3)
        },
        'Module Calculation': {
          'Avg (ms)': moduleCalcResult.avg.toFixed(3),
          'P95 (ms)': moduleCalcResult.p95.toFixed(3)
        }
      });

      // Both operations should be fast
      expect(activationResult.p95).toBeLessThan(30);
      expect(moduleCalcResult.p95).toBeLessThan(10);
    });
  });

  describe('Scalability Tests', () => {
    it('should document performance scaling with capability count', () => {
      const results: Array<{ capabilities: number; avgTime: number; p95Time: number }> = [];

      for (let count = 1; count <= ALL_CAPABILITY_IDS.length; count += 2) {
        const caps = ALL_CAPABILITY_IDS.slice(0, count);

        const benchmark = benchmarkOperation(() => {
          activateFeatures(caps, ['single_location']);
        }, 50);

        results.push({
          capabilities: count,
          avgTime: benchmark.avg,
          p95Time: benchmark.p95
        });
      }

      console.log('\nPerformance Scaling:');
      console.table(results.map(r => ({
        'Capabilities': r.capabilities,
        'Avg (ms)': r.avgTime.toFixed(3),
        'P95 (ms)': r.p95Time.toFixed(3)
      })));

      // This is informational - documents how performance scales
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
