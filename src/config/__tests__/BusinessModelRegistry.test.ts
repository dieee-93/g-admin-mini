/**
 * Business Model Registry Test Suite
 *
 * Comprehensive tests for Business Model Registry v4.0
 * Tests capability retrieval, infrastructure management, feature activation,
 * and data integrity.
 */

import { describe, it, expect } from 'vitest';
import {
  getCapability,
  getInfrastructure,
  getAllCapabilities,
  getAllInfrastructures,
  checkInfrastructureConflicts,
  getActivatedFeatures,
  getBlockingRequirements,
  BUSINESS_CAPABILITIES_REGISTRY,
  INFRASTRUCTURE_REGISTRY
} from '../BusinessModelRegistry';
import { FEATURE_REGISTRY } from '../FeatureRegistry';
import type { BusinessCapabilityId, InfrastructureId } from '../types';

describe('BusinessModelRegistry - Capability Retrieval', () => {
  it('should retrieve capability by ID', () => {
    const capability = getCapability('physical_products');

    expect(capability).toBeDefined();
    expect(capability?.id).toBe('physical_products');
    expect(capability?.name).toBe('Productos Físicos');
    expect(capability?.activatesFeatures.length).toBeGreaterThan(0);
  });

  it('should return undefined for invalid ID', () => {
    const capability = getCapability('invalid_capability' as BusinessCapabilityId);

    expect(capability).toBeUndefined();
  });

  it('should retrieve all capabilities', () => {
    const capabilities = getAllCapabilities();

    expect(Array.isArray(capabilities)).toBe(true);
    expect(capabilities.length).toBeGreaterThan(0);

    // Check some known capabilities exist
    const ids = capabilities.map(c => c.id);
    expect(ids).toContain('physical_products');
    expect(ids).toContain('professional_services');
    expect(ids).toContain('onsite_service');
  });
});

describe('BusinessModelRegistry - Infrastructure Retrieval', () => {
  it('should retrieve infrastructure by ID', () => {
    const infrastructure = getInfrastructure('single_location');

    expect(infrastructure).toBeDefined();
    expect(infrastructure?.id).toBe('single_location');
    expect(infrastructure?.name).toBe('Local Fijo');
  });

  it('should return undefined for invalid ID', () => {
    const infrastructure = getInfrastructure('invalid_infra' as InfrastructureId);

    expect(infrastructure).toBeUndefined();
  });

  it('should retrieve all infrastructures', () => {
    const infrastructures = getAllInfrastructures();

    expect(Array.isArray(infrastructures)).toBe(true);
    expect(infrastructures.length).toBeGreaterThan(0);

    // Check some known infrastructures exist
    const ids = infrastructures.map(i => i.id);
    expect(ids).toContain('single_location');
    expect(ids).toContain('multi_location');
    expect(ids).toContain('mobile_business');
  });
});

describe('BusinessModelRegistry - Feature Activation', () => {
  it('should return all features from single capability', () => {
    const features = getActivatedFeatures(['physical_products'], []);

    expect(features.length).toBeGreaterThan(0);
    expect(features).toContain('production_bom_management');
    expect(features).toContain('inventory_stock_tracking');
    expect(features).toContain('sales_order_management');
  });

  it('should return all features from multiple capabilities', () => {
    const features = getActivatedFeatures(
      ['physical_products', 'professional_services'],
      []
    );

    expect(features.length).toBeGreaterThan(0);
    // From physical_products
    expect(features).toContain('production_bom_management');
    // From professional_services
    expect(features).toContain('scheduling_appointment_booking');
  });

  it('should return all features from infrastructure', () => {
    const features = getActivatedFeatures([], ['multi_location']);

    expect(features.length).toBeGreaterThan(0);
    expect(features).toContain('multisite_location_management');
    expect(features).toContain('multisite_centralized_inventory');
  });

  it('should deduplicate features', () => {
    const features = getActivatedFeatures(
      ['physical_products', 'professional_services'],
      []
    );

    // Check no duplicates
    const uniqueFeatures = new Set(features);
    expect(uniqueFeatures.size).toBe(features.length);

    // Verify sales_payment_processing appears only once
    const paymentCount = features.filter(f => f === 'sales_payment_processing').length;
    expect(paymentCount).toBe(1);
  });

  it('should return empty array for empty input', () => {
    const features = getActivatedFeatures([], []);

    expect(features).toEqual([]);
  });

  it('should handle invalid capability IDs gracefully', () => {
    // Should not throw, should skip invalid IDs
    const features = getActivatedFeatures(
      ['invalid_capability' as BusinessCapabilityId],
      []
    );

    expect(features).toBeDefined();
    expect(Array.isArray(features)).toBe(true);
  });

  it('should combine capability and infrastructure features', () => {
    const features = getActivatedFeatures(
      ['physical_products'],
      ['multi_location']
    );

    // Should have both capability AND infrastructure features
    expect(features).toContain('production_bom_management'); // from capability
    expect(features).toContain('multisite_location_management'); // from infrastructure
  });
});

