import { describe, it, expect } from 'vitest';
import { TaxCalculationService } from '../taxCalculationService';

describe('Debug Tax Service', () => {
  it('should create service and do basic calculation', () => {
    const taxService = new TaxCalculationService();
    const result = taxService.calculateTaxesForAmount(100, {
      ivaRate: 0.21,
      taxIncludedInPrice: false,
    });
    
    console.log('Result:', result);
    expect(result.subtotal).toBe(100);
  });
});
