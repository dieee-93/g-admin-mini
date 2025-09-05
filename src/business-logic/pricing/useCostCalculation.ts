import { useMemo } from 'react';
import Decimal from '@/config/decimal-config';

/**
 * Centralized hook for all cost calculation logic
 * Eliminates duplication across CostAnalysisTab, CostCalculator, PricingScenarios, etc.
 */

export interface BaseCostInput {
  materials_cost: number;
  batch_size: number;
  labor_hours: number;
  labor_rate_per_hour?: number;
  equipment_cost?: number;
  utility_cost?: number;
  facility_cost?: number;
}

export interface CostCalculationResult {
  materials_per_unit: number;
  labor_cost: number;
  overhead_total: number;
  total_cost: number;
  cost_per_unit: number;
  suggested_price: number;
  profit_margin: number;
  markup_percentage: number;
}

export interface PricingScenario {
  name: string;
  price: number;
  margin: number;
  units_to_breakeven: number;
  projected_profit: number;
}

export interface CostBreakdown {
  materials_percentage: number;
  labor_percentage: number;
  overhead_percentage: number;
  profit_percentage: number;
}

export function useCostCalculation() {
  
  /**
   * Core cost calculation logic - centralized from duplicated components
   */
  const calculateCosts = useMemo(() => (input: BaseCostInput, markup_percentage = 80): CostCalculationResult => {
    const materialsCostDec = new Decimal(input.materials_cost);
    const batchSizeDec = new Decimal(input.batch_size);
    const laborHoursDec = new Decimal(input.labor_hours);
    const laborRateDec = new Decimal(input.labor_rate_per_hour || 15);
    const equipmentCostDec = new Decimal(input.equipment_cost || 0);
    const utilityCostDec = new Decimal(input.utility_cost || 0);
    const facilityCostDec = new Decimal(input.facility_cost || 0);

    if (batchSizeDec.isZero() || batchSizeDec.isNegative()) {
      // Return a zeroed-out result if batch size is invalid
      return {
        materials_per_unit: 0, labor_cost: 0, overhead_total: 0,
        total_cost: 0, cost_per_unit: 0, suggested_price: 0,
        profit_margin: 0, markup_percentage
      };
    }

    // Derived calculations
    const materialsPerUnitDec = materialsCostDec.dividedBy(batchSizeDec);
    const laborCostDec = laborHoursDec.times(laborRateDec);
    const overheadTotalDec = equipmentCostDec.plus(utilityCostDec).plus(facilityCostDec);
    const totalCostDec = materialsCostDec.plus(laborCostDec).plus(overheadTotalDec);
    const costPerUnitDec = totalCostDec.dividedBy(batchSizeDec);
    
    // Pricing calculations
    const markupFactor = new Decimal(1).plus(new Decimal(markup_percentage).dividedBy(100));
    const suggestedPriceDec = costPerUnitDec.times(markupFactor);
    
    let profitMarginDec = new Decimal(0);
    if (suggestedPriceDec.isPositive()) {
      profitMarginDec = suggestedPriceDec.minus(costPerUnitDec).dividedBy(suggestedPriceDec).times(100);
    }

    return {
      materials_per_unit: materialsPerUnitDec.toDecimalPlaces(2).toNumber(),
      labor_cost: laborCostDec.toDecimalPlaces(2).toNumber(),
      overhead_total: overheadTotalDec.toDecimalPlaces(2).toNumber(),
      total_cost: totalCostDec.toDecimalPlaces(2).toNumber(),
      cost_per_unit: costPerUnitDec.toDecimalPlaces(2).toNumber(),
      suggested_price: suggestedPriceDec.toDecimalPlaces(2).toNumber(),
      profit_margin: profitMarginDec.toDecimalPlaces(2).toNumber(),
      markup_percentage
    };
  }, []);

  /**
   * Generate pricing scenarios - centralized from PricingScenarios component
   */
  const generatePricingScenarios = useMemo(() => (cost_per_unit: number, overhead_total: number, batch_size: number): PricingScenario[] => {
    const costPerUnitDec = new Decimal(cost_per_unit);
    const overheadTotalDec = new Decimal(overhead_total);
    const batchSizeDec = new Decimal(batch_size);

    const createScenario = (name: string, multiplier: number, margin: number) => {
      const priceDec = costPerUnitDec.times(multiplier);
      const profitPerUnit = priceDec.minus(costPerUnitDec);
      let unitsToBreakeven = new Decimal(0);
      if (profitPerUnit.isPositive()) {
        unitsToBreakeven = overheadTotalDec.dividedBy(profitPerUnit).ceil();
      }
      
      return {
        name,
        price: priceDec.toDecimalPlaces(2).toNumber(),
        margin,
        units_to_breakeven: unitsToBreakeven.toNumber(),
        projected_profit: profitPerUnit.times(batchSizeDec).toDecimalPlaces(2).toNumber(),
      };
    };
    
    return [
      createScenario('Conservative', 1.5, 33.33),
      createScenario('Standard', 1.8, 44.44),
      createScenario('Premium', 2.2, 54.55)
    ];
  }, []);

  /**
   * Calculate cost breakdown percentages - centralized logic
   */
  const calculateCostBreakdown = useMemo(() => (calculation: CostCalculationResult, materials_cost: number): CostBreakdown => {
    const totalCostDec = new Decimal(calculation.total_cost);
    if (totalCostDec.isZero()) {
      return { materials_percentage: 0, labor_percentage: 0, overhead_percentage: 0, profit_percentage: 0 };
    }
    
    const materialsPercentage = new Decimal(materials_cost).dividedBy(totalCostDec).times(100);
    const laborPercentage = new Decimal(calculation.labor_cost).dividedBy(totalCostDec).times(100);
    const overheadPercentage = new Decimal(calculation.overhead_total).dividedBy(totalCostDec).times(100);
    
    return {
      materials_percentage: materialsPercentage.toDecimalPlaces(2).toNumber(),
      labor_percentage: laborPercentage.toDecimalPlaces(2).toNumber(),
      overhead_percentage: overheadPercentage.toDecimalPlaces(2).toNumber(),
      profit_percentage: calculation.profit_margin // Already a percentage
    };
  }, []);

  /**
   * Validate if calculation is possible
   */
  const canCalculate = useMemo(() => (input: Partial<BaseCostInput>): boolean => {
    return !!(input.materials_cost && input.labor_hours && input.batch_size && input.batch_size > 0);
  }, []);

  /**
   * Calculate total revenue from sales data - for Menu Engineering
   */
  const calculateTotalRevenue = useMemo(() => (quantity: number, unit_price: number): number => {
    return new Decimal(quantity).times(unit_price).toNumber();
  }, []);

  /**
   * Calculate total cost from quantity and unit cost - for Menu Engineering
   */
  const calculateTotalCost = useMemo(() => (quantity: number, unit_cost: number): number => {
    return new Decimal(quantity).times(unit_cost).toNumber();
  }, []);

  /**
   * Calculate average price from total revenue and quantity
   */
  const calculateAveragePrice = useMemo(() => (total_revenue: number, quantity: number): number => {
    const quantityDec = new Decimal(quantity);
    return quantityDec.isPositive() ? new Decimal(total_revenue).dividedBy(quantityDec).toNumber() : 0;
  }, []);

  return {
    calculateCosts,
    generatePricingScenarios,
    calculateCostBreakdown,
    canCalculate,
    calculateTotalRevenue,
    calculateTotalCost,
    calculateAveragePrice
  };
}

/**
 * Hook specifically for Menu Engineering calculations
 */
export function useMenuEngineeringCalculations() {
  const { calculateTotalRevenue, calculateTotalCost, calculateAveragePrice } = useCostCalculation();

  /**
   * Calculate product profit from sales data
   */
  const calculateProductProfit = useMemo(() => (total_revenue: number, total_cost: number): number => {
    return new Decimal(total_revenue).minus(total_cost).toNumber();
  }, []);

  /**
   * Calculate profit margin percentage
   */
  const calculateProfitMargin = useMemo(() => (total_revenue: number, total_cost: number): number => {
    const totalRevenueDec = new Decimal(total_revenue);
    if (totalRevenueDec.isZero() || totalRevenueDec.isNegative()) return 0;
    
    const totalCostDec = new Decimal(total_cost);
    const profit = totalRevenueDec.minus(totalCostDec);
    return profit.dividedBy(totalRevenueDec).times(100).toDecimalPlaces(2).toNumber();
  }, []);

  return {
    calculateTotalRevenue,
    calculateTotalCost,
    calculateAveragePrice,
    calculateProductProfit,
    calculateProfitMargin
  };
}
