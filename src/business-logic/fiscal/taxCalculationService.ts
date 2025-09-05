// Tax Calculation Service - Centralized Tax Logic for Argentina
// Extracted from Sales module for better separation of concerns

import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import Decimal from '@/config/decimal-config';

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
    
    const amountDec = new Decimal(amount);
    const ivaRateDec = new Decimal(effectiveConfig.ivaRate);
    const ingresosBrutosRateDec = new Decimal(effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0);

    let subtotalDec: Decimal;
    let ivaAmountDec: Decimal;
    let ingresosBrutosAmountDec: Decimal;

    if (effectiveConfig.taxIncludedInPrice) {
      // Argentine system: prices include taxes
      const totalRateDec = ivaRateDec.plus(ingresosBrutosRateDec);
      
      subtotalDec = amountDec.dividedBy(new Decimal(1).plus(totalRateDec));
      ivaAmountDec = subtotalDec.times(ivaRateDec);
      ingresosBrutosAmountDec = subtotalDec.times(ingresosBrutosRateDec);
    } else {
      // US system: prices exclude taxes
      subtotalDec = amountDec;
      ivaAmountDec = amountDec.times(ivaRateDec);
      ingresosBrutosAmountDec = amountDec.times(ingresosBrutosRateDec);
    }

    // Round if configured
    if (effectiveConfig.roundTaxes) {
      subtotalDec = subtotalDec.toDecimalPlaces(2);
      ivaAmountDec = ivaAmountDec.toDecimalPlaces(2);
      ingresosBrutosAmountDec = ingresosBrutosAmountDec.toDecimalPlaces(2);
    }

    const totalTaxesDec = ivaAmountDec.plus(ingresosBrutosAmountDec);
    const totalAmountDec = subtotalDec.plus(totalTaxesDec);

    const subtotal = subtotalDec.toNumber();
    const totalTaxes = totalTaxesDec.toNumber();

    return {
      subtotal,
      ivaAmount: ivaAmountDec.toNumber(),
      ingresosBrutosAmount: ingresosBrutosAmountDec.toNumber(),
      totalTaxes,
      totalAmount: totalAmountDec.toNumber(),
      breakdown: {
        basePrice: subtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: subtotal > 0 ? new Decimal(totalTaxes).dividedBy(subtotal).toNumber() : 0,
      }
    };
  }

  /**
   * Calculate taxes for multiple items (shopping cart)
   */
  calculateTaxesForItems(items: SaleItem[], config?: Partial<TaxConfiguration>): TaxCalculationResult {
    const effectiveConfig = { ...this.config, ...config };
    
    let totalSubtotalDec = new Decimal(0);
    let totalIvaAmountDec = new Decimal(0);
    let totalIngresosBrutosAmountDec = new Decimal(0);

    for (const item of items) {
      const itemTotalDec = new Decimal(item.quantity).times(item.unitPrice);
      
      // Get IVA rate based on item category
      let itemIvaRate = effectiveConfig.ivaRate;
      if (item.ivaCategory === 'REDUCIDO') {
        itemIvaRate = TAX_RATES.IVA.REDUCIDO;
      } else if (item.ivaCategory === 'EXENTO') {
        itemIvaRate = TAX_RATES.IVA.EXENTO;
      }

      // Calculate taxes for this item
      const itemTaxConfig = { ...effectiveConfig, ivaRate: itemIvaRate };
      const itemResult = this.calculateTaxesForAmount(itemTotalDec.toNumber(), itemTaxConfig);

      totalSubtotalDec = totalSubtotalDec.plus(itemResult.subtotal);
      totalIvaAmountDec = totalIvaAmountDec.plus(itemResult.ivaAmount);
      totalIngresosBrutosAmountDec = totalIngresosBrutosAmountDec.plus(itemResult.ingresosBrutosAmount);
    }

    // Round totals if configured
    if (effectiveConfig.roundTaxes) {
      totalSubtotalDec = totalSubtotalDec.toDecimalPlaces(2);
      totalIvaAmountDec = totalIvaAmountDec.toDecimalPlaces(2);
      totalIngresosBrutosAmountDec = totalIngresosBrutosAmountDec.toDecimalPlaces(2);
    }

    const totalTaxesDec = totalIvaAmountDec.plus(totalIngresosBrutosAmountDec);
    const totalAmountDec = totalSubtotalDec.plus(totalTaxesDec);

    const totalSubtotal = totalSubtotalDec.toNumber();
    const totalTaxes = totalTaxesDec.toNumber();

    return {
      subtotal: totalSubtotal,
      ivaAmount: totalIvaAmountDec.toNumber(),
      ingresosBrutosAmount: totalIngresosBrutosAmountDec.toNumber(),
      totalTaxes,
      totalAmount: totalAmountDec.toNumber(),
      breakdown: {
        basePrice: totalSubtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: totalSubtotal > 0 ? new Decimal(totalTaxes).dividedBy(totalSubtotal).toNumber() : 0,
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
    const finalAmountDec = new Decimal(finalAmount);
    const ivaRateDec = new Decimal(effectiveConfig.ivaRate);
    const ingresosBrutosRateDec = new Decimal(effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0);
    const totalTaxRateDec = ivaRateDec.plus(ingresosBrutosRateDec);
    
    const subtotalDec = finalAmountDec.dividedBy(new Decimal(1).plus(totalTaxRateDec));
    const ivaAmountDec = subtotalDec.times(ivaRateDec);
    const ingresosBrutosAmountDec = subtotalDec.times(ingresosBrutosRateDec);

    const subtotal = effectiveConfig.roundTaxes ? subtotalDec.toDecimalPlaces(2).toNumber() : subtotalDec.toNumber();
    const ivaAmount = effectiveConfig.roundTaxes ? ivaAmountDec.toDecimalPlaces(2).toNumber() : ivaAmountDec.toNumber();
    const ingresosBrutosAmount = effectiveConfig.roundTaxes ? ingresosBrutosAmountDec.toDecimalPlaces(2).toNumber() : ingresosBrutosAmountDec.toNumber();
    
    const totalTaxes = new Decimal(ivaAmount).plus(ingresosBrutosAmount).toNumber();

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
    let totalSalesDec = new Decimal(0);
    let totalSubtotalDec = new Decimal(0);
    let totalIVADec = new Decimal(0);
    let totalIngresosBrutosDec = new Decimal(0);

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