import { describe, it, expect, beforeEach } from 'vitest';
import { TaxCalculationService } from './taxCalculationService';

describe('TaxCalculationService Debug', () => {
  let taxService: TaxCalculationService;

  beforeEach(() => {
    taxService = new TaxCalculationService();
  });

  it('should work with basic calculation', () => {
    const result = taxService.calculateTaxesForAmount(121, {
      ivaRate: 0.21,
      taxIncludedInPrice: true,
    });

    console.log('Debug result:', result);
    expect(result.totalAmount).toBe(121);
  });
});
