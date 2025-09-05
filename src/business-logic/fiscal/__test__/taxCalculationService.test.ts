import { describe, it, expect, beforeEach } from 'vitest';
import { TaxCalculationService, TAX_RATES } from '../taxCalculationService';

describe('TaxCalculationService', () => {
  let taxService: TaxCalculationService;

  beforeEach(() => {
    taxService = new TaxCalculationService();
  });

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
    const expectedIva = 52.61; // 250.5 * 0.21 = 52.605, rounded to 52.61
    const expectedTotal = 303.11; // 250.5 + 52.61

    expect(result.subtotal).toBe(expectedSubtotal);
    expect(result.ivaAmount).toBe(expectedIva);
    expect(result.totalAmount).toBe(expectedTotal);
  });

  it('should handle rounding correctly', () => {
    const amount = 10.126;
    const result = taxService.calculateTaxesForAmount(amount, {
      ivaRate: 0,
      taxIncludedInPrice: false,
      roundTaxes: true,
    });
    expect(result.subtotal).toBe(10.13);
  });
  
  it('should handle different IVA rates for different items in a cart', () => {
    const items = [
      { productId: '1', quantity: 1, unitPrice: 100, ivaCategory: 'GENERAL' }, // 21%
      { productId: '2', quantity: 1, unitPrice: 100, ivaCategory: 'REDUCIDO' }, // 10.5%
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
