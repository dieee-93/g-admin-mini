import { describe, it, expect } from 'vitest';
import {
    calculateMaterialsCost,
    calculateLaborCost,
    calculateOverheadCost,
    calculateTotalCost,
    calculateUnitCost
} from './costCalculations';
import type { RecipeInput } from '../types/recipe';
import type { TeamAssignment } from '@/shared/components/TeamSelector/types';

describe('Cost Calculations Utils', () => {

    // ============================================
    // MATERIALS COST
    // ============================================
    describe('calculateMaterialsCost', () => {
        it('should calculate total cost correctly for valid inputs', () => {
            const inputs: any[] = [
                { quantity: 2, item: { unitCost: 100 } },
                { quantity: 1.5, item: { unitCost: 200 } }
            ];
            // (2 * 100) + (1.5 * 200) = 200 + 300 = 500
            expect(calculateMaterialsCost(inputs)).toBe(500);
        });

        it('should handle zero quantity or cost', () => {
            const inputs: any[] = [
                { quantity: 0, item: { unitCost: 100 } },
                { quantity: 2, item: { unitCost: 0 } }
            ];
            expect(calculateMaterialsCost(inputs)).toBe(0);
        });

        it('should handle empty or null inputs', () => {
            expect(calculateMaterialsCost([])).toBe(0);
            expect(calculateMaterialsCost(undefined as any)).toBe(0);
        });

        it('should handle missing item details gracefully', () => {
            const inputs: any[] = [
                { quantity: 1, item: null }, // Broken reference
                { quantity: 1 } // Missing item completely
            ];
            expect(calculateMaterialsCost(inputs)).toBe(0);
        });

        it('should handle precise decimal calculations', () => {
            // Avoiding floating point errors: 0.1 + 0.2 != 0.3 in standard JS
            const inputs: any[] = [
                { quantity: 0.1, item: { unitCost: 0.1 } }, // 0.01
                { quantity: 0.2, item: { unitCost: 0.1 } }  // 0.02
            ];
            // Expect 0.03 exactly
            expect(calculateMaterialsCost(inputs)).toBe(0.03);
        });
    });

    // ============================================
    // LABOR COST
    // ============================================
    describe('calculateLaborCost', () => {
        it('should sum up assignment costs', () => {
            const assignments: any[] = [
                { total_cost: 1500 },
                { total_cost: 500 }
            ];
            expect(calculateLaborCost(assignments)).toBe(2000);
        });

        it('should handle undefined costs', () => {
            const assignments: any[] = [
                { total_cost: undefined },
                { total_cost: 500 }
            ];
            expect(calculateLaborCost(assignments)).toBe(500);
        });

        it('should handle empty assignments', () => {
            expect(calculateLaborCost([])).toBe(0);
        });
    });

    // ============================================
    // OVERHEAD COST
    // ============================================
    describe('calculateOverheadCost', () => {
        it('should calculate percentage overhead based on materials', () => {
            const materialsCost = 1000;
            const config = {
                overheadPercentage: 10, // 10%
                overheadFixed: 0
            };
            // 10% of 1000 = 100
            expect(calculateOverheadCost(materialsCost, config)).toBe(100);
        });

        it('should add fixed overhead', () => {
            const materialsCost = 1000;
            const config = {
                overheadPercentage: 0,
                overheadFixed: 500
            };
            expect(calculateOverheadCost(materialsCost, config)).toBe(500);
        });

        it('should combine percentage and fixed overhead', () => {
            const materialsCost = 1000;
            const config = {
                overheadPercentage: 10, // 100
                overheadFixed: 50 // + 50
            };
            expect(calculateOverheadCost(materialsCost, config)).toBe(150);
        });

        it('should handle undefined config', () => {
            expect(calculateOverheadCost(1000, undefined)).toBe(0);
        });
    });

    // ============================================
    // TOTAL & UNIT COST
    // ============================================
    describe('calculateTotalCost & calculateUnitCost', () => {
        it('should sum materials, labor and overhead', () => {
            expect(calculateTotalCost(100, 50, 25)).toBe(175);
        });

        it('should calculate unit cost correctly', () => {
            const total = 1000;
            const output = 4;
            expect(calculateUnitCost(total, output)).toBe(250);
        });

        it('should handle division by zero in unit cost', () => {
            expect(calculateUnitCost(1000, 0)).toBe(0);
        });

        it('should handle decimal unit creation', () => {
            // Total 100, output 0.5 (half batch) -> Unit cost 200
            expect(calculateUnitCost(100, 0.5)).toBe(200);
        });
    });
});
