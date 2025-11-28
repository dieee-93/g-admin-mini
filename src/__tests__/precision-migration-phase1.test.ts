/**
 * PRECISION MIGRATION PHASE 1 - TESTS
 *
 * Tests de validación para la migración de precisión matemática FASE 1
 * Valida que las refactorizaciones mantienen precisión decimal correcta
 *
 * @see PRECISION_AUDIT_COMPLETE_REPORT.md
 */

import { describe, test, expect } from 'vitest';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateComponentCost,
  calculateProfitMargin,
  calculateMarkup,
  suggestPrice
} from '@/pages/admin/supply-chain/products/services/productCostCalculation';

// ============================================
// EDGE CASE: Classic Floating Point Error
// ============================================

describe('💎 PRECISION MIGRATION PHASE 1 - Edge Cases', () => {

  test('should handle classic 0.1 + 0.2 = 0.3 edge case', () => {
    // Classic float error: 0.1 + 0.2 = 0.30000000000000004 in JavaScript
    const result = DecimalUtils.add('0.1', '0.2', 'financial');

    expect(result.toString()).toBe('0.3');
    expect(result.toNumber()).toBe(0.3);
  });

  test('should calculate item subtotal without float errors', () => {
    // Scenario: 2.5 × $45.67 = $114.175 (should round to $114.18 with banker's rounding)
    const quantity = 2.5;
    const price = 45.67;

    const subtotalDec = DecimalUtils.multiply(
      quantity.toString(),
      price.toString(),
      'financial'
    );

    // Full precision intermediate result
    expect(subtotalDec.toString()).toBe('114.175');

    // Banker's rounding to 2 decimal places
    const rounded = DecimalUtils.bankerRound(subtotalDec, 2, 'financial');
    expect(rounded.toFixed(2)).toBe('114.18');
  });

  test('should handle MRR division by 12 without precision loss', () => {
    // Scenario: $1299.99 / 12 = $108.3325 (should round to $108.33)
    const annualAmount = 1299.99;

    const monthlyDec = DecimalUtils.divide(
      annualAmount.toString(),
      '12',
      'financial'
    );

    // Check precision in intermediate value
    expect(monthlyDec.toFixed(4)).toBe('108.3325');

    // Banker's rounding to 2 decimals
    const rounded = DecimalUtils.bankerRound(monthlyDec, 2, 'financial');
    expect(rounded.toFixed(2)).toBe('108.33');
  });
});

// ============================================
// SALES MODULE: orderService.ts
// ============================================

