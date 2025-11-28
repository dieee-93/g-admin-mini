/**
 * ACHIEVEMENTS SYSTEM - UNIT TESTS
 * 
 * Tests unitarios para validadores de requirements.
 * Prueba las funciones validator de cada requirement de forma aislada.
 * 
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  TAKEAWAY_MANDATORY,
  DINEIN_MANDATORY,
  ECOMMERCE_MANDATORY,
  DELIVERY_MANDATORY,
  PHYSICAL_PRODUCTS_MANDATORY,
  PROFESSIONAL_SERVICES_MANDATORY,
  ASSET_RENTAL_MANDATORY,
  MEMBERSHIP_MANDATORY,
  DIGITAL_PRODUCTS_MANDATORY,
  CORPORATE_SALES_MANDATORY,
  MOBILE_OPERATIONS_MANDATORY,
  CUMULATIVE_ACHIEVEMENTS,
} from '@/modules/achievements/constants';
import type { ValidationContext } from '@/modules/achievements/types';

// ============================================
// MOCK CONTEXTS
// ============================================

/**
 * Context base vacío
 */
const emptyContext: ValidationContext = {
  profile: null,
  products: [],
  staff: [],
  tables: [],
  paymentMethods: [],
  paymentGateways: [],
  deliveryZones: [],
  materials: [],
  assets: [],
  suppliers: [],
  salesCount: 0,
};

/**
 * Context con business profile completo
 */
const completeProfileContext: ValidationContext = {
  ...emptyContext,
  profile: {
    businessName: 'Test Restaurant',
    address: '123 Main St, Buenos Aires',
    logoUrl: 'https://example.com/logo.png',
    taxId: '20-12345678-9',
    contactEmail: 'contact@test.com',
    contactPhone: '+54 11 1234-5678',
    operatingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
    },
    pickupHours: {
      monday: { open: '10:00', close: '20:00' },
    },
    deliveryHours: {
      monday: { open: '11:00', close: '22:00' },
    },
    shippingPolicy: 'Free shipping over $1000',
    termsAndConditions: 'Terms and conditions apply',
  },
};

/**
 * Context con productos publicados
 */
const productsContext: ValidationContext = {
  ...emptyContext,
  products: [
    { id: '1', name: 'Product 1', is_published: true, images: ['img1.jpg'] },
    { id: '2', name: 'Product 2', is_published: true, images: ['img2.jpg'] },
    { id: '3', name: 'Product 3', is_published: true, images: [] },
    { id: '4', name: 'Product 4', is_published: false },
    { id: '5', name: 'Product 5', is_published: true },
    { id: '6', name: 'Product 6', is_published: true },
  ],
};

/**
 * Context con staff activo
 */
const staffContext: ValidationContext = {
  ...emptyContext,
  staff: [
    { id: '1', name: 'John Doe', is_active: true, role: 'staff' },
    { id: '2', name: 'Jane Smith', is_active: true, role: 'courier' },
    { id: '3', name: 'Bob Johnson', is_active: false, role: 'staff' },
  ],
};

/**
 * Context con payment methods configurados
 */
const paymentMethodsContext: ValidationContext = {
  ...emptyContext,
  paymentMethods: [
    { id: '1', name: 'Efectivo', is_active: true },
    { id: '2', name: 'Tarjeta', is_active: true },
  ],
  paymentGateways: [
    { id: 'mp-1', type: 'online', is_active: true },
    { id: 'modo-1', type: 'online', is_active: true },
  ],
};

// ============================================
// TAKEAWAY REQUIREMENTS TESTS
// ============================================

