/**
 * Consolidated Financial Calculations
 * Eliminates ~400 lines of duplicated calculation logic across modules
 * Centralizes all common financial formulas with DecimalUtils precision
 */

import { DecimalUtils } from './decimalUtils';

export interface PricingScenario {
  markup_percentage: number;
  selling_price: number;
  profit_margin: number;
  profit_amount: number;
  competitiveness_score: number;
}

export interface BreakEvenAnalysis {
  break_even_quantity: number;
  break_even_revenue: number;
  fixed_costs: number;
  variable_cost_per_unit: number;
  contribution_margin: number;
  contribution_margin_ratio: number;
  safety_margin_units: number;
  safety_margin_percentage: number;
}

export interface CostStructureAnalysis {
  total_cost: number;
  fixed_costs: number;
  variable_costs: number;
  fixed_cost_percentage: number;
  variable_cost_percentage: number;
  cost_per_unit: number;
  economies_of_scale_factor: number;
}

export interface ProfitAnalysis {
  gross_profit: number;
  gross_margin_percentage: number;
  net_profit: number;
  net_margin_percentage: number;
  markup_percentage: number;
  return_on_cost: number;
  profit_per_unit: number;
}

/**
 * Central class for all financial calculations used across the application
 */
export class FinancialCalculations {
  
  /**
   * Calculate profit margin as a percentage
   * Used in: costCalculationEngine, useCostCalculation, productCostAnalysis
   */
  static calculateProfitMargin(sellingPrice: number, cost: number): number {
    const sellingPriceDec = DecimalUtils.fromValue(sellingPrice, 'financial');
    const costDec = DecimalUtils.fromValue(cost, 'financial');
    
    if (DecimalUtils.isZero(sellingPriceDec)) {
      return 0;
    }
    
    const profitDec = DecimalUtils.subtract(sellingPriceDec, costDec, 'financial');
    const marginDec = DecimalUtils.divide(profitDec, sellingPriceDec, 'financial');
    const percentageDec = DecimalUtils.multiply(marginDec, DecimalUtils.fromValue(100, 'financial'), 'financial');
    
    return DecimalUtils.toNumber(percentageDec);
  }
  
  /**
   * Calculate markup percentage
   * Used in: costCalculationEngine, pricing modules
   */
  static calculateMarkup(sellingPrice: number, cost: number): number {
    const sellingPriceDec = DecimalUtils.fromValue(sellingPrice, 'financial');
    const costDec = DecimalUtils.fromValue(cost, 'financial');
    
    if (DecimalUtils.isZero(costDec)) {
      return 0;
    }
    
    const markupDec = DecimalUtils.subtract(sellingPriceDec, costDec, 'financial');
    const markupRatioDec = DecimalUtils.divide(markupDec, costDec, 'financial');
    const percentageDec = DecimalUtils.multiply(markupRatioDec, DecimalUtils.fromValue(100, 'financial'), 'financial');
    
    return DecimalUtils.toNumber(percentageDec);
  }
  
  /**
   * Calculate selling price from cost and desired markup
   */
  static calculateSellingPriceFromMarkup(cost: number, markupPercentage: number): number {
    const costDec = DecimalUtils.fromValue(cost, 'financial');
    const markupDec = DecimalUtils.fromValue(markupPercentage / 100, 'financial');
    
    const multiplierDec = DecimalUtils.add(DecimalUtils.fromValue(1, 'financial'), markupDec, 'financial');
    const sellingPriceDec = DecimalUtils.multiply(costDec, multiplierDec, 'financial');
    
    return DecimalUtils.toNumber(sellingPriceDec);
  }
  
  /**
   * Calculate selling price from cost and desired profit margin
   */
  static calculateSellingPriceFromMargin(cost: number, marginPercentage: number): number {
    const costDec = DecimalUtils.fromValue(cost, 'financial');
    const marginDec = DecimalUtils.fromValue(marginPercentage / 100, 'financial');
    
    // Price = Cost / (1 - Margin)
    const denominatorDec = DecimalUtils.subtract(DecimalUtils.fromValue(1, 'financial'), marginDec, 'financial');
    
    if (DecimalUtils.isZero(denominatorDec) || DecimalUtils.isNegative(denominatorDec)) {
      throw new Error('Invalid margin percentage');
    }
    
    const sellingPriceDec = DecimalUtils.divide(costDec, denominatorDec, 'financial');
    return DecimalUtils.toNumber(sellingPriceDec);
  }
  
