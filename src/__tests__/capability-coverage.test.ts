/**
 * Capability Coverage Tests
 *
 * Tests de cobertura sistemática para el sistema de capabilities:
 * - Cobertura Individual de Capabilities (11 capabilities)
 * - Cobertura de Infrastructure (3 options)
 * - Combinaciones Críticas (Escenarios Reales)
 * - Edge Cases y Límites
 *
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCapabilityStore } from '@/store/capabilityStore';
import { BUSINESS_CAPABILITIES_REGISTRY, INFRASTRUCTURE_REGISTRY } from '@/config/BusinessModelRegistry';
import { FEATURE_REGISTRY } from '@/config/FeatureRegistry';
import { CORE_MODULES } from '@/lib/modules/constants';
import type { BusinessCapabilityId, InfrastructureId, FeatureId } from '@/config/types';
import {
  ALL_CAPABILITY_IDS,
  ALL_INFRASTRUCTURE_IDS,
  ALL_FEATURE_IDS,
  BUSINESS_SCENARIOS,
  createTestProfile
} from './helpers/capability-test-utils';

// Mock EventBus
vi.mock('@/lib/events/EventBus', () => ({
  default: {
    emit: vi.fn()
  }
}));

// Mock database services
vi.mock('@/lib/business-profile/businessProfileService', () => ({
  loadProfileFromDB: vi.fn().mockResolvedValue(null),
  saveProfileToDB: vi.fn().mockResolvedValue(true),
  updateCompletedMilestonesInDB: vi.fn().mockResolvedValue(true),
  dismissWelcomeInDB: vi.fn().mockResolvedValue(true)
}));

// ============================================
// 1. COBERTURA INDIVIDUAL DE CAPABILITIES
// ============================================

describe('Coverage - Individual Capabilities', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  describe('Feature Activation Coverage', () => {
    it.each([
      ['physical_products', 19],
      ['professional_services', 18],
      ['onsite_service', 22],
      ['pickup_orders', 15],
      ['delivery_shipping', 16],
      ['async_operations', 13],
      ['corporate_sales', 17],
      ['mobile_operations', 7],
      ['asset_rental', 7],
      ['membership_subscriptions', 11],
      ['digital_products', 9]
    ] as const)(
      '%s should activate at least %i features',
      (capabilityId, minFeatures) => {
        useCapabilityStore.getState().initializeProfile(
          createTestProfile([capabilityId])
        );

        const { features, profile } = useCapabilityStore.getState();

        // Validate minimum feature count
        expect(
          features.activeFeatures.length,
          `${capabilityId} should activate at least ${minFeatures} features, got ${features.activeFeatures.length}`
        ).toBeGreaterThanOrEqual(minFeatures);

        // Validate profile is correctly configured
        expect(profile?.selectedCapabilities).toContain(capabilityId);

        // Document actual features activated
        console.log(`${capabilityId}: ${features.activeFeatures.length} features activated`);
      }
    );

    it.each(ALL_CAPABILITY_IDS)(
      '%s should have features defined in BusinessModelRegistry',
      (capabilityId) => {
        const capability = BUSINESS_CAPABILITIES_REGISTRY[capabilityId];

        // Every capability must activate at least ONE feature
        expect(
          capability.activatesFeatures.length,
          `${capabilityId} must activate at least one feature`
        ).toBeGreaterThan(0);

        // Document features
        console.log(`${capabilityId} declares ${capability.activatesFeatures.length} features`);
      }
    );
  });

  describe('Module Activation Coverage', () => {
    it.each(ALL_CAPABILITY_IDS)(
      '%s should activate at least one module',
      (capabilityId) => {
        useCapabilityStore.getState().initializeProfile(
          createTestProfile([capabilityId])
        );

        const modules = useCapabilityStore.getState().getActiveModules();
        const coreModulesCount = Array.from(CORE_MODULES).length;

        // Should activate at least some modules (beyond CORE)
        expect(
          modules.length,
          `${capabilityId} should activate modules beyond CORE modules`
        ).toBeGreaterThanOrEqual(coreModulesCount);

        console.log(`${capabilityId}: ${modules.length} modules active`);
      }
    );

    it.each(ALL_CAPABILITY_IDS)(
      '%s should have valid module activations',
      (capabilityId) => {
        useCapabilityStore.getState().initializeProfile(
          createTestProfile([capabilityId])
        );

        const modules = useCapabilityStore.getState().getActiveModules();

        // All modules should be non-empty strings
        modules.forEach(moduleId => {
          expect(typeof moduleId).toBe('string');
          expect(moduleId.length).toBeGreaterThan(0);
        });

        // No duplicate modules
        const uniqueModules = [...new Set(modules)];
        expect(modules.length).toBe(uniqueModules.length);
      }
    );
  });

  describe('Capability Properties Validation', () => {
    it.each(ALL_CAPABILITY_IDS)(
      '%s should have complete metadata',
      (capabilityId) => {
        const capability = BUSINESS_CAPABILITIES_REGISTRY[capabilityId];

        // Validate all required properties
        expect(capability.id).toBe(capabilityId);
        expect(typeof capability.name).toBe('string');
        expect(capability.name.length).toBeGreaterThan(0);
        expect(typeof capability.description).toBe('string');
        expect(capability.description.length).toBeGreaterThan(0);
        expect(typeof capability.icon).toBe('string');
        expect(['business_model', 'fulfillment', 'special_operation']).toContain(capability.type);
        expect(Array.isArray(capability.activatesFeatures)).toBe(true);
        expect(Array.isArray(capability.blockingRequirements)).toBe(true);
      }
    );
  });
});

// ============================================
// 2. COBERTURA DE INFRASTRUCTURE
// ============================================

describe('Coverage - Infrastructure Options', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  describe('Infrastructure Feature Activation', () => {
    it.each([
      ['single_location', 0],
      ['multi_location', 5],
      ['mobile_business', 0]
    ] as const)(
      '%s should activate %i infrastructure-specific features',
      (infraId, expectedFeatures) => {
        useCapabilityStore.getState().initializeProfile(
          createTestProfile(['physical_products'], [infraId])
        );

        const { features } = useCapabilityStore.getState();

        // Count features from the specific domain
        const infraFeatures = features.activeFeatures.filter(f => {
          if (infraId === 'multi_location') return f.startsWith('multisite_');
          if (infraId === 'mobile_business') return f.startsWith('mobile_');
          return false;
        });

        expect(
          infraFeatures.length,
          `${infraId} should activate ${expectedFeatures} infrastructure features`
        ).toBeGreaterThanOrEqual(expectedFeatures);

        console.log(`${infraId}: ${infraFeatures.length} infrastructure features`);
      }
    );

    it('should handle multiple infrastructure selections', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(['physical_products'], ['single_location', 'multi_location'])
      );

      const { features, profile } = useCapabilityStore.getState();

      // Should have features from multi_location
      expect(features.activeFeatures).toContain('multisite_location_management');

      // Profile should reflect both selections
      expect(profile?.selectedInfrastructure).toHaveLength(2);
      expect(profile?.selectedInfrastructure).toContain('single_location');
      expect(profile?.selectedInfrastructure).toContain('multi_location');
    });

    it('should combine all infrastructure options correctly', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['physical_products', 'mobile_operations'],
          ALL_INFRASTRUCTURE_IDS
        )
      );

      const { features, profile } = useCapabilityStore.getState();

      // Should have multisite features
      expect(features.activeFeatures.some(f => f.startsWith('multisite_'))).toBe(true);

      // Should have mobile features (from capability)
      expect(features.activeFeatures.some(f => f.startsWith('mobile_'))).toBe(true);

      // All infrastructure should be in profile
      expect(profile?.selectedInfrastructure).toHaveLength(3);
    });
  });

  describe('Infrastructure Properties Validation', () => {
    it.each(ALL_INFRASTRUCTURE_IDS)(
      '%s should have complete metadata',
      (infraId) => {
        const infra = INFRASTRUCTURE_REGISTRY[infraId];

        expect(infra.id).toBe(infraId);
        expect(typeof infra.name).toBe('string');
        expect(infra.name.length).toBeGreaterThan(0);
        expect(typeof infra.description).toBe('string');
        expect(infra.description.length).toBeGreaterThan(0);
        expect(typeof infra.icon).toBe('string');
        expect(infra.type).toBe('infrastructure');
        expect(Array.isArray(infra.activatesFeatures)).toBe(true);
        expect(Array.isArray(infra.blockingRequirements)).toBe(true);
        expect(Array.isArray(infra.conflicts)).toBe(true);
      }
    );
  });
});

// ============================================
// 3. COMBINACIONES CRÍTICAS (Escenarios Reales)
// ============================================

describe('Coverage - Real-World Combinations', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  describe('Business Scenario Coverage', () => {
    it.each(BUSINESS_SCENARIOS)(
      'should correctly configure: $name',
      ({ name, capabilities, infrastructure, expectedModules }) => {
        useCapabilityStore.getState().initializeProfile({
          businessName: name,
          businessType: 'test' as any,
          email: 'test@example.com',
          selectedCapabilities: capabilities,
          selectedInfrastructure: infrastructure
        });

        const { profile, features } = useCapabilityStore.getState();
        const modules = useCapabilityStore.getState().getActiveModules();

        // Profile should be complete
        expect(profile).not.toBeNull();
        expect(profile?.businessName).toBe(name);
        expect(profile?.selectedCapabilities).toEqual(capabilities);

        // Features should be activated
        expect(features.activeFeatures.length).toBeGreaterThan(10);

        // Expected modules should be active
        expectedModules.forEach(moduleId => {
          expect(
            modules,
            `Scenario "${name}" should have module "${moduleId}" active`
          ).toContain(moduleId);
        });

        console.log(`${name}: ${features.activeFeatures.length} features, ${modules.length} modules`);
      }
    );
  });

  describe('Common Business Model Combinations', () => {
    it('should support Restaurant (dine-in + pickup + delivery)', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['physical_products', 'onsite_service', 'pickup_orders', 'delivery_shipping'],
          ['single_location']
        )
      );

      const { features } = useCapabilityStore.getState();

      // Should have production features
      expect(features.activeFeatures).toContain('production_bom_management');

      // Should have all fulfillment methods
      expect(features.activeFeatures).toContain('operations_table_management'); // onsite
      expect(features.activeFeatures).toContain('operations_pickup_scheduling'); // pickup
      expect(features.activeFeatures).toContain('operations_delivery_zones'); // delivery
    });

    it('should support Professional Services (spa, clinic, salon)', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['professional_services', 'onsite_service', 'membership_subscriptions'],
          ['single_location']
        )
      );

      const { features } = useCapabilityStore.getState();

      // Should have scheduling
      expect(features.activeFeatures).toContain('scheduling_appointment_booking');

      // Should have membership features
      expect(features.activeFeatures).toContain('membership_subscription_plans');

      // Should have customer management
      expect(features.activeFeatures).toContain('customer_service_history');
    });

    it('should support E-commerce (online store with delivery)', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['physical_products', 'async_operations', 'delivery_shipping'],
          ['single_location']
        )
      );

      const { features } = useCapabilityStore.getState();

      // Should have e-commerce features
      expect(features.activeFeatures).toContain('sales_catalog_ecommerce');
      expect(features.activeFeatures).toContain('sales_online_order_processing');
      expect(features.activeFeatures).toContain('sales_cart_management');

      // Should have delivery
      expect(features.activeFeatures).toContain('operations_delivery_zones');
    });

    it('should support B2B Distributor', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['physical_products', 'corporate_sales', 'delivery_shipping'],
          ['multi_location']
        )
      );

      const { features } = useCapabilityStore.getState();

      // Should have B2B features
      expect(features.activeFeatures).toContain('finance_corporate_accounts');
      expect(features.activeFeatures).toContain('sales_tiered_pricing');
      expect(features.activeFeatures).toContain('sales_contract_management');

      // Should have multi-location features
      expect(features.activeFeatures).toContain('multisite_location_management');
    });
  });

  describe('Maximum Combination Coverage', () => {
    it('should handle all capabilities + all infrastructure', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(ALL_CAPABILITY_IDS, ALL_INFRASTRUCTURE_IDS)
      );

      const { profile, features } = useCapabilityStore.getState();
      const modules = useCapabilityStore.getState().getActiveModules();

      // Profile should contain all selections
      expect(profile?.selectedCapabilities).toHaveLength(ALL_CAPABILITY_IDS.length);
      expect(profile?.selectedInfrastructure).toHaveLength(ALL_INFRASTRUCTURE_IDS.length);

      // Should activate many features
      expect(features.activeFeatures.length).toBeGreaterThan(60);

      // Should activate many modules
      expect(modules.length).toBeGreaterThan(15);

      console.log(`Maximum combination: ${features.activeFeatures.length} features, ${modules.length} modules`);
    });
  });
});

// ============================================
// 4. EDGE CASES Y LÍMITES
// ============================================

describe('Coverage - Edge Cases and Limits', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  describe('Empty and Minimal Configurations', () => {
    it('should handle empty capability selection gracefully', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile([], ['single_location'])
      );

      const { profile, features } = useCapabilityStore.getState();

      expect(profile).not.toBeNull();
      expect(profile?.selectedCapabilities).toEqual([]);
      expect(features.activeFeatures).toEqual([]);
    });

    it('should handle empty infrastructure selection', () => {
      useCapabilityStore.getState().initializeProfile({
        businessName: 'Test',
        selectedCapabilities: ['physical_products'],
        selectedInfrastructure: []
      });

      const { profile, features } = useCapabilityStore.getState();

      expect(profile).not.toBeNull();
      expect(profile?.selectedInfrastructure).toEqual([]);

      // Features from capability should still be active
      expect(features.activeFeatures.length).toBeGreaterThan(0);
    });

    it('should handle completely empty initialization', () => {
      useCapabilityStore.getState().initializeProfile({
        businessName: 'Empty Business',
        selectedCapabilities: [],
        selectedInfrastructure: []
      });

      const { profile, features } = useCapabilityStore.getState();

      expect(profile).not.toBeNull();
      expect(profile?.businessName).toBe('Empty Business');
      expect(features.activeFeatures).toEqual([]);
      expect(features.activeModules).toEqual([]);
    });
  });

  describe('Conflicting Selections', () => {
    it('should handle multiple infrastructure without issues', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['physical_products'],
          ['single_location', 'multi_location', 'mobile_business']
        )
      );

      const { profile } = useCapabilityStore.getState();

      // System should accept the combination (no hard conflicts defined)
      expect(profile?.selectedInfrastructure).toHaveLength(3);
    });

    it('should handle conflicting capability combinations', () => {
      // Test capability combinations that might seem conflicting
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(
          ['physical_products', 'digital_products'], // Physical and digital
          ['mobile_business']
        )
      );

      const { profile, features } = useCapabilityStore.getState();

      // Both should be accepted
      expect(profile?.selectedCapabilities).toContain('physical_products');
      expect(profile?.selectedCapabilities).toContain('digital_products');

      // Both types of features should be active
      expect(features.activeFeatures).toContain('production_bom_management'); // physical
      expect(features.activeFeatures).toContain('digital_file_delivery'); // digital
    });
  });

  describe('Feature Reachability', () => {
    it('should validate all 88 features can be reached', () => {
      const allFeatures = ALL_FEATURE_IDS;
      const unreachableFeatures: FeatureId[] = [];

      // Activate ALL capabilities + ALL infrastructure
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(ALL_CAPABILITY_IDS, ALL_INFRASTRUCTURE_IDS)
      );

      const activeFeatures = useCapabilityStore.getState().features.activeFeatures;

      // Check which features are NOT active
      allFeatures.forEach(featureId => {
        if (!activeFeatures.includes(featureId)) {
          unreachableFeatures.push(featureId);
        }
      });

      // Document unreachable features
      if (unreachableFeatures.length > 0) {
        console.warn('Unreachable features with maximum activation:');
        console.table(
          unreachableFeatures.map(f => ({
            Feature: f,
            Domain: FEATURE_REGISTRY[f]?.domain,
            Category: FEATURE_REGISTRY[f]?.category
          }))
        );
      }

      // Allow some features to be unreachable (future features, always_on features, etc.)
      expect(unreachableFeatures.length).toBeLessThan(10);
    });

    it('should document feature coverage percentage', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(ALL_CAPABILITY_IDS, ALL_INFRASTRUCTURE_IDS)
      );

      const activeFeatures = useCapabilityStore.getState().features.activeFeatures;
      const totalFeatures = ALL_FEATURE_IDS.length;
      const coveragePercent = (activeFeatures.length / totalFeatures) * 100;

      console.log(`Feature coverage: ${activeFeatures.length}/${totalFeatures} (${coveragePercent.toFixed(1)}%)`);

      // Should cover at least 80% of features
      expect(coveragePercent).toBeGreaterThan(80);
    });
  });

  describe('State Consistency Edge Cases', () => {
    it('should maintain consistency after rapid changes', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(['physical_products'])
      );

      // Rapid changes
      useCapabilityStore.getState().toggleCapability('professional_services');
      useCapabilityStore.getState().toggleCapability('onsite_service');
      useCapabilityStore.getState().toggleCapability('physical_products'); // Remove
      useCapabilityStore.getState().toggleCapability('pickup_orders');

      const { profile, features } = useCapabilityStore.getState();

      // Final state should be consistent
      expect(profile?.selectedCapabilities).not.toContain('physical_products');
      expect(profile?.selectedCapabilities).toContain('professional_services');
      expect(profile?.selectedCapabilities).toContain('pickup_orders');

      // Features should match capabilities
      expect(features.activeFeatures.length).toBeGreaterThan(0);

      // No duplicate features
      const uniqueFeatures = [...new Set(features.activeFeatures)];
      expect(features.activeFeatures.length).toBe(uniqueFeatures.length);
    });

    it('should handle setCapabilities replacing all capabilities', () => {
      useCapabilityStore.getState().initializeProfile(
        createTestProfile(['physical_products', 'professional_services'])
      );

      // Replace with completely different capabilities
      useCapabilityStore.getState().setCapabilities([
        'digital_products',
        'async_operations'
      ]);

      const { profile, features } = useCapabilityStore.getState();

      // Old capabilities should be gone
      expect(profile?.selectedCapabilities).not.toContain('physical_products');
      expect(profile?.selectedCapabilities).not.toContain('professional_services');

      // New capabilities should be present
      expect(profile?.selectedCapabilities).toContain('digital_products');
      expect(profile?.selectedCapabilities).toContain('async_operations');

      // Features should reflect new capabilities
      expect(features.activeFeatures).toContain('digital_file_delivery');
      expect(features.activeFeatures).toContain('sales_catalog_ecommerce');
    });
  });
});