describe('TAKEAWAY Requirements - Validators', () => {
  it('should validate business name requirement', () => {
    const req = TAKEAWAY_MANDATORY.find((r) => r.id === 'takeaway_business_name')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(completeProfileContext)).toBe(true);

    // Edge case: empty string
    expect(
      req.validator({
        ...emptyContext,
        profile: { businessName: '   ' },
      })
    ).toBe(false);

    // Edge case: null
    expect(
      req.validator({
        ...emptyContext,
        profile: { businessName: undefined },
      })
    ).toBe(false);
  });

  it('should validate address requirement', () => {
    const req = TAKEAWAY_MANDATORY.find((r) => r.id === 'takeaway_address')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(completeProfileContext)).toBe(true);
  });

  it('should validate pickup hours requirement', () => {
    const req = TAKEAWAY_MANDATORY.find((r) => r.id === 'takeaway_pickup_hours')!;

    // Falsy values (null, undefined, false) are all acceptable as "not configured"
    expect(req.validator(emptyContext)).toBeFalsy();
    expect(req.validator(completeProfileContext)).toBe(true);

    // Edge case: empty object
    expect(
      req.validator({
        ...emptyContext,
        profile: { pickupHours: {} },
      })
    ).toBeFalsy();
  });

  it('should validate minimum products requirement', () => {
    const req = TAKEAWAY_MANDATORY.find((r) => r.id === 'takeaway_min_products')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(productsContext)).toBe(true);

    // Edge case: exactly 5 published products
    const exactly5 = {
      ...emptyContext,
      products: Array(5)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          name: `Product ${i}`,
          is_published: true,
        })),
    };
    expect(req.validator(exactly5)).toBe(true);

    // Edge case: 4 published products (should fail)
    const only4 = {
      ...emptyContext,
      products: Array(4)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          name: `Product ${i}`,
          is_published: true,
        })),
    };
    expect(req.validator(only4)).toBe(false);
  });

  it('should validate payment method requirement', () => {
    const req = TAKEAWAY_MANDATORY.find((r) => r.id === 'takeaway_payment_method')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(paymentMethodsContext)).toBe(true);

    // Edge case: undefined paymentMethods
    expect(
      req.validator({
        ...emptyContext,
        paymentMethods: undefined,
      })
    ).toBe(false);
  });
});

// ============================================
// DINE-IN REQUIREMENTS TESTS
// ============================================

describe('DINE-IN Requirements - Validators', () => {
  it('should validate tables requirement', () => {
    const req = DINEIN_MANDATORY.find((r) => r.id === 'dinein_tables_configured')!;

    expect(req.validator(emptyContext)).toBe(false);

    const withTables = {
      ...emptyContext,
      tables: [{ id: '1', name: 'Table 1', capacity: 4 }],
    };
    expect(req.validator(withTables)).toBe(true);
  });

  it('should validate active staff requirement', () => {
    const req = DINEIN_MANDATORY.find((r) => r.id === 'dinein_active_staff')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(staffContext)).toBe(true);

    // Edge case: staff exists but none active
    const inactiveStaff = {
      ...emptyContext,
      staff: [{ id: '1', name: 'John', is_active: false, role: 'staff' }],
    };
    expect(req.validator(inactiveStaff)).toBe(false);
  });

  it('should validate minimum 3 products for dine-in', () => {
    const req = DINEIN_MANDATORY.find((r) => r.id === 'dinein_min_products')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(productsContext)).toBe(true);

    // Edge case: exactly 3 published
    const exactly3 = {
      ...emptyContext,
      products: Array(3)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          name: `Product ${i}`,
          is_published: true,
        })),
    };
    expect(req.validator(exactly3)).toBe(true);
  });
});

// ============================================
// E-COMMERCE REQUIREMENTS TESTS
// ============================================

describe('E-COMMERCE Requirements - Validators', () => {
  it('should validate logo requirement', () => {
    const req = ECOMMERCE_MANDATORY.find((r) => r.id === 'ecommerce_logo')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(completeProfileContext)).toBe(true);
  });

  it('should validate minimum 10 products', () => {
    const req = ECOMMERCE_MANDATORY.find((r) => r.id === 'ecommerce_min_products')!;

    expect(req.validator(productsContext)).toBe(false); // only 5 published

    const with10Products = {
      ...emptyContext,
      products: Array(10)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          name: `Product ${i}`,
          is_published: true,
        })),
    };
    expect(req.validator(with10Products)).toBe(true);
  });

  it('should validate online payment gateway', () => {
    const req = ECOMMERCE_MANDATORY.find((r) => r.id === 'ecommerce_payment_gateway')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(paymentMethodsContext)).toBe(true);

    // Edge case: gateway exists but not online type
    const posOnly = {
      ...emptyContext,
      paymentGateways: [{ id: 'pos-1', type: 'pos', is_active: true }],
    };
    expect(req.validator(posOnly)).toBe(false);

    // Edge case: online gateway but not active
    const inactiveOnline = {
      ...emptyContext,
      paymentGateways: [{ id: 'mp-1', type: 'online', is_active: false }],
    };
    expect(req.validator(inactiveOnline)).toBe(false);
  });

  it('should validate shipping policy', () => {
    const req = ECOMMERCE_MANDATORY.find((r) => r.id === 'ecommerce_shipping_policy')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(completeProfileContext)).toBe(true);
  });

  it('should validate terms and conditions', () => {
    const req = ECOMMERCE_MANDATORY.find((r) => r.id === 'ecommerce_terms_conditions')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(completeProfileContext)).toBe(true);
  });

  it('should validate contact info', () => {
    const req = ECOMMERCE_MANDATORY.find((r) => r.id === 'ecommerce_contact_info')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(completeProfileContext)).toBe(true);

    // Edge case: only email
    const emailOnly = {
      ...emptyContext,
      profile: { contactEmail: 'test@example.com' },
    };
    expect(req.validator(emailOnly)).toBe(false);

    // Edge case: only phone
    const phoneOnly = {
      ...emptyContext,
      profile: { contactPhone: '+54 11 1234-5678' },
    };
    expect(req.validator(phoneOnly)).toBe(false);
  });
});