  /**
   * Generate multiple pricing scenarios
   * Used in: cost analysis components, pricing strategy modules
   */
  static generatePricingScenarios(
    baseCost: number, 
    markupOptions: number[] = [25, 50, 75, 100, 150]
  ): PricingScenario[] {
    return markupOptions.map(markup => {
      const sellingPrice = this.calculateSellingPriceFromMarkup(baseCost, markup);
      const profitMargin = this.calculateProfitMargin(sellingPrice, baseCost);
      const profitAmount = sellingPrice - baseCost;
      
      // Simple competitiveness score (higher markup = lower competitiveness)
      const competitivenessScore = Math.max(0, 100 - (markup / 2));
      
      return {
        markup_percentage: markup,
        selling_price: sellingPrice,
        profit_margin: profitMargin,
        profit_amount: profitAmount,
        competitiveness_score: competitivenessScore
      };
    });
  }
  
  /**
   * Calculate break-even analysis
   * Used in: financial planning, cost analysis modules
   */
  static calculateBreakEvenAnalysis(
    fixedCosts: number,
    variableCostPerUnit: number,
    sellingPricePerUnit: number,
    currentVolume: number = 0
  ): BreakEvenAnalysis {
    const fixedCostsDec = DecimalUtils.fromValue(fixedCosts, 'financial');
    const variableCostDec = DecimalUtils.fromValue(variableCostPerUnit, 'financial');
    const sellingPriceDec = DecimalUtils.fromValue(sellingPricePerUnit, 'financial');
    const currentVolumeDec = DecimalUtils.fromValue(currentVolume, 'inventory');
    
    // Contribution margin per unit
    const contributionMarginDec = DecimalUtils.subtract(sellingPriceDec, variableCostDec, 'financial');
    
    if (DecimalUtils.isZero(contributionMarginDec) || DecimalUtils.isNegative(contributionMarginDec)) {
      throw new Error('Invalid pricing: selling price must be greater than variable cost');
    }
    
    // Break-even quantity
    const breakEvenQtyDec = DecimalUtils.divide(fixedCostsDec, contributionMarginDec, 'financial');
    
    // Break-even revenue
    const breakEvenRevenueDec = DecimalUtils.multiply(breakEvenQtyDec, sellingPriceDec, 'financial');
    
    // Contribution margin ratio
    const contributionMarginRatioDec = DecimalUtils.divide(contributionMarginDec, sellingPriceDec, 'financial');
    const contributionMarginRatioPercent = DecimalUtils.multiply(contributionMarginRatioDec, DecimalUtils.fromValue(100, 'financial'), 'financial');
    
    // Safety margin
    const safetyMarginUnitsDec = DecimalUtils.subtract(currentVolumeDec, breakEvenQtyDec, 'inventory');
    const safetyMarginPercentDec = DecimalUtils.isZero(breakEvenQtyDec) 
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.multiply(
          DecimalUtils.divide(safetyMarginUnitsDec, breakEvenQtyDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );
    
    return {
      break_even_quantity: DecimalUtils.toNumber(breakEvenQtyDec),
      break_even_revenue: DecimalUtils.toNumber(breakEvenRevenueDec),
      fixed_costs: fixedCosts,
      variable_cost_per_unit: variableCostPerUnit,
      contribution_margin: DecimalUtils.toNumber(contributionMarginDec),
      contribution_margin_ratio: DecimalUtils.toNumber(contributionMarginRatioPercent),
      safety_margin_units: DecimalUtils.toNumber(safetyMarginUnitsDec),
      safety_margin_percentage: DecimalUtils.toNumber(safetyMarginPercentDec)
    };
  }
  
  /**
   * Analyze cost structure
   * Used in: cost analysis, operational efficiency modules
   */
  static analyzeCostStructure(
    fixedCosts: number,
    variableCosts: number,
    volume: number
  ): CostStructureAnalysis {
    const fixedCostsDec = DecimalUtils.fromValue(fixedCosts, 'financial');
    const variableCostsDec = DecimalUtils.fromValue(variableCosts, 'financial');
    const volumeDec = DecimalUtils.fromValue(volume, 'inventory');
    
    const totalCostDec = DecimalUtils.add(fixedCostsDec, variableCostsDec, 'financial');
    
    // Cost percentages
    const fixedCostPercentDec = DecimalUtils.multiply(
      DecimalUtils.divide(fixedCostsDec, totalCostDec, 'financial'),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );
    
    const variableCostPercentDec = DecimalUtils.multiply(
      DecimalUtils.divide(variableCostsDec, totalCostDec, 'financial'),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );
    
    // Cost per unit
    const costPerUnitDec = DecimalUtils.isZero(volumeDec) 
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.divide(totalCostDec, volumeDec, 'financial');
    
    // Economies of scale factor (how much fixed cost per unit decreases with volume)
    const fixedCostPerUnitDec = DecimalUtils.isZero(volumeDec)
      ? fixedCostsDec
      : DecimalUtils.divide(fixedCostsDec, volumeDec, 'financial');
    
    // Lower fixed cost per unit = better economies of scale
    const economiesOfScaleDec = DecimalUtils.isZero(fixedCostPerUnitDec)
      ? DecimalUtils.fromValue(100, 'financial')
      : DecimalUtils.subtract(
          DecimalUtils.fromValue(100, 'financial'),
          DecimalUtils.min(DecimalUtils.toNumber(fixedCostPerUnitDec), 100),
          'financial'
        );
    
    return {
      total_cost: DecimalUtils.toNumber(totalCostDec),
      fixed_costs: fixedCosts,
      variable_costs: variableCosts,
      fixed_cost_percentage: DecimalUtils.toNumber(fixedCostPercentDec),
      variable_cost_percentage: DecimalUtils.toNumber(variableCostPercentDec),
      cost_per_unit: DecimalUtils.toNumber(costPerUnitDec),
      economies_of_scale_factor: DecimalUtils.toNumber(economiesOfScaleDec)
    };
  }
  
  /**
   * Comprehensive profit analysis
   * Used in: profitability reports, financial dashboards
   */
  static analyzeProfitability(
    revenue: number,
    totalCosts: number,
    operatingExpenses: number = 0
  ): ProfitAnalysis {
    const revenueDec = DecimalUtils.fromValue(revenue, 'financial');
    const totalCostsDec = DecimalUtils.fromValue(totalCosts, 'financial');
    const operatingExpensesDec = DecimalUtils.fromValue(operatingExpenses, 'financial');
    
    // Gross profit (revenue - cost of goods sold)
    const grossProfitDec = DecimalUtils.subtract(revenueDec, totalCostsDec, 'financial');
    
    // Net profit (gross profit - operating expenses)
    const netProfitDec = DecimalUtils.subtract(grossProfitDec, operatingExpensesDec, 'financial');
    
    // Margin percentages
    const grossMarginDec = DecimalUtils.isZero(revenueDec) 
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.multiply(
          DecimalUtils.divide(grossProfitDec, revenueDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );
    
    const netMarginDec = DecimalUtils.isZero(revenueDec)
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.multiply(
          DecimalUtils.divide(netProfitDec, revenueDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );
    
    // Markup percentage
    const markupDec = DecimalUtils.isZero(totalCostsDec)
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.multiply(
          DecimalUtils.divide(grossProfitDec, totalCostsDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );
    
    // Return on cost
    const returnOnCostDec = DecimalUtils.isZero(totalCostsDec)
      ? DecimalUtils.fromValue(0, 'financial') 
      : DecimalUtils.multiply(
          DecimalUtils.divide(netProfitDec, totalCostsDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );
    
    return {
      gross_profit: DecimalUtils.toNumber(grossProfitDec),
      gross_margin_percentage: DecimalUtils.toNumber(grossMarginDec),
      net_profit: DecimalUtils.toNumber(netProfitDec),
      net_margin_percentage: DecimalUtils.toNumber(netMarginDec),
      markup_percentage: DecimalUtils.toNumber(markupDec),
      return_on_cost: DecimalUtils.toNumber(returnOnCostDec),
      profit_per_unit: DecimalUtils.toNumber(grossProfitDec) // Assuming analysis is per unit
    };
  }
  
  /**
   * Calculate ROI (Return on Investment)
   */
  static calculateROI(profit: number, investment: number): number {
    const profitDec = DecimalUtils.fromValue(profit, 'financial');
    const investmentDec = DecimalUtils.fromValue(investment, 'financial');
    
    if (DecimalUtils.isZero(investmentDec)) {
      return 0;
    }
    
    const roiDec = DecimalUtils.multiply(
      DecimalUtils.divide(profitDec, investmentDec, 'financial'),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );
    
    return DecimalUtils.toNumber(roiDec);
  }
  
  /**
   * Calculate compound annual growth rate (CAGR)
   */
  static calculateCAGR(
    initialValue: number, 
    finalValue: number, 
    periods: number
  ): number {
    if (initialValue <= 0 || finalValue <= 0 || periods <= 0) {
      return 0;
    }
    
    const initialDec = DecimalUtils.fromValue(initialValue, 'financial');
    const finalDec = DecimalUtils.fromValue(finalValue, 'financial');
    const periodsDec = DecimalUtils.fromValue(periods, 'financial');
    
    // CAGR = (Final Value / Initial Value)^(1/periods) - 1
    const ratioDec = DecimalUtils.divide(finalDec, initialDec, 'financial');
    const ratio = DecimalUtils.toNumber(ratioDec);
    
    const cagr = Math.pow(ratio, 1 / periods) - 1;
    return cagr * 100; // Convert to percentage
  }
  
  /**
   * Calculate present value (for NPV calculations)
   */
  static calculatePresentValue(
    futureValue: number,
    discountRate: number,
    periods: number
  ): number {
    const futureValueDec = DecimalUtils.fromValue(futureValue, 'financial');
    const discountRateDec = DecimalUtils.fromValue(discountRate, 'financial');
    const periodsDec = DecimalUtils.fromValue(periods, 'financial');
    
    // PV = FV / (1 + r)^n
    const onePlusRateDec = DecimalUtils.add(DecimalUtils.fromValue(1, 'financial'), discountRateDec, 'financial');
    const discountFactor = Math.pow(DecimalUtils.toNumber(onePlusRateDec), periods);
    
    const presentValueDec = DecimalUtils.divide(
      futureValueDec,
      DecimalUtils.fromValue(discountFactor, 'financial'),
      'financial'
    );
    
    return DecimalUtils.toNumber(presentValueDec);
  }
  
  /**
   * Format currency consistently across the application
   */
  static formatCurrency(
    amount: number, 
    currency: string = 'ARS',
    locale: string = 'es-AR'
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      // Fallback formatting
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
  
  /**
   * Format percentage consistently
   */
  static formatPercentage(
    value: number,
    decimals: number = 1,
    locale: string = 'es-AR'
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);
    } catch {
      // Fallback formatting
      return `${value.toFixed(decimals)}%`;
    }
  }
}

/**
 * Quick utility functions for common calculations
 */
export const QuickCalculations = {
  profitMargin: FinancialCalculations.calculateProfitMargin,
  markup: FinancialCalculations.calculateMarkup,
  sellingPriceFromMarkup: FinancialCalculations.calculateSellingPriceFromMarkup,
  sellingPriceFromMargin: FinancialCalculations.calculateSellingPriceFromMargin,
  roi: FinancialCalculations.calculateROI,
  formatCurrency: FinancialCalculations.formatCurrency,
  formatPercentage: FinancialCalculations.formatPercentage
} as const;