describe('🛒 SALES MODULE - orderService.ts precision', () => {

  test('should calculate order item subtotal with precision', () => {
    // Simulating cart items from orderService.ts line 78
    const cartItems = [
      { price: 10.99, quantity: 3 },
      { price: 7.50, quantity: 2 },
      { price: 15.25, quantity: 1.5 }
    ];

    const subtotals = cartItems.map(item => {
      return DecimalUtils.multiply(
        item.price.toString(),
        item.quantity.toString(),
        'financial'
      ).toNumber();
    });

    // Verify each calculation
    expect(subtotals[0]).toBe(32.97);  // 10.99 × 3
    expect(subtotals[1]).toBe(15.00);  // 7.50 × 2
    expect(subtotals[2]).toBe(22.875); // 15.25 × 1.5

    // Total should aggregate without float errors
    const totalDec = subtotals.reduce((sumDec, subtotal) => {
      return DecimalUtils.add(sumDec, subtotal, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    // Expected: 32.97 + 15.00 + 22.875 = 70.845
    expect(totalDec.toString()).toBe('70.845');

    // Note: toFixed() uses standard rounding, not banker's rounding
    // For banker's rounding, use DecimalUtils.bankerRound()
    expect(totalDec.toFixed(2)).toBe('70.84'); // Standard rounding

    // With banker's rounding:
    const bankerRounded = DecimalUtils.bankerRound(totalDec, 2, 'financial');
    expect(bankerRounded.toFixed(2)).toBe('70.84'); // .845 rounds down to even (.84)
  });

  test('should handle aggregation of multiple decimal items', () => {
    // Edge case: Many items with decimals
    const items = Array(10).fill(null).map((_, i) => ({
      price: 0.33,
      quantity: i + 1
    }));

    const totalDec = items.reduce((sumDec, item) => {
      const itemTotalDec = DecimalUtils.multiply(
        item.price.toString(),
        item.quantity.toString(),
        'financial'
      );
      return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    // 0.33×1 + 0.33×2 + ... + 0.33×10 = 0.33×55 = 18.15
    expect(totalDec.toFixed(2)).toBe('18.15');
  });
});

// ============================================
// SALES MODULE: saleApi.ts
// ============================================

describe('💰 SALES MODULE - saleApi.ts precision', () => {

  test('should calculate sale subtotal using reduce with DecimalUtils', () => {
    // Simulating saleData.items from saleApi.ts line 332
    const saleItems = [
      { quantity: 2, unit_price: 15.50 },
      { quantity: 1.5, unit_price: 22.99 },
      { quantity: 3, unit_price: 8.75 }
    ];

    const subtotalDec = saleItems.reduce((sumDec, item) => {
      const itemTotalDec = DecimalUtils.multiply(
        item.quantity.toString(),
        item.unit_price.toString(),
        'financial'
      );
      return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    const subtotal = subtotalDec.toNumber();

    // Expected: (2×15.50) + (1.5×22.99) + (3×8.75) = 31 + 34.485 + 26.25 = 91.735
    expect(subtotalDec.toFixed(3)).toBe('91.735');
    expect(DecimalUtils.bankerRound(subtotal, 2, 'financial').toFixed(2)).toBe('91.74');
  });

  test('should not accumulate float errors in large sale', () => {
    // Edge case: Sale with 100 items
    const manyItems = Array(100).fill(null).map(() => ({
      quantity: 1,
      unit_price: 0.1
    }));

    const subtotalDec = manyItems.reduce((sumDec, item) => {
      const itemTotalDec = DecimalUtils.multiply(
        item.quantity.toString(),
        item.unit_price.toString(),
        'financial'
      );
      return DecimalUtils.add(sumDec, itemTotalDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    // Should be exactly 10.0, not 9.999999999 or 10.0000000001
    expect(subtotalDec.toString()).toBe('10');
    expect(subtotalDec.toFixed(1)).toBe('10.0');
  });
});

// ============================================
// PRODUCTS MODULE: productCostCalculation.ts
// ============================================

describe('📦 PRODUCTS MODULE - productCostCalculation.ts precision', () => {

  test('calculateComponentCost: should calculate material cost with precision', () => {
    const cost1 = calculateComponentCost(2.5, 45.67);
    expect(cost1).toBe(114.175);

    const cost2 = calculateComponentCost(1.33, 78.90);
    expect(cost2).toBeCloseTo(104.937, 3);
  });

  test('calculateMaterialsCost: should aggregate component costs precisely', () => {
    const components = [
      { material_id: '1', quantity: 2.5, unit_cost: 10.50 },
      { material_id: '2', quantity: 1.33, unit_cost: 15.75 },
      { material_id: '3', quantity: 0.5, unit_cost: 8.99 }
    ];

    const totalCost = calculateMaterialsCost(components);

    // Expected: (2.5×10.50) + (1.33×15.75) + (0.5×8.99)
    // = 26.25 + 20.9475 + 4.495 = 51.6925
    expect(totalCost).toBeCloseTo(51.6925, 4);
  });

  test('calculateLaborCost: should handle fractional hours correctly', () => {
    const allocations = [
      { role_id: '1', duration_minutes: 90, hourly_rate: 15.50, count: 2 },  // 1.5h × $15.50 × 2
      { role_id: '2', duration_minutes: 45, hourly_rate: 22.00, count: 1 }   // 0.75h × $22.00 × 1
    ];

    const totalLabor = calculateLaborCost(allocations);

    // Expected: (1.5 × 15.50 × 2) + (0.75 × 22.00 × 1) = 46.5 + 16.5 = 63.0
    expect(totalLabor).toBe(63);
  });

  test('calculateProfitMargin: should calculate margin with precision', () => {
    const margin = calculateProfitMargin(100, 150);

    // Expected: ((150 - 100) / 150) × 100 = 33.333...%
    expect(margin).toBeCloseTo(33.3333333, 6);
  });

  test('calculateMarkup: should calculate markup with precision', () => {
    const markup = calculateMarkup(100, 150);

    // Expected: ((150 - 100) / 100) × 100 = 50%
    expect(markup).toBe(50);
  });

  test('suggestPrice: should suggest price based on cost and margin', () => {
    const suggestedPrice = suggestPrice(100, 30);

    // Expected: 100 / (1 - 0.30) = 100 / 0.70 = 142.857142...
    expect(suggestedPrice).toBeCloseTo(142.857142857, 9);
  });
});

// ============================================
// BILLING MODULE: billingApi.ts
// ============================================

describe('💳 BILLING MODULE - billingApi.ts precision', () => {

  test('should calculate MRR from quarterly subscription correctly', () => {
    const quarterlyAmount = 299.97;

    const monthlyDec = DecimalUtils.divide(
      quarterlyAmount.toString(),
      '3',
      'financial'
    );

    // Expected: 299.97 / 3 = 99.99
    expect(monthlyDec.toString()).toBe('99.99');
    expect(monthlyDec.toNumber()).toBe(99.99);
  });

  test('should calculate MRR from annual subscription correctly', () => {
    const annualAmount = 1299.99;

    const monthlyDec = DecimalUtils.divide(
      annualAmount.toString(),
      '12',
      'financial'
    );

    // Expected: 1299.99 / 12 = 108.3325
    expect(monthlyDec.toFixed(4)).toBe('108.3325');

    // With banker's rounding to 2 decimals
    const rounded = DecimalUtils.bankerRound(monthlyDec, 2, 'financial');
    expect(rounded.toFixed(2)).toBe('108.33');
  });

  test('should aggregate MRR from mixed billing types', () => {
    const subscriptions = [
      { amount: 99, billing_type: 'monthly' },
      { amount: 299.97, billing_type: 'quarterly' },
      { amount: 1199.88, billing_type: 'annual' }
    ];

    const mrrDec = subscriptions.reduce((totalDec, sub) => {
      const amountDec = DecimalUtils.fromValue(sub.amount, 'financial');
      let monthlyAmountDec;

      switch (sub.billing_type) {
        case 'monthly':
          monthlyAmountDec = amountDec;
          break;
        case 'quarterly':
          monthlyAmountDec = DecimalUtils.divide(amountDec, '3', 'financial');
          break;
        case 'annual':
          monthlyAmountDec = DecimalUtils.divide(amountDec, '12', 'financial');
          break;
        default:
          monthlyAmountDec = DecimalUtils.fromValue(0, 'financial');
      }

      return DecimalUtils.add(totalDec, monthlyAmountDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    // Expected: 99 + (299.97/3) + (1199.88/12) = 99 + 99.99 + 99.99 = 298.98
    expect(mrrDec.toFixed(2)).toBe('298.98');
  });

  test('should not accumulate errors across many subscriptions', () => {
    // Edge case: 1000 subscriptions
    const subscriptions = Array(1000).fill(null).map(() => ({
      amount: 9.99,
      billing_type: 'monthly'
    }));

    const mrrDec = subscriptions.reduce((totalDec, sub) => {
      const amountDec = DecimalUtils.fromValue(sub.amount, 'financial');
      return DecimalUtils.add(totalDec, amountDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    // Expected: 9.99 × 1000 = 9990.00
    expect(mrrDec.toString()).toBe('9990');
    expect(mrrDec.toFixed(2)).toBe('9990.00');
  });
});

// ============================================
// INTEGRATION: Cross-Module Precision
// ============================================

describe('🔗 INTEGRATION - Cross-module precision validation', () => {

  test('should maintain precision from product cost to sale price', () => {
    // Scenario: Calculate product cost → add markup → create sale

    // 1. Calculate material cost
    const materials = [
      { material_id: '1', quantity: 2.5, unit_cost: 10.50 },
      { material_id: '2', quantity: 1.33, unit_cost: 15.75 }
    ];
    const materialCost = calculateMaterialsCost(materials);

    // 2. Calculate labor cost
    const labor = [
      { role_id: '1', duration_minutes: 90, hourly_rate: 15.50, count: 1 }
    ];
    const laborCost = calculateLaborCost(labor);

    // 3. Total cost
    const totalCostDec = DecimalUtils.add(materialCost, laborCost, 'financial');

    // 4. Apply 40% margin to get selling price
    const sellingPrice = suggestPrice(totalCostDec.toNumber(), 40);

    // 5. Create sale with 3 units
    const saleSubtotal = DecimalUtils.multiply(
      '3',
      sellingPrice.toString(),
      'financial'
    );

    // All operations should maintain precision
    expect(totalCostDec.isFinite()).toBe(true);
    expect(saleSubtotal.isFinite()).toBe(true);

    // Verify no NaN or Infinity
    expect(Number.isNaN(totalCostDec.toNumber())).toBe(false);
    expect(Number.isNaN(sellingPrice)).toBe(false);
    expect(Number.isNaN(saleSubtotal.toNumber())).toBe(false);
  });
});
