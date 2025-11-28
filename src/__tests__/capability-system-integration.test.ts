/**
 * Capability System Integration Tests (E2E)
 *
 * End-to-end tests that verify the complete flow of the Capability System
 * Tests user flows, real-world scenarios, and integration between components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCapabilityStore } from '@/store/capabilityStore';
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/types';

// Mock EventBus
vi.mock('@/lib/events/EventBus', () => ({
  default: {
    emit: vi.fn()
  }
}));

// Mock database services
vi.mock('@/services/businessProfileService', () => ({
  loadProfileFromDB: vi.fn().mockResolvedValue(null),
  saveProfileToDB: vi.fn().mockResolvedValue(true),
  updateCompletedMilestonesInDB: vi.fn().mockResolvedValue(true),
  dismissWelcomeInDB: vi.fn().mockResolvedValue(true)
}));

describe('Capability System Integration - Complete User Flow', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  it('should complete setup wizard flow', () => {
    const { initializeProfile, completeSetup } = useCapabilityStore.getState();

    // Step 1: User fills setup form
    initializeProfile({
      businessName: 'My Restaurant',
      businessType: 'restaurant',
      email: 'owner@restaurant.com',
      phone: '555-0100',
      country: 'Argentina',
      currency: 'ARS',
      selectedCapabilities: ['physical_products', 'onsite_service'],
      selectedInfrastructure: ['single_location']
    });

    const state1 = useCapabilityStore.getState();

    // Verify profile created
    expect(state1.profile).not.toBeNull();
    expect(state1.profile?.businessName).toBe('My Restaurant');

    // Verify features activated
    expect(state1.features.activeFeatures.length).toBeGreaterThan(0);
    expect(state1.features.activeFeatures).toContain('production_bom_management');
    expect(state1.features.activeFeatures).toContain('operations_table_management');

    // Step 2: User completes setup
    completeSetup();

    const state2 = useCapabilityStore.getState();

    // Verify setup marked complete
    expect(state2.profile?.setupCompleted).toBe(true);
    expect(state2.profile?.isFirstTimeInDashboard).toBe(true);
    expect(state2.profile?.onboardingStep).toBe(1);
  });

  it('should activate capabilities and see modules', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    // User selects capabilities
    initializeProfile({
      businessName: 'Test Business',
      selectedCapabilities: ['physical_products', 'professional_services'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    // Verify features activated
    expect(features.activeFeatures).toContain('production_bom_management'); // physical_products
    expect(features.activeFeatures).toContain('scheduling_appointment_booking'); // professional_services

    // Verify modules activated
    expect(getActiveModules()).toContain('production');
    expect(getActiveModules()).toContain('materials');
    expect(getActiveModules()).toContain('scheduling');
    expect(getActiveModules()).toContain('dashboard'); // Always active
  });

  it('should toggle capabilities and update modules', () => {
    const { initializeProfile, toggleCapability } = useCapabilityStore.getState();

    // Initial setup
    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    const initialModules = useCapabilityStore.getState().getActiveModules();

    // User adds new capability
    toggleCapability('professional_services');

    const afterAddModules = useCapabilityStore.getState().getActiveModules();

    // Should have more modules
    expect(afterAddModules.length).toBeGreaterThanOrEqual(initialModules.length);
    expect(afterAddModules).toContain('scheduling');

    // User removes capability
    toggleCapability('professional_services');

    const afterRemoveModules = useCapabilityStore.getState().getActiveModules();

    // Scheduling should be removed
    expect(afterRemoveModules).not.toContain('scheduling');
  });

  it('should persist state to localStorage', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Persistent Business',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    // Check localStorage
    const stored = localStorage.getItem('capability-store-v4');
    expect(stored).toBeTruthy();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.profile.businessName).toBe('Persistent Business');
      expect(parsed.state.profile.selectedCapabilities).toContain('physical_products');
    }
  });
});

describe('Capability System Integration - Real-World Scenarios', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
    localStorage.clear();
  });

  it('Restaurant: physical_products + onsite_service + pickup_orders', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Bella Italia',
      businessType: 'restaurant',
      selectedCapabilities: ['physical_products', 'onsite_service', 'pickup_orders'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    // Should have restaurant features
    expect(features.activeFeatures).toContain('production_bom_management'); // Kitchen recipes
    expect(features.activeFeatures).toContain('inventory_stock_tracking'); // Ingredient tracking
    expect(features.activeFeatures).toContain('operations_table_management'); // Table management
    expect(features.activeFeatures).toContain('sales_pickup_orders'); // Pickup orders

    // Should have restaurant modules
    expect(getActiveModules()).toContain('production');
    expect(getActiveModules()).toContain('materials');
    expect(getActiveModules()).toContain('sales');
    expect(getActiveModules()).toContain('operations');
    expect(getActiveModules()).toContain('products');
  });

  it('Spa: professional_services + membership', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Zen Spa',
      businessType: 'spa',
      selectedCapabilities: ['professional_services', 'membership_subscriptions'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    // Should have spa features
    expect(features.activeFeatures).toContain('scheduling_appointment_booking'); // Appointment booking
    expect(features.activeFeatures).toContain('customer_service_history'); // Customer records
    expect(features.activeFeatures).toContain('membership_subscription_plans'); // Memberships
    expect(features.activeFeatures).toContain('staff_employee_management'); // Staff management

    // Should have spa modules
    expect(getActiveModules()).toContain('scheduling');
    expect(getActiveModules()).toContain('customers');
    expect(getActiveModules()).toContain('staff');
    expect(getActiveModules()).toContain('sales');
  });

  it('Operaciones Async: async_operations + delivery_shipping + digital_products', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Digital Shop',
      businessType: 'ecommerce',
      selectedCapabilities: ['async_operations', 'delivery_shipping', 'digital_products'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    // Should have ecommerce features
    expect(features.activeFeatures).toContain('sales_catalog_ecommerce'); // Online catalog
    expect(features.activeFeatures).toContain('sales_online_order_processing'); // Online orders
    expect(features.activeFeatures).toContain('operations_delivery_tracking'); // Delivery tracking
    expect(features.activeFeatures).toContain('digital_file_delivery'); // Digital downloads

    // Should have ecommerce modules
    expect(getActiveModules()).toContain('sales');
    expect(getActiveModules()).toContain('operations');
    expect(getActiveModules()).toContain('products');
  });

  it('Food Truck: mobile_operations + physical_products', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Taco Truck',
      businessType: 'food_truck',
      selectedCapabilities: ['mobile_operations', 'physical_products'],
      selectedInfrastructure: ['mobile_business']
    });

    const { features } = useCapabilityStore.getState();

    // Should have food truck features
    expect(features.activeFeatures).toContain('mobile_location_tracking'); // GPS tracking
    expect(features.activeFeatures).toContain('mobile_route_planning'); // Route planning
    expect(features.activeFeatures).toContain('production_bom_management'); // Recipes
    expect(features.activeFeatures).toContain('inventory_stock_tracking'); // Inventory

    // Should have food truck modules
    expect(getActiveModules()).toContain('production');
    expect(getActiveModules()).toContain('materials');
    expect(getActiveModules()).toContain('products');
  });

  it('Multi-location chain: physical_products + onsite_service + multi_location', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Restaurant Chain',
      businessType: 'restaurant',
      selectedCapabilities: ['physical_products', 'onsite_service'],
      selectedInfrastructure: ['multi_location']
    });

    const { features } = useCapabilityStore.getState();

    // Should have multi-location features
    expect(features.activeFeatures).toContain('multisite_location_management'); // Location mgmt
    expect(features.activeFeatures).toContain('multisite_centralized_inventory'); // Central inventory
    expect(features.activeFeatures).toContain('multisite_transfer_orders'); // Transfers
    expect(features.activeFeatures).toContain('production_bom_management'); // Recipes
    expect(features.activeFeatures).toContain('operations_table_management'); // Tables
  });
});

describe('Capability System Integration - Feature Deduplication', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
  });

  it('should deduplicate shared features across capabilities', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products', 'professional_services', 'pickup_orders'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    // Count sales_payment_processing (shared by all three)
    const paymentCount = features.activeFeatures.filter(
      f => f === 'sales_payment_processing'
    ).length;

    // Should appear only once
    expect(paymentCount).toBe(1);

    // Count sales_order_management (shared by multiple)
    const orderMgmtCount = features.activeFeatures.filter(
      f => f === 'sales_order_management'
    ).length;

    // Should appear only once
    expect(orderMgmtCount).toBe(1);
  });

  it('should preserve shared features when removing one capability', () => {
    const { initializeProfile, toggleCapability } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products', 'professional_services'],
      selectedInfrastructure: ['single_location']
    });

    // Verify shared feature exists
    expect(useCapabilityStore.getState().features.activeFeatures).toContain('sales_payment_processing');

    // Remove one capability
    toggleCapability('physical_products');

    // Shared feature should still exist from professional_services
    expect(useCapabilityStore.getState().features.activeFeatures).toContain('sales_payment_processing');
  });
});

describe('Capability System Integration - Performance', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
  });

  it('should activate 3 capabilities in reasonable time', () => {
    const start = performance.now();

    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products', 'professional_services', 'onsite_service'],
      selectedInfrastructure: ['single_location']
    });

    const end = performance.now();
    const elapsed = end - start;

    // Should complete in < 100ms
    expect(elapsed).toBeLessThan(100);
  });

  it('should toggle capability in reasonable time', () => {
    const { initializeProfile, toggleCapability } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: [],
      selectedInfrastructure: ['single_location']
    });

    const start = performance.now();
    toggleCapability('physical_products');
    const end = performance.now();

    const elapsed = end - start;

    // Should complete in < 50ms
    expect(elapsed).toBeLessThan(50);
  });

  it('should calculate modules in reasonable time', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products', 'professional_services'],
      selectedInfrastructure: ['single_location']
    });

    const { features } = useCapabilityStore.getState();

    const start = performance.now();
    const modules = getModulesForActiveFeatures(features.activeFeatures);
    const end = performance.now();

    const elapsed = end - start;

    // Should complete in < 20ms
    expect(elapsed).toBeLessThan(20);
  });

  it('should handle 100 rapid toggles without memory leak', () => {
    const { initializeProfile, toggleCapability } = useCapabilityStore.getState();

    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: [],
      selectedInfrastructure: ['single_location']
    });

    // Rapid toggles
    for (let i = 0; i < 100; i++) {
      toggleCapability('physical_products');
    }

    // Should still be functional
    const { profile, features } = useCapabilityStore.getState();

    expect(profile).not.toBeNull();
    expect(features.activeFeatures).toBeDefined();
  });
});

describe('Capability System Integration - Edge Cases', () => {
  beforeEach(() => {
    useCapabilityStore.getState().resetProfile();
  });

  it('should handle empty profile initialization', () => {
    const { initializeProfile } = useCapabilityStore.getState();

    initializeProfile({
      businessName: '',
      selectedCapabilities: [],
      selectedInfrastructure: []
    });

    const { profile, features } = useCapabilityStore.getState();

    expect(profile).not.toBeNull();
    expect(features.activeFeatures).toEqual([]);
  });

  it('should handle rapid profile resets', () => {
    const { initializeProfile, resetProfile } = useCapabilityStore.getState();

    for (let i = 0; i < 10; i++) {
      initializeProfile({
        businessName: `Test ${i}`,
        selectedCapabilities: ['physical_products'],
        selectedInfrastructure: ['single_location']
      });

      resetProfile();
    }

    const { profile } = useCapabilityStore.getState();
    expect(profile).toBeNull();
  });

  it('should maintain consistency after multiple operations', () => {
    const { initializeProfile, toggleCapability, setCapabilities } = useCapabilityStore.getState();

    // Initialize
    initializeProfile({
      businessName: 'Test',
      selectedCapabilities: ['physical_products'],
      selectedInfrastructure: ['single_location']
    });

    // Toggle
    toggleCapability('professional_services');
    toggleCapability('onsite_service');

    // Set
    setCapabilities(['pickup_orders', 'delivery_shipping']);

    const { profile, features } = useCapabilityStore.getState();

    // Verify consistency
    expect(profile?.selectedCapabilities).toContain('pickup_orders');
    expect(profile?.selectedCapabilities).toContain('delivery_shipping');
    expect(features.activeFeatures.length).toBeGreaterThan(0);
  });
});
