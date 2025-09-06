// Tax Calculation Service - Centralized Tax Logic for Argentina
// Extracted from Sales module for better separation of concerns

import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import { TaxDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ============================================================================
// TAX RATES AND CONSTANTS
// ============================================================================

export const TAX_RATES = {
  IVA: {
    GENERAL: 0.21,        // 21% IVA General
    REDUCIDO: 0.105,      // 10.5% IVA Reducido
    EXENTO: 0.0           // IVA Exento
  },
  INGRESOS_BRUTOS: {
    CABA: 0.03,           // 3% Ingresos Brutos CABA
    BUENOS_AIRES: 0.035,  // 3.5% Buenos Aires
    CORDOBA: 0.04         // 4% Córdoba
  },
  GANANCIAS: {
    PRIMERA_CATEGORIA: 0.35,  // 35% Ganancias Primera Categoría
    SEGUNDA_CATEGORIA: 0.30   // 30% Ganancias Segunda Categoría
  }
} as const;

export const DEFAULT_TAX_CONFIG = {
  ivaRate: TAX_RATES.IVA.GENERAL,
  ingresosBrutosRate: TAX_RATES.INGRESOS_BRUTOS.CABA,
  includeIngresosBrutos: false,  // Por defecto no incluir en POS
  roundTaxes: true,              // Redondear impuestos
  taxIncludedInPrice: true       // Precios con impuestos incluidos (Argentina)
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface TaxConfiguration {
  ivaRate: number;
  ingresosBrutosRate?: number;
  includeIngresosBrutos?: boolean;
  roundTaxes?: boolean;
  taxIncludedInPrice?: boolean;
  jurisdiction?: 'CABA' | 'BUENOS_AIRES' | 'CORDOBA' | 'OTHER';
}

export interface TaxCalculationResult {
  subtotal: number;          // Base amount before taxes
  ivaAmount: number;         // IVA amount
  ingresosBrutosAmount: number; // Ingresos Brutos amount
  totalTaxes: number;        // Total tax amount
  totalAmount: number;       // Final amount including taxes
  breakdown: {
    basePrice: number;
    ivaRate: number;
    ingresosBrutosRate: number;
    effectiveTaxRate: number;
  };
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  ivaCategory?: 'GENERAL' | 'REDUCIDO' | 'EXENTO';
}

// ============================================================================
// TAX CALCULATION SERVICE
// ============================================================================

class TaxCalculationService {
  private config: TaxConfiguration = DEFAULT_TAX_CONFIG;

  constructor(config?: Partial<TaxConfiguration>) {
    if (config) {
      this.updateConfiguration(config);
    }
  }

  /**
   * Update tax configuration
   */
  updateConfiguration(newConfig: Partial<TaxConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Emit configuration change event
    EventBus.emit(
      RestaurantEvents.DATA_SYNCED, 
      { type: 'tax_configuration', config: this.config },
      'TaxCalculationService'
    );
  }

  /**
   * Get current configuration
   */
  getConfiguration(): TaxConfiguration {
    return { ...this.config };
  }

  /**
   * Calculate taxes for a single amount
   */
  calculateTaxesForAmount(amount: number, config?: Partial<TaxConfiguration>): TaxCalculationResult {
    const effectiveConfig = { ...this.config, ...config };
    
    // ENHANCED: Validate inputs for production safety
    if (!DecimalUtils.isFinanciallyValid(amount)) {
      console.warn('TaxCalculationService: Invalid amount provided:', amount);
      return this.getZeroTaxResult();
    }
    
    try {
      const amountDec = DecimalUtils.safeFromValue(amount, 'tax', 'calculateTaxesForAmount');
      const ivaRateDec = DecimalUtils.safeFromValue(effectiveConfig.ivaRate, 'tax', 'IVA rate');
      const ingresosBrutosRateDec = DecimalUtils.safeFromValue(
        effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0, 
        'tax', 
        'Ingresos Brutos rate'
      );

    let subtotalDec: TaxDecimal;
    let ivaAmountDec: TaxDecimal;
    let ingresosBrutosAmountDec: TaxDecimal;

    if (effectiveConfig.taxIncludedInPrice) {
      // Argentine system: prices include taxes
      const totalRateDec = ivaRateDec.plus(ingresosBrutosRateDec);
      
      subtotalDec = amountDec.dividedBy(DECIMAL_CONSTANTS.ONE.plus(totalRateDec));
      ivaAmountDec = subtotalDec.times(ivaRateDec);
      ingresosBrutosAmountDec = subtotalDec.times(ingresosBrutosRateDec);
    } else {
      // US system: prices exclude taxes
      subtotalDec = amountDec;
      ivaAmountDec = amountDec.times(ivaRateDec);
      ingresosBrutosAmountDec = amountDec.times(ingresosBrutosRateDec);
    }

    // DON'T ROUND intermediates - calculate full precision totals first
    const totalTaxesDec = ivaAmountDec.plus(ingresosBrutosAmountDec);
    const totalAmountDec = subtotalDec.plus(totalTaxesDec);
    
    // ROUND AT THE END - all values rounded consistently 
    const finalSubtotal = effectiveConfig.roundTaxes ? subtotalDec.toDecimalPlaces(2) : subtotalDec;
    const finalIvaAmount = effectiveConfig.roundTaxes ? ivaAmountDec.toDecimalPlaces(2) : ivaAmountDec;
    const finalIngresosBrutosAmount = effectiveConfig.roundTaxes ? ingresosBrutosAmountDec.toDecimalPlaces(2) : ingresosBrutosAmountDec;
    const finalTotalTaxes = effectiveConfig.roundTaxes ? totalTaxesDec.toDecimalPlaces(2) : totalTaxesDec;
    const finalTotalAmount = effectiveConfig.roundTaxes ? totalAmountDec.toDecimalPlaces(2) : totalAmountDec;

    const subtotal = finalSubtotal.toNumber();
    const totalTaxes = finalTotalTaxes.toNumber();

    return {
      subtotal,
      ivaAmount: finalIvaAmount.toNumber(),
      ingresosBrutosAmount: finalIngresosBrutosAmount.toNumber(),
      totalTaxes,
      totalAmount: finalTotalAmount.toNumber(),
      breakdown: {
        basePrice: subtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: subtotal > 0 ? DecimalUtils.safeDivide(totalTaxes, subtotal, 'tax', 'effective tax rate').toNumber() : 0,
      }
    };
    } catch (error: any) {
      console.error('TaxCalculationService.calculateTaxesForAmount:', error.message);
      return this.getZeroTaxResult();
    }
  }
  
  /**
   * Safe fallback for invalid tax calculations
   */
  private getZeroTaxResult(): TaxCalculationResult {
    return {
      subtotal: 0,
      ivaAmount: 0,
      ingresosBrutosAmount: 0,
      totalTaxes: 0,
      totalAmount: 0,
      breakdown: {
        basePrice: 0,
        ivaRate: this.config.ivaRate,
        ingresosBrutosRate: this.config.ingresosBrutosRate || 0,
        effectiveTaxRate: 0,
      }
    };
  }

  /**
   * Calculate taxes for multiple items (shopping cart)
   * IMPROVED: Implements "rounding at the end" pattern for maximum accuracy
   */
  calculateTaxesForItems(items: SaleItem[], config?: Partial<TaxConfiguration>): TaxCalculationResult {
    const effectiveConfig = { ...this.config, ...config };
    
    let totalSubtotalDec = new TaxDecimal(0);
    let totalIvaAmountDec = new TaxDecimal(0);
    let totalIngresosBrutosAmountDec = new TaxDecimal(0);
    const ingresosBrutosRateDec = new TaxDecimal(effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0);

    // Calculate each item with FULL PRECISION - no intermediate rounding
    for (const item of items) {
      try {
        // ENHANCED: Validate each item's inputs
        if (!DecimalUtils.isFinanciallyValid(item.quantity) || !DecimalUtils.isFinanciallyValid(item.unitPrice)) {
          console.warn(`TaxCalculationService: Invalid item data:`, item);
          continue; // Skip invalid items
        }
        
        const itemQuantityDec = DecimalUtils.safeFromValue(item.quantity, 'tax', `item ${item.productId} quantity`);
        const itemPriceDec = DecimalUtils.safeFromValue(item.unitPrice, 'tax', `item ${item.productId} price`);
        const itemTotalDec = itemQuantityDec.times(itemPriceDec);
      
      // Get IVA rate based on item category
      let itemIvaRate = effectiveConfig.ivaRate;
      if (item.ivaCategory === 'REDUCIDO') {
        itemIvaRate = TAX_RATES.IVA.REDUCIDO;
      } else if (item.ivaCategory === 'EXENTO') {
        itemIvaRate = TAX_RATES.IVA.EXENTO;
      }
      
      const itemIvaRateDec = new TaxDecimal(itemIvaRate);
      
      let itemSubtotalDec: TaxDecimal;
      let itemIvaAmountDec: TaxDecimal;
      let itemIngresosBrutosAmountDec: TaxDecimal;

      if (effectiveConfig.taxIncludedInPrice) {
        // Argentine system: prices include taxes
        const totalItemRateDec = itemIvaRateDec.plus(ingresosBrutosRateDec);
        itemSubtotalDec = itemTotalDec.dividedBy(DECIMAL_CONSTANTS.ONE.plus(totalItemRateDec));
        itemIvaAmountDec = itemSubtotalDec.times(itemIvaRateDec);
        itemIngresosBrutosAmountDec = itemSubtotalDec.times(ingresosBrutosRateDec);
      } else {
        // US system: prices exclude taxes
        itemSubtotalDec = itemTotalDec;
        itemIvaAmountDec = itemTotalDec.times(itemIvaRateDec);
        itemIngresosBrutosAmountDec = itemTotalDec.times(ingresosBrutosRateDec);
      }

        // Accumulate with FULL PRECISION
        totalSubtotalDec = totalSubtotalDec.plus(itemSubtotalDec);
        totalIvaAmountDec = totalIvaAmountDec.plus(itemIvaAmountDec);
        totalIngresosBrutosAmountDec = totalIngresosBrutosAmountDec.plus(itemIngresosBrutosAmountDec);
      } catch (error: any) {
        console.error(`TaxCalculationService: Error processing item ${item.productId}:`, error.message);
        // Continue processing other items
      }
    }

    // Calculate totals with full precision
    const totalTaxesDec = totalIvaAmountDec.plus(totalIngresosBrutosAmountDec);
    const totalAmountDec = totalSubtotalDec.plus(totalTaxesDec);

    // ROUND AT THE END - Banking-grade final rounding
    const finalSubtotal = effectiveConfig.roundTaxes ? totalSubtotalDec.toDecimalPlaces(2) : totalSubtotalDec;
    const finalIvaAmount = effectiveConfig.roundTaxes ? totalIvaAmountDec.toDecimalPlaces(2) : totalIvaAmountDec;
    const finalIngresosBrutosAmount = effectiveConfig.roundTaxes ? totalIngresosBrutosAmountDec.toDecimalPlaces(2) : totalIngresosBrutosAmountDec;
    const finalTotalTaxes = effectiveConfig.roundTaxes ? totalTaxesDec.toDecimalPlaces(2) : totalTaxesDec;
    const finalTotalAmount = effectiveConfig.roundTaxes ? totalAmountDec.toDecimalPlaces(2) : totalAmountDec;

    const totalSubtotal = finalSubtotal.toNumber();
    const totalTaxes = finalTotalTaxes.toNumber();

    return {
      subtotal: totalSubtotal,
      ivaAmount: finalIvaAmount.toNumber(),
      ingresosBrutosAmount: finalIngresosBrutosAmount.toNumber(),
      totalTaxes,
      totalAmount: finalTotalAmount.toNumber(),
      breakdown: {
        basePrice: totalSubtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: totalSubtotal > 0 ? DecimalUtils.safeDivide(totalTaxes, totalSubtotal, 'tax', 'effective tax rate calculation').toNumber() : 0,
      }
    };
  }

  /**
   * Calculate reverse taxes (from final price to components)
   * Useful for price analysis and reporting
   */
  reverseTaxCalculation(finalAmount: number, config?: Partial<TaxConfiguration>): TaxCalculationResult {
    const effectiveConfig = { ...this.config, ...config };
    
    if (!effectiveConfig.taxIncludedInPrice) {
      // If taxes are not included, this is just a regular calculation
      return this.calculateTaxesForAmount(finalAmount, config);
    }

    // For tax-included prices, reverse the calculation
    const finalAmountDec = new TaxDecimal(finalAmount);
    const ivaRateDec = new TaxDecimal(effectiveConfig.ivaRate);
    const ingresosBrutosRateDec = new TaxDecimal(effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0);
    const totalTaxRateDec = ivaRateDec.plus(ingresosBrutosRateDec);
    
    const subtotalDec = finalAmountDec.dividedBy(DECIMAL_CONSTANTS.ONE.plus(totalTaxRateDec));
    const ivaAmountDec = subtotalDec.times(ivaRateDec);
    const ingresosBrutosAmountDec = subtotalDec.times(ingresosBrutosRateDec);

    const subtotal = effectiveConfig.roundTaxes ? subtotalDec.toDecimalPlaces(2).toNumber() : subtotalDec.toNumber();
    const ivaAmount = effectiveConfig.roundTaxes ? ivaAmountDec.toDecimalPlaces(2).toNumber() : ivaAmountDec.toNumber();
    const ingresosBrutosAmount = effectiveConfig.roundTaxes ? ingresosBrutosAmountDec.toDecimalPlaces(2).toNumber() : ingresosBrutosAmountDec.toNumber();
    
    const totalTaxes = new TaxDecimal(ivaAmount).plus(ingresosBrutosAmount).toNumber();

    return {
      subtotal,
      ivaAmount,
      ingresosBrutosAmount,
      totalTaxes,
      totalAmount: finalAmount,
      breakdown: {
        basePrice: subtotalDec.toNumber(),
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: totalTaxRateDec.toNumber(),
      }
    };
  }

  /**
   * Format tax amounts for display
   */
  formatTaxDisplay(result: TaxCalculationResult): {
    subtotal: string;
    ivaAmount: string;
    ingresosBrutosAmount: string;
    totalTaxes: string;
    totalAmount: string;
  } {
    return {
      subtotal: `$${result.subtotal.toFixed(2)}`,
      ivaAmount: `$${result.ivaAmount.toFixed(2)}`,
      ingresosBrutosAmount: result.ingresosBrutosAmount > 0 ? `$${result.ingresosBrutosAmount.toFixed(2)}` : '$0.00',
      totalTaxes: `$${result.totalTaxes.toFixed(2)}`,
      totalAmount: `$${result.totalAmount.toFixed(2)}`
    };
  }

  /**
   * Get tax summary for period (for reporting)
   */
  getTaxSummaryForPeriod(salesData: Array<{ items: SaleItem[], date: string }>): {
    totalSales: number;
    totalSubtotal: number;
    totalIVA: number;
    totalIngresosBrutos: number;
    totalTaxes: number;
    averageTaxRate: number;
    salesCount: number;
  } {
    let totalSalesDec = DECIMAL_CONSTANTS.ZERO;
    let totalSubtotalDec = DECIMAL_CONSTANTS.ZERO;
    let totalIVADec = DECIMAL_CONSTANTS.ZERO;
    let totalIngresosBrutosDec = DECIMAL_CONSTANTS.ZERO;

    for (const sale of salesData) {
      const calculation = this.calculateTaxesForItems(sale.items);
      totalSalesDec = totalSalesDec.plus(calculation.totalAmount);
      totalSubtotalDec = totalSubtotalDec.plus(calculation.subtotal);
      totalIVADec = totalIVADec.plus(calculation.ivaAmount);
      totalIngresosBrutosDec = totalIngresosBrutosDec.plus(calculation.ingresosBrutosAmount);
    }

    const totalTaxesDec = totalIVADec.plus(totalIngresosBrutosDec);
    const totalSubtotal = totalSubtotalDec.toNumber();
    const averageTaxRate = totalSubtotal > 0 ? totalTaxesDec.dividedBy(totalSubtotal).toNumber() : 0;

    return {
      totalSales: totalSalesDec.toNumber(),
      totalSubtotal,
      totalIVA: totalIVADec.toNumber(),
      totalIngresosBrutos: totalIngresosBrutosDec.toNumber(),
      totalTaxes: totalTaxesDec.toNumber(),
      averageTaxRate,
      salesCount: salesData.length
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE AND UTILITY FUNCTIONS
// ============================================================================

export const taxService = new TaxCalculationService();

/**
 * Quick calculation helper for simple use cases
 */
export function calculateTaxes(amount: number, config?: Partial<TaxConfiguration>): TaxCalculationResult {
  return taxService.calculateTaxesForAmount(amount, config);
}

/**
 * Quick calculation helper for cart items
 */
export function calculateCartTaxes(items: SaleItem[], config?: Partial<TaxConfiguration>): TaxCalculationResult {
  return taxService.calculateTaxesForItems(items, config);
}

/**
 * Helper to get just the tax amount (for backwards compatibility)
 */
export function getTaxAmount(totalAmount: number): number {
  const result = taxService.reverseTaxCalculation(totalAmount);
  return result.totalTaxes;
}

/**
 * Helper to get just the subtotal (for backwards compatibility)
 */
export function getSubtotal(totalAmount: number): number {
  const result = taxService.reverseTaxCalculation(totalAmount);
  return result.subtotal;
}

export { TaxCalculationService };