// ============================================
// DELIVERY REQUIREMENTS TESTS
// ============================================

describe('DELIVERY Requirements - Validators', () => {
  it('should validate delivery zones', () => {
    const req = DELIVERY_MANDATORY.find((r) => r.id === 'delivery_zones')!;

    expect(req.validator(emptyContext)).toBe(false);

    const withZones = {
      ...emptyContext,
      deliveryZones: [
        { id: '1', name: 'Zone A', deliveryFee: 200 },
        { id: '2', name: 'Zone B', deliveryFee: 300 },
      ],
    };
    expect(req.validator(withZones)).toBe(true);
  });

  it('should validate delivery rates', () => {
    const req = DELIVERY_MANDATORY.find((r) => r.id === 'delivery_rates')!;

    const withRates = {
      ...emptyContext,
      deliveryZones: [
        { id: '1', name: 'Zone A', deliveryFee: 200 },
        { id: '2', name: 'Zone B', deliveryFee: 300 },
      ],
    };
    expect(req.validator(withRates)).toBe(true);

    // Edge case: zone without deliveryFee
    const missingRate = {
      ...emptyContext,
      deliveryZones: [
        { id: '1', name: 'Zone A', deliveryFee: 200 },
        { id: '2', name: 'Zone B' }, // Missing deliveryFee
      ],
    };
    expect(req.validator(missingRate)).toBe(false);
  });

  it('should validate active courier', () => {
    const req = DELIVERY_MANDATORY.find((r) => r.id === 'delivery_active_courier')!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(staffContext)).toBe(true);

    // Edge case: staff exists but no courier
    const noCourier = {
      ...emptyContext,
      staff: [{ id: '1', name: 'John', is_active: true, role: 'staff' }],
    };
    expect(req.validator(noCourier)).toBe(false);
  });

  it('should validate delivery hours', () => {
    const req = DELIVERY_MANDATORY.find((r) => r.id === 'delivery_hours')!;

    // Falsy values (null, undefined, false) are all acceptable as "not configured"
    expect(req.validator(emptyContext)).toBeFalsy();
    expect(req.validator(completeProfileContext)).toBe(true);
  });
});

// ============================================
// PHYSICAL PRODUCTS REQUIREMENTS TESTS
// ============================================

describe('PHYSICAL PRODUCTS Requirements - Validators', () => {
  it('should validate minimum materials', () => {
    const req = PHYSICAL_PRODUCTS_MANDATORY.find(
      (r) => r.id === 'physical_min_materials'
    )!;

    expect(req.validator(emptyContext)).toBe(false);

    const withMaterials = {
      ...emptyContext,
      materials: [{ id: '1', name: 'Flour', type: 'MEASURABLE' as const }],
    };
    expect(req.validator(withMaterials)).toBe(true);
  });

  it('should validate minimum products', () => {
    const req = PHYSICAL_PRODUCTS_MANDATORY.find(
      (r) => r.id === 'physical_min_products'
    )!;

    expect(req.validator(emptyContext)).toBe(false);
    expect(req.validator(productsContext)).toBe(true);
  });
});

// ============================================
// CUMULATIVE ACHIEVEMENTS TESTS
// ============================================

