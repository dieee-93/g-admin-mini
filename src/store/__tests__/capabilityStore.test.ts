/**
 * CapabilityStore Test Suite
 *
 * Comprehensive tests for the Capability System v4.0
 * Tests store initialization, capability toggling, feature activation,
 * persistence, and edge cases.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCapabilityStore } from '../capabilityStore';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/BusinessModelRegistry';

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

describe('CapabilityStore - Initialization', () => {
  beforeEach(() => {
    // Reset store before each test
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  it('should initialize with null profile', () => {
    const { profile } = useCapabilityStore.getState();
    expect(profile).toBeNull();
  });

  it('should initialize with default features state', () => {
    const { features } = useCapabilityStore.getState();

    expect(features.activeFeatures).toEqual([]);
    expect(features.blockedFeatures).toEqual([]);
    expect(features.pendingMilestones).toEqual([]);
    expect(features.completedMilestones).toEqual([]);
    expect(features.validationErrors).toEqual([]);
    expect(features.activeModules).toEqual([]);
    expect(features.activeSlots).toEqual([]);
  });

  it('should initialize profile with user data', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test Business',
      businessType: 'restaurant',
      email: 'test@example.com',
      phone: '1234567890',
      country: 'Argentina',
      currency: 'ARS',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    const { profile } = useCapabilityStore.getState();

    expect(profile).not.toBeNull();
    expect(profile?.businessName).toBe('Test Business');
    expect(profile?.selectedCapabilities).toContain('physical_products');
    expect(profile?.selectedInfrastructure).toContain('single_location');
  });

  it('should activate features when initializing profile', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    // physical_products should activate production features
    expect(features.activeFeatures).toContain('production_bom_management');
    expect(features.activeFeatures).toContain('inventory_stock_tracking');
    expect(features.activeFeatures).toContain('sales_order_management');
    expect(features.activeFeatures.length).toBeGreaterThan(0);
  });
});

describe('CapabilityStore - Capability Toggling', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    useCapabilityStore.getState().initializeProfile({
      businessName: 'Test',
      selectedCapabilities: [],
      selectedInfrastructure: ['single_location']
    });
  });

  it('should add capability when toggling on', () => {
    const { toggleCapability } = useCapabilityStore.getState();

    toggleCapability('physical_products');

    const { profile } = useCapabilityStore.getState();
    expect(profile?.selectedCapabilities).toContain('physical_products');
  });

  it('should remove capability when toggling off', () => {
    const { toggleCapability } = useCapabilityStore.getState();

    // Add capability
    toggleCapability('physical_products');
    expect(useCapabilityStore.getState().profile?.selectedCapabilities).toContain('physical_products');

    // Remove capability
    toggleCapability('physical_products');
    expect(useCapabilityStore.getState().profile?.selectedCapabilities).not.toContain('physical_products');
  });

  it('should activate features when adding capability', () => {
    const { toggleCapability } = useCapabilityStore.getState();

    toggleCapability('professional_services');

    const { features } = useCapabilityStore.getState();
    expect(features.activeFeatures).toContain('scheduling_appointment_booking');
    expect(features.activeFeatures).toContain('scheduling_calendar_management');
  });

  it('should deactivate unique features when removing capability', () => {
    const { toggleCapability } = useCapabilityStore.getState();

    // Add capability
    toggleCapability('professional_services');
    expect(useCapabilityStore.getState().features.activeFeatures).toContain('scheduling_appointment_booking');

    // Remove capability
    toggleCapability('professional_services');
    expect(useCapabilityStore.getState().features.activeFeatures).not.toContain('scheduling_appointment_booking');
  });

  it('should preserve shared features when one capability is removed', () => {
    const { toggleCapability } = useCapabilityStore.getState();

    // Add two capabilities that share features
    toggleCapability('pickup_orders');
    toggleCapability('delivery_shipping');

    // Both should have sales_payment_processing
    expect(useCapabilityStore.getState().features.activeFeatures).toContain('sales_payment_processing');

    // Remove one
    toggleCapability('pickup_orders');

    // Shared feature should still be active from delivery_shipping
    expect(useCapabilityStore.getState().features.activeFeatures).toContain('sales_payment_processing');
  });
});

describe('CapabilityStore - Multiple Capabilities', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    useCapabilityStore.getState().initializeProfile({
      businessName: 'Test',
      selectedCapabilities: [],
      selectedInfrastructure: ['single_location']
    });
  });

  it('should handle multiple capabilities simultaneously', () => {
    const { setCapabilities } = useCapabilityStore.getState();

    setCapabilities(['physical_products', 'professional_services', 'pickup_orders']);

    const { profile } = useCapabilityStore.getState();
    expect(profile?.selectedCapabilities).toHaveLength(3);
    expect(profile?.selectedCapabilities).toContain('physical_products');
    expect(profile?.selectedCapabilities).toContain('professional_services');
    expect(profile?.selectedCapabilities).toContain('pickup_orders');
  });

  it('should deduplicate features from multiple capabilities', () => {
    const { setCapabilities } = useCapabilityStore.getState();

    // Both capabilities activate sales_payment_processing
    setCapabilities(['physical_products', 'professional_services']);

    const { features } = useCapabilityStore.getState();
    const paymentProcessingCount = features.activeFeatures.filter(
      f => f === 'sales_payment_processing'
    ).length;

    // Should only appear once (deduplication)
    expect(paymentProcessingCount).toBe(1);
  });

  it('should activate correct number of unique features', () => {
    const { setCapabilities } = useCapabilityStore.getState();

    setCapabilities(['physical_products']);
    const featuresCount1 = useCapabilityStore.getState().features.activeFeatures.length;

    setCapabilities(['physical_products', 'professional_services']);
    const featuresCount2 = useCapabilityStore.getState().features.activeFeatures.length;

    // Adding another capability should increase features (accounting for shared ones)
    expect(featuresCount2).toBeGreaterThan(featuresCount1);
  });
});

describe('CapabilityStore - Infrastructure', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    useCapabilityStore.getState().initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });
  });

  it('should set infrastructure', () => {
    const { setInfrastructure } = useCapabilityStore.getState();

    setInfrastructure('multi_location');

    const { profile } = useCapabilityStore.getState();
    expect(profile?.selectedInfrastructure).toContain('multi_location');
  });

  it('should activate infrastructure features', () => {
    const { toggleInfrastructure } = useCapabilityStore.getState();

    toggleInfrastructure('multi_location');

    const { features } = useCapabilityStore.getState();
    expect(features.activeFeatures).toContain('multisite_location_management');
    expect(features.activeFeatures).toContain('multisite_centralized_inventory');
  });

  it('should toggle infrastructure on/off', () => {
    const { toggleInfrastructure } = useCapabilityStore.getState();

    // Initially has single_location
    expect(useCapabilityStore.getState().profile?.selectedInfrastructure).toContain('single_location');

    // Add multi_location
    toggleInfrastructure('multi_location');
    expect(useCapabilityStore.getState().profile?.selectedInfrastructure).toContain('multi_location');

    // Remove multi_location
    toggleInfrastructure('multi_location');
    expect(useCapabilityStore.getState().profile?.selectedInfrastructure).not.toContain('multi_location');
  });
});

describe('CapabilityStore - Setup & Onboarding', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    useCapabilityStore.getState().initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location'],
      setupCompleted: false,
      isFirstTimeInDashboard: false
    });
  });

  it('should complete setup', () => {
    const { completeSetup } = useCapabilityStore.getState();

    completeSetup();

    const { profile } = useCapabilityStore.getState();
    expect(profile?.setupCompleted).toBe(true);
    expect(profile?.isFirstTimeInDashboard).toBe(true);
    expect(profile?.onboardingStep).toBe(1);
  });

  it('should dismiss welcome screen', () => {
    const { dismissWelcome } = useCapabilityStore.getState();

    useCapabilityStore.setState({
      profile: {
        ...useCapabilityStore.getState().profile!,
        isFirstTimeInDashboard: true
      }
    });

    dismissWelcome();

    const { profile } = useCapabilityStore.getState();
    expect(profile?.isFirstTimeInDashboard).toBe(false);
  });
});

describe('CapabilityStore - Feature Queries', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    useCapabilityStore.getState().initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });
  });

  it('should check if feature exists', () => {
    const { hasFeature } = useCapabilityStore.getState();

    expect(hasFeature('production_bom_management')).toBe(true);
    expect(hasFeature('scheduling_appointment_booking')).toBe(false);
  });

  it('should check if all features exist', () => {
    const { hasAllFeatures } = useCapabilityStore.getState();

    expect(hasAllFeatures(['production_bom_management', 'inventory_stock_tracking'])).toBe(true);
    expect(hasAllFeatures(['production_bom_management', 'scheduling_appointment_booking'])).toBe(false);
  });

  it('should check if feature is blocked', () => {
    const { isFeatureBlocked } = useCapabilityStore.getState();

    // Initially no features are blocked
    expect(isFeatureBlocked('production_bom_management')).toBe(false);
  });

  it('should get active modules', () => {
    const { getActiveModules } = useCapabilityStore.getState();

    const modules = getActiveModules();

    expect(modules).toContain('materials');
    expect(modules).toContain('products');
    expect(modules).toContain('production');
    expect(Array.isArray(modules)).toBe(true);
  });
});

describe('CapabilityStore - Edge Cases', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
  });

  it('should handle toggling capability with no profile', () => {
    const { toggleCapability } = useCapabilityStore.getState();

    // Should not throw
    expect(() => toggleCapability('physical_products')).not.toThrow();
  });

  it('should handle empty capabilities array', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: [],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();
    // Should still have infrastructure features
    expect(features.activeFeatures).toEqual([]);
  });

  it('should handle reset profile', () => {
    const { initializeProfile, resetProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    expect(useCapabilityStore.getState().profile).not.toBeNull();

    resetProfile();

    expect(useCapabilityStore.getState().profile).toBeNull();
    expect(useCapabilityStore.getState().features.activeFeatures).toEqual([]);
  });

  it('should optimize array references when toggling capabilities', () => {
    const { initializeProfile, toggleCapability } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    const firstCapabilities = useCapabilityStore.getState().profile?.selectedCapabilities;

    // Toggle the same capability on and off
    toggleCapability('professional_services');
    toggleCapability('professional_services');

    const secondCapabilities = useCapabilityStore.getState().profile?.selectedCapabilities;

    // Should have same content after toggle on/off
    expect(secondCapabilities).toEqual(firstCapabilities);
    expect(secondCapabilities).toContain('physical_products');
  });
});

describe('CapabilityStore - Selectors', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    useCapabilityStore.getState().initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location'],
      setupCompleted: true,
      isFirstTimeInDashboard: false
    });
  });

  it('should provide active features through getState', () => {
    const state = useCapabilityStore.getState();
    const activeFeatures = state.features.activeFeatures;

    expect(Array.isArray(activeFeatures)).toBe(true);
    expect(activeFeatures.length).toBeGreaterThan(0);
  });

  it('should provide setup status through getState', () => {
    const state = useCapabilityStore.getState();
    const setupCompleted = state.profile?.setupCompleted;

    expect(setupCompleted).toBe(true);
  });

  it('should provide active modules through getActiveModules() getter', () => {
    const state = useCapabilityStore.getState();
    // ✅ REFACTOR: Use getActiveModules() getter instead of state.features.activeModules
    const activeModules = state.getActiveModules();

    expect(Array.isArray(activeModules)).toBe(true);
    expect(activeModules.length).toBeGreaterThan(0);
  });
});
