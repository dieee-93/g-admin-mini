import { useMemo } from 'react';

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

export function useCostCalculations() {
  
  /**
   * Core cost calculation logic - centralized from duplicated components
   */
  const calculateCosts = useMemo(() => (input: BaseCostInput, markup_percentage = 80): CostCalculationResult => {
    const {
      materials_cost,
      batch_size,
      labor_hours,
      labor_rate_per_hour = 15,
      equipment_cost = 0,
      utility_cost = 0,
      facility_cost = 0
    } = input;

    // Derived calculations
    const materials_per_unit = materials_cost / batch_size;
    const labor_cost = labor_hours * labor_rate_per_hour;
    const overhead_total = equipment_cost + utility_cost + facility_cost;
    const total_cost = materials_cost + labor_cost + overhead_total;
    const cost_per_unit = total_cost / batch_size;
    
    // Pricing calculations
    const suggested_price = cost_per_unit * (1 + markup_percentage / 100);
    const profit_margin = ((suggested_price - cost_per_unit) / suggested_price) * 100;

    return {
      materials_per_unit,
      labor_cost,
      overhead_total,
      total_cost,
      cost_per_unit,
      suggested_price,
      profit_margin,
      markup_percentage
    };
  }, []);

  /**
   * Generate pricing scenarios - centralized from PricingScenarios component
   */
  const generatePricingScenarios = useMemo(() => (cost_per_unit: number, overhead_total: number, batch_size: number): PricingScenario[] => {
    const basePrice = cost_per_unit;
    
    return [
      {
        name: 'Conservative',
        price: basePrice * 1.5,
        margin: 33.33,
        units_to_breakeven: Math.ceil(overhead_total / (basePrice * 0.5)),
        projected_profit: (basePrice * 0.5) * batch_size
      },
      {
        name: 'Standard',
        price: basePrice * 1.8,
        margin: 44.44,
        units_to_breakeven: Math.ceil(overhead_total / (basePrice * 0.8)),
        projected_profit: (basePrice * 0.8) * batch_size
      },
      {
        name: 'Premium',
        price: basePrice * 2.2,
        margin: 54.55,
        units_to_breakeven: Math.ceil(overhead_total / (basePrice * 1.2)),
        projected_profit: (basePrice * 1.2) * batch_size
      }
    ];
  }, []);

  /**
   * Calculate cost breakdown percentages - centralized logic
   */
  const calculateCostBreakdown = useMemo(() => (calculation: CostCalculationResult, materials_cost: number): CostBreakdown => {
    const { total_cost, labor_cost, overhead_total, profit_margin } = calculation;
    
    return {
      materials_percentage: (materials_cost / total_cost) * 100,
      labor_percentage: (labor_cost / total_cost) * 100,
      overhead_percentage: (overhead_total / total_cost) * 100,
      profit_percentage: profit_margin
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
    return quantity * unit_price;
  }, []);

  /**
   * Calculate total cost from quantity and unit cost - for Menu Engineering
   */
  const calculateTotalCost = useMemo(() => (quantity: number, unit_cost: number): number => {
    return quantity * unit_cost;
  }, []);

  /**
   * Calculate average price from total revenue and quantity
   */
  const calculateAveragePrice = useMemo(() => (total_revenue: number, quantity: number): number => {
    return quantity > 0 ? total_revenue / quantity : 0;
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
  const { calculateTotalRevenue, calculateTotalCost, calculateAveragePrice } = useCostCalculations();

  /**
   * Calculate product profit from sales data
   */
  const calculateProductProfit = useMemo(() => (total_revenue: number, total_cost: number): number => {
    return total_revenue - total_cost;
  }, []);

  /**
   * Calculate profit margin percentage
   */
  const calculateProfitMargin = useMemo(() => (total_revenue: number, total_cost: number): number => {
    return total_revenue > 0 ? ((total_revenue - total_cost) / total_revenue) * 100 : 0;
  }, []);

  return {
    calculateTotalRevenue,
    calculateTotalCost,
    calculateAveragePrice,
    calculateProductProfit,
    calculateProfitMargin
  };
}