describe('CUMULATIVE Achievements - Validators', () => {
  it('should validate first employee', () => {
    const achievement = CUMULATIVE_ACHIEVEMENTS.find(
      (a) => a.id === 'cumulative_register_1_employee'
    )!;

    expect(achievement.validator(emptyContext)).toBe(false);
    expect(achievement.validator(staffContext)).toBe(true);
    expect(achievement.points).toBe(10);
  });

  it('should validate team of 5', () => {
    const achievement = CUMULATIVE_ACHIEVEMENTS.find(
      (a) => a.id === 'cumulative_register_5_employees'
    )!;

    expect(achievement.validator(staffContext)).toBe(false); // only 3

    const with5Staff = {
      ...emptyContext,
      staff: Array(5)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          name: `Employee ${i}`,
          is_active: true,
        })),
    };
    expect(achievement.validator(with5Staff)).toBe(true);
    expect(achievement.points).toBe(50);
  });

  it('should validate first sale', () => {
    const achievement = CUMULATIVE_ACHIEVEMENTS.find(
      (a) => a.id === 'cumulative_first_sale'
    )!;

    expect(achievement.validator(emptyContext)).toBe(false);

    const withSales = {
      ...emptyContext,
      salesCount: 1,
    };
    expect(achievement.validator(withSales)).toBe(true);
    expect(achievement.points).toBe(25);
  });

  it('should validate 100 sales milestone', () => {
    const achievement = CUMULATIVE_ACHIEVEMENTS.find(
      (a) => a.id === 'cumulative_100_sales'
    )!;

    const with100Sales = {
      ...emptyContext,
      salesCount: 100,
    };
    expect(achievement.validator(with100Sales)).toBe(true);
    expect(achievement.points).toBe(200);
  });

  it('should validate catalog milestones', () => {
    const catalog10 = CUMULATIVE_ACHIEVEMENTS.find(
      (a) => a.id === 'cumulative_catalog_10'
    )!;
    const catalog50 = CUMULATIVE_ACHIEVEMENTS.find(
      (a) => a.id === 'cumulative_catalog_50'
    )!;

    const with10Products = {
      ...emptyContext,
      products: Array(10)
        .fill(null)
        .map((_, i) => ({ id: String(i), name: `Product ${i}`, is_published: true })),
    };

    expect(catalog10.validator(with10Products)).toBe(true);
    expect(catalog50.validator(with10Products)).toBe(false);

    const with50Products = {
      ...emptyContext,
      products: Array(50)
        .fill(null)
        .map((_, i) => ({ id: String(i), name: `Product ${i}`, is_published: true })),
    };

    expect(catalog50.validator(with50Products)).toBe(true);
  });
});

// ============================================
// METADATA TESTS
// ============================================

describe('Requirements Metadata', () => {
  it('should have valid blocksAction for mandatory requirements', () => {
    const allMandatory = [
      ...TAKEAWAY_MANDATORY,
      ...DINEIN_MANDATORY,
      ...ECOMMERCE_MANDATORY,
      ...DELIVERY_MANDATORY,
      ...PHYSICAL_PRODUCTS_MANDATORY,
      ...PROFESSIONAL_SERVICES_MANDATORY,
      ...ASSET_RENTAL_MANDATORY,
      ...MEMBERSHIP_MANDATORY,
      ...DIGITAL_PRODUCTS_MANDATORY,
      ...CORPORATE_SALES_MANDATORY,
      ...MOBILE_OPERATIONS_MANDATORY,
    ];

    allMandatory.forEach((req) => {
      expect(req.blocksAction).toBeDefined();
      expect(req.blocksAction).toMatch(/:/); // Should have format "domain:action"
    });
  });

  it('should have redirectUrl for all mandatory requirements', () => {
    const allMandatory = [
      ...TAKEAWAY_MANDATORY,
      ...DINEIN_MANDATORY,
      ...ECOMMERCE_MANDATORY,
      ...DELIVERY_MANDATORY,
      ...PHYSICAL_PRODUCTS_MANDATORY,
      ...PROFESSIONAL_SERVICES_MANDATORY,
      ...ASSET_RENTAL_MANDATORY,
      ...MEMBERSHIP_MANDATORY,
      ...DIGITAL_PRODUCTS_MANDATORY,
      ...CORPORATE_SALES_MANDATORY,
      ...MOBILE_OPERATIONS_MANDATORY,
    ];

    allMandatory.forEach((req) => {
      expect(req.redirectUrl).toBeDefined();
      expect(req.redirectUrl).toMatch(/^\/admin/); // Should start with /admin
    });
  });

  it('should have estimatedMinutes for all mandatory requirements', () => {
    const allMandatory = [
      ...TAKEAWAY_MANDATORY,
      ...DINEIN_MANDATORY,
      ...ECOMMERCE_MANDATORY,
      ...DELIVERY_MANDATORY,
      ...PHYSICAL_PRODUCTS_MANDATORY,
    ];

    allMandatory.forEach((req) => {
      expect(req.estimatedMinutes).toBeDefined();
      expect(req.estimatedMinutes).toBeGreaterThan(0);
    });
  });

  it('should have points for cumulative achievements', () => {
    CUMULATIVE_ACHIEVEMENTS.forEach((achievement) => {
      expect(achievement.points).toBeDefined();
      expect(achievement.points).toBeGreaterThan(0);
    });
  });
});
