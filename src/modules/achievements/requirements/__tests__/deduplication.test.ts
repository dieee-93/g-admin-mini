/**
 * DEDUPLICATION LOGIC TEST
 * 
 * Tests the reference-based deduplication system.
 * Run this with: npx tsx src/modules/achievements/requirements/__tests__/deduplication.test.ts
 */

import { describe, it, expect } from 'vitest';
import type { Achievement } from '../../types';
import {
  deduplicateRequirements,
  filterByCapabilities,
  validateNoConflicts,
  generateDeduplicationReport,
  type RequirementRegistration,
} from '../deduplication';

// ============================================
// MOCK SHARED REQUIREMENTS (simulating imports)
// ============================================

const SHARED_CUSTOMER: Achievement = {
  id: 'customer_first_added',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Add first customer',
  description: 'Add your first customer',
  icon: '👤',
  category: 'setup',
  validator: () => false,
  estimatedMinutes: 3,
};

const SHARED_PRODUCT: Achievement = {
  id: 'product_first_published',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Publish first product',
  description: 'Publish your first product',
  icon: '📦',
  category: 'setup',
  validator: () => false,
  estimatedMinutes: 5,
};

// Module-specific requirements
const DELIVERY_ZONE: Achievement = {
  id: 'delivery_zone_configured',
  tier: 'mandatory',
  capability: 'delivery_shipping',
  name: 'Configure delivery zone',
  description: 'Set up your delivery zones',
  icon: '🚚',
  category: 'setup',
  validator: () => false,
  estimatedMinutes: 10,
};

const ONLINE_CATALOG: Achievement = {
  id: 'online_catalog_setup',
  tier: 'mandatory',
  capability: 'async_operations',
  name: 'Setup online catalog',
  description: 'Configure your online store',
  icon: '🛒',
  category: 'setup',
  validator: () => false,
  estimatedMinutes: 15,
};

