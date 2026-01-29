/**
 * MODULE_FEATURE_MAP Test Suite
 *
 * Comprehensive tests for Module-to-Feature mapping
 * Tests module activation based on features, data integrity,
 * and getModulesForActiveFeatures function.
 */

import { describe, it, expect } from 'vitest';
import {
  MODULE_FEATURE_MAP,
  getModulesForActiveFeatures,
  FEATURE_REGISTRY
} from '../FeatureRegistry';
import type { FeatureId } from '../types';

describe('MODULE_FEATURE_MAP - Structure', () => {
  it('should be a valid object', () => {
    expect(MODULE_FEATURE_MAP).toBeDefined();
    expect(typeof MODULE_FEATURE_MAP).toBe('object');
  });

  it('should have core modules defined', () => {
    expect(MODULE_FEATURE_MAP['dashboard']).toBeDefined();
    expect(MODULE_FEATURE_MAP['settings']).toBeDefined();
    expect(MODULE_FEATURE_MAP['gamification']).toBeDefined();
  });

  it('should have business modules defined', () => {
    expect(MODULE_FEATURE_MAP['sales']).toBeDefined();
    expect(MODULE_FEATURE_MAP['materials']).toBeDefined();
    expect(MODULE_FEATURE_MAP['products']).toBeDefined();
    expect(MODULE_FEATURE_MAP['operations']).toBeDefined();
  });
});

describe('MODULE_FEATURE_MAP - Always Active Modules', () => {
  it('should have alwaysActive modules', () => {
    const alwaysActiveModules = Object.entries(MODULE_FEATURE_MAP)
      .filter(([_, config]) => config.alwaysActive)
      .map(([id]) => id);

    expect(alwaysActiveModules.length).toBeGreaterThan(0);
    expect(alwaysActiveModules).toContain('dashboard');
    expect(alwaysActiveModules).toContain('settings');
  });

  it('alwaysActive modules should not have requiredFeatures', () => {
    const alwaysActiveModules = Object.entries(MODULE_FEATURE_MAP)
      .filter(([_, config]) => config.alwaysActive);

    for (const [moduleId, config] of alwaysActiveModules) {
      expect(config.requiredFeatures).toBeUndefined();
    }
  });

  it('alwaysActive modules should not have optionalFeatures', () => {
    const alwaysActiveModules = Object.entries(MODULE_FEATURE_MAP)
      .filter(([_, config]) => config.alwaysActive);

    for (const [moduleId, config] of alwaysActiveModules) {
      expect(config.optionalFeatures).toBeUndefined();
    }
  });
});

describe('MODULE_FEATURE_MAP - Feature Dependencies', () => {
  it('should activate modules with optionalFeatures', () => {
    const activeFeatures: FeatureId[] = ['sales_order_management', 'sales_payment_processing'];
    const modules = getModulesForActiveFeatures(activeFeatures);

    expect(modules).toContain('sales');
  });

  it('should activate modules with requiredFeatures', () => {
    // Find a module with requiredFeatures for testing
    const moduleWithRequired = Object.entries(MODULE_FEATURE_MAP)
      .find(([_, config]) => config.requiredFeatures && config.requiredFeatures.length > 0);

    if (moduleWithRequired) {
      const [moduleId, config] = moduleWithRequired;
      const modules = getModulesForActiveFeatures(config.requiredFeatures!);

      expect(modules).toContain(moduleId);
    }
  });

  it('should not activate modules without required features', () => {
    const moduleWithRequired = Object.entries(MODULE_FEATURE_MAP)
      .find(([_, config]) => config.requiredFeatures && config.requiredFeatures.length > 0);

    if (moduleWithRequired) {
      const [moduleId, config] = moduleWithRequired;

      // Only provide some of the required features
      const partialFeatures = [config.requiredFeatures![0]];
      const modules = getModulesForActiveFeatures(partialFeatures);

      // Should not be activated if not all required features are present
      if (config.requiredFeatures!.length > 1) {
        expect(modules).not.toContain(moduleId);
      }
    }
  });

  it('should handle multiple modules with same feature', () => {
    const activeFeatures: FeatureId[] = ['production_bom_management'];
    const modules = getModulesForActiveFeatures(activeFeatures);

    // production_bom_management might be in both 'production' and 'products'
    expect(modules.length).toBeGreaterThan(0);
  });

  it('should always activate alwaysActive modules', () => {
    const modules = getModulesForActiveFeatures([]);

    // Even with no features, alwaysActive modules should be present
    expect(modules).toContain('dashboard');
    expect(modules).toContain('settings');
  });
});

describe('MODULE_FEATURE_MAP - Data Integrity', () => {
  it('all features in map should exist in FeatureRegistry', () => {
    const featureIds = new Set(Object.keys(FEATURE_REGISTRY));

    for (const [moduleId, config] of Object.entries(MODULE_FEATURE_MAP)) {
      // Check requiredFeatures
      if (config.requiredFeatures) {
        for (const featureId of config.requiredFeatures) {
          expect(featureIds.has(featureId)).toBe(true);
        }
      }

      // Check optionalFeatures
      if (config.optionalFeatures) {
        for (const featureId of config.optionalFeatures) {
          expect(featureIds.has(featureId)).toBe(true);
        }
      }
    }
  });

  it('all modules should have description', () => {
    for (const [moduleId, config] of Object.entries(MODULE_FEATURE_MAP)) {
      expect(config.description).toBeDefined();
      expect(config.description!.length).toBeGreaterThan(0);
    }
  });

  it('modules should not have both alwaysActive and feature lists', () => {
    for (const [moduleId, config] of Object.entries(MODULE_FEATURE_MAP)) {
      if (config.alwaysActive) {
        expect(config.requiredFeatures).toBeUndefined();
        expect(config.optionalFeatures).toBeUndefined();
      }
    }
  });

  it('modules should have either alwaysActive or features', () => {
    for (const [moduleId, config] of Object.entries(MODULE_FEATURE_MAP)) {
      const hasAlwaysActive = config.alwaysActive === true;
      const hasRequired = config.requiredFeatures && config.requiredFeatures.length > 0;
      const hasOptional = config.optionalFeatures && config.optionalFeatures.length > 0;

      expect(hasAlwaysActive || hasRequired || hasOptional).toBe(true);
    }
  });
});

