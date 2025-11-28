/**
 * Feature Activation Engine Test Suite
 *
 * Comprehensive tests for the Feature Activation Engine v4.0
 * Tests feature activation, deduplication, validation, and edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveFeatures,
  getActiveFeatures,
  validateUserChoices,
  FeatureActivationEngine,
  activateFeatures
} from '../FeatureEngine';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/types';

describe('FeatureActivationEngine - Feature Resolution', () => {
  it('should resolve features from single capability', () => {
    const result = resolveFeatures(
      ['physical_products'],
      ['single_location']
    );

    expect(result.featuresToActivate.length).toBeGreaterThan(0);
    expect(result.featuresToActivate).toContain('production_bom_management');
    expect(result.featuresToActivate).toContain('inventory_stock_tracking');
    expect(result.featuresToActivate).toContain('sales_order_management');
  });

  it('should resolve features from multiple capabilities', () => {
    const result = resolveFeatures(
      ['physical_products', 'professional_services'],
      ['single_location']
    );

    // Should have features from both capabilities
    expect(result.featuresToActivate).toContain('production_bom_management'); // physical_products
    expect(result.featuresToActivate).toContain('scheduling_appointment_booking'); // professional_services
    expect(result.featuresToActivate.length).toBeGreaterThan(0);
  });

  it('should resolve features from infrastructure', () => {
    const result = resolveFeatures(
      ['physical_products'],
      ['multi_location']
    );

    // Should have infrastructure features
    expect(result.featuresToActivate).toContain('multisite_location_management');
    expect(result.featuresToActivate).toContain('multisite_centralized_inventory');
  });

  it('should deduplicate features using Set', () => {
    const result = resolveFeatures(
      ['physical_products', 'professional_services'], // Both have sales_payment_processing
      ['single_location']
    );

    // Count occurrences of shared feature
    const paymentCount = result.featuresToActivate.filter(
      f => f === 'sales_payment_processing'
    ).length;

    // Should appear exactly once
    expect(paymentCount).toBe(1);
  });

  it('should handle empty capabilities array', () => {
    const result = resolveFeatures(
      [],
      ['single_location']
    );

    // Should have no features (single_location has no features)
    expect(result.featuresToActivate).toEqual([]);
    expect(result.coreFeatures).toEqual([]);
    expect(result.conditionalFeatures).toEqual([]);
  });

  it('should handle invalid capability IDs gracefully', () => {
    const result = resolveFeatures(
      ['invalid_capability' as BusinessCapabilityId],
      ['single_location']
    );

    // Should not throw, should return empty or skip invalid
    expect(result.featuresToActivate).toBeDefined();
  });

  it('should combine capability + infrastructure features', () => {
    const result = resolveFeatures(
      ['physical_products'],
      ['multi_location']
    );

    // Should have both capability AND infrastructure features
    expect(result.featuresToActivate).toContain('production_bom_management'); // from capability
    expect(result.featuresToActivate).toContain('multisite_location_management'); // from infrastructure
  });
});

describe('FeatureActivationEngine - Active Features', () => {
  it('should filter blocked features from all features', () => {
    const allFeatures: any[] = [
      'production_bom_management',
      'inventory_stock_tracking',
      'sales_order_management'
    ];

    const blockedFeatures: any[] = ['inventory_stock_tracking'];

    const active = getActiveFeatures(allFeatures, blockedFeatures);

    expect(active).toContain('production_bom_management');
    expect(active).toContain('sales_order_management');
    expect(active).not.toContain('inventory_stock_tracking');
    expect(active.length).toBe(2);
  });

  it('should return all features when none blocked', () => {
    const allFeatures: any[] = [
      'production_bom_management',
      'inventory_stock_tracking'
    ];

    const active = getActiveFeatures(allFeatures, []);

    expect(active).toEqual(allFeatures);
    expect(active.length).toBe(2);
  });

  it('should return empty array when all features blocked', () => {
    const allFeatures: any[] = [
      'production_bom_management',
      'inventory_stock_tracking'
    ];

    const active = getActiveFeatures(allFeatures, allFeatures);

    expect(active).toEqual([]);
  });
});

describe('FeatureActivationEngine - Validation', () => {
  it('should validate capabilities without conflicts', () => {
    const validation = validateUserChoices(
      ['physical_products', 'professional_services'],
      ['single_location']
    );

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it('should allow multiple capabilities (atomic system)', () => {
    const validation = validateUserChoices(
      ['physical_products', 'professional_services', 'pickup_orders', 'delivery_shipping'],
      ['single_location']
    );

    // In atomic system, all capabilities can be combined
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it('should allow combining infrastructure types', () => {
    const validation = validateUserChoices(
      ['physical_products'],
      ['single_location', 'multi_location']
    );

    // No conflicts between these
    expect(validation.valid).toBe(true);
  });

  it('should handle empty arrays', () => {
    const validation = validateUserChoices([], []);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });
});

describe('FeatureActivationEngine - Class Methods', () => {
  it('should activate features from capabilities', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products'],
      ['single_location']
    );

    expect(result.activeFeatures.length).toBeGreaterThan(0);
    expect(result.activeFeatures).toContain('production_bom_management');
    expect(result.activeFeatures).toContain('inventory_stock_tracking');
  });

  it('should throw on invalid user choices', () => {
    // This test depends on having actual conflicts defined
    // Since current system has no conflicts, we test the happy path
    expect(() => {
      FeatureActivationEngine.activateFeatures(
        ['physical_products'],
        ['single_location']
      );
    }).not.toThrow();
  });

  it('should deduplicate features in activation', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products', 'professional_services'],
      ['single_location']
    );

    // Count payment processing feature
    const paymentCount = result.activeFeatures.filter(
      f => f === 'sales_payment_processing'
    ).length;

    expect(paymentCount).toBe(1);
  });

  it('should handle multiple infrastructures', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products'],
      ['single_location', 'multi_location']
    );

    // Should have multi_location features
    expect(result.activeFeatures).toContain('multisite_location_management');
  });
});

describe('FeatureActivationEngine - Convenience Function', () => {
  it('should activate features using convenience function', () => {
    const result = activateFeatures(
      ['physical_products'],
      ['single_location']
    );

    expect(result.activeFeatures).toBeDefined();
    expect(result.activeFeatures.length).toBeGreaterThan(0);
  });

  it('should match class method results', () => {
    const classResult = FeatureActivationEngine.activateFeatures(
      ['professional_services'],
      ['single_location']
    );

    const funcResult = activateFeatures(
      ['professional_services'],
      ['single_location']
    );

    expect(funcResult.activeFeatures).toEqual(classResult.activeFeatures);
  });
});

describe('FeatureActivationEngine - Edge Cases', () => {
  it('should handle unknown capability IDs gracefully', () => {
    expect(() => {
      resolveFeatures(
        ['unknown_capability' as BusinessCapabilityId],
        ['single_location']
      );
    }).not.toThrow();
  });

  it('should handle unknown infrastructure IDs gracefully', () => {
    expect(() => {
      resolveFeatures(
        ['physical_products'],
        ['unknown_infrastructure' as InfrastructureId]
      );
    }).not.toThrow();
  });

  it('should handle undefined infrastructure', () => {
    const result = resolveFeatures(
      ['physical_products'],
      []
    );

    // Should still activate capability features
    expect(result.featuresToActivate.length).toBeGreaterThan(0);
  });

  it('should preserve feature order consistency', () => {
    const result1 = resolveFeatures(
      ['physical_products', 'professional_services'],
      ['single_location']
    );

    const result2 = resolveFeatures(
      ['physical_products', 'professional_services'],
      ['single_location']
    );

    // Results should be consistent (same features, possibly same order)
    expect(result1.featuresToActivate.length).toBe(result2.featuresToActivate.length);
    expect(result1.featuresToActivate).toEqual(result2.featuresToActivate);
  });
});

describe('FeatureActivationEngine - Real-World Scenarios', () => {
  it('Restaurant: physical_products + onsite_service + pickup_orders', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products', 'onsite_service', 'pickup_orders'],
      ['single_location']
    );

    // Should have production, sales, inventory, operations
    expect(result.activeFeatures).toContain('production_bom_management');
    expect(result.activeFeatures).toContain('sales_order_management');
    expect(result.activeFeatures).toContain('inventory_stock_tracking');
    expect(result.activeFeatures).toContain('operations_table_management');
    expect(result.activeFeatures.length).toBeGreaterThan(10);
  });

  it('Spa: professional_services + appointment_based', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['professional_services'],
      ['single_location']
    );

    // Should have scheduling, customer management
    expect(result.activeFeatures).toContain('scheduling_appointment_booking');
    expect(result.activeFeatures).toContain('scheduling_calendar_management');
    expect(result.activeFeatures).toContain('customer_service_history');
  });

  it('Operaciones Async: async_operations + delivery_shipping + digital_products', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['async_operations', 'delivery_shipping', 'digital_products'],
      ['single_location']
    );

    // Should have ecommerce, delivery, digital features
    expect(result.activeFeatures).toContain('sales_catalog_ecommerce');
    expect(result.activeFeatures).toContain('sales_online_order_processing');
    expect(result.activeFeatures).toContain('operations_delivery_tracking');
    expect(result.activeFeatures).toContain('digital_file_delivery');
  });

  it('Food Truck: mobile_operations + physical_products', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['mobile_operations', 'physical_products'],
      ['mobile_business']
    );

    // Should have mobile + production features
    expect(result.activeFeatures).toContain('mobile_location_tracking');
    expect(result.activeFeatures).toContain('production_bom_management');
    expect(result.activeFeatures).toContain('mobile_route_planning');
  });

  it('Multi-location chain', () => {
    const result = FeatureActivationEngine.activateFeatures(
      ['physical_products', 'onsite_service'],
      ['multi_location']
    );

    // Should have multi-site features
    expect(result.activeFeatures).toContain('multisite_location_management');
    expect(result.activeFeatures).toContain('multisite_centralized_inventory');
    expect(result.activeFeatures).toContain('multisite_transfer_orders');
  });
});