describe('Reference-based Deduplication', () => {
  it('should deduplicate shared requirements by reference', () => {
    // Simulate two modules importing the SAME shared requirement
    const deliveryReqs = [SHARED_CUSTOMER, SHARED_PRODUCT, DELIVERY_ZONE];
    const ecommerceReqs = [SHARED_CUSTOMER, SHARED_PRODUCT, ONLINE_CATALOG];

    const registrations: RequirementRegistration[] = [
      {
        capability: 'delivery_shipping',
        requirements: deliveryReqs,
        moduleId: 'delivery',
      },
      {
        capability: 'async_operations',
        requirements: ecommerceReqs,
        moduleId: 'ecommerce',
      },
    ];

    const deduplicated = deduplicateRequirements(registrations);

    // Should have 4 unique requirements (not 6)
    expect(deduplicated.requirements).toHaveLength(4);
    
    // Check that SHARED_CUSTOMER appears only once
    const customerReqs = deduplicated.requirements.filter(
      (r) => r.id === 'customer_first_added'
    );
    expect(customerReqs).toHaveLength(1);
    
    // Verify it's the SAME object reference
    expect(customerReqs[0]).toBe(SHARED_CUSTOMER);
  });

  it('should track usage across multiple capabilities', () => {
    const registrations: RequirementRegistration[] = [
      {
        capability: 'delivery_shipping',
        requirements: [SHARED_CUSTOMER, DELIVERY_ZONE],
        moduleId: 'delivery',
      },
      {
        capability: 'async_operations',
        requirements: [SHARED_CUSTOMER, ONLINE_CATALOG],
        moduleId: 'ecommerce',
      },
    ];

    const deduplicated = deduplicateRequirements(registrations);
    
    // SHARED_CUSTOMER should be tracked as used by 2 capabilities
    const customerUsage = deduplicated.usageMap.get('customer_first_added');
    expect(customerUsage?.size).toBe(2);
    expect(customerUsage?.has('delivery_shipping')).toBe(true);
    expect(customerUsage?.has('async_operations')).toBe(true);
    
    // DELIVERY_ZONE should be used by only 1 capability
    const deliveryUsage = deduplicated.usageMap.get('delivery_zone_configured');
    expect(deliveryUsage?.size).toBe(1);
    expect(deliveryUsage?.has('delivery_shipping')).toBe(true);
  });

  it('should filter requirements by selected capabilities', () => {
    const registrations: RequirementRegistration[] = [
      {
        capability: 'delivery_shipping',
        requirements: [SHARED_CUSTOMER, DELIVERY_ZONE],
        moduleId: 'delivery',
      },
      {
        capability: 'async_operations',
        requirements: [SHARED_CUSTOMER, ONLINE_CATALOG],
        moduleId: 'ecommerce',
      },
    ];

    const deduplicated = deduplicateRequirements(registrations);
    
    // User selects only delivery
    const deliveryOnly = filterByCapabilities(deduplicated, ['delivery_shipping']);
    expect(deliveryOnly).toHaveLength(2); // SHARED_CUSTOMER + DELIVERY_ZONE
    expect(deliveryOnly.some((r) => r.id === 'customer_first_added')).toBe(true);
    expect(deliveryOnly.some((r) => r.id === 'delivery_zone_configured')).toBe(true);
    expect(deliveryOnly.some((r) => r.id === 'online_catalog_setup')).toBe(false);
    
    // User selects both capabilities
    const both = filterByCapabilities(deduplicated, ['delivery_shipping', 'async_operations']);
    expect(both).toHaveLength(3); // Shared requirements appear once (SHARED_CUSTOMER) + 2 capability-specific
  });

  it('should detect ID conflicts when different objects have same ID', () => {
    // Create a DIFFERENT object with the same ID (this is a bug scenario)
    const conflictingCustomer: Achievement = {
      id: 'customer_first_added', // ❌ Same ID as SHARED_CUSTOMER
      tier: 'mandatory',
      capability: 'corporate_sales',
      name: 'Add corporate customer', // Different name
      description: 'Different description',
      icon: '🏢',
      category: 'setup',
      validator: () => true,
      estimatedMinutes: 5,
    };

    const registrations: RequirementRegistration[] = [
      {
        capability: 'delivery_shipping',
        requirements: [SHARED_CUSTOMER],
        moduleId: 'delivery',
      },
      {
        capability: 'corporate_sales',
        requirements: [conflictingCustomer],
        moduleId: 'corporate',
      },
    ];

    const conflicts = validateNoConflicts(registrations);
    
    // Should detect 1 conflict
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].id).toBe('customer_first_added');
    expect(conflicts[0].conflict).toContain('ID conflict');
  });

  it('should NOT report conflict when same object is imported multiple times', () => {
    const registrations: RequirementRegistration[] = [
      {
        capability: 'delivery_shipping',
        requirements: [SHARED_CUSTOMER, SHARED_PRODUCT],
        moduleId: 'delivery',
      },
      {
        capability: 'async_operations',
        requirements: [SHARED_CUSTOMER, SHARED_PRODUCT],
        moduleId: 'ecommerce',
      },
    ];

    const conflicts = validateNoConflicts(registrations);
    
    // No conflicts - same object reference is valid
    expect(conflicts).toHaveLength(0);
  });

  it('should generate correct deduplication report', () => {
    const registrations: RequirementRegistration[] = [
      {
        capability: 'delivery_shipping',
        requirements: [SHARED_CUSTOMER, SHARED_PRODUCT, DELIVERY_ZONE],
        moduleId: 'delivery',
      },
      {
        capability: 'async_operations',
        requirements: [SHARED_CUSTOMER, SHARED_PRODUCT, ONLINE_CATALOG],
        moduleId: 'ecommerce',
      },
    ];

    const report = generateDeduplicationReport(registrations);
    
    expect(report.totalRegistrations).toBe(2);
    expect(report.totalRequirementsBeforeDedup).toBe(6); // 3 + 3
    expect(report.totalRequirementsAfterDedup).toBe(4); // Deduplicated
    expect(report.deduplicationSavings).toBe(2); // 6 - 4
    
    // Should detect 2 duplicates (SHARED_CUSTOMER and SHARED_PRODUCT)
    expect(report.duplicatesByReference).toHaveLength(2);
    
    // Both should be same object reference
    const customerDup = report.duplicatesByReference.find(
      (d) => d.requirementId === 'customer_first_added'
    );
    expect(customerDup?.sameObjectReference).toBe(true);
    expect(customerDup?.occurrences).toBe(2);
  });
});