describe('BusinessModelRegistry - Blocking Requirements', () => {
  it('should return requirements from capabilities', () => {
    const requirements = getBlockingRequirements(
      ['onsite_service'],
      []
    );

    expect(requirements.length).toBeGreaterThan(0);
    expect(requirements).toContain('business_address_required');
    expect(requirements).toContain('operating_hours_required');
  });

  it('should return requirements from infrastructure', () => {
    const requirements = getBlockingRequirements(
      [],
      ['multi_location']
    );

    expect(requirements.length).toBeGreaterThan(0);
    expect(requirements).toContain('primary_location_required');
    expect(requirements).toContain('additional_locations_required');
  });

  it('should deduplicate requirements', () => {
    const requirements = getBlockingRequirements(
      ['onsite_service', 'pickup_orders'], // Both may have business_address_required
      ['single_location']
    );

    // Check no duplicates
    const uniqueReqs = new Set(requirements);
    expect(uniqueReqs.size).toBe(requirements.length);
  });

  it('should return empty array for no requirements', () => {
    const requirements = getBlockingRequirements(
      ['physical_products'], // Has empty blockingRequirements
      []
    );

    expect(Array.isArray(requirements)).toBe(true);
  });
});

describe('BusinessModelRegistry - Infrastructure Conflicts', () => {
  it('should detect no conflicts for compatible infrastructures', () => {
    const result = checkInfrastructureConflicts(
      'multi_location',
      ['single_location']
    );

    expect(result.valid).toBe(true);
    expect(result.conflicts).toEqual([]);
  });

  it('should return valid when no conflicts defined', () => {
    const result = checkInfrastructureConflicts(
      'single_location',
      ['multi_location', 'mobile_business']
    );

    expect(result.valid).toBe(true);
  });

  it('should handle empty active infrastructure', () => {
    const result = checkInfrastructureConflicts(
      'single_location',
      []
    );

    expect(result.valid).toBe(true);
    expect(result.conflicts).toEqual([]);
  });
});

describe('BusinessModelRegistry - Data Integrity', () => {
  it('all capabilities should have valid feature IDs', () => {
    const capabilities = getAllCapabilities();
    const featureIds = new Set(Object.keys(FEATURE_REGISTRY));

    const missingFeatures: string[] = [];

    for (const capability of capabilities) {
      for (const featureId of capability.activatesFeatures) {
        if (!featureIds.has(featureId)) {
          missingFeatures.push(`${capability.id} -> ${featureId}`);
        }
      }
    }

    if (missingFeatures.length > 0) {
      console.warn('Missing features in FeatureRegistry:', missingFeatures);
    }

    expect(missingFeatures.length).toBe(0);
  });

  it('all infrastructure should have valid feature IDs', () => {
    const infrastructures = getAllInfrastructures();
    const featureIds = new Set(Object.keys(FEATURE_REGISTRY));

    for (const infrastructure of infrastructures) {
      for (const featureId of infrastructure.activatesFeatures) {
        expect(featureIds.has(featureId)).toBe(true);
      }
    }
  });

  it('all capabilities should have type', () => {
    const capabilities = getAllCapabilities();

    for (const capability of capabilities) {
      expect(capability.type).toBeDefined();
      expect(['business_model', 'fulfillment', 'special_operation']).toContain(capability.type);
    }
  });

  it('all capabilities should have icon', () => {
    const capabilities = getAllCapabilities();

    for (const capability of capabilities) {
      expect(capability.icon).toBeDefined();
      expect(capability.icon.length).toBeGreaterThan(0);
    }
  });

  it('all infrastructures should have type', () => {
    const infrastructures = getAllInfrastructures();

    for (const infrastructure of infrastructures) {
      expect(infrastructure.type).toBe('infrastructure');
    }
  });

  it('all capabilities should have unique IDs', () => {
    const capabilities = getAllCapabilities();
    const ids = capabilities.map(c => c.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all infrastructures should have unique IDs', () => {
    const infrastructures = getAllInfrastructures();
    const ids = infrastructures.map(i => i.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('capability IDs should match their key in registry', () => {
    for (const [key, capability] of Object.entries(BUSINESS_CAPABILITIES_REGISTRY)) {
      expect(capability.id).toBe(key);
    }
  });

  it('infrastructure IDs should match their key in registry', () => {
    for (const [key, infrastructure] of Object.entries(INFRASTRUCTURE_REGISTRY)) {
      expect(infrastructure.id).toBe(key);
    }
  });
});

describe('BusinessModelRegistry - Coverage', () => {
  it('should have sufficient capabilities defined', () => {
    const capabilities = getAllCapabilities();

    // Should have at least the core capabilities
    expect(capabilities.length).toBeGreaterThanOrEqual(10);
  });

  it('should have all expected capability types', () => {
    const capabilities = getAllCapabilities();
    const types = new Set(capabilities.map(c => c.type));

    expect(types.has('business_model')).toBe(true);
    expect(types.has('fulfillment')).toBe(true);
    expect(types.has('special_operation')).toBe(true);
  });

  it('should have core business models', () => {
    const capabilities = getAllCapabilities();
    const ids = capabilities.map(c => c.id);

    expect(ids).toContain('physical_products');
    expect(ids).toContain('professional_services');
  });

  it('should have core fulfillment methods', () => {
    const capabilities = getAllCapabilities();
    const ids = capabilities.map(c => c.id);

    expect(ids).toContain('onsite_service');
    expect(ids).toContain('pickup_orders');
    expect(ids).toContain('delivery_shipping');
  });
});
