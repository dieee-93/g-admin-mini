/**
 * Store Integration Test for CapabilityGate System
 * Validates integration with existing businessCapabilitiesStore
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('Store Integration Validation', () => {
  it('✅ INTEGRATION: can import businessCapabilitiesStore without errors', async () => {
    expect(() => {
      // This should not throw if the store exists and is importable
      require('@/store/businessCapabilitiesStore');
    }).not.toThrow();
  });

  it('✅ INTEGRATION: legacy capability mapping works correctly', () => {
    const { mapLegacyCapabilities } = require('../utils/businessModelMapping');

    const legacyCapabilities = {
      sells_products: true,
      sells_products_for_onsite_consumption: true,
      sells_services: false,
      manages_events: false,
      manages_recurrence: false,
      sells_products_for_pickup: false,
      sells_products_with_delivery: false,
      sells_digital_products: false,
      sells_services_by_appointment: false,
      sells_services_by_class: false,
      sells_space_by_reservation: false,
      hosts_private_events: false,
      manages_offsite_catering: false,
      manages_rentals: false,
      manages_memberships: false,
      manages_subscriptions: false,
      has_online_store: false,
      is_b2b_focused: false,
    };

    const mappedCapabilities = mapLegacyCapabilities(legacyCapabilities);

    // Should include core capabilities
    expect(mappedCapabilities).toContain('customer_management');
    expect(mappedCapabilities).toContain('dashboard_analytics');
    expect(mappedCapabilities).toContain('fiscal_compliance');

    // Should map product capabilities
    expect(mappedCapabilities).toContain('sells_products');
    expect(mappedCapabilities).toContain('product_management');
    expect(mappedCapabilities).toContain('inventory_tracking');

    // Should map restaurant capabilities
    expect(mappedCapabilities).toContain('sells_products_for_onsite_consumption');
    expect(mappedCapabilities).toContain('pos_system');
    expect(mappedCapabilities).toContain('table_management');

    // Should include payment gateway for selling businesses
    expect(mappedCapabilities).toContain('payment_gateway');

    // Should NOT include service capabilities (since sells_services is false)
    expect(mappedCapabilities).not.toContain('appointment_booking');
    expect(mappedCapabilities).not.toContain('class_scheduling');
  });

  it('✅ INTEGRATION: business model detection works', () => {
    const { detectBusinessModel } = require('../utils/businessModelMapping');

    const restaurantCapabilities = [
      'customer_management',
      'sells_products',
      'sells_products_for_onsite_consumption',
      'pos_system',
      'table_management',
      'payment_gateway',
      'fiscal_compliance'
    ];

    const detectedModel = detectBusinessModel(restaurantCapabilities);
    expect(detectedModel).toBe('restaurant');
  });

  it('✅ INTEGRATION: module capabilities mapping exists', () => {
    const { moduleCapabilities } = require('../types/BusinessCapabilities');

    // Should have core modules
    expect(moduleCapabilities).toHaveProperty('customers');
    expect(moduleCapabilities).toHaveProperty('sales');
    expect(moduleCapabilities).toHaveProperty('materials');

    // Sales module should provide correct capabilities
    expect(moduleCapabilities.sales.provides).toContain('pos_system');
    expect(moduleCapabilities.sales.provides).toContain('payment_gateway');

    // Materials module should provide inventory tracking
    expect(moduleCapabilities.materials.provides).toContain('inventory_tracking');
  });

  it('✅ INTEGRATION: business model definitions exist', () => {
    const { businessModelDefinitions } = require('../types/BusinessModels');

    // Should have all major business models
    expect(businessModelDefinitions).toHaveProperty('restaurant');
    expect(businessModelDefinitions).toHaveProperty('retail');
    expect(businessModelDefinitions).toHaveProperty('services');
    expect(businessModelDefinitions).toHaveProperty('ecommerce');

    // Restaurant definition should be complete
    const restaurant = businessModelDefinitions.restaurant;
    expect(restaurant.name).toBe('Restaurante/Bar');
    expect(restaurant.category).toBe('products');
    expect(restaurant.complexity).toBe('intermediate');
    expect(restaurant.defaultCapabilities).toContain('pos_system');
  });

  it('✅ VALIDATION: capability system constants are consistent', () => {
    const { businessModelCapabilities, defaultCapabilities } = require('../types/BusinessCapabilities');

    // Default capabilities should be all false initially
    expect(defaultCapabilities.sells_products).toBe(false);
    expect(defaultCapabilities.sells_services).toBe(false);
    expect(defaultCapabilities.has_online_store).toBe(false);

    // Business model capabilities should exist for main models
    expect(businessModelCapabilities).toHaveProperty('restaurant');
    expect(businessModelCapabilities).toHaveProperty('retail');
    expect(businessModelCapabilities).toHaveProperty('services');

    // Restaurant capabilities should be reasonable
    const restaurantCaps = businessModelCapabilities.restaurant;
    expect(restaurantCaps).toContain('customer_management');
    expect(restaurantCaps).toContain('pos_system');
    expect(restaurantCaps).toContain('fiscal_compliance');
  });

  it('✅ SYSTEM: can create a complete restaurant scenario', () => {
    const { mapLegacyCapabilities, detectBusinessModel } = require('../utils/businessModelMapping');

    // Simulate a restaurant setup
    const restaurantLegacySetup = {
      sells_products: true,
      sells_products_for_onsite_consumption: true,
      sells_services: false,
      manages_events: false,
      manages_recurrence: false,
      sells_products_for_pickup: true, // Enable takeaway
      sells_products_with_delivery: false,
      sells_digital_products: false,
      sells_services_by_appointment: false,
      sells_services_by_class: false,
      sells_space_by_reservation: false,
      hosts_private_events: false,
      manages_offsite_catering: false,
      manages_rentals: false,
      manages_memberships: false,
      manages_subscriptions: false,
      has_online_store: false,
      is_b2b_focused: false,
    };

    // Map to new capabilities
    const capabilities = mapLegacyCapabilities(restaurantLegacySetup);

    // Detect business model
    const businessModel = detectBusinessModel(capabilities);

    // Should detect as restaurant
    expect(businessModel).toBe('restaurant');

    // Should have restaurant capabilities
    expect(capabilities).toContain('sells_products_for_onsite_consumption');
    expect(capabilities).toContain('sells_products_for_pickup');
    expect(capabilities).toContain('pos_system');
    expect(capabilities).toContain('table_management');
    expect(capabilities).toContain('payment_gateway');

    // Should not have service capabilities
    expect(capabilities).not.toContain('appointment_booking');
    expect(capabilities).not.toContain('class_scheduling');
  });
});