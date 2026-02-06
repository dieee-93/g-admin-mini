/**
 * Recipe Cost Calculations
 * 
 * Pure functions for calculating recipe costs based on inputs, labor, and overhead.
 * Uses DecimalUtils for financial precision.
 */

import { DecimalUtils } from '@/lib/decimal';
import type { Recipe, RecipeInput } from '../types/recipe';
import type { StaffAssignment } from '@/shared/components/StaffSelector/types';

/**
 * Calculate total cost of materials
 */
export const calculateMaterialsCost = (inputs: RecipeInput[] = []): number => {
    if (!inputs || inputs.length === 0) return 0;

    return inputs.reduce((sum, input) => {
        const quantity = input.quantity || 0;
        const unitCost =
            typeof input.item === 'object' && input.item?.unitCost !== undefined
                ? input.item.unitCost
                : 0;

        const inputCost = DecimalUtils.multiply(
            quantity.toString(),
            unitCost.toString(),
            'financial'
        );

        return DecimalUtils.add(sum.toString(), inputCost, 'financial').toNumber();
    }, 0);
};

/**
 * Calculate total cost of labor
 */
export const calculateLaborCost = (staffAssignments: StaffAssignment[] = []): number => {
    if (!staffAssignments || staffAssignments.length === 0) return 0;

    return staffAssignments.reduce((sum, assignment) => {
        return DecimalUtils.add(
            sum.toString(),
            (assignment.total_cost || 0).toString(),
            'financial'
        ).toNumber();
    }, 0);
};

/**
 * Calculate overhead cost
 * Overhead can be a percentage of materials OR a fixed amount OR both.
 */
export const calculateOverheadCost = (
    materialsCost: number,
    config: Recipe['costConfig']
): number => {
    const overheadPercentage = config?.overheadPercentage || 0;
    const overheadFixed = config?.overheadFixed || 0;

    // Percentage overhead is calculated on MATERIALS only (industrial standard)
    const percentageOverhead = DecimalUtils.multiply(
        materialsCost.toString(),
        (overheadPercentage / 100).toString(),
        'financial'
    );

    // Total overhead = (Materials * %) + Fixed
    return DecimalUtils.add(
        percentageOverhead,
        overheadFixed.toString(),
        'financial'
    ).toNumber();
};

/**
 * Calculate total production cost
 */
export const calculateTotalCost = (
    materials: number,
    labor: number,
    overhead: number
): number => {
    const subtotal = DecimalUtils.add(materials.toString(), labor.toString(), 'financial');
    return DecimalUtils.add(subtotal, overhead.toString(), 'financial').toNumber();
};

/**
 * Calculate unit cost (Total / Output Quantity)
 */
export const calculateUnitCost = (totalCost: number, outputQuantity: number = 1): number => {
    if (outputQuantity <= 0) return 0;

    return DecimalUtils.divide(
        totalCost.toString(),
        outputQuantity.toString(),
        'financial'
    ).toNumber();
};
