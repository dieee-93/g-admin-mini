import { describe, it, expect, vi } from 'vitest';
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  featureActivation: {
    avg: 50, // 50ms average
    max: 200, // 200ms max for single run
  },
  moduleFiltering: {
    avg: 30, // 30ms average
    max: 100, // 100ms max
  },
};

describe('Performance Tests - Capability → Navigation Integration', () => {
  it('should activate features in less than 50ms on average', () => {
    const iterations = 100;
    const times: number[] = [];

    // Warm up (exclude from measurements)
    for (let i = 0; i < 10; i++) {
      FeatureActivationEngine.activateFeatures(['physical_products'], [
        'single_location',
      ]);
    }

    // Measure performance
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      FeatureActivationEngine.activateFeatures(
        ['physical_products', 'professional_services'],
        ['single_location']
      );

      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    console.log(`Feature Activation Performance:
      Avg: ${avgTime.toFixed(2)}ms
      Max: ${maxTime.toFixed(2)}ms
      Min: ${Math.min(...times).toFixed(2)}ms
      Threshold Avg: ${PERFORMANCE_THRESHOLDS.featureActivation.avg}ms
      Threshold Max: ${PERFORMANCE_THRESHOLDS.featureActivation.max}ms`);

    // Assertions
    expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.featureActivation.avg);
    expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.featureActivation.max);
  });

  it('should filter modules efficiently (< 30ms avg)', () => {
    const iterations = 100;
    const times: number[] = [];

    // Pre-compute active features
    const { activeFeatures } = FeatureActivationEngine.activateFeatures(
      ['physical_products', 'professional_services', 'food_beverage'],
      ['single_location']
    );

    // Warm up
    for (let i = 0; i < 10; i++) {
      getModulesForActiveFeatures(activeFeatures);
    }

    // Measure performance
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      getModulesForActiveFeatures(activeFeatures);

      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    console.log(`Module Filtering Performance:
      Avg: ${avgTime.toFixed(2)}ms
      Max: ${maxTime.toFixed(2)}ms
      Min: ${Math.min(...times).toFixed(2)}ms
      Threshold Avg: ${PERFORMANCE_THRESHOLDS.moduleFiltering.avg}ms
      Threshold Max: ${PERFORMANCE_THRESHOLDS.moduleFiltering.max}ms`);

    // Assertions
    expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.moduleFiltering.avg);
    expect(maxTime).toBeLessThan(PERFORMANCE_THRESHOLDS.moduleFiltering.max);
  });

  it('should handle multiple capability combinations efficiently', () => {
    const testCases = [
      {
        name: 'Single capability',
        capabilities: ['physical_products'],
      },
      {
        name: 'Two capabilities',
        capabilities: ['physical_products', 'professional_services'],
      },
      {
        name: 'Three capabilities',
        capabilities: [
          'physical_products',
          'professional_services',
          'food_beverage',
        ],
      },
      {
        name: 'Four capabilities',
        capabilities: [
          'physical_products',
          'professional_services',
          'food_beverage',
          'rental_services',
        ],
      },
    ];

    testCases.forEach((testCase) => {
      const iterations = 50;
      const times: number[] = [];

      // Warm up
      for (let i = 0; i < 5; i++) {
        FeatureActivationEngine.activateFeatures(testCase.capabilities as any, [
          'single_location',
        ]);
      }

      // Measure
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        FeatureActivationEngine.activateFeatures(testCase.capabilities as any, [
          'single_location',
        ]);
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      console.log(
        `${testCase.name}: ${avgTime.toFixed(2)}ms avg (${testCase.capabilities.length} capabilities)`
      );

      // All combinations should be fast
      expect(avgTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.featureActivation.avg
      );
    });
  });

  it('should not have performance degradation over time', () => {
    const batchSize = 20;
    const batches = 5;
    const batchAvgs: number[] = [];

    for (let batch = 0; batch < batches; batch++) {
      const times: number[] = [];

      for (let i = 0; i < batchSize; i++) {
        const start = performance.now();

        FeatureActivationEngine.activateFeatures(
          ['physical_products', 'professional_services'],
          ['single_location']
        );

        const end = performance.now();
        times.push(end - start);
      }

      const batchAvg = times.reduce((a, b) => a + b, 0) / times.length;
      batchAvgs.push(batchAvg);
    }

    console.log(`Performance over time (batches):
      Batch 1: ${batchAvgs[0].toFixed(2)}ms
      Batch 2: ${batchAvgs[1].toFixed(2)}ms
      Batch 3: ${batchAvgs[2].toFixed(2)}ms
      Batch 4: ${batchAvgs[3].toFixed(2)}ms
      Batch 5: ${batchAvgs[4].toFixed(2)}ms`);

    // Check that performance doesn't degrade significantly
    const firstBatch = batchAvgs[0];
    const lastBatch = batchAvgs[batchAvgs.length - 1];
    const degradation = ((lastBatch - firstBatch) / firstBatch) * 100;

    console.log(`Performance degradation: ${degradation.toFixed(2)}%`);

    // Performance should not degrade by more than 20%
    expect(degradation).toBeLessThan(20);
  });
});
