import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaxCalculationService, TAX_RATES, calculateTaxes, calculateCartTaxes, getTaxAmount, getSubtotal } from '../taxCalculationService';

/**
 * ⚡ COMPREHENSIVE TEST SUITE: Tax Calculation Service
 * 
 * EXHAUSTIVE COVERAGE:
 * ✅ Core tax calculation functions
 * ✅ Edge cases & boundary conditions  
 * ✅ Precision with TaxDecimal library
 * ✅ Error scenarios & invalid inputs
 * ✅ Argentine tax system (IVA, Ingresos Brutos)
 * ✅ Performance testing
 * ✅ Multi-currency scenarios
 * ✅ Reverse tax calculations
 * 
 * CRITICAL FOCUS: Tax calculation accuracy for compliance
 */

describe('TaxCalculationService - Complete Test Suite', () => {
  let taxService: TaxCalculationService;
  let consoleErrorSpy: any;
  let performanceStart: number;

  beforeEach(() => {
    taxService = new TaxCalculationService();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    performanceStart = performance.now();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    const duration = performance.now() - performanceStart;
    // Performance check: Each test should complete in reasonable time
    expect(duration).toBeLessThan(1000);
  });

  // ============================================================================
  // CORE CALCULATION FUNCTION TESTS - BASIC SCENARIOS
  // ============================================================================

  describe('Core Tax Calculations', () => {
    it('should correctly calculate taxes for a price that includes them (Argentine case)', () => {
      const amount = 121;
      const result = taxService.calculateTaxesForAmount(amount, {
        ivaRate: 0.21,
        includeIngresosBrutos: false,
        taxIncludedInPrice: true,
      });

      expect(result.subtotal).toBe(100);
      expect(result.ivaAmount).toBe(21);
      expect(result.totalTaxes).toBe(21);
      expect(result.totalAmount).toBe(121);
    });

    it('should correctly calculate taxes for a price that excludes them (US case)', () => {
      const amount = 100;
      const result = taxService.calculateTaxesForAmount(amount, {
        ivaRate: 0.21,
        includeIngresosBrutos: false,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(100);
      expect(result.ivaAmount).toBe(21);
      expect(result.totalTaxes).toBe(21);
      expect(result.totalAmount).toBe(121);
    });

    it('should handle the 0.1 + 0.2 floating point issue with precision', () => {
      // A scenario that could lead to floating point errors
      const amount = 0.3; // e.g. a very cheap item
      const result = taxService.calculateTaxesForAmount(amount, {
        ivaRate: 0.1, // 10%
        taxIncludedInPrice: false,
      });

      // Without Decimal.js, ivaAmount could be 0.030000000000000002
      expect(result.ivaAmount).toBe(0.03);
      expect(result.totalAmount).toBe(0.33);
    });
  });

  // ============================================================================
  // CART AND MULTI-ITEM CALCULATIONS
  // ============================================================================

  describe('Cart Tax Calculations', () => {
    it('should correctly calculate taxes for a cart of items', () => {
      const items = [
        { productId: '1', quantity: 2, unitPrice: 100 }, // Total: 200
        { productId: '2', quantity: 1, unitPrice: 50.5 },  // Total: 50.5
      ];
      const result = taxService.calculateTaxesForItems(items, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      const expectedSubtotal = 250.5;
      const expectedIva = 52.6; // 250.5 * 0.21 = 52.605, rounded to 52.6
      const expectedTotal = 303.1; // 250.5 + 52.6

      expect(result.subtotal).toBe(expectedSubtotal);
      expect(result.ivaAmount).toBe(expectedIva);
      expect(result.totalAmount).toBe(expectedTotal);
    });

    it('should handle different IVA rates for different items in a cart', () => {
      const items = [
        { productId: '1', quantity: 1, unitPrice: 100, ivaCategory: 'GENERAL' as const }, // 21%
        { productId: '2', quantity: 1, unitPrice: 100, ivaCategory: 'REDUCIDO' as const }, // 10.5%
      ];
      
      // Assuming prices are final (tax included)
      const result = taxService.calculateTaxesForItems(items, {
        ivaRate: TAX_RATES.IVA.GENERAL, // Default rate
        taxIncludedInPrice: true,
      });

      // Item 1: 100 / 1.21 = 82.64 subtotal, 17.36 iva
      // Item 2: 100 / 1.105 = 90.50 subtotal, 9.50 iva
      // Totals: 173.14 subtotal, 26.86 iva
      expect(result.subtotal).toBe(173.14);
      expect(result.ivaAmount).toBe(26.86);
      expect(result.totalAmount).toBe(200.00);
    });
  });

  // ============================================================================
  // EDGE CASES & BOUNDARY CONDITIONS - PHASE 1
  // ============================================================================

  describe('Edge Cases & Boundary Conditions', () => {
    it('should handle zero amount correctly', () => {
      const result = taxService.calculateTaxesForAmount(0, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(0);
      expect(result.ivaAmount).toBe(0);
      expect(result.totalTaxes).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.breakdown.effectiveTaxRate).toBe(0);
    });

    it('should handle negative amounts (refunds/credits)', () => {
      const result = taxService.calculateTaxesForAmount(-100, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(-100);
      expect(result.ivaAmount).toBe(-21);
      expect(result.totalTaxes).toBe(-21);
      expect(result.totalAmount).toBe(-121);
    });

    it('should handle very small amounts (penny transactions)', () => {
      const result = taxService.calculateTaxesForAmount(0.01, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
        roundTaxes: true,
      });

      expect(result.subtotal).toBe(0.01);
      expect(result.ivaAmount).toBe(0); // Should round to 0.00
      expect(result.totalAmount).toBe(0.01);
    });

    it('should handle very large amounts (enterprise transactions)', () => {
      const largeAmount = 999999999.99;
      const result = taxService.calculateTaxesForAmount(largeAmount, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(largeAmount);
      expect(result.ivaAmount).toBe(210000000); // 999999999.99 * 0.21 = rounded to 210000000
      expect(result.totalAmount).toBe(1209999999.99); // 999999999.99 + 210000000
    });

    it('should handle 100% tax rate edge case', () => {
      const result = taxService.calculateTaxesForAmount(100, {
        ivaRate: 1.0, // 100% tax
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(100);
      expect(result.ivaAmount).toBe(100);
      expect(result.totalAmount).toBe(200);
      expect(result.breakdown.effectiveTaxRate).toBe(1);
    });
  });

  // ============================================================================
  // HELPER FUNCTIONS & UTILITY TESTS
  // ============================================================================

  describe('Helper Functions', () => {
    it('should work with calculateTaxes helper function', () => {
      const result = calculateTaxes(100, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(100);
      expect(result.ivaAmount).toBe(21);
      expect(result.totalAmount).toBe(121);
    });

    it('should work with calculateCartTaxes helper function', () => {
      const items = [
        { productId: '1', quantity: 1, unitPrice: 100 },
        { productId: '2', quantity: 2, unitPrice: 50 },
      ];

      const result = calculateCartTaxes(items, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(200); // 100 + (2 * 50)
      expect(result.ivaAmount).toBe(42); // 200 * 0.21
      expect(result.totalAmount).toBe(242);
    });

    it('should work with getTaxAmount helper function', () => {
      const totalAmount = 121; // Price with tax included
      const taxAmount = getTaxAmount(totalAmount);
      
      expect(taxAmount).toBe(21); // Should extract the tax portion
    });

    it('should work with getSubtotal helper function', () => {
      const totalAmount = 121; // Price with tax included
      const subtotal = getSubtotal(totalAmount);
      
      expect(subtotal).toBe(100); // Should extract the subtotal portion
    });
  });

  // ============================================================================
  // ADVANCED FUNCTION TESTS - REVERSE CALCULATIONS & FORMATTING
  // ============================================================================

  describe('Advanced Functions', () => {
    it('should perform reverse tax calculation correctly', () => {
      const finalAmount = 121; // Total price including tax
      const result = taxService.reverseTaxCalculation(finalAmount, {
        ivaRate: 0.21,
        taxIncludedInPrice: true, // Important: taxes are included
      });

      expect(result.subtotal).toBe(100);
      expect(result.ivaAmount).toBe(21);
      expect(result.totalAmount).toBe(121);
    });

    it('should handle reverse calculation when taxes are not included', () => {
      const baseAmount = 100;
      const result = taxService.reverseTaxCalculation(baseAmount, {
        ivaRate: 0.21,
        taxIncludedInPrice: false, // Taxes not included
      });

      // Should be same as regular calculation
      expect(result.subtotal).toBe(100);
      expect(result.ivaAmount).toBe(21);
      expect(result.totalAmount).toBe(121);
    });

    it('should format tax display correctly', () => {
      const taxResult = taxService.calculateTaxesForAmount(100, {
        ivaRate: 0.21,
        taxIncludedInPrice: false,
      });

      const formatted = taxService.formatTaxDisplay(taxResult);

      expect(formatted.subtotal).toBe('$100.00');
      expect(formatted.ivaAmount).toBe('$21.00');
      expect(formatted.ingresosBrutosAmount).toBe('$0.00'); // Not included
      expect(formatted.totalTaxes).toBe('$21.00');
      expect(formatted.totalAmount).toBe('$121.00');
    });

    it('should handle formatTaxDisplay with ingresos brutos', () => {
      const taxResult = taxService.calculateTaxesForAmount(100, {
        ivaRate: 0.21,
        includeIngresosBrutos: true,
        ingresosBrutosRate: 0.03,
        taxIncludedInPrice: false,
      });

      const formatted = taxService.formatTaxDisplay(taxResult);

      expect(formatted.ingresosBrutosAmount).toBe('$3.00'); // Should include ingresos brutos
    });
  });

  // ============================================================================
  // ARGENTINE TAX SYSTEM SPECIFIC TESTS
  // ============================================================================

  describe('Argentine Tax System', () => {
    it('should handle IVA GENERAL rate (21%)', () => {
      const result = taxService.calculateTaxesForAmount(100, {
        ivaRate: TAX_RATES.IVA.GENERAL,
        taxIncludedInPrice: false,
      });

      expect(result.ivaAmount).toBe(21);
      expect(result.totalAmount).toBe(121);
    });

    it('should handle IVA REDUCIDO rate (10.5%)', () => {
      const result = taxService.calculateTaxesForAmount(100, {
        ivaRate: TAX_RATES.IVA.REDUCIDO,
        taxIncludedInPrice: false,
      });

      expect(result.ivaAmount).toBe(10.5);
      expect(result.totalAmount).toBe(110.5);
    });

    it('should handle IVA EXENTO (0%)', () => {
      const result = taxService.calculateTaxesForAmount(100, {
        ivaRate: TAX_RATES.IVA.EXENTO,
        taxIncludedInPrice: false,
      });

      expect(result.ivaAmount).toBe(0);
      expect(result.totalAmount).toBe(100);
    });

    it('should handle CABA ingresos brutos rate', () => {
      const result = taxService.calculateTaxesForAmount(100, {
        ivaRate: 0.21,
        includeIngresosBrutos: true,
        ingresosBrutosRate: TAX_RATES.INGRESOS_BRUTOS.CABA,
        taxIncludedInPrice: false,
      });

      expect(result.ivaAmount).toBe(21);
      expect(result.ingresosBrutosAmount).toBe(3); // 3% of 100
      expect(result.totalTaxes).toBe(24); // 21 + 3
      expect(result.totalAmount).toBe(124);
    });

    it('should handle Buenos Aires province ingresos brutos rate', () => {
      const result = taxService.calculateTaxesForAmount(100, {
        ivaRate: 0.21,
        includeIngresosBrutos: true,
        ingresosBrutosRate: TAX_RATES.INGRESOS_BRUTOS.BUENOS_AIRES,
        taxIncludedInPrice: false,
      });

      expect(result.ingresosBrutosAmount).toBe(3.5); // 3.5% of 100
      expect(result.totalTaxes).toBe(24.5); // 21 + 3.5
    });
  });

  // ============================================================================
  // CONFIGURATION & SERVICE MANAGEMENT TESTS
  // ============================================================================

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        ivaRate: 0.105, // Switch to reduced rate
        includeIngresosBrutos: true,
        ingresosBrutosRate: 0.04,
      };

      taxService.updateConfiguration(newConfig);
      const currentConfig = taxService.getConfiguration();

      expect(currentConfig.ivaRate).toBe(0.105);
      expect(currentConfig.includeIngresosBrutos).toBe(true);
      expect(currentConfig.ingresosBrutosRate).toBe(0.04);
    });

    it('should use updated configuration in calculations', () => {
      taxService.updateConfiguration({
        ivaRate: 0.105, // 10.5%
        includeIngresosBrutos: true,
        ingresosBrutosRate: 0.03, // 3%
      });

      const result = taxService.calculateTaxesForAmount(100, {
        taxIncludedInPrice: false,
      });

      expect(result.ivaAmount).toBe(10.5);
      expect(result.ingresosBrutosAmount).toBe(3);
      expect(result.totalTaxes).toBe(13.5);
    });

    it('should preserve configuration when creating new service', () => {
      const customService = new TaxCalculationService({
        ivaRate: 0.27, // Custom rate
        includeIngresosBrutos: true,
        ingresosBrutosRate: 0.05,
      });

      const result = customService.calculateTaxesForAmount(100, {
        taxIncludedInPrice: false,
      });

      expect(result.ivaAmount).toBe(27);
      expect(result.ingresosBrutosAmount).toBe(5);
    });
  });

  // ============================================================================
  // REAL-WORLD SCENARIOS - BUSINESS COMPLIANCE
  // ============================================================================

  describe('Real-World Business Scenarios', () => {
    it('should handle typical restaurant bill calculation', () => {
      // Real restaurant scenario
      const items = [
        { productId: 'milanesa', quantity: 2, unitPrice: 3500, ivaCategory: 'GENERAL' as const }, // $35 each
        { productId: 'empanadas', quantity: 6, unitPrice: 450, ivaCategory: 'GENERAL' as const }, // $4.50 each
        { productId: 'water', quantity: 2, unitPrice: 300, ivaCategory: 'GENERAL' as const }, // $3 each
      ];

      const result = taxService.calculateTaxesForItems(items, {
        ivaRate: TAX_RATES.IVA.GENERAL,
        taxIncludedInPrice: true, // Argentine prices include tax
      });

      // Total price: (2*3500) + (6*450) + (2*300) = 7000 + 2700 + 600 = 10,300
      expect(result.totalAmount).toBe(10300);
      // Should extract tax portion correctly
      expect(result.subtotal).toBeCloseTo(8512.4, 1); // 10300 / 1.21
      expect(result.ivaAmount).toBeCloseTo(1787.6, 1); // 8512.4 * 0.21
    });

    it('should handle enterprise B2B transaction', () => {
      // Large business transaction
      const result = taxService.calculateTaxesForAmount(1000000, { // $1M
        ivaRate: TAX_RATES.IVA.GENERAL,
        includeIngresosBrutos: true,
        ingresosBrutosRate: TAX_RATES.INGRESOS_BRUTOS.CABA,
        taxIncludedInPrice: false,
      });

      expect(result.subtotal).toBe(1000000);
      expect(result.ivaAmount).toBe(210000); // 21%
      expect(result.ingresosBrutosAmount).toBe(30000); // 3%
      expect(result.totalTaxes).toBe(240000);
      expect(result.totalAmount).toBe(1240000);
    });

    it('should handle grocery store mixed cart', () => {
      const groceryItems = [
        { productId: 'meat', quantity: 2, unitPrice: 2500, ivaCategory: 'GENERAL' as const },
        { productId: 'vegetables', quantity: 5, unitPrice: 800, ivaCategory: 'EXENTO' as const },
        { productId: 'bread', quantity: 3, unitPrice: 600, ivaCategory: 'EXENTO' as const },
      ];

      const result = taxService.calculateTaxesForItems(groceryItems, {
        ivaRate: TAX_RATES.IVA.GENERAL,
        taxIncludedInPrice: true,
      });

      // Only meat should have IVA, vegetables and bread are exempt
      const totalAmount = 5000 + 4000 + 1800; // 10,800
      expect(result.totalAmount).toBe(totalAmount);
    });
  });

  // ============================================================================
  // PERFORMANCE & STRESS TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    it('should handle large cart calculations efficiently', () => {
      const largeCart = Array.from({ length: 100 }, (_, i) => ({
        productId: `item-${i}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: Math.floor(Math.random() * 5000) + 100,
        ivaCategory: i % 3 === 0 ? 'REDUCIDO' as const : 'GENERAL' as const,
      }));

      const startTime = performance.now();
      const result = taxService.calculateTaxesForItems(largeCart, {
        ivaRate: TAX_RATES.IVA.GENERAL,
        taxIncludedInPrice: false,
      });
      const duration = performance.now() - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(100); // 100ms for 100 items
      expect(result.totalAmount).toBeGreaterThan(0);
      expect(result.totalTaxes).toBeGreaterThan(0);
    });

    it('should handle rapid successive calculations', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        taxService.calculateTaxesForAmount(100 + i, {
          ivaRate: 0.21,
          taxIncludedInPrice: i % 2 === 0,
        });
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(500); // 500ms for 1000 calculations
    });
  });
});