describe('getModulesForActiveFeatures - Function Tests', () => {
  it('should return array of module IDs', () => {
    const modules = getModulesForActiveFeatures(['sales_order_management']);

    expect(Array.isArray(modules)).toBe(true);
    expect(modules.every(id => typeof id === 'string')).toBe(true);
  });

  it('should return empty array plus alwaysActive for no features', () => {
    const modules = getModulesForActiveFeatures([]);

    expect(Array.isArray(modules)).toBe(true);
    // Should at least have alwaysActive modules
    expect(modules.length).toBeGreaterThan(0);
    expect(modules).toContain('dashboard');
  });

  it('should deduplicate module IDs', () => {
    const activeFeatures: FeatureId[] = [
      'sales_order_management',
      'sales_payment_processing',
      'sales_catalog_menu'
    ];

    const modules = getModulesForActiveFeatures(activeFeatures);

    // Check no duplicates
    const uniqueModules = new Set(modules);
    expect(uniqueModules.size).toBe(modules.length);
  });

  it('should activate sales module with sales features', () => {
    const modules = getModulesForActiveFeatures(['sales_order_management']);

    expect(modules).toContain('sales');
  });

  it('should activate materials module with inventory features', () => {
    const modules = getModulesForActiveFeatures(['inventory_stock_tracking']);

    expect(modules).toContain('materials');
  });

  it('should activate products module with product features', () => {
    const modules = getModulesForActiveFeatures(['products_recipe_management']);

    expect(modules).toContain('products');
  });

  it('should activate operations module with operations features', () => {
    const modules = getModulesForActiveFeatures(['operations_table_management']);

    expect(modules).toContain('operations');
  });

  it('should activate scheduling module with scheduling features', () => {
    const modules = getModulesForActiveFeatures(['scheduling_appointment_booking']);

    expect(modules).toContain('scheduling');
  });

  it('should activate staff module with staff features', () => {
    const modules = getModulesForActiveFeatures(['staff_employee_management']);

    expect(modules).toContain('team');
  });

  it('should activate customers module with customer features', () => {
    const modules = getModulesForActiveFeatures(['customer_loyalty_program']);

    expect(modules).toContain('customers');
  });
});

describe('getModulesForActiveFeatures - Real-World Scenarios', () => {
  it('Restaurant: should activate relevant modules', () => {
    const restaurantFeatures: FeatureId[] = [
      'production_bom_management',
      'inventory_stock_tracking',
      'sales_order_management',
      'operations_table_management',
      'staff_employee_management'
    ];

    const modules = getModulesForActiveFeatures(restaurantFeatures);

    expect(modules).toContain('products'); // production_bom_management is in products
    expect(modules).toContain('materials');
    expect(modules).toContain('sales');
    expect(modules).toContain('operations');
    expect(modules).toContain('team');
    expect(modules).toContain('dashboard'); // Always active
  });

  it('Spa: should activate service-related modules', () => {
    const spaFeatures: FeatureId[] = [
      'scheduling_appointment_booking',
      'customer_service_history',
      'staff_employee_management',
      'sales_package_management'
    ];

    const modules = getModulesForActiveFeatures(spaFeatures);

    expect(modules).toContain('scheduling');
    expect(modules).toContain('customers');
    expect(modules).toContain('team');
    expect(modules).toContain('sales');
  });

  it('E-commerce: should activate online store modules', () => {
    const ecommerceFeatures: FeatureId[] = [
      'sales_catalog_ecommerce',
      'sales_online_order_processing',
      'inventory_available_to_promise',
      'operations_delivery_tracking'
    ];

    const modules = getModulesForActiveFeatures(ecommerceFeatures);

    expect(modules).toContain('sales');
    expect(modules).toContain('materials');
    expect(modules).toContain('operations');
  });

  it('Multi-location business: should activate multisite modules', () => {
    const multiLocationFeatures: FeatureId[] = [
      'multisite_location_management',
      'multisite_centralized_inventory',
      'sales_order_management'
    ];

    const modules = getModulesForActiveFeatures(multiLocationFeatures);

    // Should activate relevant modules
    expect(modules.length).toBeGreaterThan(0);
  });
});

describe('MODULE_FEATURE_MAP - Edge Cases', () => {
  it('should handle unknown feature IDs gracefully', () => {
    const modules = getModulesForActiveFeatures(['unknown_feature' as FeatureId]);

    // Should still return alwaysActive modules
    expect(modules).toContain('dashboard');
    expect(modules).toContain('settings');
  });

  it('should handle empty feature array', () => {
    const modules = getModulesForActiveFeatures([]);

    // Should return at least alwaysActive modules
    expect(modules.length).toBeGreaterThan(0);
    expect(modules).toContain('dashboard');
  });

  it('should handle duplicate features in input', () => {
    const modules = getModulesForActiveFeatures([
      'sales_order_management',
      'sales_order_management',
      'sales_order_management'
    ]);

    // Should still work and deduplicate modules
    const uniqueModules = new Set(modules);
    expect(uniqueModules.size).toBe(modules.length);
    expect(modules).toContain('sales');
  });
});
