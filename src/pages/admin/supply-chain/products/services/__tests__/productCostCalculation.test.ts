/**
 * UNIT TESTS: Product Cost Calculation Service
 *
 * Tests for productCostCalculation.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateProductTotalCost,
  calculateMaterialsCost,
  calculateLaborCost,
  calculateProductionOverhead,
  convertTimeToHours,
  convertTimeToMinutes,
  suggestPrice
} from '../productCostCalculation';
import type { ProductFormData, ProductComponent, StaffAllocation, OverheadConfig } from '../../types/productForm';

describe('productCostCalculation', () => {
  describe('calculateMaterialsCost', () => {
    it('should calculate cost for single component', () => {
      const components: ProductComponent[] = [
        { material_id: '1', quantity: 2, unit_cost: 10 }
      ];

      const result = calculateMaterialsCost(components);
      expect(result).toBe(20);
    });

    it('should calculate cost for multiple components', () => {
      const components: ProductComponent[] = [
        { material_id: '1', quantity: 2, unit_cost: 10 },
        { material_id: '2', quantity: 1, unit_cost: 5 },
        { material_id: '3', quantity: 3, unit_cost: 2 }
      ];

      const result = calculateMaterialsCost(components);
      expect(result).toBe(31); // (2*10) + (1*5) + (3*2)
    });

    it('should return 0 for empty components', () => {
      expect(calculateMaterialsCost([])).toBe(0);
    });

    it('should handle missing unit_cost', () => {
      const components: ProductComponent[] = [
        { material_id: '1', quantity: 2 },
        { material_id: '2', quantity: 1, unit_cost: 5 }
      ];

      const result = calculateMaterialsCost(components);
      expect(result).toBe(5); // Only counts component with unit_cost
    });

    it('should handle zero quantities', () => {
      const components: ProductComponent[] = [
        { material_id: '1', quantity: 0, unit_cost: 10 },
        { material_id: '2', quantity: 2, unit_cost: 5 }
      ];

      const result = calculateMaterialsCost(components);
      expect(result).toBe(10);
    });
  });

  describe('calculateLaborCost', () => {
    it('should calculate cost for single staff allocation', () => {
      const staffAllocations: StaffAllocation[] = [
        {
          role_id: '1',
          count: 1,
          duration_minutes: 60,
          hourly_rate: 20
        }
      ];

      const result = calculateLaborCost(staffAllocations);
      expect(result).toBe(20); // 1 hour * $20
    });

    it('should calculate cost for multiple staff with different durations', () => {
      const staffAllocations: StaffAllocation[] = [
        {
          role_id: '1',
          count: 1,
          duration_minutes: 60,
          hourly_rate: 20
        },
        {
          role_id: '2',
          count: 2,
          duration_minutes: 30,
          hourly_rate: 15
        }
      ];

      const result = calculateLaborCost(staffAllocations);
      expect(result).toBe(35); // (1*1*20) + (2*0.5*15)
    });

    it('should return 0 for empty allocations', () => {
      expect(calculateLaborCost([])).toBe(0);
    });

    it('should handle missing hourly_rate', () => {
      const staffAllocations: StaffAllocation[] = [
        {
          role_id: '1',
          count: 1,
          duration_minutes: 60
        }
      ];

      const result = calculateLaborCost(staffAllocations);
      expect(result).toBe(0);
    });

    it('should handle fractional hours correctly', () => {
      const staffAllocations: StaffAllocation[] = [
        {
          role_id: '1',
          count: 1,
          duration_minutes: 45,
          hourly_rate: 20
        }
      ];

      const result = calculateLaborCost(staffAllocations);
      expect(result).toBe(15); // 0.75 hours * $20
    });
  });

  describe('calculateProductionOverhead', () => {
    it('should calculate fixed overhead', () => {
      const config: OverheadConfig = {
        method: 'fixed',
        fixed_overhead: 50
      };

      const result = calculateProductionOverhead(config, 100, 60);
      expect(result).toBe(50);
    });

    it('should calculate per-unit overhead', () => {
      const config: OverheadConfig = {
        method: 'per_unit',
        per_unit_overhead: 5
      };

      const result = calculateProductionOverhead(config, 100, 60);
      expect(result).toBe(5);
    });

    it('should calculate time-based overhead', () => {
      const config: OverheadConfig = {
        method: 'time_based',
        overhead_per_minute: 2
      };

      const result = calculateProductionOverhead(config, 100, 60);
      expect(result).toBe(120); // 60 minutes * $2/min
    });

    it('should return 0 for none method', () => {
      const config: OverheadConfig = {
        method: 'none'
      };

      const result = calculateProductionOverhead(config, 100, 60);
      expect(result).toBe(0);
    });

    it('should handle missing config values', () => {
      const config: OverheadConfig = {
        method: 'fixed'
        // missing fixed_overhead
      };

      const result = calculateProductionOverhead(config, 100, 60);
      expect(result).toBe(0);
    });
  });

  describe('calculateProductTotalCost', () => {
    it('should calculate total cost with all components', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Test Product',
          active: true
        },
        materials: {
          has_materials: true,
          components: [
            { material_id: '1', quantity: 2, unit_cost: 10 }
          ]
        },
        staff: {
          has_staff_requirements: true,
          staff_allocation: [
            {
              role_id: '1',
              count: 1,
              duration_minutes: 60,
              hourly_rate: 20
            }
          ]
        },
        production: {
          requires_production: true,
          production_time_minutes: 60,
          overhead_config: {
            method: 'fixed',
            fixed_overhead: 10
          }
        },
        pricing: {
          price: 100
        }
      };

      const result = calculateProductTotalCost(formData);

      expect(result.materials).toBe(20);
      expect(result.labor).toBe(20);
      expect(result.overhead).toBe(10);
      expect(result.total).toBe(50);
    });

    it('should handle product without materials', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Consultation',
          active: true
        },
        staff: {
          has_staff_requirements: true,
          staff_allocation: [
            {
              role_id: '1',
              count: 1,
              duration_minutes: 60,
              hourly_rate: 50
            }
          ]
        },
        pricing: {
          price: 100
        }
      };

      const result = calculateProductTotalCost(formData);

      expect(result.materials).toBe(0);
      expect(result.labor).toBe(50);
      expect(result.overhead).toBe(0);
      expect(result.total).toBe(50);
    });
  });

  describe('convertTimeToHours', () => {
    it('should convert minutes to hours', () => {
      expect(convertTimeToHours(60)).toBe(1);
      expect(convertTimeToHours(90)).toBe(1.5);
      expect(convertTimeToHours(30)).toBe(0.5);
      expect(convertTimeToHours(45)).toBe(0.75);
    });

    it('should handle zero', () => {
      expect(convertTimeToHours(0)).toBe(0);
    });

    it('should handle large numbers', () => {
      expect(convertTimeToHours(480)).toBe(8); // 8 hours
    });
  });

  describe('convertTimeToMinutes', () => {
    it('should convert hours to minutes', () => {
      expect(convertTimeToMinutes(1)).toBe(60);
      expect(convertTimeToMinutes(1.5)).toBe(90);
      expect(convertTimeToMinutes(0.5)).toBe(30);
      expect(convertTimeToMinutes(0.75)).toBe(45);
    });

    it('should handle zero', () => {
      expect(convertTimeToMinutes(0)).toBe(0);
    });

    it('should handle large numbers', () => {
      expect(convertTimeToMinutes(8)).toBe(480);
    });
  });

  describe('suggestPrice', () => {
    it('should calculate suggested price with standard margin', () => {
      const totalCost = 100;
      const marginPercentage = 40;

      const result = suggestPrice(totalCost, marginPercentage);

      // Suggested price = cost / (1 - margin)
      // 100 / (1 - 0.40) = 100 / 0.60 = 166.67
      expect(result).toBeCloseTo(166.67, 2);
    });

    it('should handle 0% margin', () => {
      const result = suggestPrice(100, 0);
      expect(result).toBe(100);
    });

    it('should handle 50% margin', () => {
      const result = suggestPrice(100, 50);
      expect(result).toBe(200); // 100 / 0.5
    });

    it('should handle small costs', () => {
      const result = suggestPrice(5, 40);
      expect(result).toBeCloseTo(8.33, 2);
    });

    it('should handle zero cost', () => {
      const result = suggestPrice(0, 40);
      expect(result).toBe(0);
    });
  });
});
