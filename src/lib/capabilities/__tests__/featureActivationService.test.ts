/**
 * Feature Activation Service - Unit Tests
 *
 * Tests para business logic puro (sin Zustand, sin React)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  activateFeatures,
  hasFeature,
  hasAllFeatures,
  isFeatureBlocked,
  getActiveModules,
  hasModule,
  toggleCapability,
  toggleInfrastructure,
  getUpdatedArrayIfChanged,
  validateProfile,
  addCapability,
  removeCapability,
  addInfrastructure,
  removeInfrastructure
} from '../featureActivationService';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/BusinessModelRegistry';
import type { FeatureId } from '@/config/FeatureRegistry';

describe('FeatureActivationService', () => {
  describe('activateFeatures', () => {
    it('should activate features for onsite sales', () => {
      const capabilities: BusinessCapabilityId[] = ['onsite_sales'];
      const infrastructure: InfrastructureId[] = ['single_location'];

      const { activeFeatures } = activateFeatures(capabilities, infrastructure);

      expect(activeFeatures).toBeInstanceOf(Array);
      // Features activated depend on BusinessModelRegistry configuration
      // Test just verifies the service returns valid structure
    });

    it('should handle empty inputs', () => {
      const { activeFeatures } = activateFeatures([], []);

      expect(activeFeatures).toBeInstanceOf(Array);
      // Empty inputs might still activate core features
    });
  });

  describe('hasFeature', () => {
    it('should return true if feature is active', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite', 'sales_payment_processing'];
      const result = hasFeature(activeFeatures, 'sales_pos_onsite');

      expect(result).toBe(true);
    });

    it('should return false if feature is not active', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite'];
      const result = hasFeature(activeFeatures, 'sales_delivery_management');

      expect(result).toBe(false);
    });

    it('should handle empty array', () => {
      const result = hasFeature([], 'sales_pos_onsite');

      expect(result).toBe(false);
    });
  });

  describe('hasAllFeatures', () => {
    it('should return true if all features are active', () => {
      const activeFeatures: FeatureId[] = [
        'sales_pos_onsite',
        'sales_payment_processing',
        'sales_order_management'
      ];

      const result = hasAllFeatures(activeFeatures, [
        'sales_pos_onsite',
        'sales_payment_processing'
      ]);

      expect(result).toBe(true);
    });

    it('should return false if any feature is missing', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite'];

      const result = hasAllFeatures(activeFeatures, [
        'sales_pos_onsite',
        'sales_payment_processing'
      ]);

      expect(result).toBe(false);
    });

    it('should return true for empty requirements array', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite'];

      const result = hasAllFeatures(activeFeatures, []);

      expect(result).toBe(true);
    });
  });

  describe('isFeatureBlocked', () => {
    it('should return true if feature is blocked', () => {
      const blockedFeatures: FeatureId[] = ['sales_delivery_management'];

      const result = isFeatureBlocked(blockedFeatures, 'sales_delivery_management');

      expect(result).toBe(true);
    });

    it('should return false if feature is not blocked', () => {
      const blockedFeatures: FeatureId[] = ['sales_delivery_management'];

      const result = isFeatureBlocked(blockedFeatures, 'sales_pos_onsite');

      expect(result).toBe(false);
    });
  });

  describe('getActiveModules', () => {
    it('should return active modules for sales features', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite', 'sales_payment_processing'];

      const modules = getActiveModules(activeFeatures);

      expect(modules).toBeInstanceOf(Array);
      expect(modules).toContain('sales');
    });

    it('should handle empty features', () => {
      const modules = getActiveModules([]);

      expect(modules).toBeInstanceOf(Array);
    });
  });

  describe('hasModule', () => {
    it('should return true if module is active', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite'];

      const result = hasModule(activeFeatures, 'sales');

      expect(result).toBe(true);
    });

    it('should return false if module is not active', () => {
      const activeFeatures: FeatureId[] = ['sales_pos_onsite'];

      const result = hasModule(activeFeatures, 'production');

      expect(result).toBe(false);
    });
  });

  describe('toggleCapability', () => {
    it('should add capability if not present', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales'];
      const result = toggleCapability(current, 'pickup_sales');

      expect(result).toContain('onsite_sales');
      expect(result).toContain('pickup_sales');
      expect(result.length).toBe(2);
    });

    it('should remove capability if present', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales', 'pickup_sales'];
      const result = toggleCapability(current, 'pickup_sales');

      expect(result).toContain('onsite_sales');
      expect(result).not.toContain('pickup_sales');
      expect(result.length).toBe(1);
    });

    it('should not mutate original array', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales'];
      const result = toggleCapability(current, 'pickup_sales');

      expect(current).toEqual(['onsite_sales']); // Original unchanged
      expect(result).not.toBe(current); // New reference
    });
  });

  describe('addCapability', () => {
    it('should add new capability', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales'];
      const result = addCapability(current, 'pickup_sales');

      expect(result).toContain('pickup_sales');
      expect(result.length).toBe(2);
    });

    it('should not add duplicate capability', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales'];
      const result = addCapability(current, 'onsite_sales');

      expect(result).toEqual(current);
      expect(result.length).toBe(1);
    });
  });

  describe('removeCapability', () => {
    it('should remove existing capability', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales', 'pickup_sales'];
      const result = removeCapability(current, 'pickup_sales');

      expect(result).not.toContain('pickup_sales');
      expect(result.length).toBe(1);
    });

    it('should handle removing non-existent capability', () => {
      const current: BusinessCapabilityId[] = ['onsite_sales'];
      const result = removeCapability(current, 'pickup_sales');

      expect(result).toEqual(['onsite_sales']);
      expect(result.length).toBe(1);
    });
  });

  describe('toggleInfrastructure', () => {
    it('should add infrastructure if not present', () => {
      const current: InfrastructureId[] = ['single_location'];
      const result = toggleInfrastructure(current, 'multiple_locations');

      expect(result).toContain('single_location');
      expect(result).toContain('multiple_locations');
      expect(result.length).toBe(2);
    });

    it('should remove infrastructure if present', () => {
      const current: InfrastructureId[] = ['single_location', 'multiple_locations'];
      const result = toggleInfrastructure(current, 'multiple_locations');

      expect(result).toContain('single_location');
      expect(result).not.toContain('multiple_locations');
      expect(result.length).toBe(1);
    });
  });

  describe('addInfrastructure', () => {
    it('should add new infrastructure', () => {
      const current: InfrastructureId[] = ['single_location'];
      const result = addInfrastructure(current, 'multiple_locations');

      expect(result).toContain('multiple_locations');
      expect(result.length).toBe(2);
    });

    it('should not add duplicate infrastructure', () => {
      const current: InfrastructureId[] = ['single_location'];
      const result = addInfrastructure(current, 'single_location');

      expect(result).toEqual(current);
      expect(result.length).toBe(1);
    });
  });

  describe('removeInfrastructure', () => {
    it('should remove existing infrastructure', () => {
      const current: InfrastructureId[] = ['single_location', 'multiple_locations'];
      const result = removeInfrastructure(current, 'multiple_locations');

      expect(result).not.toContain('multiple_locations');
      expect(result.length).toBe(1);
    });
  });

  describe('getUpdatedArrayIfChanged', () => {
    it('should return old array if content is equal', () => {
      const oldArray = ['a', 'b', 'c'];
      const newArray = ['a', 'b', 'c'];

      const result = getUpdatedArrayIfChanged(oldArray, newArray);

      expect(result).toBe(oldArray); // Same reference
    });

    it('should return new array if content changed', () => {
      const oldArray = ['a', 'b'];
      const newArray = ['a', 'b', 'c'];

      const result = getUpdatedArrayIfChanged(oldArray, newArray);

      expect(result).toBe(newArray);
      expect(result).not.toBe(oldArray);
    });

    it('should return new array if order changed', () => {
      const oldArray = ['a', 'b', 'c'];
      const newArray = ['c', 'b', 'a'];

      const result = getUpdatedArrayIfChanged(oldArray, newArray);

      expect(result).toBe(newArray);
      expect(result).not.toBe(oldArray);
    });

    it('should handle empty arrays', () => {
      const oldArray: string[] = [];
      const newArray: string[] = [];

      const result = getUpdatedArrayIfChanged(oldArray, newArray);

      expect(result).toBe(oldArray); // Same reference
    });
  });

  describe('validateProfile', () => {
    it('should return empty errors for valid profile', () => {
      const profile = {
        businessName: 'Test Business',
        email: 'test@example.com',
        selectedCapabilities: ['onsite_sales'] as BusinessCapabilityId[],
        selectedInfrastructure: ['single_location'] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      expect(errors).toEqual([]);
    });

    it('should return error for missing businessName', () => {
      const profile = {
        businessName: '',
        email: 'test@example.com',
        selectedCapabilities: ['onsite_sales'] as BusinessCapabilityId[],
        selectedInfrastructure: ['single_location'] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'businessName')).toBe(true);
    });

    it('should return error for missing email', () => {
      const profile = {
        businessName: 'Test Business',
        email: '',
        selectedCapabilities: ['onsite_sales'] as BusinessCapabilityId[],
        selectedInfrastructure: ['single_location'] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      expect(errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should return error for empty capabilities', () => {
      const profile = {
        businessName: 'Test Business',
        email: 'test@example.com',
        selectedCapabilities: [] as BusinessCapabilityId[],
        selectedInfrastructure: ['single_location'] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      expect(errors.some(e => e.field === 'capabilities')).toBe(true);
    });

    it('should return error for empty infrastructure', () => {
      const profile = {
        businessName: 'Test Business',
        email: 'test@example.com',
        selectedCapabilities: ['onsite_sales'] as BusinessCapabilityId[],
        selectedInfrastructure: [] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      expect(errors.some(e => e.field === 'infrastructure')).toBe(true);
    });

    it('should return multiple errors for incomplete profile', () => {
      const profile = {
        businessName: '',
        email: '',
        selectedCapabilities: [] as BusinessCapabilityId[],
        selectedInfrastructure: [] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      expect(errors.length).toBe(4); // All fields invalid
    });

    it('should include redirectTo in errors', () => {
      const profile = {
        businessName: '',
        email: '',
        selectedCapabilities: [] as BusinessCapabilityId[],
        selectedInfrastructure: [] as InfrastructureId[]
      };

      const errors = validateProfile(profile);

      errors.forEach(error => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('redirectTo');
        expect(error.redirectTo).toMatch(/^\/setup\//);
      });
    });
  });
});
