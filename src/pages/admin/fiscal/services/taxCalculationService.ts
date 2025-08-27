// Tax Calculation Service - Centralized Tax Logic for Argentina
// Extracted from Sales module for better separation of concerns

import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

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
    
    let subtotal: number;
    let ivaAmount: number;
    let ingresosBrutosAmount: number;

    if (effectiveConfig.taxIncludedInPrice) {
      // Argentine system: prices include taxes
      const totalRate = effectiveConfig.ivaRate + 
                       (effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0);
      
      subtotal = amount / (1 + totalRate);
      ivaAmount = subtotal * effectiveConfig.ivaRate;
      ingresosBrutosAmount = effectiveConfig.includeIngresosBrutos ? 
                            subtotal * (effectiveConfig.ingresosBrutosRate || 0) : 0;
    } else {
      // US system: prices exclude taxes
      subtotal = amount;
      ivaAmount = amount * effectiveConfig.ivaRate;
      ingresosBrutosAmount = effectiveConfig.includeIngresosBrutos ? 
                            amount * (effectiveConfig.ingresosBrutosRate || 0) : 0;
    }

    // Round if configured
    if (effectiveConfig.roundTaxes) {
      subtotal = Math.round(subtotal * 100) / 100;
      ivaAmount = Math.round(ivaAmount * 100) / 100;
      ingresosBrutosAmount = Math.round(ingresosBrutosAmount * 100) / 100;
    }

    const totalTaxes = ivaAmount + ingresosBrutosAmount;
    const totalAmount = subtotal + totalTaxes;

    return {
      subtotal,
      ivaAmount,
      ingresosBrutosAmount,
      totalTaxes,
      totalAmount,
      breakdown: {
        basePrice: subtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: totalTaxes / subtotal
      }
    };
  }

  /**
   * Calculate taxes for multiple items (shopping cart)
   */
  calculateTaxesForItems(items: SaleItem[], config?: Partial<TaxConfiguration>): TaxCalculationResult {
    const effectiveConfig = { ...this.config, ...config };
    
    let totalSubtotal = 0;
    let totalIvaAmount = 0;
    let totalIngresosBrutosAmount = 0;

    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice;
      
      // Get IVA rate based on item category
      let itemIvaRate = effectiveConfig.ivaRate;
      if (item.ivaCategory === 'REDUCIDO') {
        itemIvaRate = TAX_RATES.IVA.REDUCIDO;
      } else if (item.ivaCategory === 'EXENTO') {
        itemIvaRate = TAX_RATES.IVA.EXENTO;
      }

      // Calculate taxes for this item
      const itemTaxConfig = { ...effectiveConfig, ivaRate: itemIvaRate };
      const itemResult = this.calculateTaxesForAmount(itemTotal, itemTaxConfig);

      totalSubtotal += itemResult.subtotal;
      totalIvaAmount += itemResult.ivaAmount;
      totalIngresosBrutosAmount += itemResult.ingresosBrutosAmount;
    }

    // Round totals if configured
    if (effectiveConfig.roundTaxes) {
      totalSubtotal = Math.round(totalSubtotal * 100) / 100;
      totalIvaAmount = Math.round(totalIvaAmount * 100) / 100;
      totalIngresosBrutosAmount = Math.round(totalIngresosBrutosAmount * 100) / 100;
    }

    const totalTaxes = totalIvaAmount + totalIngresosBrutosAmount;
    const totalAmount = totalSubtotal + totalTaxes;

    return {
      subtotal: totalSubtotal,
      ivaAmount: totalIvaAmount,
      ingresosBrutosAmount: totalIngresosBrutosAmount,
      totalTaxes,
      totalAmount,
      breakdown: {
        basePrice: totalSubtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: totalTaxes / totalSubtotal
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
    const totalTaxRate = effectiveConfig.ivaRate + 
                        (effectiveConfig.includeIngresosBrutos ? effectiveConfig.ingresosBrutosRate || 0 : 0);
    
    const subtotal = finalAmount / (1 + totalTaxRate);
    const ivaAmount = subtotal * effectiveConfig.ivaRate;
    const ingresosBrutosAmount = effectiveConfig.includeIngresosBrutos ? 
                                subtotal * (effectiveConfig.ingresosBrutosRate || 0) : 0;

    return {
      subtotal: effectiveConfig.roundTaxes ? Math.round(subtotal * 100) / 100 : subtotal,
      ivaAmount: effectiveConfig.roundTaxes ? Math.round(ivaAmount * 100) / 100 : ivaAmount,
      ingresosBrutosAmount: effectiveConfig.roundTaxes ? Math.round(ingresosBrutosAmount * 100) / 100 : ingresosBrutosAmount,
      totalTaxes: ivaAmount + ingresosBrutosAmount,
      totalAmount: finalAmount,
      breakdown: {
        basePrice: subtotal,
        ivaRate: effectiveConfig.ivaRate,
        ingresosBrutosRate: effectiveConfig.ingresosBrutosRate || 0,
        effectiveTaxRate: totalTaxRate
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
    let totalSales = 0;
    let totalSubtotal = 0;
    let totalIVA = 0;
    let totalIngresosBrutos = 0;

    for (const sale of salesData) {
      const calculation = this.calculateTaxesForItems(sale.items);
      totalSales += calculation.totalAmount;
      totalSubtotal += calculation.subtotal;
      totalIVA += calculation.ivaAmount;
      totalIngresosBrutos += calculation.ingresosBrutosAmount;
    }

    const totalTaxes = totalIVA + totalIngresosBrutos;
    const averageTaxRate = totalSubtotal > 0 ? totalTaxes / totalSubtotal : 0;

    return {
      totalSales,
      totalSubtotal,
      totalIVA,
      totalIngresosBrutos,
      totalTaxes,
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